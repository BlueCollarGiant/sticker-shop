import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthStore } from '../../../features/auth/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  // Form fields
  email = signal('');
  password = signal('');

  // UI state
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  auth = inject(AuthStore);
  router = inject(Router);
  route = inject(ActivatedRoute);

  /**
   * Handle standard login form submission
   */
  onLogin(): void {
    this.errorMessage.set(null);

    const emailValue = this.email();
    const passwordValue = this.password();

    if (!emailValue || !passwordValue) {
      this.errorMessage.set('Please enter email and password');
      return;
    }

    // AuthStore handles loading state, errors, and navigation internally
    this.auth.login(emailValue, passwordValue);
  }

  /**
   * Handle demo login as user
   */
  onDemoLoginUser(): void {
    this.auth.login('demo@nightreader.com', 'demo123');
  }

  /**
   * Handle demo login as admin
   */
  onDemoLoginAdmin(): void {
    this.auth.login('admin@nightreader.com', 'admin123');
  }
}
