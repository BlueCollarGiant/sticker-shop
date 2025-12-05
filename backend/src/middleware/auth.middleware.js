const { authService } = require('../domain/auth/auth.router.js');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No token provided. Please include Authorization header with Bearer token.',
      });
      return;
    }

    const token = authHeader.substring(7);

    const decoded = authService.verifyToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || 'Invalid or expired token',
    });
  }
}

module.exports = { authenticate };
