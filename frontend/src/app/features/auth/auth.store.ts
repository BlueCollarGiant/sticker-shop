import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthApi } from './auth.api';
import { User, LoginRequest, RegisterRequest } from './auth.types';

/**
 * Auth Store - Signals-based authentication state management
 *
 * Follows Phase 1 pattern (same as CartStore):
 * - Uses Angular signals for reactive state
 * - Delegates HTTP to AuthApi
 * - Unwraps backend envelope responses
 * - Manages localStorage for token persistence
 */
@Injectable({
  providedIn: 'root'
})
export class AuthStore {
  private readonly TOKEN_KEY = 'night_reader_token';

  private api = inject(AuthApi);
  private router = inject(Router);

  // State
  private _user = signal<User | null>(null);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Public readonly signals
  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed signals
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'admin');

  constructor() {
    // Load user from token on initialization
    this.loadUserFromToken();
  }

  /**
   * Login with email and password
   */
  login(email: string, password: string): void {
    this._loading.set(true);
    this._error.set(null);

    const request: LoginRequest = { email, password };

    this.api.login(request).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Store token
          localStorage.setItem(this.TOKEN_KEY, response.data.token);

          // Update user state
          this._user.set(response.data.user);

          this._loading.set(false);

          // Redirect to home or dashboard
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this._error.set(err.error?.message || 'Login failed');
        this._loading.set(false);
      }
    });
  }

  /**
   * Register new user
   */
  register(email: string, password: string, name: string): void {
    this._loading.set(true);
    this._error.set(null);

    const request: RegisterRequest = { email, password, name };

    this.api.register(request).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Store token
          localStorage.setItem(this.TOKEN_KEY, response.data.token);

          // Update user state
          this._user.set(response.data.user);

          this._loading.set(false);

          // Redirect to home or dashboard
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this._error.set(err.error?.message || 'Registration failed');
        this._loading.set(false);
      }
    });
  }

  /**
   * Logout current user
   */
  logout(): void {
    // Call backend logout endpoint (optional - JWT is stateless)
    this.api.logout().subscribe();

    // Clear token from storage
    localStorage.removeItem(this.TOKEN_KEY);

    // Clear user state
    this._user.set(null);

    // Redirect to login
    this.router.navigate(['/login']);
  }

  /**
   * Load current user from backend using stored token
   */
  loadCurrentUser(): void {
    const token = this.getToken();

    if (!token) {
      return;
    }

    this.api.me().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this._user.set(response.data.user);
        }
      },
      error: () => {
        // Token is invalid, clear it
        localStorage.removeItem(this.TOKEN_KEY);
        this._user.set(null);
      }
    });
  }

  /**
   * Load user from token on app initialization
   */
  private loadUserFromToken(): void {
    const token = this.getToken();

    if (token) {
      this.loadCurrentUser();
    }
  }

  /**
   * Get stored JWT token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this._error.set(null);
  }
}
