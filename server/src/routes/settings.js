/**
 * Settings Routes
 * Handles site-wide settings including catalogue PDF management
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const SiteSettings = require('../models/SiteSettings');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Ensure uploads directory exists for catalogue
const catalogueDir = path.join(__dirname, '../../uploads/catalogue');
if (!fs.existsSync(catalogueDir)) {
    fs.mkdirSync(catalogueDir, { recursive: true });
}

// Configure storage for catalogue PDF
const catalogueStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, catalogueDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `catalogue-${uniqueSuffix}${ext}`);
    }
});

// File filter - only allow PDFs
const pdfFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

const uploadCatalogue = multer({
    storage: catalogueStorage,
    fileFilter: pdfFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max for catalogue
    }
}).single('catalogue');

/**
 * GET /api/settings
 * Get current site settings
 * Public endpoint
 */
router.get('/', async (req, res) => {
    try {
        const settings = await SiteSettings.getSettings();
        res.json({
            success: true,
            data: {
                hasCatalogue: !!settings.cataloguePdf,
                catalogueFileName: settings.catalogueFileName,
                catalogueUploadedAt: settings.catalogueUploadedAt
            }
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch settings'
        });
    }
});

/**
 * GET /api/settings/catalogue/download
 * Download the catalogue PDF
 * Public endpoint
 */
router.get('/catalogue/download', async (req, res) => {
    try {
        const settings = await SiteSettings.getSettings();

        if (!settings.cataloguePdf) {
            return res.status(404).json({
                success: false,
                error: 'No catalogue available'
            });
        }

        const filePath = path.join(__dirname, '../../', settings.cataloguePdf);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: 'Catalogue file not found'
            });
        }

        const fileName = settings.catalogueFileName || 'Brij-Namkeen-Catalogue.pdf';
        res.download(filePath, fileName);
    } catch (error) {
        console.error('Download catalogue error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to download catalogue'
        });
    }
});

/**
 * POST /api/settings/catalogue
 * Upload new catalogue PDF (admin only)
 */
router.post('/catalogue', authenticateToken, requireAdmin, (req, res) => {
    uploadCatalogue(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    error: 'File too large. Maximum size is 50MB.'
                });
            }
            return res.status(400).json({
                success: false,
                error: err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                error: err.message
            });
        }

        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No PDF file uploaded'
                });
            }

            const settings = await SiteSettings.getSettings();

            // Delete old catalogue file if exists
            if (settings.cataloguePdf) {
                const oldPath = path.join(__dirname, '../../', settings.cataloguePdf);
                if (fs.existsSync(oldPath)) {
                    try { fs.unlinkSync(oldPath); } catch (e) { /* ignore */ }
                }
            }

            // Update settings with new catalogue
            settings.cataloguePdf = `/uploads/catalogue/${req.file.filename}`;
            settings.catalogueFileName = req.file.originalname;
            settings.catalogueUploadedAt = new Date();
            await settings.save();

            res.json({
                success: true,
                message: 'Catalogue uploaded successfully',
                data: {
                    fileName: settings.catalogueFileName,
                    uploadedAt: settings.catalogueUploadedAt
                }
            });
        } catch (error) {
            console.error('Upload catalogue error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to upload catalogue'
            });
        }
    });
});

/**
 * DELETE /api/settings/catalogue
 * Delete catalogue PDF (admin only)
 */
router.delete('/catalogue', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const settings = await SiteSettings.getSettings();

        if (settings.cataloguePdf) {
            const filePath = path.join(__dirname, '../../', settings.cataloguePdf);
            if (fs.existsSync(filePath)) {
                try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
            }
        }

        settings.cataloguePdf = null;
        settings.catalogueFileName = null;
        settings.catalogueUploadedAt = null;
        await settings.save();

        res.json({
            success: true,
            message: 'Catalogue deleted successfully'
        });
    } catch (error) {
        console.error('Delete catalogue error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete catalogue'
        });
    }
});

module.exports = router;
