const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

function loadEnv() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = parseInt(process.env.PORT || '3000', 10);
  const allowedOrigins = process.env.ALLOWED_ORIGINS || 'http://localhost:4200,http://localhost:5000';
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiry = process.env.JWT_EXPIRY || '24h';
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

  if (!jwtSecret || jwtSecret.length < 32) {
    console.error('JWT_SECRET must be at least 32 characters');
    process.exit(1);
  }

  if (!stripeSecretKey) {
    console.error('STRIPE_SECRET_KEY is required');
    process.exit(1);
  }

  if (!stripePublishableKey) {
    console.error('STRIPE_PUBLISHABLE_KEY is required');
    process.exit(1);
  }

  return {
    NODE_ENV: nodeEnv,
    PORT: port,
    ALLOWED_ORIGINS: allowedOrigins,
    JWT_SECRET: jwtSecret,
    JWT_EXPIRY: jwtExpiry,
    STRIPE_SECRET_KEY: stripeSecretKey,
    STRIPE_PUBLISHABLE_KEY: stripePublishableKey,
  };
}

const env = loadEnv();

function getAllowedOrigins() {
  return env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean);
}

module.exports = {
  env,
  getAllowedOrigins,
};
