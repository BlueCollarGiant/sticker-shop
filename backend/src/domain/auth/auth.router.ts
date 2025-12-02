import { Router } from 'express';
import { DemoAuthStore } from '../../infra/demo/demo-auth.store';
import { PostgresAuthRepository } from '../../infra/postgres/postgres-auth.repository';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { loginSchema, registerSchema } from '../../validators/auth.validator';
import { env } from '../../config/env';
import { IAuthRepository } from './auth.types';

// Singleton instances
let authRepository: IAuthRepository;
let authService: AuthService;

/**
 * Initialize auth repository based on mode
 */
function getAuthRepository(): IAuthRepository {
  if (!authRepository) {
    authRepository = env.DEMO_MODE
      ? new DemoAuthStore()
      : new PostgresAuthRepository();
  }
  return authRepository;
}

/**
 * Get auth service singleton
 */
function getAuthService(): AuthService {
  if (!authService) {
    authService = new AuthService(getAuthRepository());
  }
  return authService;
}

/**
 * Create auth router with dependency injection
 */
export function createAuthRouter(): Router {
  const router = Router();

  // Initialize dependencies (mode-aware)
  const service = getAuthService();
  const authController = new AuthController(service);

  // Routes
  router.post('/login', validate(loginSchema), authController.login);
  router.post('/register', validate(registerSchema), authController.register);
  router.post('/logout', authController.logout);

  // Note: /me route is added in app.ts with auth middleware

  return router;
}

/**
 * Export auth service instance for use in middleware
 * This is a singleton that switches based on DEMO_MODE
 */
export { getAuthService as getAuthServiceInstance };
export const authService = getAuthService();
