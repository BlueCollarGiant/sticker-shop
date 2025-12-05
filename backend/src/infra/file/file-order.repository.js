const fs = require('fs');
const path = require('path');

const ORDERS_FILE = path.join(__dirname, '../../data/orders.json');

function ensureStore() {
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.mkdirSync(path.dirname(ORDERS_FILE), { recursive: true });
    fs.writeFileSync(ORDERS_FILE, '[]', 'utf-8');
  }
}

function loadOrders() {
  ensureStore();
  try {
    const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading orders:', error);
    return [];
  }
}

function saveOrders(orders) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
}

class FileOrderRepository {
  async create(orderData) {
    const orders = loadOrders();

    const newOrder = {
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...orderData,
      status: orderData.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.push(newOrder);
    saveOrders(orders);

    return newOrder;
  }

  async getAll() {
    return loadOrders();
  }

  async getById(id) {
    const orders = loadOrders();
    const order = orders.find(o => o.id === id);

    if (!order) {
      throw new Error(`Order ${id} not found`);
    }

    return order;
  }

  async getByUserId(userId) {
    const orders = loadOrders();
    return orders.filter(o => o.userId === userId);
  }

  async updateStatus(id, status) {
    const orders = loadOrders();
    const index = orders.findIndex(o => o.id === id);

    if (index === -1) {
      throw new Error(`Order ${id} not found`);
    }

    orders[index].status = status;
    orders[index].updatedAt = new Date().toISOString();

    saveOrders(orders);
    return orders[index];
  }

  async delete(id) {
    const orders = loadOrders();
    const index = orders.findIndex(o => o.id === id);

    if (index === -1) {
      throw new Error(`Order ${id} not found`);
    }

    orders.splice(index, 1);
    saveOrders(orders);

    return { success: true, message: 'Order deleted successfully' };
  }

  async isEmpty() {
    return loadOrders().length === 0;
  }
}

module.exports = new FileOrderRepository();
