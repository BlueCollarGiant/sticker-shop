import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../../features/auth/auth.store';
import { OrderStore } from '../../../features/orders/order.store';
import { Order, OrderStatus } from '../../../features/orders/order.types';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class OrdersComponent implements OnInit {
  auth = inject(AuthStore);
  orderStore = inject(OrderStore);

  // Computed from OrderStore
  orders = computed(() => this.orderStore.userOrders());
  loading = computed(() => this.orderStore.isLoading());
  error = computed(() => this.orderStore.errorMessage());

  // Filter state
  statusFilter = signal<OrderStatus | 'all'>('all');

  // Filtered orders
  filteredOrders = computed(() => {
    const filter = this.statusFilter();
    if (filter === 'all') {
      return this.orders();
    }
    return this.orders().filter(order => order.status === filter);
  });

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    const currentUser = this.auth.user();

    if (!currentUser) {
      console.error('No user logged in');
      return;
    }

    // Load orders from backend via OrderStore
    this.orderStore.loadUserOrders();
  }

  async cancelOrder(orderId: string) {
    const confirmed = confirm('Are you sure you want to cancel this order?');
    if (!confirmed) return;

    const success = await this.orderStore.cancelOrder(orderId);
    if (success) {
      // Order will be updated in store automatically
      console.log('Order cancelled successfully');
    } else {
      const errorMsg = this.orderStore.errorMessage();
      alert(errorMsg || 'Failed to cancel order');
    }
  }

  setStatusFilter(status: OrderStatus | 'all') {
    this.statusFilter.set(status);
  }

  setFilterAll() {
    this.statusFilter.set('all');
  }

  setFilterPending() {
    this.statusFilter.set(OrderStatus.PENDING);
  }

  setFilterProcessing() {
    this.statusFilter.set(OrderStatus.PROCESSING);
  }

  setFilterShipped() {
    this.statusFilter.set(OrderStatus.SHIPPED);
  }

  setFilterDelivered() {
    this.statusFilter.set(OrderStatus.DELIVERED);
  }

  getStatusBadgeClass(status: OrderStatus): string {
    const classes: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'status-pending',
      [OrderStatus.PAID]: 'status-paid',
      [OrderStatus.PROCESSING]: 'status-processing',
      [OrderStatus.SHIPPED]: 'status-shipped',
      [OrderStatus.DELIVERED]: 'status-delivered',
      [OrderStatus.CANCELLED]: 'status-cancelled',
      [OrderStatus.FAILED]: 'status-failed'
    };
    return classes[status] || 'status-pending';
  }

  getStatusText(status: OrderStatus): string {
    const texts: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'Pending Payment',
      [OrderStatus.PAID]: 'Paid',
      [OrderStatus.PROCESSING]: 'Processing',
      [OrderStatus.SHIPPED]: 'Shipped',
      [OrderStatus.DELIVERED]: 'Delivered',
      [OrderStatus.CANCELLED]: 'Cancelled',
      [OrderStatus.FAILED]: 'Failed'
    };
    return texts[status] || 'Unknown';
  }

  canCancelOrder(order: Order): boolean {
    // Only allow cancel while pending (no longer once paid/processing/shipped/etc.)
    return order.status === OrderStatus.PENDING;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
