const express = require("express");
const Product = require("../models/Product");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const deleteFile = (filePath) => {
    if (!filePath) return;
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
        fs.unlink(fullPath, (err) => { if (err) console.error(`Error deleting file: ${fullPath}`, err); });
    }
};

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/", upload.any(), async (req, res) => {
    try {
        let { name_en, name_ar, description_en, description_ar, basePrice, category, subCategoryName, attributes, variations } = req.body;
        
        const productData = {
            name: { en: name_en, ar: name_ar },
            basePrice: Number(basePrice),
            description: { en: description_en, ar: description_ar },
            category: category,
            subCategoryName: subCategoryName || '',
            attributes: attributes ? JSON.parse(attributes) : [],
        };
        
        const mainImageFile = req.files.find(f => f.fieldname === 'mainImage');
        if (mainImageFile) {
            const filename = `main-${Date.now()}${path.extname(mainImageFile.originalname)}`;
            const savePath = path.join(__dirname, '..', 'uploads', 'products', filename);
            fs.mkdirSync(path.dirname(savePath), { recursive: true });
            fs.writeFileSync(savePath, mainImageFile.buffer);
            productData.mainImage = `/uploads/products/${filename}`;
        }
        
        let parsedVariations = variations ? JSON.parse(variations) : [];
        productData.variations = parsedVariations.map(variation => {
            variation.options = variation.options.map(option => {
                const imageFile = req.files.find(f => f.fieldname === option.imagePlaceholder);
                if (imageFile) {
                    const filename = `var-opt-${Date.now()}${path.extname(imageFile.originalname)}`;
                    const savePath = path.join(__dirname, '..', 'uploads', 'products', filename);
                    fs.mkdirSync(path.dirname(savePath), { recursive: true });
                    fs.writeFileSync(savePath, imageFile.buffer);
                    option.image = `/uploads/products/${filename}`;
                }
                delete option.imagePlaceholder;
                return option;
            });
            return variation;
        });
        
        const product = new Product(productData);
        await product.save();
        
        res.status(201).json(product);

    } catch (err) {
        console.error("Error creating product:", err);
        res.status(400).json({ message: "Error creating product.", error: err });
    }
});

router.put("/:id", upload.any(), async (req, res) => {
    try {
        const { id } = req.params;
        let { name_en, name_ar, description_en, description_ar, basePrice, category, subCategoryName, attributes, variations, clearMainImage } = req.body;

        const productToUpdate = await Product.findById(id);
        if (!productToUpdate) {
            return res.status(404).json({ message: "Product not found" });
        }

        productToUpdate.name = { en: name_en, ar: name_ar };
        productToUpdate.basePrice = Number(basePrice);
        productToUpdate.description = { en: description_en, ar: description_ar };
        productToUpdate.category = category;
        productToUpdate.subCategoryName = subCategoryName || '';
        productToUpdate.attributes = attributes ? JSON.parse(attributes) : [];

        if (clearMainImage === 'true') {
            deleteFile(productToUpdate.mainImage);
            productToUpdate.mainImage = null;
        }

        const mainImageFile = req.files.find(f => f.fieldname === 'mainImage');
        if (mainImageFile) {
            deleteFile(productToUpdate.mainImage);
            const filename = `main-${Date.now()}${path.extname(mainImageFile.originalname)}`;
            const savePath = path.join(__dirname, '..', 'uploads', 'products', filename);
            fs.mkdirSync(path.dirname(savePath), { recursive: true });
            fs.writeFileSync(savePath, mainImageFile.buffer);
            productToUpdate.mainImage = `/uploads/products/${filename}`;
        }
        
        const newVariations = variations ? JSON.parse(variations) : [];
        const oldImagePaths = new Set(productToUpdate.variations.flatMap(v => v.options.map(o => o.image)).filter(Boolean));
        const newImagePaths = new Set();

        const finalVariations = newVariations.map(variation => {
            variation.options = variation.options.map(option => {
                if (option.image) {
                    newImagePaths.add(option.image);
                }
                const imageFile = req.files.find(f => f.fieldname === option.imagePlaceholder);
                if (imageFile) {
                    deleteFile(option.image);
                    const filename = `var-opt-${Date.now()}${path.extname(imageFile.originalname)}`;
                    const savePath = path.join(__dirname, '..', 'uploads', 'products', filename);
                    fs.mkdirSync(path.dirname(savePath), { recursive: true });
                    fs.writeFileSync(savePath, imageFile.buffer);
                    option.image = `/uploads/products/${filename}`;
                }
                delete option.imagePlaceholder;
                return option;
            });
            return variation;
        });
        
        oldImagePaths.forEach(oldPath => {
            if (!newImagePaths.has(oldPath)) {
                deleteFile(oldPath);
            }
        });

        productToUpdate.variations = finalVariations;
        
        const updatedProduct = await productToUpdate.save();
        res.status(200).json(updatedProduct);

    } catch (err) {
        console.error("Error updating product:", err);
        res.status(400).json({ message: "Error updating product.", error: err });
    }
});

router.get("/", async (req, res) => { try { const products = await Product.find(req.query).populate('category').sort({ createdAt: -1 }); res.json(products); } catch (err) { res.status(500).json({ error: "Failed to fetch products" }); } });
router.get("/:id", async (req, res) => { try { const product = await Product.findById(req.params.id).populate('category'); if (!product) { return res.status(404).json({ error: "Product not found" }); } res.json(product); } catch (err) { res.status(500).json({ error: "Failed to fetch product" }); } });
router.delete("/:id", async (req, res) => { try { const productToDelete = await Product.findById(req.params.id); if (!productToDelete) { return res.status(404).json({ error: "Product not found" }); } deleteFile(productToDelete.mainImage); productToDelete.variations.forEach(v => v.options.forEach(o => deleteFile(o.image))); await Product.findByIdAndDelete(req.params.id); res.json({ message: "Product deleted successfully" }); } catch (err) { res.status(500).json({ error: "Failed to delete product" }); } });

module.exports = router;