const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware'); 
const Order = require('../models/Order'); 
const Cart = require('../models/Cart');

// Create a new order (requires authentication)
router.post('/', protect, async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            taxPrice,
            shippingPrice,
            totalPrice,
        } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        const order = new Order({
            user: req.user.id, 
            orderItems,
            shippingAddress,
            paymentMethod,
            taxPrice,
            shippingPrice,
            totalPrice,
        });

        const createdOrder = await order.save();

        // Clear the user's cart after a successful order
        try {
            await Cart.findOneAndDelete({ user: req.user.id });
            console.log(`Cart cleared for user ${req.user.id} after order ${createdOrder._id}.`);
        } catch (cartError) {
            console.error(`Failed to clear cart for user ${req.user.id} after order ${createdOrder._id}:`, cartError);
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// Get order by ID (requires authentication, allows user to view their own order or admin to view any)
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (order) {
            // ADDED CHECK: Ensure order.user exists before accessing its properties
            if (order.user && order.user._id.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
                return res.status(401).json({ message: 'Not authorized to view this order' });
            }
            res.status(200).json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// Get all orders for the logged-in user (requires authentication)
router.get('/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id });
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// Get all orders (Admin only)
router.get('/', protect, admin, async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name');
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching all orders (Admin):', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// Update order to paid (Admin only)
router.put('/:id/pay', protect, admin, async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    isPaid: true,
                    paidAt: Date.now(),
                    'paymentResult.id': req.body.id,
                    'paymentResult.status': req.body.status,
                    'paymentResult.update_time': req.body.update_time,
                    'paymentResult.email_address': req.body.email_address,
                },
            },
            { new: true, runValidators: false }
        ).populate('user', 'name email');

        if (updatedOrder) {
            res.status(200).json(updatedOrder); 
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Error updating order to paid:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// Update order to delivered (Admin only)
router.put('/:id/deliver', protect, admin, async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    isDelivered: true,
                    deliveredAt: Date.now(),
                },
            },
            { new: true, runValidators: false }
        ).populate('user', 'name email');

        if (updatedOrder) {
            res.status(200).json(updatedOrder); 
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Error updating order to delivered:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

module.exports = router;