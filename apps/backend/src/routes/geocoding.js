const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const geocodingController = require('../controllers/geocodingController');

// All routes require authentication
router.use(auth);

// Geocode address to coordinates
router.get('/geocode', geocodingController.geocode);

// Reverse geocode coordinates to address
router.get('/reverse', geocodingController.reverseGeocode);

// Get route between two points
router.get('/route', geocodingController.getRoute);

// Autocomplete suggestions
router.get('/autocomplete', geocodingController.autocomplete);

module.exports = router;
