/**
 * Product API
 * Thin HTTP client layer for product operations
 */

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Product,
  ProductListResult,
  ProductListMeta,
  ProductCatalog,
  CreateProductInput,
  UpdateProductInput,
} from './product.types';
import { ApiConfig } from '../../core/config/api.config';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: ProductListMeta;
  message?: string;
}

export interface ProductQueryParams {
  q?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductApi {
  private http = inject(HttpClient);

  getAllProducts(params?: ProductQueryParams): Observable<ProductListResult> {
    let httpParams = new HttpParams();
    if (params?.q) httpParams = httpParams.set('q', params.q);
    if (params?.page) httpParams = httpParams.set('page', String(params.page));
    if (params?.limit) httpParams = httpParams.set('limit', String(params.limit));

    return this.http
      .get<ApiResponse<Product[]>>(ApiConfig.PRODUCTS.LIST(), { params: httpParams })
      .pipe(
        map(response => ({
          data: response.data,
          meta: response.meta ?? { page: 1, limit: 12, total: response.data.length, totalPages: 1 },
        }))
      );
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
