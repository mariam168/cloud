const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware'); 
const Order = require('../models/Order'); 
const Cart = require('../models/Cart');
const Product = require('../models/Product');
router.post('/', protect, async (req, res) => {
    try {
        const { shippingAddress, paymentMethod, discount } = req.body;
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty' });
        }

        let itemsPrice = 0;
        const orderItemsPromises = cart.items.map(async (item) => {
            const product = await Product.findById(item.product);
            if (!product) throw new Error(`Product with ID ${item.product} not found.`);

            let finalPrice = product.basePrice, finalImage = product.mainImage, stock, variantDetailsText = '';
            
            if (item.selectedVariant) {
                let variant, option;
                for (const v of product.variations) {
                    for (const o of v.options) {
                        const foundSku = o.skus.id(item.selectedVariant);
                        if (foundSku) { variant = foundSku; option = o; break; }
                    }
                    if (variant) break;
                }
                
                if (!variant) throw new Error(`Variant not found.`);
                finalPrice = variant.price;
                finalImage = option.image || product.mainImage;
                stock = variant.stock;
                variantDetailsText = `${option.name_en} - ${variant.name_en}`;
            } else {
                stock = product.stock;
            }

            if (stock < item.quantity) throw new Error(`Not enough stock for ${product.name.en}.`);
            
            itemsPrice += finalPrice * item.quantity;
            return { product: product._id, name: product.name, image: finalImage, price: finalPrice, quantity: item.quantity, selectedVariantId: item.selectedVariant, variantDetailsText };
        });

        const orderItems = await Promise.all(orderItemsPromises);
        
        const totalPrice = itemsPrice - (discount?.amount || 0);

        const order = new Order({
            user: req.user.id, orderItems, shippingAddress, paymentMethod, itemsPrice, totalPrice,
            discount: discount ? { code: discount.code, amount: discount.amount } : undefined
        });

        const createdOrder = await order.save();
        
        for (const item of createdOrder.orderItems) {
            const product = await Product.findById(item.product);
            if (item.selectedVariantId) {
                const sku = product.variations.flatMap(v => v.options.flatMap(o => o.skus)).find(s => s._id.equals(item.selectedVariantId));
                if (sku) sku.stock -= item.quantity;
            } else if (product.stock !== undefined) {
                product.stock -= item.quantity;
            }
            await product.save();
        }
        
        await Cart.findOneAndDelete({ user: req.user.id });
        res.status(201).json(createdOrder);

    } catch (error) {
        console.error('Error creating order:', error.message);
        res.status(400).json({ message: error.message });
    }
});
router.get('/', protect, admin, async (req, res) => { 
    try { 
        const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 }); 
        res.json(orders); 
    } catch (e) { 
        res.status(500).json({ message: 'Server Error' }); 
    } 
});
router.get('/:id', protect, async (req, res) => { 
    try { 
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (order) { 
            if (order.user._id.toString() !== req.user.id.toString() && req.user.role !== 'admin') { 
                return res.status(401).json({ message: 'Not authorized' }); 
            } 
            res.json(order); 
        } else { 
            res.status(404).json({ message: 'Order not found' }); 
        } 
    } catch (e) { 
        res.status(500).json({ message: 'Server Error' }); 
    } 
});
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