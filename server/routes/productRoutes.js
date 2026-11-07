const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const { validateProduct, validateId } = require('../middleware/validator');
const authenticate = require('../middleware/authMiddleware');

// All product operations require authentication
router.use(authenticate);

// Stats endpoint
router.get('/stats', ProductController.getStats);

// List all products
router.get('/', ProductController.getProducts);

// Get product by ID
router.get('/:id', validateId, ProductController.getProductById);

// Create new product
router.post('/', validateProduct, ProductController.createProduct);

// Update product
router.put('/:id', validateId, validateProduct, ProductController.updateProduct);

// Delete product
router.delete('/:id', validateId, ProductController.deleteProduct);

module.exports = router;
