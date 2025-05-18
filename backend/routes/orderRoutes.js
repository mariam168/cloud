const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware'); 
const Order = require('../models/Order'); 
const Cart = require('../models/Cart');
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
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (order) {
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
router.get('/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id });
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
router.get('/', protect, admin, async (req, res) => {
     try {
         const orders = await Order.find({}).populate('user', 'id name');
         res.status(200).json(orders);
     } catch (error) {
         console.error('Error fetching all orders (Admin):', error);
         res.status(500).json({ message: 'Internal Server Error', error: error.message });
     }
});
router.put('/:id/pay', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            if (req.body.id) order.paymentResult.id = req.body.id;
            if (req.body.status) order.paymentResult.status = req.body.status;
            if (req.body.update_time) order.paymentResult.update_time = req.body.update_time;
            if (req.body.email_address) order.paymentResult.email_address = req.body.email_address;
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
