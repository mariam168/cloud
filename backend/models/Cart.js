const mongoose = require('mongoose');

// Schema for individual items within the cart
const cartItemSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product' // Refers to the Product model
    },
    // Storing name, image, and price directly here for convenience and resilience
    name: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1 // Quantity cannot be less than 1
    }
}, { _id: false }); // Do not create a separate _id for subdocuments in the array

// Main Cart schema
const cartSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique: true // Each user can only have one cart document
    },
    items: [cartItemSchema] // Array of cart item subdocuments
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
