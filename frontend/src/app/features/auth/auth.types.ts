/**
 * Auth feature types
 * Aligned with backend API responses
 */

/**
 * Core User type - aligned with backend
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string; // ISO date string from backend
  updatedAt: string; // ISO date string from backend
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register request payload
 */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

/**
 * Backend auth response envelope
 * Matches backend: { success, message, data: { token, user } }
 */
export interface BackendAuthResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    user: User;
  };
}

/**
 * Backend /me endpoint response
 */
export interface MeResponse {
  success: boolean;
  data: {
    user: User;
  };
}

/**
 * Backend logout response
 */
export interface LogoutResponse {
  success: boolean;
  message: string;
}
