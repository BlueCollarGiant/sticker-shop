/**
 * Order API
 * HTTP calls to backend order endpoints
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfig } from '../../core/config/api.config';
import { Order, CreateOrderInput, UpdateOrderStatusInput, ApiResponse } from './order.types';

@Injectable({
  providedIn: 'root'
})
export class OrderApi {
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
      ApiConfig.ORDERS.CREATE(),
      input,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Get current user's orders
   */
  getUserOrders(): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(
      ApiConfig.ORDERS.USER_ORDERS(),
      { headers: this.getHeaders() }
    );
  }

  /**
   * Get order by ID
   */
  getOrderById(orderId: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(
      ApiConfig.ORDERS.GET(orderId),
      { headers: this.getHeaders() }
    );
  }

  /**
   * Get all orders (admin only)
   */
  getAllOrders(): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(
      ApiConfig.ORDERS.LIST(),
      { headers: this.getHeaders() }
    );
  }

  /**
   * Update order status (admin only)
   */
  updateOrderStatus(orderId: string, input: UpdateOrderStatusInput): Observable<ApiResponse<Order>> {
    return this.http.patch<ApiResponse<Order>>(
      ApiConfig.ORDERS.UPDATE_STATUS(orderId),
      input,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Cancel order
   */
  cancelOrder(orderId: string): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(
      ApiConfig.ORDERS.CANCEL(orderId),
      {},
      { headers: this.getHeaders() }
    );
  }

  /**
   * Delete order (admin only)
   */
  deleteOrder(orderId: string): Observable<ApiResponse<{ success: boolean; message: string }>> {
    return this.http.delete<ApiResponse<{ success: boolean; message: string }>>(
      ApiConfig.ORDERS.DELETE(orderId),
      { headers: this.getHeaders() }
    );
  }
}
