import { User } from './user.model';

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface DemoLoginRequest {
  role: 'user' | 'admin';
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}
