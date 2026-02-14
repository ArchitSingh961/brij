/**
 * Database Seeder
 * Populates database with sample products for Brij Namkeen Store
 * Run with: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

const sampleCategories = [
    {
        name: 'Namkeen',
        description: 'Authentic Indian savory snacks',
        icon: '🌶️',
        displayOrder: 1,
        showOnHome: true
    },
    {
        name: 'Sweets',
        description: 'Traditional Indian sweets and desserts',
        icon: '🍬',
        displayOrder: 2,
        showOnHome: true
    },
    {
        name: 'Chips & Crackers',
        description: 'Crispy and crunchy snack varieties',
        icon: '🍪',
        displayOrder: 3,
        showOnHome: true
    },
    {
        name: 'Dry Fruits & Nuts',
        description: 'Premium quality dry fruits and nuts',
        icon: '🥜',
        displayOrder: 4,
        showOnHome: true
    },
    {
        name: 'Combo Packs',
        description: 'Value packs and gift hampers',
        icon: '🎁',
        displayOrder: 5,
        showOnHome: true
    }
];

const sampleProducts = [
    // Namkeen Category
    {
        name: 'Classic Bhujia',
        description: 'Authentic Rajasthani bhujia made with premium besan and secret spices. Crispy, crunchy, and absolutely addictive. Perfect for tea-time snacking or as a party appetizer.',
        price: 120,
        category: 'Namkeen',
        image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400',
        weight: '400g',
        stock: 100
    },
    {
        name: 'Aloo Bhujia',
        description: 'Delicious potato-based bhujia with a perfect blend of spices. Light, crispy texture that melts in your mouth. A household favorite for generations.',
        price: 140,
        category: 'Namkeen',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
        weight: '400g',
        stock: 80
    },
    {
        name: 'Moong Dal',
        description: 'Crispy fried moong dal seasoned with rock salt and mild spices. A healthy snacking option that is both nutritious and delicious.',
        price: 100,
        category: 'Namkeen',
        image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400',
        weight: '250g',
        stock: 120
    },
    {
        name: 'Sev Mamra',
        description: 'Traditional sev mamra mix with puffed rice, sev, peanuts, and curry leaves. A light and flavorful snack perfect for any occasion.',
        price: 90,
        category: 'Namkeen',
        image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=400',
        weight: '300g',
        stock: 90
    },

    // Sweets Category
    {
        name: 'Besan Ladoo',
        description: 'Traditional besan ladoos made with pure ghee and garnished with almonds. Melt-in-mouth texture with authentic homemade taste.',
        price: 350,
        category: 'Sweets',
        image: 'https://images.unsplash.com/photo-1666190094745-9eb6a79a8e6a?w=400',
        weight: '500g',
        stock: 50
    },
    {
        name: 'Dry Fruit Chikki',
        description: 'Premium dry fruit chikki loaded with almonds, cashews, and pistachios. Made with organic jaggery for natural sweetness.',
        price: 280,
        category: 'Sweets',
        image: 'https://images.unsplash.com/photo-1605197161470-06b0e12c8904?w=400',
        weight: '400g',
        stock: 60
    },
    {
        name: 'Gajak',
        description: 'Winter special til gajak made with white sesame seeds and pure desi ghee. A nutritious and delicious traditional sweet.',
        price: 220,
        category: 'Sweets',
        image: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=400',
        weight: '500g',
        stock: 40
    },

    // Chips & Crackers Category
    {
        name: 'Masala Mathri',
        description: 'Flaky, crispy mathris with aromatic spices. Perfect accompaniment to tea or as a standalone snack. Made fresh with premium ingredients.',
        price: 110,
        category: 'Chips & Crackers',
        image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400',
        weight: '300g',
        stock: 70
    },
    {
        name: 'Khasta Kachori',
        description: 'Stuffed crispy kachoris with spiced moong dal filling. A classic North Indian snack that is loved by all ages.',
        price: 180,
        category: 'Chips & Crackers',
        image: 'https://images.unsplash.com/photo-1601050690117-94f5f7fa23c4?w=400',
        weight: '400g',
        stock: 45
    },
    {
        name: 'Chakli',
        description: 'Spiral-shaped crispy snack made with rice flour and aromatic spices. Crunchy texture with a hint of cumin flavor.',
        price: 130,
        category: 'Chips & Crackers',
        image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400',
        weight: '350g',
        stock: 85
    },

    // Dry Fruits & Nuts Category
    {
        name: 'Masala Cashews',
        description: 'Premium cashews roasted to perfection with a special blend of Indian spices. Crunchy, flavorful, and utterly irresistible.',
        price: 450,
        category: 'Dry Fruits & Nuts',
        image: 'https://images.unsplash.com/photo-1563292552-63f07e6b21ae?w=400',
        weight: '250g',
        stock: 35
    },
    {
        name: 'Spiced Almonds',
        description: 'California almonds with a tangy masala coating. A healthy snack option that does not compromise on taste.',
        price: 420,
        category: 'Dry Fruits & Nuts',
        image: 'https://images.unsplash.com/photo-1574570068495-5a8d9a72e5c9?w=400',
        weight: '250g',
        stock: 40
    },

    // Combo Packs Category
    {
        name: 'Festival Special Combo',
        description: 'Curated festive collection with assorted namkeens and sweets. Perfect gift pack for Diwali, Holi, and other celebrations.',
        price: 899,
        category: 'Combo Packs',
        image: 'https://images.unsplash.com/photo-1601050690117-94f5f7fa23c4?w=400',
        weight: '1.5kg',
        stock: 25
    },
    {
        name: 'Party Pack',
        description: 'Variety pack with 5 different namkeens perfect for parties and gatherings. Includes bhujia, sev, mixture, and more.',
        price: 599,
        category: 'Combo Packs',
        image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=400',
        weight: '1kg',
        stock: 30
    },
    {
        name: 'Family Pack',
        description: 'Value pack for the whole family with our bestselling namkeens. Great savings on bulk purchase.',
        price: 449,
        category: 'Combo Packs',
        image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400',
        weight: '800g',
        stock: 50
    }
];

const seedDatabase = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/brij-namkeen';
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Promise.all([
            Product.deleteMany({}),
            Category.deleteMany({})
        ]);
        console.log('🗑️ Cleared existing products and categories');

        // Insert categories
        await Category.insertMany(sampleCategories);
        console.log(`✅ Inserted ${sampleCategories.length} categories`);

        // Insert sample products
        const products = await Product.insertMany(sampleProducts);
        console.log(`✅ Inserted ${products.length} products`);

        mongoose.connection.close();
        console.log('✅ Database seeded successfully!');

    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedDatabase();
