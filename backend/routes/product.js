const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Advertisement = require('../models/Advertisement'); // Import Advertisement model
const Category = require('../models/Category');
const { protect, admin } = require('../middleware/authMiddleware');

// --- إعدادات رفع الملفات ---
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'products');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage }).any();

const deleteFile = (filePath) => {
    if (!filePath) return;
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
        fs.unlink(fullPath, (err) => {
            if (err) console.error(`Error deleting file: ${fullPath}`, err);
        });
    }
};

// --- دالة الترجمة (مهمة للمسارات العامة) ---
const translateDoc = (doc, lang, fields) => {
    if (!doc || !lang || !fields) return doc;
    const translated = { ...doc };

    fields.forEach(fieldPath => {
        const keys = fieldPath.split('.');
        let currentDoc = doc;
        let currentTranslated = translated;

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (!currentDoc || !currentDoc[key]) {
                currentDoc = null;
                break;
            }

            if (i === keys.length - 1) {
                if (typeof currentDoc[key] === 'object' && currentDoc[key] !== null) {
                    currentTranslated[key] = currentDoc[key][lang] || currentDoc[key].en;
                }
            } else {
                currentDoc = currentDoc[key];
                currentTranslated = currentTranslated[key];
            }
        }
    });

    return translated;
};

// @desc    Get all products for admin panel (raw data, no translation, no ad attachment)
// @route   GET /api/products/admin-list
// @access  Private/Admin
router.get('/admin-list', protect, admin, async (req, res) => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 }).lean();
        res.json(products);
    } catch (error) {
        console.error('Error fetching admin product list:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// @desc    Get all products for public users (with translation and attached active advertisement)
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Assuming req.language is set by a middleware (e.g., based on Accept-Language header)
        const lang = req.language;
        const now = new Date();

        // 1. Fetch all products and populate category
        const allProducts = await Product.find({}).populate('category').sort({ createdAt: -1 }).lean();

        // 2. Fetch all valid and active advertisements linked to products
        const validAds = await Advertisement.find({
            isActive: true,
            productRef: { $ne: null }, // Only ads linked to a product
            $and: [ // Check if the current date is within the ad's start/end dates
                { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
                { $or: [{ endDate: null }, { endDate: { $gte: now } }] }
            ]
        }).lean();

        // Create a map for quick lookup of advertisements by product ID
        const adsMap = new Map();
        for (const ad of validAds) {
            adsMap.set(ad.productRef.toString(), ad);
        }

        // 3. Attach active advertisement to each product and apply translation
        const finalProducts = allProducts.map(product => {
            let productWithAd = { ...product }; // Create a mutable copy

            // If an active ad exists for this product, attach it
            if (adsMap.has(product._id.toString())) {
                productWithAd.advertisement = adsMap.get(product._id.toString());
            }

            // Apply translation to the product and potentially the attached advertisement
            return translateDoc(productWithAd, lang, [
                'name',
                'description',
                'category.name',
                'advertisement.title', // Translate ad title if it exists
                'advertisement.description' // Translate ad description if it exists
            ]);
        });

        res.json(finalProducts);

    } catch (error) {
        console.error('Error in GET /products:', error);
        res.status(500).json({ message: 'Server error while fetching products.' });
    }
});

// @desc    Get single product by ID for public users (with translation and attached active advertisement)
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const lang = req.language;
        const now = new Date();

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Product not found (Invalid ID).' });
        }

        // 1. Fetch the product
        const product = await Product.findById(req.params.id)
            .populate('category')
            .populate('reviews.user', 'name') // Populate user name for reviews
            .lean();

        if (!product) return res.status(404).json({ message: 'Product not found.' });

        // 2. Find any active advertisement specifically for this product
        const activeAd = await Advertisement.findOne({
            isActive: true,
            productRef: product._id,
            $and: [ // Check if the current date is within the ad's start/end dates
                { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
                { $or: [{ endDate: null }, { endDate: { $gte: now } }] }
            ]
        }).lean();

        let finalProduct = { ...product }; // Create a mutable copy
        // 3. Attach the active advertisement if found
        if (activeAd) {
            finalProduct.advertisement = activeAd;
        }

        // 4. Apply translation to the product and potentially the attached advertisement
        const translatedProduct = translateDoc(finalProduct, lang, [
            'name',
            'description',
            'category.name',
            'advertisement.title',
            'advertisement.description'
        ]);

        res.json(translatedProduct);

    } catch (error) {
        console.error(`Error in GET /products/${req.params.id}:`, error);
        res.status(500).json({ message: 'Server error while fetching product.' });
    }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, upload, async (req, res) => {
    try {
        const {
            name_en, name_ar, description_en, description_ar, basePrice, category,
            subCategory,
            attributes, variations
        } = req.body;
        const newProductData = {
            name: { en: name_en, ar: name_ar },
            description: { en: description_en || '', ar: description_ar || '' },
            basePrice,
            category,
            subCategory: subCategory || null,
            attributes: attributes ? JSON.parse(attributes) : [],
            variations: variations ? JSON.parse(variations) : [],
        };
        const mainImage = req.files.find(f => f.fieldname === 'mainImage');
        if (mainImage) newProductData.mainImage = `/uploads/products/${mainImage.filename}`;
        if (newProductData.variations) {
            newProductData.variations.forEach((v, vIndex) => {
                if (v.options) v.options.forEach((o, oIndex) => {
                    const imageFile = req.files.find(f => f.fieldname === `variationImage_${vIndex}_${oIndex}`);
                    if (imageFile) o.image = `/uploads/products/${imageFile.filename}`;
                    delete o.imagePlaceholder; // Clean up any temporary frontend fields
                });
            });
        }
        const product = new Product(newProductData);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        if (req.files) req.files.forEach(f => deleteFile(`/uploads/products/${f.filename}`));
        console.error('Error creating product:', error);
        res.status(400).json({ message: 'Error creating product.', error: error.message });
    }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, upload, async (req, res) => {
    try {
        const productToUpdate = await Product.findById(req.params.id);
        if (!productToUpdate) return res.status(404).json({ message: 'Product not found.' });

        const {
            name_en, name_ar, description_en, description_ar, basePrice, category,
            subCategory,
            attributes, variations, clearMainImage
        } = req.body;

        // Update basic product fields
        productToUpdate.name = { en: name_en, ar: name_ar };
        productToUpdate.description = { en: description_en || '', ar: description_ar || '' };
        productToUpdate.basePrice = basePrice;
        productToUpdate.category = category;
        productToUpdate.subCategory = subCategory || null;
        productToUpdate.attributes = attributes ? JSON.parse(attributes) : [];

        // Handle main image update
        const mainImageFile = req.files.find(f => f.fieldname === 'mainImage');
        if (mainImageFile) {
            deleteFile(productToUpdate.mainImage); // Delete old main image
            productToUpdate.mainImage = `/uploads/products/${mainImageFile.filename}`;
        } else if (clearMainImage === 'true') {
            deleteFile(productToUpdate.mainImage); // Clear and delete main image
            productToUpdate.mainImage = null;
        }

        // Handle variations and their images
        const incomingVariations = variations ? JSON.parse(variations) : [];
        const incomingOptionIds = new Set(incomingVariations.flatMap(v => v.options.map(o => o._id).filter(Boolean)));

        // Delete images for removed variation options
        productToUpdate.variations.forEach(oldVar => {
            oldVar.options.forEach(oldOpt => {
                if (!incomingOptionIds.has(oldOpt._id.toString()) && oldOpt.image) {
                    deleteFile(oldOpt.image);
                }
            });
        });

        // Update incoming variations and handle new/updated option images
        if (incomingVariations) {
            incomingVariations.forEach((iVar, vIndex) => {
                if(iVar.options) iVar.options.forEach((iOpt, oIndex) => {
                    const imageFile = req.files.find(f => f.fieldname === `variationImage_${vIndex}_${oIndex}`);
                    if (imageFile) {
                        // If new image is uploaded, delete old one if it exists
                        const oldVar = productToUpdate.variations.find(v => v._id && v._id.toString() === iVar._id);
                        if (oldVar) {
                            const oldOpt = oldVar.options.find(o => o._id && o._id.toString() === iOpt._id);
                            if(oldOpt && oldOpt.image) deleteFile(oldOpt.image);
                        }
                        iOpt.image = `/uploads/products/${imageFile.filename}`;
                    }
                    delete iOpt.imagePlaceholder; // Clean up temporary frontend field
                });
            });
        }
        productToUpdate.variations = incomingVariations;
        productToUpdate.markModified('variations'); // Essential to tell Mongoose that nested array has changed

        const updatedProduct = await productToUpdate.save();
        res.json(updatedProduct);
    } catch (error) {
        if (req.files) req.files.forEach(f => deleteFile(`/uploads/products/${f.filename}`)); // Clean up uploaded files on error
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Error updating product.', error: error.message });
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const productToDelete = await Product.findById(req.params.id);
        if (!productToDelete) return res.status(404).json({ message: 'Product not found.' });

        // Delete main image
        deleteFile(productToDelete.mainImage);

        // Delete all variation option images
        productToDelete.variations.forEach(v => v.options.forEach(o => {
            if (o.image) deleteFile(o.image);
        }));

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully.' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Server error while deleting product.' });
    }
});

// @desc    Add a review to a product
// @route   POST /api/products/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
    const { rating, comment } = req.body;
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Check if user already reviewed
        const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
        if (alreadyReviewed) return res.status(400).json({ message: 'Product already reviewed' });

        const review = { name: req.user.name, rating: Number(rating), comment, user: req.user._id };
        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.averageRating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

        await product.save();
        res.status(201).json({ message: 'Review added' });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Server error while creating review.' });
    }
});

module.exports = router;