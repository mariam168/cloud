const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Advertisement = require('../models/Advertisement');
const { protect, admin } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsDir = path.join(__dirname, '../uploads/advertisements');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, 'uploads/advertisements/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
router.get('/', async (req, res) => {
    try {
        const advertisements = await Advertisement.find({}).sort({ order: 1, createdAt: -1 });
        res.status(200).json(advertisements);
    } catch (error) {
        console.error('Error fetching advertisements:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const advertisement = await Advertisement.findById(req.params.id);
        if (!advertisement) {
            return res.status(404).json({ message: 'Advertisement not found' });
        }
        res.status(200).json(advertisement);
    } catch (error) {
        console.error('Error fetching advertisement by ID:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
    try {
        const { title_en, title_ar, description_en, description_ar, link, type, isActive, order } = req.body;
        let imagePath = '';

        if (req.file) {
            imagePath = `/uploads/advertisements/${req.file.filename}`;
        } else {
            return res.status(400).json({ message: 'Advertisement image is required.' });
        }

        if (!title_en || title_en.trim() === "" || !title_ar || title_ar.trim() === "") {
            if (req.file) {
                const filePath = path.join(__dirname, '..', req.file.path);
                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, (err) => {
                        if (err) console.error("Error deleting failed upload:", err);
                    });
                }
            }
            return res.status(400).json({ message: 'Advertisement English and Arabic titles are required.' });
        }

        const newAdvertisement = new Advertisement({
            title: { en: title_en, ar: title_ar },
            description: { en: description_en, ar: description_ar },
            image: imagePath,
            link,
            type,
            isActive: isActive === 'true', 
            order: Number(order)
        });

        await newAdvertisement.save();
        res.status(201).json(newAdvertisement);
    } catch (error) {
        console.error('Error creating advertisement:', error);
        if (req.file) {
            const filePath = path.join(__dirname, '..', req.file.path);
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) console.error("Error deleting failed upload:", err);
                });
            }
        }
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
    try {
        const advertisementId = req.params.id;
        const { title_en, title_ar, description_en, description_ar, link, type, isActive, order } = req.body;

        const advertisementToUpdate = await Advertisement.findById(advertisementId);

        if (!advertisementToUpdate) {
            if (req.file) {
                const filePath = path.join(__dirname, '..', req.file.path);
                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, (err) => {
                        if (err) console.error("Error deleting failed upload:", err);
                    });
                }
            }
            return res.status(404).json({ message: "Advertisement not found" });
        }

        if (!title_en || title_en.trim() === "" || !title_ar || title_ar.trim() === "") {
            if (req.file) {
                const filePath = path.join(__dirname, '..', req.file.path);
                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, (err) => {
                        if (err) console.error("Error deleting failed upload:", err);
                    });
                }
            }
            return res.status(400).json({ message: 'Advertisement English and Arabic titles are required.' });
        }

        let updatedData = {
            title: { en: title_en, ar: title_ar },
            description: { en: description_en, ar: description_ar },
            link,
            type,
            isActive: isActive === 'true',
            order: Number(order)
        };

        if (req.file) {
            if (advertisementToUpdate.image && advertisementToUpdate.image !== "") {
                const oldImagePath = path.join(__dirname, '..', advertisementToUpdate.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlink(oldImagePath, err => {
                        if (err) console.error("Error deleting old advertisement image during update:", err);
                    });
                }
            }
            updatedData.image = `/uploads/advertisements/${req.file.filename}`;
        } else {
            updatedData.image = advertisementToUpdate.image; 
        }

        const updatedAdvertisement = await Advertisement.findByIdAndUpdate(advertisementId, updatedData, { new: true, runValidators: true });

        if (!updatedAdvertisement) {
            if (req.file) {
                const filePath = path.join(__dirname, '..', req.file.path);
                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, (err) => {
                        if (err) console.error("Error deleting failed upload:", err);
                    });
                }
            }
            return res.status(404).json({ message: 'Advertisement not found after update attempt' });
        }

        res.status(200).json(updatedAdvertisement);
    } catch (error) {
        console.error('Error updating advertisement:', error);
        if (req.file) {
            const filePath = path.join(__dirname, '..', req.file.path);
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) console.error("Error deleting failed upload:", err);
                });
            }
        }
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const advertisementId = req.params.id;
        const advertisement = await Advertisement.findById(advertisementId);

        if (!advertisement) {
            return res.status(404).json({ message: 'Advertisement not found' });
        }
        if (advertisement.image && advertisement.image !== "") {
            const imagePath = path.join(__dirname, '..', advertisement.image);
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (err) => {
                    if (err) console.error("Failed to delete advertisement image during delete:", err);
                });
            }
        }

        await Advertisement.findByIdAndDelete(advertisementId);

        res.status(200).json({ message: 'Advertisement deleted successfully' });
    } catch (error) {
        console.error('Error deleting advertisement:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

module.exports = router;
