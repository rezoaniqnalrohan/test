const db = require('../config/db');

const ProductModel = {
  /**
   * Fetch all products for a specific user with optional search and sorting
   * @param {Object} options
   * @param {number} options.userId
   * @param {string} [options.search]
   * @param {string} [options.sortBy='id']
   * @param {string} [options.sortOrder='DESC']
   */
  getAll({ userId, search = '', sortBy = 'id', sortOrder = 'DESC' } = {}) {
    const allowedSortFields = ['id', 'name', 'price', 'quantity', 'created_at'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let query = `
      SELECT id, user_id, name, price, quantity, created_at, updated_at
      FROM products
      WHERE user_id = ?
    `;
    const params = [Number(userId)];

    if (search && search.trim() !== '') {
      query += ` AND LOWER(name) LIKE ?`;
      params.push(`%${search.trim().toLowerCase()}%`);
    }

    query += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;

    const stmt = db.prepare(query);
    return stmt.all(...params);
  },

  /**
   * Fetch a single product by ID for a specific user
   * @param {number} id
   * @param {number} userId
   */
  getById(id, userId) {
    const stmt = db.prepare(`
      SELECT id, user_id, name, price, quantity, created_at, updated_at
      FROM products
      WHERE id = ? AND user_id = ?
    `);
    return stmt.get(Number(id), Number(userId)) || null;
  },

  /**
   * Create a new product for a user
   * @param {Object} data
   * @param {number} data.userId
   * @param {string} data.name
   * @param {number} data.price
   * @param {number} data.quantity
   */
  create({ userId, name, price, quantity }) {
    const stmt = db.prepare(`
      INSERT INTO products (user_id, name, price, quantity)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(Number(userId), name.trim(), Number(price), parseInt(quantity, 10));
    return this.getById(result.lastInsertRowid, userId);
  },

  /**
   * Update an existing product for a user
   * @param {number} id
   * @param {number} userId
   * @param {Object} data
   * @param {string} data.name
   * @param {number} data.price
   * @param {number} data.quantity
   */
  update(id, userId, { name, price, quantity }) {
    const stmt = db.prepare(`
      UPDATE products
      SET name = ?, price = ?, quantity = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `);
    const result = stmt.run(name.trim(), Number(price), parseInt(quantity, 10), Number(id), Number(userId));
    if (result.changes === 0) {
      return null;
    }
    return this.getById(id, userId);
  },

  /**
   * Delete a product by ID for a user
   * @param {number} id
   * @param {number} userId
   */
  delete(id, userId) {
    const stmt = db.prepare(`
      DELETE FROM products
      WHERE id = ? AND user_id = ?
    `);
    const result = stmt.run(Number(id), Number(userId));
    return result.changes > 0;
  },

  /**
   * Retrieve summary statistics for inventory dashboard for a user
   * @param {number} userId
   */
  getStats(userId) {
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as totalProducts,
        COALESCE(SUM(quantity), 0) as totalQuantity,
        COALESCE(SUM(price * quantity), 0) as totalValue,
        COALESCE(SUM(CASE WHEN quantity <= 5 AND quantity > 0 THEN 1 ELSE 0 END), 0) as lowStockCount,
        COALESCE(SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END), 0) as outOfStockCount
      FROM products
      WHERE user_id = ?
    `);
    return stmt.get(Number(userId));
  }
};

module.exports = ProductModel;
