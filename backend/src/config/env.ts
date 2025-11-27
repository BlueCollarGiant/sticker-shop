import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Environment variable schema with validation
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),

  // Demo mode
  DEMO_MODE: z.string().default('true').transform(val => val === 'true'),

  // CORS
  ALLOWED_ORIGINS: z.string().default('http://localhost:4200,http://localhost:5000'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRY: z.string().default('24h'),

  // Printify (optional in demo mode)
  PRINTIFY_API_KEY: z.string().optional(),
  PRINTIFY_SHOP_ID: z.string().optional(),
});

/**
 * Parse and validate environment variables
 */
function loadEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    process.exit(1);
  }

  return result.data;
}

export const env = loadEnv();

export type Env = z.infer<typeof envSchema>;

/**
 * Get allowed origins as array
 */
export function getAllowedOrigins(): string[] {
  return env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
}

/**
 * Check if Printify is enabled
 */
export function isPrintifyEnabled(): boolean {
  return !env.DEMO_MODE && !!env.PRINTIFY_API_KEY && !!env.PRINTIFY_SHOP_ID;
}
