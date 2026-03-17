# Night Reader — Portfolio Architecture Report

> Reviewed: 2026-03-16
> Stack: Angular 20 · Express.js · JSON File Storage · JWT · Signals
> Reviewer perspective: Senior full-stack architect, portfolio assessment

---

## STEP 1: SYSTEM UNDERSTANDING

### Overall Architecture

Night Reader is a monorepo containing two independent runtimes:

```
sticker-shop/
├── backend/     Express.js REST API (Node.js, CommonJS)
└── frontend/    Angular 20 SPA (standalone, zoneless, signals)
```

The backend follows a **layered architecture**: Router → Controller → Service → Repository. Every domain (auth, products, cart, orders, checkout, admin) is self-contained with its own router, controller, service, and file-based repository.

The frontend uses **feature-based store architecture**: each feature owns a `.store.ts` (state + logic), `.api.ts` (HTTP only), and `.types.ts` (shared interfaces). State is managed via Angular Signals with no third-party state library.

Persistence is flat-file JSON. There is no database server — all data lives in four files: `users.json`, `products.json`, `orders.json`, `carts.json`.

### Data Flow

```
User Action
  → Angular Component
    → Feature Store (signals)
      → API Layer (HttpClient)
        → Express Router
          → Controller (req/res)
            → Service (business logic)
              → Repository (file read/write)
                → JSON file on disk
                  ← response envelope { success, data }
              ← serialized
            ← formatted response
          ← HTTP response
        ← resolved promise
      ← store signals updated
    ← component re-renders
```

Cart totals are always calculated on the backend. The frontend receives pre-calculated totals and renders them — no client-side business logic for pricing.

### Key Patterns

| Layer | Pattern |
|---|---|
| Backend routing | Express Router, domain-grouped |
| Backend logic | Service layer (stateless functions) |
| Backend persistence | Repository pattern (file-based) |
| Frontend state | Angular Signals (signal, computed, effect) |
| Frontend HTTP | Thin API classes, no state logic |
| Input validation | Zod schemas on backend |
| Auth | JWT stateless, bcrypt password hashing |
| Search | Custom factory-based engine (debounce, rank, suggest) |

### Tech Stack Assessment

**What works:**
- Angular 20 with standalone components and signals is modern and correct. Avoids NgRx overhead for a project this size.
- Express layered architecture is clean, predictable, and easy to extend.
- Zod for validation is the right call — schemas are co-located with the domain they protect.
- Centralized `ApiConfig` in the frontend removes magic strings from components.

**What doesn't scale:**
- JSON file storage is the single biggest architectural constraint. Every read/write loads the entire file, there's no indexing, no transactions, and no concurrent write safety.
- All products are fetched and held in memory on both client and server. Fine for 50 products, unusable for 50,000.
- Search is entirely client-side — the engine runs against an in-memory array in Angular.

---

## STEP 2: FEATURE BREAKDOWN

### 1. Search System

**Implementation:** Custom frontend search engine in `/frontend/src/app/core/search/`.

The engine is a factory function `createSearchEngine<T>()` that accepts a signal of items and a config object. It returns a fully reactive interface: debounced query, ranked results, suggestion list, keyboard navigation, and text highlighting.

Internally:
- Tokenizes the query by whitespace
- AND-matches all tokens against configured fields
- Ranks by: exact match > word boundary > substring
- Debounces input (default 200ms)
- Generates suggestions from top N ranked items
- Highlights matches using `<mark>` tags

**Data structure:** No index. Iterates the full items array on every debounced keystroke.

**Performance:**
- Acceptable for the current product count (~30 seed items)
- Will degrade linearly with dataset size
- No memoization or cached index between queries

**Scalability limitation:** This is a client-side, full-scan search. Moving to a real dataset (thousands of products) requires either server-side search (PostgreSQL full-text, Elasticsearch, Typesense) or a pre-built inverted index on the frontend.

**What's good:** The engine is generic, reusable, and well-abstracted. It's used for both product search and admin user search with zero duplication.

---

### 2. Product System

**Coverage:** Books, merch, stickers handled uniformly — all are `Product` records differentiated by `category` and `collection` fields. No sub-typing.

**Data model:**
```json
{
  "id", "title", "description", "price", "salePrice",
  "stock", "category", "collection", "tags",
  "badges": ["new", "sale", "bestseller", "limited"],
  "isNew", "isBestseller", "isLimitedEdition", "isSale"
}
```

The `badges` array and the boolean flags are **redundant** — `isSale` is always derivable from `badges.includes('sale')`. This is denormalization without a clear reason.

The `salePrice` auto-computation (10% of price when 'sale' badge is toggled) is a nice business rule clearly implemented in the repository layer.

**CRUD completeness:** Full — create, read, update, delete, stock patch, badge toggle, catalog extraction. All admin operations are protected by role middleware.

**Gaps:**
- No image upload — images are URLs only
- No variant model (variantId in cart items is a string, no variant objects exist in products)
- No inventory reservation during checkout

---

### 3. Checkout Flow

**Current state:** The checkout endpoint (`POST /api/checkout/create-payment-intent`) returns a **hardcoded mock Stripe response**. No payment processing occurs.

```javascript
// checkout.controller.js — the full implementation
return res.json({
  success: true,
  data: {
    clientSecret: 'pi_mock_..._secret_mock',
    paymentIntentId: 'pi_mock_...'
  }
})
```

**Order creation:** Fully implemented and functional. Orders are created with status `pending`, persist to `orders.json`, and flow through a defined status lifecycle (`pending → paid → processing → shipped → delivered`).

**Edge case handling:**
- Cancel is only allowed from `pending` or `paid` status (enforced in service layer)
- Status enum is validated on every update
- Order ownership is checked before allowing user access

**Gaps:**
- No stock decrement on order creation
- No inventory check before allowing add-to-cart
- Payment and order creation are decoupled — nothing prevents order creation without payment
- No idempotency on order creation (double-submit creates duplicate orders)

---

### 4. Notification System

**Architecture decision:** Notifications are **not stored**. They are computed on demand from order history.

**How it works:**

`GET /api/orders/user/activity` calls `OrderProjectionService.projectRecentActivity(orders)` which:

1. Maps each order to a notification shape: `{ orderId, status, orderNumber, createdAt, updatedAt, isTerminal }`
2. Assigns a **status priority score** (1 = most urgent):
   - PENDING = 1 (needs action)
   - PAID = 2 (active commitment)
   - FAILED = 3 (needs resolution)
   - CANCELLED = 4 (user-initiated)
   - PROCESSING = 5 (in progress)
   - SHIPPED = 6 (in transit)
   - DELIVERED = 7 (complete)
3. Assigns a **recency timestamp**: `createdAt` for pending orders, `updatedAt` for all others
4. Sorts by: priority → recency → orderId (fully deterministic)
5. Returns the top 3

**Duplicate prevention:** Structural — one order maps to exactly one notification. No deduplication logic needed because notifications are never persisted.

**Update handling:** Because notifications are computed from order state, any status change is immediately reflected on next request. No event bus, no webhook, no stored notification record to go stale.

**What this is:** A **read-side projection** (CQRS-adjacent pattern). The write side mutates order state. The read side computes a user-facing view from that state. Clean separation.

**Gaps:**
- No real-time push (no WebSocket, no SSE) — the client must poll
- No notification history beyond what orders represent
- No ability to mark notifications as "read"

---

## STEP 3: CURRENT STATE ASSESSMENT

| Area | Status | Notes |
|---|---|---|
| Authentication | **Functional, needs improvement** | Works correctly; no refresh tokens, no revocation |
| Product catalog | **Functional, needs improvement** | Full CRUD; no server-side pagination, redundant badge/flag fields |
| Cart system | **Complete** | Robust — guest + auth, server-side totals, validation |
| Order management | **Complete** | Full lifecycle, status enforcement, cancellation rules |
| Checkout / Payment | **Partially implemented** | Order flow works; payment is mock only |
| Search engine | **Functional, needs improvement** | Good architecture; client-side only, no index |
| Notification system | **Complete** | Elegant projection model; no push or read-state |
| Admin panel | **Functional, needs improvement** | Full product/order/user management; no bulk ops |
| Pagination | **Partially implemented** | Users have pagination; products do not |
| Testing | **Missing** | Zero coverage |

### Technical Debt

- **Denormalized badge/boolean flags** on products — `isSale` is always `badges.includes('sale')`, the booleans add write complexity with no read benefit.
- **Inconsistent product pagination** — users endpoint is paginated, products endpoint returns everything. Either both should paginate or neither should.
- **Checkout decoupled from orders** — you can create an order without any payment flow. In a real system these would be atomic.
- **No stock management in the order flow** — ordering 10 units of stock 1 doesn't fail or decrement anything.
- **JWT in localStorage** — XSS risk. HttpOnly cookies are the standard for production auth tokens.
- **No tests** — this is the most impactful gap for real-world credibility.

### Overengineering vs Underengineering

**Overengineered:**
- The search engine is more sophisticated than the dataset warrants. A generic, reusable, fully-typed, keyboard-navigable engine with debounce, ranking, and suggestions for 30 products is overbuilt — but it demonstrates advanced frontend thinking, which is valuable in a portfolio.
- Dual redundancy in product flags (badges array + boolean fields) adds complexity without benefit.

**Underengineered:**
- Checkout is a single mock controller — significantly underbuilt relative to everything else.
- No server-side product pagination while user pagination is fully implemented creates visible inconsistency.
- No variant data model despite variantId being used in cart items.

---

## STEP 4: SYSTEM DESIGN QUALITY

### Does this demonstrate strong backend thinking?

**Yes, with caveats.**

The layered architecture (router → controller → service → repository) is correctly implemented and consistently applied across all domains. Service boundaries are clear — CartService does not touch OrderRepository, AuthService does not know about Products. The Zod validation middleware is properly positioned at the boundary. The role middleware is composable and reusable.

The `OrderProjectionService` is the strongest demonstration of backend thinking in the codebase. The decision to compute notifications as a stateless projection from order state — rather than maintaining a separate notifications table — shows genuine understanding of CQRS, read-model design, and avoiding dual-write consistency problems. A junior developer would have built a notifications table. This developer didn't, and the reasoning is sound.

**Where it falls short:**
- The repository layer is file-based with no abstraction for swap. There's no `IProductRepository` interface — swapping to Postgres requires rewriting the repository class and hoping the service layer doesn't break. In a real production system, repositories would implement an interface.
- No transaction support. Cart + order creation involves multiple writes that can partially fail.
- The checkout mock signals an incomplete understanding of payment flows (or a deliberate skip for time reasons — either way, it's a visible gap).

### Are service boundaries clear and maintainable?

Yes. Each domain folder is self-contained. The admin router is a thin layer that re-mounts existing controllers under a protected prefix — good pattern, avoids duplicating business logic.

One soft violation: `admin.service.ts` on the frontend duplicates some functionality from the feature stores. It's a parallel HTTP layer rather than a higher-level abstraction on top of the stores.

### Is the system scalable in theory?

**Backend:** Yes, with a database swap. The repository pattern means the service layer is insulated from persistence changes. Swap `file-product.repository.js` for `postgres-product.repository.js` and the rest of the system is unchanged in theory.

**Frontend search:** No. The current search is fundamentally limited by the client-side scan model. It scales to hundreds of items, not thousands.

**Notification system:** Yes. The stateless projection model scales well — it's a pure function over order data. Adding caching (memoize per userId) or moving to a proper event store doesn't require changing the shape of the interface.

### Signs of real-world problem solving?

- Status priority-based notification ranking is a real product decision, not a tutorial pattern.
- AND-based search tokenization prevents noise results — a real UX decision.
- Backend-only cart total calculation prevents client-side price manipulation.
- CORS whitelist, JWT secret minimum length validation, bcrypt salt rounds — these are not beginner choices.
- Seeding 31 users with realistic data demonstrates thinking about demo/test environments.

---

## STEP 5: PORTFOLIO REFRAMING

### What problem does Night Reader solve?

Night Reader is a full-stack bookstore and merchandise platform designed to demonstrate scalable e-commerce system design. It handles product catalogs across multiple categories, a session-aware shopping cart, order lifecycle management, and a notification system that surfaces relevant order activity — all without a traditional database server, proving the architecture works independently of the persistence layer.

### What makes this system technically interesting?

**1. The notification system is not a notifications table.**

Most developers, when asked to build an order activity feed, create a `notifications` table and insert rows when order status changes. Night Reader doesn't. Instead, it computes the activity feed as a real-time projection from order state using a priority-ranking algorithm. This eliminates dual-write consistency problems, stale notification records, and deduplication logic. It's a CQRS-adjacent read-model that any senior engineer would recognize as a deliberate architectural decision.

**2. The search engine is a reusable typed infrastructure piece.**

Rather than implementing search inline in a component (the common approach), Night Reader builds a generic `createSearchEngine<T>()` factory that accepts any signal-backed dataset and a field configuration. The same engine powers both product search and admin user search with no duplication. It includes debounce, multi-field AND-token matching, ranked suggestions, keyboard navigation, and text highlighting — all as composable, testable utilities.

**3. The backend is swap-ready.**

The repository pattern means the persistence layer is completely isolated from business logic. The entire system could move from JSON files to PostgreSQL by replacing four repository files. The service layer, controllers, and routes don't change. This is not an accident — it's a deliberate architectural boundary.

### Standout engineering decisions

| Decision | Why it matters |
|---|---|
| Stateless notification projection | Avoids dual-write inconsistency, no stale data problem |
| Repository pattern with no leakage | Business logic is portable across persistence backends |
| Backend-only cart total calculation | Eliminates client-side price manipulation vector |
| Generic search engine factory | Single implementation powers multiple features |
| Signals-based state without NgRx | Correct tooling choice for project complexity level |
| AND-token matching in search | More precise UX than OR-based fuzzy matching |

### Challenges solved

**Search:** Building a performant, ranked, suggestion-supporting search UX that works across generic data shapes required decomposing the problem into tokenization, filtering, ranking, and suggestion generation as separate composable utilities. The result is reusable infrastructure, not a one-off implementation.

**Notifications:** The hard problem in notification systems is avoiding stale data. The solution here is to not store notifications at all — compute them on every read from the source of truth (orders). This removes an entire class of consistency bugs. The tradeoff is slightly higher compute per request, which is acceptable given the data size.

**Service boundaries:** Every domain owns its own router, controller, service, and repository. No cross-domain service calls. The admin panel reuses existing controllers under a different protected prefix rather than duplicating logic. This is clean separation that survives growth.

### Why this proves full-stack ability

- **Frontend:** Demonstrates mastery of modern Angular (signals, zoneless, standalone) without relying on tutorials. The search infrastructure shows component-level thinking and reusable abstraction.
- **Backend:** Layered architecture, Zod validation, JWT auth, CORS, and role middleware all correctly implemented. The notification projection shows event-driven thinking.
- **System design:** Repository pattern, service boundaries, and the mock Stripe integration point (not implemented, but structurally correct) show awareness of real production architecture.
- **Product thinking:** Status priority ranking, free shipping threshold, badge auto-pricing, cancellation rules — these are not boilerplate tutorial decisions. They reflect product judgment.

---

## STEP 6: HIGH-IMPACT IMPROVEMENTS

### 1. Server-side product search with pagination

**What:** Move product filtering from client to server. Add `GET /api/products?q=<query>&page=<n>&limit=<n>` that applies text search and returns a page of results. Add an inverted index (even in-memory) on startup.

**Why it matters:** The current client-side search loads all products before any search happens. In a real catalog (books, merch, stickers across hundreds of SKUs), this collapses the search UX and increases initial load time. Server-side search is the minimum viable pattern for a catalog system — demonstrating it shows you understand backend query design.

**Direction:** Add a `ProductSearchService` that builds an in-memory inverted index (word → product IDs) on startup and refreshes it on create/update/delete. Expose pagination via query params consistent with the existing user pagination pattern. The repository pattern already supports this cleanly.

---

### 2. Real Stripe integration (or a convincing simulation)

**What:** Implement the Stripe payment flow end-to-end using Stripe's test mode. `POST /api/checkout/create-payment-intent` should call `stripe.paymentIntents.create()`, return a real client secret to the frontend, and the frontend should confirm it with Stripe Elements. On success, create the order with status `paid`.

**Why it matters:** The checkout is the most visible gap in the system. Every other feature has a real implementation. A mock Stripe call in a "production-style" portfolio project is conspicuous. Even using Stripe test mode with test card numbers demonstrates you understand the payment lifecycle (intent → confirm → webhook → status update).

**Direction:** Install `stripe` npm package on the backend. Use `STRIPE_SECRET_KEY` from env (test key). Add `POST /api/checkout/webhook` to handle `payment_intent.succeeded` events and trigger order status update to `paid`. This closes the payment → order → notification loop end-to-end.

---

### 3. Real-time notification push (Server-Sent Events)

**What:** Replace the poll-based activity endpoint with a Server-Sent Events stream: `GET /api/orders/user/activity/stream`. When an admin updates an order status, push a notification event to the connected user.

**Why it matters:** The notification projection is already architecturally correct. Adding push delivery elevates it from "smart read model" to "real-time event system" — a materially more impressive demonstration. SSE is simpler than WebSockets and sufficient for unidirectional status push.

**Direction:** Use Node.js `res.write()` with `Content-Type: text/event-stream`. On `PATCH /orders/:id/status`, emit an event to the relevant user's SSE connection. The frontend subscribes with `EventSource`. Keep the existing projection endpoint for initial load; use SSE only for live updates.

---

### 4. Stock management in the order flow

**What:** When an order is created, decrement product stock for each line item. If any item has insufficient stock, reject the order with a 409 conflict. On order cancellation, restore stock.

**Why it matters:** This is a core e-commerce invariant. Every real product manager asks "what happens when two people order the last item at the same time?" The answer reveals whether you understand transactional consistency. Demonstrating awareness of the race condition (even without solving it perfectly in file-based storage) is more impressive than ignoring it.

**Direction:** In `OrderService.createOrder()`, before writing the order, check stock for each item. Decrement atomically (or document the race condition as a known limitation and explain how a database transaction would solve it). Add `OrderService.cancelOrder()` → `ProductService.restoreStock()` call. This closes a real product logic gap.

---

### 5. Repository interface contracts

**What:** Define an interface for each repository (e.g., `IProductRepository`) and have the file-based implementations conform to it. Add a comment or stub showing what a `PostgresProductRepository` would look like.

**Why it matters:** The repository pattern is only meaningfully demonstrated if the contract is explicit. Right now, the swap-readiness claim is informal — there's no interface, just a matching method signature. Defining the interface makes the architectural intent legible to any reviewer. It also enables mocking in tests.

**Direction:** In each domain, add a `[domain].repository.interface.js` (or `.d.ts` if moving to TypeScript on the backend) with the method signatures. File repositories `implements` these. Add a `jest.mock()` example in a README note showing how tests would use the interface.

---

## STEP 7: FINAL SCORE

| Category | Score | Notes |
|---|---|---|
| **Architecture** | 7.5 / 10 | Layered backend, clean service boundaries, repository pattern. Held back by file-based persistence and no interface contracts. |
| **Backend design** | 7 / 10 | Notification projection and role middleware show strong thinking. Checkout mock and missing stock logic are real gaps. |
| **Frontend structure** | 8 / 10 | Modern Angular, correct signals usage, generic search engine, clean store/API separation. Best part of the project. |
| **Real-world readiness** | 5 / 10 | No tests, mock payment, file storage, no refresh tokens, no real-time. Production-shape architecture but not production-ready. |
| **Portfolio strength** | 7.5 / 10 | The notification projection and search engine are genuinely impressive. The checkout gap and zero test coverage are visible weaknesses a hiring manager will notice. |

---

### What level of developer does this project represent?

**Mid-level developer with senior-leaning architectural instincts.**

The architecture reflects someone who has thought beyond "make it work" — service boundaries, repository isolation, stateless projections, and reusable generic utilities are not beginner patterns. The notification system design in particular is the kind of decision you see from engineers who have been burned by dual-write bugs before.

What holds it back from senior-level is execution completeness: zero test coverage, a mock checkout in a "production-style" system, and inconsistent feature depth (users are paginated, products are not; notifications have a sophisticated read model but no push delivery). A senior engineer finishes the loop. This project shows strong conceptual understanding with visible gaps in implementation thoroughness.

**Hiring signal:** Strong candidate for a mid-level full-stack or backend role. With the Stripe integration and test coverage added, this portfolio project competes at senior-level. Without them, it demonstrates potential rather than proof.

---

*Report generated from full static analysis of the Night Reader / sticker-shop codebase.*
