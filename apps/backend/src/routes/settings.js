/**
 * Settings Routes
 * API endpoints for system settings management
 */

const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate, authorize } = require('../middleware/auth');

// Public route - get public settings (no auth required)
router.get('/public', settingsController.getPublicSettings);

// Protected routes - require authentication
router.use(authenticate);

// Admin-only routes
router.get('/', authorize('admin'), settingsController.getAllSettings);
router.get('/category/:category', authorize('admin'), settingsController.getSettingsByCategory);
router.put('/', authorize('admin'), settingsController.updateSettings);
router.put('/:key', authorize('admin'), settingsController.updateSetting);
router.delete('/:key', authorize('admin'), settingsController.deleteSetting);

module.exports = router;
