const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const ProductModel = require('../models/productModel');

/**
 * Generate JWT token helper
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * Basic email format validator
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const AuthController = {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const errors = [];

      // Validate Name
      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        errors.push({ field: 'name', message: 'Name must be at least 2 characters.' });
      } else if (name.trim().length > 60) {
        errors.push({ field: 'name', message: 'Name cannot exceed 60 characters.' });
      }

      // Validate Email
      if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) {
        errors.push({ field: 'email', message: 'Please provide a valid email address.' });
      }

      // Validate Password
      if (!password || typeof password !== 'string' || password.length < 6) {
        errors.push({ field: 'password', message: 'Password must be at least 6 characters long.' });
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Registration validation failed.',
          errors
        });
      }

      // Check if user already exists
      const existingUser = UserModel.findByEmail(email.trim());
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.',
          errors: [{ field: 'email', message: 'Email is already registered.' }]
        });
      }

      // Create new user
      const newUser = await UserModel.create({
        name: name.trim(),
        email: email.trim(),
        password
      });

      // Seed a few starter products for the new user so their dashboard isn't blank
      ProductModel.create({ userId: newUser.id, name: 'Sample Item: Ergonomic Desk Chair', price: 249.99, quantity: 15 });
      ProductModel.create({ userId: newUser.id, name: 'Sample Item: Wireless Charging Pad', price: 29.50, quantity: 40 });

      // Generate JWT
      const token = generateToken(newUser);

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/login
   * Authenticate user and issue JWT
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const errors = [];

      if (!email || typeof email !== 'string' || !email.trim()) {
        errors.push({ field: 'email', message: 'Email address is required.' });
      }

      if (!password || typeof password !== 'string' || !password) {
        errors.push({ field: 'password', message: 'Password is required.' });
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide email and password.',
          errors
        });
      }

      // Look up user
      const user = UserModel.findByEmail(email.trim());
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      // Verify password
      const isMatch = await UserModel.comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      // Generate JWT
      const token = generateToken(user);

      res.status(200).json({
        success: true,
        message: 'Logged in successfully.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/auth/me
   * Retrieve currently authenticated user profile
   */
  getMe(req, res) {
    res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        created_at: req.user.created_at
      }
    });
  }
};

module.exports = AuthController;
