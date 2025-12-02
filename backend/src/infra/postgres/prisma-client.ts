/**
 * Prisma Client Singleton
 * Manages database connection for PostgreSQL
 */

import { PrismaClient } from '@prisma/client';
import { env } from '../../config/env';

/**
 * Singleton PrismaClient instance
 * Configured with logging based on environment
 */
export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

/**
 * Connect to the database
 * Should be called on application startup when DEMO_MODE=false
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

/**
 * Disconnect from the database
 * Should be called on application shutdown
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('✅ Database disconnected');
}

/**
 * Handle graceful shutdown
 */
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});
