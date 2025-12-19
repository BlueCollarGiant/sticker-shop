# Order Activity Projection – Design & Planning

## Status
🟡 Planning (Pre-Implementation)

## Purpose

This document captures the design decisions and reasoning for the **Order Activity Projection** system.
Its goal is to prevent scope creep, clarify intent, and provide a stable reference before implementation begins.

This system replaces the current event-style “Recent Activity” feed with a **single, order-centric notification model**.

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

## Core Design Decision

**One order = one notification**

- A notification is created once, at order creation
- That notification is **updated in place** as the order status changes
- No duplicate notifications are created for status transitions

This system represents a **state projection**, not a history log.

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
- A generic “activity” system

---

## Display Constraints

- Maximum of **3 notifications** are shown at any time
- Each notification represents **one order**
- Eviction is deterministic and rule-based
- Ordering is based on **relevance**, not just recency

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

## Relevance & Weighting Model (Conceptual)

Relevance is determined by two dimensions:

### 1. Primary Weight — Status Priority

Represents how much attention the order currently demands from the user.

#### Attention Required (Highest)
- `pending`
- `paid`
- `failed`
- `cancelled`

#### In Progress (Medium)
- `processing`
- `shipped`

#### Informational (Lowest)
- `delivered`

---

### 2. Secondary Weight — Temporal Behavior

Used only when relevance conflicts arise.

#### Pending
- Does **not decay**
- Competes by **recency** when multiple pending orders exist

#### Failed / Cancelled
- High initial relevance
- Relevance **decays over time**
- Allows newer active orders to displace older terminal ones

#### Processing / Shipped
- Stable relevance
- Can be evicted when space is needed

---

## Eviction Rules (Human-Readable)

1. Each order produces exactly one notification
2. Notifications are ranked by relevance
3. Only the top 3 notifications are displayed
4. When relevance ties occur:
   - More recent orders outrank older ones
5. Oldest, least relevant notifications are evicted first

---

## Example Scenarios

### Multiple Pending Orders

If more than three orders are `pending`, the system displays the **most recently created** orders.
Older pending orders are deprioritized but remain accessible in the Orders view.

---

### Failed Order vs New Order

A failed order is shown prominently at first.
Over time, newer `pending` or `paid` orders may replace it in the Recent Activity feed.

This prevents terminal states from permanently occupying limited attention space.

---

## Order Number Handling

- Recent Activity currently displays an order number
- Account and Admin views do not
- Order number assignment logic requires investigation

**TODO**
- Document how order numbers are generated
- Decide where they should be consistently exposed

(This does not block implementation of the projection system.)

---

## Frontend Integration Notes

- Consumed by `frontend/features/orders`
- Frontend performs no deduplication or prioritization
- Backend guarantees:
  - One notification per order
  - Sorted and limited results
  - Stable semantics

---

## Non-Goals

- Persisting notification history
- Real-time push (WebSockets)
- Full event timelines
- Compliance/audit logging

These may be addressed by future systems.

---

## Future Extensions (Out of Scope)

- Dedicated “All Activity” page
- Expandable per-order timelines
- User-configurable filters
- Notification persistence

---

## Summary

This system prioritizes **clarity, relevance, and scalability** over raw completeness.
It reflects how users think about orders, not how systems log events.

Implementation should strictly follow the constraints and rules defined here.
