/**
 * Product Model
 * MongoDB schema for products in the store
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [3, 'Description must be at least 3 characters'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
        type: Number,
        default: 0,
        min: [0, 'Price cannot be negative'],
        max: [100000, 'Price cannot exceed 100000']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        maxlength: [50, 'Category cannot exceed 50 characters']
    },
    image: {
        type: String,
        default: '/images/default-product.jpg',
        maxlength: [500, 'Image path cannot exceed 500 characters'],
        validate: {
            validator: function (v) {
                // Reject base64 data URLs - only allow file paths
                if (v && v.startsWith('data:')) {
                    return false;
                }
                return true;
            },
            message: 'Base64 images not allowed. Use file upload instead.'
        }
    },
    weight: {
        type: String,
        default: '200g'
    },
    stock: {
        type: Number,
        default: 100,
        min: [0, 'Stock cannot be negative'],
        max: [10000, 'Stock cannot exceed 10000']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    ratings: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    },
    // Product tags for special badges
    isBestSeller: {
        type: Boolean,
        default: false
    },
    isPalmOilFree: {
        type: Boolean,
        default: false
    },
    // Multiple images support (up to 5 images)
    images: [{
        type: String,
        maxlength: [500, 'Image path cannot exceed 500 characters'],
        validate: {
            validator: function (v) {
                // Reject base64 data URLs - only allow file paths
                if (v && v.startsWith('data:')) {
                    return false;
                }
                return true;
            },
            message: 'Base64 images not allowed. Use file upload instead.'
        }
    }]
}, {
    timestamps: true
});

// Index for search and filtering
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ price: 1 });

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function () {
    return `₹${this.price.toFixed(2)}`;
});

// Ensure virtuals are included in JSON output
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
