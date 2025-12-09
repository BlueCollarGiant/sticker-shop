/**
 * Order API
 * HTTP calls to backend order endpoints
 *
 * Authentication: Relies on AuthInterceptor to automatically attach JWT token
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfig } from '../../core/config/api.config';
import { Order, CreateOrderInput, UpdateOrderStatusInput, ApiResponse } from './order.types';

@Injectable({
  providedIn: 'root'
})
export class OrderApi {
  constructor(private http: HttpClient) {}

  /**
   * Create a new order
   */
  createOrder(input: CreateOrderInput): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(
      ApiConfig.ORDERS.CREATE(),
      input
    );
  }

  /**
   * Get current user's orders
   */
  getUserOrders(): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(
      ApiConfig.ORDERS.USER_ORDERS()
    );
  }

  /**
   * Get order by ID
   */
  getOrderById(orderId: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(
      ApiConfig.ORDERS.GET(orderId)
    );
  }

  /**
   * Get all orders (admin only)
   */
  getAllOrders(): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(
      ApiConfig.ORDERS.LIST()
    );
  }

  /**
   * Update order status (admin only)
   */
  updateOrderStatus(orderId: string, input: UpdateOrderStatusInput): Observable<ApiResponse<Order>> {
    return this.http.patch<ApiResponse<Order>>(
      ApiConfig.ORDERS.UPDATE_STATUS(orderId),
      input
    );
  }

  /**
   * Cancel order
   */
  cancelOrder(orderId: string): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(
      ApiConfig.ORDERS.CANCEL(orderId),
      {}
    );
  }

  /**
   * Delete order (admin only)
   */
  deleteOrder(orderId: string): Observable<ApiResponse<{ success: boolean; message: string }>> {
    return this.http.delete<ApiResponse<{ success: boolean; message: string }>>(
      ApiConfig.ORDERS.DELETE(orderId)
    );
  }
}
