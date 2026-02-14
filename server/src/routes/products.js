/**
 * Product Routes
 * CRUD operations for products with admin-only write access
 * Supports image upload for product images
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { handleUpload, handleMultipleUpload } = require('../middleware/upload');

/**
 * GET /api/products
 * Get all active products with pagination and filtering
 * Public endpoint
 */
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        // Build filter query
        const filter = { isActive: true };

        if (req.query.category) {
            filter.category = req.query.category;
        }

        if (req.query.search) {
            // Use regex for partial matching (case-insensitive) on name
            filter.name = { $regex: req.query.search, $options: 'i' };
        }

        // Execute query with pagination
        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch products'
        });
    }
});

/**
 * GET /api/products/categories
 * Get all unique categories
 * Public endpoint
 */
router.get('/categories', async (req, res) => {
    try {
        const categories = await Product.distinct('category', { isActive: true });
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch categories'
        });
    }
});

/**
 * GET /api/products/all
 * Get all products including inactive (admin only)
 */
router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments()
        ]);

        res.json({
            success: true,
            data: products,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('Get all products error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch products'
        });
    }
});

/**
 * GET /api/products/:id
 * Get single product by ID
 * Public endpoint
 */
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).lean();

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch product'
        });
    }
});

/**
 * POST /api/products
 * Create new product with image upload (admin only)
 * Supports single image (image field) or multiple images (images field)
 */
router.post('/', authenticateToken, requireAdmin, handleMultipleUpload, async (req, res) => {
    try {
        const { name, description, category, isActive, isBestSeller, isPalmOilFree } = req.body;

        // Validate required fields
        if (!name || !description || !category) {
            return res.status(400).json({
                success: false,
                error: 'Name, description, and category are required'
            });
        }

        // Handle multiple images
        let imagePaths = [];
        let mainImage = '/images/default-product.jpg';

        if (req.files && req.files.length > 0) {
            imagePaths = req.files.map(file => `/uploads/products/${file.filename}`);
            mainImage = imagePaths[0]; // First image is the main image
        }

        const product = new Product({
            name,
            description,
            category,
            image: mainImage,
            images: imagePaths,
            price: 0, // Default price since removed from form
            isActive: isActive !== 'false',
            isBestSeller: isBestSeller === 'true' || isBestSeller === true,
            isPalmOilFree: isPalmOilFree === 'true' || isPalmOilFree === true
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create product'
        });
    }
});

/**
 * PUT /api/products/:id
 * Update product with optional image upload (admin only)
 * Supports multiple images
 */
router.put('/:id', authenticateToken, requireAdmin, handleMultipleUpload, async (req, res) => {
    try {
        const { name, description, category, isActive, isBestSeller, isPalmOilFree, existingImages } = req.body;
        const updates = {};

        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (category !== undefined) updates.category = category;
        if (isActive !== undefined) updates.isActive = isActive !== 'false';
        if (isBestSeller !== undefined) updates.isBestSeller = isBestSeller === 'true' || isBestSeller === true;
        if (isPalmOilFree !== undefined) updates.isPalmOilFree = isPalmOilFree === 'true' || isPalmOilFree === true;

        // Get current product for image handling
        const oldProduct = await Product.findById(req.params.id);
        if (!oldProduct) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        // Parse existing images to keep (sent from frontend)
        let imagesToKeep = [];
        if (existingImages) {
            try {
                imagesToKeep = JSON.parse(existingImages);
            } catch (e) {
                imagesToKeep = Array.isArray(existingImages) ? existingImages : [existingImages];
            }
        }

        // Handle new images upload
        let newImagePaths = [];
        if (req.files && req.files.length > 0) {
            newImagePaths = req.files.map(file => `/uploads/products/${file.filename}`);
        }

        // Combine existing and new images (max 5)
        const allImages = [...imagesToKeep, ...newImagePaths].slice(0, 5);

        if (allImages.length > 0) {
            updates.images = allImages;
            updates.image = allImages[0]; // First image is main image
        }

        // Delete old images that are no longer in use
        const imagesToDelete = (oldProduct.images || []).filter(img => !imagesToKeep.includes(img));
        for (const img of imagesToDelete) {
            if (img && img.startsWith('/uploads/')) {
                const oldPath = path.join(__dirname, '../../', img);
                if (fs.existsSync(oldPath)) {
                    try { fs.unlinkSync(oldPath); } catch (e) { /* ignore */ }
                }
            }
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update product'
        });
    }
});

/**
 * DELETE /api/products/:id
 * Delete product (admin only) - soft delete by setting isActive to false
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete product'
        });
    }
});

module.exports = router;
