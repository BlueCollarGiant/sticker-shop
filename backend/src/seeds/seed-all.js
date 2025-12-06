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
  {
    id: 'user-2',
    email: 'alice.johnson@nightreader.com',
    password: 'user123',
    name: 'Alice Johnson',
    role: 'user',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: 'user-3',
    email: 'bob.smith@nightreader.com',
    password: 'user123',
    name: 'Bob Smith',
    role: 'user',
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
  },
  {
    id: 'user-4',
    email: 'carol.williams@nightreader.com',
    password: 'user123',
    name: 'Carol Williams',
    role: 'user',
    createdAt: '2024-01-04T00:00:00.000Z',
    updatedAt: '2024-01-04T00:00:00.000Z',
  },
  {
    id: 'user-5',
    email: 'david.brown@nightreader.com',
    password: 'user123',
    name: 'David Brown',
    role: 'user',
    createdAt: '2024-01-05T00:00:00.000Z',
    updatedAt: '2024-01-05T00:00:00.000Z',
  },
  {
    id: 'user-6',
    email: 'emma.davis@nightreader.com',
    password: 'user123',
    name: 'Emma Davis',
    role: 'user',
    createdAt: '2024-01-06T00:00:00.000Z',
    updatedAt: '2024-01-06T00:00:00.000Z',
  },
  {
    id: 'user-7',
    email: 'frank.miller@nightreader.com',
    password: 'user123',
    name: 'Frank Miller',
    role: 'user',
    createdAt: '2024-01-07T00:00:00.000Z',
    updatedAt: '2024-01-07T00:00:00.000Z',
  },
  {
    id: 'user-8',
    email: 'grace.wilson@nightreader.com',
    password: 'user123',
    name: 'Grace Wilson',
    role: 'user',
    createdAt: '2024-01-08T00:00:00.000Z',
    updatedAt: '2024-01-08T00:00:00.000Z',
  },
  {
    id: 'user-9',
    email: 'henry.moore@nightreader.com',
    password: 'user123',
    name: 'Henry Moore',
    role: 'user',
    createdAt: '2024-01-09T00:00:00.000Z',
    updatedAt: '2024-01-09T00:00:00.000Z',
  },
  {
    id: 'user-10',
    email: 'isabella.taylor@nightreader.com',
    password: 'user123',
    name: 'Isabella Taylor',
    role: 'user',
    createdAt: '2024-01-10T00:00:00.000Z',
    updatedAt: '2024-01-10T00:00:00.000Z',
  },
  {
    id: 'user-11',
    email: 'jack.anderson@nightreader.com',
    password: 'user123',
    name: 'Jack Anderson',
    role: 'user',
    createdAt: '2024-01-11T00:00:00.000Z',
    updatedAt: '2024-01-11T00:00:00.000Z',
  },
  {
    id: 'user-12',
    email: 'kate.thomas@nightreader.com',
    password: 'user123',
    name: 'Kate Thomas',
    role: 'user',
    createdAt: '2024-01-12T00:00:00.000Z',
    updatedAt: '2024-01-12T00:00:00.000Z',
  },
  {
    id: 'user-13',
    email: 'liam.jackson@nightreader.com',
    password: 'user123',
    name: 'Liam Jackson',
    role: 'user',
    createdAt: '2024-01-13T00:00:00.000Z',
    updatedAt: '2024-01-13T00:00:00.000Z',
  },
  {
    id: 'user-14',
    email: 'mia.white@nightreader.com',
    password: 'user123',
    name: 'Mia White',
    role: 'user',
    createdAt: '2024-01-14T00:00:00.000Z',
    updatedAt: '2024-01-14T00:00:00.000Z',
  },
  {
    id: 'user-15',
    email: 'noah.harris@nightreader.com',
    password: 'user123',
    name: 'Noah Harris',
    role: 'user',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: 'user-16',
    email: 'olivia.martin@nightreader.com',
    password: 'user123',
    name: 'Olivia Martin',
    role: 'user',
    createdAt: '2024-01-16T00:00:00.000Z',
    updatedAt: '2024-01-16T00:00:00.000Z',
  },
  {
    id: 'user-17',
    email: 'peter.thompson@nightreader.com',
    password: 'user123',
    name: 'Peter Thompson',
    role: 'user',
    createdAt: '2024-01-17T00:00:00.000Z',
    updatedAt: '2024-01-17T00:00:00.000Z',
  },
  {
    id: 'user-18',
    email: 'quinn.garcia@nightreader.com',
    password: 'user123',
    name: 'Quinn Garcia',
    role: 'user',
    createdAt: '2024-01-18T00:00:00.000Z',
    updatedAt: '2024-01-18T00:00:00.000Z',
  },
  {
    id: 'user-19',
    email: 'rachel.martinez@nightreader.com',
    password: 'user123',
    name: 'Rachel Martinez',
    role: 'user',
    createdAt: '2024-01-19T00:00:00.000Z',
    updatedAt: '2024-01-19T00:00:00.000Z',
  },
  {
    id: 'user-20',
    email: 'samuel.robinson@nightreader.com',
    password: 'user123',
    name: 'Samuel Robinson',
    role: 'user',
    createdAt: '2024-01-20T00:00:00.000Z',
    updatedAt: '2024-01-20T00:00:00.000Z',
  },
  {
    id: 'user-21',
    email: 'tara.clark@nightreader.com',
    password: 'user123',
    name: 'Tara Clark',
    role: 'user',
    createdAt: '2024-01-21T00:00:00.000Z',
    updatedAt: '2024-01-21T00:00:00.000Z',
  },
  {
    id: 'user-22',
    email: 'uma.rodriguez@nightreader.com',
    password: 'user123',
    name: 'Uma Rodriguez',
    role: 'user',
    createdAt: '2024-01-22T00:00:00.000Z',
    updatedAt: '2024-01-22T00:00:00.000Z',
  },
  {
    id: 'user-23',
    email: 'victor.lewis@nightreader.com',
    password: 'user123',
    name: 'Victor Lewis',
    role: 'user',
    createdAt: '2024-01-23T00:00:00.000Z',
    updatedAt: '2024-01-23T00:00:00.000Z',
  },
  {
    id: 'user-24',
    email: 'wendy.lee@nightreader.com',
    password: 'user123',
    name: 'Wendy Lee',
    role: 'user',
    createdAt: '2024-01-24T00:00:00.000Z',
    updatedAt: '2024-01-24T00:00:00.000Z',
  },
  {
    id: 'user-25',
    email: 'xavier.walker@nightreader.com',
    password: 'user123',
    name: 'Xavier Walker',
    role: 'user',
    createdAt: '2024-01-25T00:00:00.000Z',
    updatedAt: '2024-01-25T00:00:00.000Z',
  },
  {
    id: 'user-26',
    email: 'yara.hall@nightreader.com',
    password: 'user123',
    name: 'Yara Hall',
    role: 'user',
    createdAt: '2024-01-26T00:00:00.000Z',
    updatedAt: '2024-01-26T00:00:00.000Z',
  },
  {
    id: 'user-27',
    email: 'zack.allen@nightreader.com',
    password: 'user123',
    name: 'Zack Allen',
    role: 'user',
    createdAt: '2024-01-27T00:00:00.000Z',
    updatedAt: '2024-01-27T00:00:00.000Z',
  },
  {
    id: 'user-28',
    email: 'amy.young@nightreader.com',
    password: 'user123',
    name: 'Amy Young',
    role: 'user',
    createdAt: '2024-01-28T00:00:00.000Z',
    updatedAt: '2024-01-28T00:00:00.000Z',
  },
  {
    id: 'user-29',
    email: 'brian.king@nightreader.com',
    password: 'user123',
    name: 'Brian King',
    role: 'user',
    createdAt: '2024-01-29T00:00:00.000Z',
    updatedAt: '2024-01-29T00:00:00.000Z',
  },
  {
    id: 'user-30',
    email: 'claire.wright@nightreader.com',
    password: 'user123',
    name: 'Claire Wright',
    role: 'user',
    createdAt: '2024-01-30T00:00:00.000Z',
    updatedAt: '2024-01-30T00:00:00.000Z',
  },
  {
    id: 'user-31',
    email: 'daniel.lopez@nightreader.com',
    password: 'user123',
    name: 'Daniel Lopez',
    role: 'user',
    createdAt: '2024-01-31T00:00:00.000Z',
    updatedAt: '2024-01-31T00:00:00.000Z',
  },
];

function writeData(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function seedAll() {
  console.log('\nSeeding local file stores...\n');

  writeData(usersFile, defaultUsers);
  writeData(productsFile, productSeeds);
  writeData(ordersFile, []);
  writeData(cartsFile, []);

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
