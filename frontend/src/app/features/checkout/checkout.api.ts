import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfig } from '../../core/config/api.config';

export interface CheckoutConfigResponse {
  success: boolean;
  data: { publishableKey: string };
}

export interface PaymentIntentRequest {
  amount: number;
  currency?: string;
}

export interface PaymentIntentResponse {
  success: boolean;
  data: { clientSecret: string; paymentIntentId: string };
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutApi {
  private http = inject(HttpClient);

  getConfig(): Observable<CheckoutConfigResponse> {
    return this.http.get<CheckoutConfigResponse>(ApiConfig.CHECKOUT.CONFIG());
  }

  createPaymentIntent(request: PaymentIntentRequest): Observable<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>(ApiConfig.CHECKOUT.PAYMENT_INTENT(), request);
  }
}
