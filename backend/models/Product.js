const mongoose = require('mongoose');

const SkuSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name_en: { type: String, required: true, trim: true },
    name_ar: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, trim: true, unique: true, sparse: true }
});

const VariationOptionSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name_en: { type: String, required: true, trim: true },
    name_ar: { type: String, required: true, trim: true },
    image: { type: String },
    skus: [SkuSchema]
});

const VariationSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name_en: { type: String, required: true, trim: true },
    name_ar: { type: String, required: true, trim: true },
    options: [VariationOptionSchema]
});

const productSchema = new mongoose.Schema({
    name: {
        en: { type: String, required: true, trim: true },
        ar: { type: String, required: true, trim: true },
    },
    basePrice: { type: Number, required: true, min: 0 },
    description: {
        en: { type: String, trim: true },
        ar: { type: String, trim: true },
    },
    mainImage: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategoryName: { type: String, trim: true, default: '' },
    attributes: [{
        _id: false,
        key_en: { type: String, required: true },
        key_ar: { type: String, required: true },
        value_en: { type: String, required: true },
        value_ar: { type: String, required: true },
    }],
    variations: [VariationSchema]
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;