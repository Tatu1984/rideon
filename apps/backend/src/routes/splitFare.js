/**
 * Split Fare Routes
 */

const express = require('express');
const router = express.Router();
const splitFareController = require('../controllers/splitFareController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { body, param } = require('express-validator');
const validation = require('../middleware/validation');

// Initiate split fare for a trip
router.post(
  '/trips/:tripId/split',
  auth,
  roleCheck(['rider']),
  [
    param('tripId').isUUID().withMessage('Valid trip ID required'),
    body('participants').isArray({ min: 1, max: 4 }).withMessage('1-4 participants required'),
    body('participants.*.email').optional().isEmail().withMessage('Valid email required'),
    body('participants.*.phone').optional().isMobilePhone().withMessage('Valid phone required'),
    body('participants.*.shareAmount').optional().isFloat({ min: 0 }).withMessage('Valid share amount required'),
    body('participants.*.sharePercentage').optional().isFloat({ min: 0, max: 100 }).withMessage('Valid share percentage required'),
    validation
  ],
  splitFareController.initiateSplitFare
);

// Get split fare details
router.get(
  '/:splitFareId',
  auth,
  splitFareController.getSplitFareDetails
);

// Accept split fare invitation
router.post(
  '/:splitFareId/accept',
  auth,
  roleCheck(['rider']),
  [
    param('splitFareId').notEmpty().withMessage('Split fare ID required'),
    validation
  ],
  splitFareController.acceptSplitFare
);

// Decline split fare invitation
router.post(
  '/:splitFareId/decline',
  auth,
  roleCheck(['rider']),
  [
    param('splitFareId').notEmpty().withMessage('Split fare ID required'),
    validation
  ],
  splitFareController.declineSplitFare
);

// Pay split fare share
router.post(
  '/:splitFareId/pay',
  auth,
  roleCheck(['rider']),
  [
    param('splitFareId').notEmpty().withMessage('Split fare ID required'),
    body('paymentMethod').isIn(['card', 'wallet', 'upi']).withMessage('Valid payment method required'),
    validation
  ],
  splitFareController.paySplitFareShare
);

// Cancel split fare (initiator only)
router.post(
  '/:splitFareId/cancel',
  auth,
  roleCheck(['rider']),
  [
    param('splitFareId').notEmpty().withMessage('Split fare ID required'),
    validation
  ],
  splitFareController.cancelSplitFare
);

// Get user's split fare history
router.get(
  '/',
  auth,
  roleCheck(['rider']),
  splitFareController.getSplitFareHistory
);

module.exports = router;
