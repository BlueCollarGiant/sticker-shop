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
  private readonly apiUrl = 'http://localhost:3000/api/products';

  getAllProducts(): Observable<ProductListResult> {
    return this.http
      .get<ApiResponse<ProductListResult>>(this.apiUrl)
      .pipe(map((response) => response.data));
  }

  getProductById(id: string): Observable<Product> {
    return this.http
      .get<ApiResponse<Product>>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  getCatalog(): Observable<ProductCatalog> {
    return this.http
      .get<ApiResponse<ProductCatalog>>(`${this.apiUrl}/catalog`)
      .pipe(map((response) => response.data));
  }

  createProduct(input: CreateProductInput): Observable<Product> {
    return this.http
      .post<ApiResponse<Product>>(this.apiUrl, input)
      .pipe(map((response) => response.data));
  }

  updateProduct(id: string, input: UpdateProductInput): Observable<Product> {
    return this.http
      .put<ApiResponse<Product>>(`${this.apiUrl}/${id}`, input)
      .pipe(map((response) => response.data));
  }

  deleteProduct(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<ApiResponse<{ success: boolean; message: string }>>(
      `${this.apiUrl}/${id}`
    ).pipe(map((response) => response.data));
  }

  updateStock(id: string, stock: number): Observable<Product> {
    return this.http
      .patch<ApiResponse<Product>>(`${this.apiUrl}/${id}/stock`, { stock })
      .pipe(map((response) => response.data));
  }

  toggleBadge(id: string, badge: string): Observable<Product> {
    return this.http
      .patch<ApiResponse<Product>>(`${this.apiUrl}/${id}/badge`, { badge })
      .pipe(map((response) => response.data));
  }
}
