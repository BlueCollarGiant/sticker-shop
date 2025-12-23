# Order Activity Projection – Design & Planning

## Status
🟡 Planning (Pre-Implementation)

## Purpose

This document captures the design decisions and reasoning for the **Order Activity Projection** system.
Its goal is to prevent scope creep, clarify intent, and provide a stable reference before implementation begins.

This system replaces the current event-style "Recent Activity" feed with a **single, order-centric notification model**.

---

## Problem Statement

The existing Recent Activity system:

- Generates multiple activity entries per order
- Treats derived events as independent notifications
- Becomes cluttered as order volume grows
- Does not reflect the *current state* of an order clearly
- Scales poorly for users with multiple concurrent orders

The UI need is **not** an audit log, but a **relevance-driven summary of active orders**.

---

## Scope and Boundaries

**Customer-Facing Projection**

- This projection serves the **authenticated customer account** context
- Candidate orders for the Recent Activity feed are **all orders belonging to the authenticated customer**
- This is **not** an admin view or store-wide projection
- Each customer sees only their own orders in Recent Activity

---

## Core Design Decision

**One order = one notification**

- A notification is logically created once, at order creation
- That notification is **updated in place** as the order status changes
- No duplicate notifications are created for status transitions

**Stateless Projection Model**

- Notifications are **not persisted entities**
- "Created" and "updated" describe the **logical lifecycle** of the projection
- The projection is **computed on read** from current order data
- The system is rebuildable at any time from source order state

This system represents a **state projection**, not a history log.
Only the **current order state** is projected; intermediate status transitions are not surfaced.

**Status Lifecycle Assumptions**

- Order status regressions **do not occur**
- Terminal statuses (`failed`, `cancelled`, `delivered`) are **final**
- Orders are **not re-opened** after reaching a terminal state

---

## Conceptual Model

### What this system is

- A domain-level **read projection** for Orders
- A relevance-based notification feed
- Stateless and rebuildable at any time
- Owned by the Orders domain

### What this system is not

- An audit log
- A persistent notification store
- A dashboard-specific hack
- A generic "activity" system

---

## Display Constraints

The Recent Activity feed enforces a **hard 3-item display limit**:

- **Maximum of 3 notifications** are shown at any time
- If 3 or more orders exist, **exactly 3 are always shown**
- If fewer than 3 orders exist, **all available orders are shown**
- Each notification represents **one order**
- There are **no exceptions or empty states** caused by filtering
- The feed is never empty when orders exist

**Empty State**

- If no orders exist for the authenticated customer, the Recent Activity feed returns an empty list
- Frontend handles empty state display

Eviction is deterministic and rule-based.
Ordering is based on **relevance**, not just recency.

---

## Order Status Reference

```ts
const OrderStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
};
```

> Status order represents fulfillment sequence, **not user relevance priority**.

---

## Active vs Terminal Orders

Orders are classified as either **active** or **terminal**:

**Active Orders**
- `pending`
- `paid`
- `processing`
- `shipped`

**Terminal Orders**
- `failed`
- `cancelled`
- `delivered`

Terminal statuses are final. Orders do not transition out of terminal states.

**Eligibility and Competition**

- Terminal orders are **always valid candidates** for the Recent Activity feed
- All three visible notifications may be terminal orders
- Terminal orders are **never categorically excluded** from selection
- Recent Activity always selects the **three most relevant notifications overall**
- Terminal orders compete with active orders based on relevance ranking
- Terminal orders may appear alongside active orders when their relevance exceeds that of lower-priority active states

---

## Relevance & Weighting Model (Conceptual)

Relevance is **comparative, not absolute**.
The system selects the three most relevant notifications using competition-based ranking.

Relevance is determined by multiple dimensions, evaluated in strict order:

### 1. Primary Dimension — Status Priority

Represents how much attention the order currently demands from the user.

**Status priority is evaluated in strict descending order (highest to lowest):**

1. **`pending`** — Requires immediate user action (payment); highest priority overall
2. **`paid`** — Active user interest; awaiting fulfillment
3. **`failed`** — Requires user attention or resolution
4. **`cancelled`** — User-initiated termination; high initial relevance
5. **`processing`** — Active fulfillment work (picking, packing, preparing shipment)
6. **`shipped`** — In transit; no remaining fulfillment actions required
7. **`delivered`** — Fulfillment complete; informational only

**Priority Rationale**

- **`pending` over all others**: Requires immediate user action to proceed
- **`paid` over terminal/in-progress**: Represents active commitment awaiting fulfillment
- **`failed` and `cancelled` over `processing`/`shipped`**: Exceptional states requiring awareness
- **`processing` over `shipped`**: Active fulfillment work vs. passive transit
- **`shipped` over `delivered`**: Still in progress vs. fully complete
- **`delivered` lowest**: No action required; informational only

**Key Rules**

- `pending` is the highest priority status overall
- `pending` notifications **cannot be displaced** by non-pending statuses
- Only another `pending` notification can displace a `pending` one
- Terminal orders compete with active orders based on their priority ranking
- **Status priority is strictly decisive across different statuses**
- Timestamps never override status priority

---

### 2. Secondary Dimension — Recency (Tie-Breaker)

Time is used **only when multiple orders share the same status priority**.

**Timestamp Semantics**

- `pending` orders use **`createdAt`** for recency comparisons
- All other statuses use **`updatedAt`** for recency comparisons
- If `updatedAt` values are identical, fall back to **`createdAt`**

**`updatedAt` Contract**

- `updatedAt` is assumed to represent the **most recent order status change**
- Non-status updates (e.g., metadata changes, notes) **must not modify `updatedAt`**
- This ensures recency accurately reflects status progression

**Recency reflects the latest state only.**
Rapid status changes do not create multiple notifications; only the current order state is projected.

**Cross-Status Ordering**

- Timestamps are **only used as a tie-breaker within the same status priority**
- When comparing orders with different statuses, status priority is strictly decisive
- A newer `delivered` order (priority 7) will never outrank an older `pending` order (priority 1), regardless of timestamps

---

### 3. Tertiary Dimension — Deterministic Tie-Breaker

If status priority and timestamps are equal, ordering is stabilized using **`orderId`**.

**`orderId` Tie-Breaker Semantics**

- `orderId` is used **only as a final deterministic tie-breaker** when all other comparison keys are equal
- Comparison is **lexical (string-based)**, not numeric
- Orders are sorted by `orderId` in **descending order** (larger/later IDs first)
- This comparison is used **only to stabilize ordering and prevent UI flicker**, not to encode priority

This ensures fully deterministic ranking with no randomness across requests.

---

## Eviction Rules

Selection is determined by the following competition-based logic:

1. Each order produces exactly one notification
2. **Status priority is evaluated first** (see strict ordering: pending → paid → failed → cancelled → processing → shipped → delivered)
   - Status priority is strictly decisive across different statuses
3. **Recency is used as a tie-breaker** when multiple orders share the same priority:
   - `pending` uses `createdAt`
   - All other statuses use `updatedAt`
4. **If timestamps are identical, fall back to `createdAt`** (when using `updatedAt`)
5. **`orderId` is used as a final tie-breaker** when status and all timestamps are equal (lexical comparison, descending)
6. Only the top 3 notifications are displayed
7. Eviction removes notifications **only from the Recent Activity view**, not from the Orders list

This ensures stable, deterministic ordering with no randomness or flicker.

---

## Edge Case Behavior

### More Than Three Terminal Orders

When more than three terminal orders exist **and are being compared to each other**, selection follows these rules:

**Selection order (terminal-to-terminal comparison only):**
1. **Terminal status priority:**
   - `failed` (priority 3)
   - `cancelled` (priority 4)
   - `delivered` (priority 7)
2. **Recency using `updatedAt`** (newest first)
3. **If `updatedAt` ties, fall back to `createdAt`**
4. **If still tied, fall back to `orderId`** for deterministic ordering (lexical, descending)

**Scope Clarification:**
- These rules apply **only when ordering terminal orders against each other**
- They do **not override or replace** the global status priority ranking
- When terminal orders compete with active orders, the global priority list (1-7) is used
- Terminal ordering is scoped to terminal-to-terminal comparisons only

This ensures stable ordering with no randomness or flicker when competing terminal orders exist.

---

### Simultaneous Terminal Transitions

If multiple orders transition to terminal status at the same time (identical `updatedAt`):
- Ordering falls back to `createdAt`
- Then to `orderId` if needed (lexical, descending)

This guarantees deterministic ranking even when concurrent transitions occur.

---

### More Than Three Pending Orders

If more than three orders are `pending`, the system displays the **most recently created** pending orders (by `createdAt`, descending).

Older pending orders remain accessible in the Orders view but are evicted from Recent Activity.

---

### No Orders Exist

If no orders exist for the authenticated customer, the Recent Activity feed returns an empty list.

Frontend is responsible for rendering an appropriate empty state.

---

## Notification Output Contract (Conceptual)

Each notification returned by the projection includes the following fields:

- **orderId** — Unique identifier for the order
- **status** — Current order status (see Order Status Reference)
- **orderNumber** — Human-readable order number (nullable)
- **createdAt** — Order creation timestamp
- **updatedAt** — Last status change timestamp
- **isTerminal** — Derived boolean indicating if the order is in a terminal state

**Field Notes**

- `orderNumber`: The projection passes through the order number if present, otherwise returns `null`. Order number assignment logic is out of scope for this system.
- `updatedAt`: Represents the most recent status change, not arbitrary updates.

This is a conceptual contract. Implementation may include additional metadata as needed.

---

## Example Scenarios

### Multiple Pending Orders

If more than three orders are `pending`, the system displays the **most recently created** orders (by `createdAt`).

Older pending orders are deprioritized but remain accessible in the Orders view.

---

### Failed Order vs New Order

A failed order (priority 3) competes with all other orders based on its priority ranking.

Newer `pending` (priority 1) or `paid` (priority 2) orders will always displace it based on higher status priority, regardless of timestamps.

Lower-priority active orders like `processing` (priority 5) or `shipped` (priority 6) may be displaced by a `failed` order based on status priority. If a `failed` and `processing` order both exist, the `failed` order ranks higher due to status priority, regardless of their respective timestamps.

---

### Pending Cannot Be Displaced by Non-Pending

If a `pending` order is in the feed, it cannot be displaced by `paid`, `failed`, or any other non-pending status, regardless of how recent those other orders are.

Only another `pending` order (more recent by `createdAt`) can displace it.

---

### Processing vs Shipped Competition

If both `processing` and `shipped` orders exist:
- `processing` orders (priority 5) will rank higher than `shipped` orders (priority 6) based on status priority
- A `processing` order will displace a `shipped` order when competing for the same slot, regardless of timestamps
- This reflects that `processing` represents active fulfillment work, while `shipped` represents passive transit

---

### Mixed Active and Terminal Notifications

The Recent Activity feed may contain any combination of active and terminal orders:
- Three pending orders
- Two pending, one failed
- One paid, one cancelled, one delivered
- Three delivered orders
- One processing, one shipped, one failed

The composition depends entirely on relevance ranking at the time of projection, determined first by status priority, then by recency within the same status.

---

## Order Number Handling

- Recent Activity displays an order number when available
- Account and Admin views do not currently display order numbers
- Order number assignment logic is **out of scope** for this projection system

**Projection Behavior**

- The projection passes through `orderNumber` if present on the order entity
- If `orderNumber` is not assigned, the projection returns `null`
- Order number assignment and display consistency are separate concerns

---

## Frontend Integration Notes

- Consumed by `frontend/features/orders`
- Frontend performs no deduplication or prioritization
- Backend guarantees:
  - One notification per order
  - Sorted and limited results
  - Stable, deterministic semantics
- Frontend is responsible for empty state display

---

## Non-Goals

- Persisting notification history
- Real-time push (WebSockets)
- Full event timelines
- Compliance/audit logging
- Order number assignment or generation

These may be addressed by future systems.

---

## Future Extensions (Out of Scope)

- Dedicated "All Activity" page
- Expandable per-order timelines
- User-configurable filters
- Notification persistence

---

## Summary

This system prioritizes **clarity, relevance, and scalability** over raw completeness.
It reflects how users think about orders, not how systems log events.

Implementation should strictly follow the constraints and rules defined here.
