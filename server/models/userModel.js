const bcrypt = require('bcryptjs');
const db = require('../config/db');

const UserModel = {
  /**
   * Find user by email
   * @param {string} email
   */
  findByEmail(email) {
    if (!email) return null;
    const stmt = db.prepare(`
      SELECT id, name, email, password, created_at, updated_at
      FROM users
      WHERE LOWER(email) = LOWER(?)
    `);
    return stmt.get(email.trim()) || null;
  },

  /**
   * Find user by ID (excludes password)
   * @param {number} id
   */
  findById(id) {
    const stmt = db.prepare(`
      SELECT id, name, email, created_at, updated_at
      FROM users
      WHERE id = ?
    `);
    return stmt.get(Number(id)) || null;
  },

  /**
   * Create a new user with hashed password
   * @param {Object} data
   * @param {string} data.name
   * @param {string} data.email
   * @param {string} data.password Plain-text password to hash
   */
  async create({ name, email, password }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const stmt = db.prepare(`
      INSERT INTO users (name, email, password)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(name.trim(), email.trim().toLowerCase(), hashedPassword);
    return this.findById(result.lastInsertRowid);
  },

  /**
   * Compare plain text password against stored hash
   * @param {string} candidatePassword
   * @param {string} hashedPassword
   */
  async comparePassword(candidatePassword, hashedPassword) {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }
};

module.exports = UserModel;
