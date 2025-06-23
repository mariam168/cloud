// routes/advertisementRoutes.js
const express = require('express');
const router = express.Router();
const Advertisement = require('../models/Advertisement');
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, admin } = require('../middleware/authMiddleware');

const uploadDir = path.join(__dirname, '../uploads/advertisements');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${Date.now()}${ext}`);
    },
});

const upload = multer({ storage: storage });

const deleteImageFile = (imagePath) => {
    if (imagePath && imagePath !== "") {
        const fullPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(fullPath)) {
            fs.unlink(fullPath, (err) => {
                if (err) console.error("Error deleting image file:", fullPath, err.message);
            });
        }
    }
};
const populateProductRef = (query) => {
    return query.populate({
        path: 'productRef',
        select: 'name mainImage basePrice rating category',
        populate: {
            path: 'category',
            select: 'name'
        }
    });
};
router.get('/', async (req, res, next) => {
    try {
        const { type, isActive } = req.query;
        let query = {};
        if (type) query.type = type;
        if (isActive !== undefined) query.isActive = isActive === 'true';
        const advertisements = await populateProductRef(Advertisement.find(query)).sort({ order: 1, createdAt: -1 });
        res.json(advertisements);
    } catch (err) {
        next(err);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const advertisement = await populateProductRef(Advertisement.findById(req.params.id));
        if (!advertisement) return res.status(404).json({ message: 'Advertisement not found' });
        res.json(advertisement);
    } catch (err) {
        next(err);
    }
});
router.post('/', protect, admin, upload.single('image'), async (req, res, next) => {
    const {
        title_en, title_ar, description_en, description_ar, link, type, isActive, order,
        startDate, endDate, originalPrice, discountedPrice, currency, productRef 
    } = req.body;
    const imagePath = req.file ? `/uploads/advertisements/${req.file.filename}` : null;

    if (!title_en?.trim() || !title_ar?.trim()) { 
        if (req.file) deleteImageFile(imagePath);
        return res.status(400).json({ message: 'Title (English & Arabic) are required.' });
    }
    if (!imagePath) {
        return res.status(400).json({ message: 'Advertisement image is required.' });
    }

    try {
        if (productRef) {
            const productExists = await Product.findById(productRef);
            if (!productExists) {
                if (req.file) deleteImageFile(imagePath);
                return res.status(400).json({ message: 'Invalid productRef: Product not found for the provided ID.' });
            }
        }

        const advertisement = new Advertisement({
            title: { en: title_en.trim(), ar: title_ar.trim() },
            description: { en: description_en?.trim() || '', ar: description_ar?.trim() || '' },
            image: imagePath,
            link: link?.trim() || '#',
            type: type || 'slide',
            isActive: isActive === 'true' || isActive === true,
            order: parseInt(order) || 0,
            startDate: startDate || null,
            endDate: endDate || null,
            originalPrice: (originalPrice !== undefined && originalPrice !== '') ? parseFloat(originalPrice) : null,
            discountedPrice: (discountedPrice !== undefined && discountedPrice !== '') ? parseFloat(discountedPrice) : null,
            currency: currency?.trim() || 'SAR',
            productRef: productRef || null 
        });

        const newAdvertisement = await advertisement.save();
        const populatedAd = await populateProductRef(Advertisement.findById(newAdvertisement._id));
        res.status(201).json(populatedAd);
    } catch (err) {
        if (req.file) {
            deleteImageFile(imagePath);
        }
        next(err); 
    }
});
router.put('/:id', protect, admin, upload.single('image'), async (req, res, next) => {
    const {
        title_en, title_ar, description_en, description_ar, link, type, isActive, order,
        startDate, endDate, originalPrice, discountedPrice, currency, productRef, clearImage
    } = req.body;

    try {
        const advertisement = await Advertisement.findById(req.params.id);
        if (!advertisement) {
            if (req.file) deleteImageFile(`/uploads/advertisements/${req.file.filename}`);
            return res.status(404).json({ message: 'Advertisement not found' });
        }
        
        if (productRef !== undefined) {
            if (productRef && productRef !== "null" && productRef !== "") {
                const productExists = await Product.findById(productRef);
                if (!productExists) {
                    if (req.file) deleteImageFile(`/uploads/advertisements/${req.file.filename}`);
                    return res.status(400).json({ message: 'Invalid productRef: Product not found for the provided ID.' });
                }
                advertisement.productRef = productRef;
            } else {
                advertisement.productRef = null;
            }
        }

        if (req.file) {
            deleteImageFile(advertisement.image); 
            advertisement.image = `/uploads/advertisements/${req.file.filename}`; 
        } else if (clearImage === 'true' || req.body.image === '') {
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
        if (originalPrice !== undefined) advertisement.originalPrice = (originalPrice !== '') ? parseFloat(originalPrice) : null;
        if (discountedPrice !== undefined) advertisement.discountedPrice = (discountedPrice !== '') ? parseFloat(discountedPrice) : null;
        if (currency !== undefined) advertisement.currency = currency.trim() || 'SAR';

        const updatedAdvertisement = await advertisement.save();
        const populatedAd = await populateProductRef(Advertisement.findById(updatedAdvertisement._id));
        res.json(populatedAd);
    } catch (err) {
        if (req.file) {
            deleteImageFile(`/uploads/advertisements/${req.file.filename}`);
        }
        next(err);
    }
});
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
router.get('/hero-side-offers', async (req, res, next) => {
    try {
        const sideOffers = await populateProductRef(Advertisement.find({
            type: { $in: ['sideOffer', 'weeklyOffer'] },
            isActive: true
        })).sort({ order: 1, createdAt: -1 });

        const responseData = {
            sideOfferAd: null,
            weeklyOfferAd: null,
        };
        sideOffers.forEach(offer => {
            if (offer.type === 'sideOffer' && !responseData.sideOfferAd) {
                responseData.sideOfferAd = offer;
            } else if (offer.type === 'weeklyOffer' && !responseData.weeklyOfferAd) {
                responseData.weeklyOfferAd = offer;
            }
        });

        res.json(responseData);
    } catch (error) {
        console.error("Error fetching hero side offers:", error);
        next(error);
    }
});

module.exports = router;