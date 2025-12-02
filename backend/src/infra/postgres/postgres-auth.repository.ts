/**
 * PostgreSQL Auth Repository (disabled)
 * Placeholder to keep interface parity while demo mode is enforced.
 */

import { IAuthRepository, User, RegisterUserInput } from '../../domain/auth/auth.types';

const POSTGRES_DISABLED_MESSAGE = 'PostgresAuthRepository is disabled; use DemoAuthStore while demo mode is active.';

export class PostgresAuthRepository implements IAuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    throw new Error(POSTGRES_DISABLED_MESSAGE);
  }

  async findUserById(id: string): Promise<User | null> {
    throw new Error(POSTGRES_DISABLED_MESSAGE);
  }

  async createUser(input: RegisterUserInput): Promise<User> {
    throw new Error(POSTGRES_DISABLED_MESSAGE);
  }

  async getUserWithPassword(email: string): Promise<(User & { password: string }) | null> {
    throw new Error(POSTGRES_DISABLED_MESSAGE);
  }
}
