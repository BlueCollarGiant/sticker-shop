import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../features/auth/auth.store';

/**
 * Guard that protects admin routes
 * Requires user to be authenticated AND have admin role
 * Redirects to /login if not authenticated
 * Redirects to / if authenticated but not admin
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  // Check if authenticated
  if (!auth.isAuthenticated()) {
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // Check if admin role
  if (auth.isAdmin()) {
    return true;
  }

  // Authenticated but not admin - redirect to home
  router.navigate(['/']);
  return false;
};
