import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User, AuthResponse, SignupData, LoginCredentials } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'nightreader_token';
  private readonly REFRESH_TOKEN_KEY = 'nightreader_refresh_token';
  private readonly USER_KEY = 'nightreader_user';

  router = inject(Router);

  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => !!this.currentUser());

  constructor() {
    this.loadUserFromStorage();
  }

  // Mock login - replace with real API call
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API call
    await this.delay(500);

    // Mock user data
    const mockUser: User = {
      id: 'user_123',
      firstName: 'John',
      lastName: 'Doe',
      email: credentials.email,
      addresses: [],
      preferences: {
        orderUpdates: true,
        shippingNotifications: true,
        newProducts: true,
        marketing: false,
        memberOffers: false
      },
      readerLevel: 'initiate' as any,
      orderCount: 0,
      totalSpent: 0,
      joinedAt: new Date(),
      emailVerified: true,
      lastLoginAt: new Date()
    };

    const mockResponse: AuthResponse = {
      success: true,
      token: this.generateMockToken(mockUser),
      refreshToken: this.generateMockToken(mockUser),
      user: mockUser,
      message: 'Login successful'
    };

    this.handleAuthResponse(mockResponse, credentials.rememberMe);
    return mockResponse;
  }

  // Mock signup - replace with real API call
  async signup(data: SignupData): Promise<AuthResponse> {
    // Simulate API call
    await this.delay(500);

    const mockUser: User = {
      id: 'user_' + Date.now(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      addresses: [],
      preferences: {
        orderUpdates: true,
        shippingNotifications: true,
        newProducts: data.subscribe || false,
        marketing: data.subscribe || false,
        memberOffers: data.subscribe || false
      },
      readerLevel: 'initiate' as any,
      orderCount: 0,
      totalSpent: 0,
      joinedAt: new Date(),
      emailVerified: false,
      lastLoginAt: new Date()
    };

    const mockResponse: AuthResponse = {
      success: true,
      token: this.generateMockToken(mockUser),
      refreshToken: this.generateMockToken(mockUser),
      user: mockUser,
      message: 'Account created successfully'
    };

    this.handleAuthResponse(mockResponse, true);
    return mockResponse;
  }

  logout(): void {
    this.clearTokens();
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  // Private helpers

  private handleAuthResponse(response: AuthResponse, rememberMe: boolean = false): void {
    this.setToken(response.token, rememberMe);

    if (response.refreshToken) {
      this.setRefreshToken(response.refreshToken, rememberMe);
    }

    this.setUser(response.user, rememberMe);
    this.currentUser.set(response.user);
  }

  private setToken(token: string, persist: boolean = false): void {
    if (persist) {
      localStorage.setItem(this.TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  private setRefreshToken(token: string, persist: boolean = false): void {
    if (persist) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }
  }

  private setUser(user: User, persist: boolean = false): void {
    const userJson = JSON.stringify(user);
    if (persist) {
      localStorage.setItem(this.USER_KEY, userJson);
    } else {
      sessionStorage.setItem(this.USER_KEY, userJson);
    }
  }

  private clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    if (!token) return;

    const userJson = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUser.set(user);
      } catch {
        this.clearTokens();
      }
    }
  }

  private generateMockToken(user: User): string {
    // Mock JWT token
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      userId: user.id,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
    }));
    const signature = btoa('mock_signature');
    return `${header}.${payload}.${signature}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
