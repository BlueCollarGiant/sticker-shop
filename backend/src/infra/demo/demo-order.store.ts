/**
 * Demo Order Store
 * File-based order repository for demo/development mode
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  IOrderRepository,
  Order,
  CreateOrderInput,
  OrderStatus,
} from '../../domain/orders/order.types';

export class DemoOrderStore implements IOrderRepository {
  private ordersFile = path.join(__dirname, '../../../data/demo-orders.json');
  private orders: Order[] = [];
  private orderCounter = 1;

  constructor() {
    this.loadOrders();
  }

  /**
   * Load orders from file
   */
  private async loadOrders(): Promise<void> {
    try {
      const data = await fs.readFile(this.ordersFile, 'utf-8');
      this.orders = JSON.parse(data).map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
      }));

      // Set counter to highest order number
      if (this.orders.length > 0) {
        const maxId = Math.max(
          ...this.orders.map((o) => parseInt(o.id.replace('order-', '')))
        );
        this.orderCounter = maxId + 1;
      }
    } catch (error) {
      // File doesn't exist, start with empty array
      this.orders = [];
      await this.saveOrders();
    }
  }

  /**
   * Save orders to file
   */
  private async saveOrders(): Promise<void> {
    try {
      await fs.writeFile(
        this.ordersFile,
        JSON.stringify(this.orders, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('[DemoOrderStore] Failed to save orders:', error);
    }
  }

  /**
   * Generate order number (e.g., NR20250112-001)
   */
  private generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const sequence = String(this.orderCounter).padStart(3, '0');
    return `NR${year}${month}${day}-${sequence}`;
  }

  /**
   * Create a new order
   */
  async create(input: CreateOrderInput): Promise<Order> {
    const order: Order = {
      id: `order-${this.orderCounter++}`,
      orderNumber: this.generateOrderNumber(),
      userId: input.userId,
      items: input.items,
      subtotal: input.subtotal,
      tax: input.tax,
      shipping: input.shipping,
      total: input.total,
      status: input.paymentIntentId ? OrderStatus.PAID : OrderStatus.PENDING,
      paymentIntentId: input.paymentIntentId,
      shippingAddress: input.shippingAddress,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.orders.unshift(order); // Add to beginning
    await this.saveOrders();

    return order;
  }

  /**
   * Find order by ID
   */
  async findById(id: string): Promise<Order | null> {
    return this.orders.find((order) => order.id === id) || null;
  }

  /**
   * Find orders by user ID
   */
  async findByUserId(userId: string): Promise<Order[]> {
    return this.orders
      .filter((order) => order.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Find all orders
   */
  async findAll(): Promise<Order[]> {
    return [...this.orders].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Update order status
   */
  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const orderIndex = this.orders.findIndex((order) => order.id === id);
    if (orderIndex === -1) {
      throw new Error(`Order with id ${id} not found`);
    }

    this.orders[orderIndex].status = status;
    this.orders[orderIndex].updatedAt = new Date();

    await this.saveOrders();

    return this.orders[orderIndex];
  }

  /**
   * Delete order
   */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const initialLength = this.orders.length;
    this.orders = this.orders.filter((order) => order.id !== id);

    if (this.orders.length === initialLength) {
      throw new Error(`Order with id ${id} not found`);
    }

    await this.saveOrders();

    return {
      success: true,
      message: `Order ${id} deleted successfully`,
    };
  }

  /**
   * Check if orders file is empty (for seeding)
   */
  async isEmpty(): Promise<boolean> {
    return this.orders.length === 0;
  }
}
