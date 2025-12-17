const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validation');
const riderController = require('../controllers/riderController');

// All routes require authentication and rider role
router.use(auth);
router.use(roleCheck(['rider']));

// Profile routes
router.get('/profile', riderController.getProfile);
router.put('/profile',
  [
    body('firstName').optional().isString().isLength({ min: 1, max: 100 }).withMessage('First name must be 1-100 characters'),
    body('lastName').optional().isString().isLength({ min: 1, max: 100 }).withMessage('Last name must be 1-100 characters'),
    body('phoneNumber').optional().isMobilePhone().withMessage('Invalid phone number')
  ],
  validate,
  riderController.updateProfile
);

// Trip history
router.get('/trips',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  validate,
  riderController.getTripHistory
);
router.get('/trips/:tripId',
  [param('tripId').isUUID().withMessage('Invalid trip ID')],
  validate,
  riderController.getTripDetails
);

// Statistics
router.get('/statistics', riderController.getStatistics);

// Favorite locations
router.post('/favorite-locations',
  [
    body('name').isString().isLength({ min: 1, max: 100 }).withMessage('Location name is required'),
    body('address').isString().isLength({ min: 1, max: 500 }).withMessage('Address is required'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    body('type').optional().isIn(['home', 'work', 'other']).withMessage('Invalid location type')
  ],
  validate,
  riderController.addFavoriteLocation
);
router.delete('/favorite-locations/:locationId',
  [param('locationId').isUUID().withMessage('Invalid location ID')],
  validate,
  riderController.removeFavoriteLocation
);

// Payment methods
router.get('/payment-methods', riderController.getPaymentMethods);
router.post('/payment-methods',
  [
    body('paymentMethodId').isString().notEmpty().withMessage('Payment method ID is required'),
    body('setDefault').optional().isBoolean().withMessage('setDefault must be a boolean')
  ],
  validate,
  riderController.addPaymentMethod
);
router.delete('/payment-methods/:cardId',
  [param('cardId').isString().notEmpty().withMessage('Invalid card ID')],
  validate,
  riderController.deletePaymentMethod
);
router.patch('/payment-methods/:cardId/default',
  [param('cardId').isString().notEmpty().withMessage('Invalid card ID')],
  validate,
  riderController.setDefaultPaymentMethod
);
router.post('/payment-methods/setup-intent', riderController.createSetupIntent);

// Active trip
router.get('/active-trip', riderController.getActiveTrip);

// Wallet
router.get('/wallet', riderController.getWallet);
router.post('/wallet/add',
  [
    body('amount').isInt({ min: 100 }).withMessage('Amount must be at least 100 cents')
  ],
  validate,
  riderController.addToWallet
);
router.get('/wallet/transactions',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  validate,
  riderController.getWalletTransactions
);

// Coupons
router.post('/coupons/apply',
  [
    body('code').isString().isLength({ min: 3, max: 50 }).withMessage('Coupon code must be 3-50 characters')
  ],
  validate,
  riderController.applyCoupon
);
router.get('/coupons', riderController.getAvailableCoupons);

// Trip management
router.post('/trips',
  [
    body('pickupLatitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid pickup latitude'),
    body('pickupLongitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid pickup longitude'),
    body('dropoffLatitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid dropoff latitude'),
    body('dropoffLongitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid dropoff longitude'),
    body('pickupAddress').isString().notEmpty().withMessage('Pickup address is required'),
    body('dropoffAddress').isString().notEmpty().withMessage('Dropoff address is required'),
    body('vehicleType').optional().isIn(['economy', 'comfort', 'premium', 'xl']).withMessage('Invalid vehicle type')
  ],
  validate,
  riderController.createTrip
);
router.post('/trips/estimate',
  [
    body('pickupLatitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid pickup latitude'),
    body('pickupLongitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid pickup longitude'),
    body('dropoffLatitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid dropoff latitude'),
    body('dropoffLongitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid dropoff longitude')
  ],
  validate,
  riderController.getEstimate
);
router.post('/trips/:tripId/cancel',
  [
    param('tripId').isUUID().withMessage('Invalid trip ID'),
    body('reason').optional().isString().isLength({ max: 500 }).withMessage('Reason must be at most 500 characters')
  ],
  validate,
  riderController.cancelTrip
);
router.post('/trips/:tripId/rate',
  [
    param('tripId').isUUID().withMessage('Invalid trip ID'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString().isLength({ max: 1000 }).withMessage('Comment must be at most 1000 characters')
  ],
  validate,
  riderController.rateTrip
);

// Support
router.post('/support',
  [
    body('subject').isString().isLength({ min: 5, max: 200 }).withMessage('Subject must be 5-200 characters'),
    body('message').isString().isLength({ min: 10, max: 2000 }).withMessage('Message must be 10-2000 characters'),
    body('category').optional().isIn(['trip_issue', 'payment', 'account', 'technical', 'other']).withMessage('Invalid category')
  ],
  validate,
  riderController.createSupportTicket
);
router.get('/support', riderController.getSupportTickets);
router.post('/lost-items',
  [
    body('tripId').isUUID().withMessage('Valid trip ID is required'),
    body('description').isString().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
    body('contactPhone').optional().isMobilePhone().withMessage('Invalid phone number')
  ],
  validate,
  riderController.reportLostItem
);

// Emergency
router.post('/sos',
  [
    body('tripId').optional().isUUID().withMessage('Invalid trip ID'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
  ],
  validate,
  riderController.triggerSOS
);
router.post('/share-trip',
  [
    body('tripId').isUUID().withMessage('Valid trip ID is required'),
    body('contactNumbers').isArray({ min: 1, max: 5 }).withMessage('Provide 1-5 contact numbers'),
    body('contactNumbers.*').isMobilePhone().withMessage('Invalid phone number in list')
  ],
  validate,
  riderController.shareTrip
);

module.exports = router;
