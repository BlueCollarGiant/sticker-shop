import { Request, Response } from 'express';

/**
 * 404 Not Found handler
 *
 * Should be registered BEFORE error handler, AFTER all routes
 */
export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  });
}
