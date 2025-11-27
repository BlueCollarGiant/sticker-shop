import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfig } from '../../core/config/api.config';
import {
  LoginRequest,
  RegisterRequest,
  BackendAuthResponse,
  MeResponse,
  LogoutResponse
} from './auth.types';

/**
 * Auth API Service - Thin HTTP layer
 *
 * Responsibilities:
 * - Make HTTP calls to backend auth endpoints
 * - Return raw backend responses (with envelope)
 * - No state management (that's AuthStore's job)
 */
@Injectable({
  providedIn: 'root'
})
export class AuthApi {
  private http = inject(HttpClient);

  /**
   * POST /api/auth/login
   * Returns: { success, data: { token, user } }
   */
  login(request: LoginRequest): Observable<BackendAuthResponse> {
    return this.http.post<BackendAuthResponse>(ApiConfig.AUTH.LOGIN(), request);
  }

  /**
   * POST /api/auth/register
   * Returns: { success, message, data: { token, user } }
   */
  register(request: RegisterRequest): Observable<BackendAuthResponse> {
    return this.http.post<BackendAuthResponse>(ApiConfig.AUTH.REGISTER(), request);
  }

  /**
   * GET /api/auth/me
   * Requires: Authorization header (added by interceptor)
   * Returns: { success, data: { user } }
   */
  me(): Observable<MeResponse> {
    return this.http.get<MeResponse>(ApiConfig.AUTH.ME());
  }

  /**
   * POST /api/auth/logout
   * Returns: { success, message }
   */
  logout(): Observable<LogoutResponse> {
    return this.http.post<LogoutResponse>(ApiConfig.AUTH.LOGOUT(), {});
  }
}
