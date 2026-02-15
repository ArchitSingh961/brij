/**
 * Brij Namkeen E-commerce Server
 * Main entry point with security middleware configuration
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const fs = require('fs');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Security middleware
const { securityHeaders, additionalSecurityHeaders, corsOptions } = require('./utils/securityHeaders');
const { generalLimiter } = require('./middleware/rateLimiter');

// Routes
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const categoryRoutes = require('./routes/categories');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 5000;

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// =============================================================================
// SECURITY MIDDLEWARE (Order matters!)
// =============================================================================

// 1. Security headers (Helmet)
app.use(securityHeaders);
app.use(additionalSecurityHeaders);

// 2. CORS
app.use(cors(corsOptions));

// 3. Rate limiting (before body parsing to prevent DoS)
// Skip rate limiting in development mode
if (process.env.NODE_ENV === 'production') {
    app.use(generalLimiter);
}

// 4. Body parsing with size limits (OWASP: Limit request body size)
app.use(express.json({ limit: '10kb' })); // Limit JSON body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Cookie parser
app.use(cookieParser());

// 6. Data sanitization against NoSQL query injection
app.use(require('express-mongo-sanitize')());

// 7. Prevent parameter pollution
app.use(require('hpp')());

// =============================================================================
// DATABASE CONNECTION
// =============================================================================

let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;

    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/brij-namkeen';

        await mongoose.connect(mongoURI, {
            // Modern Mongoose options
        });

        isConnected = true;
        console.log('✅ MongoDB connected successfully');

        // Create default admin if not exists
        const Admin = require('./models/Admin');
        const adminExists = await Admin.findOne({ email: process.env.ADMIN_EMAIL });

        if (!adminExists && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
            await Admin.create({
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD,
                name: 'Admin',
                role: 'admin'
            });
            console.log('✅ Default admin created');
        }

    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
            process.exit(1);
        }
    }
};

// Vercel serverless: connect to DB lazily on first request
if (process.env.VERCEL) {
    app.use(async (req, res, next) => {
        try {
            await connectDB();
            next();
        } catch (error) {
            console.error('DB connection middleware error:', error);
            res.status(500).json({ success: false, error: 'Database connection failed' });
        }
    });
}

// =============================================================================
// REQUEST LOGGING (Development only)
// =============================================================================

if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
        next();
    });
}

// =============================================================================
// HEALTH CHECK ENDPOINT
// =============================================================================

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// =============================================================================
// API ROUTES
// =============================================================================

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/blogs', require('./routes/blogs'));

// =============================================================================
// SERVE FRONTEND (Production or Demo mode)
// =============================================================================

// Serve frontend static files if the build directory exists
const clientDistPath = path.join(__dirname, '../../client/dist');

if (fs.existsSync(clientDistPath)) {
    console.log('📦 Serving frontend from:', clientDistPath);

    // Serve static files
    app.use(express.static(clientDistPath));

    // Handle SPA routing - serve index.html for all non-API routes
    app.get('*', (req, res, next) => {
        // Skip API routes
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
            return next();
        }
        res.sendFile(path.join(clientDistPath, 'index.html'));
    });
} else {
    console.log('⚠️ Frontend build not found at:', clientDistPath);
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

// 404 Handler (only for API routes when serving frontend)
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not found',
        message: `Route ${req.method} ${req.path} not found`
    });
});

// Global error handler (OWASP: Don't expose stack traces in production)
app.use((err, req, res, next) => {
    console.error('Server error:', err);

    // Handle CORS errors
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            error: 'CORS error',
            message: 'Cross-origin request blocked'
        });
    }

    // Handle JSON parse errors
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            error: 'Invalid JSON',
            message: 'Request body contains invalid JSON'
        });
    }

    // Generic error response
    res.status(err.status || 500).json({
        success: false,
        error: 'Server error',
        message: process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : err.message
    });
});

// =============================================================================
// SERVER START (local development only)
// =============================================================================

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`
🚀 Brij Namkeen Server running on port ${PORT}
📦 Environment: ${process.env.NODE_ENV || 'development'}
🔐 Security features enabled:
   - Helmet security headers
   - Rate limiting
   - Input validation
   - CORS protection
    `);
    });
};

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    startServer();
}

module.exports = app;
module.exports.connectDB = connectDB;
