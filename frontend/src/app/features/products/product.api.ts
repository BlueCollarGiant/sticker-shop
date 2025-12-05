/**
 * Product API
 * Thin HTTP client layer for product operations
 */

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Product,
  ProductListResult,
  ProductCatalog,
  CreateProductInput,
  UpdateProductInput,
} from './product.types';
import { ApiConfig } from '../../core/config/api.config';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductApi {
  private http = inject(HttpClient);

  getAllProducts(): Observable<ProductListResult> {
    return this.http
      .get<ApiResponse<ProductListResult>>(ApiConfig.PRODUCTS.LIST())
      .pipe(map((response) => response.data));
  }

  getProductById(id: string): Observable<Product> {
    return this.http
      .get<ApiResponse<Product>>(ApiConfig.PRODUCTS.GET(id))
      .pipe(map((response) => response.data));
  }

  getCatalog(): Observable<ProductCatalog> {
    return this.http
      .get<ApiResponse<ProductCatalog>>(ApiConfig.PRODUCTS.CATALOG())
      .pipe(map((response) => response.data));
  }

  createProduct(input: CreateProductInput): Observable<Product> {
    return this.http
      .post<ApiResponse<Product>>(ApiConfig.PRODUCTS.LIST(), input)
      .pipe(map((response) => response.data));
  }

  updateProduct(id: string, input: UpdateProductInput): Observable<Product> {
    return this.http
      .put<ApiResponse<Product>>(ApiConfig.PRODUCTS.GET(id), input)
      .pipe(map((response) => response.data));
  }

  deleteProduct(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<ApiResponse<{ success: boolean; message: string }>>(
      ApiConfig.PRODUCTS.GET(id)
    ).pipe(map((response) => response.data));
  }

  updateStock(id: string, stock: number): Observable<Product> {
    return this.http
      .patch<ApiResponse<Product>>(ApiConfig.endpoint(`products/${id}/stock`), { stock })
      .pipe(map((response) => response.data));
  }

  toggleBadge(id: string, badge: string): Observable<Product> {
    return this.http
      .patch<ApiResponse<Product>>(ApiConfig.endpoint(`products/${id}/badge`), { badge })
      .pipe(map((response) => response.data));
  }
}
