const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const USERS_FILE = path.join(__dirname, '../../data/demo-users.json');

class FileAuthRepository {
  loadUsers() {
    try {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }

  saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  }

  async findByEmail(email) {
    const users = this.loadUsers();
    return users.find(u => u.email === email) || null;
  }

  async findById(id) {
    const users = this.loadUsers();
    return users.find(u => u.id === id) || null;
  }

  async createUser(userData) {
    const users = this.loadUsers();

    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: userData.email,
      password: await bcrypt.hash(userData.password, 10),
      name: userData.name,
      role: userData.role || 'user',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);

    // Return without password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async getUserCount() {
    return this.loadUsers().length;
  }

  async isEmpty() {
    return this.loadUsers().length === 0;
  }
}

module.exports = new FileAuthRepository();
