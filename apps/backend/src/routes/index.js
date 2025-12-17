const express = require('express');
const authRoutes = require('./auth');
const riderRoutes = require('./rider');
const driverRoutes = require('./driver');
const tripRoutes = require('./trip');
const adminRoutes = require('./admin');
const paymentRoutes = require('./payment');
const geocodingRoutes = require('./geocoding');
const scheduledRidesRoutes = require('./scheduledRides');
const splitFareRoutes = require('./splitFare');
<<<<<<< HEAD
=======
const settingsRoutes = require('./settings');
>>>>>>> origin/main

const router = express.Router();

// API version prefix
const API_VERSION = '/v1';

// Health check (no version prefix)
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount routes
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/rider`, riderRoutes);
router.use(`${API_VERSION}/driver`, driverRoutes);
router.use(`${API_VERSION}/trips`, tripRoutes);
router.use(`${API_VERSION}/admin`, adminRoutes);
router.use(`${API_VERSION}/payments`, paymentRoutes);
router.use(`${API_VERSION}/geocoding`, geocodingRoutes);
router.use(`${API_VERSION}/scheduled-rides`, scheduledRidesRoutes);
router.use(`${API_VERSION}/split-fare`, splitFareRoutes);
<<<<<<< HEAD
=======
router.use(`${API_VERSION}/settings`, settingsRoutes);
>>>>>>> origin/main

// For backward compatibility, also mount without version prefix
router.use('/auth', authRoutes);
router.use('/rider', riderRoutes);
router.use('/driver', driverRoutes);
router.use('/trips', tripRoutes);
router.use('/admin', adminRoutes);
router.use('/payments', paymentRoutes);
router.use('/geocoding', geocodingRoutes);
router.use('/scheduled-rides', scheduledRidesRoutes);
router.use('/split-fare', splitFareRoutes);
<<<<<<< HEAD
=======
router.use('/settings', settingsRoutes);
>>>>>>> origin/main

module.exports = router;
