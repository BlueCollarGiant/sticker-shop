const jwt = require('jsonwebtoken');

class AuthService {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key-change-in-production';
    this.JWT_EXPIRES_IN = '24h';

    // Demo users for quick login
    this.demoUsers = {
      user: {
        id: 'user-1',
        email: 'demo@nightreader.com',
        password: 'demo123', // In production, this would be hashed
        name: 'Demo User',
        role: 'user'
      },
      admin: {
        id: 'admin-1',
        email: 'admin@nightreader.com',
        password: 'admin123', // In production, this would be hashed
        name: 'Admin User',
        role: 'admin'
      }
    };
  }

  generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  login(email, password) {
    // Find user by email
    const user = Object.values(this.demoUsers).find(u => u.email === email);

    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    userWithoutPassword.createdAt = new Date().toISOString();

    return {
      token,
      user: userWithoutPassword
    };
  }

  demoLogin(role) {
    if (role !== 'user' && role !== 'admin') {
      throw new Error('Invalid role. Must be "user" or "admin"');
    }

    const user = this.demoUsers[role];
    const token = this.generateToken(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    userWithoutPassword.createdAt = new Date().toISOString();

    return {
      token,
      user: userWithoutPassword
    };
  }

  register(userData) {
    // In demo mode, we'll just create a user object and return a token
    // In production, this would save to a database with hashed password
    const newUser = {
      id: `user-${Date.now()}`,
      email: userData.email,
      name: userData.name || 'New User',
      role: 'user',
      createdAt: new Date().toISOString()
    };

    const token = this.generateToken(newUser);

    return {
      token,
      user: newUser
    };
  }

  getUserFromToken(token) {
    const decoded = this.verifyToken(token);

    // Find the user from demo users
    const user = Object.values(this.demoUsers).find(u => u.id === decoded.userId);

    if (!user) {
      throw new Error('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    userWithoutPassword.createdAt = new Date().toISOString();

    return userWithoutPassword;
  }
}

module.exports = new AuthService();
