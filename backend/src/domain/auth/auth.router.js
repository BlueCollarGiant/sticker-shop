const { Router } = require('express');
const fileAuthRepository = require('../../infra/file/file-auth.repository');
const { AuthService } = require('./auth.service');
const { AuthController } = require('./auth.controller');
const { validate } = require('../../middleware/validate');
const { loginSchema, registerSchema } = require('../../validators/auth.validator');

let authServiceInstance;

function getAuthService() {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService(fileAuthRepository);
  }
  return authServiceInstance;
}

function createAuthRouter() {
  const router = Router();

  const service = getAuthService();
  const authController = new AuthController(service);

  router.post('/login', validate(loginSchema), authController.login);
  router.post('/register', validate(registerSchema), authController.register);
  router.post('/logout', authController.logout);

  return router;
}

const authService = getAuthService();

module.exports = {
  createAuthRouter,
  authService,
  getAuthService,
};
