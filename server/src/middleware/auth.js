/**
 * Authentication Middleware
 * JWT-based authentication for protected routes
 * OWASP: Secure token validation, proper error handling
 */

const jwt = require('jsonwebtoken');

/**
 * Get JWT secret from environment
 * Validates that secret is properly configured
 */
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
        console.error('SECURITY WARNING: JWT_SECRET is not properly configured');
        if (process.env.NODE_ENV === 'production') {
            throw new Error('JWT_SECRET must be set in production');
        }
    }
    return secret || 'dev_fallback_secret_not_for_production';
};

/**
 * Verify JWT token and attach user to request
 */
const authenticateToken = (req, res, next) => {
    try {
        // Get token from Authorization header or cookie
        let token = null;

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'No authentication token provided'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, getJwtSecret(), {
            algorithms: ['HS256'], // Only allow expected algorithm
            maxAge: '24h' // Token must not be older than 24 hours
        });

        // Attach user info to request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role || 'user'
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expired',
                message: 'Your session has expired. Please login again.'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token',
                message: 'Authentication token is invalid'
            });
        }

        console.error('Authentication error:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Authentication failed',
            message: 'An error occurred during authentication'
        });
    }
};

/**
 * Admin-only middleware
 * Must be used after authenticateToken
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required',
            message: 'Please login first'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Access denied',
            message: 'Admin privileges required'
        });
    }

    next();
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for public endpoints that behave differently for logged-in users
 */
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, getJwtSecret());
            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role || 'user'
            };
        }
    } catch (error) {
        // Token invalid or expired, continue without user
        req.user = null;
    }
    next();
};

/**
 * Generate JWT token
 */
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id || user.id,
            email: user.email,
            role: user.role || 'admin'
        },
        getJwtSecret(),
        {
            expiresIn: '24h',
            algorithm: 'HS256'
        }
    );
};

module.exports = {
    authenticateToken,
    requireAdmin,
    optionalAuth,
    generateToken,
    getJwtSecret
};
