import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

/**
 * Auth Controller - HTTP request/response handling
 *
 * Responsibilities:
 * - Parse HTTP requests
 * - Call AuthService for business logic
 * - Format HTTP responses
 * - Delegate error handling to middleware
 */
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/login
   * Authenticate user and return JWT token
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      const result = await this.authService.login(email, password);

      res.json({
        success: true,
        data: {
          token: result.token,
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/auth/register
   * Register new user and return JWT token
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, name } = req.body;

      const result = await this.authService.register({ email, password, name });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          token: result.token,
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/auth/me
   * Get current user from JWT token
   */
  getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // User is already attached to req by auth middleware
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const user = await this.authService.getUserById(userId);

      res.json({
        success: true,
        data: {
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/auth/logout
   * Logout user (client-side token removal)
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // In JWT setup, logout is handled client-side by removing the token
      // This endpoint can be used for logging or cleanup if needed
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
