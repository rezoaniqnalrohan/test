const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');

// Public auth routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected user profile route
router.get('/me', authenticate, AuthController.getMe);

module.exports = router;
