// ========================================================
//     Server Main File (server.js)
// ========================================================

// 1. Import Dependencies
// --------------------------------------------------------
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

// 2. Import Custom Middleware
// --------------------------------------------------------
const languageHandler = require('./middleware/languageHandler');
const { protect, admin } = require('./middleware/authMiddleware');

// 3. Import Route Handlers
// (Please verify these filenames match your actual files in the 'routes' folder)
// --------------------------------------------------------
const productRoutes = require('./routes/product');
const categoryRoutes = require('./routes/category');
const advertisementRoutes = require('./routes/advertisementRoutes');
const discountRoutes = require('./routes/discountRoutes');
const authRoutes = require('./routes/auth');
const wishlistRoutes = require('./routes/wishlistRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const contactRoutes = require('./routes/contactRoutes');

// 4. Import Mongoose Models for Dashboard
// --------------------------------------------------------
const Order = require('./models/Order');
const Product = require('./models/Product');
const User = require('./models/User');

// 5. Initialize Express App
// --------------------------------------------------------
const app = express();

// 6. Core Middleware Setup
// --------------------------------------------------------
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-request', 'accept-language']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (e.g., images) from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 7. Database Connection
// --------------------------------------------------------
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/productsDB';
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB connected successfully.'))
    .catch((error) => console.error('❌ MongoDB connection error:', error));

// 8. API Routes Setup
// --------------------------------------------------------
// Apply the language handler middleware ONLY to API routes to avoid running it on static files.
app.use('/api', languageHandler);

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);

// ========================================================
//     Dashboard-specific API Routes
// ========================================================

// Summary Statistics
app.get('/api/dashboard/summary-stats', protect, admin, async (req, res) => {
    try {
        const totalSalesResult = await Order.aggregate([{ $group: { _id: null, totalRevenue: { $sum: "$totalPrice" }, totalOrders: { $sum: 1 } } }]);
        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments();
        const summaryStats = {
            totalRevenue: totalSalesResult[0]?.totalRevenue || 0,
            totalOrders: totalSalesResult[0]?.totalOrders || 0,
            totalProducts,
            totalUsers,
            averageOrderValue: (totalSalesResult[0]?.totalOrders > 0) ? totalSalesResult[0].totalRevenue / totalSalesResult[0].totalOrders : 0
        };
        res.status(200).json(summaryStats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching summary stats', error: error.message });
    }
});

// Sales Over Time
app.get('/api/dashboard/sales-over-time', protect, admin, async (req, res) => {
    try {
        const salesData = await Order.aggregate([
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, totalRevenue: { $sum: "$totalPrice" }, orderCount: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: "$_id", revenue: "$totalRevenue", orders: "$orderCount" } }
        ]);
        res.status(200).json(salesData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sales data', error: error.message });
    }
});

// Top Selling Products
app.get('/api/dashboard/product-sales', protect, admin, async (req, res) => {
    try {
        const productSalesData = await Order.aggregate([
            { $unwind: "$orderItems" },
            { $group: { _id: "$orderItems.product", totalQuantitySold: { $sum: "$orderItems.quantity" } } },
            { $sort: { totalQuantitySold: -1 } },
            { $limit: 5 },
            { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "productDetails" } },
            { $unwind: "$productDetails" },
            { $project: { _id: 0, name: "$productDetails.name", quantitySold: "$totalQuantitySold" } }
        ]);
        res.status(200).json(productSalesData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product sales data', error: error.message });
    }
});

// Category Distribution
app.get('/api/dashboard/category-distribution', protect, admin, async (req, res) => {
    try {
        const categoryDistributionData = await Product.aggregate([
            { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryDetails' } },
            { $unwind: '$categoryDetails' },
            { $group: { _id: '$categoryDetails.name', count: { $sum: 1 } } },
            { $project: { _id: 0, name: '$_id', value: '$count' } }
        ]);
        res.status(200).json(categoryDistributionData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching category distribution', error: error.message });
    }
});

// Order Status Distribution
app.get('/api/dashboard/order-status-distribution', protect, admin, async (req, res) => {
    try {
        const orderStatusData = await Order.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $project: { _id: 0, status: "$_id", count: "$count" } }
        ]);
        res.status(200).json(orderStatusData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order status distribution', error: error.message });
    }
});

// Recent Orders
app.get('/api/dashboard/recent-orders', protect, admin, async (req, res) => {
    try {
        const recentOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email');
        res.status(200).json(recentOrders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recent orders', error: error.message });
    }
});

// 9. Global Error Handling Middleware
// --------------------------------------------------------
app.use((err, req, res, next) => {
    console.error("❌ Unhandled Error:", err.stack);
    res.status(500).send('Something broke!');
});

// 10. Start Server
// --------------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});