require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const languageHandler = require('./middleware/languageHandler');
const productRoutes = require('./routes/product');
const categoryRoutes = require('./routes/category');
const wishlistRoutes = require('./routes/wishlistRoutes');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const advertisementRoutes = require('./routes/advertisementRoutes');
const discountRoutes = require('./routes/discountRoutes');
const contactRoutes = require('./routes/contactRoutes');
const { protect, admin } = require('./middleware/authMiddleware');

const Order = require('./models/Order');
const Product = require('./models/Product');
const User = require('./models/User');
const Advertisement = require('./models/Advertisement');

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(languageHandler);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/productsDB';
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected to:', MONGO_URI))
    .catch((error) => console.error('MongoDB connection error:', error));

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/contact', contactRoutes);

app.get('/api/dashboard/summary-stats', protect, admin, async (req, res) => { try { const totalSalesResult = await Order.aggregate([ { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" }, totalOrders: { $sum: 1 } } } ]); const totalProducts = await Product.countDocuments(); const totalUsers = await User.countDocuments(); const summaryStats = { totalRevenue: totalSalesResult.length > 0 ? totalSalesResult[0].totalRevenue : 0, totalOrders: totalSalesResult.length > 0 ? totalSalesResult[0].totalOrders : 0, totalProducts: totalProducts, totalUsers: totalUsers, averageOrderValue: totalSalesResult.length > 0 && totalSalesResult[0].totalOrders > 0 ? totalSalesResult[0].totalRevenue / totalSalesResult[0].totalOrders : 0 }; res.status(200).json(summaryStats); } catch (error) { res.status(500).json({ message: 'Internal Server Error', error: error.message }); } });
app.get('/api/dashboard/sales-over-time', protect, admin, async (req, res) => { try { const salesData = await Order.aggregate([ { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, totalRevenue: { $sum: "$totalPrice" }, orderCount: { $sum: 1 } } }, { $sort: { _id: 1 } }, { $project: { _id: 0, date: "$_id", revenue: "$totalRevenue", orders: "$orderCount" } } ]); res.status(200).json(salesData); } catch (error) { res.status(500).json({ message: 'Internal Server Error', error: error.message }); } });
app.get('/api/dashboard/product-sales', protect, admin, async (req, res) => { try { const productSalesData = await Order.aggregate([ { $unwind: "$orderItems" }, { $group: { _id: "$orderItems.product", totalQuantitySold: { $sum: "$orderItems.quantity" }, totalProductRevenue: { $sum: { $multiply: ["$orderItems.quantity", "$orderItems.price"] } } } }, { $sort: { totalQuantitySold: -1 } }, { $limit: 10 }, { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "productDetails" } }, { $unwind: "$productDetails" }, { $project: { _id: 0, name: "$productDetails.name", quantitySold: "$totalQuantitySold", revenue: "$totalProductRevenue" } } ]); res.status(200).json(productSalesData); } catch (error) { res.status(500).json({ message: 'Internal Server Error', error: error.message }); } });
app.get('/api/dashboard/category-distribution', protect, admin, async (req, res) => { try { const categoryDistributionData = await Product.aggregate([ { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryDetails' } }, { $unwind: '$categoryDetails' }, { $group: { _id: '$categoryDetails', count: { $sum: 1 } } }, { $project: { _id: 0, name: '$_id.name', value: '$count' } } ]); res.status(200).json(categoryDistributionData); } catch (error) { res.status(500).json({ message: 'Internal Server Error', error: error.message }); } });
app.get('/api/dashboard/order-status-distribution', protect, admin, async (req, res) => { try { const orderStatusData = await Order.aggregate([ { $group: { _id: { $cond: { if: "$isDelivered", then: "Delivered", else: { $cond: { if: "$isPaid", then: "Paid (Not Delivered)", else: "Pending Payment" } } } }, count: { $sum: 1 } } }, { $project: { _id: 0, status: "$_id", count: "$count" } } ]); res.status(200).json(orderStatusData); } catch (error) { res.status(500).json({ message: 'Internal Server Error', error: error.message }); } });
app.get('/api/dashboard/user-registration-over-time', protect, admin, async (req, res) => { try { const registrationData = await User.aggregate([ { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }, { $project: { _id: 0, date: "$_id", users: "$count" } } ]); res.status(200).json(registrationData); } catch (error) { res.status(500).json({ message: 'Internal Server Error', error: error.message }); } });
app.get('/api/dashboard/recent-orders', protect, admin, async (req, res) => { try { const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(10).populate('user', 'name email'); res.status(200).json(recentOrders); } catch (error) { res.status(500).json({ message: 'Internal Server Error', error: error.message }); } });
app.get('/api/hero-slides', async (req, res) => { try { const slides = await Advertisement.find({ type: 'slide', isActive: true }).sort({ order: 1 }); res.status(200).json(slides.map(slide => ({ _id: slide._id, title: slide.title, desc: slide.description, image: slide.image, link: slide.link, price: 'Special Offer!' }))); } catch (error) { res.status(500).json({ message: 'Internal Server Error', error: error.message }); } });
app.get('/api/hero-side-offers', async (req, res) => { try { const iphoneOffer = await Advertisement.findOne({ type: 'sideOffer', isActive: true, 'title.en': { $regex: /iphone/i } }).sort({ order: 1 }); const weeklyOffer = await Advertisement.findOne({ type: 'weeklyOffer', isActive: true }).sort({ order: 1 }); const sideOffers = {}; if (iphoneOffer) { sideOffers.iphoneOffer = { _id: iphoneOffer._id, productName: iphoneOffer.title, image: iphoneOffer.image, price: 'Installments Available!', link: iphoneOffer.link }; } if (weeklyOffer) { sideOffers.weeklyOffer = { _id: weeklyOffer._id, title: weeklyOffer.title, description: weeklyOffer.description, link: weeklyOffer.link }; } res.status(200).json(sideOffers); } catch (error) { res.status(500).json({ message: 'Internal Server Error', error: error.message }); } });

app.use((err, req, res, next) => { console.error("Unhandled error:", err.stack); res.status(500).send('Something broke!'); });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`Server running on http://localhost:${PORT}`); });