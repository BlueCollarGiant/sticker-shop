import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../../features/auth/auth.store';
import { ActivityItem, ActivityType } from '../../../models/user.model';
import { OrderApi } from '../../../features/orders/order.api';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  auth = inject(AuthStore);
  orderApi = inject(OrderApi);

  // Use auth store's user signal directly
  user = this.auth.user;

  // Live user activity from backend
  recentActivity = signal<ActivityItem[]>([]);
  isLoadingActivity = signal(false);

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

    // Auto-refresh activity every 10 seconds to reflect admin changes
    this.refreshInterval = setInterval(() => {
      this.loadUserActivity();
    }, 10000); // 10 seconds
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
          // Convert string timestamps to Date objects and limit to 3 most recent
          const activities = response.data
            .map(activity => ({
              ...activity,
              timestamp: new Date(activity.timestamp)
            }))
            .slice(0, 3); // Limit to 3 most recent activities
          this.recentActivity.set(activities);
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

  logout(): void {
    if (confirm('Log out of your account?')) {
      this.auth.logout();
    }
  }
}
