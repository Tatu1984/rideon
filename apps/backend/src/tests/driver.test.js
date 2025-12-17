/**
 * Driver API Tests
 * Tests for driver registration, status, and trip management
 */

const request = require('supertest');
const app = require('../index');
const { sequelize, User, Rider, Driver, Trip, Vehicle, DriverDocument } = require('../models');

describe('Driver API', () => {
  let driverToken;
  let riderToken;
  let testDriver;
  let testRider;
  let testTrip;

  // Setup before all tests
  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create driver
    const driverRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'testdriver@rideon.com',
        password: 'DriverPassword123!',
        firstName: 'Test',
        lastName: 'Driver',
        phone: '+1234567810',
        role: 'driver'
      });
    driverToken = driverRes.body.data?.token;
    testDriver = driverRes.body.data?.user;

    // Create rider for trip tests
    const riderRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'testrider@rideon.com',
        password: 'RiderPassword123!',
        firstName: 'Test',
        lastName: 'Rider',
        phone: '+1234567811',
        role: 'rider'
      });
    riderToken = riderRes.body.data?.token;
    testRider = riderRes.body.data?.user;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Driver Registration', () => {
    it('should create driver profile on registration', async () => {
      const res = await request(app)
        .get('/api/driver/profile')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Driver Profile', () => {
    it('should get driver profile', async () => {
      const res = await request(app)
        .get('/api/driver/profile')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should update driver profile', async () => {
      const res = await request(app)
        .put('/api/driver/profile')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Driver'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Driver Status', () => {
    it('should update driver status to online', async () => {
      const res = await request(app)
        .put('/api/driver/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          status: 'online'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should update driver status to offline', async () => {
      const res = await request(app)
        .put('/api/driver/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          status: 'offline'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject invalid status', async () => {
      const res = await request(app)
        .put('/api/driver/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          status: 'invalid_status'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Driver Location', () => {
    it('should update driver location', async () => {
      const res = await request(app)
        .put('/api/driver/location')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          latitude: 37.7749,
          longitude: -122.4194,
          heading: 90,
          speed: 30
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject invalid coordinates', async () => {
      const res = await request(app)
        .put('/api/driver/location')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          latitude: 'invalid',
          longitude: -122.4194
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Vehicle Management', () => {
    let vehicleId;

    it('should add a vehicle', async () => {
      const res = await request(app)
        .post('/api/driver/vehicle')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          make: 'Toyota',
          model: 'Camry',
          year: 2022,
          color: 'Silver',
          licensePlate: 'ABC1234',
          type: 'standard'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      vehicleId = res.body.data.id;
    });

    it('should get driver vehicles', async () => {
      const res = await request(app)
        .get('/api/driver/vehicles')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should update vehicle', async () => {
      if (vehicleId) {
        const res = await request(app)
          .put(`/api/driver/vehicle/${vehicleId}`)
          .set('Authorization', `Bearer ${driverToken}`)
          .send({
            color: 'Blue'
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
      }
    });
  });

  describe('Driver Documents', () => {
    it('should get required documents list', async () => {
      const res = await request(app)
        .get('/api/driver/documents/required')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should get driver document status', async () => {
      const res = await request(app)
        .get('/api/driver/documents')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Driver Earnings', () => {
    it('should get earnings summary', async () => {
      const res = await request(app)
        .get('/api/driver/earnings')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should get earnings by period', async () => {
      const res = await request(app)
        .get('/api/driver/earnings?period=today')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should get earnings history', async () => {
      const res = await request(app)
        .get('/api/driver/earnings/history')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Trip Management', () => {
    it('should get active trip (none initially)', async () => {
      const res = await request(app)
        .get('/api/driver/trip/active')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should get trip history', async () => {
      const res = await request(app)
        .get('/api/driver/trips')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Driver Statistics', () => {
    it('should get driver statistics', async () => {
      const res = await request(app)
        .get('/api/driver/stats')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Access Control', () => {
    it('should reject rider from driver endpoints', async () => {
      const res = await request(app)
        .get('/api/driver/profile')
        .set('Authorization', `Bearer ${riderToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
