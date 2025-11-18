import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { UserService } from '../../../services/auth/user.service';
import { User, ActivityItem } from '../../../models/user.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  userService = inject(UserService);

  user = signal<User | null>(null);
  recentActivity = signal<ActivityItem[]>([]);

  readerLevel = computed<string>(() => {
    const orderCount = this.user()?.orderCount || 0;
    return this.userService.getReaderLevel(orderCount);
  });

  readerLevelIcon = computed<string>(() => {
    return this.userService.getReaderLevelIcon(this.readerLevel());
  });

  async ngOnInit(): Promise<void> {
    const user = await this.userService.getCurrentUser();
    this.user.set(user);

    const activity = await this.userService.getRecentActivity();
    this.recentActivity.set(activity);
  }

  getInitials(): string {
    const user = this.user();
    if (!user) return '';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }

  logout(): void {
    if (confirm('Log out of your account?')) {
      this.authService.logout();
    }
  }
}
