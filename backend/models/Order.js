const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
    },
    name: {
        en: {
            type: String,
            required: true
        },
        ar: {
            type: String,
            required: true 
        }
    },
    image: { // This will store the final image used for the order item (main product or variant image)
        type: String 
    },
    price: { // This will store the final price for this specific order item (base + variant adjustment)
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1 
    },
    // Add selectedVariant to reference the specific variant purchased
    selectedVariant: { 
        type: mongoose.Schema.Types.ObjectId,
        default: null // Will be null for non-variant products
    },
    // Add variantDetails to store a snapshot of the variant's properties at the time of order
    variantDetails: {
        _id: false,
        options: [{
            _id: false,
            optionName: { type: String },
            optionValue: { type: String },
        }],
        image: { type: String },
        priceAdjustment: { type: Number, default: 0 },
        sku: { type: String },
        // Important: We store the stock count at the time of order if needed for records,
        // but it doesn't affect current stock. The actual stock decrement happens in the route.
        // stock: { type: Number } 
    }
}, {
    _id: false
});

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', 
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String },
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false,
    },
    paidAt: {
        type: Date,
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false,
    },
    deliveredAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;