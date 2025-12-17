/**
 * Jest Test Setup
 * Configuration for running tests
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

// Use in-memory SQLite for tests (or test database)
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || '';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';

// Disable Stripe in tests
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';

// Disable external services
process.env.SMTP_HOST = '';
process.env.TWILIO_ACCOUNT_SID = '';

// Increase timeout for database operations
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  /**
   * Create a test user and return credentials
   */
  async createTestUser(app, userData = {}) {
    const request = require('supertest');
    const defaultUser = {
      email: `test${Date.now()}@rideon.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      phone: `+1${Date.now().toString().slice(-10)}`,
      role: 'rider',
      ...userData
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(defaultUser);

    return {
      user: res.body.data?.user,
      token: res.body.data?.token,
      refreshToken: res.body.data?.refreshToken
    };
  },

  /**
   * Generate random coordinates in San Francisco area
   */
  randomSFCoordinates() {
    return {
      latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
      longitude: -122.4194 + (Math.random() - 0.5) * 0.1
    };
  }
};
