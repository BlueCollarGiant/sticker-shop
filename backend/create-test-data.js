/**
 * Script to create test orders for frontend testing
 * Creates orders with different statuses to validate the Order Activity Projection
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function createTestData() {
  try {
    console.log('🔐 Logging in as demo user...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'demo@nightreader.com',
      password: 'demo123'
    });
    const userToken = loginResponse.data.data.token;

    console.log('🔐 Logging in as admin...');
    const adminResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@nightreader.com',
      password: 'admin123'
    });
    const adminToken = adminResponse.data.data.token;

    // Create orders with different statuses
    const statuses = ['pending', 'paid', 'processing', 'shipped', 'failed'];
    const now = new Date();

    for (let i = 0; i < statuses.length; i++) {
      const status = statuses[i];

      console.log(`\n📦 Creating order with status: ${status}...`);

      // Create order as user
      const orderResponse = await axios.post(
        `${API_BASE}/orders`,
        {
          items: [
            {
              productId: '1',
              productTitle: `Test Product ${i + 1}`,
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
            fullName: 'Demo User',
            address1: '123 Test St',
            address2: '',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'USA',
            phone: '5555555555'
          }
        },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      const orderId = orderResponse.data.data.id;
      console.log(`   ✅ Created order: ${orderId}`);

      // Update status if not pending
      if (status !== 'pending') {
        console.log(`   🔄 Updating status to: ${status}...`);
        await axios.patch(
          `${API_BASE}/orders/${orderId}/status`,
          { status },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.log(`   ✅ Status updated`);
      }

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n✅ Test data created successfully!');
    console.log('\n📊 Testing user activity endpoint...');

    const activityResponse = await axios.get(`${API_BASE}/orders/user/activity`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    console.log('\nRecent Activity Response:');
    console.log(JSON.stringify(activityResponse.data, null, 2));
    console.log(`\n✅ Returned ${activityResponse.data.data.length} notifications (max 3)`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

createTestData();
