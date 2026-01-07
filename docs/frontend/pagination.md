# Admin List Pagination Pattern

**Document Version:** 3.0
**Last Updated:** 2026-01-07
**Status:** ✅ Canonical Reference Implementation
**Reference Implementation:** Admin Users List

---

## Overview

This document defines the canonical pagination pattern for Admin list views in the Night Reader application. The pattern combines **server-side global search** with **meta-driven pagination** to enable efficient browsing and filtering of large datasets.

### Key Features

- **Global Search:** Server-side filtering searches across the entire dataset, not just the current page
- **Smart Pagination:** Meta totals reflect filtered results when search is active
- **Debounced Input:** 200ms debounce prevents excessive API calls during typing
- **Race Protection:** RequestId guard prevents stale responses from appearing
- **Responsive Layout:** Desktop grid layout, mobile stack layout
- **UX Optimization:** Search engine provides debouncing, suggestions, and highlighting

---

## Canonical API Contract

### Request Format

```http
GET /api/admin/users?page=1&limit=20&q=admin
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Current page number (1-indexed, minimum 1) |
| `limit` | number | No | 20 | Items per page (range: 1-100) |
| `q` | string | No | - | Search query (trimmed, empty treated as no filter) |

#### Parameter Validation Rules

- **page:** Invalid or negative values default to `1`
- **limit:** Clamped to range `[1, 100]`
- **q:** Trimmed on both frontend and backend; empty string treated as `undefined` (no filtering)

---

### Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": "user-1700000000000-abc123",
      "email": "user@example.com",
      "name": "Sample User",
      "role": "user",
      "createdAt": "2025-01-01T12:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 137,
    "totalPages": 7
  }
}
```

#### Response Shape Breakdown

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `true` for successful responses |
| `data` | T[] | Array of items for current page (length ≤ limit) |
| `meta.page` | number | Current page as requested (not capped) |
| `meta.limit` | number | Items per page as requested |
| `meta.total` | number | **Total count of filtered dataset** |
| `meta.totalPages` | number | Calculated pages for filtered dataset (minimum 1) |

---

### Meta Semantics (CRITICAL)

#### When Search is Active (`q` present)

- `meta.total` = count of users matching the search query
- `meta.totalPages` = pages required for filtered results
- `data` = subset of filtered results for current page

**Example:**
```http
GET /api/admin/users?page=1&limit=20&q=admin
```
```json
{
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5,        // 5 users match "admin"
    "totalPages": 1    // 5 users fit on 1 page
  }
}
```

#### When Search is Inactive (no `q`)

- `meta.total` = total count of all users
- `meta.totalPages` = pages required for full dataset
- `data` = subset of all users for current page

---

### Edge Case Behaviors

#### Empty Results (`total = 0`)

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 1  // Always >= 1 for UI stability
  }
}
```

**Rationale:** `totalPages >= 1` prevents "Page 1 of 0" display and simplifies frontend logic.

#### Out of Range Page

```http
GET /api/admin/users?page=999&limit=20
```

```json
{
  "success": true,
  "data": [],        // Empty array, not capped to last page
  "meta": {
    "page": 999,     // Returns requested page number
    "limit": 20,
    "total": 57,
    "totalPages": 3
  }
}
```

**Rationale:** Frontend can detect `page > totalPages` and handle appropriately (e.g., redirect to page 1).

---

## Frontend Coordination Rules (Non-Negotiable)

### Rule 1: Page Reset on Query Change

**When the debounced search query changes, ALWAYS reset page to 1.**

```typescript
effect(() => {
  const debouncedQuery = this.userSearch.debouncedQuery();
  // MUST reset page to 1
  this.loadUsers(1, debouncedQuery);
});
```

**Why:** Prevents "Page 5 of 2" scenarios when filtered results have fewer pages.

**Bad Example:** ❌
```typescript
// DON'T DO THIS - keeps current page
this.loadUsers(this.usersMeta().page, debouncedQuery);
```

---

### Rule 2: Pagination Preserves Query

**When navigating pages, ALWAYS pass the current search query.**

```typescript
goToNextUsersPage(): void {
  const { page, totalPages } = this.usersMeta();
  if (page >= totalPages) return;

  // MUST preserve current query
  const query = this.userSearch.debouncedQuery();
  this.loadUsers(page + 1, query);
}
```

**Why:** Without this, clicking "Next" would return unfiltered results.

**Bad Example:** ❌
```typescript
// DON'T DO THIS - loses search query
this.loadUsers(page + 1);
```

---

### Rule 3: No Double Filtering

**Template MUST render server-filtered results directly. Do NOT apply client-side filtering.**

```html
<!-- CORRECT ✅ -->
@for (user of users(); track user.id) {
  <div>{{ user.name }}</div>
}
```

```html
<!-- WRONG ❌ -->
@for (user of filteredUsers(); track user.id) {
  <div>{{ user.name }}</div>
}
```

**Why:** Server already filtered the results. Client-side filtering would:
- Hide items that should be visible
- Show incorrect counts
- Break pagination logic

**If you have a `filteredUsers()` computed signal, remove it or document that it's unused.**

---

### Rule 4: Race Safety (RequestId Guard)

**Implement requestId guard to prevent stale responses.**

```typescript
// Component property
private usersRequestId = 0;

// In loadUsers() method
loadUsers(page: number, query?: string): void {
  this.loadingUsers.set(true);

  // Increment BEFORE fetch
  this.usersRequestId++;
  const currentRequestId = this.usersRequestId;

  this.adminService.getAllUsers(page, limit, query).subscribe({
    next: (response) => {
      // Only apply if still latest request
      if (currentRequestId !== this.usersRequestId) {
        return; // Stale response, ignore
      }

      // Update state...
      this.users.set(response.data);
      this.usersMeta.set(response.meta);
      this.loadingUsers.set(false);
    },
    error: (error) => {
      // Also check in error handler
      if (currentRequestId !== this.usersRequestId) {
        return;
      }

      // Handle error...
      this.loadingUsers.set(false);
    }
  });
}
```

**Why This Is Necessary:**

During rapid typing, multiple requests can be in-flight:
1. User types "a" → Request A starts (ID=1)
2. User types "ad" → Request B starts (ID=2)
3. User types "adm" → Request C starts (ID=3)
4. Response C arrives → ID 3 = current 3 → **Applied** ✅
5. Response A arrives → ID 1 ≠ current 3 → **Ignored** ✅
6. Response B arrives → ID 2 ≠ current 3 → **Ignored** ✅

**Without race protection:** Response A (stale) could overwrite Response C (fresh).

**Alternative:** RxJS `switchMap` is also valid but adds complexity.

---

## UI Behavior & Layout

### Layout Structure

#### Desktop (>900px)

```
┌─────────────────────────────────────────────────────────────┐
│  [Search Bar.........................]  Total Users: 57     │
│                                         [Prev] Page 1 of 3 [Next] │
└─────────────────────────────────────────────────────────────┘
│  User List                                                   │
│  ┌────────────────────────────────────┐                     │
│  │ User Card 1                        │                     │
│  │ User Card 2                        │                     │
│  └────────────────────────────────────┘                     │
│              [Prev] Page 1 of 3 [Next]                      │
└─────────────────────────────────────────────────────────────┘
```

**Layout Implementation:**
- CSS Grid: `grid-template-columns: 1fr auto`
- Left column: Search bar (full width)
- Right column: Vertical flexbox stack
  - Total count (top, right-aligned)
  - Pagination controls (bottom, right-aligned)

#### Mobile (<900px)

```
┌──────────────────────────┐
│ [Search Bar............] │
│                          │
│ Total Users: 57          │
│ [Prev] Page 1 of 3 [Next]│
├──────────────────────────┤
│ User List                │
│ ┌──────────────────────┐ │
│ │ User Card 1          │ │
│ │ User Card 2          │ │
│ └──────────────────────┘ │
│  [Prev] Page 1 of 3 [Next]│
└──────────────────────────┘
```

**Layout Implementation:**
- Single column stack
- Search bar (full width)
- Total + pagination (left-aligned)

---

### Pagination Controls

#### Top Pagination
- **Visibility:** Always visible
- **Position:** Right-aligned on desktop, left-aligned on mobile
- **Contains:** "Total Users" count + pagination controls

#### Bottom Pagination
- **Visibility:** Only shown when `totalPages > 1`
- **Position:** Centered horizontally
- **Contains:** Pagination controls only (no total count)

**Template Example:**
```html
<!-- Top pagination: Always visible -->
<div class="users-header-right">
  <div class="users-total">Total Users: {{ usersMeta().total }}</div>
  <div class="users-pagination">
    <button (click)="goToPreviousUsersPage()" [disabled]="...">Prev</button>
    <span>Page {{ usersMeta().page }} of {{ usersMeta().totalPages }}</span>
    <button (click)="goToNextUsersPage()" [disabled]="...">Next</button>
  </div>
</div>

<!-- Bottom pagination: Conditional -->
@if (!loadingUsers() && users().length > 0 && usersMeta().totalPages > 1) {
  <div class="users-pagination users-pagination-bottom">
    <!-- Same controls -->
  </div>
}
```

---

### Button Disabled States

#### Previous Button
Disabled when:
- `usersMeta().page <= 1` (already on first page)
- `loadingUsers() === true` (request in progress)

```html
<button
  (click)="goToPreviousUsersPage()"
  [disabled]="loadingUsers() || usersMeta().page <= 1"
>
  Prev
</button>
```

#### Next Button
Disabled when:
- `usersMeta().page >= usersMeta().totalPages` (already on last page)
- `loadingUsers() === true` (request in progress)

```html
<button
  (click)="goToNextUsersPage()"
  [disabled]="loadingUsers() || usersMeta().page >= usersMeta().totalPages"
>
  Next
</button>
```

---

### Loading & Empty States

#### Loading State
```html
@if (loadingUsers()) {
  <div class="placeholder-content">
    <div class="placeholder-icon">⏳</div>
    <p class="placeholder-text">Loading users...</p>
  </div>
}
```

**Behavior:**
- Show spinner or loading message
- Disable pagination buttons
- Keep current results visible (optional)

#### Empty State (No Results)
```html
@else if (users().length === 0) {
  <div class="placeholder-content">
    <div class="placeholder-icon">👤</div>
    <p class="placeholder-text">No users found</p>
    <p class="placeholder-subtext">Try a different search term</p>
  </div>
}
```

**When to show:**
- `users().length === 0` AND `!loadingUsers()`

**Context-aware messaging:**
- If search query is active: "No users found - Try a different search term"
- If no search query: "No users exist"

---

## Search Engine Coordination

### Search Engine Role

The `SearchEngine` utility provides:
- Input state management
- Debounced query signal (`debouncedQuery()`)
- Autocomplete suggestions (optional)
- Text highlighting (optional)

**CRITICAL:** The search engine does **NOT** filter the displayed list when server-side search is active.

### Initialization

```typescript
constructor() {
  // Initialize user search engine
  // NOTE: Search engine is used for input state, debouncing, and suggestions ONLY
  // It does NOT filter the displayed list - filtering is server-side via `q` param
  this.userSearch = createSearchEngine(this.users, {
    fields: ['name', 'email', 'role'],
    getLabel: (user) => user.name,
    getKey: (user) => user.id,
    debounceMs: 200,
    maxSuggestions: 5,
    enableSuggestions: true
  });

  // Watch debounced query and trigger server-side search with page reset
  effect(() => {
    const debouncedQuery = this.userSearch.debouncedQuery();
    // Reset page to 1 and fetch with new query
    this.loadUsers(1, debouncedQuery);
  });
}
```

### Why Suggestions Still Work

Even though filtering is server-side, the search engine can still provide suggestions from the **current page's results**:

```typescript
// Suggestions are computed from users() signal (current page)
userSearch.suggestions() // Returns top 5 matches from current page
```

**Limitation:** Suggestions are page-scoped (only shows matches from current 20 users).

**Trade-off:** This is acceptable because:
- Suggestions update as users type
- Server-side search shows all matches after debounce
- Suggestions are a progressive enhancement, not the primary search mechanism

---

## Implementation Checklist

Use this checklist when implementing pagination for a new admin list:

### Backend Implementation

- [ ] **Router:** Parse `page`, `limit`, `q` query parameters
- [ ] **Router:** Trim `q`, treat empty as `undefined`
- [ ] **Router:** Validate `page >= 1`, clamp `limit` to `[1, 100]`
- [ ] **Service:** Add optional `query` parameter to count and page methods
- [ ] **Repository:** Implement `_filterItems(items, query)` with token AND matching
- [ ] **Repository:** Filter → Sort → Paginate (in that order)
- [ ] **Repository:** Return filtered count in `getItemCount(query)`
- [ ] **Repository:** Return `totalPages = Math.max(1, Math.ceil(total / limit))`
- [ ] **Router:** Return standardized `{ success, data, meta }` response
- [ ] **Security:** Sanitize sensitive fields before returning

### Frontend Service

- [ ] **Service:** Add `q?: string` parameter to `getAll()` method
- [ ] **Service:** Only add `q` to params if non-empty after trim
- [ ] **Service:** Define `PaginationMeta` interface
- [ ] **Service:** Return typed `Observable<{ data: T[]; meta: PaginationMeta }>`

### Frontend Component

- [ ] **State:** Add `itemsMeta` signal for pagination state
- [ ] **State:** Add `items` signal for data
- [ ] **State:** Add `loadingItems` signal for loading state
- [ ] **Race Guard:** Add `itemsRequestId` property (number)
- [ ] **Search Engine:** Initialize with fields, debounceMs, etc.
- [ ] **Effect:** Watch `debouncedQuery()` and call `loadItems(1, query)`
- [ ] **loadItems():** Accept `page` and `query?` parameters
- [ ] **loadItems():** Increment `itemsRequestId` before fetch
- [ ] **loadItems():** Check `currentRequestId !== itemsRequestId` in subscribe
- [ ] **loadItems():** Update `items` and `itemsMeta` from response
- [ ] **Pagination:** `goToPrevious/Next()` methods preserve query
- [ ] **Cleanup:** Destroy search engine in `ngOnDestroy()`
- [ ] **Comment:** Add inline comment explaining no client-side filtering

### Frontend Template

- [ ] **Layout:** Use CSS Grid for desktop, stack for mobile
- [ ] **Search:** Bind search input to `userSearch.setQuery()`
- [ ] **Top Pagination:** Always visible, show total + controls
- [ ] **Bottom Pagination:** Conditional (`totalPages > 1`)
- [ ] **List:** Render `items()` NOT `filteredItems()`
- [ ] **Disabled:** Prev disabled when `page <= 1`
- [ ] **Disabled:** Next disabled when `page >= totalPages`
- [ ] **Loading:** Show spinner when `loadingItems()`
- [ ] **Empty:** Show "No items found" when `items().length === 0`

---

## Reference Implementation Paths

### Backend

| File | Key Sections | Purpose |
|------|-------------|---------|
| `backend/src/domain/admin/admin.router.js` | Lines 56-87 | Parse `q`, validate params, call service |
| `backend/src/domain/auth/auth.service.js` | Lines 87-93 | Pass `query` to repository |
| `backend/src/infra/file/file-auth.repository.js` | Lines 95-144 | Filter logic, token AND matching |

### Frontend

| File | Key Sections | Purpose |
|------|-------------|---------|
| `frontend/src/app/services/admin.service.ts` | Lines 69-84 | Add `q` param to API call |
| `frontend/src/app/components/admin/admin-panel/admin-panel.ts` | Lines 52, 104-108, 228-287 | Race guard, effect, load methods |
| `frontend/src/app/components/admin/admin-panel/admin-panel.html` | Lines 462, 470, 543 | Render `users()` not `filteredUsers()` |

---

## Acceptance Criteria for Future Lists

Before marking a new admin list as complete, verify:

### Backend Tests

- [ ] `GET /items?page=1&limit=20&q=test` returns only matching items
- [ ] `GET /items?page=1&limit=20&q=` behaves like no filter
- [ ] `GET /items?page=1&limit=20&q=multi+word` uses AND matching
- [ ] `GET /items?page=999&limit=20` returns empty data without crashing
- [ ] `meta.total` reflects filtered count when `q` is present
- [ ] `meta.totalPages` is always >= 1
- [ ] Sensitive fields are stripped from response

### Frontend Tests

- [ ] Search input updates live after debounce (200ms)
- [ ] Typing in search box resets page to 1
- [ ] Pagination buttons preserve current search query
- [ ] Prev button disabled on page 1
- [ ] Next button disabled on last page
- [ ] Rapid typing shows only latest results (no flicker)
- [ ] Clearing search returns to full unfiltered list
- [ ] "Total Items" count updates when searching
- [ ] Empty state shows appropriate message
- [ ] Loading state disables buttons and shows spinner
- [ ] Bottom pagination hidden when `totalPages === 1`

---

## Common Pitfalls & Solutions

### Pitfall 1: Double Filtering

**Symptom:** Search results are incomplete or wrong.

**Cause:** Template renders `filteredItems()` which applies client-side filtering on top of server filtering.

**Solution:** Render `items()` directly. Remove or document unused `filteredItems()` computed signal.

---

### Pitfall 2: Page Not Resetting on Search

**Symptom:** User types search query, page stays at 5, sees empty results.

**Cause:** Effect doesn't reset page to 1.

**Solution:**
```typescript
effect(() => {
  const debouncedQuery = this.itemSearch.debouncedQuery();
  this.loadItems(1, debouncedQuery); // MUST be page 1
});
```

---

### Pitfall 3: Pagination Loses Query

**Symptom:** User searches, clicks Next, sees unfiltered results.

**Cause:** Pagination methods don't pass current query.

**Solution:**
```typescript
goToNextPage(): void {
  const query = this.itemSearch.debouncedQuery();
  this.loadItems(page + 1, query); // Pass query
}
```

---

### Pitfall 4: Race Condition Flicker

**Symptom:** Rapid typing shows intermediate results briefly.

**Cause:** No race protection.

**Solution:** Implement requestId guard as shown in Rule 4.

---

### Pitfall 5: Empty String as Query

**Symptom:** Backend filters by empty string, returns no results.

**Cause:** Frontend sends `?q=` instead of omitting parameter.

**Solution:**
```typescript
const params: any = { page, limit };
if (q && q.trim().length > 0) {
  params.q = q.trim(); // Only add if non-empty
}
```

---

## Performance Notes

### Backend
- **File I/O:** Reads full dataset on each request (existing architecture)
- **Filtering:** O(n × m) where n=items, m=tokens
- **Optimization:** Consider caching for datasets > 10,000 items

### Frontend
- **Debouncing:** 200ms reduces API calls during typing
- **Race Guard:** Minimal overhead (single integer increment)
- **Memory:** Holds max 1 page of items (typically 20 items vs. 1000+)

---

## Migration Notes for Existing Lists

If migrating from page-scoped search to global search:

1. **Backend:** Add `q` parameter support (follow checklist)
2. **Frontend Service:** Add `q` parameter to API method
3. **Frontend Component:**
   - Add race guard (`requestId`)
   - Add effect to watch `debouncedQuery()`
   - Update `loadItems()` to accept `query`
   - Update pagination methods to preserve query
   - **Remove client-side filtering from template**
4. **Testing:** Verify all acceptance criteria

---

## Doc Drift / Historical Notes

### ADMIN_USERS_PAGINATION_PLAN.md (Outdated Sections)

The original `ADMIN_USERS_PAGINATION_PLAN.md` documented the initial pagination implementation but contains **outdated information** about search functionality:

#### What Changed (Global Search Migration)

| Aspect | Old Behavior (Plan v2.0) | New Behavior (Plan v3.0) |
|--------|-------------------------|-------------------------|
| **Search Scope** | Page-scoped (client-side filtering) | Global (server-side filtering) |
| **Filtering** | `filteredUsers()` computed signal | Direct `users()` rendering |
| **API Parameter** | No `q` parameter | `?q=admin` query param |
| **Meta Totals** | Always reflects full dataset | Reflects filtered dataset when `q` present |
| **Page Reset** | Not mentioned | Page resets to 1 on query change |
| **Race Protection** | Not implemented | RequestId guard required |

#### Specific Outdated Statements

From `ADMIN_USERS_PAGINATION_PLAN.md`:

> **Lines 108, 307:** "Client-side search filtering within pages"

**Now:** Server-side filtering across full dataset.

> **Lines 251, 336-341:** Template renders `filteredUsers()`

**Now:** Template renders `users()` directly.

> **Lines 414-416:** "Current Page Only: Search filters only the users loaded on the current page (20 users)"

**Now:** Search queries the entire dataset via backend filtering.

#### Migration Path

If you need the original page-scoped behavior, refer to:
- **Git tag:** `pagination-v2` (if tagged)
- **Commit:** Before global search implementation (~2026-01-07)

For the **current canonical implementation**, use this document (`docs/frontend/pagination.md`).

---

## Related Documentation

- **Global Search Plan:** `GLOBAL_SEARCH_PAGINATION_PLAN.md`
- **Pre-Flight Review:** `PRE_FLIGHT_REVIEW_GLOBAL_SEARCH.md`
- **Implementation Report:** `globalfinish.md`
- **Search Engine Core:** `frontend/src/app/core/search/README.md` (if exists)

---

## Future Enhancements

Potential improvements not currently implemented:

1. **Advanced Filtering:** Date ranges, multi-select role filters
2. **Sorting:** Client-specified sort column/direction
3. **Bulk Actions:** Select multiple items for batch operations
4. **Export:** CSV/Excel download of filtered results
5. **Persistent State:** URL query params for bookmarkable searches
6. **Infinite Scroll:** Alternative to traditional pagination
7. **Server-side Suggestions:** Global autocomplete across all pages

---

## Conclusion

This pagination pattern provides:

✅ **Scalability:** Server-side filtering handles large datasets efficiently
✅ **Accuracy:** Meta totals always reflect current filtered dataset
✅ **UX:** Debounced input, responsive layout, keyboard navigation
✅ **Reliability:** Race protection prevents stale data
✅ **Maintainability:** Reusable search engine, clean separation of concerns

**For questions or updates, contact the development team.**

---

**Document Canonical Location:** `docs/frontend/pagination.md`
**Reference Implementation:** Admin Users List (`/admin` → Users tab)
**Applies To:** All future admin list views (Orders, Activity Logs, etc.)
