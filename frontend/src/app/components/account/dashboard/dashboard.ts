import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../../features/auth/auth.store';
import { OrderNotification } from '../../../models/user.model';
import { OrderApi } from '../../../features/orders/order.api';
import { OrderStore } from '../../../features/orders/order.store';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  auth = inject(AuthStore);
  orderApi = inject(OrderApi);
  orderStore = inject(OrderStore);

  // Use auth store's user signal directly
  user = this.auth.user;

  // Recent order notifications from backend (Order Activity Projection)
  recentNotifications = signal<OrderNotification[]>([]);
  isLoadingActivity = signal(false);

  // Total order count from OrderStore
  totalOrders = computed(() => this.orderStore.userOrders().length);

  // Auto-refresh interval
  private refreshInterval: any;

  readerLevel = computed<string>(() => {
    // TODO: When orders feature is implemented, use actual order count
    const orderCount = 0;
    if (orderCount >= 10) return 'Master';
    if (orderCount >= 5) return 'Adept';
    if (orderCount >= 1) return 'Apprentice';
    return 'Initiate';
  });

  readerLevelIcon = computed<string>(() => {
    const level = this.readerLevel();
    const icons: Record<string, string> = {
      'Master': '🏆',
      'Adept': '⭐',
      'Apprentice': '📚',
      'Initiate': '🌙'
    };
    return icons[level] || '🌙';
  });

  ngOnInit(): void {
    this.loadUserActivity();
    this.loadOrders();

    // Auto-refresh activity every 10 seconds to reflect admin changes
    this.refreshInterval = setInterval(() => {
      this.loadUserActivity();
      this.loadOrders();
    }, 10000); // 10 seconds
  }

  loadOrders(): void {
    this.orderStore.loadUserOrders();
  }

  ngOnDestroy(): void {
    // Clean up interval when component is destroyed
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadUserActivity(): void {
    this.isLoadingActivity.set(true);
    this.orderApi.getUserActivity().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Backend returns pre-sorted, pre-limited notifications (max 3)
          // No frontend sorting, filtering, or ranking needed
          this.recentNotifications.set(response.data);
        }
        this.isLoadingActivity.set(false);
      },
      error: (error) => {
        console.error('Failed to load user activity:', error);
        this.isLoadingActivity.set(false);
      }
    });
  }

  getInitials(): string {
    const user = this.user();
    if (!user) return '';
    const name = user.name || user.email || '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  /**
   * Format order number for display
   * Returns the order number if present, otherwise returns a neutral placeholder
   */
  getOrderDisplayName(notification: OrderNotification): string {
    return notification.orderNumber || `Order ${notification.orderId.slice(-8)}`;
  }

  /**
   * Format status text for display (verbatim from backend)
   * Capitalizes first letter for readability
   */
  getStatusText(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  logout(): void {
    if (confirm('Log out of your account?')) {
      this.auth.logout();
    }
  }
}
