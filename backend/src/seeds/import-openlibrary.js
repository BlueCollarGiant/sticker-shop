#!/usr/bin/env node
/**
 * Night Reader — Open Library Catalog Importer
 *
 * Pipeline:
 *   data/raw/openlibrary/ol_dump_works_latest.jsonl.gz
 *     → stream + decompress + parse line by line
 *     → filter for usable book records
 *     → transform into Night Reader product schema
 *     → write to data/generated/products.seed.json
 *
 * This is a one-time local import script.
 * It does NOT call the Open Library API at runtime.
 * Run it once, inspect the output, then use the output to replace products.json.
 *
 * Usage:
 *   node src/seeds/import-openlibrary.js
 *
 * To change target count, set TARGET_COUNT below.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');
const { pipeline } = require('stream');
const { promisify } = require('util');

const pipelineAsync = promisify(pipeline);

// ─── Configuration ───────────────────────────────────────────────────────────

// How many products to collect before stopping. Raise to 10000 for full import.
const TARGET_COUNT = 1000;

// Log a progress line every N lines processed from the dump.
const LOG_INTERVAL = 50000;

const DUMP_PATH = path.join(__dirname, '../data/raw/openlibrary/ol_dump_works_latest.jsonl.gz');
const OUTPUT_PATH = path.join(__dirname, '../data/generated/products.seed.json');

// ─── Category and Collection Mapping ─────────────────────────────────────────
//
// Open Library subjects are messy free-text. We match keywords to map into
// Night Reader's fixed category and collection values.
//
// category: fixed Night Reader enum value for all books
const BOOK_CATEGORY = 'books';

// collection: derived from genre keywords in subjects array
// First matching bucket wins.
const COLLECTION_RULES = [
  {
    collection: 'dark-academia',
    keywords: [
      'gothic', 'dark academia', 'literary fiction', 'literary',
      'academia', 'Victorian', 'historical fiction', 'classic',
      'Edgar Allan Poe', 'detective', 'mystery', 'noir', 'psychological',
      'thriller', 'suspense', 'crime', 'horror',
    ],
  },
  {
    collection: 'mythic-fantasy',
    keywords: [
      'fantasy', 'mythology', 'myth', 'legend', 'epic', 'sword',
      'dragon', 'magic', 'wizard', 'witch', 'fairy', 'folklore',
      'heroic', 'adventure', 'quest', 'medieval', 'sci-fi',
      'science fiction', 'speculative', 'dystopian', 'alien',
      'space', 'futuristic',
    ],
  },
  {
    collection: 'midnight-minimalist',
    keywords: [
      'romance', 'love', 'contemporary', 'modern', 'minimalist',
      'short stories', 'poetry', 'prose', 'philosophical', 'essay',
      'biography', 'memoir', 'self-help', 'psychology', 'philosophy',
    ],
  },
];

// Fallback collection when no keywords match
const DEFAULT_COLLECTION = 'dark-academia';

// ─── Filter Keywords ──────────────────────────────────────────────────────────
//
// We want fiction-heavy, genre-rich books for a bookstore catalog.
// A record passes the subject filter if its subjects contain at least one
// of these keywords.
const PREFERRED_SUBJECT_KEYWORDS = [
  'fiction', 'fantasy', 'science fiction', 'mystery', 'thriller',
  'horror', 'romance', 'adventure', 'gothic', 'detective', 'noir',
  'historical', 'dystopian', 'mythology', 'legend', 'magic',
  'literary', 'suspense', 'crime', 'psychological',
];

// ─── Pricing Tables ───────────────────────────────────────────────────────────
//
// Books get realistic bookstore pricing. We derive a tier from
// the number of subjects (more subjects → more "substantial" book → higher price).
const PRICE_TIERS = [
  { maxSubjects: 5,  min: 8.99,  max: 12.99 },
  { maxSubjects: 15, min: 12.99, max: 18.99 },
  { maxSubjects: 30, min: 16.99, max: 24.99 },
  { maxSubjects: Infinity, min: 22.99, max: 34.99 },
];

// ─── Deterministic pseudo-random helpers ─────────────────────────────────────
//
// These use the product index so results are stable across runs
// (same index → same price, same stock, etc.).

function stableFloat(seed, min, max) {
  // Simple LCG-style hash to get a float in [min, max]
  const x = Math.sin(seed + 1) * 10000;
  const t = x - Math.floor(x); // 0..1
  return min + t * (max - min);
}

function stableInt(seed, min, max) {
  return Math.floor(stableFloat(seed, min, max + 1));
}

function stableRating(seed) {
  const raw = stableFloat(seed, 3.8, 5.0);
  return Math.round(raw * 10) / 10;
}

// ─── Badge Assignment ─────────────────────────────────────────────────────────
//
// Badges are assigned sparsely based on the product's position in the output.
// percentages are approximate — they create a realistic catalog mix.
//   bestseller: ~5% of products
//   new:        ~10%
//   sale:       ~8%
//   limited:    ~3%
// A product gets at most one badge.

function assignBadges(index) {
  const roll = stableFloat(index * 7, 0, 100);
  if (roll < 3)  return ['limited'];
  if (roll < 8)  return ['bestseller'];
  if (roll < 18) return ['new'];
  if (roll < 26) return ['sale'];
  return [];
}

function badgeFlags(badges) {
  return {
    isNew: badges.includes('new'),
    isBestseller: badges.includes('bestseller'),
    isLimitedEdition: badges.includes('limited'),
  };
}

function salePriceForBadges(price, badges) {
  if (!badges.includes('sale')) return undefined;
  return Math.round(price * 0.8 * 100) / 100;
}

// ─── Slug Generator ───────────────────────────────────────────────────────────

function slugify(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 80);
}

// ─── Collection Mapper ────────────────────────────────────────────────────────

function mapCollection(subjects) {
  if (!Array.isArray(subjects) || subjects.length === 0) return DEFAULT_COLLECTION;

  const subjectText = subjects.join(' ').toLowerCase();

  for (const rule of COLLECTION_RULES) {
    if (rule.keywords.some(kw => subjectText.includes(kw.toLowerCase()))) {
      return rule.collection;
    }
  }

  return DEFAULT_COLLECTION;
}

// ─── Price Generator ──────────────────────────────────────────────────────────

function generatePrice(subjects, seed) {
  const count = Array.isArray(subjects) ? subjects.length : 0;
  const tier = PRICE_TIERS.find(t => count <= t.maxSubjects) || PRICE_TIERS[PRICE_TIERS.length - 1];
  const raw = stableFloat(seed, tier.min, tier.max);
  return Math.round(raw * 100) / 100;
}

// ─── Cover Image URL Builder ──────────────────────────────────────────────────

function buildCoverUrl(coverId) {
  // Standard Open Library Covers API URL. No API call — just a URL pattern.
  // Size M = ~300px height, sufficient for product cards.
  return `https://covers.openlibrary.org/b/coverid/${coverId}-M.jpg`;
}

// ─── Description Extractor ────────────────────────────────────────────────────
//
// Open Library descriptions can be a plain string or an object { value: "..." }.
// Truncate to 500 chars to keep the catalog lean.

function extractDescription(raw) {
  if (!raw) return '';
  const text = typeof raw === 'object' && raw.value ? raw.value : String(raw);
  return text.replace(/\s+/g, ' ').trim().slice(0, 500);
}

// ─── Author Extractor ─────────────────────────────────────────────────────────
//
// The works dump author field is [{ author: { key: "/authors/OL123A" }, type: {...} }].
// We extract the OL author key as a subtitle. Full author names require a separate
// Authors API call which we skip for a local import.

function extractAuthorSubtitle(authors) {
  if (!Array.isArray(authors) || authors.length === 0) return '';
  const first = authors[0];
  if (first?.author?.key) {
    // Strip the /authors/ prefix — use it as a subtitle hint
    return first.author.key.replace('/authors/', '');
  }
  return '';
}

// ─── Tag Cleaner ──────────────────────────────────────────────────────────────

function cleanTags(subjects) {
  if (!Array.isArray(subjects)) return [];
  return subjects
    .map(s => s.toLowerCase().trim())
    .filter(s => s.length > 2 && s.length < 50)
    .filter(s => !/^\d+$/.test(s)) // skip pure numbers
    .slice(0, 15); // cap at 15 tags
}

// ─── Timestamp Extractor ──────────────────────────────────────────────────────

function extractTimestamp(field) {
  if (!field) return null;
  const val = typeof field === 'object' ? field.value : field;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

// ─── Filter: is this record usable? ──────────────────────────────────────────

function isUsable(work) {
  // Must have a title
  if (!work.title || work.title.trim().length < 2) return false;

  // Must have at least one cover id
  if (!Array.isArray(work.covers) || work.covers.length === 0) return false;
  if (work.covers[0] < 1) return false;

  // Must have subjects (tags) for search quality
  if (!Array.isArray(work.subjects) || work.subjects.length < 3) return false;

  // Must match at least one preferred genre keyword in subjects
  const subjectText = work.subjects.join(' ').toLowerCase();
  const hasPreferredGenre = PREFERRED_SUBJECT_KEYWORDS.some(kw => subjectText.includes(kw));
  if (!hasPreferredGenre) return false;

  // Skip records with no meaningful description — they make search look weak
  const desc = extractDescription(work.description);
  if (desc.length < 20) return false;

  return true;
}

// ─── Transformer ─────────────────────────────────────────────────────────────

function transform(work, index) {
  const rawKey = work.key || '';
  const olId = rawKey.replace('/works/', '').trim();
  const id = `ol-${olId}`;

  const title = work.title.trim();
  const description = extractDescription(work.description);
  const subjects = work.subjects || [];
  const tags = cleanTags(subjects);
  const collection = mapCollection(subjects);
  const coverId = work.covers[0];
  const imageUrl = buildCoverUrl(coverId);
  const authorSubtitle = extractAuthorSubtitle(work.authors);

  const price = generatePrice(subjects, index);
  const badges = assignBadges(index);
  const { isNew, isBestseller, isLimitedEdition } = badgeFlags(badges);
  const salePrice = salePriceForBadges(price, badges);

  const rating = stableRating(index * 3);
  const reviewCount = stableInt(index * 5, 3, 180);
  const stock = stableInt(index * 11, 10, 250);

  const createdAt = extractTimestamp(work.created) || new Date(
    Date.now() - stableInt(index, 0, 365 * 2) * 86400000
  ).toISOString();
  const updatedAt = extractTimestamp(work.last_modified) || createdAt;

  const product = {
    id,
    title,
    subtitle: authorSubtitle,
    description,
    price,
    category: BOOK_CATEGORY,
    collection,
    images: [
      {
        id: `img-${olId}`,
        url: imageUrl,
        alt: title,
        isPrimary: true,
        order: 1,
      },
    ],
    tags,
    badges,
    rating,
    reviewCount,
    isNew,
    isBestseller,
    isLimitedEdition,
    stock,
    createdAt,
    updatedAt,
  };

  // Only add salePrice field when the sale badge is present
  if (salePrice !== undefined) {
    product.salePrice = salePrice;
  }

  return product;
}

// ─── Open Library dump line parser ───────────────────────────────────────────
//
// Each line in the dump is tab-separated with 5 columns:
//   type \t key \t revision \t last_modified \t JSON
// We only care about column 4 (the JSON blob).

function parseDumpLine(line) {
  const tabIndex = line.lastIndexOf('\t');
  if (tabIndex === -1) return null;
  const json = line.slice(tabIndex + 1);
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  if (!fs.existsSync(DUMP_PATH)) {
    console.error(`\nDump file not found: ${DUMP_PATH}`);
    console.error('Download the Open Library works dump and place it at that path.');
    console.error('See: https://openlibrary.org/developers/dumps\n');
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });

  console.log(`\nNight Reader — Open Library Importer`);
  console.log(`Target:  ${TARGET_COUNT} products`);
  console.log(`Source:  ${DUMP_PATH}`);
  console.log(`Output:  ${OUTPUT_PATH}`);
  console.log(`─────────────────────────────────────\n`);

  const products = [];
  let linesScanned = 0;
  let parseErrors = 0;
  let skipped = 0;
  let titlesSeen = new Set(); // deduplicate by normalized title

  const fileStream = fs.createReadStream(DUMP_PATH);
  const gunzip = zlib.createGunzip();
  const rl = readline.createInterface({ input: fileStream.pipe(gunzip), crlfDelay: Infinity });

  for await (const line of rl) {
    if (products.length >= TARGET_COUNT) break;

    linesScanned++;

    if (linesScanned % LOG_INTERVAL === 0) {
      console.log(
        `  Scanned ${linesScanned.toLocaleString()} lines | ` +
        `Accepted ${products.length} | ` +
        `Skipped ${skipped} | ` +
        `Errors ${parseErrors}`
      );
    }

    if (!line.trim()) continue;

    const work = parseDumpLine(line);
    if (!work) {
      parseErrors++;
      continue;
    }

    if (!isUsable(work)) {
      skipped++;
      continue;
    }

    // Deduplicate by normalized title
    const normalizedTitle = slugify(work.title);
    if (titlesSeen.has(normalizedTitle)) {
      skipped++;
      continue;
    }
    titlesSeen.add(normalizedTitle);

    products.push(transform(work, products.length));
  }

  // Write output
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(products, null, 2), 'utf-8');

  console.log(`\n─────────────────────────────────────`);
  console.log(`  Lines scanned:  ${linesScanned.toLocaleString()}`);
  console.log(`  Parse errors:   ${parseErrors}`);
  console.log(`  Skipped:        ${skipped.toLocaleString()}`);
  console.log(`  Accepted:       ${products.length}`);
  console.log(`  Output:         ${OUTPUT_PATH}`);
  console.log(`─────────────────────────────────────\n`);

  if (products.length < TARGET_COUNT) {
    console.warn(
      `Warning: only collected ${products.length} of ${TARGET_COUNT} target products. ` +
      `The dump may have fewer matching records than expected, or the filter rules are too strict.`
    );
  }
}

run().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
