import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfig } from '../../core/config/api.config';
import { CartResponse, AddToCartRequest, UpdateCartItemRequest } from './cart.types';

/**
 * Cart API Service
 *
 * Responsibilities:
 * - HTTP calls to cart endpoints
 * - Request/response transformation
 * - Error propagation to store
 *
 * Does NOT:
 * - Manage state (that's the store's job)
 * - Handle business logic
 */
@Injectable({
  providedIn: 'root'
})
export class CartApi {
  private http = inject(HttpClient);

  /**
   * Get current cart
   */
  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(ApiConfig.CART.GET());
  }

  /**
   * Add item to cart
   */
  addItem(request: AddToCartRequest): Observable<CartResponse> {
    return this.http.post<CartResponse>(ApiConfig.CART.ADD(), request);
  }

  /**
   * Update cart item quantity
   */
  updateItem(itemId: string, request: UpdateCartItemRequest): Observable<CartResponse> {
    return this.http.put<CartResponse>(ApiConfig.CART.UPDATE(itemId), request);
  }

  /**
   * Remove item from cart
   */
  removeItem(itemId: string): Observable<CartResponse> {
    return this.http.delete<CartResponse>(ApiConfig.CART.REMOVE(itemId));
  }

  /**
   * Clear entire cart
   */
  clearCart(): Observable<CartResponse> {
    return this.http.delete<CartResponse>(ApiConfig.CART.CLEAR());
  }
}
