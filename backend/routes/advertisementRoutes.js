const express = require('express');
const router = express.Router();
const Advertisement = require('../models/Advertisement'); // Adjust path to your model
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // For file system operations (deleting old image)

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/advertisements');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

// GET all advertisements (with optional filters)
router.get('/', async (req, res) => {
    try {
        const { type, isActive } = req.query;
        let query = {};
        if (type) query.type = type;
        if (isActive !== undefined) query.isActive = isActive === 'true'; // Convert string to boolean

        const advertisements = await Advertisement.find(query).sort({ order: 1, createdAt: -1 });
        res.json(advertisements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET a single advertisement by ID
router.get('/:id', async (req, res) => {
    try {
        const advertisement = await Advertisement.findById(req.params.id);
        if (!advertisement) return res.status(404).json({ message: 'Advertisement not found' });
        res.json(advertisement);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ADD a new advertisement
router.post('/', upload.single('image'), async (req, res) => {
    const { title_en, title_ar, description_en, description_ar, link, type, isActive, order } = req.body;
    const imagePath = req.file ? `/uploads/advertisements/${req.file.filename}` : null;

    if (!title_en || !title_ar || !imagePath) {
        if (imagePath) fs.unlinkSync(path.join(uploadDir, req.file.filename)); // Clean up uploaded file
        return res.status(400).json({ message: 'Title (English & Arabic) and image are required.' });
    }

    const advertisement = new Advertisement({
        title: { en: title_en, ar: title_ar },
        description: { en: description_en, ar: description_ar },
        image: imagePath,
        link: link || '#',
        type: type || 'slide',
        isActive: isActive === 'true' || isActive === true, // Ensure boolean
        order: parseInt(order) || 0,
    });

    try {
        const newAdvertisement = await advertisement.save();
        res.status(201).json(newAdvertisement);
    } catch (err) {
        // If an error occurs during save, delete the uploaded image
        if (req.file) {
            fs.unlinkSync(path.join(uploadDir, req.file.filename));
        }
        res.status(400).json({ message: err.message });
    }
});

// UPDATE an advertisement
router.put('/:id', upload.single('image'), async (req, res) => {
    const { title_en, title_ar, description_en, description_ar, link, type, isActive, order } = req.body;
    let newImagePath = null;

    try {
        const advertisement = await Advertisement.findById(req.params.id);
        if (!advertisement) return res.status(404).json({ message: 'Advertisement not found' });

        // If a new image is uploaded, delete the old one
        if (req.file) {
            newImagePath = `/uploads/advertisements/${req.file.filename}`;
            if (advertisement.image) {
                const oldImagePath = path.join(__dirname, '../', advertisement.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        advertisement.title.en = title_en || advertisement.title.en;
        advertisement.title.ar = title_ar || advertisement.title.ar;
        advertisement.description.en = description_en || advertisement.description.en;
        advertisement.description.ar = description_ar || advertisement.description.ar;
        advertisement.link = link !== undefined ? link : advertisement.link;
        advertisement.type = type || advertisement.type;
        advertisement.isActive = isActive !== undefined ? (isActive === 'true' || isActive === true) : advertisement.isActive;
        advertisement.order = order !== undefined ? parseInt(order) : advertisement.order;
        if (newImagePath) advertisement.image = newImagePath;

        const updatedAdvertisement = await advertisement.save();
        res.json(updatedAdvertisement);
    } catch (err) {
        // If an error occurs during save, delete the newly uploaded image (if any)
        if (req.file) {
            fs.unlinkSync(path.join(uploadDir, req.file.filename));
        }
        res.status(400).json({ message: err.message });
    }
});

// DELETE an advertisement
router.delete('/:id', async (req, res) => {
    try {
        const advertisement = await Advertisement.findByIdAndDelete(req.params.id);
        if (!advertisement) return res.status(404).json({ message: 'Advertisement not found' });

        // Delete the associated image file
        if (advertisement.image) {
            const imageToDeletePath = path.join(__dirname, '../', advertisement.image);
            if (fs.existsSync(imageToDeletePath)) {
                fs.unlinkSync(imageToDeletePath);
            }
        }
        res.json({ message: 'Advertisement deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- NEW ROUTE FOR HERO SIDE OFFERS ---
router.get('/hero-side-offers', async (req, res) => {
    try {
        const sideOffers = await Advertisement.find({
            type: { $in: ['sideOffer', 'weeklyOffer'] },
            isActive: true
        });

        const responseData = {};
        sideOffers.forEach(offer => {
            if (offer.type === 'sideOffer') {
                responseData.iphoneOffer = offer; // Map 'sideOffer' type to 'iphoneOffer' key
            } else if (offer.type === 'weeklyOffer') {
                responseData.weeklyOffer = offer;
            }
        });

        res.json(responseData);
    } catch (error) {
        console.error("Error fetching hero side offers:", error);
        res.status(500).json({ message: 'Failed to fetch hero side offers', error: error.message });
    }
});


module.exports = router;