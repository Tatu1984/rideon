const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const driverController = require('../controllers/driverController');

// All routes require authentication and driver role
router.use(auth);
router.use(roleCheck(['driver']));

// Profile routes
router.get('/profile', driverController.getProfile);
router.put('/profile', driverController.updateProfile);

// Status and location
router.put('/status', driverController.updateStatus);
router.put('/location', driverController.updateLocation);

// Trip history
router.get('/trips', driverController.getTripHistory);

// Earnings
router.get('/earnings', driverController.getEarnings);
router.post('/payouts', driverController.requestPayout);

// Statistics
router.get('/statistics', driverController.getStatistics);

module.exports = router;
