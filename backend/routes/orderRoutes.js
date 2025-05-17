const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware'); // Assuming authMiddleware is correctly set up
const Order = require('../models/Order'); // Import the Order model
const Cart = require('../models/Cart'); // Import Cart model to clear it after order

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (requires authentication)
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

        // Basic validation
        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // Create the order
        const order = new Order({
            user: req.user.id, // Get user ID from protect middleware
            orderItems,
            shippingAddress,
            paymentMethod,
            taxPrice,
            shippingPrice,
            totalPrice,
        });

        const createdOrder = await order.save();

        // Optional: Clear the user's cart after successfully creating the order
        // This assumes your Cart model is structured such that finding and removing
        // the user's cart document is the way to clear it.
        // await Cart.findOneAndDelete({ user: req.user.id });
        // console.log(`Cart cleared for user ${req.user.id} after order.`);


        res.status(201).json(createdOrder);

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (requires authentication)
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email'); // Populate user details

        if (order) {
            // Ensure the logged-in user is the owner of the order or is an admin
            if (order.user._id.toString() !== req.user.id.toString() && !req.user.isAdmin) {
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

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private (requires authentication)
router.get('/myorders', protect, async (req, res) => {
    try {
        // Find all orders for the logged-in user
        const orders = await Order.find({ user: req.user.id });
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});


// TODO: Add more routes for admin (get all orders, update order status, etc.)
// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
     try {
         const orders = await Order.find({}).populate('user', 'id name'); // Populate user id and name
         res.status(200).json(orders);
     } catch (error) {
         console.error('Error fetching all orders (Admin):', error);
         res.status(500).json({ message: 'Internal Server Error', error: error.message });
     }
});

// @desc    Update order to paid (Admin or Payment Gateway Callback)
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin or Public (depending on payment gateway setup)
// Note: For a real payment gateway, this route would likely be triggered by a webhook
// or a redirect after successful payment, and might not require the 'admin' middleware.
// For a simple implementation, we'll make it admin only for demonstration.
router.put('/:id/pay', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            // Add payment result details if available from the body (e.g., from a payment gateway)
            order.paymentResult = {
                 id: req.body.id,
                 status: req.body.status,
                 update_time: req.body.update_time,
                 email_address: req.body.email_address,
            };

            const updatedOrder = await order.save();
            res.status(200).json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Error updating order to paid:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// @desc    Update order to delivered (Admin only)
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
router.put('/:id/deliver', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isDelivered = true;
            order.deliveredAt = Date.now();

            const updatedOrder = await order.save();
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
