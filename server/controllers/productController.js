const ProductModel = require('../models/productModel');

const ProductController = {
  /**
   * GET /api/products
   * List all products for authenticated user
   */
  getProducts(req, res, next) {
    try {
      const { search, sortBy, sortOrder } = req.query;
      const products = ProductModel.getAll({
        userId: req.user.id,
        search,
        sortBy,
        sortOrder
      });
      res.status(200).json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/products/stats
   * Get inventory statistics for authenticated user
   */
  getStats(req, res, next) {
    try {
      const stats = ProductModel.getStats(req.user.id);
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/products/:id
   * Fetch single product for authenticated user
   */
  getProductById(req, res, next) {
    try {
      const product = ProductModel.getById(req.params.id, req.user.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${req.params.id} was not found.`
        });
      }
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/products
   * Create a new product for authenticated user
   */
  createProduct(req, res, next) {
    try {
      const product = ProductModel.create({
        ...req.body,
        userId: req.user.id
      });
      res.status(201).json({
        success: true,
        message: 'Product created successfully.',
        data: product
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/products/:id
   * Update an existing product for authenticated user
   */
  updateProduct(req, res, next) {
    try {
      const product = ProductModel.update(req.params.id, req.user.id, req.body);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${req.params.id} was not found.`
        });
      }
      res.status(200).json({
        success: true,
        message: 'Product updated successfully.',
        data: product
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/products/:id
   * Delete a product for authenticated user
   */
  deleteProduct(req, res, next) {
    try {
      const deleted = ProductModel.delete(req.params.id, req.user.id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${req.params.id} was not found.`
        });
      }
      res.status(200).json({
        success: true,
        message: 'Product deleted successfully.',
        id: req.params.id
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = ProductController;
