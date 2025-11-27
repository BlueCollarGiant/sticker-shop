import { promises as fs } from 'fs';
import path from 'path';
import { IAuthRepository, User, RegisterUserInput } from '../../domain/auth/auth.types';

/**
 * Demo Auth Store - Async file-based user storage
 *
 * In demo mode, we store users in a JSON file and keep predefined demo accounts.
 * In production, this would be replaced with a proper database implementation.
 */

interface StoredUser extends User {
  password: string; // Stored in plain text for demo; would be hashed in production
}

export class DemoAuthStore implements IAuthRepository {
  private usersFile: string;
  private usersCache: Map<string, StoredUser> = new Map();
  private cacheTime: number = 0;
  private readonly CACHE_TTL = 5000; // 5 seconds

  // Predefined demo users
  private readonly DEMO_USERS: StoredUser[] = [
    {
      id: 'user-1',
      email: 'demo@nightreader.com',
      password: 'demo123',
      name: 'Demo User',
      role: 'user',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'admin-1',
      email: 'admin@nightreader.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ];

  constructor() {
    this.usersFile = path.join(__dirname, '../../../data/demo-users.json');
    this.initializeDemoUsers();
  }

  /**
   * Initialize demo users file if it doesn't exist
   */
  private async initializeDemoUsers(): Promise<void> {
    try {
      await fs.access(this.usersFile);
    } catch {
      // File doesn't exist, create it with demo users
      await fs.mkdir(path.dirname(this.usersFile), { recursive: true });
      await fs.writeFile(this.usersFile, JSON.stringify(this.DEMO_USERS, null, 2), 'utf8');
    }
  }

  /**
   * Load users from file (async)
   */
  private async loadUsers(): Promise<Map<string, StoredUser>> {
    const now = Date.now();

    // Return cached users if fresh
    if (this.usersCache.size > 0 && now - this.cacheTime < this.CACHE_TTL) {
      return this.usersCache;
    }

    try {
      const data = await fs.readFile(this.usersFile, 'utf8');
      const users: StoredUser[] = JSON.parse(data);

      // Convert to Map for fast lookups
      this.usersCache.clear();
      users.forEach(user => {
        // Convert date strings back to Date objects
        user.createdAt = new Date(user.createdAt);
        user.updatedAt = new Date(user.updatedAt);
        this.usersCache.set(user.email.toLowerCase(), user);
      });

      this.cacheTime = now;
      return this.usersCache;
    } catch (error) {
      console.error('Error loading demo users:', error);
      // Return demo users if file read fails
      this.usersCache.clear();
      this.DEMO_USERS.forEach(user => {
        this.usersCache.set(user.email.toLowerCase(), user);
      });
      return this.usersCache;
    }
  }

  /**
   * Save users to file (async)
   */
  private async saveUsers(users: Map<string, StoredUser>): Promise<void> {
    try {
      const usersArray = Array.from(users.values());
      await fs.writeFile(this.usersFile, JSON.stringify(usersArray, null, 2), 'utf8');
      this.usersCache = users;
      this.cacheTime = Date.now();
    } catch (error) {
      console.error('Error saving demo users:', error);
      throw new Error('Failed to save user data');
    }
  }

  /**
   * Remove password from user object
   */
  private stripPassword(user: StoredUser): User {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const users = await this.loadUsers();
    const user = users.get(email.toLowerCase());
    return user ? this.stripPassword(user) : null;
  }

  async findUserById(id: string): Promise<User | null> {
    const users = await this.loadUsers();
    const user = Array.from(users.values()).find(u => u.id === id);
    return user ? this.stripPassword(user) : null;
  }

  async getUserWithPassword(email: string): Promise<(User & { password: string }) | null> {
    const users = await this.loadUsers();
    return users.get(email.toLowerCase()) || null;
  }

  async createUser(input: RegisterUserInput): Promise<User> {
    const users = await this.loadUsers();

    // Check if user already exists
    if (users.has(input.email.toLowerCase())) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser: StoredUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: input.email.toLowerCase(),
      password: input.password, // In production, this would be hashed
      name: input.name,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.set(newUser.email, newUser);
    await this.saveUsers(users);

    return this.stripPassword(newUser);
  }
}
