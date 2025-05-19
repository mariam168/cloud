const mongoose = require('mongoose');

const cartItemSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
    },
    name: {
        type: Object,
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
        min: 1
    }
}, { _id: false });

const cartSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique: true
    },
    items: [cartItemSchema]
}, {
    timestamps: true
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;