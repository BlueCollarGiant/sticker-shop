# Night Reader — Portfolio Upgrade Guide

> Last updated: 2026-03-16
> Status: Active upgrade in progress

---

## What Night Reader Is

Night Reader is a full-stack bookstore and merchandise platform — books, stickers, and merch — built with Angular 20 on the frontend and Express.js on the backend. It uses flat-file JSON for persistence via a clean repository pattern, JWT auth, Zod validation, and Angular Signals for state management.

The project was originally scoped as a potential business product. It is now being reframed as a **portfolio-level system design demonstration** — a project that shows real architectural thinking, not just feature completeness.

## Why the Upgrade

The project already has meaningful architecture in place. What it lacks is execution completeness in three visible areas: the checkout is mock, there are no tests, and product search/pagination is entirely client-side. These three gaps are exactly what a hiring manager notices when they read through a portfolio project.

The goal is not to rebuild the project. The goal is to close the gaps that make it look unfinished.

## What the Technical Story Should Be When Finished

> "I built a full-stack e-commerce platform with a real payment loop, server-side search with pagination, and a notification system that computes its output as a stateless read-model projection instead of maintaining a separate notifications table. The architecture follows a layered service/repository pattern that is storage-agnostic by design. All critical paths are covered by tests."

That sentence should be true when this guide is complete. It is not true today.

---

## Current State Snapshot

### Already Strong

- **Notification projection system.** `order-projection.service.js` computes activity notifications as a pure function over order data. No notifications table, no dual-write, no stale records. Status-priority ranking with deterministic sort is a production-grade design decision.
- **Layered backend architecture.** Router → Controller → Service → Repository is correctly applied across every domain. No cross-domain leakage. Each domain is self-contained.
- **Backend-calculated cart totals.** `cart.service.js` calculates all pricing server-side. The frontend only renders what it receives. This prevents client-side price manipulation and is the correct security boundary.
- **Generic search engine factory.** `createSearchEngine<T>()` in `frontend/src/app/core/search/` is genuine reusable infrastructure — debounced, ranked, suggestion-aware, keyboard-navigable. Powers both product and admin user search with zero duplication.
- **Auth fundamentals are correct.** bcrypt with 10 rounds, JWT secret minimum length validation, CORS whitelist, role middleware that is composable and reused correctly.
- **User pagination is complete.** `GET /api/admin/users` supports `?page&limit&q` with AND-token search, sorted results, and proper meta response.

### Needs Improvement

- **Search is entirely client-side.** The search engine is sophisticated but it runs against an in-memory array in Angular. For the current seed data this is fine. As a system design demonstration, client-only search signals that you don't know how to write a backend query.
- **Product list has no pagination.** Users are paginated. Products are not. This inconsistency is immediately visible and does not have a good explanation.
- **Zero test coverage.** Not a single test file exists. This is the most impactful credibility gap for a portfolio project.
- **Auth token in localStorage.** XSS risk. Fine for a portfolio demo, but worth noting in README as a known tradeoff.

### Visible Gaps

- **Checkout is a mock.** `checkout.controller.js` returns a hardcoded string. No Stripe call, no real client secret, no payment confirmation. Every other feature in the system has a real implementation.
- **Payment and order creation are decoupled.** You can create an order (`POST /api/orders`) without any payment flow. These two operations need a relationship.
- **No stock decrement on order creation.** Adding 10 units of a stock-1 product to an order succeeds silently. No inventory check, no decrement, no restore on cancel.
- **No tests of any kind.** The OrderProjectionService is a pure function that would take 30 minutes to fully test. It is not tested.

---

## Upgrade Roadmap

---

### Phase 1: Real Checkout Loop

**Goal:** Replace the mock checkout controller with a real Stripe test-mode integration. Wire payment confirmation on the frontend. Create orders only after payment succeeds. Transition orders to `paid` status through the payment event.

**Why it matters:** This is the most visible gap in the entire project. Hiring managers read through checkout flows — it's a core feature of any e-commerce system. A hardcoded mock string signals that the developer avoided a hard problem. Completing this loop demonstrates real understanding of third-party API integration, async event handling, and the relationship between payment state and order state.

**What success looks like:**
- `POST /api/checkout/create-payment-intent` calls Stripe API in test mode and returns a real `clientSecret`
- Frontend confirms payment using Stripe.js (or Stripe Elements)
- On payment confirmation, `POST /api/orders` creates the order with status `paid`
- The activity feed reflects the new paid order on next poll
- Test card `4242 4242 4242 4242` completes a full checkout end to end

**Main backend files involved:**
- `backend/src/domain/checkout/checkout.controller.js`
- `backend/src/domain/checkout/checkout.router.js`
- `backend/src/domain/orders/order.service.js`
- `backend/src/domain/orders/order.router.js`
- `backend/.env`

**Main frontend files involved:**
- `frontend/src/app/components/checkout/checkout.ts`
- `frontend/src/app/components/checkout/checkout.html`
- `frontend/src/app/features/orders/order.store.ts`
- `frontend/src/app/features/orders/order.api.ts`
- `frontend/src/app/core/config/api.config.ts`

**Risks / common pitfalls:**
- Stripe.js must be loaded from the CDN (`https://js.stripe.com/v3/`) — do not bundle it. It must be present before `Stripe()` is called.
- The `clientSecret` is sensitive and should only come from the backend. Never generate it on the frontend.
- Stripe test webhooks require a running public endpoint or the Stripe CLI (`stripe listen`). For a portfolio project, skip the webhook and use the frontend confirmation callback (`stripe.confirmCardPayment`) to trigger order creation — this is simpler and still demonstrates the pattern.
- Do not set order status to `paid` before payment is confirmed client-side. The current architecture creates orders with status `pending` via `POST /api/orders` — keep this, but only call it after Stripe confirmation succeeds.
- Amount passed to Stripe must be in **cents** (integer), not dollars. `$15.98` → `1598`.

**Definition of done:**
- [ ] `npm install stripe` installed in backend
- [ ] `STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` added to `.env` (test keys only)
- [ ] `checkout.controller.js` calls `stripe.paymentIntents.create()` and returns real `clientSecret`
- [ ] Frontend loads Stripe.js and calls `stripe.confirmCardPayment(clientSecret)` after user submits
- [ ] On payment confirmation success, `order.store.ts` calls `createOrder()` with status `paid`
- [ ] Test card `4242 4242 4242 4242` completes without error in development
- [ ] Cart is cleared after successful order creation

---

### Phase 2: Server-Side Search and Pagination

**Goal:** Move product search and filtering to the backend. Add `?q`, `?page`, and `?limit` query params to `GET /api/products`. Build a lightweight in-memory index that refreshes on product mutations. Update the frontend to query the backend instead of filtering an in-memory array.

**Why it matters:** Client-side search on a full product list is not a system design pattern — it's a frontend workaround. For a project that claims production-style architecture, server-side search is table stakes. It also makes the product and user endpoints consistent: both will paginate the same way and both will support search server-side. This inconsistency currently stands out.

**What success looks like:**
- `GET /api/products?q=sticker&page=1&limit=12` returns 12 matched products and correct pagination metadata
- `GET /api/products` with no params returns page 1 of all products (same metadata shape as user endpoint)
- Product list component requests one page at a time
- Search input debounces and fires a backend request, not a client-side filter
- Results are consistent with the existing AND-token matching logic already used for user search

**Main backend files involved:**
- `backend/src/domain/products/product.service.js`
- `backend/src/domain/products/product.controller.js`
- `backend/src/domain/products/product.router.js`
- `backend/src/infra/file/file-product.repository.js`

**Main frontend files involved:**
- `frontend/src/app/features/products/product.store.ts`
- `frontend/src/app/features/products/product.api.ts`
- `frontend/src/app/core/config/api.config.ts`
- `frontend/src/app/core/search/search-engine.ts`

**Risks / common pitfalls:**
- The frontend search engine (`createSearchEngine<T>()`) runs against a signal of items. If you move search to the backend, the engine still handles debounce and suggestion UX — but the filtered results should come from the API, not the engine's internal filter. You have two options: (a) use the engine only for debounce/keyboard UX and discard its client-side filter, or (b) replace the engine in the product component with a simpler debounced input that fires API requests. Option (a) preserves the engine; option (b) is cleaner. Either works — just don't let the engine filter the full array while also firing a backend request or you will get conflicting results.
- The file-based repository loads the entire `products.json` on every read. For search, this is unavoidable given the storage layer. Build the search filter directly in the repository method (following the pattern already used in `file-auth.repository.js` for users). Do not add a separate index layer — that would be premature for this persistence model.
- Pagination metadata shape: match the user endpoint exactly — `{ page, limit, total, totalPages }` in a `meta` key. Consistency matters when reviewers are reading your API responses.
- The frontend product store currently holds all products in memory via `products = signal<Product[]>([])`. After this change, the store should hold only the current page. Update computed signals (`bestsellers`, `newProducts`) accordingly — or accept that these derived views only reflect the current page, which is a reasonable tradeoff to document.

**Definition of done:**
- [ ] `file-product.repository.js` has `getPage(page, limit, query?)` method matching the pattern in `file-auth.repository.js`
- [ ] `file-product.repository.js` has `getCount(query?)` method
- [ ] `product.service.js` delegates to new repo methods
- [ ] `product.controller.js` reads `?q`, `?page`, `?limit` from query params with sane defaults (page=1, limit=12, max=100)
- [ ] Response shape includes `{ success, data: Product[], meta: { page, limit, total, totalPages } }`
- [ ] `product.api.ts` passes query params to `GET /api/products`
- [ ] `product.store.ts` requests pages and stores current page results
- [ ] Product list component shows pagination controls
- [ ] Search input fires backend request (not client-side filter)
- [ ] `GET /api/products` with no params returns page 1, 12 items

---

### Phase 3: Test Coverage and Reliability

**Goal:** Add meaningful test coverage to the three highest-risk areas: `OrderProjectionService` (pure function, no excuses), `CartService.calculateTotals()` (business math, easy to regress), and the checkout controller (requires mock of Stripe dependency after Phase 1).

**Why it matters:** Zero tests on a portfolio project signals to any senior engineer reviewing your work that the system is not trusted by the person who built it. You do not need 100% coverage. You need to show that you know what to test, why, and how. A well-targeted test suite on the hardest business logic is more impressive than shallow tests on every file.

**What success looks like:**
- `OrderProjectionService.projectRecentActivity()` is fully unit tested — all status priority cases, recency tie-breaking, 3-item limit
- `CartService.calculateTotals()` is unit tested — free shipping threshold, tax calculation, rounding
- `checkout.controller.js` is tested with a mocked Stripe client — verifies the real API is called and the response is correctly shaped
- Tests run via `npm test` with no manual setup required
- All tests pass against the existing seed data and expected behavior

**Main backend files involved:**
- `backend/src/domain/orders/order-projection.service.js` ← primary target
- `backend/src/domain/cart/cart.service.js`
- `backend/src/domain/checkout/checkout.controller.js`
- `backend/src/domain/products/product.service.js` (after Phase 2 changes)

**Main frontend files involved:**
- `frontend/src/app/core/search/search-filters.util.ts`
- `frontend/src/app/core/search/search-rank.util.ts`
- `frontend/src/app/core/search/search-tokenize.util.ts`

**Risks / common pitfalls:**
- Jest is the right choice for the backend. Install `jest` and configure it in `backend/package.json`. The backend is CommonJS, so no transform is needed.
- Do not write tests that hit the JSON files directly. Use dependency injection or module mocking to isolate the service layer from the repository layer. The services are already structured for this — they receive repository instances, not file paths.
- For `OrderProjectionService`, you do not need to mock anything. It is a pure function that takes an array of order objects and returns a sorted array of notifications. Feed it constructed test data and assert on the output. This is the easiest win in the whole test suite.
- Frontend utilities (`search-filters.util.ts`, `search-rank.util.ts`, `search-tokenize.util.ts`) are also pure functions. They can be tested with Jest or Jasmine with no Angular setup needed.
- Do not test Angular components in Phase 3. Component testing requires TestBed setup and provides minimal portfolio signal compared to service/utility testing. Save it for Phase 4 or skip it.
- Do not aim for 100% coverage. Aim for coverage of every distinct code path in the projection and totals logic.

**Definition of done:**
- [ ] Jest installed and configured in `backend/package.json`
- [ ] `backend/src/domain/orders/order-projection.service.test.js` exists and passes
  - [ ] Tests all 7 status priority rankings
  - [ ] Tests that top 3 are returned when more than 3 orders exist
  - [ ] Tests recency tie-breaking (updatedAt vs createdAt depending on status)
  - [ ] Tests deterministic sort when priority and recency are identical
  - [ ] Tests empty array input
  - [ ] Tests single order input
- [ ] `backend/src/domain/cart/cart.service.test.js` exists and passes
  - [ ] Free shipping threshold ($50 boundary, exact and above)
  - [ ] Tax calculation (8% on subtotal)
  - [ ] Total = subtotal + shipping + tax
  - [ ] itemCount is sum of quantities, not number of line items
  - [ ] Zero-item cart returns all zeros
- [ ] `backend/src/domain/checkout/checkout.controller.test.js` exists and passes with mocked Stripe (Phase 1 must be done first)
- [ ] Frontend search utility tests in at least one `.spec.ts` file
- [ ] `npm test` runs all backend tests without manual steps

---

### Phase 4: Optional Portfolio Polish

**Goal:** Incremental improvements that raise the overall impression without restructuring anything. These are lower priority than Phases 1–3 but worth doing if time allows.

**Why it matters:** Once the three core gaps are closed, the project is already competitive. These additions round it out and show attention to detail.

**Items in this phase (pick any):**

- **Stock decrement on order creation.** In `order.service.js`, before writing the order, validate stock for each line item. On success, decrement stock. On cancel, restore stock. This closes the most glaring product logic gap. Note the race condition that file-based storage cannot solve atomically — document it as a known limitation with the PostgreSQL solution described.
- **README upgrade.** Rewrite `README.md` to lead with architecture decisions, not setup steps. Show the data flow diagram. Explain the notification projection pattern. Add a "Design Decisions" section. This is often the first thing a recruiter reads.
- **Repository interface stubs.** Add a `[domain].repository.interface.js` file in each domain that defines the method contracts. File repositories reference these. This makes the swap-readiness claim explicit instead of implicit.
- **Consistent product badge flags.** Remove the boolean flag fields (`isNew`, `isBestseller`, etc.) from the product model and derive them from the `badges` array at read time. This eliminates the denormalization. It requires updating the repository's `toggleBadge()` method and the frontend's product type definition.
- **Error boundary in checkout.** The frontend checkout component should handle Stripe confirmation errors gracefully — card declined, insufficient funds, invalid card — and display user-facing messages. Currently any Stripe error likely produces a blank failure state.

---

## Detailed Task Breakdown

---

### Phase 1 Tasks: Real Checkout Loop

#### Task 1.1 — Audit the current checkout flow end to end

**Purpose:** Understand exactly what exists before touching anything.

**What to inspect first:**
- `backend/src/domain/checkout/checkout.controller.js` — read the full file
- `backend/src/domain/checkout/checkout.router.js` — note the route and middleware
- `frontend/src/app/components/checkout/checkout.ts` — how the frontend currently calls the endpoint
- `frontend/src/app/features/orders/order.store.ts` — how `createOrder()` is currently called and when

**What to map:**
- What does the frontend currently do after calling `create-payment-intent`?
- Does `createOrder()` wait for payment, or is it called independently?
- What order status does the frontend pass when creating an order?

**Expected result:** A clear picture of what needs to change. The checkout controller is likely the entire mock — all the work is additive from this point.

**Portfolio value:** None yet — this is research.

---

#### Task 1.2 — Install and configure Stripe on the backend

**Purpose:** Get the Stripe SDK available without breaking anything.

**What to change:**
- `cd backend && npm install stripe`
- Add to `backend/.env`: `STRIPE_SECRET_KEY=sk_test_...` (get from Stripe dashboard → Developers → API keys)
- Add to `backend/src/config/env.js`: export `STRIPE_SECRET_KEY` with validation (non-empty string)
- Do not commit the `.env` file. Verify it is in `.gitignore`.

**Expected result:** `require('stripe')(process.env.STRIPE_SECRET_KEY)` works without error in the backend.

**Portfolio value:** Demonstrates you know how to manage third-party API credentials safely.

---

#### Task 1.3 — Replace the mock payment intent with a real Stripe call

**Purpose:** `POST /api/checkout/create-payment-intent` should return a real `clientSecret`.

**What to change in `checkout.controller.js`:**
- Remove the hardcoded mock response
- Instantiate Stripe: `const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)`
- Call `stripe.paymentIntents.create({ amount, currency: 'usd' })` — amount must be in cents (multiply dollars × 100, round to integer)
- Return `{ success: true, data: { clientSecret: intent.client_secret, paymentIntentId: intent.id } }`
- Wrap in try/catch — if Stripe throws, return `{ success: false, message: error.message }` with status 502

**Validation:** The existing Zod validator already requires `amount` and `currency`. Verify `amount` is validated as a positive number. If it accepts decimals, convert to cents inside the controller before passing to Stripe.

**Expected result:** Calling the endpoint with `{ amount: 15.98 }` returns a real `clientSecret` string starting with `pi_test_...`.

**Portfolio value:** The most important single change in the whole upgrade.

---

#### Task 1.4 — Load Stripe.js on the frontend and wire payment confirmation

**Purpose:** The frontend needs to confirm the payment using the `clientSecret` from the backend.

**What to change in `frontend/src/app/components/checkout/checkout.html`:**
- Add Stripe.js script tag to `frontend/src/index.html`: `<script src="https://js.stripe.com/v3/"></script>`
- In `checkout.ts`, declare `declare const Stripe: any` at the top (or use `@types/stripe-js` if installed)
- After calling `create-payment-intent` and receiving `clientSecret`, instantiate: `const stripe = Stripe(environment.stripePublishableKey)`
- Call `stripe.confirmCardPayment(clientSecret, { payment_method: { card: cardElement } })` — or use a simple test-mode approach with a hardcoded test card for initial testing

**Simplest test-mode approach (no Stripe Elements UI required):**
```typescript
const result = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: { token: 'tok_visa' }  // Stripe test token, always succeeds
  }
})
```
This avoids building a card input UI and still exercises the real confirmation flow.

**Expected result:** `result.paymentIntent.status === 'succeeded'` for the test token.

**Portfolio value:** Demonstrates you know the two-step Stripe flow (intent creation → confirmation).

---

#### Task 1.5 — Create order only after payment confirmation succeeds

**Purpose:** Decouple order creation from checkout initiation. Order should be created with status `paid` after real payment confirmation.

**What to change in `checkout.ts`:**
- On `result.paymentIntent.status === 'succeeded'`:
  - Call `orderStore.createOrder({ items: cart.items, total: cart.totals.total, status: 'paid' })`
  - On order creation success: call `cartStore.clearCart()`
  - Navigate to `/dashboard/orders` or a success route

**What to change in `order.service.js`:**
- If the current service always defaults new orders to `pending`, update to accept `status` as an optional parameter with `pending` as the default — so checkout can pass `paid` explicitly

**Expected result:** A complete checkout creates a `paid` order, clears the cart, and the activity feed shows the paid order on next load.

**Portfolio value:** Closes the loop between payment, order state, and notification system. All three features work together for the first time.

---

#### Task 1.6 — Add the publishable key to the frontend environment

**Purpose:** The frontend needs the Stripe publishable key to instantiate `Stripe()`.

**What to change:**
- `frontend/src/environments/environment.ts`: add `stripePublishableKey: 'pk_test_...'`
- `frontend/src/environments/environment.prod.ts`: add the same key (or empty string with a comment)
- Reference it in `checkout.ts` as `environment.stripePublishableKey`

**Note:** The publishable key is safe to commit. It is not a secret. Only the secret key (backend only) must be kept out of source control.

**Expected result:** No hardcoded key strings anywhere in frontend code.

---

### Phase 2 Tasks: Server-Side Search and Pagination

#### Task 2.1 — Audit the current product list endpoint and client-side filter

**Purpose:** Understand what changes and what stays the same.

**What to inspect:**
- `backend/src/domain/products/product.controller.js` — what does `getAllProducts()` currently return?
- `backend/src/infra/file/file-product.repository.js` — what does `getAll()` return? Does it already have pagination structure?
- `backend/src/infra/file/file-auth.repository.js` — read the full `getUsersPage()` and `getUserCount()` methods. This is the pattern you are copying.
- `frontend/src/app/features/products/product.store.ts` — how does `loadAllProducts()` work today? What signal holds the results?
- `frontend/src/app/core/search/search-engine.ts` — how does `createSearchEngine()` receive its data? Is it a signal?

**Expected result:** A clear understanding of the diff between what exists and what needs to change.

---

#### Task 2.2 — Add `getPage()` and `getCount()` to `file-product.repository.js`

**Purpose:** Add server-side filtering and pagination at the data layer.

**What to change in `file-product.repository.js`:**
- Add `getPage(page, limit, query)` — mirrors `getUsersPage()` in `file-auth.repository.js` exactly
  - Tokenize `query` by whitespace
  - Filter products where ALL tokens match at least one of: `title`, `description`, `category`, `collection`, `tags` (join tags array as string before matching)
  - Sort by `createdAt` descending
  - Return `products.slice((page - 1) * limit, page * limit)`
- Add `getCount(query)` — returns filtered or total count
- Keep `getAll()` as-is — it may still be used by admin bulk operations or seeding

**Expected result:** `repository.getPage(1, 12, 'sticker')` returns at most 12 products matching 'sticker'.

---

#### Task 2.3 — Update `product.service.js` and `product.controller.js`

**Purpose:** Wire the new repository methods into the service and expose them via the controller.

**What to change in `product.service.js`:**
- Add `getProductsPage(page, limit, query)` → calls `repo.getPage()` and `repo.getCount()`, returns `{ products, total }`

**What to change in `product.controller.js`:**
- Update `getAllProducts()` to read `req.query.q`, `req.query.page`, `req.query.limit`
- Apply defaults: `page = 1`, `limit = 12`, `maxLimit = 100`
- Call `ProductService.getProductsPage(page, limit, query)`
- Return: `{ success: true, data: products, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }`

**Expected result:** `GET /api/products?page=1&limit=12` returns 12 products and correct meta. `GET /api/products?q=book` returns only matching products.

---

#### Task 2.4 — Update `product.api.ts` to pass query params

**Purpose:** The frontend API layer needs to forward search and pagination params.

**What to change in `frontend/src/app/features/products/product.api.ts`:**
- Update `getAllProducts()` to accept optional `{ q?, page?, limit? }` params
- Pass them as `HttpParams` to the GET request

**What to change in `frontend/src/app/core/config/api.config.ts`:**
- Verify the `PRODUCTS.LIST` endpoint is just the base path. Query params will be appended dynamically — no change needed to the config if it's a plain URL string.

**Expected result:** `productApi.getAllProducts({ q: 'sticker', page: 1, limit: 12 })` fires a correctly parameterized GET request.

---

#### Task 2.5 — Update `product.store.ts` to request pages and handle search server-side

**Purpose:** The store should hold only the current page and trigger backend requests for search and navigation.

**What to change in `frontend/src/app/features/products/product.store.ts`:**
- Add signals: `currentPage = signal(1)`, `pageSize = signal(12)`, `searchQuery = signal('')`, `totalProducts = signal(0)`, `totalPages = signal(0)`
- Update `loadAllProducts()` to accept `{ q?, page?, limit? }` and pass them to the API
- On response, update `products` signal with current page results, and update `totalProducts`/`totalPages` from meta
- Add `setPage(page)` method that updates `currentPage` and calls `loadAllProducts()`
- Add `setSearch(query)` method that resets `currentPage` to 1, updates `searchQuery`, and calls `loadAllProducts()`

**What to remove or scope:**
- `bestsellers` and `newProducts` computed signals currently filter all products. After pagination, they will only reflect the current page. This is acceptable — document it as a tradeoff. Alternatively, add separate `loadFeatured()` calls that always fetch `?badge=new` or `?badge=bestseller` without pagination. This is a stretch — skip it for now.

**Expected result:** Product list loads 12 items on init. Typing in search fires a backend request. Pagination controls change pages.

---

#### Task 2.6 — Update the product list component to show pagination controls

**Purpose:** The UI needs to expose page navigation.

**What to change in the product list component:**
- Display `productStore.totalProducts()` count
- Add Previous / Next buttons that call `productStore.setPage()`
- Disable Previous on page 1, disable Next on last page
- Wire search input to call `productStore.setSearch(query)` (with debounce — the existing search engine handles this, or use a simple `debounceTime` RxJS operator on the input)

**Expected result:** A paginated, server-driven product list with working search. Visually matches the existing admin user list behavior.

---

### Phase 3 Tasks: Test Coverage

#### Task 3.1 — Install and configure Jest on the backend

**Purpose:** Get a working test runner before writing any tests.

**What to change in `backend/package.json`:**
```json
"devDependencies": {
  "jest": "^29.0.0"
},
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch"
},
"jest": {
  "testEnvironment": "node",
  "testMatch": ["**/*.test.js"]
}
```

**Run `npm install` in backend.**

**Verify:** `npm test` runs without error (zero tests at first is fine — "no tests found" is an expected first output).

---

#### Task 3.2 — Write unit tests for `order-projection.service.js`

**Purpose:** This is a pure function. It should be the first and most thorough test in the project.

**File:** `backend/src/domain/orders/order-projection.service.test.js`

**What to test — write one `describe` block per concern:**

`describe('status priority ranking')`
- Pending order ranks above paid order
- Failed order ranks above cancelled order
- Delivered order ranks last
- Two orders with different statuses return the higher-priority one first

`describe('top 3 limit')`
- 7 orders returns exactly 3 notifications
- 2 orders returns exactly 2 notifications
- 0 orders returns empty array

`describe('recency tie-breaking')`
- Two pending orders: the one with the later `createdAt` comes first
- Two shipped orders: the one with the later `updatedAt` comes first
- One pending order uses `createdAt`, one shipped order uses `updatedAt` — verify the correct field is used for each

`describe('deterministic sort')`
- Two orders with identical status, identical timestamps: sorted by orderId descending

`describe('notification shape')`
- Output contains `orderId`, `status`, `orderNumber`, `createdAt`, `updatedAt`, `isTerminal`
- Terminal statuses (`delivered`, `cancelled`, `failed`) set `isTerminal: true`
- Non-terminal statuses set `isTerminal: false`

**Test data pattern:** Build minimal order objects inline — only include the fields the projection service reads. No need to match the full order schema.

**Expected result:** ~15–20 test cases, all passing. Full branch coverage of the projection logic.

**Portfolio value:** This single test file demonstrates more backend testing judgment than most junior/mid portfolios show.

---

#### Task 3.3 — Write unit tests for `cart.service.js`

**Purpose:** Cart total calculation is business math. It should be verified.

**File:** `backend/src/domain/cart/cart.service.test.js`

**What to test:**

`describe('calculateTotals')`
- Empty cart: subtotal=0, shipping=0, tax=0, total=0, itemCount=0
- Single item: subtotal=price×qty, shipping=$5.99 (below threshold), tax=subtotal×0.08
- Subtotal exactly $50: shipping=$0 (free shipping at threshold)
- Subtotal $49.99: shipping=$5.99
- Subtotal $50.01: shipping=$0
- Two items: itemCount = sum of quantities (not count of items)
- Rounding: price=3.333, qty=3 → subtotal=9.999 → rounds to cents

**Note:** `CartService.calculateTotals()` may take a cart object or an items array. Read the current signature before writing the tests.

---

#### Task 3.4 — Write unit tests for frontend search utilities

**Purpose:** The search utilities are pure TypeScript functions. They can be tested with Jest or Jasmine without Angular.

**Files to test:**
- `frontend/src/app/core/search/search-tokenize.util.ts` — `tokenize()` function
- `frontend/src/app/core/search/search-rank.util.ts` — `rankItems()` function
- `frontend/src/app/core/search/search-filters.util.ts` — `matchesQuery()`, `filterAndRank()`

**What to test:**

`tokenize()`
- `'hello world'` → `['hello', 'world']`
- `'  hello  '` (extra whitespace) → `['hello']`
- `'HELLO'` → `['hello']` (lowercased)
- `''` → `[]`

`matchesQuery()`
- Single token that matches one field → true
- Single token that matches no field → false
- Two tokens where both match → true
- Two tokens where only one matches → false (AND logic)

`rankItems()`
- Exact match ranks above word boundary match
- Word boundary match ranks above substring match
- Items with no match return score 0

**Run these with:** Add a `jest.config.ts` or `package.json` Jest config to the frontend with `preset: 'jest-preset-angular'`, or simply use a standalone `jest.config.js` that transforms TypeScript with `ts-jest` and excludes Angular dependencies. Alternatively, run them in the backend test setup by copying the pure utility functions — they have no Angular dependencies.

**Simplest path:** Run frontend utility tests in a separate `tests/` folder at the root with `ts-jest`. No Angular TestBed needed.

---

## Architecture Notes to Preserve

These are the design decisions that make Night Reader technically interesting. Do not accidentally undo them during the upgrade.

### 1. Stateless notification projection

`order-projection.service.js` is a pure function. It takes orders and returns notifications. It reads nothing from disk, writes nothing, and holds no state. **Do not add persistence to it.** When you add tests in Phase 3, this is why they are easy — there is nothing to mock.

When Stripe adds `paid` orders to the system in Phase 1, the notification feed will automatically start surfacing them. You do not need to touch the notification system at all. That is the point.

### 2. Backend-calculated cart totals

`cart.service.js` calculates subtotal, shipping, tax, and total server-side. The frontend renders what it receives. **Do not move any pricing logic to the frontend.** When you wire the checkout in Phase 1, the `total` you send to Stripe should come from the cart response (`cart.totals.total`), not from a client-side calculation.

### 3. Controller / Service / Repository separation

Each domain has a controller that handles HTTP, a service that handles business logic, and a repository that handles persistence. Keep this separation during the upgrade.
- In Phase 1: the Stripe call belongs in `checkout.controller.js` (it's I/O), not in a service — unless you want to make Stripe mockable for tests, in which case wrap it in `checkout.service.js`. Both are defensible.
- In Phase 2: the search filter logic belongs in the repository (where the data lives), not in the service or controller.

Never put file I/O in a controller. Never put request parsing in a service.

### 4. Generic search engine factory

`createSearchEngine<T>()` is domain-agnostic. It does not know about products or users. **Do not modify the engine to add product-specific logic.** In Phase 2, the engine's client-side filter will no longer drive product search results — but the engine can still handle debounce and suggestion UX by operating on the last page of results. The engine stays generic; the store changes how it uses the engine.

### 5. Domain isolation

No service reaches into another domain's repository. `OrderService` does not read from `file-product.repository.js`. If Phase 4 stock decrement is implemented, the correct path is `OrderService` → `ProductService.decrementStock()` (service-to-service via dependency injection), not `OrderService` directly importing the product repository.

### 6. Zod validation at the boundary

All input validation happens at the route level via the `validate.js` middleware before the controller is invoked. When you add new request shapes in Phase 1 or Phase 2, add a Zod schema for them. Do not validate inside the controller with manual `if` checks.

---

## Recommended Build Order

Follow this sequence. Each step is a stable resting point — you can stop between them without breaking the project.

1. **Read `checkout.controller.js`, `checkout.router.js`, and `checkout.ts` in full.** Do not change anything yet. Understand the current shape completely.

2. **Install Stripe backend package and add env keys.** Verify env config works. Commit this independently.

3. **Replace mock payment intent with real Stripe call.** Test with curl or Postman against the backend alone before touching the frontend. Confirm you get a real `clientSecret` back.

4. **Wire Stripe.js on the frontend and test the confirmation flow with `tok_visa`.** Do not wire order creation yet. Just confirm `paymentIntent.status === 'succeeded'` works.

5. **Connect payment confirmation to order creation.** After confirmation succeeds, create the order with `paid` status and clear the cart.

6. **Smoke test the full loop:** add items to cart → checkout → pay with test card → confirm order appears in dashboard with status `paid` → confirm activity feed shows it.

7. **Install Jest on the backend and configure it.** Do not write any tests yet. Just confirm `npm test` runs.

8. **Write `order-projection.service.test.js` first.** This is the highest value, lowest effort test in the project.

9. **Write `cart.service.test.js`.** This is the second test.

10. **Read `file-product.repository.js` and `file-auth.repository.js` side by side.** Understand the user pagination pattern before replicating it for products.

11. **Add `getPage()` and `getCount()` to `file-product.repository.js`.** Test these manually against the existing seed data via curl before touching the service layer.

12. **Update `product.service.js` and `product.controller.js`.** Test the new endpoint with curl for several query/page combinations.

13. **Update `product.api.ts` and `product.store.ts`.** Wire pagination signals. Test in the browser with the network tab open to confirm requests are correctly parameterized.

14. **Add pagination UI to the product list component.** This is the last frontend change for Phase 2.

15. **Write search utility tests** (Phase 3 frontend utilities). These are fast to write and add visible credibility.

16. **Write Phase 4 polish items** in any order, or skip.

**Do not start Phase 2 while Phase 1 is half-done.** Each phase should be fully working before the next begins.

---

## Testing Strategy

### What to test first

`order-projection.service.js`. It is a pure function with no dependencies, no I/O, and non-trivial branching logic (7 status values, 2 recency fields, deterministic sort). If the projection is wrong, the notification feed is wrong. Test this first, test it completely.

### What can be tested with unit tests

| Target | Type | Why |
|---|---|---|
| `order-projection.service.js` | Pure unit | No dependencies at all |
| `cart.service.js` `calculateTotals()` | Unit with mock repo | Math logic, no I/O |
| `search-tokenize.util.ts` | Pure unit | String utility |
| `search-rank.util.ts` | Pure unit | Ranking algorithm |
| `search-filters.util.ts` | Pure unit | Filter/sort logic |
| `checkout.controller.js` | Unit with mock Stripe | After Phase 1 |
| `product.service.js` `getProductsPage()` | Unit with mock repo | After Phase 2 |

### What should be tested manually

| Scenario | Why manual |
|---|---|
| Full Stripe checkout with test card | Requires real Stripe SDK and test keys |
| Cart guest/user transition | Requires session state |
| Admin role middleware protection | Requires full middleware stack |
| Pagination at boundary pages (last page, empty page) | UI state edge cases |
| Activity feed reflects status change | Requires multiple requests in sequence |

### What counts as enough testing for a portfolio project

- Full unit test coverage on `order-projection.service.js` (every status, every branch)
- Unit tests on `calculateTotals()` covering the free shipping threshold and rounding
- At least one test file on the frontend search utilities
- A passing `npm test` output you can screenshot for the README

You do not need integration tests. You do not need E2E tests. You do not need component tests. The goal is to show you know what deserves unit tests and that you write them with real assertions, not just happy-path checks.

### Highest risk if left untested

1. **`order-projection.service.js`** — Incorrect priority ranking or recency logic produces a wrong activity feed. This is a core feature. It is a pure function. There is no excuse to leave it untested.
2. **`cart.service.js` totals** — Off-by-one on the free shipping threshold or rounding error on tax would mean wrong totals sent to Stripe. This is a real money bug.
3. **Phase 2 search filter** — AND-token logic is easy to invert accidentally. A single wrong boolean produces either no results or wrong results. Test the boundary between one-token match and two-token AND match.

---

## Portfolio Framing Notes

### Strongest technical talking points

These are the things worth mentioning in interviews or README descriptions:

1. **Notification system as a read-side projection.** "Rather than maintaining a notifications table with dual-write concerns, the activity feed is computed on demand as a stateless projection from order state. Any status change is immediately reflected without a separate write path or stale data problem."

2. **Generic search engine factory.** "The search infrastructure is a typed factory function that accepts any signal-backed dataset and a field configuration. It powers both the product catalog search and the admin user search without any domain-specific code inside the engine itself."

3. **Repository pattern for persistence portability.** "The business logic layer has no awareness of the persistence mechanism. Swapping from flat-file storage to PostgreSQL requires replacing four repository files. The service layer, controllers, and routes are unchanged."

4. **Backend-calculated cart totals.** "All pricing logic runs server-side. The frontend receives and renders pre-calculated totals. This prevents client-side manipulation and means the amount sent to Stripe always comes from a trusted source."

### What hiring managers will likely notice

- Whether the checkout is real or mock — **this is the first thing a backend-focused engineer checks**
- Whether there are any tests — **zero tests on a "production-style" project is a yellow flag**
- The notification system design — **this is the thing that will impress a senior engineer if they read the code**
- Whether pagination is consistent across endpoints — **inconsistency signals incomplete thinking**

### How to describe the search system

> "I built a generic search factory as a core infrastructure piece rather than inline component logic. It handles debouncing, multi-field AND-token matching, ranking by match quality, suggestion generation, and keyboard navigation — all as composable utilities. The same factory powers the public product search and the admin user search. After adding server-side pagination, the engine's client-side filter was replaced with a debounced API call, but the keyboard navigation and suggestion UX were preserved."

### How to describe the notification system

> "Most implementations store notifications in a table and write to it on every status change. The problem is stale data — what happens when you update order status but the notification write fails? I avoided this by computing notifications as a read-side projection from order history. The projection function takes an array of orders, applies a priority ranking by status and recency, and returns the top three. Any status change is automatically reflected on next request. There's nothing to go out of sync."

### How to describe the checkout upgrade

> "The original checkout was a mock controller that returned a hardcoded string. I replaced it with a real Stripe test-mode integration: the backend creates a payment intent and returns a client secret, the frontend confirms the payment using Stripe.js, and only on confirmed success does the order get created with `paid` status. The full payment lifecycle — intent creation, confirmation, and order state transition — works end to end with Stripe test cards."

### How to describe the project honestly without overselling

- "It uses flat-file JSON for persistence — intentionally, to demonstrate that the architecture is storage-agnostic. The repository pattern means swapping to a real database is isolated to the data layer."
- "Test coverage targets the highest-risk business logic: the order projection algorithm and cart total calculation. E2E and component tests are out of scope for a portfolio project."
- "The search engine is overbuilt for the current dataset size, which is intentional — it demonstrates the ability to build reusable infrastructure rather than one-off solutions."
- Do not say "production-ready." Say "production-shaped." The distinction is honest and defensible.

---

## Stretch Goals

These are lower priority than Phases 1–3. Do them only if the core upgrades are complete and you want to push further.

---

**S1. Stock decrement and restore on cancel**

In `order.service.js`, validate stock for each line item before writing the order. Decrement on creation, restore on cancel. Note the race condition (file-based writes are not atomic) in a comment — and describe how a database transaction would solve it. This shows you understand the consistency problem even when you cannot fully solve it with the current storage layer.

---

**S2. Server-Sent Events for real-time notification push**

Add `GET /api/orders/user/activity/stream` using Node.js SSE (`Content-Type: text/event-stream`). When an admin updates order status, emit an event to the connected user's SSE stream. Frontend subscribes with `EventSource`. Keep the existing projection endpoint for initial load. This upgrades the notification system from "smart read model" to "real-time event system."

---

**S3. Repository interface contracts**

Add a `[domain].repository.interface.js` in each domain that defines the method signatures as JSDoc types (or migrate the backend to TypeScript and use actual interfaces). File repositories reference these. This makes the swap-readiness claim explicit and enables proper mocking in tests.

---

**S4. README architecture documentation**

Rewrite the README to lead with the technical story, not setup instructions. Include the data flow diagram, a Design Decisions section covering the notification projection and search factory, and a section on known limitations (file storage race conditions, no refresh tokens, no real-time push in base version). This is the most visible surface of the project for anyone who visits the repository.

---

**S5. Auth hardening**

Move the JWT from localStorage to an HttpOnly cookie. Add a refresh token mechanism with a separate `/api/auth/refresh` endpoint. Implement token revocation via a server-side deny list. Note: these changes have significant frontend impact (no more `Authorization: Bearer` header management in the store) and require careful migration. Do not attempt this unless Phase 1–3 are fully complete.

---

**S6. Remove redundant product badge boolean flags**

`isNew`, `isBestseller`, `isLimitedEdition`, `isSale` are always derivable from the `badges` array. Remove these fields from the data model and derive them at read time in the repository. This eliminates a source of write inconsistency and simplifies the product schema. Impact: update `file-product.repository.js` `toggleBadge()`, update `product.types.ts` on the frontend, and update any component that reads the boolean flags directly.

---

*This guide reflects the current state of the codebase as of 2026-03-16. Re-assess after each phase is complete.*
