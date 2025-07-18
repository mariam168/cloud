const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Advertisement = require('../models/Advertisement');
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, admin } = require('../middleware/authMiddleware');

// --- إعدادات رفع الملفات (تبقى كما هي) ---
const uploadDir = path.join(__dirname, '../uploads/advertisements');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${Date.now()}${ext}`);
    },
});
const upload = multer({ storage });

const deleteImageFile = (imagePath) => {
    if (!imagePath) return;
    const fullPath = path.join(__dirname, '..', imagePath);
    if (fs.existsSync(fullPath)) {
        fs.unlink(fullPath, (err) => {
            if (err) console.error("Error deleting image file:", fullPath, err.message);
        });
    }
};

// --- دالة الترجمة (مهمة للمسارات العامة) ---
// تم نسخها من ملف productsController لضمان التوافق
const translateDoc = (doc, lang, fields) => {
    if (!doc || !lang || !fields) return doc;
    const translated = { ...doc };

    const setNestedValue = (obj, path, value) => {
        const keys = path.split('.');
        keys.reduce((acc, key, index) => {
            if (index === keys.length - 1) {
                acc[key] = value;
            } else {
                if (!acc[key]) acc[key] = {};
                if (typeof acc[key] !== 'object' || acc[key] === null) {
                    // If the path is blocked by a non-object, we can't proceed.
                    // This might happen if a field is not populated correctly.
                    return acc;
                }
            }
            return acc[key];
        }, obj);
    };

    fields.forEach(fieldPath => {
        const keys = fieldPath.split('.');
        let currentVal = doc;
        for (const key of keys) {
            if (currentVal === null || typeof currentVal === 'undefined') {
                currentVal = undefined;
                break;
            }
            currentVal = currentVal[key];
        }

        if (typeof currentVal === 'object' && currentVal !== null && (currentVal.en || currentVal.ar)) {
            setNestedValue(translated, fieldPath, currentVal[lang] || currentVal.en);
        }
    });

    return translated;
};


// @desc    Get all advertisements with full product details
// @route   GET /api/advertisements
// @access  Public
router.get('/', async (req, res, next) => {
    try {
        const { type, isActive } = req.query;
        const lang = req.language; // Assuming language middleware
        let queryFilter = {};

        if (type) queryFilter.type = type;
        if (isActive !== undefined) queryFilter.isActive = isActive === 'true';

        // --- التعديل الجوهري هنا ---
        // استخدام .find().populate() بدلاً من .aggregate() لسهولة جلب كل بيانات المنتج
        const advertisements = await Advertisement.find(queryFilter)
            .sort({ order: 1, createdAt: -1 })
            .populate({
                path: 'productRef',
                // نحدد كل الحقول التي يحتاجها ProductCard
                select: 'name basePrice mainImage averageRating numReviews category',
                populate: {
                    // نقوم أيضًا بجلب بيانات الفئة داخل المنتج
                    path: 'category',
                    select: 'name' // نحتاج فقط اسم الفئة
                }
            })
            .lean(); // .lean() لتحسين الأداء وإرجاع object عادي

        // تطبيق الترجمة على النتائج لضمان التوافق مع باقي أجزاء التطبيق
        const translatedAdvertisements = advertisements.map(ad => {
            // ترجمة الإعلان نفسه
            let translatedAd = translateDoc(ad, lang, ['title', 'description']);

            // ترجمة بيانات المنتج المرتبط إذا وجد
            if (translatedAd.productRef) {
                translatedAd.productRef = translateDoc(translatedAd.productRef, lang, ['name', 'category.name']);
            }
            return translatedAd;
        });

        res.json(translatedAdvertisements);

    } catch (err) {
        console.error("Error in GET /api/advertisements:", err);
        next(err);
    }
});


// @desc    Create new advertisement
// @route   POST /api/advertisements
// @access  Private/Admin
router.post('/', protect, admin, upload.single('image'), async (req, res, next) => {
    const {
        title_en, title_ar, description_en, description_ar, link, type, isActive, order,
        startDate, endDate, discountPercentage, productRef
    } = req.body;

    const imagePath = req.file ? `/uploads/advertisements/${req.file.filename}` : null;

    if (!title_en?.trim() || !title_ar?.trim()) {
        if (req.file) deleteImageFile(imagePath);
        return res.status(400).json({ message: 'Title (English & Arabic) are required.' });
    }

    try {
        const finalProductRef = (productRef && productRef !== "null" && productRef !== "") ? productRef : null;
        if (finalProductRef) {
            const productExists = await Product.findById(finalProductRef);
            if (!productExists) {
                if (req.file) deleteImageFile(imagePath);
                return res.status(400).json({ message: 'Invalid productRef: Product not found.' });
            }
        }

        const advertisement = new Advertisement({
            title: { en: title_en.trim(), ar: title_ar.trim() },
            description: { en: description_en?.trim() || '', ar: description_ar?.trim() || '' },
            image: imagePath, link: link?.trim() || '#', type: type || 'slide',
            isActive: isActive === 'true' || isActive === true,
            order: parseInt(order) || 0, startDate: startDate || null, endDate: endDate || null,
            discountPercentage: (discountPercentage !== '' && discountPercentage != null) ? parseFloat(discountPercentage) : 0,
            productRef: finalProductRef
        });

        await advertisement.save();
        res.status(201).json(advertisement);

    } catch (err) {
        if (req.file) deleteImageFile(imagePath);
        next(err);
    }
});

// @desc    Update an advertisement
// @route   PUT /api/advertisements/:id
// @access  Private/Admin
router.put('/:id', protect, admin, upload.single('image'), async (req, res, next) => {
    const {
        title_en, title_ar, description_en, description_ar, link, type, isActive, order,
        startDate, endDate, discountPercentage, productRef, clearImage
    } = req.body;

    try {
        const advertisement = await Advertisement.findById(req.params.id);
        if (!advertisement) {
            if (req.file) deleteImageFile(`/uploads/advertisements/${req.file.filename}`);
            return res.status(404).json({ message: 'Advertisement not found' });
        }

        if (productRef !== undefined) {
            const finalProductRef = (productRef && productRef !== "null" && productRef !== "") ? productRef : null;
            if (finalProductRef) {
                const productExists = await Product.findById(finalProductRef);
                if (!productExists) {
                    if (req.file) deleteImageFile(`/uploads/advertisements/${req.file.filename}`);
                    return res.status(400).json({ message: 'Invalid productRef: Product not found.' });
                }
            }
            advertisement.productRef = finalProductRef;
        }

        if (req.file) {
            deleteImageFile(advertisement.image);
            advertisement.image = `/uploads/advertisements/${req.file.filename}`;
        } else if (clearImage === 'true') {
            deleteImageFile(advertisement.image);
            advertisement.image = '';
        }

        advertisement.title.en = title_en?.trim() || advertisement.title.en;
        advertisement.title.ar = title_ar?.trim() || advertisement.title.ar;
        if (description_en !== undefined) advertisement.description.en = description_en.trim();
        if (description_ar !== undefined) advertisement.description.ar = description_ar.trim();
        if (link !== undefined) advertisement.link = link.trim();
        if (type) advertisement.type = type;
        if (isActive !== undefined) advertisement.isActive = (isActive === 'true' || isActive === true);
        if (order !== undefined) advertisement.order = parseInt(order);
        if (startDate !== undefined) advertisement.startDate = startDate || null;
        if (endDate !== undefined) advertisement.endDate = endDate || null;
        if (discountPercentage !== undefined) {
            advertisement.discountPercentage = (discountPercentage !== '' && discountPercentage != null) ? parseFloat(discountPercentage) : 0;
        }

        await advertisement.save();
        res.json(advertisement);

    } catch (err) {
        if (req.file) deleteImageFile(`/uploads/advertisements/${req.file.filename}`);
        next(err);
    }
});

// @desc    Delete an advertisement
// @route   DELETE /api/advertisements/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res, next) => {
    try {
        const advertisement = await Advertisement.findByIdAndDelete(req.params.id);
        if (!advertisement) return res.status(404).json({ message: 'Advertisement not found' });
        deleteImageFile(advertisement.image);
        res.json({ message: 'Advertisement deleted successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;