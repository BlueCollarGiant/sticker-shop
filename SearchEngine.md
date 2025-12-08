# Search Engine Documentation - Junior Developer Guide

## 📚 Table of Contents
1. [What Problem Does This Solve?](#what-problem-does-this-solve)
2. [High-Level Overview](#high-level-overview)
3. [File-by-File Breakdown](#file-by-file-breakdown)
4. [How Everything Works Together](#how-everything-works-together)
5. [Using the Search Engine](#using-the-search-engine)
6. [Key Concepts Explained](#key-concepts-explained)

---

## What Problem Does This Solve?

### The Old Way (Bad) ❌
```typescript
// Simple but dumb filtering
filteredUsers = computed(() => {
  const query = this.searchQuery().toLowerCase();
  return this.users().filter(u =>
    u.name?.toLowerCase().includes(query) ||
    u.email?.toLowerCase().includes(query)
  );
});
```

**Problems:**
- No ranking (random order)
- No debouncing (lags when typing fast)
- No suggestions dropdown
- Copy-paste code everywhere
- Can't search multiple words intelligently

### The New Way (Good) ✅
```typescript
// Smart, reusable, ranked search engine
userSearch = createSearchEngine(this.users, {
  fields: ['name', 'email', 'role'],
  getLabel: (user) => user.name,
  getKey: (user) => user.id
});

filteredUsers = computed(() => this.userSearch.filtered());
```

**Benefits:**
- ✅ Intelligent ranking (best matches first)
- ✅ Debounced input (smooth, no lag)
- ✅ Suggestions dropdown with highlighting
- ✅ Reusable (works for users, products, orders)
- ✅ Multi-word search with AND logic

---

## High-Level Overview

### The 5 Files

```
📁 shared/search/
├── search-types.ts         → What shapes/types exist?
├── search-tokenize.util.ts → How to break up text?
├── search-rank.util.ts     → How to score matches?
├── search-filters.util.ts  → How to filter & highlight?
└── search-engine.ts        → How to tie it all together?
```

### Data Flow

```
User types "john t"
     ↓
[search-engine.ts]
     ↓
Tokenize → ["john", "t"]  [search-tokenize.util.ts]
     ↓
Score each user            [search-rank.util.ts]
     ↓
Filter & rank              [search-filters.util.ts]
     ↓
Display results (sorted by score)
```

---

## File-by-File Breakdown

### 1️⃣ `search-types.ts` - Defining Our Shapes

**What it does:** Defines TypeScript types/interfaces (the "shapes" of our data).

#### MatchType Enum
```typescript
export enum MatchType {
  STARTS_WITH = 'starts_with',   // Best: "john" matches "John Smith"
  WORD_START = 'word_start',     // Good: "smith" matches "John Smith"
  SUBSTRING = 'substring',       // Weak: "oh" matches "John"
  NO_MATCH = 'no_match'          // No match
}
```

**Think of it like:** A grading system for how well something matched.

**Example:**
```typescript
// Searching for "john"
"John Smith"   → STARTS_WITH  (A+ match)
"Sarah John"   → WORD_START   (B+ match)
"Johnson"      → SUBSTRING    (C+ match)
"Mary Kate"    → NO_MATCH     (F)
```

#### ScoredItem Interface
```typescript
export interface ScoredItem<T> {
  item: T;              // The actual object (user/product/order)
  score: number;        // How well it matched (higher = better)
  matchType: MatchType; // Best match type found
  matchedFields: string[]; // Which fields matched
}
```

**Why?** So we can say "John Smith scored 1000 points, Sarah scored 100 points, show John first."

#### SearchConfig Interface
```typescript
export interface SearchConfig<T> {
  fields: string[];           // What fields to search: ['name', 'email']
  getLabel: (item: T) => string;  // How to display it
  getKey: (item: T) => string;    // Unique ID
  debounceMs?: number;        // Wait time before searching (optional)
  maxSuggestions?: number;    // How many suggestions to show (optional)
  enableSuggestions?: boolean; // Show dropdown? (optional)
}
```

**Why?** Makes the engine reusable. Same engine, different config for users vs products.

**Example:**
```typescript
// For users
{
  fields: ['name', 'email', 'role'],
  getLabel: (user) => user.name,     // Show "John Smith"
  getKey: (user) => user.id          // Track by "user123"
}

// For products
{
  fields: ['title', 'category'],
  getLabel: (product) => product.title,
  getKey: (product) => product.id
}
```

#### SearchEngine Interface
```typescript
export interface SearchEngine<T> {
  // Read-only signals (state)
  query: () => string;              // Current search text
  filtered: () => T[];              // Filtered results
  suggestions: () => T[];           // Suggestion dropdown items

  // Methods (actions)
  setQuery: (value: string) => void;        // Update search
  selectSuggestion: (item: T) => void;      // Click a suggestion
  highlight: (text: string) => string;      // Add highlighting
}
```

**Think of it like:** The instruction manual for the search engine. This tells you what you can do with it.

---

### 2️⃣ `search-tokenize.util.ts` - Breaking Text Apart

**What it does:** Takes text and breaks it into searchable pieces.

#### Function 1: `tokenize(query: string): string[]`

**Purpose:** Break "John T" into `["john", "t"]`

```typescript
export function tokenize(query: string): string[] {
  if (!query || typeof query !== 'string') {
    return [];  // Safety check
  }

  return query
    .toLowerCase()      // "John T" → "john t"
    .trim()             // "  john t  " → "john t"
    .split(/\s+/)       // "john t" → ["john", "t"]
    .filter(token => token.length > 0); // Remove empty strings
}
```

**Line by line:**

1. **Check if valid:** If someone passes `null` or `undefined`, return empty array
2. **toLowerCase():** Make everything lowercase so "John" matches "john"
3. **trim():** Remove spaces at start/end
4. **split(/\s+/):** Split by spaces/tabs/newlines (regex `\s+` = one or more whitespace)
5. **filter():** Remove any empty strings that snuck in

**Examples:**
```typescript
tokenize("John T")           // → ["john", "t"]
tokenize("  Mary   Jane  ")  // → ["mary", "jane"]
tokenize("admin")            // → ["admin"]
tokenize("")                 // → []
```

**Why lowercase?** So "JOHN", "John", and "john" all match the same thing.

#### Function 2: `getFieldValue(item: any, field: string): string`

**Purpose:** Get a value from an object, even nested ones.

```typescript
export function getFieldValue(item: any, field: string): string {
  if (!item) return '';

  const parts = field.split('.');  // 'user.address.city' → ['user', 'address', 'city']
  let value = item;

  for (const part of parts) {
    value = value?.[part];  // Navigate step by step
    if (value === undefined || value === null) {
      return '';
    }
  }

  return String(value);  // Convert to string
}
```

**Examples:**
```typescript
const user = {
  name: "John",
  address: {
    city: "NYC"
  }
};

getFieldValue(user, 'name')          // → "John"
getFieldValue(user, 'address.city')  // → "NYC"
getFieldValue(user, 'missing')       // → ""
```

**Why the `?.` operator?** It's the "optional chaining" operator. Means "if this is null/undefined, stop and return undefined instead of crashing."

**Normal way (crashes):**
```typescript
value = value[part];  // Error if value is null
```

**Safe way:**
```typescript
value = value?.[part];  // Returns undefined if value is null
```

#### Function 3: `extractSearchableValues(item: any, fields: string[]): string[]`

**Purpose:** Get all the searchable text from an object.

```typescript
export function extractSearchableValues(item: any, fields: string[]): string[] {
  return fields
    .map(field => getFieldValue(item, field))  // Get each field
    .filter(value => value.length > 0)         // Remove empty values
    .map(value => value.toLowerCase());        // Lowercase for matching
}
```

**Example:**
```typescript
const user = {
  name: "John Smith",
  email: "john@example.com",
  role: "admin"
};

extractSearchableValues(user, ['name', 'email', 'role'])
// → ["john smith", "john@example.com", "admin"]
```

**Why?** Now we have an array of lowercase text to search through.

---

### 3️⃣ `search-rank.util.ts` - Scoring Matches

**What it does:** Decides how well something matches and gives it a score.

#### Score Weights
```typescript
const SCORE_WEIGHTS = {
  [MatchType.STARTS_WITH]: 1000,  // Best
  [MatchType.WORD_START]: 500,    // Good
  [MatchType.SUBSTRING]: 100,     // Weak
  [MatchType.NO_MATCH]: 0         // None
};
```

**Think of it like:** Letter grades with point values.
- A+ = 1000 points (starts with)
- B+ = 500 points (word starts with)
- C+ = 100 points (substring)
- F = 0 points (no match)

#### Function 1: `getMatchType(token: string, value: string): MatchType`

**Purpose:** Determine HOW something matched.

```typescript
export function getMatchType(token: string, value: string): MatchType {
  if (!token || !value) {
    return MatchType.NO_MATCH;
  }

  // Check 1: Does value start with token?
  if (value.startsWith(token)) {
    return MatchType.STARTS_WITH;
  }

  // Check 2: Does any word start with token?
  const words = value.split(/\s+/);
  for (const word of words) {
    if (word.startsWith(token)) {
      return MatchType.WORD_START;
    }
  }

  // Check 3: Is token anywhere in value?
  if (value.includes(token)) {
    return MatchType.SUBSTRING;
  }

  // Nothing matched
  return MatchType.NO_MATCH;
}
```

**Step by step:**

1. **Safety check:** If token or value is empty, no match
2. **Check startsWith:** Does "john smith" start with "john"? YES → STARTS_WITH
3. **Check each word:** Does any word in "john smith" start with "smith"? YES → WORD_START
4. **Check includes:** Is "oh" anywhere in "john smith"? YES → SUBSTRING
5. **No match:** Return NO_MATCH

**Examples:**
```typescript
// Searching for "john"
getMatchType("john", "john smith")     // STARTS_WITH (starts at beginning)
getMatchType("john", "sarah john")     // WORD_START (starts a word)
getMatchType("john", "johnson")        // SUBSTRING (inside the word)
getMatchType("john", "mary kate")      // NO_MATCH

// Searching for "smith"
getMatchType("smith", "smith john")    // STARTS_WITH
getMatchType("smith", "john smith")    // WORD_START
getMatchType("smith", "blacksmith")    // SUBSTRING
```

**Why this order?** We want the BEST match type. If "john" starts the name, that's better than it being in the middle.

#### Function 2: `getBestMatchType(token: string, fieldValues: string[]): MatchType`

**Purpose:** Check a token against MULTIPLE fields and return the best match.

```typescript
export function getBestMatchType(token: string, fieldValues: string[]): MatchType {
  let bestMatch = MatchType.NO_MATCH;

  for (const value of fieldValues) {
    const matchType = getMatchType(token, value);

    // Early exit: found perfect match
    if (matchType === MatchType.STARTS_WITH) {
      return MatchType.STARTS_WITH;
    }

    // Update if better
    if (SCORE_WEIGHTS[matchType] > SCORE_WEIGHTS[bestMatch]) {
      bestMatch = matchType;
    }
  }

  return bestMatch;
}
```

**Example:**
```typescript
const user = {
  name: "Sarah Johnson",
  email: "sarah@example.com"
};
const fieldValues = ["sarah johnson", "sarah@example.com"];

// Token "sarah"
getBestMatchType("sarah", fieldValues)
// Checks:
//   "sarah johnson" → STARTS_WITH ✅ (best possible, return immediately)
//   "sarah@example.com" → (don't even check, already found best)
// Returns: STARTS_WITH

// Token "john"
getBestMatchType("john", fieldValues)
// Checks:
//   "sarah johnson" → WORD_START (john starts a word)
//   "sarah@example.com" → NO_MATCH
// Returns: WORD_START (best found)
```

**Why early exit?** If we find STARTS_WITH (best possible), no point checking other fields.

#### Function 3: `scoreItem(tokens: string[], fieldValues: string[]): number`

**Purpose:** Score an entire item based on ALL tokens.

```typescript
export function scoreItem(tokens: string[], fieldValues: string[]): number {
  if (tokens.length === 0) {
    return 0;
  }

  let totalScore = 0;

  // ALL tokens must match (AND logic)
  for (const token of tokens) {
    const matchType = getBestMatchType(token, fieldValues);

    // If ANY token doesn't match, item fails
    if (matchType === MatchType.NO_MATCH) {
      return 0;  // Exit early
    }

    totalScore += SCORE_WEIGHTS[matchType];
  }

  return totalScore;
}
```

**Key concept: AND logic**

ALL tokens must match or the item gets 0 points.

**Example:**
```typescript
const user = { name: "John Thomas", email: "john@example.com" };
const fieldValues = ["john thomas", "john@example.com"];

// Query: "john"
scoreItem(["john"], fieldValues)
// Token "john" → STARTS_WITH in "john thomas" → 1000 points
// Total: 1000

// Query: "john t"
scoreItem(["john", "t"], fieldValues)
// Token "john" → STARTS_WITH (1000)
// Token "t" → WORD_START in "Thomas" (500)
// Total: 1500

// Query: "john admin"
scoreItem(["john", "admin"], fieldValues)
// Token "john" → STARTS_WITH (1000)
// Token "admin" → NO_MATCH (0)
// Total: 0 (entire item excluded)
```

**Why AND logic?** If you search "john admin", you want Johns who are admins, not all Johns OR all admins.

#### Function 4: `rankItems<T>(...): ScoredItem<T>[]`

**Purpose:** Score all items and sort by score.

```typescript
export function rankItems<T>(
  items: T[],
  query: string,
  getValues: (item: T) => string[]
): ScoredItem<T>[] {
  const tokens = tokenize(query);

  // No query = all items with 0 score
  if (tokens.length === 0) {
    return items.map(item => ({
      item,
      score: 0,
      matchType: MatchType.NO_MATCH,
      matchedFields: []
    }));
  }

  const scored: ScoredItem<T>[] = [];

  // Score each item
  for (const item of items) {
    const fieldValues = getValues(item);
    const score = scoreItem(tokens, fieldValues);

    // Only include items that matched
    if (score > 0) {
      scored.push({
        item,
        score,
        matchType: /* calculated */,
        matchedFields: /* calculated */
      });
    }
  }

  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);

  return scored;
}
```

**Example:**
```typescript
const users = [
  { id: '1', name: 'John Smith', email: 'john@example.com' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com' },
  { id: '3', name: 'Thomas John', email: 'thomas@example.com' }
];

rankItems(users, "john", (user) => [user.name.toLowerCase(), user.email.toLowerCase()])
// Results (sorted by score):
// [
//   { item: {name: 'John Smith'}, score: 1000 },     // STARTS_WITH
//   { item: {name: 'Thomas John'}, score: 500 },     // WORD_START
//   { item: {name: 'Sarah Johnson'}, score: 100 }    // SUBSTRING
// ]
```

**Why sort?** So best matches appear first in the list.

---

### 4️⃣ `search-filters.util.ts` - Filter & Highlight

**What it does:** Uses the ranking logic to filter/suggest/highlight.

#### Function 1: `filterAndRank<T>(...): T[]`

**Purpose:** The main filtering function your component uses.

```typescript
export function filterAndRank<T>(
  items: T[],
  query: string,
  fields: string[]
): T[] {
  // Empty query = return everything
  if (!query || query.trim().length === 0) {
    return items;
  }

  // Rank and extract just the items
  const ranked = rankItems(
    items,
    query,
    (item) => extractSearchableValues(item, fields)
  );

  return ranked.map(scored => scored.item);
}
```

**Why?** This is what your component calls: "Give me filtered, ranked results."

**Example:**
```typescript
const users = [/* ... */];
filterAndRank(users, "john", ['name', 'email'])
// → [John Smith, Thomas John, Sarah Johnson]  (sorted by relevance)
```

#### Function 2: `generateSuggestions<T>(...): T[]`

**Purpose:** Get top N items for the suggestions dropdown.

```typescript
export function generateSuggestions<T>(
  items: T[],
  query: string,
  fields: string[],
  maxSuggestions: number = 5
): T[] {
  // Empty query = no suggestions
  if (!query || query.trim().length === 0) {
    return [];
  }

  const ranked = rankItems(/* ... */);

  return ranked.slice(0, maxSuggestions).map(scored => scored.item);
}
```

**Why separate from filterAndRank?**
- Suggestions show top 5 only
- Suggestions appear instantly (no debounce)
- Different UI behavior

#### Function 3: `highlightMatches(text: string, query: string): string`

**Purpose:** Add `<mark>` tags around matching text.

```typescript
export function highlightMatches(text: string, query: string): string {
  if (!text || !query || query.trim().length === 0) {
    return text;
  }

  const tokens = tokenize(query);
  if (tokens.length === 0) {
    return text;
  }

  // Create regex: "john|t" means "john OR t"
  const pattern = tokens
    .map(token => escapeRegex(token))
    .join('|');

  const regex = new RegExp(`(${pattern})`, 'gi');

  return text.replace(regex, '<mark>$1</mark>');
}
```

**Breaking it down:**

1. **tokenize:** "john t" → `["john", "t"]`
2. **escapeRegex:** Make safe for regex (escape special chars like `.` `*` `?`)
3. **join('|'):** `["john", "t"]` → `"john|t"` (regex OR)
4. **new RegExp:** Create pattern `/(john|t)/gi`
   - `g` = global (find all)
   - `i` = ignore case
5. **replace:** Replace matches with `<mark>match</mark>`

**Example:**
```typescript
highlightMatches("John Thomas", "john t")
// Step by step:
// 1. tokens = ["john", "t"]
// 2. pattern = "john|t"
// 3. regex = /(john|t)/gi
// 4. "John Thomas".replace(/(john|t)/gi, '<mark>$1</mark>')
// 5. "<mark>John</mark> <mark>T</mark>homas"
```

**What's `$1`?** In regex, `()` captures a group. `$1` refers to what was captured.

**Visual result in browser:**
```html
<mark>John</mark> <mark>T</mark>homas
```
Displays as: **John** **T**homas (with yellow highlight via CSS)

---

### 5️⃣ `search-engine.ts` - The Core Engine

**What it does:** Ties everything together with Angular signals and RxJS.

#### The Factory: `createSearchEngine<T>(...)`

**Purpose:** Create a fully-functional search engine instance.

```typescript
export function createSearchEngine<T>(
  items: Signal<T[]>,
  config: SearchConfig<T>
): SearchEngine<T> {
```

**Step 1: Setup**
```typescript
  // Configuration with defaults
  const debounceMs = config.debounceMs ?? 200;
  const maxSuggestions = config.maxSuggestions ?? 5;
  const enableSuggestions = config.enableSuggestions ?? true;
```

**What's `??`?** "Nullish coalescing operator" - means "use this value if the left is null/undefined".

```typescript
config.debounceMs ?? 200
// If config.debounceMs is undefined → use 200
// If config.debounceMs is 0 → use 0 (not 200!)
```

**Step 2: Create signals**
```typescript
  // State signals
  const query = signal('');              // Current typing
  const debouncedQuery = signal('');     // Delayed query (for filtering)
  const activeIndex = signal(-1);        // Selected suggestion (-1 = none)
  const isOpen = signal(false);          // Dropdown visible?
```

**What are signals?** Angular's reactive state. When a signal changes, anything using it auto-updates.

**Why two queries?**
- `query`: Updates instantly → drives suggestions dropdown
- `debouncedQuery`: Updates after pause → drives filtered list (prevents lag)

**Step 3: RxJS debouncing**
```typescript
  const querySubject = new Subject<string>();
  const subscription = querySubject
    .pipe(debounceTime(debounceMs))  // Wait 200ms
    .subscribe(value => {
      debouncedQuery.set(value);
    });
```

**What's happening:**

1. **Subject:** Like a signal but works with RxJS
2. **pipe:** Chain operations (like `.map()` `.filter()`)
3. **debounceTime(200):** Wait 200ms after last value
4. **subscribe:** Do something when value comes through

**Visual timeline:**
```
User types: "j" → "jo" → "joh" → "john"
            0ms  50ms  100ms   150ms

querySubject receives: "j" "jo" "joh" "john"

debounceTime waits 200ms after last...

At 350ms (150 + 200), emits: "john"

debouncedQuery.set("john")
```

**Why?** If user types fast, we don't run expensive filtering 10 times. We wait until they pause.

**Step 4: Sync query to debounced query**
```typescript
  effect(() => {
    const currentQuery = query();
    querySubject.next(currentQuery);
  }, { allowSignalWrites: true });
```

**What's effect?** Runs whenever signals inside it change.

```typescript
effect(() => {
  console.log(query());  // This runs every time query changes
});
```

**Step 5: Computed filtered results**
```typescript
  const filtered = computed(() => {
    const currentItems = items();
    const currentQuery = debouncedQuery();

    return filterAndRank(currentItems, currentQuery, config.fields);
  });
```

**What's computed?** Like Excel formulas. Auto-recalculates when dependencies change.

```typescript
const a = signal(5);
const b = signal(10);
const sum = computed(() => a() + b());  // 15

a.set(8);  // sum auto-updates to 18
```

**In our case:**
- When `items()` changes (new data loaded) → filtered recalculates
- When `debouncedQuery()` changes (user searched) → filtered recalculates

**Step 6: Computed suggestions**
```typescript
  const suggestions = computed(() => {
    if (!enableSuggestions) return [];

    const currentItems = items();
    const currentQuery = query();  // Instant, not debounced!

    return generateSuggestions(
      currentItems,
      currentQuery,
      config.fields,
      maxSuggestions
    );
  });
```

**Why use `query()` not `debouncedQuery()`?** Suggestions should appear as you type (instant feedback).

**Step 7: Return the public API**
```typescript
  return {
    // Read-only signals
    query: query.asReadonly(),
    filtered,
    suggestions,
    activeIndex: activeIndex.asReadonly(),
    isOpen: isOpen.asReadonly(),

    // Methods
    setQuery: (value: string) => {
      query.set(value);
      activeIndex.set(-1);

      if (enableSuggestions && value.trim().length > 0) {
        isOpen.set(true);
      } else {
        isOpen.set(false);
      }
    },

    selectSuggestion: (item: T) => {
      const label = config.getLabel(item);
      query.set(label);
      debouncedQuery.set(label);  // Skip debounce
      isOpen.set(false);
      activeIndex.set(-1);
    },

    moveSelection: (delta: number) => {
      const currentSuggestions = suggestions();
      if (currentSuggestions.length === 0) return;

      const current = activeIndex();
      let next = current + delta;

      // Wrap around
      if (next < -1) {
        next = currentSuggestions.length - 1;
      } else if (next >= currentSuggestions.length) {
        next = -1;
      }

      activeIndex.set(next);
    },

    highlight: (text: string, queryOverride?: string) => {
      const searchQuery = queryOverride ?? query();
      return highlightMatches(text, searchQuery);
    },

    destroy: () => {
      subscription.unsubscribe();
      querySubject.complete();
    }
  };
}
```

**Method explanations:**

**`setQuery(value)`:** Update the search text
```typescript
userSearch.setQuery("john");
// → query = "john"
// → suggestions open
// → after 200ms, debouncedQuery = "john"
// → filtered list updates
```

**`selectSuggestion(item)`:** User clicked/pressed Enter on a suggestion
```typescript
userSearch.selectSuggestion(user);
// → query = user.name
// → debouncedQuery = user.name (skip delay)
// → dropdown closes
```

**`moveSelection(delta)`:** Arrow key navigation
```typescript
userSearch.moveSelection(1);   // Down arrow
userSearch.moveSelection(-1);  // Up arrow
```

**`highlight(text)`:** Add highlighting
```typescript
userSearch.highlight("John Thomas")
// If query is "john t":
// → "<mark>John</mark> <mark>T</mark>homas"
```

**`destroy()`:** Cleanup when component destroyed
```typescript
ngOnDestroy() {
  this.userSearch.destroy();  // Stop RxJS subscription
}
```

#### Helper: `handleSearchKeyboard(...)`

**Purpose:** Handle keyboard events in suggestions dropdown.

```typescript
export function handleSearchKeyboard<T>(
  event: KeyboardEvent,
  search: SearchEngine<T>
): boolean {
  switch (event.key) {
    case 'ArrowDown':
      search.moveSelection(1);
      return true;  // Handled

    case 'ArrowUp':
      search.moveSelection(-1);
      return true;

    case 'Enter':
      const suggestions = search.suggestions();
      const activeIndex = search.activeIndex();

      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        search.selectSuggestion(suggestions[activeIndex]);
        return true;
      }
      break;

    case 'Escape':
      search.closeSuggestions();
      return true;
  }

  return false;  // Not handled
}
```

**Usage in component:**
```typescript
onSearchKeyDown(event: KeyboardEvent) {
  if (handleSearchKeyboard(event, this.userSearch)) {
    event.preventDefault();  // Don't do default behavior
  }
}
```

**What's `return true/false`?** Tells the component whether we handled the key.
- `true` → We handled it, prevent default (don't move cursor, etc.)
- `false` → We didn't handle it, let browser do default

---

## How Everything Works Together

### The Complete Journey: User Types "john t"

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER TYPES "john t"                                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Component calls: userSearch.setQuery("john t")          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. search-engine.ts:                                        │
│    - query.set("john t")                                    │
│    - isOpen.set(true)                                       │
│    - Pushes to querySubject                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. INSTANT: suggestions() computed recalculates             │
│    [search-filters.util.ts: generateSuggestions]            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. search-tokenize.util.ts: tokenize("john t")             │
│    → ["john", "t"]                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. search-rank.util.ts: rankItems()                         │
│    For each user:                                           │
│    - extractSearchableValues() → ["john smith", "john@..."] │
│    - scoreItem(["john", "t"], fieldValues)                  │
│      • "john" → STARTS_WITH (1000)                          │
│      • "t" → WORD_START in "Thomas" (500)                   │
│      • Total: 1500 points                                   │
│    - Sort by score                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Top 5 results returned to suggestions()                 │
│    UI shows dropdown with highlighted matches               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. AFTER 200ms: debounceTime fires                         │
│    - debouncedQuery.set("john t")                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. filtered() computed recalculates                         │
│    Same ranking process as suggestions                      │
│    Returns ALL matching users (sorted)                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 10. UI updates with filtered list                          │
│     [John Thomas, Thomas John, ...]                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Using the Search Engine

### In Your Component

#### Step 1: Import
```typescript
import { createSearchEngine, handleSearchKeyboard, SearchEngine } from '@app/shared/search';
import { User } from '@app/models/user.model';
```

#### Step 2: Create the engine
```typescript
export class AdminPanelComponent implements OnInit, OnDestroy {
  users = signal<User[]>([]);
  userSearch!: SearchEngine<User>;

  ngOnInit() {
    this.userSearch = createSearchEngine(this.users, {
      fields: ['name', 'email', 'role'],
      getLabel: (user) => user.name,
      getKey: (user) => user.id,
      debounceMs: 200,
      maxSuggestions: 5,
      enableSuggestions: true
    });
  }

  ngOnDestroy() {
    this.userSearch.destroy();  // Important: cleanup!
  }
}
```

#### Step 3: Use in template
```html
<!-- Search input -->
<input
  type="text"
  [value]="userSearch.query()"
  (input)="onSearchInput($event)"
  (keydown)="onSearchKeyDown($event)"
  (focus)="onSearchFocus()"
  (blur)="onSearchBlur()"
  placeholder="Search users..."
/>

<!-- Suggestions dropdown -->
@if (userSearch.isOpen() && userSearch.suggestions().length > 0) {
  <div class="suggestions-dropdown">
    @for (user of userSearch.suggestions(); track user.id; let idx = $index) {
      <div
        class="suggestion-item"
        [class.active]="idx === userSearch.activeIndex()"
        (mousedown)="selectUserSuggestion(user)"
      >
        <div [innerHTML]="userSearch.highlight(user.name)"></div>
        <div [innerHTML]="userSearch.highlight(user.email)"></div>
      </div>
    }
  </div>
}

<!-- Filtered results -->
@for (user of userSearch.filtered(); track user.id) {
  <div class="user-card">
    {{ user.name }} - {{ user.email }}
  </div>
}
```

#### Step 4: Methods
```typescript
onSearchInput(event: Event) {
  const input = event.target as HTMLInputElement;
  this.userSearch.setQuery(input.value);
}

onSearchKeyDown(event: KeyboardEvent) {
  if (handleSearchKeyboard(event, this.userSearch)) {
    event.preventDefault();
  }
}

selectUserSuggestion(user: User) {
  this.userSearch.selectSuggestion(user);
}

onSearchFocus() {
  this.userSearch.openSuggestions();
}

onSearchBlur() {
  setTimeout(() => {
    this.userSearch.closeSuggestions();
  }, 200);  // Delay so click events work
}
```

---

## Key Concepts Explained

### 1. TypeScript Generics (`<T>`)

**What are they?** Placeholders for types.

**Without generics (bad):**
```typescript
function getUserById(id: string): User {
  // Only works for users
}

function getProductById(id: string): Product {
  // Need to write same function again!
}
```

**With generics (good):**
```typescript
function getById<T>(id: string): T {
  // Works for any type
}

const user = getById<User>("123");
const product = getById<Product>("456");
```

**In our code:**
```typescript
createSearchEngine<User>(users, config)    // Works with users
createSearchEngine<Product>(products, config)  // Works with products
```

**Think of `<T>` like:** A variable for types. Just like `x` can be any number, `T` can be any type.

### 2. Angular Signals

**What are they?** Reactive state management.

**Old way (Angular 15-):**
```typescript
// Must use async pipe in template
users$ = this.http.get('/api/users');
```

**New way (Angular 16+):**
```typescript
// Direct signal
users = signal<User[]>([]);
users.set([...]);  // Update
const value = users();  // Read
```

**Computed signals:**
```typescript
const firstName = signal('John');
const lastName = signal('Doe');
const fullName = computed(() => `${firstName()} ${lastName()}`);

console.log(fullName());  // "John Doe"
firstName.set('Jane');
console.log(fullName());  // "Jane Doe" (auto-updated!)
```

**Why signals?** Auto-update, simpler syntax, better performance.

### 3. RxJS Debouncing

**What is it?** Wait until user stops typing before acting.

**Without debouncing (bad):**
```
User types: "j" → SEARCH
User types: "o" → SEARCH
User types: "h" → SEARCH
User types: "n" → SEARCH
Result: 4 expensive searches
```

**With debouncing (good):**
```
User types: "j" → wait...
User types: "o" → wait...
User types: "h" → wait...
User types: "n" → wait...
(200ms pass with no typing)
Now: SEARCH once for "john"
Result: 1 search
```

**Code:**
```typescript
querySubject.pipe(
  debounceTime(200)  // Wait 200ms
).subscribe(value => {
  // This runs after user stops typing
});
```

### 4. Pure Functions

**What are they?** Functions with no side effects.

**Impure (bad):**
```typescript
let total = 0;
function addToTotal(x: number) {
  total += x;  // Modifies external state
  return total;
}
```

**Pure (good):**
```typescript
function add(a: number, b: number): number {
  return a + b;  // Only uses inputs, no side effects
}
```

**Why pure?** Easy to test, predictable, no surprises.

**Our utility functions are pure:**
```typescript
tokenize("john")  // Always returns ["john"]
scoreItem(tokens, values)  // Always same output for same inputs
```

### 5. Factory Pattern

**What is it?** A function that creates objects.

**Instead of class:**
```typescript
class SearchEngine {
  constructor(config) { ... }
}

const engine = new SearchEngine(config);
```

**Factory function:**
```typescript
function createSearchEngine(config) {
  // Create and return object with methods
  return {
    setQuery: (value) => { ... },
    filtered: () => { ... }
  };
}

const engine = createSearchEngine(config);
```

**Why?** More flexible, easier to compose, tree-shakable.

### 6. Regex Basics

**What is regex?** Pattern matching for text.

**Common patterns:**
- `.` = any character
- `\s` = whitespace (space/tab/newline)
- `+` = one or more
- `*` = zero or more
- `?` = optional
- `|` = OR
- `()` = capture group

**Examples:**
```typescript
// Split by spaces
"john smith".split(/\s+/)  // → ["john", "smith"]

// Match "john" OR "t"
/(john|t)/gi
//  ^^^^^  → Pattern
//       g → Global (find all)
//        i → Ignore case

// In replace
"John Thomas".replace(/(john|t)/gi, '<mark>$1</mark>')
//                                            ^^ = what was captured
```

### 7. Scoring Algorithms

**What are they?** Ways to rank/sort items by relevance.

**Simple scoring:**
```
Item matches? → Include it (yes/no)
```

**Our scoring:**
```
How well does it match?
- Perfect match → 1000 points
- Good match → 500 points
- Weak match → 100 points
→ Sort by points (highest first)
```

**Why?** Better user experience. Most relevant results first.

---

## Common Questions

### Q: Why separate `query` and `debouncedQuery`?

**A:** Different UI needs:
- **Suggestions:** Instant feedback while typing → use `query`
- **Filtered list:** Expensive operation → use `debouncedQuery` (wait until user pauses)

### Q: What's the `??` operator?

**A:** "Nullish coalescing" - use default if null/undefined.
```typescript
config.debounceMs ?? 200
// If debounceMs is undefined/null → 200
// If debounceMs is 0 → 0 (not 200!)

// Different from ||:
config.debounceMs || 200
// If debounceMs is 0 → 200 (treats 0 as falsy)
```

### Q: Why `setTimeout` in `onSearchBlur`?

**A:** Mouse clicks take time to register.
```typescript
onSearchBlur() {
  setTimeout(() => {
    this.userSearch.closeSuggestions();
  }, 200);  // Wait 200ms before closing
}
```

Without delay: Click suggestion → blur fires → dropdown closes → click doesn't register.

With delay: Click suggestion → blur fires → wait 200ms → click registers → then close.

### Q: What's `[innerHTML]`?

**A:** Renders HTML strings as actual HTML.
```html
<!-- This shows the literal text -->
<div>{{ "<mark>John</mark>" }}</div>
Result: <mark>John</mark>

<!-- This renders as HTML -->
<div [innerHTML]="'<mark>John</mark>'"></div>
Result: John (with highlight)
```

### Q: Why `asReadonly()` on signals?

**A:** Prevents external modification.
```typescript
// Without readonly
return { query: query };
// Component could do: search.query.set("hack")

// With readonly
return { query: query.asReadonly() };
// Component can only read: search.query()
// Must use method to update: search.setQuery("value")
```

### Q: Can I use this for products? Orders?

**A:** Yes! Just change the config:
```typescript
// Products
productSearch = createSearchEngine(this.products, {
  fields: ['title', 'category', 'description'],
  getLabel: (p) => p.title,
  getKey: (p) => p.id
});

// Orders
orderSearch = createSearchEngine(this.orders, {
  fields: ['orderNumber', 'customerName', 'status'],
  getLabel: (o) => o.orderNumber,
  getKey: (o) => o.id
});
```

---

## Next Steps

1. **Read the code** with this guide open
2. **Try modifying** the scoring weights
3. **Add fields** to the user search (try searching by phone)
4. **Create a product search** using the same engine
5. **Experiment** with different debounce times

**Remember:** This is professional-level code. Don't worry if you don't understand everything immediately. Come back to this guide as you work with the code! 🚀
