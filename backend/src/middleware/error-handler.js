const { env } = require('../config/env');

function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  const isDevelopment = env.NODE_ENV === 'development';

  res.status(500).json({
    success: false,
    message: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
  });
}

module.exports = { errorHandler };
