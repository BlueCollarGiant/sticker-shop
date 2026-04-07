# Night Reader — Bookstore-Only Conversion Plan

**Document type:** Strategic analysis and conversion plan
**Date:** April 2026
**Status:** Pre-implementation — analysis only

---

## 1. Strategic Assessment

**The short answer: yes, commit to the bookstore pivot. It is the right move.**

Here is why.

Night Reader currently exists in an awkward middle state. The visual identity — dark academia aesthetic, moody typography, atmospheric color palette — is a near-perfect fit for a bookstore. The catalog is 1,000 real books with real titles, real authors, real descriptions, and real cover images. The Stripe checkout works. The server-side search and pagination work. The strongest, most defensible parts of this project are all pointed toward books.

The merch side, by contrast, is five hand-crafted placeholder products with placeholder images that cannot be meaningfully demoed. There is no inventory. There is no visual proof of a merch catalog working at scale. Keeping merch as part of the identity costs credibility — it signals that the project is unfinished or undecided — while adding nothing demonstrable.

A project that does one thing excellently is always a stronger portfolio piece than a project that claims to do two things but only demonstrates one. Stripping the merch framing and fully committing to bookstore-only will make Night Reader feel intentional, polished, and complete.

---

## 2. Portfolio Framing

**Current framing (weak):**
> "A full-stack bookstore and merch shop built with Angular and Express."

This raises immediate questions: Where is the merch? Why are the filters broken? What is the difference between a book and a sticker here?

**After conversion (strong):**
> "Night Reader is a full-stack online bookstore built with Angular 20 and Express.js. It features a 1,000-book catalog seeded from the Google Books API, server-side search and pagination, Stripe payment integration with test-mode verification, JWT authentication, and a dark academia visual identity. The catalog supports genre-based filtering, author search, and collection browsing across fiction, fantasy, horror, and literary categories."

This framing is specific, honest, and demonstrates real engineering decisions at every layer: data pipeline, search architecture, payment flow, auth, and UI. A recruiter or technical reviewer can immediately understand what was built, why it exists, and how to verify it works.

---

## 3. Current Mismatches

These are the exact structural inconsistencies that make the project feel inconsistent right now.

### UI / Filter Mismatches

**File:** `frontend/src/app/components/products/products.html` lines 24–62
**File:** `frontend/src/app/models/product.model.ts` lines 24–31

The category filter sidebar lists six merch categories:
- Stickers
- Apparel
- Mugs
- Posters
- Bookmarks
- Phone Cases

Every imported book has `category: "books"`. None of these filters will ever match. Every checkbox in the category filter returns zero results. The filter system is completely broken for the actual catalog.

### Enum Mismatch

**File:** `frontend/src/app/models/product.model.ts` lines 24–31

The `ProductCategory` enum contains only merch values. `"books"` is not declared. When Angular template logic compares `product.category === ProductCategory.STICKERS`, it will never match a book. The enum is dead weight that actively misleads.

### Collection Collapse

All 1,000 imported books are assigned `collection: "dark-academia"`. The collection filter has three options — Dark Academia, Midnight Minimalist, Mythic Fantasy — but selecting any collection other than Dark Academia returns nothing. This filter is cosmetically present but functionally useless.

The import script's collection mapping logic is correct in principle but in practice most book subjects get tokenized to "fiction" which falls through to the dark-academia default bucket. The distribution never spread across all three collections as intended.

### Author Not Surfaced

**File:** `frontend/src/app/components/products/products.html` lines 153–197
**File:** `backend/src/infra/file/file-product.repository.js` lines 41–50

Every imported book has the author name stored in `subtitle`. The product card renders `collection` and `title` but never renders `subtitle`. A user browsing the catalog cannot see who wrote any book without clicking through to the detail page.

Additionally, `subtitle` is not included in the backend search tokenization. A user searching "Bram Stoker" will find nothing. A user searching "Edgar Allan Poe" will find nothing. Author search is entirely broken.

### Tags Are Near-Empty

Most imported books have `tags: ["fiction"]`. One tag. The search system tokenizes tags as searchable text, but a tag of just "fiction" adds almost nothing over the category field. Genre filtering is not possible because the tag data is too sparse.

### Subtitle Semantic Conflict

In the hand-crafted seed products, `subtitle` means product variant description: "Vinyl Sticker", "Premium T-Shirt", "12oz Ceramic". In the imported books, `subtitle` means author name: "Bram Stoker", "Phyllis A. Whitney". These are two completely different semantic uses of the same field. The detail page renders `subtitle` directly below the title without any label, which will confuse a book reader who expects to see a book subtitle, not an author name in that position.

### Price Range Mismatch

**File:** `frontend/src/app/components/products/products.ts` line 33

The price range filter defaults to `{ min: 0, max: 100 }`. The original merch ranged from $4.99 stickers to $54.99 hoodies. The entire imported book catalog falls between $8.99 and $34.99. The filter works by accident, but the range and step sizing were designed for apparel pricing, not book pricing.

### Seed Overwrites Catalog on Startup

**File:** `backend/src/seeds/seed-all.js`
**File:** `backend/src/server.js` line 7

On every server start, `seedAll()` is called. Until the recent fix, this unconditionally overwrote `products.json` with the 5 merch seed products. The fix added a guard, but the merch seed still runs at startup and still creates merch-categorized products if the file is smaller than the seed. The seed data is structurally merch.

---

## 4. Conversion Goals

After a completed bookstore-only conversion, the following should be true:

1. **No merch category exists anywhere in the codebase.** The enum, the filter sidebar, the seed products, and any template references to stickers, apparel, mugs, posters, bookmarks, and phone cases are all removed or replaced.

2. **The category system reflects book genres.** Fiction, Non-Fiction, Poetry, Horror, Fantasy, Mystery, Science Fiction, Literary Fiction, Historical Fiction — these are the organizing categories.

3. **Author is visible on every product card.** A user browsing the catalog sees title and author without clicking.

4. **Author is searchable.** Searching "Stoker" returns Dracula. Searching "Poe" returns The Raven. The `subtitle` field is included in backend search tokenization.

5. **Collection distribution is real.** Books spread meaningfully across Dark Academia, Midnight Minimalist, and Mythic Fantasy based on genre. No single collection holds 90%+ of the catalog.

6. **Tags reflect genre accurately.** A horror book has tags like ["gothic", "horror", "supernatural", "victorian"]. A fantasy book has tags like ["epic fantasy", "magic", "mythology"]. Tags are rich enough to be useful for discovery.

7. **Filters work.** Selecting "Horror" returns horror books. Selecting "Mythic Fantasy" returns fantasy and mythology books. Every filter option returns meaningful results.

8. **The startup seed does not reference merch.** If the seed runs, it populates the system with books or leaves the imported catalog untouched.

9. **The project description and any visible UI copy says "bookstore", not "shop" or "merch".**

10. **A technical reviewer can demo the search and filtering and find it impressive** — not because it was faked, but because 1,000 well-tagged books make the system actually work as advertised.

---

## 5. Recommended Conversion Plan

### Phase 1 — Kill the Merch Identity
**Purpose:** Remove all references to merch categories so the project stops being structurally misleading.
**Touches:** `product.model.ts`, `products.html`, `products.ts`, `seed-products.js`, `seed-all.js`
**Why it matters:** Every broken filter is a liability during a demo. This phase eliminates the liability completely.
**What done looks like:**
- `ProductCategory` enum no longer contains STICKERS, APPAREL, MUGS, POSTERS, BOOKMARKS, PHONE_CASES
- `ProductCategory` contains book genre values instead
- Filter sidebar shows book genres instead of merch categories
- Startup seed produces books or is skipped entirely when the catalog exists
- No template, enum, or data file references merch product types

**Risks:** The 5 original seed products will be removed. If you ever want a hybrid merch/book demo in the future, you would need to rebuild those. Acceptable tradeoff.

---

### Phase 2 — Fix the Data Layer
**Purpose:** Make the 1,000 imported books correctly categorized, tagged, and distributed across collections.
**Touches:** `import-googlebooks.js`, then re-run the import, then copy to `products.json`
**Why it matters:** A bookstore where filtering and collection browsing actually work is dramatically more impressive than one where they are cosmetically present but broken. This phase makes the search demo credible.
**What done looks like:**
- Books are distributed across at least 3–4 genre categories (not all "books")
- Collection distribution is meaningful: roughly 40% dark-academia, 30% mythic-fantasy, 30% midnight-minimalist
- Tags contain 3–6 genre-specific terms per book (not just "fiction")
- Descriptions are cut at sentence boundaries, not mid-sentence
- Author is stored in a dedicated field or subtitle is clearly semantically "author"

**Risks:** Requires re-running the Google Books import. API quota is not an issue (1,000 requests/day free). The script takes about 5 minutes to run. Low risk.

---

### Phase 3 — Surface the Author
**Purpose:** Make author visible on cards and searchable in the backend.
**Touches:** `products.html` (card template), `products.css`, `file-product.repository.js`
**Why it matters:** This is the single highest-impact UI change. A bookstore where you cannot see who wrote the book is not a bookstore. Adding author to cards takes the UI from "generic product grid" to "actual bookstore" in one change.
**What done looks like:**
- Author name renders on every product card below the title
- Searching an author name returns that author's books
- The detail page labels the subtitle field as "Author" rather than rendering it as a generic subtitle

**Risks:** Minor. The `subtitle` field is already populated with author names for all 1,000 books. This is a rendering and search change only.

---

### Phase 4 — Align the Filter Sidebar
**Purpose:** Replace the broken merch filter sidebar with a book-specific filter system that works.
**Touches:** `products.html` (filter sidebar), `products.ts` (filter logic)
**Why it matters:** Filters are the primary discovery mechanism in any catalog. If a recruiter clicks "Horror" and gets results, that is proof the system works. If they click "Apparel" and get nothing, that is proof the system was abandoned.
**What done looks like:**
- Genre/category filter shows book genres with real results behind each one
- Collection filter works because Phase 2 fixed the distribution
- Author search is a first-class search option (or subtitle is included in the main search)
- Sort options remain (Newest, Popular, Price Low-High, Price High-Low, A-Z)

**Risks:** The filter sidebar is currently client-side filtering applied to the current page. For genre/category filtering to work well at scale, it should ideally be server-side. For a portfolio demo this is acceptable to keep client-side, but note it as a known limitation.

---

### Phase 5 — Polish the Product Card and Detail Page
**Purpose:** Make the product presentation feel like a bookstore, not a merchandise catalog.
**Touches:** `products.html`, `products.css`, `product-detail.html`, `product-detail.css`
**Why it matters:** First impressions matter in portfolio reviews. A card that shows cover image, title, author, genre tags, rating, and price tells a complete story at a glance.
**What done looks like:**
- Card shows: cover image, title, author, genre tag (1–2 tags), rating, price
- Detail page labels: "Author" instead of unlabeled subtitle, "Genre" for tags, publication year if available
- Related products section on detail page shows books in the same genre, not the same opaque "category"
- No variant selector visible on books (it was designed for size/color of apparel)

**Risks:** Low. These are presentational changes.

---

## 6. Priority Ranking

### Immediate High-Impact (Do First)

1. **Fix the category filter sidebar** — Remove merch categories, replace with book genres. Every demo currently has a broken filter. This is the most visible defect.

2. **Add author to product cards** — The single line that makes this feel like a real bookstore. `subtitle` is already populated for all 1,000 books.

3. **Add subtitle to backend search** — Three lines of code. Unlocks author search across the entire catalog.

4. **Fix collection distribution in the import script and re-import** — Makes the collection filter meaningful instead of decorative.

### Medium Priority (Do Second)

5. **Enrich tags in the import script** — Pull genre terms from the query string and categories so tags are useful for discovery.

6. **Replace `ProductCategory` enum with book genres** — Removes the structural lie at the heart of the data model.

7. **Fix the startup seed** — Either replace seed products with book-format seeds or skip product seeding entirely if the catalog already exists.

8. **Fix description truncation** — Cut at sentence boundaries so descriptions read cleanly.

### Optional Polish (Do If Time Allows)

9. Remove variant selector from book detail page (it renders nothing for books but its conditional may still display empty)
10. Add "Author" label to the subtitle field on the detail page
11. Adjust price range filter defaults to match book pricing ($8–$35)
12. Add a "by genre" or "browse collections" section to any home/landing page
13. Update any page titles, meta descriptions, or nav labels that still say "Shop" instead of something bookstore-specific

---

## 7. UX / Information Architecture Recommendations

### Categories vs Genres

Stop treating "category" as a product type (stickers, apparel) and start treating it as a primary genre classification. The recommended genre categories for this catalog:

- Fiction
- Fantasy
- Horror
- Mystery & Thriller
- Science Fiction
- Literary Fiction
- Historical Fiction
- Poetry & Essays
- Non-Fiction

These map well to the Google Books query subjects already used in the import script. They are also mutually exclusive enough to work as a filter without overlap confusion.

### Collections

Keep the three existing collections. They work well for books:

- **Dark Academia** — Gothic fiction, classic literature, mystery, psychological thriller, horror. The moody, intellectual end of the catalog.
- **Mythic Fantasy** — Fantasy, mythology, epic adventure, science fiction, dystopian. The imaginative, world-building end.
- **Midnight Minimalist** — Contemporary fiction, poetry, romance, literary essays, philosophy. The quieter, introspective end.

The problem is not the collection names — they are good. The problem is that the import script maps almost everything to Dark Academia by default. Fix the mapping weights in the import script so distribution is roughly even.

### Author Visibility

Author should be visible at every level of the browsing experience:

- **Product card:** Title on line 1, Author (italic, muted) on line 2
- **Search results:** Same
- **Detail page:** Author as a labeled field ("Author: Bram Stoker"), not as an unlabeled subtitle
- **Related products:** "More by this author" would be ideal but is optional

### Search Fields

The backend search should tokenize these fields:
- `title` (already included)
- `description` (already included)
- `subtitle` (author name — must be added)
- `category` (already included)
- `collection` (already included)
- `tags` (already included, but needs richer tag data)

### Filter Sidebar

Recommended filter sidebar structure for a bookstore:

```
GENRE
[ ] Fiction
[ ] Fantasy
[ ] Horror
[ ] Mystery & Thriller
[ ] Science Fiction
[ ] Literary Fiction
[ ] Historical Fiction
[ ] Poetry & Essays

COLLECTION
[ ] Dark Academia
[ ] Midnight Minimalist
[ ] Mythic Fantasy

PRICE RANGE
$8 ——————————— $35

SORT BY
[Newest ▾]
```

Remove: size filters, color filters, phone case / apparel references.

### Product Cards

Recommended card content (top to bottom):
1. Cover image (Google Books thumbnail, real art)
2. Collection label (small, italic, muted — already exists)
3. Title (2-line clamp — already exists)
4. Author (new — italic, smaller than title)
5. Genre tag (1 tag, pill style — optional but good)
6. Star rating + review count (already exists)
7. Price / Sale price (already exists)
8. Add to Cart button (already exists)

### Product Detail Page Emphasis

For books, the detail page should emphasize:
- **Large cover image** (hero position — already good)
- **Title + Author** (prominent, clearly labeled)
- **Genre + Collection** (discovery metadata)
- **Description** (the full text, not truncated — this is what sells a book)
- **Tags** (genre keywords, browsable)
- **Rating + reviews** (social proof)
- **Price + Add to Cart** (conversion)
- **Related books** (same genre/collection)

De-emphasize or remove:
- Variant selector (size/color — not applicable to books)
- SKU-style product variant data

---

## 8. Data / Catalog Recommendations

### Tags

The current state is almost all books having `tags: ["fiction"]`. This is not useful.

Target state: 3–6 genre-specific tags per book pulled from:
1. The Google Books API `categories` field (split on " / " to get sub-categories)
2. The genre query term used to fetch the book (e.g., a book fetched from "subject:gothic fiction" gets tags including "gothic", "fiction")
3. Any keyword in the description that matches a known genre term

Example target for Dracula:
```json
"tags": ["gothic", "horror", "vampire", "victorian", "classic", "supernatural"]
```

Example target for a fantasy novel:
```json
"tags": ["epic fantasy", "magic", "mythology", "adventure", "quest"]
```

### Genre Mapping (Category Field)

Replace the single `"books"` category with a genre-derived category. Map from the Google Books API `categories` array to the recommended genre list above. Use the same logic as collection mapping — keyword match, first match wins, default to "Fiction".

### Collection Mapping

The current mapping logic in the import script is correct in principle but the defaults are too aggressive toward dark-academia. Suggested weight adjustment:

- If subject keywords match gothic, horror, mystery, psychological, thriller, detective, classic, literary → dark-academia
- If subject keywords match fantasy, mythology, epic, sci-fi, dystopian, adventure, magic, space → mythic-fantasy
- If subject keywords match romance, contemporary, poetry, philosophy, literary fiction, essay, coming-of-age → midnight-minimalist
- Default: distribute round-robin between collections rather than always defaulting to dark-academia

### Subtitle / Author Usage

Subtitle should be treated as the author field from this point forward. No semantic confusion. The detail page should render it as "Author: [name]" rather than as an unlabeled secondary headline.

If a book from the Google Books API has an actual subtitle (e.g., "Dracula: The Original Classic Edition"), consider storing that separately or appending to the title. For now, author name in subtitle is correct and useful.

### Description Cleanup

Current: Hard-cut at 500 characters, often mid-sentence.

Target: Cut at the last period, question mark, or exclamation mark before the 500-character limit. This produces clean, complete-sentence descriptions that read naturally and don't feel truncated.

### Ratings

Keep ratings. They are generated but credible (range 3.8–5.0, review counts 3–180). They serve a real purpose: social proof on cards and sort-by-popular functionality. Do not surface them as "verified reviews" — just star display and count.

### Merch-Specific Fields to Retire

- `variants` (size/color/SKU) — Not applicable to books. The field can remain in the schema as optional since it costs nothing, but the seed, import script, and UI should treat it as absent for books.
- `subtitle` as product-type label ("Vinyl Sticker", "Premium Hoodie") — This usage is gone once the merch seed is replaced.

---

## 9. Risks of Not Converting

If Night Reader stays in its current half-merch / half-book state, here is what happens:

**In a portfolio review:**
A reviewer opens the shop. They see the dark academia aesthetic and 1,000 books. They try to filter by "Apparel" because they see that option in the sidebar. They get zero results. They wonder if the app is broken. They try "Stickers". Zero results. They may reasonably conclude the search and filter system does not work, which is the opposite of what this project is trying to demonstrate.

**In a technical interview:**
You describe the server-side search and pagination as a feature. The interviewer asks you to show the filtering working. You filter by horror or mystery and get zero results because those categories do not exist in the enum. You have to explain why. The explanation makes the project sound unfinished.

**In self-assessment:**
You have a working Stripe checkout, a real data pipeline, server-side search, and pagination — but the project feels incomplete every time you look at it because of the mismatch. That friction is real and it makes it harder to present confidently.

**The compounding problem:**
Every day the project stays in this state is a day the broken filters are the first thing a viewer notices. The filters are front-and-center in the UI. They cannot be hidden. The only fix is to make them work, which requires committing to one product identity.

---

## 10. Final Recommendation

**Commit fully to bookstore-only. Do not hedge.**

The merch concept is not salvageable as a portfolio demo right now — there is no merch catalog, no merch images, no meaningful merch pricing, and no working merch filters. Keeping the word "merch" in the description or the merch categories in the sidebar only highlights the gap.

The bookstore concept, on the other hand, is already working. The data is real. The images load. The search returns real results. The checkout processes real payments in test mode. You have everything you need to demo a bookstore that works.

**First three steps if you commit:**

1. **Replace the `ProductCategory` enum** with book genre values and update the filter sidebar to match. This kills the broken filters immediately and makes the UI coherent. (`product.model.ts`, `products.html`, `products.ts`)

2. **Add author to product cards and to search.** Show author name below the title on every card. Add `subtitle` to the backend search tokenizer. These are the two changes that make this unmistakably a bookstore and not a generic product grid. (`products.html`, `products.css`, `file-product.repository.js`)

3. **Re-run the import script with improved tag enrichment and collection distribution**, then copy the output to `products.json`. This makes filtering and collection browsing meaningful — and means a reviewer clicking "Horror" or "Mythic Fantasy" actually gets real results.

After these three steps, Night Reader will be a coherent, demonstrable, portfolio-strong bookstore. Everything else in this plan is improvement. These three steps are the minimum to stop the project from working against itself.

---

## 11. Phase 1 Execution Detail

### Files to Change and Why

| File | Change | Why |
|---|---|---|
| `frontend/src/app/models/product.model.ts` lines 24–31 | Replace 6 merch `ProductCategory` enum values with 8 book genre values | Every downstream filter depends on this enum. Must change first. |
| `frontend/src/app/components/products/products.html` lines 24–62 | Replace 6 merch category checkboxes with 8 book genre checkboxes | Removes the broken filter UI. Depends on enum change above. |
| `frontend/src/app/components/products/products.html` lines 175–177 | Add author line between title and rating on product card | Makes every card show who wrote the book. One line of template. |
| `frontend/src/app/components/products/products.css` | Add `.product-author` style | Styles the new author line — italic, muted, ellipsis on overflow. |
| `backend/src/infra/file/file-product.repository.js` lines 41–50 | Add `product.subtitle` to searchable fields array | Unlocks author search. The `.filter(Boolean)` already handles undefined. |
| `backend/src/seeds/seed-products.js` | Replace 5 merch products with 5 book-format fallback products | Removes last source of merch data in the codebase. |

**Files that do NOT need changes in Phase 1:**
- `products.ts` — Enums are re-exported as class properties (lines 38–41). When enum values change the template picks them up automatically.
- `product-detail.html` — Author will render unlabeled as subtitle. Acceptable for Phase 1; labeled "Author:" fix is Phase 5 polish.
- `backend/src/validators/product.validator.js` — Uses `z.string()` for category, no enum constraint. No change needed.

### Implementation Order

**Task 1 — `product.model.ts`**
Replace `ProductCategory` enum:
```
FICTION = 'fiction'
FANTASY = 'fantasy'
HORROR = 'horror'
MYSTERY = 'mystery'
SCIENCE_FICTION = 'science-fiction'
LITERARY_FICTION = 'literary-fiction'
HISTORICAL_FICTION = 'historical-fiction'
POETRY = 'poetry'
```
Before writing, grep for `STICKERS`, `APPAREL`, `MUGS`, `POSTERS`, `BOOKMARKS`, `PHONE_CASES` to confirm no other file imports these values directly.

**Task 2 — `products.html` filter sidebar (lines 24–62)**
Replace 6 merch checkboxes with 8 genre checkboxes. Each follows the existing pattern:
```html
<label class="filter-option">
  <input type="checkbox"
    [checked]="isCategorySelected(ProductCategory.FICTION)"
    (change)="toggleCategoryFilter(ProductCategory.FICTION)">
  <span>Fiction</span>
</label>
```
Keep the collection filter section (lines 74–92) unchanged.

**Task 3 — `products.html` product card (after line 175)**
Add between title and rating:
```html
<p *ngIf="product.subtitle" class="product-author">{{ product.subtitle }}</p>
```

**Task 4 — `products.css`**
Add after `.product-title` block. Use confirmed project variables: `--font-accent`, `--steel-grey`, `--spacing-xs` (all verified present in this file).
```css
.product-author {
  font-family: var(--font-accent);
  font-size: 12px;
  color: var(--steel-grey);
  font-style: italic;
  margin: 0 0 var(--spacing-xs) 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

**Task 5 — `file-product.repository.js` (line ~42)**
Add `product.subtitle` as second item in searchable array, after `product.title`.

**Task 6 — `seed-products.js`**
Replace all 5 merch products with 5 book-format fallback products using public domain classics. Each must use a valid genre category value from the new enum, one of the 3 collections, author in subtitle, no variant data.

### Known Limitation to Document

After Phase 1, genre filters will be structurally correct but will return 0 results — all 1,000 books still have `category: "books"` in the data. This is fixed in Phase 2 (re-import with genre categorization). Structurally correct filters with no data is better than broken merch filters that never worked.

### Phase 1 Done Criteria

- No "Stickers", "Apparel", "Mugs", "Posters", "Bookmarks", or "Phone Cases" anywhere in the filter sidebar
- Category filter sidebar shows: Fiction, Fantasy, Horror, Mystery, Science Fiction, Literary Fiction, Historical Fiction, Poetry
- Every product card shows author name below the title (italic, muted)
- Searching "Bram Stoker" returns Dracula
- Searching "Stoker" returns results
- Searching "Poe" returns Poe books
- `ProductCategory` enum contains only book genre values
- `seed-products.js` contains only book-format products
- Backend restarts cleanly, Products count stays at 1,000
- No Angular template errors in browser console
