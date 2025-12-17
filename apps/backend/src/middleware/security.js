/**
 * Security Middleware
 * Implements rate limiting and CSRF protection
 */

const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

/**
 * General API rate limiter
 * Limits requests per IP address
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000, // 1 minute default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per minute
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use X-Forwarded-For header if behind proxy, otherwise use IP
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  }
});

/**
 * Strict rate limiter for authentication endpoints
 * More restrictive to prevent brute force attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again in 15 minutes'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  },
  skipSuccessfulRequests: true // Don't count successful logins
});

/**
 * Password reset rate limiter
 * Very strict to prevent abuse
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: {
    success: false,
    error: {
      code: 'PASSWORD_RESET_LIMIT_EXCEEDED',
      message: 'Too many password reset attempts, please try again in 1 hour'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Trip request rate limiter
 * Prevents spam trip requests
 */
const tripRequestLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 trip requests per minute
  message: {
    success: false,
    error: {
      code: 'TRIP_REQUEST_LIMIT_EXCEEDED',
      message: 'Too many trip requests, please wait before requesting another ride'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * CSRF Token Generation and Validation
 * For web-based clients (not mobile apps using Bearer tokens)
 */
const csrfTokens = new Map(); // In production, use Redis for distributed systems

const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const csrfProtection = (req, res, next) => {
  // Skip CSRF for mobile apps (they use Bearer token auth)
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }

  // Skip CSRF for safe methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Skip CSRF for API routes that explicitly opt out (webhooks, etc.)
  if (req.headers['x-skip-csrf'] === process.env.CSRF_SKIP_SECRET) {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];

  if (!csrfToken || !sessionId) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'CSRF_TOKEN_MISSING',
        message: 'CSRF token is required for this request'
      }
    });
  }

  const storedToken = csrfTokens.get(sessionId);
  if (!storedToken || storedToken !== csrfToken) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'CSRF_TOKEN_INVALID',
        message: 'Invalid CSRF token'
      }
    });
  }

  next();
};

/**
 * Generate and set CSRF token for session
 */
const setCsrfToken = (req, res, next) => {
  const sessionId = req.cookies?.sessionId || crypto.randomBytes(16).toString('hex');
  const token = generateCsrfToken();

  csrfTokens.set(sessionId, token);

  // Clean up old tokens (basic garbage collection)
  if (csrfTokens.size > 10000) {
    const iterator = csrfTokens.keys();
    for (let i = 0; i < 1000; i++) {
      csrfTokens.delete(iterator.next().value);
    }
  }

  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  req.csrfToken = token;
  next();
};

/**
 * Security headers middleware
 * Adds additional security headers beyond helmet defaults
 */
const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Enable XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy (disable unused features)
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');

  next();
};

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  tripRequestLimiter,
  csrfProtection,
  setCsrfToken,
  generateCsrfToken,
  securityHeaders
};
