/**
 * Integration Test for Order Activity Projection API
 * Tests the GET /api/orders/user/activity endpoint
 *
 * Prerequisites: Backend server must be running on port 3000
 * Run with: node test-integration.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3000/api';
const TEST_USER_EMAIL = 'demo@nightreader.com';
const TEST_USER_PASSWORD = 'demo123';

let authToken = null;
let userId = null;

// Utility functions
async function login() {
  console.log('\n📝 Logging in as test user...');
  const response = await axios.post(`${API_BASE}/auth/login`, {
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD
  });

  authToken = response.data.data.token;
  userId = response.data.data.user.id;
  console.log(`✅ Logged in successfully as ${response.data.data.user.name} (${userId})`);
}

function getAuthHeaders() {
  return { Authorization: `Bearer ${authToken}` };
}

async function createTestOrder(status, createdAt, updatedAt = null) {
  const orderData = {
    items: [
      {
        productId: '1',
        productTitle: 'Test Product',
        productImage: 'https://placehold.co/600x600',
        quantity: 1,
        price: 9.99,
        subtotal: 9.99
      }
    ],
    subtotal: 9.99,
    tax: 0.80,
    shipping: 5.99,
    total: 16.78,
    shippingAddress: {
      fullName: 'Test User',
      address1: '123 Test St',
      address2: '',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'USA',
      phone: '5555555555'
    }
  };

  const response = await axios.post(`${API_BASE}/orders`, orderData, {
    headers: getAuthHeaders()
  });

  const orderId = response.data.data.id;

  // Update status if not pending
  if (status !== 'pending') {
    // Need admin access to update status
    const adminResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@nightreader.com',
      password: 'admin123'
    });
    const adminToken = adminResponse.data.data.token;

    await axios.patch(
      `${API_BASE}/orders/${orderId}/status`,
      { status },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
  }

  // Manually update timestamps in the data file if needed
  if (createdAt || updatedAt) {
    const ordersPath = path.join(__dirname, 'src', 'data', 'orders.json');
    const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    const order = orders.find(o => o.id === orderId);
    if (order) {
      if (createdAt) order.createdAt = createdAt;
      if (updatedAt) order.updatedAt = updatedAt;
      fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
    }
  }

  return orderId;
}

async function getUserActivity() {
  const response = await axios.get(`${API_BASE}/orders/user/activity`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

function clearOrders() {
  const ordersPath = path.join(__dirname, 'src', 'data', 'orders.json');
  fs.writeFileSync(ordersPath, JSON.stringify([], null, 2));
  console.log('🗑️  Cleared all orders');
}

// Test scenarios
async function testEmptyState() {
  console.log('\n=== Test 1: Empty State ===');
  clearOrders();

  const result = await getUserActivity();
  console.log('Response:', JSON.stringify(result, null, 2));

  if (result.data.length === 0) {
    console.log('✅ PASS: Returns empty array when no orders exist');
  } else {
    console.log('❌ FAIL: Expected empty array, got', result.data.length, 'items');
  }
}

async function testMultiplePending() {
  console.log('\n=== Test 2: Multiple Pending Orders (>3) ===');
  clearOrders();

  // Create 5 pending orders with different timestamps
  const now = new Date();
  const orders = [];
  for (let i = 0; i < 5; i++) {
    const timestamp = new Date(now.getTime() - (i * 60000)).toISOString();
    const orderId = await createTestOrder('pending', timestamp, timestamp);
    orders.push({ orderId, timestamp });
  }

  const result = await getUserActivity();
  console.log('Total orders created:', orders.length);
  console.log('Notifications returned:', result.data.length);
  console.log('Notifications:', result.data.map(n => ({ orderId: n.orderId, status: n.status })));

  if (result.data.length === 3) {
    console.log('✅ PASS: Returns exactly 3 notifications');

    // Verify they are the 3 most recent
    const allPending = result.data.every(n => n.status === 'pending');
    if (allPending) {
      console.log('✅ PASS: All notifications are pending status');
    } else {
      console.log('❌ FAIL: Not all notifications are pending');
    }
  } else {
    console.log('❌ FAIL: Expected 3 notifications, got', result.data.length);
  }
}

async function testStatusPriority() {
  console.log('\n=== Test 3: Status Priority Ranking ===');
  clearOrders();

  const now = new Date();
  // Create orders with different statuses, newest to oldest
  // delivered (newest), paid, pending (oldest)
  const delivered = await createTestOrder(
    'delivered',
    new Date(now.getTime() - 120000).toISOString(),
    new Date(now.getTime()).toISOString()
  );

  const paid = await createTestOrder(
    'paid',
    new Date(now.getTime() - 90000).toISOString(),
    new Date(now.getTime() - 30000).toISOString()
  );

  const pending = await createTestOrder(
    'pending',
    new Date(now.getTime() - 180000).toISOString(),
    new Date(now.getTime() - 180000).toISOString()
  );

  const result = await getUserActivity();
  console.log('Notifications:', result.data.map(n => ({ orderId: n.orderId, status: n.status })));

  if (result.data[0].status === 'pending') {
    console.log('✅ PASS: Pending ranks first (priority 1)');
  } else {
    console.log('❌ FAIL: Expected pending first, got', result.data[0].status);
  }

  if (result.data[1].status === 'paid') {
    console.log('✅ PASS: Paid ranks second (priority 2)');
  } else {
    console.log('❌ FAIL: Expected paid second, got', result.data[1].status);
  }
}

async function testTerminalVsActive() {
  console.log('\n=== Test 4: Terminal vs Active Competition ===');
  clearOrders();

  const now = new Date();

  // Create: processing (newer), failed (older but higher priority)
  await createTestOrder(
    'processing',
    new Date(now.getTime() - 30000).toISOString(),
    new Date(now.getTime()).toISOString()
  );

  await createTestOrder(
    'failed',
    new Date(now.getTime() - 90000).toISOString(),
    new Date(now.getTime() - 60000).toISOString()
  );

  const result = await getUserActivity();
  console.log('Notifications:', result.data.map(n => ({ orderId: n.orderId, status: n.status })));

  if (result.data[0].status === 'failed') {
    console.log('✅ PASS: Failed (priority 3) beats processing (priority 5)');
  } else {
    console.log('❌ FAIL: Expected failed first, got', result.data[0].status);
  }

  const failedNotification = result.data.find(n => n.status === 'failed');
  if (failedNotification && failedNotification.isTerminal === true) {
    console.log('✅ PASS: Failed order has isTerminal=true');
  } else {
    console.log('❌ FAIL: Failed order should have isTerminal=true');
  }
}

async function testOutputContract() {
  console.log('\n=== Test 5: Notification Output Contract ===');
  clearOrders();

  await createTestOrder('pending', new Date().toISOString());

  const result = await getUserActivity();
  const notification = result.data[0];

  const requiredFields = ['orderId', 'status', 'orderNumber', 'createdAt', 'updatedAt', 'isTerminal'];
  const hasAllFields = requiredFields.every(field => notification.hasOwnProperty(field));

  if (hasAllFields) {
    console.log('✅ PASS: Notification includes all required fields');
    console.log('   Fields:', Object.keys(notification));
  } else {
    console.log('❌ FAIL: Missing required fields');
    console.log('   Expected:', requiredFields);
    console.log('   Actual:', Object.keys(notification));
  }

  if (notification.orderNumber === null) {
    console.log('✅ PASS: orderNumber is null when not present');
  } else {
    console.log('❌ FAIL: orderNumber should be null, got', notification.orderNumber);
  }
}

// Main test runner
async function runTests() {
  try {
    console.log('=================================================');
    console.log('  Order Activity Projection - Integration Tests');
    console.log('=================================================');

    await login();

    await testEmptyState();
    await testMultiplePending();
    await testStatusPriority();
    await testTerminalVsActive();
    await testOutputContract();

    console.log('\n=================================================');
    console.log('  All integration tests completed');
    console.log('=================================================\n');

  } catch (error) {
    console.error('\n❌ Error running tests:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

runTests();
