const fs = require('fs');
const path = require('path');

const ORDERS_FILE = path.join(__dirname, '../../data/demo-orders.json');

class FileOrderRepository {
  loadOrders() {
    try {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      return [];
    }
  }

  saveOrders(orders) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  }

  async create(orderData) {
    const orders = this.loadOrders();

    const newOrder = {
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...orderData,
      status: orderData.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.push(newOrder);
    this.saveOrders(orders);

    return newOrder;
  }

  async getAll() {
    return this.loadOrders();
  }

  async getById(id) {
    const orders = this.loadOrders();
    const order = orders.find(o => o.id === id);

    if (!order) {
      throw new Error(`Order ${id} not found`);
    }

    return order;
  }

  async getByUserId(userId) {
    const orders = this.loadOrders();
    return orders.filter(o => o.userId === userId);
  }

  async updateStatus(id, status) {
    const orders = this.loadOrders();
    const index = orders.findIndex(o => o.id === id);

    if (index === -1) {
      throw new Error(`Order ${id} not found`);
    }

    orders[index].status = status;
    orders[index].updatedAt = new Date().toISOString();

    this.saveOrders(orders);
    return orders[index];
  }

  async delete(id) {
    const orders = this.loadOrders();
    const index = orders.findIndex(o => o.id === id);

    if (index === -1) {
      throw new Error(`Order ${id} not found`);
    }

    orders.splice(index, 1);
    this.saveOrders(orders);

    return { success: true, message: 'Order deleted successfully' };
  }

  async isEmpty() {
    return this.loadOrders().length === 0;
  }
}

module.exports = new FileOrderRepository();
