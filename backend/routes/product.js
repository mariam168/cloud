// ========================================================
//     Product Routes (routes/productRoutes.js)
// ========================================================

// 1. Import Dependencies
// --------------------------------------------------------
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware'); // (اختياري) لحماية المسارات

// 2. Setup Multer for File Uploads
// --------------------------------------------------------
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'products');

// Ensure the uploads directory exists
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        // Create a unique filename to prevent overwriting
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Multer instance to handle any file fields
const upload = multer({ storage: storage }).any();

// 3. Helper Function for Deleting Files
// --------------------------------------------------------
const deleteFile = (filePath) => {
    if (!filePath) return;
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
        fs.unlink(fullPath, (err) => {
            if (err) console.error(`Error deleting file: ${fullPath}`, err);
        });
    }
};

// 4. API Routes
// --------------------------------------------------------

/**
 * @route   GET /api/products
 * @desc    Get all products
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({})
            .populate('category', 'name')
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error while fetching products.' });
    }
});

/**
 * @route   GET /api/products/:id
 * @desc    Get a single product by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name');
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.json(product);
    } catch (error) {
        console.error(`Error fetching product ${req.params.id}:`, error);
        res.status(500).json({ message: 'Server error while fetching product.' });
    }
});

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private/Admin
 */
router.post('/', protect, admin, upload, async (req, res) => {
    try {
        const {
            name_en, name_ar, description_en, description_ar, basePrice, category,
            subCategoryName, attributes, variations
        } = req.body;

        // Construct the product data with multi-language fields
        const newProductData = {
            name: { en: name_en, ar: name_ar },
            description: { en: description_en || '', ar: description_ar || '' },
            basePrice,
            category,
            subCategoryName: subCategoryName || '',
            attributes: attributes ? JSON.parse(attributes) : [],
            variations: variations ? JSON.parse(variations) : [],
        };
        
        // Handle main image
        const mainImage = req.files.find(f => f.fieldname === 'mainImage');
        if (mainImage) {
            newProductData.mainImage = `/uploads/products/${mainImage.filename}`;
        }

        // Handle variation option images
        newProductData.variations.forEach((v, vIndex) => {
            v.options.forEach((o, oIndex) => {
                const imageFile = req.files.find(f => f.fieldname === `variationImage_${vIndex}_${oIndex}`);
                if (imageFile) {
                    o.image = `/uploads/products/${imageFile.filename}`;
                }
                delete o.imagePlaceholder; // Remove temporary placeholder
            });
        });

        const product = new Product(newProductData);
        await product.save();
        res.status(201).json(product);

    } catch (error) {
        // Cleanup uploaded files on error
        if (req.files) {
            req.files.forEach(f => deleteFile(`/uploads/products/${f.filename}`));
        }
        console.error('Error creating product:', error);
        res.status(400).json({ message: 'Error creating product.', error: error.message });
    }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update an existing product
 * @access  Private/Admin
 */
router.put('/:id', protect, admin, upload, async (req, res) => {
    try {
        const productToUpdate = await Product.findById(req.params.id);
        if (!productToUpdate) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        const {
            name_en, name_ar, description_en, description_ar, basePrice, category,
            subCategoryName, attributes, variations, clearMainImage
        } = req.body;
        
        // Update basic fields
        productToUpdate.name = { en: name_en, ar: name_ar };
        productToUpdate.description = { en: description_en || '', ar: description_ar || '' };
        productToUpdate.basePrice = basePrice;
        productToUpdate.category = category;
        productToUpdate.subCategoryName = subCategoryName || '';
        productToUpdate.attributes = attributes ? JSON.parse(attributes) : [];

        // Update main image
        const mainImageFile = req.files.find(f => f.fieldname === 'mainImage');
        if (mainImageFile) {
            deleteFile(productToUpdate.mainImage);
            productToUpdate.mainImage = `/uploads/products/${mainImageFile.filename}`;
        } else if (clearMainImage === 'true') {
            deleteFile(productToUpdate.mainImage);
            productToUpdate.mainImage = null;
        }
        
        // Complex logic to update variations and their images
        const incomingVariations = variations ? JSON.parse(variations) : [];
        const incomingOptionIds = new Set(
            incomingVariations.flatMap(v => v.options.map(o => o._id).filter(Boolean))
        );

        // Delete images of removed options
        productToUpdate.variations.forEach(oldVar => {
            oldVar.options.forEach(oldOpt => {
                if (!incomingOptionIds.has(oldOpt._id.toString()) && oldOpt.image) {
                    deleteFile(oldOpt.image);
                }
            });
        });

        // Update existing options and add new ones with their images
        incomingVariations.forEach((iVar, vIndex) => {
            iVar.options.forEach((iOpt, oIndex) => {
                const imageFile = req.files.find(f => f.fieldname === `variationImage_${vIndex}_${oIndex}`);
                if (imageFile) {
                    // Find and delete the old image if it exists
                    const oldVar = productToUpdate.variations.find(v => v._id.toString() === iVar._id);
                    if (oldVar) {
                        const oldOpt = oldVar.options.find(o => o._id.toString() === iOpt._id);
                        if(oldOpt && oldOpt.image) deleteFile(oldOpt.image);
                    }
                    iOpt.image = `/uploads/products/${imageFile.filename}`;
                }
                delete iOpt.imagePlaceholder;
            });
        });

        productToUpdate.variations = incomingVariations;
        productToUpdate.markModified('variations');

        const updatedProduct = await productToUpdate.save();
        res.json(updatedProduct);

    } catch (error) {
        // Cleanup newly uploaded files on error
        if (req.files) {
            req.files.forEach(f => deleteFile(`/uploads/products/${f.filename}`));
        }
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Error updating product.', error: error.message });
    }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private/Admin
 */
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const productToDelete = await Product.findById(req.params.id);
        if (!productToDelete) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Delete all associated images
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

// 5. Export Router
// --------------------------------------------------------
module.exports = router;