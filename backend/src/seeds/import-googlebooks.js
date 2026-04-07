#!/usr/bin/env node
/**
 * Night Reader — Google Books Catalog Importer
 *
 * Fetches real book data from the Google Books API (no API key required).
 * Fires paginated requests across multiple genre queries to collect
 * TARGET_COUNT unique books, then writes them to the Night Reader product schema.
 *
 * Usage:
 *   node src/seeds/import-googlebooks.js
 *
 * Output:
 *   backend/src/data/generated/products.seed.json
 *
 * After running, copy the output to src/data/products.json to go live.
 */

'use strict';

const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
if (!API_KEY) {
  console.error('Missing GOOGLE_BOOKS_API_KEY in .env');
  process.exit(1);
}

// ─── Configuration ────────────────────────────────────────────────────────────

const TARGET_COUNT = 1000; // raise to 10000 for full demo catalog
const RESULTS_PER_REQUEST = 40; // Google Books max per request
const DELAY_MS = 200; // polite delay between requests (ms)

const OUTPUT_PATH = path.join(__dirname, '../data/generated/products.seed.json');

// ─── Genre Queries ────────────────────────────────────────────────────────────
//
// We spread requests across many genre queries to get variety.
// Each entry is a search term passed to the Google Books volumes API.
// Google Books returns up to 40 results per request, offset up to 1000.
// We rotate through these until TARGET_COUNT is reached.

const GENRE_QUERIES = [
  'subject:gothic fiction',
  'subject:dark academia',
  'subject:mystery thriller',
  'subject:horror fiction',
  'subject:literary fiction',
  'subject:historical fiction',
  'subject:detective noir',
  'subject:psychological thriller',
  'subject:classic literature',
  'subject:fantasy fiction',
  'subject:mythology legend',
  'subject:epic fantasy',
  'subject:science fiction',
  'subject:dystopian fiction',
  'subject:adventure fiction',
  'subject:romance fiction',
  'subject:contemporary fiction',
  'subject:short stories',
  'subject:poetry collection',
  'subject:philosophy',
  'subject:crime fiction',
  'subject:supernatural fiction',
  'subject:war fiction',
  'subject:coming of age',
  'subject:magical realism',
  'subject:steampunk',
  'subject:cyberpunk',
  'subject:paranormal romance',
  'subject:urban fantasy',
  'subject:historical mystery',
  'subject:espionage thriller',
  'subject:southern gothic',
  'subject:bildungsroman',
  'subject:satire fiction',
  'subject:folklore fairy tales',
  'subject:arthurian legend',
  'subject:vampire fiction',
  'subject:occult fiction',
  'subject:noir fiction',
  'subject:western fiction',
];

// ─── Collection Mapping ───────────────────────────────────────────────────────

const COLLECTION_RULES = [
  {
    collection: 'dark-academia',
    keywords: [
      'gothic', 'dark academia', 'literary', 'academia', 'victorian',
      'historical', 'classic', 'detective', 'mystery', 'noir',
      'psychological', 'thriller', 'suspense', 'crime', 'horror',
    ],
  },
  {
    collection: 'mythic-fantasy',
    keywords: [
      'fantasy', 'mythology', 'myth', 'legend', 'epic', 'dragon',
      'magic', 'wizard', 'witch', 'fairy', 'folklore', 'adventure',
      'quest', 'medieval', 'science fiction', 'sci-fi', 'speculative',
      'dystopian', 'space', 'futuristic',
    ],
  },
  {
    collection: 'midnight-minimalist',
    keywords: [
      'romance', 'love', 'contemporary', 'modern', 'minimalist',
      'short stories', 'poetry', 'prose', 'philosophical', 'essay',
      'biography', 'memoir', 'philosophy',
    ],
  },
];

const DEFAULT_COLLECTION = 'dark-academia';

// ─── Price Tiers ──────────────────────────────────────────────────────────────

const PRICE_TIERS = [
  { maxCategories: 2,        min: 8.99,  max: 12.99 },
  { maxCategories: 4,        min: 12.99, max: 18.99 },
  { maxCategories: 7,        min: 16.99, max: 24.99 },
  { maxCategories: Infinity, min: 22.99, max: 34.99 },
];

// ─── Stable Pseudo-random Helpers ─────────────────────────────────────────────

function stableFloat(seed, min, max) {
  const x = Math.sin(seed + 1) * 10000;
  const t = x - Math.floor(x);
  return min + t * (max - min);
}

function stableInt(seed, min, max) {
  return Math.floor(stableFloat(seed, min, max + 1));
}

function stableRating(seed) {
  return Math.round(stableFloat(seed, 3.8, 5.0) * 10) / 10;
}

// ─── Badge Assignment ─────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 80);
}

function mapCollection(categories) {
  if (!Array.isArray(categories) || categories.length === 0) return DEFAULT_COLLECTION;
  const text = categories.join(' ').toLowerCase();
  for (const rule of COLLECTION_RULES) {
    if (rule.keywords.some(kw => text.includes(kw))) return rule.collection;
  }
  return DEFAULT_COLLECTION;
}

function generatePrice(categoryCount, seed) {
  const tier = PRICE_TIERS.find(t => categoryCount <= t.maxCategories) || PRICE_TIERS[PRICE_TIERS.length - 1];
  const raw = stableFloat(seed, tier.min, tier.max);
  return Math.round(raw * 100) / 100;
}

function cleanTags(categories) {
  if (!Array.isArray(categories)) return [];
  return categories
    .flatMap(c => c.split(' / '))
    .map(s => s.toLowerCase().trim())
    .filter(s => s.length > 2 && s.length < 50)
    .filter(s => !/^\d+$/.test(s))
    .slice(0, 15);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Google Books Fetch ────────────────────────────────────────────────────────

async function fetchBooks(query, startIndex) {
  const url = new URL('https://www.googleapis.com/books/v1/volumes');
  url.searchParams.set('q', query);
  url.searchParams.set('startIndex', String(startIndex));
  url.searchParams.set('maxResults', String(RESULTS_PER_REQUEST));
  url.searchParams.set('printType', 'books');
  url.searchParams.set('langRestrict', 'en');
  url.searchParams.set('key', API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Google Books API error: ${res.status} ${res.statusText}`);
  return res.json();
}

// ─── Filter ───────────────────────────────────────────────────────────────────

function isUsable(item) {
  const info = item.volumeInfo;
  if (!info) return false;
  if (!info.title || info.title.trim().length < 2) return false;
  if (!info.description || info.description.trim().length < 50) return false;
  if (!info.imageLinks || !info.imageLinks.thumbnail) return false;
  if (!Array.isArray(info.categories) || info.categories.length === 0) return false;
  return true;
}

// ─── Transform ────────────────────────────────────────────────────────────────

function transform(item, index) {
  const info = item.volumeInfo;
  const googleId = item.id;

  const title = info.title.trim();
  const subtitle = info.subtitle || (Array.isArray(info.authors) ? info.authors[0] : '') || '';
  const description = info.description.replace(/\s+/g, ' ').trim().slice(0, 500);
  const categories = info.categories || [];
  const tags = cleanTags(categories);
  const collection = mapCollection(categories);

  // Use the highest-res thumbnail available
  const imageUrl = (info.imageLinks.extraLarge ||
    info.imageLinks.large ||
    info.imageLinks.medium ||
    info.imageLinks.small ||
    info.imageLinks.thumbnail)
    .replace('http://', 'https://'); // force HTTPS

  const price = generatePrice(categories.length, index);
  const badges = assignBadges(index);
  const { isNew, isBestseller, isLimitedEdition } = badgeFlags(badges);

  const rating = stableRating(index * 3);
  const reviewCount = stableInt(index * 5, 3, 180);
  const stock = stableInt(index * 11, 10, 250);

  const createdAt = info.publishedDate
    ? new Date(info.publishedDate).toISOString()
    : new Date(Date.now() - stableInt(index, 0, 365 * 2) * 86400000).toISOString();

  const product = {
    id: `gb-${googleId}`,
    title,
    subtitle,
    description,
    price,
    category: 'books',
    collection,
    images: [
      {
        id: `img-${googleId}`,
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
    updatedAt: createdAt,
  };

  if (badges.includes('sale')) {
    product.salePrice = Math.round(price * 0.8 * 100) / 100;
  }

  return product;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });

  console.log(`\nNight Reader — Google Books Importer`);
  console.log(`Target:  ${TARGET_COUNT} products`);
  console.log(`Output:  ${OUTPUT_PATH}`);
  console.log(`─────────────────────────────────────\n`);

  const products = [];
  const titlesSeen = new Set();
  let totalRequests = 0;
  let totalSkipped = 0;

  outer: for (const query of GENRE_QUERIES) {
    if (products.length >= TARGET_COUNT) break;

    let startIndex = 0;
    const maxOffset = 200; // Google Books won't return results past offset ~1000, stay safe

    while (startIndex < maxOffset) {
      if (products.length >= TARGET_COUNT) break outer;

      try {
        const data = await fetchBooks(query, startIndex);
        totalRequests++;

        const items = data.items || [];
        if (items.length === 0) break; // no more results for this query

        for (const item of items) {
          if (products.length >= TARGET_COUNT) break outer;

          if (!isUsable(item)) {
            totalSkipped++;
            continue;
          }

          const normalized = slugify(item.volumeInfo.title);
          if (titlesSeen.has(normalized)) {
            totalSkipped++;
            continue;
          }

          titlesSeen.add(normalized);
          products.push(transform(item, products.length));
        }

        console.log(
          `  [${query.slice(0, 35).padEnd(35)}] offset ${String(startIndex).padStart(3)} ` +
          `| +${items.length} fetched | ${products.length} collected`
        );

        startIndex += RESULTS_PER_REQUEST;
        await delay(DELAY_MS);

      } catch (err) {
        console.warn(`  Warning: request failed for "${query}" at offset ${startIndex}: ${err.message}`);
        await delay(1000); // back off on error
        break; // move to next query
      }
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(products, null, 2), 'utf-8');

  console.log(`\n─────────────────────────────────────`);
  console.log(`  Requests made:  ${totalRequests}`);
  console.log(`  Skipped:        ${totalSkipped}`);
  console.log(`  Accepted:       ${products.length}`);
  console.log(`  Output:         ${OUTPUT_PATH}`);
  console.log(`─────────────────────────────────────\n`);

  if (products.length < TARGET_COUNT) {
    console.warn(
      `Warning: only collected ${products.length} of ${TARGET_COUNT}. ` +
      `Add more genre queries to GENRE_QUERIES array to reach the target.`
    );
  } else {
    console.log(`Done! Copy output to src/data/products.json to go live:\n`);
    console.log(`  cp src/data/generated/products.seed.json src/data/products.json\n`);
  }
}

run().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
