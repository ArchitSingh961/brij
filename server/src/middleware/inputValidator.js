/**
 * Input Validation & Sanitization Middleware
 * Schema-based validation using express-validator
 * OWASP: Prevents injection attacks, XSS, and data integrity issues
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation error handler
 * Returns clear error messages with field-specific details
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg,
                value: err.value ? '[REDACTED]' : undefined // Don't expose sensitive values
            }))
        });
    }
    next();
};

/**
 * Reject unexpected fields middleware
 * Whitelist-based approach - only allow expected fields
 */
const rejectUnexpectedFields = (allowedFields) => {
    return (req, res, next) => {
        const receivedFields = Object.keys(req.body);
        const unexpectedFields = receivedFields.filter(field => !allowedFields.includes(field));

        if (unexpectedFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Unexpected fields in request',
                details: `Unexpected fields: ${unexpectedFields.join(', ')}`
            });
        }
        next();
    };
};

/**
 * Sanitize string - trim, escape HTML entities
 */
const sanitizeString = (value) => {
    if (typeof value !== 'string') return value;
    return value
        .trim()
        .replace(/[<>]/g, '') // Remove < and > to prevent XSS
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Product validation rules
 */
const productValidation = {
    create: [
        body('name')
            .trim()
            .notEmpty().withMessage('Product name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
            .customSanitizer(sanitizeString),
        body('description')
            .trim()
            .notEmpty().withMessage('Description is required')
            .isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters')
            .customSanitizer(sanitizeString),
        body('price')
            .notEmpty().withMessage('Price is required')
            .isFloat({ min: 0.01, max: 100000 }).withMessage('Price must be between 0.01 and 100000'),
        body('category')
            .trim()
            .notEmpty().withMessage('Category is required')
            .isLength({ max: 50 }).withMessage('Category must be max 50 characters')
            .customSanitizer(sanitizeString),
        body('stock')
            .optional()
            .isInt({ min: 0, max: 10000 }).withMessage('Stock must be 0-10000'),
        body('image')
            .optional()
            .isURL().withMessage('Image must be a valid URL'),
        body('weight')
            .optional()
            .isLength({ max: 50 }).withMessage('Weight must be max 50 characters'),
        body('isActive')
            .optional()
            .isBoolean().withMessage('isActive must be boolean'),
        handleValidationErrors
    ],
    update: [
        param('id')
            .isMongoId().withMessage('Invalid product ID'),
        body('name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
            .customSanitizer(sanitizeString),
        body('description')
            .optional()
            .trim()
            .isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters')
            .customSanitizer(sanitizeString),
        body('price')
            .optional()
            .isFloat({ min: 0.01, max: 100000 }).withMessage('Price must be between 0.01 and 100000'),
        body('category')
            .optional()
            .trim()
            .isLength({ max: 50 }).withMessage('Category must be max 50 characters')
            .customSanitizer(sanitizeString),
        body('stock')
            .optional()
            .isInt({ min: 0, max: 10000 }).withMessage('Stock must be 0-10000'),
        body('image')
            .optional()
            .isURL().withMessage('Image must be a valid URL'),
        body('isActive')
            .optional()
            .isBoolean().withMessage('isActive must be boolean'),
        handleValidationErrors
    ],
    getById: [
        param('id')
            .isMongoId().withMessage('Invalid product ID'),
        handleValidationErrors
    ]
};

/**
 * Order validation rules
 */
const orderValidation = {
    create: [
        body('items')
            .isArray({ min: 1, max: 50 }).withMessage('Order must have 1-50 items'),
        body('items.*.productId')
            .isMongoId().withMessage('Invalid product ID in items'),
        body('items.*.quantity')
            .isInt({ min: 1, max: 100 }).withMessage('Quantity must be 1-100'),
        body('customerName')
            .trim()
            .notEmpty().withMessage('Customer name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
            .customSanitizer(sanitizeString),
        body('customerEmail')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Invalid email format')
            .normalizeEmail(),
        body('customerPhone')
            .trim()
            .notEmpty().withMessage('Phone is required')
            .matches(/^[+]?[0-9]{10,15}$/).withMessage('Invalid phone number'),
        body('shippingAddress')
            .trim()
            .notEmpty().withMessage('Shipping address is required')
            .isLength({ min: 10, max: 500 }).withMessage('Address must be 10-500 characters')
            .customSanitizer(sanitizeString),
        body('shippingCity')
            .trim()
            .notEmpty().withMessage('City is required')
            .isLength({ min: 2, max: 100 }).withMessage('City must be 2-100 characters')
            .customSanitizer(sanitizeString),
        body('shippingState')
            .trim()
            .notEmpty().withMessage('State is required')
            .isLength({ min: 2, max: 100 }).withMessage('State must be 2-100 characters')
            .customSanitizer(sanitizeString),
        body('shippingPincode')
            .trim()
            .notEmpty().withMessage('Pincode is required')
            .matches(/^[0-9]{6}$/).withMessage('Invalid 6-digit pincode'),
        handleValidationErrors
    ],
    getById: [
        param('id')
            .isMongoId().withMessage('Invalid order ID'),
        handleValidationErrors
    ],
    updateStatus: [
        param('id')
            .isMongoId().withMessage('Invalid order ID'),
        body('status')
            .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
            .withMessage('Invalid order status'),
        handleValidationErrors
    ]
};

/**
 * Auth validation rules
 */
const authValidation = {
    login: [
        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Invalid email format')
            .normalizeEmail(),
        body('password')
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 6, max: 100 }).withMessage('Password must be 6-100 characters'),
        handleValidationErrors
    ]
};

/**
 * Payment validation rules
 */
const paymentValidation = {
    createOrder: [
        body('amount')
            .notEmpty().withMessage('Amount is required')
            .isFloat({ min: 1, max: 10000000 }).withMessage('Amount must be between 1 and 10000000'),
        body('orderId')
            .optional()
            .isMongoId().withMessage('Invalid order ID'),
        handleValidationErrors
    ],
    verify: [
        body('razorpay_order_id')
            .notEmpty().withMessage('Razorpay order ID is required')
            .isLength({ max: 100 }).withMessage('Invalid order ID length'),
        body('razorpay_payment_id')
            .notEmpty().withMessage('Razorpay payment ID is required')
            .isLength({ max: 100 }).withMessage('Invalid payment ID length'),
        body('razorpay_signature')
            .notEmpty().withMessage('Signature is required')
            .isLength({ max: 200 }).withMessage('Invalid signature length'),
        handleValidationErrors
    ]
};

/**
 * Query parameter validation for lists
 */
const listQueryValidation = [
    query('page')
        .optional()
        .isInt({ min: 1, max: 1000 }).withMessage('Page must be 1-1000'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    query('category')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Category must be max 50 characters'),
    query('search')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Search must be max 100 characters')
        .customSanitizer(sanitizeString),
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    rejectUnexpectedFields,
    sanitizeString,
    productValidation,
    orderValidation,
    authValidation,
    paymentValidation,
    listQueryValidation
};
