/**
 * Cleanup script to keep only the first image for each product
 * Run with: node cleanup-images.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/brij-namkeen';

async function cleanupImages() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Get products collection directly
        const db = mongoose.connection.db;
        const productsCollection = db.collection('products');

        // Find all products
        const products = await productsCollection.find({}).toArray();
        console.log(`Found ${products.length} products`);

        let updatedCount = 0;

        for (const product of products) {
            const images = product.images || [];
            const mainImage = product.image;

            // Keep only the first image
            let imageToKeep = null;
            if (images.length > 0) {
                imageToKeep = images[0];
            } else if (mainImage && mainImage !== '/images/default-product.jpg') {
                imageToKeep = mainImage;
            }

            // Update the product
            const updateData = {
                image: imageToKeep || '/images/default-product.jpg',
                images: imageToKeep ? [imageToKeep] : []
            };

            await productsCollection.updateOne(
                { _id: product._id },
                { $set: updateData }
            );

            console.log(`Updated: ${product.name} - Image: ${imageToKeep || 'none'}`);
            updatedCount++;
        }

        console.log(`\n✅ Cleanup complete! Updated ${updatedCount} products.`);
        console.log('Each product now has at most 1 image.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

cleanupImages();
