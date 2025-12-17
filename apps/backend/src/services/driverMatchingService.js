const { Driver, Vehicle, User, DriverLocation } = require('../models');
const { calculateDistance } = require('../utils/haversine');
const { Op } = require('sequelize');

/**
 * Driver Matching Service
 * Implements a sophisticated algorithm to find and match the best available driver
 * for a trip request based on:
 * - Distance from pickup location
 * - Driver rating
 * - Vehicle type compatibility
 * - Acceptance rate
 * - Recent location freshness
 */

const DEFAULT_SEARCH_RADIUS_KM = 5;
const MAX_SEARCH_RADIUS_KM = 15;
const MAX_DRIVERS_TO_NOTIFY = 5;
const LOCATION_FRESHNESS_MINUTES = 10;

/**
 * Find available drivers near a pickup location
 * @param {number} pickupLatitude
 * @param {number} pickupLongitude
 * @param {string} vehicleType - Optional vehicle type filter
 * @param {number} radiusKm - Search radius in kilometers
 * @returns {Promise<Array>} Sorted array of available drivers with distance
 */
async function findNearbyDrivers(pickupLatitude, pickupLongitude, vehicleType = null, radiusKm = DEFAULT_SEARCH_RADIUS_KM) {
  const freshnessThreshold = new Date(Date.now() - LOCATION_FRESHNESS_MINUTES * 60 * 1000);

  // Find all online drivers with recent location updates
  const whereClause = {
    status: 'online',
    isVerified: true,
    currentLatitude: { [Op.not]: null },
    currentLongitude: { [Op.not]: null },
    lastLocationUpdate: { [Op.gte]: freshnessThreshold }
  };

  const drivers = await Driver.findAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'phone', 'profilePicture']
      },
      {
        model: Vehicle,
        as: 'vehicles',
        where: vehicleType ? {
          type: vehicleType,
          isActive: true
        } : {
          isActive: true
        },
        required: true
      }
    ]
  });

  // Calculate distance and filter by radius
  const driversWithDistance = drivers
    .map(driver => {
      const distance = calculateDistance(
        pickupLatitude,
        pickupLongitude,
        parseFloat(driver.currentLatitude),
        parseFloat(driver.currentLongitude)
      );

      return {
        driver,
        distance,
        score: calculateDriverScore(driver, distance)
      };
    })
    .filter(d => d.distance <= radiusKm)
    .sort((a, b) => b.score - a.score); // Sort by score descending (best first)

  return driversWithDistance;
}

/**
 * Calculate a composite score for driver ranking
 * Higher score = better match
 * @param {Object} driver
 * @param {number} distance
 * @returns {number}
 */
function calculateDriverScore(driver, distance) {
  // Weights for different factors
  const DISTANCE_WEIGHT = 0.40;
  const RATING_WEIGHT = 0.30;
  const ACCEPTANCE_WEIGHT = 0.15;
  const COMPLETION_WEIGHT = 0.15;

  // Normalize distance (0-1, closer is better)
  // Max score at 0km, 0 score at MAX_SEARCH_RADIUS_KM
  const distanceScore = Math.max(0, 1 - (distance / MAX_SEARCH_RADIUS_KM));

  // Normalize rating (0-1, 5 being max)
  const ratingScore = parseFloat(driver.averageRating || 0) / 5;

  // Acceptance rate (already 0-100, convert to 0-1)
  const acceptanceScore = parseFloat(driver.acceptanceRate || 80) / 100;

  // Completion rate (already 0-100, convert to 0-1)
  const completionScore = parseFloat(driver.completionRate || 90) / 100;

  // Calculate weighted score
  const score = (
    (distanceScore * DISTANCE_WEIGHT) +
    (ratingScore * RATING_WEIGHT) +
    (acceptanceScore * ACCEPTANCE_WEIGHT) +
    (completionScore * COMPLETION_WEIGHT)
  );

  return score;
}

/**
 * Main matching function - find best drivers for a trip
 * @param {Object} tripRequest
 * @returns {Promise<Array>} Array of matched drivers
 */
async function matchDriversForTrip(tripRequest) {
  const {
    pickupLatitude,
    pickupLongitude,
    vehicleType
  } = tripRequest;

  let nearbyDrivers = [];
  let currentRadius = DEFAULT_SEARCH_RADIUS_KM;

  // Expand search radius if no drivers found
  while (nearbyDrivers.length === 0 && currentRadius <= MAX_SEARCH_RADIUS_KM) {
    nearbyDrivers = await findNearbyDrivers(
      pickupLatitude,
      pickupLongitude,
      vehicleType,
      currentRadius
    );

    if (nearbyDrivers.length === 0) {
      currentRadius += 2; // Expand by 2km
    }
  }

  // Return top drivers (limited)
  return nearbyDrivers.slice(0, MAX_DRIVERS_TO_NOTIFY);
}

/**
 * Get estimated arrival time based on distance
 * @param {number} distanceKm
 * @returns {number} ETA in minutes
 */
function calculateETA(distanceKm) {
  // Assume average city speed of 25 km/h
  const averageSpeedKmh = 25;
  const etaMinutes = Math.ceil((distanceKm / averageSpeedKmh) * 60);
  return Math.max(2, etaMinutes); // Minimum 2 minutes
}

/**
 * Format driver data for client response
 * @param {Object} driverMatch
 * @returns {Object}
 */
function formatDriverForClient(driverMatch) {
  const { driver, distance, score } = driverMatch;
  const activeVehicle = driver.vehicles[0];

  return {
    driverId: driver.id,
    userId: driver.userId,
    name: `${driver.user.firstName} ${driver.user.lastName}`,
    phone: driver.user.phone,
    profilePicture: driver.user.profilePicture,
    rating: parseFloat(driver.averageRating || 0),
    totalTrips: driver.totalTrips,
    distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
    eta: calculateETA(distance),
    vehicle: activeVehicle ? {
      id: activeVehicle.id,
      type: activeVehicle.type,
      make: activeVehicle.make,
      model: activeVehicle.model,
      color: activeVehicle.color,
      licensePlate: activeVehicle.licensePlate,
      year: activeVehicle.year
    } : null,
    currentLocation: {
      latitude: parseFloat(driver.currentLatitude),
      longitude: parseFloat(driver.currentLongitude)
    },
    score: Math.round(score * 100) / 100
  };
}

/**
 * Notify drivers about a new trip request via Socket.IO
 * @param {Object} io - Socket.IO instance
 * @param {Array} matchedDrivers
 * @param {Object} trip
 */
async function notifyDriversAboutTrip(io, matchedDrivers, trip) {
  if (!io || matchedDrivers.length === 0) return;

  const tripData = {
    id: trip.id,
    pickup: {
      address: trip.pickupAddress,
      latitude: parseFloat(trip.pickupLatitude),
      longitude: parseFloat(trip.pickupLongitude)
    },
    dropoff: {
      address: trip.dropoffAddress,
      latitude: parseFloat(trip.dropoffLatitude),
      longitude: parseFloat(trip.dropoffLongitude)
    },
    fare: parseFloat(trip.totalFare),
    estimatedDistance: parseFloat(trip.estimatedDistance),
    estimatedDuration: trip.estimatedDuration,
    vehicleType: trip.vehicleType,
    paymentMethod: trip.paymentMethod
  };

  // Notify each matched driver individually
  for (const match of matchedDrivers) {
    const driverSocketRoom = `driver:${match.driver.userId}`;

    io.to(driverSocketRoom).emit('trip:request', {
      trip: tripData,
      eta: calculateETA(match.distance),
      distance: Math.round(match.distance * 100) / 100
    });

    console.log(`Notified driver ${match.driver.id} about trip ${trip.id}`);
  }

  // Also emit to general new-request channel for admin monitoring
  io.emit('trip:new-request', {
    tripId: trip.id,
    matchedDriverCount: matchedDrivers.length
  });
}

/**
 * Update driver location
 * @param {string} driverId
 * @param {number} latitude
 * @param {number} longitude
 * @param {Object} metadata - Optional additional data (accuracy, heading, speed)
 */
async function updateDriverLocation(driverId, latitude, longitude, metadata = {}) {
  const driver = await Driver.findByPk(driverId);

  if (!driver) {
    throw new Error('Driver not found');
  }

  // Update driver's current location
  await driver.update({
    currentLatitude: latitude,
    currentLongitude: longitude,
    lastLocationUpdate: new Date()
  });

  // Store location history
  await DriverLocation.create({
    driverId,
    latitude,
    longitude,
    accuracy: metadata.accuracy,
    heading: metadata.heading,
    speed: metadata.speed,
    recordedAt: new Date()
  });

  return driver;
}

module.exports = {
  findNearbyDrivers,
  matchDriversForTrip,
  calculateDriverScore,
  calculateETA,
  formatDriverForClient,
  notifyDriversAboutTrip,
  updateDriverLocation,
  DEFAULT_SEARCH_RADIUS_KM,
  MAX_SEARCH_RADIUS_KM,
  MAX_DRIVERS_TO_NOTIFY
};
