const jwt = require('jsonwebtoken');
const { RefreshToken } = require('../models');
const { v4: uuidv4 } = require('uuid');

class AuthService {
  /**
   * Generate JWT access token and refresh token
   */
  async generateTokens(user) {
    // Generate access token (short-lived)
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    );

    // Generate refresh token (long-lived)
    const refreshTokenValue = uuidv4();
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30); // 30 days

    // Store refresh token in database
    await RefreshToken.create({
      userId: user.id,
      token: refreshTokenValue,
      expiresAt: refreshTokenExpiry
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshTokenValue) {
    // Find refresh token in database
    const refreshToken = await RefreshToken.findOne({
      where: {
        token: refreshTokenValue,
        revokedAt: null
      },
      include: ['user']
    });

    if (!refreshToken) {
      throw new Error('Invalid refresh token');
    }

    // Check if token has expired
    if (new Date() > refreshToken.expiresAt) {
      throw new Error('Refresh token has expired');
    }

    // Generate new access token
    const accessToken = jwt.sign(
      {
        id: refreshToken.user.id,
        email: refreshToken.user.email,
        role: refreshToken.user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    );

    return { accessToken };
  }

  /**
   * Revoke a refresh token
   */
  async revokeRefreshToken(refreshTokenValue) {
    await RefreshToken.update(
      { revokedAt: new Date() },
      {
        where: {
          token: refreshTokenValue
        }
      }
    );
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllUserTokens(userId) {
    await RefreshToken.update(
      { revokedAt: new Date() },
      {
        where: {
          userId,
          revokedAt: null
        }
      }
    );
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Decode JWT token without verification
   */
  decodeToken(token) {
    return jwt.decode(token);
  }
}

module.exports = new AuthService();
