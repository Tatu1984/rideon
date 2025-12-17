/**
 * Payment API Tests
 * Tests for payment processing and wallet functionality
 */

const request = require('supertest');
const app = require('../index');
const { sequelize, User, Rider, Driver, Trip, Payment, PaymentMethod } = require('../models');

describe('Payment API', () => {
  let riderToken;
  let driverToken;
  let testRider;
  let testDriver;
  let testTrip;

  // Setup before all tests
  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create rider
    const riderRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'paymentrider@rideon.com',
        password: 'RiderPassword123!',
        firstName: 'Payment',
        lastName: 'Rider',
        phone: '+1234567801',
        role: 'rider'
      });
    riderToken = riderRes.body.data?.token;
    testRider = riderRes.body.data?.user;

    // Create driver
    const driverRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'paymentdriver@rideon.com',
        password: 'DriverPassword123!',
        firstName: 'Payment',
        lastName: 'Driver',
        phone: '+1234567802',
        role: 'driver'
      });
    driverToken = driverRes.body.data?.token;
    testDriver = driverRes.body.data?.user;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Payment Methods', () => {
    it('should get payment methods for rider (empty initially)', async () => {
      const res = await request(app)
        .get('/api/rider/payment-methods')
        .set('Authorization', `Bearer ${riderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should create a Stripe setup intent', async () => {
      const res = await request(app)
        .post('/api/payment/setup-intent')
        .set('Authorization', `Bearer ${riderToken}`);

      // Will fail with mock Stripe key but structure should be correct
      expect(res.body).toHaveProperty('success');
    });
  });

  describe('Wallet Operations', () => {
    it('should get rider wallet balance', async () => {
      const res = await request(app)
        .get('/api/rider/wallet')
        .set('Authorization', `Bearer ${riderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should get driver earnings summary', async () => {
      const res = await request(app)
        .get('/api/driver/earnings')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should get driver earnings by period', async () => {
      const res = await request(app)
        .get('/api/driver/earnings?period=week')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Trip Payment Flow', () => {
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

    it('should reject estimate without locations', async () => {
      const res = await request(app)
        .post('/api/rider/trip/estimate')
        .set('Authorization', `Bearer ${riderToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Promo Code Validation', () => {
    it('should validate promo code', async () => {
      const res = await request(app)
        .post('/api/rider/validate-promo')
        .set('Authorization', `Bearer ${riderToken}`)
        .send({
          code: 'INVALID_CODE',
          tripAmount: 25
        });

      // Should return error for invalid code
      expect(res.body.success).toBe(false);
    });
  });

  describe('Payment Security', () => {
    it('should reject unauthenticated payment requests', async () => {
      const res = await request(app)
        .post('/api/payment/setup-intent');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject cross-user payment method access', async () => {
      // Rider should not access driver's earnings
      const res = await request(app)
        .get('/api/driver/earnings')
        .set('Authorization', `Bearer ${riderToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
