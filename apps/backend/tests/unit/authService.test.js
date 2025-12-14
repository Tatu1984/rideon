/**
 * Auth Service Unit Tests
 */

const jwt = require('jsonwebtoken');

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.JWT_EXPIRES_IN = '24h';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-token-secret';
process.env.REFRESH_TOKEN_EXPIRES_IN = '30d';

// Mock dependencies
jest.mock('../../src/models', () => ({
  RefreshToken: {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  }
}));

const { RefreshToken } = require('../../src/models');
const AuthService = require('../../src/services/authService');

describe('AuthService', () => {
  let authService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('generateTokens', () => {
    it('should generate valid access and refresh tokens', async () => {
      const user = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        role: 'rider'
      };

      RefreshToken.create.mockResolvedValue({
        id: 'token-uuid',
        token: 'mock-refresh-token'
      });

      const tokens = await authService.generateTokens(user);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });

    it('should include user data in access token', async () => {
      const user = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        role: 'driver'
      };

      RefreshToken.create.mockResolvedValue({
        id: 'token-uuid',
        token: 'mock-refresh-token'
      });

      const tokens = await authService.generateTokens(user);
      const decoded = jwt.verify(tokens.accessToken, process.env.JWT_SECRET);

      expect(decoded.id).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
    });

    it('should store refresh token in database', async () => {
      const user = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        role: 'rider'
      };

      RefreshToken.create.mockResolvedValue({
        id: 'token-uuid',
        token: 'mock-refresh-token'
      });

      await authService.generateTokens(user);

      expect(RefreshToken.create).toHaveBeenCalledTimes(1);
      expect(RefreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: user.id
        })
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const payload = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        role: 'rider'
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      const decoded = authService.verifyToken(token);

      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => authService.verifyToken(invalidToken)).toThrow();
    });

    it('should throw error for expired token', () => {
      const payload = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        role: 'rider'
      };

      const expiredToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '-1h' });

      expect(() => authService.verifyToken(expiredToken)).toThrow();
    });
  });

  describe('refreshAccessToken', () => {
    it('should generate new access token for valid refresh token', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const refreshToken = jwt.sign(
        { id: userId, tokenId: 'token-uuid' },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '30d' }
      );

      RefreshToken.findOne.mockResolvedValue({
        id: 'token-uuid',
        userId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        revokedAt: null
      });

      const newAccessToken = await authService.refreshAccessToken(refreshToken);

      expect(typeof newAccessToken).toBe('string');
      const decoded = jwt.verify(newAccessToken, process.env.JWT_SECRET);
      expect(decoded.id).toBe(userId);
    });

    it('should throw error for revoked refresh token', async () => {
      const refreshToken = jwt.sign(
        { id: 'user-id', tokenId: 'token-uuid' },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '30d' }
      );

      RefreshToken.findOne.mockResolvedValue({
        id: 'token-uuid',
        token: refreshToken,
        revokedAt: new Date() // Token is revoked
      });

      await expect(authService.refreshAccessToken(refreshToken)).rejects.toThrow();
    });
  });

  describe('revokeRefreshToken', () => {
    it('should revoke a valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';

      RefreshToken.update.mockResolvedValue([1]);

      await authService.revokeRefreshToken(refreshToken);

      expect(RefreshToken.update).toHaveBeenCalledWith(
        { revokedAt: expect.any(Date) },
        { where: { token: refreshToken } }
      );
    });
  });

  describe('revokeAllUserTokens', () => {
    it('should revoke all tokens for a user', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      RefreshToken.update.mockResolvedValue([5]);

      await authService.revokeAllUserTokens(userId);

      expect(RefreshToken.update).toHaveBeenCalledWith(
        { revokedAt: expect.any(Date) },
        { where: { userId, revokedAt: null } }
      );
    });
  });
});
