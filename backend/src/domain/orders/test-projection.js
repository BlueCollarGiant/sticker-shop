/**
 * Manual Test Script for Order Activity Projection Service
 * Run with: node src/domain/orders/test-projection.js
 */

const { OrderProjectionService } = require('./order-projection.service.js');
const { OrderStatus } = require('./order.service.js');

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

// Test runner
function runTest(testName, testFn) {
  try {
    testFn();
    console.log(`✅ PASS: ${testName}`);
  } catch (error) {
    console.log(`❌ FAIL: ${testName}`);
    console.log(`   Error: ${error.message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\n   Expected: ${expected}\n   Actual: ${actual}`);
  }
}

function assertArrayLength(array, expectedLength, message) {
  if (array.length !== expectedLength) {
    throw new Error(`${message}\n   Expected length: ${expectedLength}\n   Actual length: ${array.length}`);
  }
}

console.log('\n=== Order Activity Projection Service Tests ===\n');

const projectionService = new OrderProjectionService();

// Test 1: Empty State
runTest('Empty state - returns empty array', () => {
  const result = projectionService.projectRecentActivity([]);
  assertArrayLength(result, 0, 'Should return empty array for no orders');
});

// Test 2: 3-Item Display Limit
runTest('Display limit - returns 2 when 2 orders exist', () => {
  const orders = [
    createOrder('order-1', OrderStatus.PENDING, '2025-12-23T10:00:00Z'),
    createOrder('order-2', OrderStatus.PAID, '2025-12-23T09:00:00Z'),
  ];
  const result = projectionService.projectRecentActivity(orders);
  assertArrayLength(result, 2, 'Should return all 2 orders');
});

runTest('Display limit - returns exactly 3 when 5 orders exist', () => {
  const orders = [
    createOrder('order-1', OrderStatus.PENDING, '2025-12-23T10:00:00Z'),
    createOrder('order-2', OrderStatus.PAID, '2025-12-23T09:00:00Z'),
    createOrder('order-3', OrderStatus.PROCESSING, '2025-12-23T08:00:00Z'),
    createOrder('order-4', OrderStatus.SHIPPED, '2025-12-23T07:00:00Z'),
    createOrder('order-5', OrderStatus.DELIVERED, '2025-12-23T06:00:00Z'),
  ];
  const result = projectionService.projectRecentActivity(orders);
  assertArrayLength(result, 3, 'Should return exactly 3 orders');
});

// Test 3: Status Priority - Pending is Highest
runTest('Status priority - pending ranks highest regardless of timestamp', () => {
  const orders = [
    createOrder('order-delivered', OrderStatus.DELIVERED, '2025-12-23T12:00:00Z'), // Newest
    createOrder('order-paid', OrderStatus.PAID, '2025-12-23T11:00:00Z'),
    createOrder('order-pending', OrderStatus.PENDING, '2025-12-23T08:00:00Z'), // Oldest
  ];
  const result = projectionService.projectRecentActivity(orders);
  assertEqual(result[0].orderId, 'order-pending', 'Pending should rank first');
  assertEqual(result[0].status, OrderStatus.PENDING, 'First status should be pending');
});

// Test 4: Status Priority - Full Order
runTest('Status priority - follows strict priority order (1-7)', () => {
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
  assertArrayLength(result, 3, 'Should return 3 orders');
  assertEqual(result[0].status, OrderStatus.PENDING, '1st should be pending (priority 1)');
  assertEqual(result[1].status, OrderStatus.PAID, '2nd should be paid (priority 2)');
  assertEqual(result[2].status, OrderStatus.FAILED, '3rd should be failed (priority 3)');
});

// Test 5: Multiple Pending Orders
runTest('Multiple pending - shows 3 most recent by createdAt', () => {
  const orders = [
    createOrder('order-pending-1', OrderStatus.PENDING, '2025-12-23T10:00:00Z'),
    createOrder('order-pending-2', OrderStatus.PENDING, '2025-12-23T09:00:00Z'),
    createOrder('order-pending-3', OrderStatus.PENDING, '2025-12-23T08:00:00Z'),
    createOrder('order-pending-4', OrderStatus.PENDING, '2025-12-23T07:00:00Z'),
    createOrder('order-pending-5', OrderStatus.PENDING, '2025-12-23T06:00:00Z'),
  ];
  const result = projectionService.projectRecentActivity(orders);
  assertArrayLength(result, 3, 'Should return 3 orders');
  assertEqual(result[0].orderId, 'order-pending-1', 'Most recent pending first');
  assertEqual(result[1].orderId, 'order-pending-2', 'Second most recent pending second');
  assertEqual(result[2].orderId, 'order-pending-3', 'Third most recent pending third');
});

// Test 6: Terminal vs Active Competition
runTest('Terminal competition - failed (3) beats processing (5)', () => {
  const orders = [
    createOrder('order-processing', OrderStatus.PROCESSING, '2025-12-23T12:00:00Z'), // Newer
    createOrder('order-failed', OrderStatus.FAILED, '2025-12-23T10:00:00Z'), // Older but higher priority
  ];
  const result = projectionService.projectRecentActivity(orders);
  assertEqual(result[0].status, OrderStatus.FAILED, 'Failed should rank higher than processing');
});

runTest('Terminal competition - allows all terminal in top 3', () => {
  const orders = [
    createOrder('order-failed', OrderStatus.FAILED, '2025-12-23T12:00:00Z'),
    createOrder('order-cancelled', OrderStatus.CANCELLED, '2025-12-23T11:00:00Z'),
    createOrder('order-delivered', OrderStatus.DELIVERED, '2025-12-23T10:00:00Z'),
  ];
  const result = projectionService.projectRecentActivity(orders);
  assertArrayLength(result, 3, 'Should return all 3 terminal orders');
  assertEqual(result.every(n => n.isTerminal === true), true, 'All should be terminal');
});

// Test 7: Recency Tie-Breaker
runTest('Recency - uses updatedAt for non-pending statuses', () => {
  const orders = [
    createOrder('order-paid-1', OrderStatus.PAID, '2025-12-20T10:00:00Z', '2025-12-23T12:00:00Z'),
    createOrder('order-paid-2', OrderStatus.PAID, '2025-12-21T10:00:00Z', '2025-12-23T11:00:00Z'),
  ];
  const result = projectionService.projectRecentActivity(orders);
  assertEqual(result[0].orderId, 'order-paid-1', 'Newer updatedAt should come first');
});

runTest('Recency - falls back to createdAt when updatedAt is identical', () => {
  const sameUpdatedAt = '2025-12-23T12:00:00Z';
  const orders = [
    createOrder('order-paid-1', OrderStatus.PAID, '2025-12-23T10:00:00Z', sameUpdatedAt),
    createOrder('order-paid-2', OrderStatus.PAID, '2025-12-23T11:00:00Z', sameUpdatedAt),
  ];
  const result = projectionService.projectRecentActivity(orders);
  assertEqual(result[0].orderId, 'order-paid-2', 'Newer createdAt should win when updatedAt is same');
});

// Test 8: OrderId Tie-Breaker
runTest('OrderId tie-breaker - uses lexical descending order', () => {
  const sameTimestamp = '2025-12-23T12:00:00Z';
  const orders = [
    createOrder('order-aaa', OrderStatus.PAID, sameTimestamp, sameTimestamp),
    createOrder('order-zzz', OrderStatus.PAID, sameTimestamp, sameTimestamp),
    createOrder('order-mmm', OrderStatus.PAID, sameTimestamp, sameTimestamp),
  ];
  const result = projectionService.projectRecentActivity(orders);
  assertEqual(result[0].orderId, 'order-zzz', 'Lexically largest should come first');
  assertEqual(result[1].orderId, 'order-mmm', 'Lexically middle should come second');
  assertEqual(result[2].orderId, 'order-aaa', 'Lexically smallest should come third');
});

// Test 9: Notification Output Contract
runTest('Output contract - includes all required fields', () => {
  const orders = [createOrder('order-1', OrderStatus.PENDING, '2025-12-23T12:00:00Z')];
  const result = projectionService.projectRecentActivity(orders);
  const notification = result[0];

  assertEqual(notification.hasOwnProperty('orderId'), true, 'Should have orderId');
  assertEqual(notification.hasOwnProperty('status'), true, 'Should have status');
  assertEqual(notification.hasOwnProperty('orderNumber'), true, 'Should have orderNumber');
  assertEqual(notification.hasOwnProperty('createdAt'), true, 'Should have createdAt');
  assertEqual(notification.hasOwnProperty('updatedAt'), true, 'Should have updatedAt');
  assertEqual(notification.hasOwnProperty('isTerminal'), true, 'Should have isTerminal');
});

runTest('Output contract - isTerminal is true for terminal statuses', () => {
  const orders = [
    createOrder('order-failed', OrderStatus.FAILED, '2025-12-23T12:00:00Z'),
    createOrder('order-cancelled', OrderStatus.CANCELLED, '2025-12-23T11:00:00Z'),
    createOrder('order-delivered', OrderStatus.DELIVERED, '2025-12-23T10:00:00Z'),
  ];
  const result = projectionService.projectRecentActivity(orders);
  assertEqual(result.every(n => n.isTerminal === true), true, 'All terminal orders should have isTerminal=true');
});

runTest('Output contract - isTerminal is false for active statuses', () => {
  const orders = [
    createOrder('order-pending', OrderStatus.PENDING, '2025-12-23T12:00:00Z'),
    createOrder('order-paid', OrderStatus.PAID, '2025-12-23T11:00:00Z'),
    createOrder('order-processing', OrderStatus.PROCESSING, '2025-12-23T10:00:00Z'),
  ];
  const result = projectionService.projectRecentActivity(orders);
  assertEqual(result.every(n => n.isTerminal === false), true, 'All active orders should have isTerminal=false');
});

runTest('Output contract - orderNumber is null when not present', () => {
  const orders = [createOrder('order-1', OrderStatus.PENDING, '2025-12-23T12:00:00Z')];
  const result = projectionService.projectRecentActivity(orders);
  assertEqual(result[0].orderNumber, null, 'OrderNumber should be null when not present');
});

// Test 10: Processing vs Shipped
runTest('Processing vs Shipped - processing ranks higher', () => {
  const orders = [
    createOrder('order-shipped', OrderStatus.SHIPPED, '2025-12-23T12:00:00Z'), // Newer
    createOrder('order-processing', OrderStatus.PROCESSING, '2025-12-23T10:00:00Z'), // Older
  ];
  const result = projectionService.projectRecentActivity(orders);
  assertEqual(result[0].status, OrderStatus.PROCESSING, 'Processing (priority 5) should beat shipped (priority 6)');
  assertEqual(result[1].status, OrderStatus.SHIPPED, 'Shipped should be second');
});

// Test 11: Mixed Active and Terminal
runTest('Mixed scenarios - correctly prioritizes across active and terminal', () => {
  const orders = [
    createOrder('order-pending', OrderStatus.PENDING, '2025-12-23T12:00:00Z'),
    createOrder('order-failed', OrderStatus.FAILED, '2025-12-23T11:00:00Z'),
    createOrder('order-processing', OrderStatus.PROCESSING, '2025-12-23T10:00:00Z'),
    createOrder('order-delivered', OrderStatus.DELIVERED, '2025-12-23T09:00:00Z'),
  ];
  const result = projectionService.projectRecentActivity(orders);
  assertArrayLength(result, 3, 'Should return 3 orders');
  assertEqual(result[0].status, OrderStatus.PENDING, '1st: pending (priority 1)');
  assertEqual(result[1].status, OrderStatus.FAILED, '2nd: failed (priority 3)');
  assertEqual(result[2].status, OrderStatus.PROCESSING, '3rd: processing (priority 5)');
  // delivered (priority 7) should be evicted
});

console.log('\n=== Test Summary ===');
console.log('All tests completed. Review results above.\n');
