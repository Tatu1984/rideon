const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validation');
const paymentController = require('../controllers/paymentController');

// Stripe webhook - MUST be before auth middleware
// Uses raw body for signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// All other routes require authentication
router.use(auth);

// Create payment intent
router.post('/intent',
  roleCheck(['rider']),
  [
    body('amount').isInt({ min: 100 }).withMessage('Amount must be at least 100 cents'),
    body('tripId').optional().isUUID().withMessage('Invalid trip ID format'),
    body('paymentMethod').optional().isIn(['card', 'wallet']).withMessage('Invalid payment method')
  ],
  validate,
  paymentController.createPaymentIntent
);

// Confirm payment
router.post('/confirm',
  roleCheck(['rider']),
  [
    body('tripId').isUUID().withMessage('Valid trip ID is required'),
    body('paymentIntentId').isString().notEmpty().withMessage('Payment intent ID is required'),
    body('paymentMethod').optional().isIn(['card', 'wallet']).withMessage('Invalid payment method')
  ],
  validate,
  paymentController.confirmPayment
);

// Get payment history
router.get('/history',
  roleCheck(['rider']),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  validate,
  paymentController.getPaymentHistory
);

// Request refund
router.post('/refund',
  roleCheck(['rider']),
  [
    body('paymentId').isUUID().withMessage('Valid payment ID is required'),
    body('reason').isString().isLength({ min: 10, max: 500 }).withMessage('Reason must be between 10 and 500 characters')
  ],
  validate,
  paymentController.requestRefund
);

// Driver payout routes
router.post('/connect-account', roleCheck(['driver']), paymentController.createConnectAccount);

router.post('/payout',
  roleCheck(['driver']),
  [
    body('amount').isInt({ min: 100 }).withMessage('Payout amount must be at least 100 cents')
  ],
  validate,
  paymentController.processDriverPayout
);

module.exports = router;
