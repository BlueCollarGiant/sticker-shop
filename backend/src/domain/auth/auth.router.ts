import { Router } from 'express';
import { DemoAuthStore } from '../../infra/demo/demo-auth.store';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { loginSchema, registerSchema } from '../../validators/auth.validator';

/**
 * Create auth router with dependency injection
 */
export function createAuthRouter(): Router {
  const router = Router();

  // Initialize dependencies (demo mode)
  const authStore = new DemoAuthStore();
  const authService = new AuthService(authStore);
  const authController = new AuthController(authService);

  // Routes
  router.post('/login', validate(loginSchema), authController.login);
  router.post('/register', validate(registerSchema), authController.register);
  router.post('/logout', authController.logout);

  // Note: /me route is added in app.ts with auth middleware

  return router;
}

/**
 * Export auth service instance for use in middleware
 * This is a singleton for the demo-mode auth store
 */
const authStore = new DemoAuthStore();
export const authService = new AuthService(authStore);
