const mongoose = require('mongoose');

const cartItemSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
    },
    name: {
        en: { type: String, required: true },
        ar: { type: String, required: true }
    },
    image: { 
        type: String 
    },
    price: { // This price reflects the product's base price + variant adjustment
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },
    selectedVariant: { // Stores the _id of the selected variant, if any
        type: mongoose.Schema.Types.ObjectId,
        default: null 
    },
    variantDetails: { // Stores specific details of the selected variant for display
        _id: false, // Prevents creating a new _id for this subdocument
        options: [{ // Array of { optionName: "Color", optionValue: "Red" }
            _id: false,
            optionName: { type: String },
            optionValue: { type: String },
        }],
        image: { type: String }, 
        priceAdjustment: { type: Number, default: 0 },
        sku: { type: String }, 
        stock: { type: Number } 
    }
}, { _id: false }); // Prevents creating a new _id for each cart item in the array

const cartSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique: true // A user should only have one cart
    },
    items: [cartItemSchema]
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;