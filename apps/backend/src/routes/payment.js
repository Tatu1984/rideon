const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const paymentController = require('../controllers/paymentController');

// All routes require authentication
router.use(auth);

// Create payment intent
router.post('/intent', roleCheck(['rider']), paymentController.createPaymentIntent);

// Confirm payment
router.post('/confirm', roleCheck(['rider']), paymentController.confirmPayment);

// Get payment history
router.get('/history', roleCheck(['rider']), paymentController.getPaymentHistory);

// Request refund
router.post('/refund', roleCheck(['rider']), paymentController.requestRefund);

module.exports = router;
