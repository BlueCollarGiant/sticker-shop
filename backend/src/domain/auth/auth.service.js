const jwt = require('jsonwebtoken');
const { env } = require('../../config/env.js');

class AuthService {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRY,
    });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  async login(email, password) {
    const userWithPassword = await this.authRepository.getUserWithPassword(email);

    if (!userWithPassword || userWithPassword.password !== password) {
      throw new Error('Invalid credentials');
    }

    const { password: _, ...userWithoutPassword } = userWithPassword;
    const token = this.generateToken(userWithoutPassword);

    return {
      token,
      user: userWithoutPassword,
    };
  }

  async register(input) {
    const user = await this.authRepository.createUser(input);
    const token = this.generateToken(user);

    return {
      token,
      user,
    };
  }

  async getUserFromToken(token) {
    const decoded = this.verifyToken(token);
    const user = await this.authRepository.findById(decoded.userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async getUserById(id) {
    const user = await this.authRepository.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}

module.exports = { AuthService };
