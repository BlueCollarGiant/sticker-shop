# Admin User Search Filtering

## Current behavior
- Location: `frontend/src/app/components/admin/admin-panel/admin-panel.ts` (`filteredUsers` + `userSearchQuery`), template in `frontend/src/app/components/admin/admin-panel/admin-panel.html`.
- Data source: `AdminService.getAllUsers()` (client-side array). No pagination or server-side query for users.
- Filtering: case-insensitive substring match on `name` **or** `email`. Any character match (e.g., typing `s` will return Kate Thomas).
- No debounce; every keystroke re-runs the in-memory filter. No ranked ordering—original array order is preserved.

## Limitations of the current approach
- Extremely permissive substring match makes broad queries (single letters) noisy.
- Large user lists would require pagination or server-side filtering to avoid pulling everything to the client.
- No weighting or ranking; “closest” matches do not float to the top.
- No field-level filters (role/admin-only, createdAt ranges, etc.).

## Patterns to consider
1) **Prefix / word-start match**  
   - Match only tokens that start with the query (e.g., `^query` on name/email words). Reduces noise for single letters.

2) **Tokenized AND matching**  
   - Split the query by spaces; require every token to match some field. Example: `kate t` must match both “kate” and “t(homas)”.

3) **Fuzzy scoring**  
   - Use a lightweight fuzzy scorer (client: Fuse.js; server: postgres trigram or Elasticsearch-like scoring) and sort by score. Configure fields and weights (e.g., name > email).

4) **Server-side search with pagination**  
   - Endpoint: `GET /api/admin/users?q=...&page=1&limit=20&role=...`.
   - Benefits: scales, enables sorting (score, createdAt), allows auth-aware constraints on the backend.

5) **Fielded filters**  
   - Add chips/dropdowns for Role, Created date range, Has orders, etc., and combine with text search.

## Autofill / suggestions ideas
- **Inline suggestions**: derive a `suggestions` list from the current in-memory results (e.g., top 5 names/emails) and render a dropdown beneath the input. Clicking a suggestion sets `userSearchQuery`.
- **Datalist fallback**: wrap the input with a `<datalist>` bound to suggestions for a native feel (minimal code, lower control).
- **Debounced server suggestions** (if server search is added): when `q.length >= 2`, call `/api/admin/users?q=...&limit=5` with a debounce (e.g., 200–300 ms) to populate the dropdown.
- **Keyboard support**: up/down/enter to navigate the suggestions; highlight the active option.
- **Highlighting**: bold the matching substring in the suggestion list to show why a result appeared.

## Suggested incremental path
1) Change filter to tokenized word-start match to cut noise from single letters.  
2) Add a small suggestions dropdown (top 5 matches) driven by `filteredUsers()`; wire click-to-fill.  
3) If the user base grows, introduce server-side `/api/admin/users?q=...&page=...&limit=...` and use it for both the list and suggestions.  
4) Add optional field filters (role/admin) and sort (e.g., createdAt desc) once server search exists.
