/**
 * Scheduled Rides Routes
 */

const express = require('express');
const router = express.Router();
const scheduledRidesController = require('../controllers/scheduledRidesController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { body, param, query } = require('express-validator');
const validation = require('../middleware/validation');

// Validation schemas
const createScheduledRideValidation = [
  body('pickupAddress').notEmpty().withMessage('Pickup address is required'),
  body('pickupLatitude').isFloat({ min: -90, max: 90 }).withMessage('Valid pickup latitude required'),
  body('pickupLongitude').isFloat({ min: -180, max: 180 }).withMessage('Valid pickup longitude required'),
  body('dropoffAddress').notEmpty().withMessage('Dropoff address is required'),
  body('dropoffLatitude').isFloat({ min: -90, max: 90 }).withMessage('Valid dropoff latitude required'),
  body('dropoffLongitude').isFloat({ min: -180, max: 180 }).withMessage('Valid dropoff longitude required'),
  body('vehicleType').isIn(['economy', 'comfort', 'premium', 'suv', 'xl']).withMessage('Valid vehicle type required'),
  body('paymentMethod').isIn(['cash', 'card', 'wallet', 'upi']).withMessage('Valid payment method required'),
  body('scheduledAt').isISO8601().withMessage('Valid scheduled date/time required'),
  validation
];

const updateScheduledRideValidation = [
  param('tripId').isUUID().withMessage('Valid trip ID required'),
  body('scheduledAt').optional().isISO8601().withMessage('Valid scheduled date/time required'),
  body('pickupLatitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Valid pickup latitude required'),
  body('pickupLongitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Valid pickup longitude required'),
  validation
];

// Rider routes
router.post(
  '/',
  auth,
  roleCheck(['rider']),
  createScheduledRideValidation,
  scheduledRidesController.createScheduledRide
);

router.get(
  '/',
  auth,
  roleCheck(['rider']),
  scheduledRidesController.getScheduledRides
);

router.put(
  '/:tripId',
  auth,
  roleCheck(['rider']),
  updateScheduledRideValidation,
  scheduledRidesController.updateScheduledRide
);

router.post(
  '/:tripId/cancel',
  auth,
  roleCheck(['rider']),
  [
    param('tripId').isUUID().withMessage('Valid trip ID required'),
    body('reason').optional().isString(),
    validation
  ],
  scheduledRidesController.cancelScheduledRide
);

// Driver routes
router.get(
  '/available',
  auth,
  roleCheck(['driver']),
  scheduledRidesController.getAvailableScheduledRides
);

router.get(
  '/my-scheduled',
  auth,
  roleCheck(['driver']),
  scheduledRidesController.getDriverScheduledRides
);

router.post(
  '/:tripId/accept',
  auth,
  roleCheck(['driver']),
  [
    param('tripId').isUUID().withMessage('Valid trip ID required'),
    body('vehicleId').isUUID().withMessage('Valid vehicle ID required'),
    validation
  ],
  scheduledRidesController.acceptScheduledRide
);

module.exports = router;
