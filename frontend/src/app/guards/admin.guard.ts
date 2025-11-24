import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Guard that protects admin routes
 * Requires user to be authenticated AND have admin role
 * Redirects to /login if not authenticated
 * Redirects to / if authenticated but not admin
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if authenticated
  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // Check if admin role
  if (authService.isAdmin()) {
    return true;
  }

  // Authenticated but not admin - redirect to home
  router.navigate(['/']);
  return false;
};
