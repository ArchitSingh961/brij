/**
 * Category Routes
 * CRUD operations for product categories with admin-only write access
 */

const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * GET /api/categories
 * Get all active categories sorted by display order
 * Public endpoint
 */
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true })
            .sort({ displayOrder: 1, name: 1 })
            .lean();

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
 * GET /api/categories/home
 * Get categories to display on home page with their products
 * Supports special slots like 'bestseller' and 'palmOilFree'
 * Public endpoint
 */
router.get('/home', async (req, res) => {
    try {
        const categories = await Category.find({
            isActive: true,
            showOnHome: true
        })
            .sort({ displayOrder: 1 })
            .lean();

        // Fetch products for each category/slot
        const categoriesWithProducts = await Promise.all(
            categories.map(async (category) => {
                let products;

                // Handle special slots
                if (category.isSpecialSlot) {
                    if (category.slotType === 'bestseller') {
                        // Fetch bestseller products from all categories
                        products = await Product.find({
                            isBestSeller: true,
                            isActive: true
                        })
                            .sort({ createdAt: -1 })
                            .limit(10)
                            .lean();
                    } else if (category.slotType === 'palmOilFree') {
                        // Fetch palm oil free products from all categories
                        products = await Product.find({
                            isPalmOilFree: true,
                            isActive: true
                        })
                            .sort({ createdAt: -1 })
                            .limit(10)
                            .lean();
                    } else {
                        products = [];
                    }
                } else {
                    // Regular category - fetch products by category name
                    products = await Product.find({
                        category: category.name,
                        isActive: true
                    })
                        .sort({ createdAt: -1 })
                        .limit(10)
                        .lean();
                }

                return {
                    ...category,
                    products
                };
            })
        );

        res.json({
            success: true,
            data: categoriesWithProducts
        });
    } catch (error) {
        console.error('Get home categories error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch home categories'
        });
    }
});

/**
 * GET /api/categories/all
 * Get all categories including inactive (admin only)
 */
router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const categories = await Category.find()
            .sort({ displayOrder: 1, name: 1 })
            .lean();

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get all categories error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch categories'
        });
    }
});

/**
 * POST /api/categories
 * Create new category (admin only)
 */
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, description, icon, showOnHome } = req.body;

        // Check if category already exists
        const existingCategory = await Category.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                error: 'Category with this name already exists'
            });
        }

        // Get the highest display order for new category
        const maxOrderCategory = await Category.findOne().sort({ displayOrder: -1 });
        const displayOrder = maxOrderCategory ? maxOrderCategory.displayOrder + 1 : 0;

        const category = new Category({
            name,
            description: description || '',
            icon: icon || '📦',
            displayOrder,
            showOnHome: showOnHome !== false
        });

        await category.save();

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create category'
        });
    }
});

/**
 * PUT /api/categories/reorder
 * Reorder categories (admin only)
 * Body: { categories: [{ id: string, displayOrder: number }] }
 */
router.put('/reorder', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { categories } = req.body;

        if (!Array.isArray(categories)) {
            return res.status(400).json({
                success: false,
                error: 'Categories array is required'
            });
        }

        // Update each category's display order
        const updatePromises = categories.map(({ id, displayOrder }) =>
            Category.findByIdAndUpdate(id, { displayOrder }, { new: true })
        );

        await Promise.all(updatePromises);

        res.json({
            success: true,
            message: 'Categories reordered successfully'
        });
    } catch (error) {
        console.error('Reorder categories error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reorder categories'
        });
    }
});

/**
 * PUT /api/categories/:id
 * Update category (admin only)
 */
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, description, icon, isActive, showOnHome, displayOrder } = req.body;
        const updates = {};

        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (icon !== undefined) updates.icon = icon;
        if (isActive !== undefined) updates.isActive = isActive;
        if (showOnHome !== undefined) updates.showOnHome = showOnHome;
        if (displayOrder !== undefined) updates.displayOrder = displayOrder;

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        res.json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update category'
        });
    }
});

/**
 * DELETE /api/categories/:id
 * Delete category (admin only) - soft delete
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete category'
        });
    }
});

module.exports = router;

