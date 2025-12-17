/**
 * Settings Routes
 * API endpoints for system settings management
 */

const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public route - get public settings (no auth required)
router.get('/public', settingsController.getPublicSettings);

// Protected routes - require authentication and admin role
router.use(auth);
router.use(roleCheck(['admin']));

// Admin-only routes
router.get('/', settingsController.getAllSettings);
router.get('/category/:category', settingsController.getSettingsByCategory);
router.put('/', settingsController.updateSettings);
router.put('/:key', settingsController.updateSetting);
router.delete('/:key', settingsController.deleteSetting);

module.exports = router;
