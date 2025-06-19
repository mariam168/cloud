const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
    name: {
        en: { type: String, required: true, trim: true },
        ar: { type: String, required: true, trim: true }
    },
    description: {
        en: { type: String, trim: true },
        ar: { type: String, trim: true }
    },
    imageUrl: { type: String }
});

const categorySchema = new mongoose.Schema({
    name: {
        en: { type: String, required: true, trim: true, unique: true },
        ar: { type: String, required: true, trim: true, unique: true }
    },
    description: {
        en: { type: String, trim: true },
        ar: { type: String, trim: true }
    },
    imageUrl: { type: String },
    subCategories: [subCategorySchema] 
}, {
    timestamps: true
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;