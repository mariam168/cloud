const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const Advertisement = require('../models/Advertisement');
const Category = require('../models/Category'); 
const { protect, admin } = require('../middleware/authMiddleware');

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

router.get('/', async (req, res) => {
    try {
        const keyword = req.query.search;
        const query = {};

        if (keyword) {
            const searchRegex = new RegExp(keyword, 'i');
            query.$or = [
                { 'name.en': { $regex: searchRegex } },
                { 'name.ar': { $regex: searchRegex } }
            ];
        }
        const products = await Product.find({ ...query })
            .populate('category')
            .sort({ createdAt: -1 })
            .lean();

        const activeAds = await Advertisement.find({
            isActive: true,
            productRef: { $in: products.map(p => p._id) },
            startDate: { $lte: new Date() },
            $or: [{ endDate: { $gte: new Date() } }, { endDate: null }]
        }).lean();

        const adsMap = new Map(activeAds.map(ad => [ad.productRef.toString(), ad]));

        const productsWithAdData = products.map(product => {
            const relatedAd = adsMap.get(product._id.toString());
            if (relatedAd) {
                return { 
                    ...product, 
                    advertisement: {
                        discountedPrice: relatedAd.discountedPrice,
                        originalPrice: relatedAd.originalPrice,
                        currency: relatedAd.currency,
                    } 
                };
            }
            return product;
        });

        res.json(productsWithAdData);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error while fetching products.' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category') 
            .populate('reviews.user', 'name')
            .lean();

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        
        const activeAd = await Advertisement.findOne({
            isActive: true,
            productRef: product._id,
            startDate: { $lte: new Date() },
            $or: [{ endDate: { $gte: new Date() } }, { endDate: null }]
        }).lean();

        if (activeAd) {
            product.advertisement = activeAd;
        }

        res.json(product);
        
    } catch (error) {
        console.error(`Error fetching product ${req.params.id}:`, error);
        res.status(500).json({ message: 'Server error while fetching product.' });
    }
});

router.post('/', protect, admin, upload, async (req, res) => {
    try {
        const {
            name_en, name_ar, description_en, description_ar, basePrice, category,
            subCategory, 
            attributes, variations
        } = req.body;
        if (subCategory) {
            const parentCategory = await Category.findById(category);
            if (!parentCategory || !parentCategory.subCategories.id(subCategory)) {
                if (req.files) req.files.forEach(f => deleteFile(`/uploads/products/${f.filename}`));
                return res.status(400).json({ message: 'Invalid subCategory for the selected category.' });
            }
        }

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
        if (mainImage) {
            newProductData.mainImage = `/uploads/products/${mainImage.filename}`;
        }

        if (newProductData.variations) {
            newProductData.variations.forEach((v, vIndex) => {
                if(v.options) {
                    v.options.forEach((o, oIndex) => {
                        const imageFile = req.files.find(f => f.fieldname === `variationImage_${vIndex}_${oIndex}`);
                        if (imageFile) {
                            o.image = `/uploads/products/${imageFile.filename}`;
                        }
                        delete o.imagePlaceholder;
                    });
                }
            });
        }
        const product = new Product(newProductData);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        if (req.files) {
            req.files.forEach(f => deleteFile(`/uploads/products/${f.filename}`));
        }
        console.error('Error creating product:', error);
        res.status(400).json({ message: 'Error creating product.', error: error.message });
    }
});

router.put('/:id', protect, admin, upload, async (req, res) => {
    try {
        const productToUpdate = await Product.findById(req.params.id);
        if (!productToUpdate) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        const {
            name_en, name_ar, description_en, description_ar, basePrice, category,
            subCategory,
            attributes, variations, clearMainImage
        } = req.body;
         if (subCategory) {
            const parentCategory = await Category.findById(category);
            if (!parentCategory || !parentCategory.subCategories.id(subCategory)) {
                if (req.files) req.files.forEach(f => deleteFile(`/uploads/products/${f.filename}`));
                return res.status(400).json({ message: 'Invalid subCategory for the selected category.' });
            }
        }
        productToUpdate.name = { en: name_en, ar: name_ar };
        productToUpdate.description = { en: description_en || '', ar: description_ar || '' };
        productToUpdate.basePrice = basePrice;
        productToUpdate.category = category;
        productToUpdate.subCategory = subCategory || null;
        
        productToUpdate.attributes = attributes ? JSON.parse(attributes) : [];

        const mainImageFile = req.files.find(f => f.fieldname === 'mainImage');
        if (mainImageFile) {
            deleteFile(productToUpdate.mainImage);
            productToUpdate.mainImage = `/uploads/products/${mainImageFile.filename}`;
        } else if (clearMainImage === 'true') {
            deleteFile(productToUpdate.mainImage);
            productToUpdate.mainImage = null;
        }

        const incomingVariations = variations ? JSON.parse(variations) : [];
        const incomingOptionIds = new Set(
            incomingVariations.flatMap(v => v.options.map(o => o._id).filter(Boolean))
        );

        productToUpdate.variations.forEach(oldVar => {
            oldVar.options.forEach(oldOpt => {
                if (!incomingOptionIds.has(oldOpt._id.toString()) && oldOpt.image) {
                    deleteFile(oldOpt.image);
                }
            });
        });

        if (incomingVariations) {
            incomingVariations.forEach((iVar, vIndex) => {
                if(iVar.options) {
                    iVar.options.forEach((iOpt, oIndex) => {
                        const imageFile = req.files.find(f => f.fieldname === `variationImage_${vIndex}_${oIndex}`);
                        if (imageFile) {
                            const oldVar = productToUpdate.variations.find(v => v._id && v._id.toString() === iVar._id);
                            if (oldVar) {
                                const oldOpt = oldVar.options.find(o => o._id && o._id.toString() === iOpt._id);
                                if(oldOpt && oldOpt.image) deleteFile(oldOpt.image);
                            }
                            iOpt.image = `/uploads/products/${imageFile.filename}`;
                        }
                        delete iOpt.imagePlaceholder;
                    });
                }
            });
        }

        productToUpdate.variations = incomingVariations;
        productToUpdate.markModified('variations');

        const updatedProduct = await productToUpdate.save();
        res.json(updatedProduct);
    } catch (error) {
        if (req.files) {
            req.files.forEach(f => deleteFile(`/uploads/products/${f.filename}`));
        }
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Error updating product.', error: error.message });
    }
});

router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const productToDelete = await Product.findById(req.params.id);
        if (!productToDelete) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        deleteFile(productToDelete.mainImage);
        productToDelete.variations.forEach(v => {
            v.options.forEach(o => {
                if (o.image) deleteFile(o.image);
            });
        });
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully.' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Server error while deleting product.' });
    }
});

router.post('/:id/reviews', protect, async (req, res) => {
    const { rating, comment } = req.body;
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );
        if (alreadyReviewed) {
            return res.status(400).json({ message: 'Product already reviewed' });
        }
        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
        };
        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.averageRating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;
        await product.save();
        res.status(201).json({ message: 'Review added' });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Server error while creating review.' });
    }
});

module.exports = router;