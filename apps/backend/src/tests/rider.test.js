/**
 * Rider API Tests
 * Tests for rider profile, trip booking, and ride management
 */

const request = require('supertest');
const app = require('../index');
const { sequelize, User, Rider, Driver, Trip, SavedLocation } = require('../models');

describe('Rider API', () => {
  let riderToken;
  let driverToken;
  let testRider;
  let testDriver;

  // Setup before all tests
  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create rider
    const riderRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'testrider2@rideon.com',
        password: 'RiderPassword123!',
        firstName: 'Test',
        lastName: 'Rider',
        phone: '+1234567820',
        role: 'rider'
      });
    riderToken = riderRes.body.data?.token;
    testRider = riderRes.body.data?.user;

    // Create driver for trip tests
    const driverRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'testdriver2@rideon.com',
        password: 'DriverPassword123!',
        firstName: 'Test',
        lastName: 'Driver',
        phone: '+1234567821',
        role: 'driver'
      });
    driverToken = driverRes.body.data?.token;
    testDriver = driverRes.body.data?.user;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Rider Profile', () => {
    it('should get rider profile', async () => {
      const res = await request(app)
        .get('/api/rider/profile')
        .set('Authorization', `Bearer ${riderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('email');
    });

    it('should update rider profile', async () => {
      const res = await request(app)
        .put('/api/rider/profile')
        .set('Authorization', `Bearer ${riderToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Rider'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject invalid profile updates', async () => {
      const res = await request(app)
        .put('/api/rider/profile')
        .set('Authorization', `Bearer ${riderToken}`)
        .send({
          email: 'invalid-email'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Saved Locations', () => {
    let savedLocationId;

    it('should save a home location', async () => {
      const res = await request(app)
        .post('/api/rider/saved-locations')
        .set('Authorization', `Bearer ${riderToken}`)
        .send({
          name: 'Home',
          type: 'home',
          address: '123 Home St, San Francisco, CA',
          latitude: 37.7749,
          longitude: -122.4194
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      savedLocationId = res.body.data.id;
    });

    it('should save a work location', async () => {
      const res = await request(app)
        .post('/api/rider/saved-locations')
        .set('Authorization', `Bearer ${riderToken}`)
        .send({
          name: 'Work',
          type: 'work',
          address: '456 Office Blvd, San Francisco, CA',
          latitude: 37.7849,
          longitude: -122.4094
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should get saved locations', async () => {
      const res = await request(app)
        .get('/api/rider/saved-locations')
        .set('Authorization', `Bearer ${riderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should update saved location', async () => {
      if (savedLocationId) {
        const res = await request(app)
          .put(`/api/rider/saved-locations/${savedLocationId}`)
          .set('Authorization', `Bearer ${riderToken}`)
          .send({
            name: 'Updated Home'
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
      }
    });

    it('should delete saved location', async () => {
      if (savedLocationId) {
        const res = await request(app)
          .delete(`/api/rider/saved-locations/${savedLocationId}`)
          .set('Authorization', `Bearer ${riderToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
      }
    });
  });

  describe('Trip Estimation', () => {
    it('should get fare estimate', async () => {
      const res = await request(app)
        .post('/api/rider/trip/estimate')
        .set('Authorization', `Bearer ${riderToken}`)
        .send({
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
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('estimatedFare');
      expect(res.body.data).toHaveProperty('distance');
      expect(res.body.data).toHaveProperty('duration');
    });

    it('should get estimates for multiple vehicle types', async () => {
      const res = await request(app)
        .post('/api/rider/trip/estimate-all')
        .set('Authorization', `Bearer ${riderToken}`)
        .send({
          pickupLocation: {
            latitude: 37.7749,
            longitude: -122.4194,
            address: '123 Market St, San Francisco, CA'
          },
          dropoffLocation: {
            latitude: 37.7849,
            longitude: -122.4094,
            address: '456 Mission St, San Francisco, CA'
          }
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Trip Booking', () => {
    let tripId;

    it('should create a trip request', async () => {
      const res = await request(app)
        .post('/api/rider/trip')
        .set('Authorization', `Bearer ${riderToken}`)
        .send({
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
          vehicleType: 'standard',
          paymentMethod: 'cash'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.status).toBe('requested');
      tripId = res.body.data.id;
    });

    it('should get active trip', async () => {
      const res = await request(app)
        .get('/api/rider/trip/active')
        .set('Authorization', `Bearer ${riderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should cancel trip', async () => {
      if (tripId) {
        const res = await request(app)
          .post(`/api/rider/trip/${tripId}/cancel`)
          .set('Authorization', `Bearer ${riderToken}`)
          .send({
            reason: 'Changed my mind'
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
      }
    });
  });

  describe('Trip History', () => {
    it('should get trip history', async () => {
      const res = await request(app)
        .get('/api/rider/trips')
        .set('Authorization', `Bearer ${riderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should get trip history with pagination', async () => {
      const res = await request(app)
        .get('/api/rider/trips?page=1&limit=10')
        .set('Authorization', `Bearer ${riderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Wallet & Payment', () => {
    it('should get rider wallet', async () => {
      const res = await request(app)
        .get('/api/rider/wallet')
        .set('Authorization', `Bearer ${riderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should get payment methods', async () => {
      const res = await request(app)
        .get('/api/rider/payment-methods')
        .set('Authorization', `Bearer ${riderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Emergency Contact', () => {
    it('should set emergency contact', async () => {
      const res = await request(app)
        .post('/api/rider/emergency-contact')
        .set('Authorization', `Bearer ${riderToken}`)
        .send({
          name: 'Emergency Contact',
          phone: '+1234567899',
          relationship: 'Friend'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should get emergency contacts', async () => {
      const res = await request(app)
        .get('/api/rider/emergency-contacts')
        .set('Authorization', `Bearer ${riderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Access Control', () => {
    it('should reject driver from rider endpoints', async () => {
      const res = await request(app)
        .get('/api/rider/profile')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should reject unauthenticated requests', async () => {
      const res = await request(app)
        .get('/api/rider/profile');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
