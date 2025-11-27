import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfig } from '../core/config/api.config';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  constructor(private http: HttpClient) {}

  getProducts(): Observable<any> {
    return this.http.get(ApiConfig.PRODUCTS.LIST());
  }

  getProduct(id: string): Observable<any> {
    return this.http.get(ApiConfig.PRODUCTS.GET(id));
  }

  getCatalog(): Observable<any> {
    return this.http.get(ApiConfig.PRODUCTS.CATALOG());
  }
}
