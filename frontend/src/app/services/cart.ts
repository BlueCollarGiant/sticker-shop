import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = '/api/cart';
  private cartItemsSubject = new BehaviorSubject<any[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCart();
  }

  loadCart(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(items => {
      this.cartItemsSubject.next(items);
    });
  }

  getCart(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addToCart(item: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, item).pipe(
      tap(() => this.loadCart())
    );
  }

  removeFromCart(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove/${id}`).pipe(
      tap(() => this.loadCart())
    );
  }

  updateCartItem(id: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, { quantity }).pipe(
      tap(() => this.loadCart())
    );
  }

  clearCart(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear`).pipe(
      tap(() => this.loadCart())
    );
  }

  getCartCount(): number {
    return this.cartItemsSubject.value.reduce((total, item) => total + item.quantity, 0);
  }
}
