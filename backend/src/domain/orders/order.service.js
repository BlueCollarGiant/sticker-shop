const OrderStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

class OrderService {
  constructor(repository) {
    this.repository = repository;
  }

  async createOrder(input) {
    if (!input.items || input.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    if (input.total <= 0) {
      throw new Error('Order total must be greater than zero');
    }

    if (!input.userId) {
      throw new Error('User ID is required');
    }

    return this.repository.create(input);
  }

  async getOrderById(id) {
    const order = await this.repository.getById(id);
    if (!order) {
      throw new Error(`Order with id ${id} not found`);
    }
    return order;
  }

  async getUserOrders(userId) {
    return this.repository.getByUserId(userId);
  }

  async getAllOrders() {
    return this.repository.getAll();
  }

  async updateOrderStatus(id, status) {
    const order = await this.repository.getById(id);
    if (!order) {
      throw new Error(`Order with id ${id} not found`);
    }

    return this.repository.updateStatus(id, status);
  }

  async cancelOrder(id, userId) {
    const order = await this.repository.getById(id);
    if (!order) {
      throw new Error(`Order with id ${id} not found`);
    }

    if (userId && order.userId !== userId) {
      throw new Error('You can only cancel your own orders');
    }

    if (!['pending', 'paid'].includes(order.status)) {
      throw new Error(`Cannot cancel order with status: ${order.status}`);
    }

    return this.repository.updateStatus(id, OrderStatus.CANCELLED);
  }

  async deleteOrder(id) {
    const order = await this.repository.getById(id);
    if (!order) {
      throw new Error(`Order with id ${id} not found`);
    }

    return this.repository.delete(id);
  }
}

module.exports = { OrderService, OrderStatus };
