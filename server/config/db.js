const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbPath = path.resolve(process.cwd(), process.env.DB_PATH || './data/products.db');
const dbDir = path.dirname(dbPath);

// Ensure the directory for SQLite DB exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize SQLite database instance
const db = new DatabaseSync(dbPath);

// Create Users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Create Products table
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Check and add user_id column if table was previously created without it
const productCols = db.prepare('PRAGMA table_info(products)').all();
const hasUserId = productCols.some(col => col.name === 'user_id');
if (!hasUserId) {
  db.exec('ALTER TABLE products ADD COLUMN user_id INTEGER');
}

// Ensure default demo user exists
const userCountStmt = db.prepare('SELECT COUNT(*) as count FROM users');
const { count: userCount } = userCountStmt.get();

let defaultUserId = 1;

if (userCount === 0) {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync('Password123!', salt);

  const insertUserStmt = db.prepare(`
    INSERT INTO users (name, email, password)
    VALUES (?, ?, ?)
  `);
  const result = insertUserStmt.run('Demo User', 'demo@example.com', hashedPassword);
  defaultUserId = Number(result.lastInsertRowid);
  console.log('[Database] Created demo user: demo@example.com (Password: Password123!)');
} else {
  const firstUser = db.prepare('SELECT id FROM users ORDER BY id ASC LIMIT 1').get();
  if (firstUser) defaultUserId = firstUser.id;
}

// Link any unassigned products to the demo user
db.prepare('UPDATE products SET user_id = ? WHERE user_id IS NULL').run(defaultUserId);

// Seed default products if database has none
const countStmt = db.prepare('SELECT COUNT(*) as count FROM products');
const { count: productCount } = countStmt.get();

if (productCount === 0) {
  const insertStmt = db.prepare(`
    INSERT INTO products (user_id, name, price, quantity)
    VALUES (?, ?, ?, ?)
  `);

  const sampleProducts = [
    { name: 'Ergonomic Mechanical Keyboard', price: 129.99, quantity: 24 },
    { name: 'Wireless Precision Mouse', price: 59.50, quantity: 45 },
    { name: 'Ultra-Wide 34" Curved Monitor', price: 499.00, quantity: 8 },
    { name: 'USB-C Multiport Docking Station', price: 89.95, quantity: 15 },
    { name: 'Noise-Cancelling Over-Ear Headphones', price: 199.99, quantity: 12 },
    { name: 'Aluminum Laptop Stand', price: 39.99, quantity: 30 }
  ];

  for (const item of sampleProducts) {
    insertStmt.run(defaultUserId, item.name, item.price, item.quantity);
  }

  console.log(`[Database] Initialized and seeded ${sampleProducts.length} default products for user #${defaultUserId}.`);
} else {
  console.log(`[Database] Connected to SQLite database (${userCount} users, ${productCount} products).`);
}

module.exports = db;
