const mongoose = require('mongoose');

// Schema for individual items within an order
// Similar to cart item schema, but captures the state at the time of order
const orderItemSchema = mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    image: { type: String },
    price: { type: Number, required: true }, // Price at the time of order
    product: { // Reference to the original product, but not strictly required for order history display
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true // It's good practice to link to the original product
    },
}, { _id: false }); // Don't create separate _id for subdocuments

// Main Order schema
const orderSchema = mongoose.Schema({
    user: { // User who placed the order
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    orderItems: [orderItemSchema], // Array of items in the order
    shippingAddress: { // Shipping address details
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
    },
    paymentMethod: { // e.g., 'PayPal', 'Stripe', 'Cash on Delivery'
        type: String,
        required: true,
    },
    paymentResult: { // Details from payment gateway after successful payment
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String },
    },
    taxPrice: { // Tax amount
        type: Number,
        required: true,
        default: 0.0,
    },
    shippingPrice: { // Shipping cost
        type: Number,
        required: true,
        default: 0.0,
    },
    totalPrice: { // Total amount paid
        type: Number,
        required: true,
        default: 0.0,
    },
    isPaid: { // Payment status
        type: Boolean,
        required: true,
        default: false,
    },
    paidAt: { // Timestamp of payment
        type: Date,
    },
    isDelivered: { // Delivery status
        type: Boolean,
        required: true,
        default: false,
    },
    deliveredAt: { // Timestamp of delivery
        type: Date,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
