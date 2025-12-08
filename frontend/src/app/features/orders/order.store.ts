/**
 * Order Store
 * Signal-based state management for orders
 */

import { Injectable, signal, computed, inject } from '@angular/core';
import { OrderApi } from './order.api';
import { Order, CreateOrderInput, OrderStatus } from './order.types';

@Injectable({
  providedIn: 'root'
})
export class OrderStore {
  // Dependencies
  private orderApi = inject(OrderApi);

  // State
  private orders = signal<Order[]>([]);
  private loading = signal(false);
  private error = signal<string | null>(null);

  // Computed
  readonly allOrders = computed(() => this.orders());
  readonly isLoading = computed(() => this.loading());
  readonly errorMessage = computed(() => this.error());

  // Computed - User orders sorted by date (newest first)
  readonly userOrders = computed(() =>
    [...this.orders()].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );

  // Computed - Filter by status
  readonly pendingOrders = computed(() =>
    this.orders().filter(order => order.status === OrderStatus.PENDING)
  );

  readonly activeOrders = computed(() =>
    this.orders().filter(order =>
      [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED].includes(order.status)
    )
  );

  readonly completedOrders = computed(() =>
    this.orders().filter(order => order.status === OrderStatus.DELIVERED)
  );

  readonly cancelledOrders = computed(() =>
    this.orders().filter(order =>
      [OrderStatus.CANCELLED, OrderStatus.FAILED].includes(order.status)
    )
  );

  /**
   * Create a new order
   */
  async createOrder(input: CreateOrderInput): Promise<Order> {
    this.loading.set(true);
    this.error.set(null);

    return new Promise((resolve, reject) => {
      this.orderApi.createOrder(input).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            // Add to local state
            this.orders.update(orders => [response.data!, ...orders]);
            this.loading.set(false);
            resolve(response.data);
          } else {
            const errorMsg = response.error || 'Failed to create order';
            this.error.set(errorMsg);
            this.loading.set(false);
            reject(new Error(errorMsg));
          }
        },
        error: (err) => {
          const errorMsg = err.error?.message || err.message || 'Failed to create order';
          this.error.set(errorMsg);
          this.loading.set(false);
          reject(new Error(errorMsg));
        }
      });
    });
  }

  /**
   * Load current user's orders
   */
  loadUserOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    this.orderApi.getUserOrders().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.orders.set(response.data);
        } else {
          this.error.set(response.error || 'Failed to load orders');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || err.message || 'Failed to load orders');
        this.loading.set(false);
      }
    });
  }

  /**
   * Load all orders (admin only)
   */
  loadAllOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    this.orderApi.getAllOrders().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.orders.set(response.data);
        } else {
          this.error.set(response.error || 'Failed to load all orders');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || err.message || 'Failed to load all orders');
        this.loading.set(false);
      }
    });
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    this.loading.set(true);
    this.error.set(null);

    return new Promise((resolve) => {
      this.orderApi.getOrderById(orderId).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            // Update in local state if exists
            this.orders.update(orders =>
              orders.map(order => order.id === orderId ? response.data! : order)
            );
            this.loading.set(false);
            resolve(response.data);
          } else {
            this.error.set(response.error || 'Order not found');
            this.loading.set(false);
            resolve(null);
          }
        },
        error: (err) => {
          this.error.set(err.error?.message || err.message || 'Failed to load order');
          this.loading.set(false);
          resolve(null);
        }
      });
    });
  }

  /**
   * Update order status (admin only)
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);

    return new Promise((resolve) => {
      const normalizedStatus = (status as string).toLowerCase() as OrderStatus;
      this.orderApi.updateOrderStatus(orderId, { status: normalizedStatus }).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            // Update in local state
            this.orders.update(orders =>
              orders.map(order => order.id === orderId ? response.data! : order)
            );
            this.loading.set(false);
            resolve(true);
          } else {
            this.error.set(response.error || 'Failed to update order status');
            this.loading.set(false);
            resolve(false);
          }
        },
        error: (err) => {
          this.error.set(err.error?.message || err.message || 'Failed to update order status');
          this.loading.set(false);
          resolve(false);
        }
      });
    });
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);

    return new Promise((resolve) => {
      this.orderApi.cancelOrder(orderId).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            // Update in local state
            this.orders.update(orders =>
              orders.map(order => order.id === orderId ? response.data! : order)
            );
            this.loading.set(false);
            resolve(true);
          } else {
            this.error.set(response.error || 'Failed to cancel order');
            this.loading.set(false);
            resolve(false);
          }
        },
        error: (err) => {
          this.error.set(err.error?.message || err.message || 'Failed to cancel order');
          this.loading.set(false);
          resolve(false);
        }
      });
    });
  }

  /**
   * Delete order (admin only)
   */
  async deleteOrder(orderId: string): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);

    return new Promise((resolve) => {
      this.orderApi.deleteOrder(orderId).subscribe({
        next: (response) => {
          if (response.success) {
            // Remove from local state
            this.orders.update(orders => orders.filter(order => order.id !== orderId));
            this.loading.set(false);
            resolve(true);
          } else {
            this.error.set(response.error || 'Failed to delete order');
            this.loading.set(false);
            resolve(false);
          }
        },
        error: (err) => {
          this.error.set(err.error?.message || err.message || 'Failed to delete order');
          this.loading.set(false);
          resolve(false);
        }
      });
    });
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.error.set(null);
  }

  /**
   * Reset store
   */
  reset(): void {
    this.orders.set([]);
    this.loading.set(false);
    this.error.set(null);
  }
}
