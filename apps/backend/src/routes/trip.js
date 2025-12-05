const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tripController = require('../controllers/tripController');

// All routes require authentication
router.use(auth);

// Trip request (rider only)
router.post('/', tripController.requestTrip);

// Get trip details
router.get('/:tripId', tripController.getTripDetails);

// Accept trip (driver only)
router.post('/:tripId/accept', tripController.acceptTrip);

// Update trip status (driver only)
router.put('/:tripId/status', tripController.updateTripStatus);

// Cancel trip (rider or driver)
router.post('/:tripId/cancel', tripController.cancelTrip);

// Rate trip (rider or driver)
router.post('/:tripId/rate', tripController.rateTrip);

module.exports = router;
