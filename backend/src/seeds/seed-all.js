#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { productSeeds } = require('./seed-products.js');

const usersFile = path.join(__dirname, '../data/users.json');
const productsFile = path.join(__dirname, '../data/products.json');
const ordersFile = path.join(__dirname, '../data/orders.json');
const cartsFile = path.join(__dirname, '../data/carts.json');

const defaultUsers = [
  {
    id: 'user-1',
    email: 'demo@nightreader.com',
    password: 'demo123',
    name: 'Demo User',
    role: 'user',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'admin-1',
    email: 'admin@nightreader.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

function ensureFile(filePath, fallbackData) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(fallbackData, null, 2), 'utf-8');
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  if (!content || content.trim() === '') {
    fs.writeFileSync(filePath, JSON.stringify(fallbackData, null, 2), 'utf-8');
  }
}

async function seedAll() {
  console.log('\nSeeding local file stores...\n');

  ensureFile(usersFile, defaultUsers);
  ensureFile(productsFile, productSeeds);
  ensureFile(ordersFile, []);
  ensureFile(cartsFile, []);

  console.log('Users:', JSON.parse(fs.readFileSync(usersFile, 'utf-8')).length);
  console.log('Products:', JSON.parse(fs.readFileSync(productsFile, 'utf-8')).length);
  console.log('Orders:', JSON.parse(fs.readFileSync(ordersFile, 'utf-8')).length);
  console.log('Carts:', JSON.parse(fs.readFileSync(cartsFile, 'utf-8')).length);
  console.log('\nSeeding complete.\n');
}

if (require.main === module) {
  seedAll().catch(error => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
}

module.exports = { seedAll };
