const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name: {
        en: {
            type: String,
            required: true,
        },
        ar: {
            type: String,
            required: true,
        },
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        en: {
            type: String,
        },
        ar: {
            type: String,
        },
    },
    image: {
        type: String,
    },
    category: {
        type: String,
    },
    subCategory: {
        type: String,
        default: '', 
    },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
