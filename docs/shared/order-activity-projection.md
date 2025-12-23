# Order Activity Projection

**Status:** Production
**Last Updated:** 2025-12-23

---

## Feature Overview

### The Problem

Users need visibility into their order status without being overwhelmed by granular event streams. Traditional activity feeds generate multiple entries per order—one for order placement, another for payment confirmation, another for shipment, and so on. This approach:

- Creates visual clutter as order volume grows
- Obscures the current state of an order beneath a timeline of past events
- Treats temporal sequence (what happened when) as more important than relevance (what matters now)
- Forces users to mentally reconstruct order state from fragmented events
- Scales poorly when users have many concurrent orders

Users don't need an audit log; they need a **relevance-driven summary of what currently demands their attention**.

### Why Naive Approaches Fail

**Frontend-only sorting or filtering** cannot solve this problem because:
- The definition of "relevance" is domain logic, not presentation logic
- Different order statuses carry different weights of user urgency that only the backend understands
- Client-side ranking violates separation of concerns and creates maintenance fragility
- Polling for all orders just to display three items wastes bandwidth and complicates caching

**Event-based feeds** fail because:
- They confuse "things that happened" with "things that matter"
- They require complex deduplication logic ("collapse this order's 5 events into one")
- They cannot answer "which 3 orders need attention right now" without reconstructing state

The system must project **current order state**, not replay past events.

---

## Design Principles

### One Order = One Notification

Each order produces exactly one notification, representing its current state. Status transitions update the notification in place rather than generating new entries. This ensures:
- No duplication or clutter
- Immediate clarity on what an order's state is now
- Deterministic feed size (at most one notification per order)

The system does not track or display the history of transitions. It projects the present.

### Stateless Projection

Notifications are **not persisted entities**. They are computed on demand from the current state of order records. This design:
- Eliminates synchronization concerns (no stale notification state)
- Makes the system rebuildable from source data at any time
- Reduces storage and indexing overhead
- Allows projection logic to evolve without migrating notification state

"Created" and "updated" are logical concepts describing the notification lifecycle, not database operations.

### Deterministic Behavior

The projection must produce identical results for identical order sets across all requests. Ranking must never introduce randomness, timestamp jitter, or database scan order dependency. This requires:
- Well-defined comparison keys evaluated in strict order
- Tie-breaker rules that exhaust all sources of ambiguity (status → recency → orderId)
- No reliance on undefined sort stability

Deterministic behavior prevents UI flicker, simplifies testing, and builds user trust.

### Relevance Over Recency

**Status priority is strictly decisive.** A `pending` order demanding user payment always outranks a `delivered` order, even if the delivery happened seconds ago. Timestamps are used only as tie-breakers within the same status priority.

This reflects how users think: "What needs my attention?" takes precedence over "What happened most recently?"

### Backend Owns Logic, Frontend Owns Presentation

The backend encapsulates all ranking, eviction, and limit enforcement. The frontend:
- Trusts the backend response as final
- Applies no sorting, filtering, or conditional logic based on notification content
- Uses uniform visual styling regardless of order status
- Transforms data only for display (capitalization, truncation, formatting)

This separation ensures that business rules remain centralized and testable while the UI remains a pure view layer.

---

## Key Decisions & Rationale

### Hard 3-Item Limit

The feed displays at most 3 notifications. This constraint:
- Forces prioritization (only the most relevant orders surface)
- Prevents information overload
- Fits within dashboard UI space constraints
- Encourages users to navigate to the full Orders view for comprehensive history

The limit is enforced server-side. Clients receive pre-limited results and never decide what to discard.

### Status-Priority-First Ordering

Orders are ranked by a 7-level priority hierarchy:

1. **`pending`** — Requires immediate user action (payment); highest urgency
2. **`paid`** — Active user commitment; awaiting fulfillment
3. **`failed`** — Exceptional state requiring user awareness or resolution
4. **`cancelled`** — User-initiated termination; high initial relevance
5. **`processing`** — Active fulfillment work (picking, packing, preparing shipment)
6. **`shipped`** — In transit; passive progress
7. **`delivered`** — Fulfillment complete; informational only

**Why this ordering?**

- **`pending` over all others:** User must act for the order to progress. No other status blocks the user's path.
- **`paid` over terminal states:** Represents active user intent that hasn't yet been fulfilled. The user cares more about "where is my order?" than "my old order was delivered."
- **`failed` and `cancelled` above `processing`/`shipped`:** Exceptional conditions demand attention. A failed payment or cancellation is more urgent than routine fulfillment steps.
- **`processing` over `shipped`:** Active work (warehouse picking) signals nearer-term completion than passive transit.
- **`shipped` over `delivered`:** Still in progress vs. fully complete.

Status priority is **strictly decisive across different statuses**. Timestamps never override it.

### Processing > Shipped

A `processing` order (priority 5) always outranks a `shipped` order (priority 6), even if the shipped order was updated more recently.

**Why?** `processing` indicates active human or system work preparing the shipment. `shipped` indicates the package is in carrier hands—a passive state. Users perceive active work as more dynamic and worthy of attention.

### Terminal Order Handling

Terminal statuses (`failed`, `cancelled`, `delivered`) are final and irreversible. Orders do not regress from terminal states.

Terminal orders **always remain eligible** for the Recent Activity feed. They compete with active orders based on priority:
- A `failed` order (priority 3) can appear alongside `pending` and `paid` orders
- A `delivered` order (priority 7) will be evicted if higher-priority active orders exist

All three visible notifications may be terminal if no higher-priority orders exist.

**Why include terminal orders?** Users need to see recent failures or cancellations. A `failed` order is more relevant than a routine `shipped` order.

### Why Timestamps Never Override Status Priority

**Cross-status comparisons ignore timestamps.** A `delivered` order updated 1 second ago does not outrank a `pending` order created 1 week ago.

**Why?** Because status encodes **what the user must or should do**, which is fundamentally more important than temporal recency.

Recency is used **only as a tie-breaker within the same status**. If two `pending` orders exist, the more recently created one wins. If two `failed` orders exist, the more recently updated one wins. But `failed` vs. `pending` is decided purely by priority (1 vs. 3).

### Why Status Regressions Are Forbidden

The system assumes orders move forward through their lifecycle and never regress (e.g., `shipped` → `pending`). Terminal statuses are final.

**Why enforce this?**
- Projection logic depends on monotonic state progression to determine relevance
- Allowing regressions complicates recency semantics (`updatedAt` would no longer reliably indicate forward progress)
- Real-world fulfillment processes do not reverse order state (cancellations and failures are separate terminal states, not reversions)

If regressions must be supported, the projection logic must be redesigned to account for backward transitions.

### Why No Frontend Visual Distinction Is Applied

All notifications use identical styling—same background, border, text color, and layout. No icons, badges, color coding, or conditional emphasis based on status.

**Why?**

1. **Backend encodes priority through ordering.** Visual hierarchy is already expressed by position in the list (top = most important). Adding color or iconography duplicates this signal unnecessarily.

2. **Cognitive load reduction.** Users scan a uniform list faster than a list with varying visual weights. Differences in color or iconography force the user to decode meaning ("What does red mean again?").

3. **Accessibility.** Color-blind users and screen reader users benefit from uniform presentation. Status information is conveyed through text, not color.

4. **Separation of concerns.** Presentation logic (what it looks like) should not duplicate domain logic (what it means). Status priority is business logic; the UI is a view.

5. **Design stability.** If visual distinction were tied to status, changing the priority model would require frontend changes. Uniform styling decouples the two layers.

---

## System Architecture (Shared Responsibility)

### Backend Projection Service Responsibilities

The backend provides a **stateless projection service** that:

1. **Fetches all orders** for the authenticated customer
2. **Transforms each order** into a notification (one per order)
3. **Ranks notifications** by:
   - Status priority (1-7 scale)
   - Recency (`createdAt` for `pending`, `updatedAt` for others)
   - `orderId` (lexical descending, final tie-breaker)
4. **Limits results** to the top 3 notifications
5. **Returns a deterministic, stable response** with no randomness

**Core guarantee:** Given the same set of orders, the backend always returns the same 3 notifications in the same order.

### API Contract Guarantees

**Endpoint:** `GET /api/orders/user/activity`
**Authentication:** Requires Bearer token (customer context)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "orderId": "order-xyz",
      "status": "pending",
      "orderNumber": null,
      "createdAt": "2025-12-23T10:00:00.000Z",
      "updatedAt": "2025-12-23T10:00:00.000Z",
      "isTerminal": false
    }
  ],
  "total": 3
}
```

**Guarantees:**
- Returns 0-3 notifications (hard upper limit)
- Empty array if user has no orders
- Notifications are pre-sorted by relevance (no client-side sorting required)
- Each notification represents one order (no duplicates)
- Results are deterministic and stable

**Field Semantics:**
- `orderId`: Unique order identifier
- `status`: Current order status (lowercase)
- `orderNumber`: Human-readable number if assigned, otherwise `null`
- `createdAt`: Order creation timestamp (ISO8601)
- `updatedAt`: Last status change timestamp (ISO8601); **not updated by non-status changes**
- `isTerminal`: Boolean indicating if status is `failed`, `cancelled`, or `delivered`

### Frontend Integration Approach

The frontend **trusts the backend completely** and operates as a pure presentation layer:

**Data Flow:**
1. Fetch notifications via API
2. Store in component signal (no transformation)
3. Render each notification uniformly

**Display Logic:**
- **Order name:** Use `orderNumber` if present, else show last 8 characters of `orderId`
- **Status text:** Capitalize first letter of `status` field (e.g., "pending" → "Pending")
- **Timestamp:** Display `updatedAt` using Angular date pipe

**Styling:**
- Uniform background, border, and text color for all notifications
- No conditional styling based on `status` or `isTerminal`
- No icons or badges

**Auto-refresh:** Poll every 10 seconds to reflect backend changes (order placement, admin status updates)

### What Logic Explicitly Does NOT Live in the Frontend

The frontend **never**:
- Sorts notifications (backend pre-sorts)
- Filters notifications (backend pre-limits)
- Applies priority logic (backend encodes priority through ordering)
- Decides what to display or evict (backend enforces 3-item limit)
- Applies conditional styling based on status (uniform presentation)
- Duplicates or interprets domain rules (trusts backend contract)

---

## User Experience Outcome

### What Users See

Users see a **Recent Activity** section on their dashboard displaying up to 3 order notifications. Each notification shows:
- Order identifier (human-readable number or abbreviated ID)
- Current status (capitalized)
- Last update timestamp

Notifications are listed in descending order of relevance. The first notification is the most important; the third is the least.

**Example:**
```
Recent Activity
- Order ABC123 - Pending | 12/23/25, 2:30 PM
- Order DEF456 - Paid | 12/23/25, 1:45 PM
- Order GHI789 - Failed | 12/22/25, 11:20 AM
```

All notifications look identical visually. Position conveys priority, not color or iconography.

### What Users Never See

- **Multiple entries for the same order.** Each order appears at most once.
- **More than 3 notifications.** Older or lower-priority orders are evicted.
- **Intermediate status history.** Only the current state is shown.
- **Visual clutter.** No icons, badges, or status-specific styling.
- **Stale data.** Auto-refresh keeps the feed current.

### How the System Stays Predictable and Calm

1. **Stable ordering.** The same orders always produce the same ranking. No flicker, no jitter.
2. **Fixed capacity.** The feed never grows beyond 3 items. No overflow, no scrolling.
3. **Relevance-driven.** Users see what matters most, not just what happened recently.
4. **Uniform presentation.** No visual complexity; position alone conveys priority.
5. **Stateless projection.** The feed reflects truth (current order state) rather than maintaining a separate notification state that could drift.

The system is designed to reduce cognitive load and decision fatigue. Users glance at the feed, see their most relevant orders, and act.

---

## Non-Goals

The following concerns are **explicitly excluded** from this system:

1. **Persisting notification history**
   Notifications are computed on read, not stored. If historical notification state is needed, build a separate audit log.

2. **Real-time push (WebSockets)**
   The system uses polling (10-second intervals). Real-time updates can be added later without changing the projection model.

3. **Full event timelines**
   The feed shows current state, not the sequence of transitions. Use the Orders detail view or a dedicated timeline feature for event history.

4. **Compliance/audit logging**
   This is a user-facing relevance feed, not a compliance record. Audit logs require append-only storage and different guarantees.

5. **Order number assignment**
   The projection passes through `orderNumber` if present, but does not generate or assign order numbers. That logic belongs in the Orders domain.

6. **User-configurable filters**
   All customers see the same top-3-by-relevance feed. Custom filtering (e.g., "show only shipped orders") is out of scope.

**Why exclude these?**

Each non-goal represents a distinct concern with different storage, performance, or UX requirements. Bundling them into the projection would complicate the design, violate separation of concerns, and make the system harder to evolve.

---

## Future Extension Points

### What Can Be Safely Extended Later

1. **Click-through navigation**
   Notifications could link to order detail views. This requires only frontend routing changes; the API contract is unaffected.

2. **Relative timestamps**
   Display "2 minutes ago" instead of absolute times. This is a pure frontend formatting change.

3. **Real-time updates (WebSockets)**
   Replace polling with push notifications. The projection logic remains unchanged; only the trigger mechanism changes.

4. **Dedicated "All Activity" page**
   Build a full-screen view with pagination, showing more than 3 notifications. The backend can support this by removing the 3-item limit for a separate endpoint.

5. **Order number assignment**
   Populate `orderNumber` on order creation. The projection already supports nullable order numbers and will pass through assigned values.

6. **Admin view**
   Create a store-wide projection showing activity across all customers. This requires a separate endpoint with different filtering and authorization logic.

### What Constraints Must Not Change Without Redesign

1. **One order = one notification**
   If multiple notifications per order are needed, the entire projection model must be rethought. This would break the deterministic 3-item limit.

2. **Stateless projection**
   Introducing persisted notification state would create synchronization complexity and invalidate the "rebuildable from source" guarantee.

3. **Status priority as primary dimension**
   Changing the ranking algorithm (e.g., making recency primary) would fundamentally alter user experience and require frontend changes to manage new edge cases.

4. **No status regressions**
   If orders must regress (e.g., `shipped` → `pending`), recency semantics (`updatedAt` as forward progress indicator) break down. The projection would need to track direction of change.

5. **Backend-enforced 3-item limit**
   Moving limit enforcement to the frontend would violate separation of concerns and force clients to implement eviction logic.

---

## Summary

### Core Guarantees

1. **Each order produces exactly one notification**, representing its current state.
2. **The backend returns at most 3 notifications**, pre-sorted by relevance.
3. **Relevance is defined by status priority, then recency, then orderId.**
4. **Status priority is strictly decisive across different statuses.** Timestamps never override it.
5. **The projection is stateless and rebuildable** from current order data at any time.
6. **The frontend trusts the backend completely** and applies no business logic.
7. **All notifications are styled uniformly**, with position alone conveying priority.

### Why This Design Scales

- **Fixed output size (3 items)** prevents unbounded growth as order volume increases.
- **Stateless projection** eliminates synchronization overhead and storage costs.
- **Backend encapsulation** allows ranking logic to evolve without frontend changes.
- **Deterministic behavior** simplifies testing and prevents UI flicker at any scale.
- **Relevance-driven selection** ensures users see what matters, not just what's newest.

### Why It Is Safe to Modify Incrementally

- **Backend owns all ranking logic.** Changes to priority weights or tie-breaker rules require no frontend coordination.
- **API contract is stable.** Adding fields to the response (e.g., `estimatedDelivery`) is backward-compatible.
- **Frontend is a pure view layer.** Display logic can evolve (formatting, layout, navigation) without touching projection semantics.
- **Stateless projection** allows the system to be rebuilt or refactored without migrating persisted state.
- **Clear non-goals** prevent scope creep and feature drift.

The design reflects **how users think about their orders** (relevance over history) and **how systems should be built** (separation of concerns, determinism, incremental evolution).
