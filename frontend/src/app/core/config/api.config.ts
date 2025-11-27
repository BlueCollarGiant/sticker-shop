import { environment } from '../../../environments/environment.development';

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
}
