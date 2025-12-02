import { Router } from 'express';
import { DemoAuthStore } from '../../infra/demo/demo-auth.store';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { loginSchema, registerSchema } from '../../validators/auth.validator';
import { IAuthRepository } from './auth.types';

// Singleton instances
let authRepository: IAuthRepository;
let authServiceInstance: AuthService;

/**
 * Initialize auth repository based on mode
 */
function getAuthRepository(): IAuthRepository {
  if (!authRepository) {
    authRepository = new DemoAuthStore();
  }
  return authRepository;
}

/**
 * Get auth service singleton
 */
function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService(getAuthRepository());
  }
  return authServiceInstance;
}

/**
 * Create auth router with dependency injection
 */
export function createAuthRouter(): Router {
  const router = Router();

  // Initialize dependencies (demo store singleton)
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
 * Demo mode uses the file-based store exclusively
 */
export { getAuthService as getAuthServiceInstance };
export const authService = getAuthService();
