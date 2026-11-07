const bcrypt = require('bcryptjs');
const db = require('./db');

console.log('[Seed] Resetting and re-seeding users and products table...');

db.exec(`
  DELETE FROM products;
  DELETE FROM users;
  DELETE FROM sqlite_sequence WHERE name = 'products';
  DELETE FROM sqlite_sequence WHERE name = 'users';
`);

// Create demo user
const hashedPassword = bcrypt.hashSync('Password123!', 10);
const insertUser = db.prepare(`
  INSERT INTO users (name, email, password)
  VALUES (?, ?, ?)
`);
const userRes = insertUser.run('Demo User', 'demo@example.com', hashedPassword);
const demoUserId = Number(userRes.lastInsertRowid);

console.log(`[Seed] Created Demo User: demo@example.com / Password123! (ID: ${demoUserId})`);

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
  { name: 'Aluminum Laptop Stand', price: 39.99, quantity: 30 },
  { name: '1080p Full HD Webcam', price: 69.99, quantity: 18 },
  { name: 'Desk Pad Mat XXL (Waterproof)', price: 24.99, quantity: 50 }
];

for (const item of sampleProducts) {
  insertStmt.run(demoUserId, item.name, item.price, item.quantity);
}

console.log(`[Seed] Successfully seeded ${sampleProducts.length} products for Demo User.`);
process.exit(0);
