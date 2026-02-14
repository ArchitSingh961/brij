const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// ... (keep multer config if needed, or better yet, reuse the existing upload middleware from products.js/upload.js)
// Checking products.js, it imports handleUpload, handleMultipleUpload from ../middleware/upload.
// But wait, in blogs.js I see I implemented a local multer.
// I should probably switch to the centralized one if possible, or just fix the auth imports for now to stop the crash.
// The local multer in blogs.js is fine for now, but the auth is broken.

// Let's look at the existing blogs.js again.
// It uses `protect` and `authorize('admin')`.
// I need to change:
// `protect` -> `authenticateToken`
// `authorize('admin')` -> `requireAdmin` (requireAdmin checks for admin role internally, so no arg needed).

const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure Multer (Keep existing local config for now to ensure it works as designed in that file)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadMiddleware = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// @desc    Get all blogs (public)
// @route   GET /api/blogs
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find({ isActive: true }).sort('-createdAt');
        res.status(200).json({ success: true, count: blogs.length, data: blogs });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Get all blogs (admin)
// @route   GET /api/blogs/all
router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const blogs = await Blog.find().sort('-createdAt');
        res.status(200).json({ success: true, count: blogs.length, data: blogs });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Get single blog
// @route   GET /api/blogs/:id
router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }
        res.status(200).json({ success: true, data: blog });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Create new blog
// @route   POST /api/blogs
router.post('/', authenticateToken, requireAdmin, uploadMiddleware.single('image'), async (req, res) => {
    try {
        if (req.file) {
            req.body.image = `/uploads/${req.file.filename}`;
        }
        const blog = await Blog.create(req.body);
        res.status(201).json({ success: true, data: blog });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Update blog
// @route   PUT /api/blogs/:id
router.put('/:id', authenticateToken, requireAdmin, uploadMiddleware.single('image'), async (req, res) => {
    try {
        let blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }
        if (req.file) {
            req.body.image = `/uploads/${req.file.filename}`;
        }
        blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({ success: true, data: blog });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }
        await blog.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
