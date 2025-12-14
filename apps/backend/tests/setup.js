/**
 * Jest Test Setup
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';
process.env.JWT_EXPIRES_IN = '24h';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-token-secret-key-for-testing';
process.env.REFRESH_TOKEN_EXPIRES_IN = '30d';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'rideon_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  /**
   * Generate a random email
   */
  randomEmail: () => `test${Date.now()}${Math.random().toString(36).substring(7)}@test.com`,

  /**
   * Generate a random phone number
   */
  randomPhone: () => `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,

  /**
   * Wait for specified milliseconds
   */
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Generate test coordinates (New York area)
   */
  randomCoordinates: () => ({
    latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
    longitude: -74.0060 + (Math.random() - 0.5) * 0.1
  })
};

// Console log suppression for cleaner test output (optional)
if (process.env.SUPPRESS_LOGS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  };
}
