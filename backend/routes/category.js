const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const deleteFile = (filePath) => {
    if (!filePath) return;
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
        fs.unlink(fullPath, (err) => {
            if (err) console.error(`Error deleting file: ${fullPath}`, err);
        });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', 'uploads', 'categories');
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

const categoryUploadMiddleware = upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'subCategoryImages', maxCount: 50 }
]);

router.post('/', categoryUploadMiddleware, async (req, res) => {
    try {
        const { name_en, name_ar, description_en, description_ar, subCategories: subCategoriesJSON } = req.body;
        
        let subCategories = [];
        if (subCategoriesJSON) {
            try {
                let parsedSubCategories = JSON.parse(subCategoriesJSON);
                if (!Array.isArray(parsedSubCategories)) throw new Error();
                
                const subCategoryImages = req.files.subCategoryImages || [];
                
                subCategories = parsedSubCategories.map((sub) => {
                    const imageFile = subCategoryImages[sub.tempImageIndex];
                    if (sub.tempImageIndex !== undefined && imageFile) {
                        sub.imageUrl = `/uploads/categories/${imageFile.filename}`;
                    }
                    delete sub.tempImageIndex;
                    return sub;
                });

            } catch (e) {
                return res.status(400).json({ message: 'Invalid subCategories format.' });
            }
        }

        const newCategory = new Category({
            name: { en: name_en, ar: name_ar },
            description: { en: description_en, ar: description_ar },
            imageUrl: req.files.mainImage ? `/uploads/categories/${req.files.mainImage[0].filename}` : '',
            subCategories: subCategories
        });
        
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        if (req.files) {
            if (req.files.mainImage) fs.unlinkSync(req.files.mainImage[0].path);
            if (req.files.subCategoryImages) req.files.subCategoryImages.forEach(f => fs.unlinkSync(f.path));
        }
        res.status(400).json({ message: 'Error creating category', error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ 'name.en': 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
});

router.put('/:id', categoryUploadMiddleware, async (req, res) => {
    try {
        const { name_en, name_ar, description_en, description_ar, subCategories: subCategoriesJSON, clearMainImage } = req.body;

        const categoryToUpdate = await Category.findById(req.params.id);
        if (!categoryToUpdate) {
             return res.status(404).json({ message: 'Category not found' });
        }
        
        let subCategoriesData = [];
        if (subCategoriesJSON) {
            try {
                subCategoriesData = JSON.parse(subCategoriesJSON);
                if (!Array.isArray(subCategoriesData)) throw new Error();
            } catch (e) {
                return res.status(400).json({ message: 'Invalid subCategories format.' });
            }
        }
        
        const subCategoryImages = req.files.subCategoryImages || [];
        let imageCounter = 0;

        const finalSubCategories = subCategoriesData.map(sub => {
            if (sub.hasNewImage) {
                const newImageFile = subCategoryImages[imageCounter++];
                if (newImageFile) {
                    const oldSub = categoryToUpdate.subCategories.find(s => s._id.toString() === sub._id);
                    if (oldSub && oldSub.imageUrl) {
                        deleteFile(oldSub.imageUrl);
                    }
                    sub.imageUrl = `/uploads/categories/${newImageFile.filename}`;
                }
            }
            delete sub.hasNewImage;
            return sub;
        });

        const newSubCategoryIds = finalSubCategories.map(s => s._id).filter(Boolean);
        categoryToUpdate.subCategories.forEach(oldSub => {
            if (oldSub.imageUrl && !newSubCategoryIds.includes(oldSub._id.toString())) {
                deleteFile(oldSub.imageUrl);
            }
        });

        const updateData = {
            name: { en: name_en, ar: name_ar },
            description: { en: description_en, ar: description_ar },
            subCategories: finalSubCategories
        };
        
        if (req.files.mainImage) {
            if (categoryToUpdate.imageUrl) deleteFile(categoryToUpdate.imageUrl);
            updateData.imageUrl = `/uploads/categories/${req.files.mainImage[0].filename}`;
        } else if (clearMainImage === 'true') {
            if (categoryToUpdate.imageUrl) deleteFile(categoryToUpdate.imageUrl);
            updateData.imageUrl = '';
        }
        
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        
        if (!updatedCategory) return res.status(404).json({ message: 'Category not found after update' });
        
        res.json(updatedCategory);
    } catch (error) {
        if (req.files) {
            if (req.files.mainImage) fs.unlinkSync(req.files.mainImage[0].path);
            if (req.files.subCategoryImages) req.files.subCategoryImages.forEach(f => fs.unlinkSync(f.path));
        }
        res.status(400).json({ message: 'Error updating category', error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const categoryToDelete = await Category.findById(req.params.id);
        if (!categoryToDelete) return res.status(404).json({ message: 'Category not found' });
        
        const productCount = await Product.countDocuments({ category: categoryToDelete._id });
        if (productCount > 0) {
            return res.status(400).json({ message: `Cannot delete. Category is used by ${productCount} products.` });
        }

        if (categoryToDelete.imageUrl) deleteFile(categoryToDelete.imageUrl);
        categoryToDelete.subCategories.forEach(sub => {
            if (sub.imageUrl) deleteFile(sub.imageUrl);
        });
        
        await Category.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category', error: error.message });
    }
});

module.exports = router;