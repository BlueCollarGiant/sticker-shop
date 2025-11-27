/**
 * Auth domain types
 * Pure business logic types with no infrastructure concerns
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface RegisterUserInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginResult {
  token: string;
  user: User;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token?: string;
    user?: User;
  };
}

/**
 * Auth repository interface (port)
 * Defines what operations we need from storage
 */
export interface IAuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  createUser(input: RegisterUserInput): Promise<User>;
  getUserWithPassword(email: string): Promise<(User & { password: string }) | null>;
}
