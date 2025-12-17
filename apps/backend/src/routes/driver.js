const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validation');
const driverController = require('../controllers/driverController');

// All routes require authentication and driver role
router.use(auth);
router.use(roleCheck(['driver']));

// Profile routes
router.get('/profile', driverController.getProfile);
router.put('/profile',
  [
    body('firstName').optional().isString().isLength({ min: 1, max: 100 }).withMessage('First name must be 1-100 characters'),
    body('lastName').optional().isString().isLength({ min: 1, max: 100 }).withMessage('Last name must be 1-100 characters'),
    body('phoneNumber').optional().isMobilePhone().withMessage('Invalid phone number')
  ],
  validate,
  driverController.updateProfile
);

// Status and location
router.put('/status',
  [
    body('status').isIn(['online', 'offline', 'busy']).withMessage('Status must be online, offline, or busy')
  ],
  validate,
  driverController.updateStatus
);

router.put('/location',
  [
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    body('address').optional().isString().isLength({ max: 500 }).withMessage('Address must be at most 500 characters')
  ],
  validate,
  driverController.updateLocation
);

// Trip history
router.get('/trips',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  validate,
  driverController.getTripHistory
);

// Earnings
router.get('/earnings', driverController.getEarnings);
router.post('/payouts',
  [
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least $1')
  ],
  validate,
  driverController.requestPayout
);
router.get('/payouts', driverController.getPayoutHistory);

// Statistics
router.get('/statistics', driverController.getStatistics);

// Document management
router.get('/documents', driverController.getDocuments);
router.post('/documents',
  [
    body('documentType').isIn(['license', 'insurance', 'registration', 'background_check', 'profile_photo']).withMessage('Invalid document type'),
    body('documentUrl').isURL().withMessage('Valid document URL is required')
  ],
  validate,
  driverController.uploadDocument
);
router.delete('/documents/:documentId',
  [param('documentId').isUUID().withMessage('Invalid document ID')],
  validate,
  driverController.deleteDocument
);

// Vehicle management
router.get('/vehicles', driverController.getVehicles);
router.post('/vehicles',
  [
    body('make').isString().isLength({ min: 1, max: 100 }).withMessage('Vehicle make is required'),
    body('model').isString().isLength({ min: 1, max: 100 }).withMessage('Vehicle model is required'),
    body('year').isInt({ min: 2000, max: 2030 }).withMessage('Year must be between 2000 and 2030'),
    body('licensePlate').isString().isLength({ min: 2, max: 20 }).withMessage('License plate is required'),
    body('color').isString().isLength({ min: 2, max: 50 }).withMessage('Vehicle color is required'),
    body('vehicleType').optional().isIn(['economy', 'comfort', 'premium', 'xl']).withMessage('Invalid vehicle type')
  ],
  validate,
  driverController.addVehicle
);
router.put('/vehicles/:vehicleId',
  [param('vehicleId').isUUID().withMessage('Invalid vehicle ID')],
  validate,
  driverController.updateVehicle
);
router.delete('/vehicles/:vehicleId',
  [param('vehicleId').isUUID().withMessage('Invalid vehicle ID')],
  validate,
  driverController.deleteVehicle
);
router.put('/vehicles/:vehicleId/set-active',
  [param('vehicleId').isUUID().withMessage('Invalid vehicle ID')],
  validate,
  driverController.setActiveVehicle
);

// Bank details
router.get('/bank-details', driverController.getBankDetails);
router.put('/bank-details',
  [
    body('bankName').isString().isLength({ min: 1, max: 200 }).withMessage('Bank name is required'),
    body('accountNumber').isString().isLength({ min: 5, max: 30 }).withMessage('Valid account number is required'),
    body('accountName').isString().isLength({ min: 1, max: 200 }).withMessage('Account name is required')
  ],
  validate,
  driverController.updateBankDetails
);

// Support tickets
router.get('/support-tickets', driverController.getSupportTickets);
router.post('/support-tickets',
  [
    body('subject').isString().isLength({ min: 5, max: 200 }).withMessage('Subject must be 5-200 characters'),
    body('message').isString().isLength({ min: 10, max: 2000 }).withMessage('Message must be 10-2000 characters'),
    body('category').optional().isIn(['trip_issue', 'payment', 'account', 'technical', 'other']).withMessage('Invalid category')
  ],
  validate,
  driverController.createSupportTicket
);
router.get('/support-tickets/:ticketId',
  [param('ticketId').isUUID().withMessage('Invalid ticket ID')],
  validate,
  driverController.getSupportTicketDetails
);
router.post('/support-tickets/:ticketId/messages',
  [
    param('ticketId').isUUID().withMessage('Invalid ticket ID'),
    body('message').isString().isLength({ min: 1, max: 2000 }).withMessage('Message must be 1-2000 characters')
  ],
  validate,
  driverController.addSupportTicketMessage
);

// Referrals
router.get('/referrals', driverController.getReferrals);
router.get('/referral-code', driverController.getReferralCode);

// Notifications
router.get('/notifications', driverController.getNotifications);
router.put('/notifications/:notificationId/read',
  [param('notificationId').isUUID().withMessage('Invalid notification ID')],
  validate,
  driverController.markNotificationRead
);
router.put('/notifications/read-all', driverController.markAllNotificationsRead);

// Trip requests (available trips for driver to accept)
router.get('/available-trips', driverController.getAvailableTrips);
router.post('/trips/:tripId/accept',
  [param('tripId').isUUID().withMessage('Invalid trip ID')],
  validate,
  driverController.acceptTrip
);
router.post('/trips/:tripId/reject',
  [param('tripId').isUUID().withMessage('Invalid trip ID')],
  validate,
  driverController.rejectTrip
);
router.post('/trips/:tripId/arrive',
  [param('tripId').isUUID().withMessage('Invalid trip ID')],
  validate,
  driverController.arriveAtPickup
);
router.post('/trips/:tripId/start',
  [param('tripId').isUUID().withMessage('Invalid trip ID')],
  validate,
  driverController.startTrip
);
router.post('/trips/:tripId/complete',
  [param('tripId').isUUID().withMessage('Invalid trip ID')],
  validate,
  driverController.completeTrip
);
router.post('/trips/:tripId/cancel',
  [
    param('tripId').isUUID().withMessage('Invalid trip ID'),
    body('reason').optional().isString().isLength({ max: 500 }).withMessage('Reason must be at most 500 characters')
  ],
  validate,
  driverController.cancelTrip
);

module.exports = router;
