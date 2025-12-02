/**
 * Order Service
 * Business logic for order operations
 */

import { IOrderRepository, Order, CreateOrderInput, OrderStatus } from './order.types';

export class OrderService {
  constructor(private repository: IOrderRepository) {}

  /**
   * Create a new order
   */
  async createOrder(input: CreateOrderInput): Promise<Order> {
    // Validate order items
    if (!input.items || input.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    // Validate totals
    if (input.total <= 0) {
      throw new Error('Order total must be greater than zero');
    }

    // Validate user
    if (!input.userId) {
      throw new Error('User ID is required');
    }

    return this.repository.create(input);
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<Order> {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new Error(`Order with id ${id} not found`);
    }
    return order;
  }

  /**
   * Get orders for a specific user
   */
  async getUserOrders(userId: string): Promise<Order[]> {
    return this.repository.findByUserId(userId);
  }

  /**
   * Get all orders (admin only)
   */
  async getAllOrders(): Promise<Order[]> {
    return this.repository.findAll();
  }

  /**
   * Update order status
   */
  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new Error(`Order with id ${id} not found`);
    }

    return this.repository.updateStatus(id, status);
  }

  /**
   * Cancel order (user or admin)
   */
  async cancelOrder(id: string, userId?: string): Promise<Order> {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new Error(`Order with id ${id} not found`);
    }

    // If userId provided, verify ownership
    if (userId && order.userId !== userId) {
      throw new Error('You can only cancel your own orders');
    }

    // Only allow cancellation of pending/paid orders
    if (!['pending', 'paid'].includes(order.status)) {
      throw new Error(`Cannot cancel order with status: ${order.status}`);
    }

    return this.repository.updateStatus(id, OrderStatus.CANCELLED);
  }

  /**
   * Delete order (admin only)
   */
  async deleteOrder(id: string): Promise<{ success: boolean; message: string }> {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new Error(`Order with id ${id} not found`);
    }

    return this.repository.delete(id);
  }
}
