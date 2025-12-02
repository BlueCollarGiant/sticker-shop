/**
 * Order API
 * HTTP calls to backend order endpoints
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, CreateOrderInput, UpdateOrderStatusInput, ApiResponse } from './order.types';

@Injectable({
  providedIn: 'root'
})
export class OrderApi {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  /**
   * Create a new order
   */
  createOrder(input: CreateOrderInput): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(
      this.apiUrl,
      input,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Get current user's orders
   */
  getUserOrders(): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(
      `${this.apiUrl}/user/me`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Get order by ID
   */
  getOrderById(orderId: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(
      `${this.apiUrl}/${orderId}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Get all orders (admin only)
   */
  getAllOrders(): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(
      this.apiUrl,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Update order status (admin only)
   */
  updateOrderStatus(orderId: string, input: UpdateOrderStatusInput): Observable<ApiResponse<Order>> {
    return this.http.patch<ApiResponse<Order>>(
      `${this.apiUrl}/${orderId}/status`,
      input,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Cancel order
   */
  cancelOrder(orderId: string): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(
      `${this.apiUrl}/${orderId}/cancel`,
      {},
      { headers: this.getHeaders() }
    );
  }

  /**
   * Delete order (admin only)
   */
  deleteOrder(orderId: string): Observable<ApiResponse<{ success: boolean; message: string }>> {
    return this.http.delete<ApiResponse<{ success: boolean; message: string }>>(
      `${this.apiUrl}/${orderId}`,
      { headers: this.getHeaders() }
    );
  }
}
