import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductBadge } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly API_URL = 'http://localhost:3000/api/demo/admin';
  private http = inject(HttpClient);

  /**
   * Get all products (admin view)
   */
  getAllProducts(): Observable<{ data: Product[], total: number }> {
    return this.http.get<{ data: Product[], total: number }>(`${this.API_URL}/products`);
  }

  /**
   * Create new product
   */
  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.API_URL}/products`, product);
  }

  /**
   * Update existing product
   */
  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.API_URL}/products/${id}`, product);
  }

  /**
   * Delete product
   */
  deleteProduct(id: string): Observable<{ success: boolean, message: string }> {
    return this.http.delete<{ success: boolean, message: string }>(`${this.API_URL}/products/${id}`);
  }

  /**
   * Update product stock
   */
  updateStock(id: string, stock: number): Observable<Product> {
    return this.http.patch<Product>(`${this.API_URL}/products/${id}/stock`, { stock });
  }

  /**
   * Toggle product badge
   */
  toggleBadge(id: string, badge: string): Observable<Product> {
    return this.http.patch<Product>(`${this.API_URL}/products/${id}/badges`, { badge });
  }

  /**
   * Get all users (admin only)
   */
  getAllUsers(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.API_URL}/users`);
  }

  /**
   * Get user by ID with their orders (admin only)
   */
  getUserById(userId: string): Observable<{ success: boolean; data: any }> {
    return this.http.get<{ success: boolean; data: any }>(`${this.API_URL}/users/${userId}`);
  }

  /**
   * Get user's orders (admin only)
   */
  getUserOrders(userId: string): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.API_URL}/users/${userId}/orders`);
  }
}
