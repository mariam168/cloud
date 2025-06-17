const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware'); 
const Order = require('../models/Order'); 
const Cart = require('../models/Cart');
const Product = require('../models/Product'); // <--- Import Product model

// Helper to validate Order items and decrement stock
const validateAndProcessOrderItems = async (items, userId) => {
    const processedItems = [];
    const stockUpdates = []; // To store updates for bulkWrite

    for (const item of items) {
        // **فحص حاسم هنا:** التأكد أن item.product ليس null/undefined قبل البحث عنه
        // هذا الفحص يجب أن يمنع الخطأ الحالي.
        if (!item.product) {
            throw new Error(`Invalid order item: Product ID is missing or null.`);
        }

        const product = await Product.findById(item.product);
        if (!product) {
            // هذا يعني أن المنتج تم حذفه من قاعدة البيانات بعد إضافته للسلة.
            throw new Error(`Product with ID ${item.product} not found in database.`);
        }

        let variantChosen = null;
        let finalStockToDecrement = item.quantity;
        let stockFieldPath = 'stock'; // Default for non-variant products

        if (item.selectedVariant) {
            // يتم استخدام .id() هنا للبحث داخل مصفوفة sub-documents
            variantChosen = product.variations.id(item.selectedVariant);
            if (!variantChosen) {
                throw new Error(`Variant with ID ${item.selectedVariant} not found for product ${product.name.en}.`);
            }
            if (variantChosen.stock < item.quantity) {
                throw new Error(`Not enough stock for ${product.name.en} (${variantChosen.options.map(o => o.optionValue).join(', ')}). Available: ${variant.stock}, Requested: ${item.quantity}.`);
            }
            stockFieldPath = `variations.$[elem].stock`; 
            
            stockUpdates.push({
                updateOne: {
                    filter: { _id: product._id, 'variations._id': variantChosen._id },
                    update: { $inc: { [stockFieldPath]: -finalStockToDecrement } },
                    arrayFilters: [{ 'elem._id': variantChosen._id }]
                }
            });

            processedItems.push({
                product: item.product,
                name: item.name,
                image: item.image,
                price: item.price,
                quantity: item.quantity,
                selectedVariant: item.selectedVariant,
                variantDetails: { 
                    options: variantChosen.options,
                    image: variantChosen.image,
                    priceAdjustment: variantChosen.priceAdjustment,
                    sku: variantChosen.sku,
                }
            });

        } else {
            // للمنتجات بدون variants (تأكد أن المنتج ليس له variants مسجلة)
            if (product.variations && product.variations.length > 0) {
                throw new Error(`Product ${product.name.en} requires a variant selection, but none was provided.`);
            }

            if (product.stock !== undefined && product.stock < item.quantity) {
                throw new Error(`Not enough stock for ${product.name.en}. Available: ${product.stock}, Requested: ${item.quantity}.`);
            }

            stockUpdates.push({
                updateOne: {
                    filter: { _id: product._id },
                    update: { $inc: { [stockFieldPath]: -finalStockToDecrement } }
                }
            });

            processedItems.push({
                product: item.product,
                name: item.name,
                image: item.image,
                price: item.price,
                quantity: item.quantity,
                selectedVariant: null, 
                variantDetails: null
            });
        }
    }

    if (stockUpdates.length > 0) {
        await Product.bulkWrite(stockUpdates);
    }

    return processedItems;
};


router.post('/', protect, async (req, res) => {
    try {
        const {
            orderItems, // هذه هي القائمة التي تأتي من الـ frontend
            shippingAddress,
            paymentMethod,
            taxPrice,
            shippingPrice,
            totalPrice,
        } = req.body;

        // **الإصلاح الرئيسي هنا: تنظيف orderItems في الـ backend قبل معالجتها**
        // هذا يضمن أن validateAndProcessOrderItems لا تتلقى أي item.product: null
        const cleanedOrderItems = orderItems.filter(item => item.product !== null && item.product !== undefined);

        if (!cleanedOrderItems || cleanedOrderItems.length === 0) {
            return res.status(400).json({ message: 'No valid order items provided.' });
        }

        // استخدام القائمة المنظفة للمعالجة وتحديث المخزون
        const validatedOrderItems = await validateAndProcessOrderItems(cleanedOrderItems, req.user.id);
        
        const order = new Order({
            user: req.user.id, 
            orderItems: validatedOrderItems, 
            shippingAddress,
            paymentMethod,
            taxPrice,
            shippingPrice,
            totalPrice,
        });

        const createdOrder = await order.save();
        
        // إزالة السلة بعد الطلب الناجح
        try {
            await Cart.findOneAndDelete({ user: req.user.id });
            console.log(`Cart cleared for user ${req.user.id} after order ${createdOrder._id}.`);
        } catch (cartError) {
            console.error(`Failed to clear cart for user ${req.user.id} after order ${createdOrder._id}:`, cartError);
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        if (error.message.includes('stock') || error.message.includes('variant') || error.message.includes('Product with ID')) {
            return res.status(400).json({ message: error.message }); 
        } else if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: `Validation failed: ${messages.join(', ')}` });
        }
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (order) {
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