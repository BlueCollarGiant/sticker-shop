import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductBadge } from '../models/product.model';
import { ApiConfig } from '../core/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);

  /**
   * Get all products (admin view)
   */
  getAllProducts(): Observable<{ data: Product[], total: number }> {
    return this.http.get<{ data: Product[], total: number }>(ApiConfig.ADMIN.PRODUCTS());
  }

  /**
   * Create new product
   */
  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(ApiConfig.ADMIN.PRODUCTS(), product);
  }

  /**
   * Update existing product
   */
  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(ApiConfig.ADMIN.PRODUCT(id), product);
  }

  /**
   * Delete product
   */
  deleteProduct(id: string): Observable<{ success: boolean, message: string }> {
    return this.http.delete<{ success: boolean, message: string }>(ApiConfig.ADMIN.PRODUCT(id));
  }

  /**
   * Update product stock
   */
  updateStock(id: string, stock: number): Observable<Product> {
    return this.http.patch<Product>(ApiConfig.ADMIN.PRODUCT_STOCK(id), { stock });
  }

  /**
   * Toggle product badge
   */
  toggleBadge(id: string, badge: string): Observable<Product> {
    return this.http.patch<Product>(ApiConfig.ADMIN.PRODUCT_BADGES(id), { badge });
  }

  /**
   * Get all users (admin only)
   */
  getAllUsers(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(ApiConfig.ADMIN.USERS());
  }

  /**
   * Get user by ID with their orders (admin only)
   */
  getUserById(userId: string): Observable<{ success: boolean; data: any }> {
    return this.http.get<{ success: boolean; data: any }>(ApiConfig.ADMIN.USER(userId));
  }

  /**
   * Get user's orders (admin only)
   */
  getUserOrders(userId: string): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(ApiConfig.ADMIN.USER_ORDERS(userId));
  }
}
