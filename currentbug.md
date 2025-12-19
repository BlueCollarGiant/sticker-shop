# Recent Activity System - Technical Documentation

## Overview
The Recent Activity system displays a live feed of user order activities on the account dashboard. It shows order placements and status changes in real-time by polling the backend every 10 seconds.

---

## System Architecture

### Frontend Components

#### 1. Dashboard Component
**Location:** `frontend/src/app/components/account/dashboard/dashboard.ts`

**Key Features:**
- **Auto-refresh polling:** Fetches activity every 10 seconds (lines 58-61)
- **Signal-based state:** Uses Angular signals for reactive updates
- **Activity limit:** Displays only 3 most recent activities (line 86)
- **Cleanup:** Properly destroys polling interval on component destroy (lines 68-73)

**Data Flow:**
```typescript
loadUserActivity() → OrderApi.getUserActivity() → Backend API → Update recentActivity signal
```

**State Management:**
- `recentActivity` - Signal containing array of ActivityItem objects
- `isLoadingActivity` - Signal for loading state
- Auto-refresh interval runs continuously while component is mounted

#### 2. Dashboard Template
**Location:** `frontend/src/app/components/account/dashboard/dashboard.html`

**Display Logic (lines 42-67):**
- Shows loading state while fetching
- Iterates through activity items
- Displays icon, message, and timestamp for each activity
- Shows "No recent activity" if empty

---

### Backend Implementation

#### 1. Order Controller - getUserActivity Method
**Location:** `backend/src/domain/orders/order.controller.js` (lines 235-310)

**Current Implementation:**

**Step 1: Fetch User Orders**
```javascript
const orders = await this.orderService.getUserOrders(userId);
```
Retrieves ALL orders for the authenticated user.

**Step 2: Convert Orders to Activities**
For each order:

1. **Always creates "Order Placed" activity:**
   - ID: `${order.id}-placed`
   - Type: `order_placed`
   - Icon: 📦
   - Timestamp: `order.createdAt`
   - Message: "Order #[last-8-digits] placed"

2. **Conditionally creates "Status Change" activity:**
   - Only if status != 'pending'
   - Only if `updatedAt` differs from `createdAt` (meaning status actually changed)
   - Checks against status configuration map:

```javascript
const statusConfig = {
  paid: { message: 'Payment confirmed', icon: '💳', type: 'order_paid' },
  processing: { message: 'Processing order', icon: '⚙️', type: 'order_processing' },
  shipped: { message: 'Order shipped', icon: '🚚', type: 'order_shipped' },
  delivered: { message: 'Order delivered', icon: '✅', type: 'order_delivered' },
  cancelled: { message: 'Order cancelled', icon: '❌', type: 'order_cancelled' },
};
```

**Step 3: Sort and Limit**
- Sorts by timestamp descending (most recent first)
- Limits to 10 most recent activities
- Returns to frontend

---

## Current Bug Analysis

### The Problem
**Issue:** Activity feed creates clutter with many orders

**Why it happens:**
1. **Every order generates 2 activities minimum:**
   - One for "Order Placed"
   - One for current status (if changed)

2. **No deduplication:**
   - Same order appears multiple times in feed
   - Example: Order #abc123 shows as both "placed" and "paid"

3. **No intelligent filtering:**
   - Shows all status changes equally
   - No prioritization of active vs completed orders
   - Old delivered orders clutter feed alongside new pending orders

4. **Scalability issues:**
   - User with 10 orders = potentially 20 activities
   - Only showing last 10 means losing context
   - No grouping by order

### Example Scenario
User places 5 orders, admin updates 2 to "paid":

**Current Feed (cluttered):**
```
💳 Order #abc123 - Payment confirmed (2 mins ago)
📦 Order #abc123 placed (1 hour ago)
💳 Order #def456 - Payment confirmed (5 mins ago)
📦 Order #def456 placed (1 hour ago)
📦 Order #ghi789 placed (30 mins ago)
📦 Order #jkl012 placed (45 mins ago)
📦 Order #mno345 placed (2 hours ago)
```

**Issues:**
- Same order (abc123) appears twice
- No clear "current state" view
- Mix of old and new without context

---

## Proposed Solution

### Option 1: Order-Centric Grouping (Recommended)

#### Backend Changes
**New data structure - one activity per order:**

```javascript
{
  id: order.id,
  orderId: order.id,
  type: 'order_status',
  currentStatus: order.status,
  statusIcon: getIconForStatus(order.status),
  statusMessage: getMessageForStatus(order.status),
  message: `Order #${order.id.slice(-8)} - ${statusMessage}`,
  placedAt: order.createdAt,
  lastUpdated: order.updatedAt,
  timestamp: order.updatedAt, // Sort by latest update
  icon: statusIcon,
  metadata: {
    orderId: order.id,
    total: order.total,
    status: order.status,
    isActive: !['delivered', 'cancelled'].includes(order.status)
  }
}
```

#### Implementation Changes

**getUserActivity method:**
1. Fetch user orders
2. Transform each order into ONE activity (not multiple)
3. Sort by `updatedAt` (most recently updated first)
4. Prioritize active orders over completed
5. Limit to 5-10 most relevant

**Benefits:**
- One card per order = less clutter
- Shows current status at a glance
- Emphasizes recently updated orders
- Scales better with many orders

---

### Option 2: Time-Based Filtering

**Changes:**
- Only show activities from last 7 days
- Group by date: "Today", "This Week", "Earlier"
- Limit to 3-5 per section

**Benefits:**
- Natural organization by recency
- Reduces old order noise
- Better for high-volume users

---

### Option 3: Smart Categorization

**Split activities into tabs:**
- **Active Orders** (pending → shipped)
- **Completed** (delivered)
- **Issues** (cancelled)

**Benefits:**
- User chooses what to see
- Reduces visual overload
- Clear separation of concerns

---

## Recommended Implementation Plan

### Phase 1: Backend Refactor
1. Modify `getUserActivity` to return one activity per order
2. Include status priority (active > completed)
3. Add `isActive` flag to metadata
4. Sort by `updatedAt` instead of creating duplicate entries

### Phase 2: Frontend Enhancement
1. Update ActivityItem model to include new fields
2. Add visual distinction for active vs completed
3. Display both "placed" and "updated" timestamps
4. Add color coding by status

### Phase 3: UX Polish
1. Add "View Order" button to each activity
2. Implement expandable timeline (optional)
3. Add filter/sort options
4. Consider dedicated "All Activity" page for history

---

## Technical Considerations

### Current Data Flow
```
User Dashboard (auto-refresh 10s)
    ↓
OrderApi.getUserActivity()
    ↓
Backend: OrderController.getUserActivity()
    ↓
OrderService.getUserOrders(userId)
    ↓
Transform orders → activities
    ↓
Sort & limit to 10
    ↓
Return to frontend
    ↓
Display in dashboard (limit 3)
```

### Why Current Approach Works But Is Inefficient
- **Works:** Shows all status changes accurately
- **Inefficient:** Creates N×2 activities (placed + status) for N orders
- **Problem:** Doesn't scale beyond ~5 orders without clutter

---

## Conclusion

The recent activity system correctly tracks order events but needs smarter grouping to reduce clutter. The recommended approach is **order-centric grouping** where each order appears once with its current status, rather than creating separate activities for placement and each status change.

This maintains full visibility while dramatically reducing visual noise and improving scalability for users with many orders.
