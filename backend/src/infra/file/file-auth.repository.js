const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const USERS_FILE = path.join(__dirname, '../../data/users.json');
const SALT_ROUNDS = 10;

function ensureStore() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
      fs.writeFileSync(USERS_FILE, '[]', 'utf-8');
    }
  } catch (error) {
    console.error('Failed to initialize users store:', error);
    throw error;
  }
}

function loadUsers() {
  ensureStore();
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

function sanitizeUser(user) {
  const { password, resetToken, resetTokenExpires, ...userWithoutSensitive } = user;
  return userWithoutSensitive;
}

function getSortTimestamp(user) {
  const value = user.createdAt || user.updatedAt || '';
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

class FileAuthRepository {
  async getAllUsers() {
    const users = loadUsers();
    return users.map(sanitizeUser);
  }

  async findByEmail(email) {
    const users = loadUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findById(id) {
    const users = loadUsers();
    const user = users.find(u => u.id === id);
    if (!user) return null;

    return sanitizeUser(user);
  }

  async getUserWithPassword(email) {
    return this.findByEmail(email);
  }

  async createUser(userData) {
    const users = loadUsers();
    const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      name: userData.name,
      role: userData.role || 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async getUsersPage(page, limit, query) {
    const users = loadUsers();

    // Filter by query if provided
    const filteredUsers = query ? this._filterUsers(users, query) : users;

    // Sort using existing logic
    const sortedUsers = filteredUsers.slice().sort((a, b) => {
      const timeDiff = getSortTimestamp(b) - getSortTimestamp(a);
      if (timeDiff !== 0) return timeDiff;
      return String(b.id).localeCompare(String(a.id));
    });

    const start = (page - 1) * limit;
    const pagedUsers = sortedUsers.slice(start, start + limit);
    return pagedUsers.map(sanitizeUser);
  }

  async getUserCount(query) {
    const users = loadUsers();
    // Return filtered count if query provided, otherwise total count
    return query ? this._filterUsers(users, query).length : users.length;
  }

  /**
   * Filter users using AND token matching (matches frontend search engine logic)
   * Query is split by whitespace into tokens, all tokens must match at least one field
   * @private
   */
  _filterUsers(users, query) {
    // Tokenize query: lowercase and split by whitespace
    const tokens = query.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);

    if (tokens.length === 0) {
      return users;
    }

    return users.filter(user => {
      // All tokens must match at least one of: name, email, role
      return tokens.every(token => {
        const name = (user.name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const role = (user.role || '').toLowerCase();

        return name.includes(token) ||
               email.includes(token) ||
               role.includes(token);
      });
    });
  }

  async isEmpty() {
    return loadUsers().length === 0;
  }
}

module.exports = new FileAuthRepository();
