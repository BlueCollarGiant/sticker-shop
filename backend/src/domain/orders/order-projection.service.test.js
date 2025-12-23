const { OrderProjectionService } = require('./order-projection.service.js');
const { OrderStatus } = require('./order.service.js');

/**
 * Test suite for Order Activity Projection Service
 * Validates compliance with design document specifications
 */

describe('OrderProjectionService', () => {
  let projectionService;

  beforeEach(() => {
    projectionService = new OrderProjectionService();
  });

  describe('Empty State', () => {
    it('should return empty array when no orders exist', () => {
      const result = projectionService.projectRecentActivity([]);
      expect(result).toEqual([]);
    });

    it('should return empty array when orders is null', () => {
      const result = projectionService.projectRecentActivity(null);
      expect(result).toEqual([]);
    });

    it('should return empty array when orders is undefined', () => {
      const result = projectionService.projectRecentActivity(undefined);
      expect(result).toEqual([]);
    });
  });

  describe('3-Item Display Limit', () => {
    it('should return all orders when fewer than 3 exist', () => {
      const orders = [
        createOrder('order-1', OrderStatus.PENDING, '2025-12-23T10:00:00Z'),
        createOrder('order-2', OrderStatus.PAID, '2025-12-23T09:00:00Z'),
      ];

      const result = projectionService.projectRecentActivity(orders);
      expect(result).toHaveLength(2);
    });

    it('should return exactly 3 orders when exactly 3 exist', () => {
      const orders = [
        createOrder('order-1', OrderStatus.PENDING, '2025-12-23T10:00:00Z'),
        createOrder('order-2', OrderStatus.PAID, '2025-12-23T09:00:00Z'),
        createOrder('order-3', OrderStatus.PROCESSING, '2025-12-23T08:00:00Z'),
      ];

      const result = projectionService.projectRecentActivity(orders);
      expect(result).toHaveLength(3);
    });

    it('should return exactly 3 orders when more than 3 exist', () => {
      const orders = [
        createOrder('order-1', OrderStatus.PENDING, '2025-12-23T10:00:00Z'),
        createOrder('order-2', OrderStatus.PAID, '2025-12-23T09:00:00Z'),
        createOrder('order-3', OrderStatus.PROCESSING, '2025-12-23T08:00:00Z'),
        createOrder('order-4', OrderStatus.SHIPPED, '2025-12-23T07:00:00Z'),
        createOrder('order-5', OrderStatus.DELIVERED, '2025-12-23T06:00:00Z'),
      ];

      const result = projectionService.projectRecentActivity(orders);
      expect(result).toHaveLength(3);
    });
  });

  describe('Status Priority Ranking', () => {
    it('should prioritize pending over all other statuses', () => {
      const orders = [
        createOrder('order-delivered', OrderStatus.DELIVERED, '2025-12-23T12:00:00Z'),
        createOrder('order-paid', OrderStatus.PAID, '2025-12-23T11:00:00Z'),
        createOrder('order-pending', OrderStatus.PENDING, '2025-12-23T08:00:00Z'), // Oldest but highest priority
        createOrder('order-shipped', OrderStatus.SHIPPED, '2025-12-23T10:00:00Z'),
      ];

      const result = projectionService.projectRecentActivity(orders);
      expect(result[0].orderId).toBe('order-pending');
      expect(result[0].status).toBe(OrderStatus.PENDING);
    });

    it('should follow strict priority order: pending > paid > failed > cancelled > processing > shipped > delivered', () => {
      const orders = [
        createOrder('order-delivered', OrderStatus.DELIVERED, '2025-12-23T12:00:00Z'),
        createOrder('order-shipped', OrderStatus.SHIPPED, '2025-12-23T11:00:00Z'),
        createOrder('order-processing', OrderStatus.PROCESSING, '2025-12-23T10:00:00Z'),
        createOrder('order-cancelled', OrderStatus.CANCELLED, '2025-12-23T09:00:00Z'),
        createOrder('order-failed', OrderStatus.FAILED, '2025-12-23T08:00:00Z'),
        createOrder('order-paid', OrderStatus.PAID, '2025-12-23T07:00:00Z'),
        createOrder('order-pending', OrderStatus.PENDING, '2025-12-23T06:00:00Z'),
      ];

      const result = projectionService.projectRecentActivity(orders);
      expect(result).toHaveLength(3);
      expect(result[0].status).toBe(OrderStatus.PENDING);
      expect(result[1].status).toBe(OrderStatus.PAID);
      expect(result[2].status).toBe(OrderStatus.FAILED);
    });

    it('should not allow newer delivered to displace older pending', () => {
      const orders = [
        createOrder('order-pending', OrderStatus.PENDING, '2025-12-20T10:00:00Z'), // Old
        createOrder('order-delivered', OrderStatus.DELIVERED, '2025-12-23T12:00:00Z'), // New
      ];

      const result = projectionService.projectRecentActivity(orders);
      expect(result[0].orderId).toBe('order-pending');
      expect(result[1].orderId).toBe('order-delivered');
    });
  });

  describe('Multiple Pending Orders', () => {
    it('should show 3 most recent pending when more than 3 pending exist', () => {
      const orders = [
        createOrder('order-pending-1', OrderStatus.PENDING, '2025-12-23T10:00:00Z'),
        createOrder('order-pending-2', OrderStatus.PENDING, '2025-12-23T09:00:00Z'),
        createOrder('order-pending-3', OrderStatus.PENDING, '2025-12-23T08:00:00Z'),
        createOrder('order-pending-4', OrderStatus.PENDING, '2025-12-23T07:00:00Z'),
        createOrder('order-pending-5', OrderStatus.PENDING, '2025-12-23T06:00:00Z'),
      ];

      const result = projectionService.projectRecentActivity(orders);
      expect(result).toHaveLength(3);
      expect(result[0].orderId).toBe('order-pending-1'); // Most recent createdAt
      expect(result[1].orderId).toBe('order-pending-2');
      expect(result[2].orderId).toBe('order-pending-3');
    });

    it('should use createdAt for pending recency comparison', () => {
      const baseUpdatedAt = '2025-12-23T12:00:00Z';
      const orders = [
        { ...createOrder('order-pending-old', OrderStatus.PENDING, '2025-12-20T10:00:00Z'), updatedAt: baseUpdatedAt },
        { ...createOrder('order-pending-new', OrderStatus.PENDING, '2025-12-23T10:00:00Z'), updatedAt: baseUpdatedAt },
      ];

      const result = projectionService.projectRecentActivity(orders);
      expect(result[0].orderId).toBe('order-pending-new'); // Newer createdAt
    });
  });

  describe('Terminal Order Competition', () => {
    it('should allow terminal orders to compete with active orders based on priority', () => {
      const orders = [
        createOrder('order-processing', OrderStatus.PROCESSING, '2025-12-23T12:00:00Z'),
        createOrder('order-failed', OrderStatus.FAILED, '2025-12-23T10:00:00Z'),
        createOrder('order-shipped', OrderStatus.SHIPPED, '2025-12-23T11:00:00Z'),
      ];

      const result = projectionService.projectRecentActivity(orders);
      expect(result[0].status).toBe(OrderStatus.FAILED); // Priority 3
      expect(result[1].status).toBe(OrderStatus.PROCESSING); // Priority 5
      expect(result[2].status).toBe(OrderStatus.SHIPPED); // Priority 6
    });

    it('should include all terminal orders when 3 or fewer terminal orders exist', () => {
      const orders = [
        createOrder('order-failed', OrderStatus.FAILED, '2025-12-23T12:00:00Z'),
        createOrder('order-cancelled', OrderStatus.CANCELLED, '2025-12-23T11:00:00Z'),
        createOrder('order-delivered', OrderStatus.DELIVERED, '2025-12-23T10:00:00Z'),
      ];

      const result = projectionService.projectRecentActivity(orders);
      expect(result).toHaveLength(3);
      expect(result.every(n => n.isTerminal)).toBe(true);
    });

    it('should order terminal-to-terminal by priority: failed > cancelled > delivered', () => {
      const orders = [
        createOrder('order-delivered', OrderStatus.DELIVERED, '2025-12-23T12:00:00Z'),
        createOrder('order-cancelled', OrderStatus.CANCELLED, '2025-12-23T11:00:00Z'),
        createOrder('order-failed', OrderStatus.FAILED, '2025-12-23T10:00:00Z'),
      ];

      const result = projectionService.projectRecentActivity(orders);
      expect(result[0].status).toBe(OrderStatus.FAILED);
      expect(result[1].status).toBe(OrderStatus.CANCELLED);
      expect(result[2].status).toBe(OrderStatus.DELIVERED);
    });

    it('should use updatedAt for terminal order recency when statuses match', () => {
      const orders = [
        createOrder('order-delivered-1', OrderStatus.DELIVERED, '2025-12-20T10:00:00Z', '2025-12-23T12:00:00Z'),
        createOrder('order-delivered-2', OrderStatus.DELIVERED, '2025-12-21T10:00:00Z', '2025-12-23T11:00:00Z'),
        createOrder('order-delivered-3', OrderStatus.DELIVERED, '2025-12-22T10:00:00Z', '2025-12-23T10:00:00Z'),
      ];

      const result = projectionService.projectRecentActivity(orders);
      expect(result[0].orderId).toBe('order-delivered-1'); // Newest updatedAt
      expect(result[1].orderId).toBe('order-delivered-2');
      expect(result[2].orderId).toBe('order-delivered-3');
    });
  });

  describe('Recency Tie-Breaker', () => {
    it('should use updatedAt for non-pending statuses', () => {
      const orders = [
        createOrder('order-paid-1', OrderStatus.PAID, '2025-12-20T10:00:00Z', '2025-12-23T12:00:00Z'),
        createOrder('order-paid-2', OrderStatus.PAID, '2025-12-21T10:00:00Z', '2025-12-23T11:00:00Z'),
      ];

      const result = projectionService.projectRecentActivity(orders);
      expect(result[0].orderId).toBe('order-paid-1'); // Newer updatedAt
    });

    it('should fall back to createdAt when updatedAt is identical', () => {
      const sameUpdatedAt = '2025-12-23T12:00:00Z';
      const orders = [
        createOrder('order-paid-1', OrderStatus.PAID, '2025-12-23T10:00:00Z', sameUpdatedAt),
        createOrder('order-paid-2', OrderStatus.PAID, '2025-12-23T11:00:00Z', sameUpdatedAt),
      ];

      const result = projectionService.projectRecentActivity(orders);
      expect(result[0].orderId).toBe('order-paid-2'); // Newer createdAt
    });
  });

  describe('OrderId Tie-Breaker', () => {
    it('should use orderId when all other comparisons are equal', () => {
      const sameTimestamp = '2025-12-23T12:00:00Z';
      const orders = [
        createOrder('order-aaa', OrderStatus.PAID, sameTimestamp, sameTimestamp),
        createOrder('order-zzz', OrderStatus.PAID, sameTimestamp, sameTimestamp),
        createOrder('order-mmm', OrderStatus.PAID, sameTimestamp, sameTimestamp),
      ];

      const result = projectionService.projectRecentActivity(orders);
      expect(result[0].orderId).toBe('order-zzz'); // Lexically largest
      expect(result[1].orderId).toBe('order-mmm');
      expect(result[2].orderId).toBe('order-aaa');
    });

    it('should handle numeric-like orderIds lexically', () => {
      const sameTimestamp = '2025-12-23T12:00:00Z';
      const orders = [
        createOrder('order-1', OrderStatus.PAID, sameTimestamp, sameTimestamp),
        createOrder('order-10', OrderStatus.PAID, sameTimestamp, sameTimestamp),
        createOrder('order-2', OrderStatus.PAID, sameTimestamp, sameTimestamp),
      ];

      const result = projectionService.projectRecentActivity(orders);
      // Lexical: "order-2" > "order-10" > "order-1"
      expect(result[0].orderId).toBe('order-2');
      expect(result[1].orderId).toBe('order-10');
      expect(result[2].orderId).toBe('order-1');
    });
  });

  describe('Notification Output Contract', () => {
    it('should include all required fields', () => {
      const orders = [
        createOrder('order-1', OrderStatus.PENDING, '2025-12-23T12:00:00Z'),
      ];

      const result = projectionService.projectRecentActivity(orders);
      const notification = result[0];

      expect(notification).toHaveProperty('orderId');
      expect(notification).toHaveProperty('status');
      expect(notification).toHaveProperty('orderNumber');
      expect(notification).toHaveProperty('createdAt');
      expect(notification).toHaveProperty('updatedAt');
      expect(notification).toHaveProperty('isTerminal');
    });

    it('should set isTerminal to true for terminal statuses', () => {
      const orders = [
        createOrder('order-failed', OrderStatus.FAILED, '2025-12-23T12:00:00Z'),
        createOrder('order-cancelled', OrderStatus.CANCELLED, '2025-12-23T11:00:00Z'),
        createOrder('order-delivered', OrderStatus.DELIVERED, '2025-12-23T10:00:00Z'),
      ];

      const result = projectionService.projectRecentActivity(orders);
      expect(result.every(n => n.isTerminal === true)).toBe(true);
    });

    it('should set isTerminal to false for active statuses', () => {
      const orders = [
        createOrder('order-pending', OrderStatus.PENDING, '2025-12-23T12:00:00Z'),
        createOrder('order-paid', OrderStatus.PAID, '2025-12-23T11:00:00Z'),
        createOrder('order-processing', OrderStatus.PROCESSING, '2025-12-23T10:00:00Z'),
        createOrder('order-shipped', OrderStatus.SHIPPED, '2025-12-23T09:00:00Z'),
      ];

      const result = projectionService.projectRecentActivity(orders);
      expect(result.every(n => n.isTerminal === false)).toBe(true);
    });

    it('should return null for orderNumber when not present', () => {
      const orders = [
        createOrder('order-1', OrderStatus.PENDING, '2025-12-23T12:00:00Z'),
      ];

      const result = projectionService.projectRecentActivity(orders);
      expect(result[0].orderNumber).toBeNull();
    });

    it('should pass through orderNumber when present', () => {
      const orders = [
        { ...createOrder('order-1', OrderStatus.PENDING, '2025-12-23T12:00:00Z'), orderNumber: 'ORD-12345' },
      ];

      const result = projectionService.projectRecentActivity(orders);
      expect(result[0].orderNumber).toBe('ORD-12345');
    });
  });

  describe('Processing vs Shipped Competition', () => {
    it('should rank processing higher than shipped', () => {
      const orders = [
        createOrder('order-shipped', OrderStatus.SHIPPED, '2025-12-23T12:00:00Z'), // Newer
        createOrder('order-processing', OrderStatus.PROCESSING, '2025-12-23T10:00:00Z'), // Older
      ];

      const result = projectionService.projectRecentActivity(orders);
      expect(result[0].status).toBe(OrderStatus.PROCESSING); // Higher priority
      expect(result[1].status).toBe(OrderStatus.SHIPPED);
    });
  });

  describe('Mixed Active and Terminal Notifications', () => {
    it('should handle mixed scenarios correctly', () => {
      const orders = [
        createOrder('order-pending', OrderStatus.PENDING, '2025-12-23T12:00:00Z'),
        createOrder('order-failed', OrderStatus.FAILED, '2025-12-23T11:00:00Z'),
        createOrder('order-processing', OrderStatus.PROCESSING, '2025-12-23T10:00:00Z'),
        createOrder('order-delivered', OrderStatus.DELIVERED, '2025-12-23T09:00:00Z'),
      ];

      const result = projectionService.projectRecentActivity(orders);
      expect(result).toHaveLength(3);
      expect(result[0].status).toBe(OrderStatus.PENDING); // Priority 1
      expect(result[1].status).toBe(OrderStatus.FAILED); // Priority 3
      expect(result[2].status).toBe(OrderStatus.PROCESSING); // Priority 5
      // delivered (priority 7) is evicted
    });
  });
});

// Helper function to create test orders
function createOrder(id, status, createdAt, updatedAt = null) {
  return {
    id,
    status,
    createdAt,
    updatedAt: updatedAt || createdAt,
    items: [],
    subtotal: 10.0,
    tax: 1.0,
    shipping: 5.0,
    total: 16.0,
    shippingAddress: {},
    userId: 'test-user-1',
  };
}
