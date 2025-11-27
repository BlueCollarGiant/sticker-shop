import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../features/auth/auth.store';

/**
 * HTTP Interceptor that adds JWT token to outgoing requests
 * Uses Angular 19+ functional interceptor pattern
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const token = auth.getToken();

  // If token exists, clone request and add Authorization header
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(clonedRequest);
  }

  // No token, proceed with original request
  return next(req);
};
