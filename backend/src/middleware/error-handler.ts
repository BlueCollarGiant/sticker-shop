import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

/**
 * Global error handler middleware
 *
 * Should be registered LAST in middleware chain
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err);

  // Don't leak error details in production
  const isDevelopment = env.NODE_ENV === 'development';

  res.status(500).json({
    success: false,
    message: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
  });
}
