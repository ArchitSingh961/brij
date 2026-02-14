/**
 * Authentication Routes
 * Admin login with account lockout protection
 */

const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { authValidation } = require('../middleware/inputValidator');
const { authLimiter } = require('../middleware/rateLimiter');

/**
 * POST /api/auth/login
 * Admin login endpoint with rate limiting
 */
router.post('/login', authLimiter, authValidation.login, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find admin with password (normally excluded)
        const admin = await Admin.findOne({ email }).select('+password');

        if (!admin) {
            // Use same message for security (don't reveal if email exists)
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }

        // Check if account is locked
        if (admin.isLocked) {
            const lockRemaining = Math.ceil((admin.lockUntil - Date.now()) / 60000);
            return res.status(423).json({
                success: false,
                error: 'Account locked',
                message: `Account is locked. Try again in ${lockRemaining} minutes.`
            });
        }

        // Check if account is active
        if (!admin.isActive) {
            return res.status(403).json({
                success: false,
                error: 'Account disabled',
                message: 'This account has been disabled'
            });
        }

        // Verify password
        const isMatch = await admin.comparePassword(password);

        if (!isMatch) {
            // Increment failed attempts
            await admin.incLoginAttempts();

            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }

        // Reset failed attempts on successful login
        await admin.resetLoginAttempts();

        // Generate JWT token
        const token = generateToken(admin);

        // Set httpOnly cookie for additional security
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                admin: {
                    id: admin._id,
                    email: admin.email,
                    name: admin.name,
                    role: admin.role
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed',
            message: 'An error occurred during login'
        });
    }
});

/**
 * POST /api/auth/logout
 * Clear authentication cookie
 */
router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

/**
 * GET /api/auth/me
 * Get current admin info (protected)
 */
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                error: 'Admin not found'
            });
        }

        res.json({
            success: true,
            data: {
                id: admin._id,
                email: admin.email,
                name: admin.name,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Get admin error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch admin info'
        });
    }
});

/**
 * GET /api/auth/verify
 * Verify if token is valid
 */
router.get('/verify', authenticateToken, (req, res) => {
    res.json({
        success: true,
        data: {
            valid: true,
            user: req.user
        }
    });
});

module.exports = router;
