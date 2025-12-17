const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validation');
const { authLimiter } = require('../middleware/security');

const router = express.Router();

// Register - with auth rate limiting to prevent mass account creation
router.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('role')
      .isIn(['rider', 'driver'])
      .withMessage('Role must be either rider or driver'),
    validate
  ],
  authController.register
);

// Login - with auth rate limiting to prevent brute force attacks
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  authController.login
);

// Refresh token - with rate limiting
router.post(
  '/refresh',
  authLimiter,
  [body('refreshToken').notEmpty().withMessage('Refresh token is required'), validate],
  authController.refreshToken
);

// Logout
router.post('/logout', auth, authController.logout);

// Get current user profile
router.get('/profile', auth, authController.getProfile);

module.exports = router;
