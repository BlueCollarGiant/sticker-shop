const { Router } = require('express');
const fileAuthRepository = require('../../infra/file/file-auth.repository.js');
const { AuthService } = require('./auth.service.js');
const { AuthController } = require('./auth.controller.js');
const { validate } = require('../../middleware/validate.js');
const { loginSchema, registerSchema } = require('../../validators/auth.validator.js');

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
