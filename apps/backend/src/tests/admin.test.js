/**
 * Admin API Tests
 * Tests for admin dashboard and management endpoints
 */

const request = require('supertest');
const app = require('../index');
const { sequelize, User, Rider, Driver, Trip, Payment, PromoCode, SupportTicket } = require('../models');

describe('Admin API', () => {
  let adminToken;
  let riderToken;
  let testRider;
  let testDriver;
  let testTrip;

  // Setup before all tests
  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create admin user
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin@rideon.com',
        password: 'AdminPassword123!',
        firstName: 'Admin',
        lastName: 'User',
        phone: '+1234567891',
        role: 'admin'
      });
    adminToken = adminRes.body.data?.token;

    // Create rider
    const riderRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'rider@rideon.com',
        password: 'RiderPassword123!',
        firstName: 'Test',
        lastName: 'Rider',
        phone: '+1234567892',
        role: 'rider'
      });
    riderToken = riderRes.body.data?.token;
    testRider = riderRes.body.data?.user;

    // Create driver
    const driverRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'driver@rideon.com',
        password: 'DriverPassword123!',
        firstName: 'Test',
        lastName: 'Driver',
        phone: '+1234567893',
        role: 'driver'
      });
    testDriver = driverRes.body.data?.user;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Admin Authentication', () => {
    it('should reject non-admin users from admin endpoints', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${riderToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow admin users to access admin endpoints', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/admin/dashboard', () => {
    it('should return dashboard statistics', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('users');
      expect(res.body.data).toHaveProperty('trips');
      expect(res.body.data).toHaveProperty('revenue');
      expect(res.body.data).toHaveProperty('pending');
    });
  });

  describe('GET /api/admin/users', () => {
    it('should return paginated user list', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('users');
      expect(res.body.data).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data.users)).toBe(true);
    });

    it('should filter users by role', async () => {
      const res = await request(app)
        .get('/api/admin/users?role=rider')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.users.forEach(user => {
        expect(user.role).toBe('rider');
      });
    });

    it('should search users by email', async () => {
      const res = await request(app)
        .get('/api/admin/users?search=rider@rideon.com')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/admin/users/:userId/toggle-status', () => {
    it('should toggle user active status', async () => {
      const usersRes = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      const targetUser = usersRes.body.data.users.find(u => u.role === 'rider');
      if (targetUser) {
        const res = await request(app)
          .put(`/api/admin/users/${targetUser.id}/toggle-status`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
      }
    });
  });

  describe('GET /api/admin/drivers', () => {
    it('should return driver list with details', async () => {
      const res = await request(app)
        .get('/api/admin/drivers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should filter drivers by status', async () => {
      const res = await request(app)
        .get('/api/admin/drivers?status=pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/admin/trips', () => {
    it('should return trip list', async () => {
      const res = await request(app)
        .get('/api/admin/trips')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('trips');
    });

    it('should filter trips by status', async () => {
      const res = await request(app)
        .get('/api/admin/trips?status=completed')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Promo Code Management', () => {
    let createdPromoId;

    it('should create a new promo code', async () => {
      const res = await request(app)
        .post('/api/admin/promo-codes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'TESTPROMO20',
          description: 'Test promotion',
          discountType: 'percentage',
          discountValue: 20,
          maxDiscountAmount: 50,
          minTripAmount: 10,
          totalUsageLimit: 100,
          validFrom: new Date().toISOString(),
          validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      createdPromoId = res.body.data.id;
    });

    it('should get all promo codes', async () => {
      const res = await request(app)
        .get('/api/admin/promo-codes')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should update promo code', async () => {
      if (createdPromoId) {
        const res = await request(app)
          .put(`/api/admin/promo-codes/${createdPromoId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            discountValue: 25
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
      }
    });

    it('should delete promo code', async () => {
      if (createdPromoId) {
        const res = await request(app)
          .delete(`/api/admin/promo-codes/${createdPromoId}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
      }
    });
  });

  describe('Analytics Endpoints', () => {
    it('should get revenue analytics', async () => {
      const res = await request(app)
        .get('/api/admin/analytics/revenue')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('summary');
      expect(res.body.data).toHaveProperty('timeline');
    });

    it('should get trip analytics', async () => {
      const res = await request(app)
        .get('/api/admin/analytics/trips')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('completed');
      expect(res.body.data).toHaveProperty('completionRate');
    });

    it('should filter analytics by date range', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];

      const res = await request(app)
        .get(`/api/admin/analytics/revenue?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
