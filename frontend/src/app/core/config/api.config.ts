import { environment } from '../../../environments/environment';

/**
 * API configuration and utilities
 */
export class ApiConfig {
  static readonly BASE_URL = environment.apiUrl;
  static readonly VERSION = environment.apiVersion;

  /**
   * Build full API endpoint URL
   */
  static endpoint(path: string): string {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${this.BASE_URL}/api/${cleanPath}`;
  }

  /**
   * Cart endpoints
   */
  static readonly CART = {
    GET: () => this.endpoint('cart'),
    ADD: () => this.endpoint('cart/add'),
    UPDATE: (id: string) => this.endpoint(`cart/update/${id}`),
    REMOVE: (id: string) => this.endpoint(`cart/remove/${id}`),
    CLEAR: () => this.endpoint('cart/clear'),
  };

  /**
   * Auth endpoints
   */
  static readonly AUTH = {
    LOGIN: () => this.endpoint('auth/login'),
    REGISTER: () => this.endpoint('auth/register'),
    ME: () => this.endpoint('auth/me'),
    LOGOUT: () => this.endpoint('auth/logout'),
  };

  /**
   * Product endpoints
   */
  static readonly PRODUCTS = {
    LIST: () => this.endpoint('products'),
    GET: (id: string) => this.endpoint(`products/${id}`),
    CATALOG: () => this.endpoint('products/catalog'),
  };

  /**
   * Admin endpoints
   */
  static readonly ADMIN = {
    PRODUCTS: () => this.endpoint('demo/admin/products'),
    PRODUCT: (id: string) => this.endpoint(`demo/admin/products/${id}`),
    PRODUCT_STOCK: (id: string) => this.endpoint(`demo/admin/products/${id}/stock`),
    PRODUCT_BADGES: (id: string) => this.endpoint(`demo/admin/products/${id}/badges`),
    USERS: () => this.endpoint('demo/admin/users'),
    USER: (userId: string) => this.endpoint(`demo/admin/users/${userId}`),
    USER_ORDERS: (userId: string) => this.endpoint(`demo/admin/users/${userId}/orders`),
  };

  /**
   * Order endpoints
   */
  static readonly ORDERS = {
    LIST: () => `${environment.apiUrl}/api/orders`,
    CREATE: () => `${environment.apiUrl}/api/orders`,
    GET: (id: string) => `${environment.apiUrl}/api/orders/${id}`,
    USER_ORDERS: () => `${environment.apiUrl}/api/orders/user/me`,
    UPDATE_STATUS: (id: string) => `${environment.apiUrl}/api/orders/${id}/status`,
    CANCEL: (id: string) => `${environment.apiUrl}/api/orders/${id}/cancel`,
    DELETE: (id: string) => `${environment.apiUrl}/api/orders/${id}`,
  };

  /**
   * Checkout endpoints
   */
  static readonly CHECKOUT = {
    PAYMENT_INTENT: () => `${environment.apiUrl}/api/checkout/payment-intent`,
  };
}
