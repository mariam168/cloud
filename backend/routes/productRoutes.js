const express = require("express");
const Product = require("../models/Product"); 
const router = express.Router();
router.post("/", async (req, res) => {
    try {
        const { name_en, name_ar, description_en, description_ar, price, category, subCategory } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : ''; 

        const product = new Product({
            name: { en: name_en, ar: name_ar },
            description: { en: description_en, ar: description_ar },
            price: price,
            image: image, 
            category: category,
            subCategory: subCategory, 
        });

        const saved = await product.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error("Error adding product:", err);
        res.status(400).json({ error: err.message });
    }
});
router.get("/", async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            query = {
                $or: [
                    { 'name.en': { $regex: search, $options: 'i' } },
                    { 'name.ar': { $regex: search, $options: 'i' } },
                    { 'description.en': { $regex: search, $options: 'i' } },
                    { 'description.ar': { $regex: search, $options: 'i' } },
                    { 'category': { $regex: search, $options: 'i' } },
                    { 'subCategory': { $regex: search, $options: 'i' } }, 
                    { 'brand': { $regex: search, $options: 'i' } },
                ]
            };
        }
        const products = await Product.find(query);
        res.json(products);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ error: err.message });
    }
});
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        product ? res.json(product) : res.status(404).json({ error: "Product not found" });
    } catch (err) {
        console.error("Error fetching product by ID:", err);
        res.status(500).json({ error: err.message });
    }
});
router.put("/:id", async (req, res) => {
    try {
        const { name_en, name_ar, description_en, description_ar, price, category, subCategory } = req.body;
        const updateFields = {
            name: { en: name_en, ar: name_ar },
            description: { en: description_en, ar: description_ar },
            price: price,
            category: category,
            subCategory: subCategory,
        };
        if (req.file) {
            updateFields.image = `/uploads/${req.file.filename}`; 
        }
        const updated = await Product.findByIdAndUpdate(req.params.id, updateFields, { new: true, runValidators: true });
        if (!updated) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.json(updated);
    } catch (err) {
        console.error("Error updating product:", err);
        res.status(400).json({ error: err.message });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await Product.findByIdAndDelete(req.params.id);
        deleted ? res.json({ message: "Product deleted successfully" }) : res.status(404).json({ error: "Product not found" });
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;
