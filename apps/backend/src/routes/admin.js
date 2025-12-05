const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const adminController = require('../controllers/adminController');

// All routes require authentication and admin role
router.use(auth);
router.use(roleCheck(['admin']));

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// User management
router.get('/users', adminController.getUsers);
router.put('/users/:userId/toggle-status', adminController.toggleUserStatus);

// Driver verification
router.get('/drivers/pending', adminController.getPendingVerifications);
router.put('/drivers/:driverId/verify', adminController.verifyDriver);

// Trip management
router.get('/trips', adminController.getAllTrips);

// Promo codes
router.post('/promo-codes', adminController.createPromoCode);

// Support tickets
router.get('/support-tickets', adminController.getSupportTickets);
router.put('/support-tickets/:ticketId', adminController.updateSupportTicket);

module.exports = router;
