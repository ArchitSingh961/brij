/**
 * Security Headers Configuration
 * OWASP-compliant security headers using Helmet.js
 */

const helmet = require('helmet');

/**
 * Configure Helmet with OWASP recommended headers
 */
const securityHeaders = helmet({
    // Content Security Policy - Prevents XSS attacks
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'", // Required for Razorpay
                "https://checkout.razorpay.com",
                "https://api.razorpay.com"
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'", // Required for inline styles
                "https://fonts.googleapis.com"
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com"
            ],
            imgSrc: [
                "'self'",
                "data:",
                "blob:",
                "https:"  // Allow HTTPS images for products
            ],
            connectSrc: [
                "'self'",
                "https://api.razorpay.com",
                "https://lumberjack.razorpay.com",
                "https://*.ngrok-free.dev",
                "https://*.ngrok.io",
                "ws://localhost:*",
                "http://localhost:*"
            ],
            frameSrc: [
                "'self'",
                "https://api.razorpay.com",
                "https://checkout.razorpay.com"
            ],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: null
        }
    },

    // X-DNS-Prefetch-Control
    dnsPrefetchControl: { allow: false },

    // X-Frame-Options - Prevents clickjacking
    frameguard: { action: 'deny' },

    // Hide X-Powered-By
    hidePoweredBy: true,

    // HTTP Strict Transport Security
    hsts: false, // Disable HSTS for now to prevent https issues with localhost

    // X-Content-Type-Options
    noSniff: true,

    // X-XSS-Protection (legacy browsers)
    xssFilter: true,

    // Referrer Policy
    referrerPolicy: { policy: 'no-referrer' }, // Relaxed referrer policy

    // Permissions Policy
    permittedCrossDomainPolicies: { permittedPolicies: 'none' }
});

/**
 * Additional security headers not covered by Helmet
 */
const additionalSecurityHeaders = (req, res, next) => {
    // Prevent caching of sensitive data
    if (req.path.includes('/api/auth') || req.path.includes('/api/admin')) {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
    }

    // Feature Policy / Permissions Policy
    res.set('Permissions-Policy',
        'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(self), usb=()'
    );

    next();
};

/**
 * CORS configuration
 */
const corsOptions = {
    origin: true, // Allow ALL origins for now to fix the demo
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'Retry-After'],
    maxAge: 600 // Cache preflight for 10 minutes
};

module.exports = {
    securityHeaders,
    additionalSecurityHeaders,
    corsOptions
};
