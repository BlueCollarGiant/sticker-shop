require('dotenv').config();

function loadEnv() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = parseInt(process.env.PORT || '3000', 10);
  const allowedOrigins = process.env.ALLOWED_ORIGINS || 'http://localhost:4200,http://localhost:5000';
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiry = process.env.JWT_EXPIRY || '24h';

  if (!jwtSecret || jwtSecret.length < 32) {
    console.error('❌ JWT_SECRET must be at least 32 characters');
    process.exit(1);
  }

  return {
    NODE_ENV: nodeEnv,
    PORT: port,
    ALLOWED_ORIGINS: allowedOrigins,
    JWT_SECRET: jwtSecret,
    JWT_EXPIRY: jwtExpiry,
  };
}

const env = loadEnv();

function getAllowedOrigins() {
  return env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
}

module.exports = {
  env,
  getAllowedOrigins,
};
