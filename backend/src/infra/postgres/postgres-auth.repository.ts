/**
 * PostgreSQL Auth Repository
 * Implements IAuthRepository using Prisma + PostgreSQL
 */

import { prisma } from './prisma-client';
import { IAuthRepository, User, RegisterUserInput } from '../../domain/auth/auth.types';

export class PostgresAuthRepository implements IAuthRepository {
  /**
   * Find user by email address
   */
  async findUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return this.mapToUser(user);
  }

  /**
   * Find user by ID
   */
  async findUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return this.mapToUser(user);
  }

  /**
   * Create a new user
   * Note: Using plain-text password for now to match demo behavior
   * bcrypt hashing will be added in Phase 3 Step 2 (Security)
   */
  async createUser(input: RegisterUserInput): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.password, // Plain-text for now (matches demo mode)
        name: input.name,
        role: 'user',
      },
    });

    return this.mapToUser(user);
  }

  /**
   * Get user with password (for authentication)
   * Returns user with password field for credential validation
   */
  async getUserWithPassword(email: string): Promise<(User & { password: string }) | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'user' | 'admin',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      password: user.passwordHash, // Mapped to 'password' for domain compatibility
    };
  }

  /**
   * Map Prisma User model to domain User type
   */
  private mapToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as 'user' | 'admin',
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    };
  }
}
