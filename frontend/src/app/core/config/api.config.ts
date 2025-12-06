import { environment } from '../../../environments/environment';

/**
 * API configuration and utilities
 */
export class ApiConfig {
  static readonly BASE_URL = environment.apiUrl;

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
    PRODUCTS: () => this.endpoint('admin/products'),
    PRODUCT: (id: string) => this.endpoint(`admin/products/${id}`),
    PRODUCT_STOCK: (id: string) => this.endpoint(`admin/products/${id}/stock`),
    PRODUCT_BADGE: (id: string) => this.endpoint(`admin/products/${id}/badge`),
    USERS: () => this.endpoint('admin/users'),
    USER_ORDERS: (id: string) => this.endpoint(`admin/users/${id}/orders`),
  };

  /**
   * Order endpoints
   */
  static readonly ORDERS = {
    LIST: () => this.endpoint('orders'),
    CREATE: () => this.endpoint('orders'),
    GET: (id: string) => this.endpoint(`orders/${id}`),
    USER_ORDERS: () => this.endpoint('orders/user/me'),
    UPDATE_STATUS: (id: string) => this.endpoint(`orders/${id}/status`),
    CANCEL: (id: string) => this.endpoint(`orders/${id}/cancel`),
    DELETE: (id: string) => this.endpoint(`orders/${id}`),
  };

  /**
   * Checkout endpoints
   */
  static readonly CHECKOUT = {
    PAYMENT_INTENT: () => this.endpoint('checkout/create-payment-intent'),
  };
}
