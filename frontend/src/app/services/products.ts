import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private apiUrl = '/api/products';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getProduct(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getCatalog(): Observable<any> {
    return this.http.get(`${this.apiUrl}/catalog`);
  }
}
