const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const authenticate = require('../middleware/auth.middleware');

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email and password are required'
      });
    }

    const result = authService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({
      error: 'Authentication Failed',
      message: error.message
    });
  }
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email and password are required'
      });
    }

    const result = authService.register({ email, name });
    res.json(result);
  } catch (error) {
    res.status(400).json({
      error: 'Registration Failed',
      message: error.message
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  try {
    const token = req.headers.authorization.substring(7);
    const user = authService.getUserFromToken(token);
    res.json({ user });
  } catch (error) {
    res.status(401).json({
      error: 'Unauthorized',
      message: error.message
    });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // In a JWT setup, logout is handled client-side by removing the token
  // This endpoint can be used for logging or cleanup if needed
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
