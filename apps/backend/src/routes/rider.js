const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const riderController = require('../controllers/riderController');

// All routes require authentication and rider role
router.use(auth);
router.use(roleCheck(['rider']));

// Profile routes
router.get('/profile', riderController.getProfile);
router.put('/profile', riderController.updateProfile);

// Trip history
router.get('/trips', riderController.getTripHistory);
router.get('/trips/:tripId', riderController.getTripDetails);

// Statistics
router.get('/statistics', riderController.getStatistics);

// Favorite locations
router.post('/favorite-locations', riderController.addFavoriteLocation);
router.delete('/favorite-locations/:locationId', riderController.removeFavoriteLocation);

module.exports = router;
