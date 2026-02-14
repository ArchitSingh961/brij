
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const checkDb = async () => {
    console.log('Starting DB check...');
    try {
        const mongoURI = process.env.MONGODB_URI;
        console.log('Connecting to:', mongoURI);

        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000 // Timeout after 5s
        });
        console.log('✅ Connected to MongoDB');

        const count = await Product.countDocuments();
        console.log(`Product count: ${count}`);

        if (count > 0) {
            const products = await Product.find({}).limit(5);
            console.log('Sample products categories:', products.map(p => p.category));
        }

        await mongoose.connection.close();
        console.log('Connection closed.');
    } catch (error) {
        console.error('❌ Error connecting/querying:', error);
    }
};

checkDb();
