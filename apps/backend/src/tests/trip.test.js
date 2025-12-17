/**
 * Trip Tests
 * Tests for trip management endpoints
 */

const request = require('supertest');
const app = require('../index');
const { sequelize, User, Rider, Driver, Trip, Vehicle } = require('../models');

describe('Trip API', () => {
  let riderToken;
  let driverToken;
  let riderId;
  let driverId;
  let tripId;

  // Setup test data
  const riderUser = {
    email: 'rider@triptest.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'Rider',
    phone: '+1234567891',
    role: 'rider'
  };

  const driverUser = {
    email: 'driver@triptest.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'Driver',
    phone: '+1234567892',
    role: 'driver'
  };

  const tripData = {
    pickupLocation: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: '123 Market St, San Francisco, CA'
    },
    dropoffLocation: {
      latitude: 37.7849,
      longitude: -122.4094,
      address: '456 Mission St, San Francisco, CA'
    },
    vehicleType: 'standard'
  };

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Register rider
    const riderRes = await request(app)
      .post('/api/auth/register')
      .send(riderUser);
    riderToken = riderRes.body.data.token;
    riderId = riderRes.body.data.user.riderId;

    // Register driver
    const driverRes = await request(app)
      .post('/api/auth/driver/register')
      .send({
        ...driverUser,
        licenseNumber: 'DL123456',
        vehicleType: 'standard'
      });
    driverToken = driverRes.body.data?.token;
    driverId = driverRes.body.data?.driver?.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/rider/trips/estimate', () => {
    it('should get fare estimate', async () => {
      const res = await request(app)
        .post('/api/rider/trips/estimate')
        .set('Authorization', `Bearer ${riderToken}`)
        .send({
          pickupLocation: tripData.pickupLocation,
          dropoffLocation: tripData.dropoffLocation,
          vehicleType: tripData.vehicleType
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('estimatedFare');
      expect(res.body.data).toHaveProperty('estimatedDuration');
      expect(res.body.data).toHaveProperty('estimatedDistance');
    });

    it('should reject request without authentication', async () => {
      const res = await request(app)
        .post('/api/rider/trips/estimate')
        .send({
          pickupLocation: tripData.pickupLocation,
          dropoffLocation: tripData.dropoffLocation
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/rider/trips', () => {
    it('should create a new trip request', async () => {
      const res = await request(app)
        .post('/api/rider/trips')
        .set('Authorization', `Bearer ${riderToken}`)
        .send(tripData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.status).toBe('requested');

      tripId = res.body.data.id;
    });

    it('should reject trip with missing pickup location', async () => {
      const res = await request(app)
        .post('/api/rider/trips')
        .set('Authorization', `Bearer ${riderToken}`)
        .send({
          dropoffLocation: tripData.dropoffLocation
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/rider/trips/:tripId', () => {
    it('should get trip details', async () => {
      const res = await request(app)
        .get(`/api/rider/trips/${tripId}`)
        .set('Authorization', `Bearer ${riderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(tripId);
    });

    it('should return 404 for non-existent trip', async () => {
      const res = await request(app)
        .get('/api/rider/trips/99999')
        .set('Authorization', `Bearer ${riderToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /api/rider/trips/:tripId/cancel', () => {
    it('should cancel a trip', async () => {
      // Create a new trip for cancellation test
      const newTripRes = await request(app)
        .post('/api/rider/trips')
        .set('Authorization', `Bearer ${riderToken}`)
        .send(tripData);

      const newTripId = newTripRes.body.data.id;

      const res = await request(app)
        .post(`/api/rider/trips/${newTripId}/cancel`)
        .set('Authorization', `Bearer ${riderToken}`)
        .send({ reason: 'Changed my mind' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('cancelled');
    });
  });

  describe('GET /api/rider/trips', () => {
    it('should get trip history', async () => {
      const res = await request(app)
        .get('/api/rider/trips')
        .set('Authorization', `Bearer ${riderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
