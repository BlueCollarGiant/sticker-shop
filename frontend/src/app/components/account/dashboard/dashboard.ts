import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../../features/auth/auth.store';
import { ActivityItem, ActivityType } from '../../../models/user.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {
  auth = inject(AuthStore);

  // Use auth store's user signal directly
  user = this.auth.user;

  // Mock recent activity for demo
  recentActivity = signal<ActivityItem[]>([
    {
      id: '1',
      type: ActivityType.ORDER_PLACED,
      message: 'Order #1234 placed',
      timestamp: new Date(),
      icon: '📦',
    },
    {
      id: '2',
      type: ActivityType.ORDER_SHIPPED,
      message: 'Package shipped',
      timestamp: new Date(),
      icon: '🚚',
    },
  ]);

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
