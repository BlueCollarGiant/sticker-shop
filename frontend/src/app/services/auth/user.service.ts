import { Injectable, signal, inject } from '@angular/core';
import { User, NotificationPreferences, ActivityItem, ActivityType, PasswordChangeData, DeleteAccountData } from '../../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private authService = inject(AuthService);
  currentUser = signal<User | null>(null);

  async getCurrentUser(): Promise<User> {
    // Get the current user from AuthService
    const user = this.authService.currentUser();

    if (!user) {
      throw new Error('No user logged in');
    }

    this.currentUser.set(user);
    return user;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    // Mock update - replace with real API call
    await this.delay(300);

    const currentUser = this.currentUser();
    if (!currentUser) throw new Error('No user logged in');

    const updatedUser = { ...currentUser, ...data };
    this.currentUser.set(updatedUser);

    return updatedUser;
  }

  async updatePreferences(preferences: NotificationPreferences): Promise<User> {
    // Mock update - replace with real API call
    await this.delay(300);

    const currentUser = this.currentUser();
    if (!currentUser) throw new Error('No user logged in');

    const updatedUser = { ...currentUser, preferences };
    this.currentUser.set(updatedUser);

    return updatedUser;
  }

  async getRecentActivity(): Promise<ActivityItem[]> {
    // Mock activity data - replace with real API call
    await this.delay(200);

    return [
      {
        id: '1',
        type: ActivityType.ORDER_SHIPPED,
        message: 'Order #NR-2834 shipped',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        metadata: { orderId: 'order_2834' }
      },
      {
        id: '2',
        type: ActivityType.WISHLIST_ADDED,
        message: 'Added 2 items to wishlist',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        metadata: { count: 2 }
      },
      {
        id: '3',
        type: ActivityType.ORDER_DELIVERED,
        message: 'Order #NR-2719 delivered',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        metadata: { orderId: 'order_2719' }
      }
    ];
  }

  getReaderLevel(orderCount: number): string {
    if (orderCount >= 10) return 'Sage';
    if (orderCount >= 3) return 'Scholar';
    return 'Initiate';
  }

  getReaderLevelIcon(level: string): string {
    const icons: Record<string, string> = {
      'Initiate': '🌑',
      'Scholar': '🌓',
      'Sage': '🌕'
    };
    return icons[level] || '🌑';
  }

  async changePassword(data: PasswordChangeData): Promise<void> {
    // Mock password change - replace with real API call
    await this.delay(500);

    // Simulate validation
    if (data.currentPassword !== 'Password123') {
      throw new Error('Current password is incorrect');
    }

    if (data.newPassword !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // In real implementation, this would call API
    console.log('Password changed successfully');
  }

  async deleteAccount(data: DeleteAccountData): Promise<void> {
    // Mock account deletion - replace with real API call
    await this.delay(500);

    if (data.confirmationText !== 'DELETE') {
      throw new Error('Confirmation text must be exactly "DELETE"');
    }

    // In real implementation, this would call API and logout
    console.log('Account deleted');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
