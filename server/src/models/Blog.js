const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    excerpt: {
        type: String,
        required: [true, 'Please provide an excerpt'],
        maxlength: [200, 'Excerpt cannot be more than 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Please provide content']
    },
    author: {
        type: String,
        required: [true, 'Please provide an author name'],
        default: 'Admin'
    },
    category: {
        type: String,
        required: [true, 'Please provide a category'],
        enum: ['Recipes', 'Culture', 'Health', 'News', 'Other'],
        default: 'Other'
    },
    image: {
        type: String,
        default: 'no-photo.jpg'
    },
    readTime: {
        type: String,
        default: '5 min read'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Blog', blogSchema);
