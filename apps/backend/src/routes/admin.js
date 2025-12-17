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

// Driver management
router.get('/drivers', adminController.getDrivers);
router.get('/drivers/pending', adminController.getPendingVerifications);
router.get('/drivers/:driverId', adminController.getDriver);
router.put('/drivers/:driverId/verify', adminController.verifyDriver);
router.put('/drivers/:driverId/status', adminController.updateDriverStatus);

// Rider management
router.get('/riders', adminController.getRiders);
router.get('/riders/:riderId', adminController.getRider);

// Trip management
router.get('/trips', adminController.getAllTrips);

// Promo codes
router.get('/promo-codes', adminController.getPromoCodes);
router.post('/promo-codes', adminController.createPromoCode);
router.put('/promo-codes/:promoId', adminController.updatePromoCode);
router.delete('/promo-codes/:promoId', adminController.deletePromoCode);

// Support tickets
router.get('/support-tickets', adminController.getSupportTickets);
router.put('/support-tickets/:ticketId', adminController.updateSupportTicket);

// Analytics
router.get('/analytics/revenue', adminController.getRevenueAnalytics);
router.get('/analytics/trips', adminController.getTripAnalytics);

module.exports = router;
