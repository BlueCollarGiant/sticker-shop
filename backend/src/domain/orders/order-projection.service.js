const { OrderStatus } = require('./order.service.js');

/**
 * Order Activity Projection Service
 *
 * Implements the Order Activity Projection system as specified in the design document.
 * This is a stateless projection that computes recent activity notifications from order state.
 *
 * Key Design Principles:
 * - One order = one notification
 * - Notifications are computed on read, not persisted
 * - Selection based on relevance (status priority + recency), not just time
 * - Hard 3-item display limit
 * - Deterministic, stable ordering
 */
class OrderProjectionService {
  /**
   * Status priority map (1 = highest priority, 7 = lowest priority)
   * Per design document section "Primary Dimension — Status Priority"
   */
  static STATUS_PRIORITY = {
    [OrderStatus.PENDING]: 1,      // Requires immediate user action
    [OrderStatus.PAID]: 2,          // Active commitment awaiting fulfillment
    [OrderStatus.FAILED]: 3,        // Requires user attention or resolution
    [OrderStatus.CANCELLED]: 4,     // User-initiated termination
    [OrderStatus.PROCESSING]: 5,    // Active fulfillment work
    [OrderStatus.SHIPPED]: 6,       // In transit
    [OrderStatus.DELIVERED]: 7,     // Fulfillment complete
  };

  /**
   * Terminal statuses (final states, no further transitions)
   * Per design document section "Active vs Terminal Orders"
   */
  static TERMINAL_STATUSES = [
    OrderStatus.FAILED,
    OrderStatus.CANCELLED,
    OrderStatus.DELIVERED,
  ];

  /**
   * Projects recent activity notifications for a user
   *
   * @param {Array} orders - All orders for the authenticated user
   * @returns {Array} - Top 3 most relevant order notifications
   */
  projectRecentActivity(orders) {
    // Empty state: no orders exist
    if (!orders || orders.length === 0) {
      return [];
    }

    // Transform orders to notifications (one per order)
    const notifications = orders.map(order => this.transformOrderToNotification(order));

    // Sort by relevance (status priority, then recency, then orderId)
    const sortedNotifications = this.sortByRelevance(notifications);

    // Apply hard 3-item limit
    return sortedNotifications.slice(0, 3);
  }

  /**
   * Transforms an order entity into a notification projection
   * Per design document section "Notification Output Contract"
   *
   * @param {Object} order - Order entity
   * @returns {Object} - Notification projection
   */
  transformOrderToNotification(order) {
    return {
      orderId: order.id,
      status: order.status,
      orderNumber: order.orderNumber || null,  // Nullable per design doc
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      isTerminal: OrderProjectionService.TERMINAL_STATUSES.includes(order.status),
    };
  }

  /**
   * Sorts notifications by relevance using multi-dimensional comparison
   * Per design document sections "Relevance & Weighting Model" and "Eviction Rules"
   *
   * Comparison order:
   * 1. Status priority (strictly decisive across different statuses)
   * 2. Recency (tie-breaker within same status)
   * 3. orderId (final deterministic tie-breaker)
   *
   * @param {Array} notifications - Unsorted notifications
   * @returns {Array} - Sorted notifications (most relevant first)
   */
  sortByRelevance(notifications) {
    return [...notifications].sort((a, b) => {
      // 1. Primary Dimension: Status Priority
      // Lower priority number = higher relevance
      const priorityA = OrderProjectionService.STATUS_PRIORITY[a.status];
      const priorityB = OrderProjectionService.STATUS_PRIORITY[b.status];

      if (priorityA !== priorityB) {
        return priorityA - priorityB;  // Lower priority number comes first
      }

      // 2. Secondary Dimension: Recency (tie-breaker for same status)
      const recencyComparison = this.compareRecency(a, b);
      if (recencyComparison !== 0) {
        return recencyComparison;
      }

      // 3. Tertiary Dimension: orderId (deterministic tie-breaker)
      return this.compareOrderId(a.orderId, b.orderId);
    });
  }

  /**
   * Compares recency between two notifications
   * Per design document section "Secondary Dimension — Recency"
   *
   * Rules:
   * - pending uses createdAt
   * - All other statuses use updatedAt
   * - If updatedAt is identical, fall back to createdAt
   * - Newer timestamp wins (descending order)
   *
   * @param {Object} a - First notification
   * @param {Object} b - Second notification
   * @returns {number} - Negative if a > b, positive if b > a, 0 if equal
   */
  compareRecency(a, b) {
    const timestampA = this.getRecencyTimestamp(a);
    const timestampB = this.getRecencyTimestamp(b);

    const timeA = new Date(timestampA).getTime();
    const timeB = new Date(timestampB).getTime();

    if (timeA !== timeB) {
      return timeB - timeA;  // Newer timestamp comes first (descending)
    }

    // If primary timestamps are identical, fall back to createdAt
    // (only relevant when both used updatedAt)
    if (a.status !== OrderStatus.PENDING && b.status !== OrderStatus.PENDING) {
      const createdA = new Date(a.createdAt).getTime();
      const createdB = new Date(b.createdAt).getTime();

      if (createdA !== createdB) {
        return createdB - createdA;  // Newer createdAt comes first
      }
    }

    return 0;  // Timestamps are equal, proceed to next tie-breaker
  }

  /**
   * Gets the appropriate timestamp for recency comparison
   * Per design document "Timestamp Semantics"
   *
   * @param {Object} notification - Notification object
   * @returns {string} - ISO8601 timestamp string
   */
  getRecencyTimestamp(notification) {
    // pending uses createdAt, all others use updatedAt
    if (notification.status === OrderStatus.PENDING) {
      return notification.createdAt;
    }
    return notification.updatedAt;
  }

  /**
   * Compares orderIds lexically in descending order
   * Per design document section "Tertiary Dimension — Deterministic Tie-Breaker"
   *
   * @param {string} orderIdA - First order ID
   * @param {string} orderIdB - Second order ID
   * @returns {number} - Negative if a > b, positive if b > a, 0 if equal
   */
  compareOrderId(orderIdA, orderIdB) {
    // Lexical comparison, descending (larger/later IDs first)
    if (orderIdA > orderIdB) return -1;
    if (orderIdA < orderIdB) return 1;
    return 0;
  }
}

module.exports = { OrderProjectionService };
