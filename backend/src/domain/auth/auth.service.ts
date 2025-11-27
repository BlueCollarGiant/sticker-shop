import jwt, { SignOptions } from 'jsonwebtoken';
import { IAuthRepository, User, RegisterUserInput, LoginResult, JWTPayload } from './auth.types';
import { env } from '../../config/env';

/**
 * Auth Service - Business logic for authentication
 *
 * Handles:
 * - User login/registration
 * - JWT token generation and verification
 * - Password validation (in demo mode, plain text comparison)
 */
export class AuthService {
  constructor(private readonly authRepository: IAuthRepository) {}

  /**
   * Generate JWT token for user
   */
  generateToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRY,
    } as SignOptions);
  }

  /**
   * Verify JWT token and return payload
   */
  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<LoginResult> {
    // Get user with password from repository
    const userWithPassword = await this.authRepository.getUserWithPassword(email);

    if (!userWithPassword) {
      throw new Error('Invalid credentials');
    }

    // In demo mode, we compare plain text passwords
    // In production, this would use bcrypt.compare()
    if (userWithPassword.password !== password) {
      throw new Error('Invalid credentials');
    }

    // Remove password from user object
    const { password: _, ...user } = userWithPassword;

    // Generate token
    const token = this.generateToken(user);

    return {
      token,
      user,
    };
  }

  /**
   * Register new user
   */
  async register(input: RegisterUserInput): Promise<LoginResult> {
    // Create user in repository
    const user = await this.authRepository.createUser(input);

    // Generate token
    const token = this.generateToken(user);

    return {
      token,
      user,
    };
  }

  /**
   * Get user from JWT token
   */
  async getUserFromToken(token: string): Promise<User> {
    const decoded = this.verifyToken(token);

    const user = await this.authRepository.findUserById(decoded.userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User> {
    const user = await this.authRepository.findUserById(id);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
