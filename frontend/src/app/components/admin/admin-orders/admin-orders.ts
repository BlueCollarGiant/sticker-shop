import { Component, signal, inject, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderStore } from '../../../features/orders/order.store';
import { Order, OrderStatus } from '../../../features/orders/order.types';
import { createSearchEngine, handleSearchKeyboard, SearchEngine } from '../../../core/search';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css'
})
export class AdminOrdersComponent implements OnInit, OnDestroy {
  orderStore = inject(OrderStore);

  // Computed from OrderStore
  allOrders = computed(() => this.orderStore.allOrders());
  loading = computed(() => this.orderStore.isLoading());
  error = computed(() => this.orderStore.errorMessage());

  // Filter state
  statusFilter = signal<OrderStatus | 'all'>('all');

  // Order statuses for dropdown
  orderStatuses = Object.values(OrderStatus);

  // Status-filtered orders (before search)
  statusFilteredOrders = computed(() => {
    let orders = this.allOrders();
    const filter = this.statusFilter();
    if (filter !== 'all') {
      orders = orders.filter(order => order.status === filter);
    }
    return orders;
  });

  // Search engine (initialized in constructor for injection context)
  orderSearch: SearchEngine<Order>;

  // Final filtered orders - applies search on top of status filter
  filteredOrders = computed(() => {
    if (this.orderSearch) {
      return this.orderSearch.filtered();
    }
    return this.statusFilteredOrders();
  });

  // Stats
  totalOrders = computed(() => this.allOrders().length);
  pendingOrders = computed(() => this.orderStore.pendingOrders().length);
  activeOrders = computed(() => this.orderStore.activeOrders().length);
  completedOrders = computed(() => this.orderStore.completedOrders().length);

  constructor() {
    // Initialize order search engine in constructor (injection context required)
    // Use statusFilteredOrders as the source so search only applies to status-filtered results
    this.orderSearch = createSearchEngine(this.statusFilteredOrders, {
      fields: ['orderNumber', 'userId'],
      getLabel: (order) => order.orderNumber,
      getKey: (order) => order.id,
      debounceMs: 300,
      maxSuggestions: 5,
      enableSuggestions: true
    });
  }

  ngOnInit() {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    // Clean up search engine subscriptions
    if (this.orderSearch) {
      this.orderSearch.destroy();
    }
  }

  loadOrders() {
    // Load all orders (admin endpoint)
    this.orderStore.loadAllOrders();
  }

  async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    // Auto-complete terminal statuses (paid, cancelled, failed)
    let finalStatus = newStatus;
    if (newStatus === OrderStatus.PAID ||
        newStatus === OrderStatus.CANCELLED ||
        newStatus === OrderStatus.FAILED) {
      finalStatus = OrderStatus.DELIVERED;
    }

    const success = await this.orderStore.updateOrderStatus(orderId, finalStatus);
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

  // Search engine methods
  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.orderSearch.setQuery(input.value);
  }

  onSearchKeyDown(event: KeyboardEvent): void {
    if (handleSearchKeyboard(event, this.orderSearch)) {
      event.preventDefault();
    }
  }

  onSearchFocus(): void {
    this.orderSearch.openSuggestions();
  }

  onSearchBlur(): void {
    // Delay closing to allow click events on suggestions
    setTimeout(() => {
      this.orderSearch.closeSuggestions();
    }, 200);
  }

  selectOrderSuggestion(order: Order): void {
    this.orderSearch.selectSuggestion(order);
    // Optionally scroll to order in table or highlight it
  }

  highlightText(text: string): string {
    return this.orderSearch.highlight(text);
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
