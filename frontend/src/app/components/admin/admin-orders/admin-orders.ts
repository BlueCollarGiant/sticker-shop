import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderStore } from '../../../features/orders/order.store';
import { Order, OrderStatus } from '../../../features/orders/order.types';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css'
})
export class AdminOrdersComponent implements OnInit {
  orderStore = inject(OrderStore);

  // Computed from OrderStore
  allOrders = computed(() => this.orderStore.allOrders());
  loading = computed(() => this.orderStore.isLoading());
  error = computed(() => this.orderStore.errorMessage());

  // Filter state
  statusFilter = signal<OrderStatus | 'all'>('all');
  searchQuery = signal('');

  // Order statuses for dropdown
  orderStatuses = Object.values(OrderStatus);

  // Filtered orders
  filteredOrders = computed(() => {
    let orders = this.allOrders();

    // Filter by status
    const filter = this.statusFilter();
    if (filter !== 'all') {
      orders = orders.filter(order => order.status === filter);
    }

    // Filter by search query
    const query = this.searchQuery().toLowerCase();
    if (query) {
      orders = orders.filter(order =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.userId.toLowerCase().includes(query) ||
        order.items.some(item => item.productTitle.toLowerCase().includes(query))
      );
    }

    return orders;
  });

  // Stats
  totalOrders = computed(() => this.allOrders().length);
  pendingOrders = computed(() => this.orderStore.pendingOrders().length);
  activeOrders = computed(() => this.orderStore.activeOrders().length);
  completedOrders = computed(() => this.orderStore.completedOrders().length);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    // Load all orders (admin endpoint)
    this.orderStore.loadAllOrders();
  }

  async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    const success = await this.orderStore.updateOrderStatus(orderId, newStatus);
    if (success) {
      console.log('Order status updated successfully');
    } else {
      const errorMsg = this.orderStore.errorMessage();
      alert(errorMsg || 'Failed to update order status');
    }
  }

  async deleteOrder(orderId: string, orderNumber: string) {
    const confirmed = confirm(`Are you sure you want to delete order ${orderNumber}? This action cannot be undone.`);
    if (!confirmed) return;

    const success = await this.orderStore.deleteOrder(orderId);
    if (success) {
      console.log('Order deleted successfully');
    } else {
      const errorMsg = this.orderStore.errorMessage();
      alert(errorMsg || 'Failed to delete order');
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

  setFilterActive() {
    // Show paid, processing, and shipped orders
    this.statusFilter.set(OrderStatus.PROCESSING);
  }

  setFilterCompleted() {
    this.statusFilter.set(OrderStatus.DELIVERED);
  }

  updateSearch(query: string) {
    this.searchQuery.set(query);
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getItemCount(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}
