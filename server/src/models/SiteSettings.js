/**
 * SiteSettings Model
 * Singleton model for site-wide settings including catalogue PDF
 */

const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    // Catalogue PDF path
    cataloguePdf: {
        type: String,
        default: null,
        maxlength: [500, 'File path cannot exceed 500 characters']
    },
    catalogueFileName: {
        type: String,
        default: null,
        maxlength: [200, 'File name cannot exceed 200 characters']
    },
    catalogueUploadedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Ensure only one document exists (singleton pattern)
siteSettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
