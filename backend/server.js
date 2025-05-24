require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs'); 
const Product = require('./models/Product');
const Category = require('./models/Category'); 
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const User = require('./models/User');
const Advertisement = require('./models/Advertisement');
const Discount = require('./models/Discount');
const wishlistRoutes = require('./routes/wishlistRoutes');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const advertisementRoutes = require('./routes/advertisementRoutes');
const discountRoutes = require('./routes/discountRoutes');
const contactRoutes = require('./routes/contactRoutes');
const { protect, admin } = require('./middleware/authMiddleware');
const app = express();
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000', 
    credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const productStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsDir = path.join(__dirname, 'uploads/products');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir); 
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const uploadProduct = multer({ storage: productStorage });
const categoryStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsDir = path.join(__dirname, 'uploads/categories');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir); 
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const uploadCategory = multer({ storage: categoryStorage });
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/productsDB';
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected to:', MONGO_URI))
    .catch((error) => console.error('MongoDB connection error:', error));
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/contact', contactRoutes);
app.get('/api/products', async (req, res) => {
    try {
        const search = req.query.search || '';
        let query = {};

        if (search) {
            query.$or = [
                { 'name.en': { $regex: search, $options: 'i' } },
                { 'name.ar': { $regex: search, $options: 'i' } }
            ];
        }
        const products = await Product.find(query).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
app.post('/api/product', protect, admin, uploadProduct.single('image'), async (req, res) => {
    try {
        const { name_en, name_ar, price, description_en, description_ar, category } = req.body;
        let imagePath = '';
        if (req.file) {
            imagePath = path.join('/uploads/products', req.file.filename);
        }
        if (!name_en || name_en.trim() === "" || !name_ar || name_ar.trim() === "" || price === undefined || price === null || Number(price) < 0) {
            if (req.file) {
                const filePath = req.file.path; 
                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, (err) => {
                        if (err) console.error("Error deleting failed product upload:", err);
                    });
                }
            }
            return res.status(400).json({ message: 'Product English and Arabic names, and price are required' });
        }
        const newProduct = new Product({
            name: { en: name_en, ar: name_ar },
            price: Number(price),
            description: { en: description_en, ar: description_ar },
            image: imagePath,
            category
        });
        await newProduct.save();
        res.status(201).json(newProduct);

    } catch (error) {
        console.error('Error saving product:', error);
        if (req.file) {
            const filePath = req.file.path;
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) console.error("Error deleting failed product upload due to server error:", err);
                });
            }
        }
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
app.put('/api/product/:id', protect, admin, uploadProduct.single('image'), async (req, res) => {
    try {
        const productId = req.params.id;
        const { name_en, name_ar, price, description_en, description_ar, category } = req.body;
        const productToUpdate = await Product.findById(productId);
        if (!productToUpdate) {
            if (req.file) {
                const filePath = req.file.path;
                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, (err) => {
                        if (err) console.error("Error deleting failed product update upload:", err);
                    });
                }
            }
            return res.status(404).json({ message: "Product not found" });
        }
        if (!name_en || name_en.trim() === "" || !name_ar || name_ar.trim() === "" || price === undefined || price === null || Number(price) < 0) {
            if (req.file) {
                const filePath = req.file.path;
                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, (err) => {
                        if (err) console.error("Error deleting failed product update upload due to validation:", err);
                    });
                }
            }
            return res.status(400).json({ message: "Product English/Arabic names and a valid price are required." });
        }

        let updatedData = {
            name: { en: name_en, ar: name_ar },
            price: Number(price),
            description: { en: description_en, ar: description_ar },
            category
        };
        if (req.file) {
            if (productToUpdate.image && productToUpdate.image !== "") {
                const oldImagePath = path.join(__dirname, productToUpdate.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlink(oldImagePath, err => {
                        if (err) console.error("Error deleting old product image during update:", err);
                    });
                }
            }
            updatedData.image = path.join('/uploads/products', req.file.filename); 
        } else {
            updatedData.image = productToUpdate.image;
        }
        const updatedProduct = await Product.findByIdAndUpdate(productId, updatedData, { new: true, runValidators: true });
        if (!updatedProduct) {
            if (req.file) {
                const filePath = req.file.path;
                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, (err) => {
                        if (err) console.error("Error deleting file after product update failed to find product:", err);
                    });
                }
            }
            return res.status(404).json({ message: 'Product not found after update attempt' });
        }
       res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        if (req.file) {
            const filePath = req.file.path;
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) console.error("Error deleting failed product update upload due to server error:", err);
                });
            }
        }
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
app.delete('/api/product/:id', protect, admin, async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.image && product.image !== "") {
            const imagePath = path.join(__dirname, product.image); 
            if (fs.existsSync(imagePath)) { 
                fs.unlink(imagePath, (err) => {
                    if (err) console.error("Failed to delete product image during delete:", err);
                });
            }
        }

        await Product.findByIdAndDelete(productId);

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find().sort({ 'name.en': 1 });
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
app.post('/api/categories', protect, admin, uploadCategory.single('image'), async (req, res) => {
    try {
        const { name_en, name_ar, description_en, description_ar } = req.body;
        let imageUrl = '';

        if (req.file) {
            imageUrl = path.join('/uploads/categories', req.file.filename); 
        }

        if (!name_en || name_en.trim() === "" || !name_ar || name_ar.trim() === "") {
            if (req.file) {
                const filePath = req.file.path;
                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, (err) => {
                        if (err) console.error("Error deleting failed category upload (validation):", err);
                    });
                }
            }
            return res.status(400).json({ message: 'Category English and Arabic names are required.' });
        }

        const newCategory = new Category({
            name: { en: name_en, ar: name_ar },
            description: { en: description_en, ar: description_ar },
            imageUrl: imageUrl
        });

        await newCategory.save();
        res.status(201).json(newCategory);

    } catch (error) {
        console.error('Error creating category:', error);
        if (req.file) {
            const filePath = req.file.path;
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) console.error("Error deleting failed category upload (server error):", err);
                });
            }
        }
        if (error.code === 11000) {
            if (error.keyPattern && error.keyPattern['name.en']) {
                return res.status(400).json({ message: 'Category English name already exists.' });
            }
            if (error.keyPattern && error.keyPattern['name.ar']) {
                return res.status(400).json({ message: 'Category Arabic name already exists.' });
            }
            return res.status(400).json({ message: 'Category name must be unique.' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// PUT (Update) category by ID (with optional image upload)
app.put('/api/categories/:id', protect, admin, uploadCategory.single('image'), async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { name_en, name_ar, description_en, description_ar } = req.body;

        if (!name_en || name_en.trim() === "" || !name_ar || name_ar.trim() === "") {
            if (req.file) {
                const filePath = req.file.path;
                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, (err) => {
                        if (err) console.error("Error deleting failed category update upload (validation):", err);
                    });
                }
            }
            return res.status(400).json({ message: 'Category English and Arabic names are required.' });
        }

        const categoryToUpdate = await Category.findById(categoryId);
        if (!categoryToUpdate) {
            if (req.file) {
                const filePath = req.file.path;
                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, (err) => {
                        if (err) console.error("Error deleting file when category not found for update:", err);
                    });
                }
            }
            return res.status(404).json({ message: 'Category not found' });
        }

        let updatedData = {
            name: { en: name_en, ar: name_ar },
            description: { en: description_en, ar: description_ar }
        };

        if (req.file) {
            if (categoryToUpdate.imageUrl && categoryToUpdate.imageUrl !== "") {
                const oldImagePath = path.join(__dirname, categoryToUpdate.imageUrl);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlink(oldImagePath, err => {
                        if (err) console.error("Error deleting old category image during update:", err);
                    });
                }
            }
            updatedData.imageUrl = path.join('/uploads/categories', req.file.filename);
        } else {
            updatedData.imageUrl = categoryToUpdate.imageUrl;
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            updatedData,
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            if (req.file) {
                const filePath = req.file.path;
                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, (err) => {
                        if (err) console.error("Error deleting file after category update failed to find category:", err);
                    });
                }
            }
            return res.status(404).json({ message: 'Category not found after update attempt' });
        }

        res.status(200).json(updatedCategory);

    } catch (error) {
        console.error('Error updating category:', error);
        if (req.file) {
            const filePath = req.file.path;
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) console.error("Error deleting failed category update upload (server error):", err);
                });
            }
        }
        if (error.code === 11000) {
            if (error.keyPattern && error.keyPattern['name.en']) {
                return res.status(400).json({ message: 'Category English name already exists.' });
            }
            if (error.keyPattern && error.keyPattern['name.ar']) {
                return res.status(400).json({ message: 'Category Arabic name already exists.' });
            }
            return res.status(400).json({ message: 'Category name must be unique.' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
app.delete('/api/categories/:id', protect, admin, async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        if (category.imageUrl && category.imageUrl !== "") {
            const imagePath = path.join(__dirname, category.imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (err) => {
                    if (err) console.error("Failed to delete category image during delete:", err);
                });
            }
        }

        await Category.findByIdAndDelete(categoryId);

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
app.get('/api/dashboard/summary-stats', protect, admin, async (req, res) => {
    try {
        const totalSalesResult = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalPrice" },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments();

        const summaryStats = {
            totalRevenue: totalSalesResult.length > 0 ? totalSalesResult[0].totalRevenue : 0,
            totalOrders: totalSalesResult.length > 0 ? totalSalesResult[0].totalOrders : 0,
            totalProducts: totalProducts,
            totalUsers: totalUsers,
            averageOrderValue: totalSalesResult.length > 0 && totalSalesResult[0].totalOrders > 0
                ? totalSalesResult[0].totalRevenue / totalSalesResult[0].totalOrders
                : 0
        };

        res.status(200).json(summaryStats);
    } catch (error) {
        console.error('Error fetching summary stats for dashboard:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

app.get('/api/dashboard/sales-over-time', protect, admin, async (req, res) => {
    try {
        const salesData = await Order.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalRevenue: { $sum: "$totalPrice" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    revenue: "$totalRevenue",
                    orders: "$orderCount"
                }
            }
        ]);

        res.status(200).json(salesData);
    } catch (error) {
        console.error('Error fetching sales data for dashboard:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

app.get('/api/dashboard/product-sales', protect, admin, async (req, res) => {
    try {
        const productSalesData = await Order.aggregate([
            { $unwind: "$orderItems" },
            {
                $group: {
                    _id: "$orderItems.product",
                    totalQuantitySold: { $sum: "$orderItems.quantity" },
                    totalProductRevenue: { $sum: { $multiply: ["$orderItems.quantity", "$orderItems.price"] } }
                }
            },
            { $sort: { totalQuantitySold: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $project: {
                    _id: 0,
                    name: "$productDetails.name",
                    quantitySold: "$totalQuantitySold",
                    revenue: "$totalProductRevenue"
                }
            }
        ]);

        res.status(200).json(productSalesData);
    } catch (error) {
        console.error('Error fetching product sales data for dashboard:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

app.get('/api/dashboard/category-distribution', protect, admin, async (req, res) => {
    try {
        const categoryDistributionData = await Product.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    name: "$_id",
                    value: "$count"
                }
            }
        ]);

        res.status(200).json(categoryDistributionData);
    } catch (error) {
        console.error('Error fetching category distribution data for dashboard:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

app.get('/api/dashboard/order-status-distribution', protect, admin, async (req, res) => {
    try {
        const orderStatusData = await Order.aggregate([
            {
                $group: {
                    _id: {
                        $cond: {
                            if: "$isDelivered",
                            then: "Delivered",
                            else: {
                                $cond: {
                                    if: "$isPaid",
                                    then: "Paid (Not Delivered)",
                                    else: "Pending Payment"
                                }
                            }
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: "$_id",
                    count: "$count"
                }
            }
        ]);

        res.status(200).json(orderStatusData);
    } catch (error) {
        console.error('Error fetching order status distribution data for dashboard:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

app.get('/api/dashboard/user-registration-over-time', protect, admin, async (req, res) => {
    try {
        const registrationData = await User.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    users: "$count"
                }
            }
        ]);

        res.status(200).json(registrationData);
    } catch (error) {
        console.error('Error fetching user registration data for dashboard:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

app.get('/api/dashboard/recent-orders', protect, admin, async (req, res) => {
    try {
        const recentOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'name email'); 

        res.status(200).json(recentOrders);
    } catch (error) {
        console.error('Error fetching recent orders for dashboard:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
app.get('/api/hero-slides', async (req, res) => {
    try {
        const slides = await Advertisement.find({ type: 'slide', isActive: true }).sort({ order: 1 });
        res.status(200).json(slides.map(slide => ({
            _id: slide._id,
            title: slide.title,
            desc: slide.description, 
            image: slide.image,
            link: slide.link,
            price: 'Special Offer!'
        })));
    } catch (error) {
        console.error('Error fetching hero slides:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

app.get('/api/hero-side-offers', async (req, res) => {
    try {
        const iphoneOffer = await Advertisement.findOne({ type: 'sideOffer', isActive: true, 'title.en': { $regex: /iphone/i } }).sort({ order: 1 });
        const weeklyOffer = await Advertisement.findOne({ type: 'weeklyOffer', isActive: true }).sort({ order: 1 });

        const sideOffers = {};
        if (iphoneOffer) {
            sideOffers.iphoneOffer = {
                _id: iphoneOffer._id,
                productName: iphoneOffer.title, 
                image: iphoneOffer.image, 
                price: 'Installments Available!', 
                link: iphoneOffer.link
            };
        }
        if (weeklyOffer) {
            sideOffers.weeklyOffer = {
                _id: weeklyOffer._id,
                title: weeklyOffer.title,
                description: weeklyOffer.description, 
                link: weeklyOffer.link
            };
        }

        res.status(200).json(sideOffers);
    } catch (error) {
        console.error('Error fetching hero side offers:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});