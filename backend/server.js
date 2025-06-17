require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs'); 

// استيراد الـ Models
const Product = require('./models/Product');
const Category = require('./models/Category'); 
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const User = require('./models/User');
const Advertisement = require('./models/Advertisement');
const Discount = require('./models/Discount');

// استيراد الـ Routes الأخرى
const wishlistRoutes = require('./routes/wishlistRoutes');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const advertisementRoutes = require('./routes/advertisementRoutes');
const discountRoutes = require('./routes/discountRoutes');
const contactRoutes = require('./routes/contactRoutes');

// استيراد الـ Middleware
const { protect, admin } = require('./middleware/authMiddleware');

const app = express();

// إعداد CORS
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000', 
    credentials: true 
}));

// إعداد تحليل طلبات الـ JSON والـ URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// خدمة ملفات الـ uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --------------------------------------------------------------------------------------
// Multer Storage for Products
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

// Helper function to delete files
const deleteFile = (filePath) => {
    if (!filePath || filePath.trim() === '') return; 

    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
        fs.unlink(fullPath, (err) => {
            if (err && err.code !== 'ENOENT') { 
                console.error(`Error deleting file: ${fullPath}`, err);
            } else if (!err) {
                console.log(`Successfully deleted old file: ${fullPath}`);
            }
        });
    } else {
        console.log(`File not found, skipping deletion: ${fullPath}`);
    }
};
// --------------------------------------------------------------------------------------

// Multer Storage for Categories
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

// الاتصال بقاعدة البيانات
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/productsDB';
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected to:', MONGO_URI))
    .catch((error) => console.error('MongoDB connection error:', error));

// مسارات الـ API الأخرى
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes); 
app.use('/api/orders', orderRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/contact', contactRoutes);

// --------------------------------------------------------------------------------------
// مسارات المنتجات - تم تعديل محتواها لتدعم الميزات الجديدة
// --------------------------------------------------------------------------------------

// GET /api/products - جلب جميع المنتجات (مع البحث)
app.get('/api/products', async (req, res) => {
    try {
        const search = req.query.search || '';
        let query = {};

        if (search) {
            query.$or = [
                { 'name.en': { $regex: search, $options: 'i' } },
                { 'name.ar': { $regex: search, $options: 'i' } },
                { 'description.en': { $regex: search, $options: 'i' } },
                { 'description.ar': { $regex: search, $options: 'i' } },
                { 'category': { $regex: search, $options: 'i' } },
                { 'subCategory': { $regex: search, $options: 'i' } },
                // إضافة البحث في الخصائص الديناميكية
                { 'attributes.brand': { $regex: search, $options: 'i' } },
                { 'attributes.processor': { $regex: search, $options: 'i' } },
                { 'attributes.material': { $regex: search, $options: 'i' } },
                // البحث في قيم الـ variations (optionName, optionValue)
                { 'variations.options.optionName': { $regex: search, $options: 'i' } }, 
                { 'variations.options.optionValue': { $regex: search, $options: 'i' } }, 
                { 'variations.sku': { $regex: search, $options: 'i' } }, 
            ];
        }
        const products = await Product.find(query).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// POST /api/product - إضافة منتج جديد
app.post('/api/product', protect, admin, uploadProduct.fields([
    { name: 'mainImage', maxCount: 1 },         
    { name: 'additionalImages', maxCount: 10 }, 
    { name: 'videos', maxCount: 3 },             
    { name: 'variantImages', maxCount: 50 }   // اسم جديد لصور الـ variants
]), async (req, res) => {
    try {
        const { name_en, name_ar, price, description_en, description_ar, category, subCategory, attributes: attributesString, variations: variationsString } = req.body;
        
        let attributes = {};
        if (attributesString) {
            try {
                attributes = JSON.parse(attributesString);
            } catch (parseErr) {
                console.error("Error parsing attributes JSON:", parseErr);
                return res.status(400).json({ message: "Invalid attributes format", error: parseErr.message });
            }
        }

        let variations = [];
        if (variationsString) {
            try {
                // Parse variations string to array of objects
                variations = JSON.parse(variationsString);
            } catch (parseErr) {
                console.error("Error parsing variations JSON:", parseErr);
                return res.status(400).json({ message: "Invalid variations format", error: parseErr.message });
            }
        }

        const mainImage = req.files.mainImage ? `/uploads/products/${req.files.mainImage[0].filename}` : '';
        const additionalImages = req.files.additionalImages ? req.files.additionalImages.map(file => `/uploads/products/${file.filename}`) : [];
        const videos = req.files.videos ? req.files.videos.map(file => `/uploads/products/${file.filename}`) : [];
        
        // معالجة صور الـ variants المرفوعة (هنا req.files.variantImages ستكون مصفوفة)
        const uploadedVariantImages = req.files.variantImages || []; 

        // ربط الصور المرفوعة بالـ variants الصحيحة
        const finalVariations = variations.map((variantData, index) => {
            // نستخدم tempFileIndex الذي أرسلناه من الـ frontend لربط الصورة
            const fileForThisVariant = uploadedVariantImages[variantData.tempFileIndex]; 
            if (variantData.tempFileIndex !== undefined && fileForThisVariant) {
                return {
                    ...variantData,
                    image: `/uploads/products/${fileForThisVariant.filename}` // تعيين مسار الصورة الجديدة
                };
            }
            // إذا لم يتم رفع ملف جديد لهذا الـ variant، احتفظ بالصورة الموجودة أو اتركها null
            return { ...variantData, image: variantData.image || null }; 
        });

        // التحقق الأساسي من الحقول المطلوبة
        if (!name_en || name_en.trim() === "" || !name_ar || name_ar.trim() === "" || price === undefined || price === null || Number(price) < 0) {
            // حذف جميع الملفات التي تم رفعها إذا فشل التحقق
            deleteFile(mainImage);
            additionalImages.forEach(deleteFile);
            videos.forEach(deleteFile);
            uploadedVariantImages.forEach(file => deleteFile(`/uploads/products/${file.filename}`));
            return res.status(400).json({ message: 'Product English and Arabic names, and price are required.' });
        }

        // تحقق من الـ variations: كل variant يجب أن يحتوي على خيارات
        if (finalVariations.length > 0) {
            for (const variant of finalVariations) {
                if (!variant.options || variant.options.length === 0) {
                    // حذف جميع الملفات التي تم رفعها
                    deleteFile(mainImage);
                    additionalImages.forEach(deleteFile);
                    videos.forEach(deleteFile);
                    uploadedVariantImages.forEach(file => deleteFile(`/uploads/products/${file.filename}`));
                    return res.status(400).json({ message: 'Each product variant must have at least one option.' });
                }
                for (const option of variant.options) {
                    if (!option.optionName || !option.optionValue) {
                         // حذف جميع الملفات التي تم رفعها
                        deleteFile(mainImage);
                        additionalImages.forEach(deleteFile);
                        videos.forEach(deleteFile);
                        uploadedVariantImages.forEach(file => deleteFile(`/uploads/products/${file.filename}`));
                        return res.status(400).json({ message: 'All variant options must have a name and value.' });
                    }
                }
            }
        }


        const newProduct = new Product({
            name: { en: name_en, ar: name_ar },
            price: Number(price),
            description: { en: description_en, ar: description_ar },
            mainImage: mainImage,
            additionalImages: additionalImages,
            videos: videos,
            category: category,
            subCategory: subCategory,
            attributes: attributes,
            variations: finalVariations, // حفظ الـ variations المعالجة
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);

    } catch (error) {
        console.error('Error saving product:', error);
        // حذف جميع الملفات التي تم رفعها في حالة حدوث خطأ في السيرفر
        if (req.files) {
            if (req.files.mainImage) deleteFile(`/uploads/products/${req.files.mainImage[0].filename}`);
            if (req.files.additionalImages) req.files.additionalImages.map(file => `/uploads/products/${file.filename}`).forEach(deleteFile);
            if (req.files.videos) req.files.videos.map(file => `/uploads/products/${file.filename}`).forEach(deleteFile);
            if (req.files.variantImages) req.files.variantImages.forEach(file => deleteFile(`/uploads/products/${file.filename}`)); // Iterate directly on array
        }
        if (error.code === 11000) { // خطأ تكرار (مثلاً لـ SKU إذا كان فريداً)
            return res.status(400).json({ message: 'Duplicate value detected. Please check unique fields like SKU.', error: error.message });
        }
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// GET /api/products/:id - جلب منتج بواسطة الـ ID
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

// PUT /api/product/:id - تحديث منتج
app.put('/api/product/:id', protect, admin, uploadProduct.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 10 },
    { name: 'videos', maxCount: 3 },
    { name: 'variantImages', maxCount: 50 } // لصور الـ variants الجديدة أو المحدثة
]), async (req, res) => {
    try {
        const productId = req.params.id;
        const { 
            name_en, name_ar, price, description_en, description_ar, 
            category, subCategory, 
            attributes: attributesString, 
            variations: variationsString, // مصفوفة الـ variations المحدثة (مع _id للموجودة)
            existingImages, existingVideos, clearMainImage
        } = req.body;

        const productToUpdate = await Product.findById(productId);
        if (!productToUpdate) {
            // حذف أي ملفات تم رفعها إذا لم يتم العثور على المنتج
            if (req.files) {
                if (req.files.mainImage) deleteFile(`/uploads/products/${req.files.mainImage[0].filename}`);
                if (req.files.additionalImages) req.files.additionalImages.map(file => `/uploads/products/${file.filename}`).forEach(deleteFile);
                if (req.files.videos) req.files.videos.map(file => `/uploads/products/${file.filename}`).forEach(deleteFile);
                if (req.files.variantImages) req.files.variantImages.forEach(file => deleteFile(`/uploads/products/${file.filename}`));
            }
            return res.status(404).json({ message: "Product not found" });
        }

        // التحقق الأساسي من الحقول المطلوبة
        if (!name_en || name_en.trim() === "" || !name_ar || name_ar.trim() === "" || price === undefined || price === null || Number(price) < 0) {
            // حذف أي ملفات تم رفعها إذا فشل التحقق
            if (req.files) {
                if (req.files.mainImage) deleteFile(`/uploads/products/${req.files.mainImage[0].filename}`);
                if (req.files.additionalImages) req.files.additionalImages.map(file => `/uploads/products/${file.filename}`).forEach(deleteFile);
                if (req.files.videos) req.files.videos.map(file => `/uploads/products/${file.filename}`).forEach(deleteFile);
                if (req.files.variantImages) req.files.variantImages.forEach(file => deleteFile(`/uploads/products/${file.filename}`));
            }
            return res.status(400).json({ message: "Product English/Arabic names and a valid price are required." });
        }

        let attributes = {};
        if (attributesString) {
            try {
                attributes = JSON.parse(attributesString);
            } catch (parseErr) {
                console.error("Error parsing attributes JSON:", parseErr);
                return res.status(400).json({ message: "Invalid attributes format", error: parseErr.message });
            }
        }

        let newVariationsData = [];
        if (variationsString) {
            try {
                newVariationsData = JSON.parse(variationsString);
            } catch (parseErr) {
                console.error("Error parsing variations JSON:", parseErr);
                return res.status(400).json({ message: "Invalid variations format", error: parseErr.message });
            }
        }

        // تحقق من الـ variations: كل variant يجب أن يحتوي على خيارات
        if (newVariationsData.length > 0) {
            for (const variant of newVariationsData) {
                if (!variant.options || variant.options.length === 0) {
                    // حذف جميع الملفات التي تم رفعها
                    if (req.files) {
                        if (req.files.mainImage) deleteFile(`/uploads/products/${req.files.mainImage[0].filename}`);
                        if (req.files.additionalImages) req.files.additionalImages.map(file => `/uploads/products/${file.filename}`).forEach(deleteFile);
                        if (req.files.videos) req.files.videos.map(file => `/uploads/products/${file.filename}`).forEach(deleteFile);
                        if (req.files.variantImages) req.files.variantImages.forEach(file => deleteFile(`/uploads/products/${file.filename}`));
                    }
                    return res.status(400).json({ message: 'Each product variant must have at least one option.' });
                }
                for (const option of variant.options) {
                    if (!option.optionName || !option.optionValue) {
                         // حذف جميع الملفات التي تم رفعها
                        if (req.files) {
                            if (req.files.mainImage) deleteFile(`/uploads/products/${req.files.mainImage[0].filename}`);
                            if (req.files.additionalImages) req.files.additionalImages.map(file => `/uploads/products/${file.filename}`).forEach(deleteFile);
                            if (req.files.videos) req.files.videos.map(file => `/uploads/products/${file.filename}`).forEach(deleteFile);
                            if (req.files.variantImages) req.files.variantImages.forEach(file => deleteFile(`/uploads/products/${file.filename}`));
                        }
                        return res.status(400).json({ message: 'All variant options must have a name and value.' });
                    }
                }
            }
        }

        const uploadedVariantImages = req.files.variantImages || []; // هذا سيكون مصفوفة من الملفات

        // منطق معالجة صور الـ variants وتحديد مصفوفة الـ variations النهائية
        const finalVariations = [];
        const oldVariantImagesToDelete = []; // لتتبع صور الـ variants المحذوفة أو التي تم استبدالها

        // الخطوة 1: معالجة الـ variants الموجودة مسبقاً وتحديد ما تم حذفه أو استبدال صورته
        productToUpdate.variations.forEach(oldVariant => {
            // ابحث عن الـ variant المقابل في البيانات الجديدة المرسلة من الواجهة الأمامية
            const correspondingNewVariant = newVariationsData.find(newV => 
                String(newV._id) === String(oldVariant._id) // المطابقة بواسطة _id
            );

            if (!correspondingNewVariant) {
                // هذا الـ variant القديم تم حذفه، قم بتمييز صورته للحذف
                if (oldVariant.image) {
                    oldVariantImagesToDelete.push(oldVariant.image);
                }
            } else {
                // هذا الـ variant ما زال موجوداً. تحقق مما إذا كان يتم استبدال صورته أو مسحها.
                // نستخدم tempFileIndex الذي أرسلناه من الـ frontend لربط الصورة
                const fileForThisVariant = uploadedVariantImages[correspondingNewVariant.tempFileIndex]; 
                
                if (correspondingNewVariant.tempFileIndex !== undefined && fileForThisVariant) { // Check if new file was sent
                    // تم رفع صورة جديدة لهذا الـ variant الموجود، قم بحذف الصورة القديمة
                    if (oldVariant.image) {
                        oldVariantImagesToDelete.push(oldVariant.image);
                    }
                    // قم بتعيين مسار الصورة الجديدة للـ variant المقابل في البيانات الجديدة
                    correspondingNewVariant.image = `/uploads/products/${fileForThisVariant.filename}`;
                } else if (correspondingNewVariant.image === null || correspondingNewVariant.image === '') {
                    // الواجهة الأمامية طلبت صراحةً مسح صورة هذا الـ variant
                    if (oldVariant.image) {
                        oldVariantImagesToDelete.push(oldVariant.image);
                    }
                    correspondingNewVariant.image = ''; // مسح مسار الصورة
                } else {
                    // لا توجد صورة جديدة، ولم يتم طلب مسحها صراحةً، لذا احتفظ بمسار الصورة القديمة
                    correspondingNewVariant.image = oldVariant.image;
                }
            }
        });

        // الخطوة 2: الآن، أضف جميع بيانات الـ newVariationsData المعالجة إلى finalVariations.
        // هذا يشمل الـ variants الموجودة التي تم تحديث صورها/بياناتها، والـ variants الجديدة كلياً.
        newVariationsData.forEach((variant) => {
            finalVariations.push({
                _id: variant._id, // الاحتفاظ بـ _id للـ variants الموجودة
                options: variant.options,
                image: variant.image,
                priceAdjustment: variant.priceAdjustment,
                stock: variant.stock,
                sku: variant.sku
            });
        });

        // تنفيذ عمليات حذف صور الـ variants القديمة
        oldVariantImagesToDelete.forEach(deleteFile);


        let updatedData = {
            name: { en: name_en, ar: name_ar },
            price: Number(price),
            description: { en: description_en, ar: description_ar },
            category: category,
            subCategory: subCategory,
            attributes: attributes,
            variations: finalVariations, // حفظ الـ variations المحدثة/الجديدة
        };

        // التعامل مع الصورة الرئيسية (نفس المنطق السابق)
        if (req.files.mainImage && req.files.mainImage.length > 0) {
            deleteFile(productToUpdate.mainImage); 
            updatedData.mainImage = `/uploads/products/${req.files.mainImage[0].filename}`;
        } else if (clearMainImage === 'true') {
            deleteFile(productToUpdate.mainImage);
            updatedData.mainImage = '';
        } else {
            updatedData.mainImage = productToUpdate.mainImage;
        }

        // التعامل مع الصور الإضافية (نفس المنطق السابق)
        let currentExistingImages = Array.isArray(existingImages) ? existingImages : (existingImages ? [existingImages] : []);
        productToUpdate.additionalImages.forEach(imgUrl => {
            if (!currentExistingImages.includes(imgUrl)) {
                deleteFile(imgUrl); 
            }
        });
        const newAdditionalImages = req.files.additionalImages ? req.files.additionalImages.map(file => `/uploads/products/${file.filename}`) : [];
        updatedData.additionalImages = [...currentExistingImages, ...newAdditionalImages];

        // التعامل مع الفيديوهات (نفس المنطق السابق)
        let currentExistingVideos = Array.isArray(existingVideos) ? existingVideos : (existingVideos ? [existingVideos] : []);
        productToUpdate.videos.forEach(videoUrl => {
            if (!currentExistingVideos.includes(videoUrl)) {
                deleteFile(videoUrl); 
            }
        });
        const newVideos = req.files.videos ? req.files.videos.map(file => `/uploads/products/${file.filename}`) : [];
        updatedData.videos = [...currentExistingVideos, ...newVideos];


        const updatedProduct = await Product.findByIdAndUpdate(productId, updatedData, { new: true, runValidators: true });
        
        if (!updatedProduct) {
            // حذف أي ملفات تم رفعها إذا لم يتم العثور على المنتج بعد محاولة التحديث
            if (req.files) {
                if (req.files.mainImage) deleteFile(`/uploads/products/${req.files.mainImage[0].filename}`);
                if (req.files.additionalImages) req.files.additionalImages.map(file => `/uploads/products/${file.filename}`).forEach(deleteFile);
                if (req.files.videos) req.files.videos.map(file => `/uploads/products/${file.filename}`).forEach(deleteFile);
                if (req.files.variantImages) req.files.variantImages.forEach(file => deleteFile(`/uploads/products/${file.filename}`));
            }
            return res.status(404).json({ message: 'Product not found after update attempt' });
        }
       res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        // حذف أي ملفات تم رفعها في حالة حدوث خطأ في السيرفر
        if (req.files) {
            if (req.files.mainImage) deleteFile(`/uploads/products/${req.files.mainImage[0].filename}`);
            if (req.files.additionalImages) req.files.additionalImages.map(file => `/uploads/products/${file.filename}`).forEach(deleteFile);
            if (req.files.videos) req.files.videos.map(file => `/uploads/products/${file.filename}`).forEach(deleteFile);
            if (req.files.variantImages) req.files.variantImages.forEach(file => deleteFile(`/uploads/products/${file.filename}`));
        }
        if (error.code === 11000) { // خطأ تكرار
            return res.status(400).json({ message: 'Duplicate value detected. Please check unique fields like SKU.', error: error.message });
        }
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// DELETE /api/product/:id - حذف منتج
app.delete('/api/product/:id', protect, admin, async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // حذف جميع الملفات المرتبطة بالمنتج من السيرفر
        deleteFile(product.mainImage);
        product.additionalImages.forEach(deleteFile);
        product.videos.forEach(deleteFile);
        product.variations.forEach(v => deleteFile(v.image)); // حذف صور الـ variants

        await Product.findByIdAndDelete(productId);

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
// --------------------------------------------------------------------------------------

// مسارات الفئات (كما هي - لن يتم تغييرها)
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

// مسارات الداشبورد (كما هي - لن يتم تغييرها)
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

// مسارات Hero Section (كما هي - لن يتم تغييرها)
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

// Middlewares for error handling (كما هي - لن يتم تغييرها)
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});