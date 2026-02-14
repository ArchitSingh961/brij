/**
 * Category Model
 * MongoDB schema for product categories
 */

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters'],
        default: ''
    },
    icon: {
        type: String,
        default: '📦' // Default emoji icon
    },
    displayOrder: {
        type: Number,
        default: 0 // For controlling order on home page
    },
    showOnHome: {
        type: Boolean,
        default: true // Whether to show this category on home page
    },
    // Special slot support for home page
    isSpecialSlot: {
        type: Boolean,
        default: false // True if this is a special slot like "Bestseller"
    },
    slotType: {
        type: String,
        enum: ['category', 'bestseller', 'palmOilFree'],
        default: 'category' // Type of slot - determines which products to show
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries
categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ displayOrder: 1 });
categorySchema.index({ showOnHome: 1 });

module.exports = mongoose.model('Category', categorySchema);

