import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, LoginRequest, DemoLoginRequest, RegisterRequest } from '../models/auth.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api/auth';
  private readonly TOKEN_KEY = 'night_reader_token';

  // Signal for current user
  private userSignal = signal<User | null>(null);

  // Public readonly user signal
  readonly user = this.userSignal.asReadonly();

  // Computed signals for common checks
  readonly isAuthenticated = computed(() => this.user() !== null);
  readonly isAdmin = computed(() => this.user()?.role === 'admin');

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Load user from token on service initialization
    this.loadUserFromToken();
  }

  /**
   * Standard email/password login
   */
  login(email: string, password: string): Observable<AuthResponse> {
    const request: LoginRequest = { email, password };

    return this.http.post<AuthResponse>(`${this.API_URL}/login`, request).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  /**
   * Quick demo login with pre-configured accounts
   */
  demoLogin(role: 'user' | 'admin'): Observable<AuthResponse> {
    const request: DemoLoginRequest = { role };

    return this.http.post<AuthResponse>(`${this.API_URL}/demo-login`, request).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  /**
   * Register new user account
   */
  register(email: string, password: string, name?: string): Observable<AuthResponse> {
    const request: RegisterRequest = { email, password, name };

    return this.http.post<AuthResponse>(`${this.API_URL}/register`, request).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  /**
   * Logout current user
   */
  logout(): void {
    // Clear token from storage
    localStorage.removeItem(this.TOKEN_KEY);

    // Clear user signal
    this.userSignal.set(null);

    // Optional: call backend logout endpoint
    this.http.post(`${this.API_URL}/logout`, {}).subscribe();

    // Redirect to login
    this.router.navigate(['/login']);
  }

  /**
   * Get current user from backend (requires valid token)
   */
  getCurrentUser(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.API_URL}/me`).pipe(
      tap(response => this.userSignal.set(response.user))
    );
  }

  /**
   * Load user from stored token on app initialization
   */
  loadUserFromToken(): void {
    const token = this.getToken();

    if (token) {
      // Validate token by fetching current user
      this.getCurrentUser().subscribe({
        error: () => {
          // Token is invalid, clear it
          this.logout();
        }
      });
    }
  }

  /**
   * Get stored JWT token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(response: AuthResponse): void {
    // Store token
    localStorage.setItem(this.TOKEN_KEY, response.token);

    // Update user signal
    this.userSignal.set(response.user);
  }
}
