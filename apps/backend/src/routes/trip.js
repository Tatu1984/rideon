const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validation');
const tripController = require('../controllers/tripController');

// All routes require authentication
router.use(auth);

// Trip request (rider only)
router.post('/',
  [
    body('pickupLatitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid pickup latitude'),
    body('pickupLongitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid pickup longitude'),
    body('dropoffLatitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid dropoff latitude'),
    body('dropoffLongitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid dropoff longitude'),
    body('pickupAddress').isString().notEmpty().withMessage('Pickup address is required'),
    body('dropoffAddress').isString().notEmpty().withMessage('Dropoff address is required'),
    body('vehicleType').optional().isIn(['economy', 'comfort', 'premium', 'xl']).withMessage('Invalid vehicle type'),
    body('estimatedFare').optional().isFloat({ min: 0 }).withMessage('Estimated fare must be positive'),
    body('estimatedDistance').optional().isFloat({ min: 0 }).withMessage('Estimated distance must be positive')
  ],
  validate,
  tripController.requestTrip
);

// Get trip details
router.get('/:tripId',
  [
    param('tripId').isUUID().withMessage('Invalid trip ID format')
  ],
  validate,
  tripController.getTripDetails
);

// Accept trip (driver only)
router.post('/:tripId/accept',
  [
    param('tripId').isUUID().withMessage('Invalid trip ID format')
  ],
  validate,
  tripController.acceptTrip
);

// Update trip status (driver only)
router.put('/:tripId/status',
  [
    param('tripId').isUUID().withMessage('Invalid trip ID format'),
    body('status').isIn(['driver_arrived', 'in_progress', 'completed']).withMessage('Invalid trip status')
  ],
  validate,
  tripController.updateTripStatus
);

// Cancel trip (rider or driver)
router.post('/:tripId/cancel',
  [
    param('tripId').isUUID().withMessage('Invalid trip ID format'),
    body('reason').optional().isString().isLength({ max: 500 }).withMessage('Reason must be at most 500 characters')
  ],
  validate,
  tripController.cancelTrip
);

// Rate trip (rider or driver)
router.post('/:tripId/rate',
  [
    param('tripId').isUUID().withMessage('Invalid trip ID format'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString().isLength({ max: 1000 }).withMessage('Comment must be at most 1000 characters')
  ],
  validate,
  tripController.rateTrip
);

module.exports = router;
