// backend/routes/orders.js

const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware'); 
const Order = require('../models/Order'); 
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { shippingAddress, paymentMethod, discount } = req.body;
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty' });
        }

        // --- ( بداية التعديل الجوهري ) ---
        // 1. حساب سعر المنتجات مباشرة من السلة (التي تحتوي على الأسعار الصحيحة)
        const itemsPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

        // 2. حساب السعر الإجمالي بعد الخصم
        const totalPrice = itemsPrice - (discount?.amount || 0);

        // 3. إنشاء الطلب باستخدام بيانات السلة مباشرة
        const order = new Order({
            user: req.user.id,
            orderItems: cart.items, // <-- نستخدم بيانات السلة كما هي
            shippingAddress,
            paymentMethod,
            itemsPrice,
            totalPrice: totalPrice > 0 ? totalPrice : 0, // السعر لا يمكن أن يكون أقل من صفر
            discount: discount ? { code: discount.code, amount: discount.amount } : undefined,
        });
        // --- ( نهاية التعديل الجوهري ) ---

        const createdOrder = await order.save();
        
        // تحديث مخزون المنتجات (هذا الجزء صحيح ولا يحتاج تعديل)
        for (const item of createdOrder.orderItems) {
            const product = await Product.findById(item.product);
            if (!product) continue;

            if (item.selectedVariant) { // لاحظ أننا نستخدم selectedVariant من cart.item
                const sku = product.variations
                    .flatMap(v => v.options.flatMap(o => o.skus))
                    .find(s => s._id.equals(item.selectedVariant));
                if (sku && sku.stock !== undefined) {
                    sku.stock -= item.quantity;
                }
            } else if (product.stock !== undefined) {
                product.stock -= item.quantity;
            }
            await product.save();
        }
        
        // حذف السلة بعد إنشاء الطلب
        await Cart.deleteOne({ user: req.user.id });
        
        res.status(201).json(createdOrder);

    } catch (error) {
        console.error('Error creating order:', error.message);
        res.status(400).json({ message: error.message });
    }
});

// --- ( باقي الملف بدون تغيير ) ---

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => { 
    try { 
        const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 }); 
        res.json(orders); 
    } catch (e) { 
        res.status(500).json({ message: 'Server Error' }); 
    } 
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => { 
    try { 
        const order = await Order.findById(req.params.id).populate('user', 'name email').lean();

        if (order) { 
            if (order.user._id.toString() !== req.user.id.toString() && req.user.role !== 'admin') { 
                return res.status(401).json({ message: 'Not authorized to view this order' }); 
            }

            const populatedOrderItems = await Promise.all(order.orderItems.map(async (item) => {
                const product = await Product.findById(item.product).lean();
                if (!product) {
                    return item;
                }
                if (item.selectedVariantId) {
                    let details = [];
                    product.variations.forEach(v => {
                        const opt = v.options.find(o => o.skus.some(s => s._id.equals(item.selectedVariantId)));
                        if (opt) {
                            details.push({
                                variationName: v.name,
                                optionName: opt.name   
                            });
                        }
                    });
                    return { ...item, dynamicVariantDetails: details };
                }
                return item; 
            }));
            
            res.json({ ...order, orderItems: populatedOrderItems }); 

        } else { 
            res.status(404).json({ message: 'Order not found' }); 
        } 
    } catch (e) { 
        console.error("Error fetching order details:", e)
        res.status(500).json({ message: 'Server Error' }); 
    } 
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin
router.put('/:id/pay', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: req.body.id || `ADMIN_PAID_${Date.now()}`,
                status: req.body.status || 'COMPLETED',
                update_time: req.body.update_time || new Date().toISOString(),
                email_address: req.body.email_address,
            };
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
router.put('/:id/deliver', protect, admin, async (req, res) => { 
    try { 
        const order = await Order.findById(req.params.id); 
        if (order) { 
            order.isDelivered = true; 
            order.deliveredAt = Date.now(); 
            const updatedOrder = await order.save(); 
            res.json(updatedOrder); 
        } else { 
            res.status(404).json({ message: 'Order not found' }); 
        } 
    } catch (e) { 
        res.status(500).json({ message: 'Server Error' }); 
    } 
});

module.exports = router;