/**
 * Rate Limiting Middleware
 * Implements IP + user-based rate limiting with graceful 429 responses
 * OWASP: Protects against brute force and DoS attacks
 */

const rateLimit = require('express-rate-limit');

// Custom key generator that combines IP and user ID (if authenticated)
const keyGenerator = (req) => {
  const userId = req.user?.id || 'anonymous';
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  return `${ip}-${userId}`;
};

// Graceful 429 error handler with retry-after information
const rateLimitHandler = (req, res, next, options) => {
  const retryAfter = Math.ceil(options.windowMs / 1000);
  res.set('Retry-After', retryAfter);
  res.status(429).json({
    success: false,
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.',
    retryAfter: retryAfter,
    limit: options.max,
    windowMs: options.windowMs
  });
};

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP/user combination
 */
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { success: false, error: 'Too many requests, please try again later.' },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  keyGenerator,
  handler: rateLimitHandler,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  }
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes to prevent brute force attacks
 */
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5,
  message: { 
    success: false, 
    error: 'Too many login attempts',
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip, // Only IP-based for auth
  handler: rateLimitHandler,
  skipSuccessfulRequests: false // Count all requests
});

/**
 * Payment endpoint rate limiter
 * 10 requests per 15 minutes to prevent payment abuse
 */
const paymentLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: 10,
  message: { 
    success: false, 
    error: 'Too many payment requests',
    message: 'Payment rate limit exceeded. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: rateLimitHandler
});

/**
 * Sensitive operations limiter (password reset, etc.)
 * 3 requests per hour
 */
const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { 
    success: false, 
    error: 'Rate limit exceeded for sensitive operations',
    message: 'Please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: rateLimitHandler
});

module.exports = {
  generalLimiter,
  authLimiter,
  paymentLimiter,
  sensitiveLimiter
};
