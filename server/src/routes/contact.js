/**
 * Contact Routes
 * Handles contact form submissions with email notification
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { sendContactNotification } = require('../services/emailService');
const { sensitiveLimiter } = require('../middleware/rateLimiter');

// Validation rules for contact form
const contactValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
        .escape(),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email address')
        .normalizeEmail(),
    body('phone')
        .optional()
        .trim()
        .matches(/^[+]?[\d\s-]{10,15}$/).withMessage('Invalid phone number'),
    body('subject')
        .trim()
        .notEmpty().withMessage('Subject is required')
        .isIn(['general', 'order', 'bulk', 'feedback', 'other']).withMessage('Invalid subject'),
    body('message')
        .trim()
        .notEmpty().withMessage('Message is required')
        .isLength({ min: 10, max: 2000 }).withMessage('Message must be 10-2000 characters')
        .escape()
];

/**
 * POST /api/contact
 * Submit contact form
 */
router.post('/', sensitiveLimiter, contactValidation, async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, phone, subject, message } = req.body;

        // Send email notification to owner
        const emailResult = await sendContactNotification({
            name,
            email,
            phone: phone || 'Not provided',
            subject,
            message
        });

        if (!emailResult.success) {
            console.error('Failed to send contact notification:', emailResult.error);
            // Still return success to user - we don't want to expose email issues
        }

        res.status(200).json({
            success: true,
            message: 'Your message has been sent successfully. We will get back to you soon!'
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.'
        });
    }
});

module.exports = router;
