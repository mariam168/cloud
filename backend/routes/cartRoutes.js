const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Advertisement = require('../models/Advertisement');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
    try {
        // We populate the product details to ensure cart data is fresh
        const userCart = await Cart.findOne({ user: req.user.id })
            .populate({
                path: 'items.product',
                select: 'name mainImage images variations' 
            });

        if (!userCart) {
            return res.status(200).json({ cart: [] });
        }
        
        // You could add a step here to re-validate prices if needed, but for now we trust the price at time of add.
        res.status(200).json({ cart: userCart.items });

    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/', protect, async (req, res) => {
    try {
        const { productId, quantity = 1, selectedVariantId = null } = req.body;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        
        let userCart = await Cart.findOne({ user: req.user.id });
        if (!userCart) userCart = new Cart({ user: req.user.id, items: [] });
        
        const existingItemIndex = userCart.items.findIndex(item => 
            item.product.toString() === productId && 
            String(item.selectedVariant || null) === String(selectedVariantId || null)
        );

        // --- ( بداية التعديل الجوهري لمنطق السعر ) ---

        // 1. تحديد السعر الأساسي للحساب (سعر المنتج الافتراضي أو سعر الـ SKU)
        let priceForCalculation = product.basePrice;
        let finalImage = product.mainImage;
        let finalStock = product.stock;
        let variantDetailsText = '';

        if (selectedVariantId) {
            const sku = product.variations
                .flatMap(v => v.options.flatMap(o => o.skus))
                .find(s => s._id.equals(selectedVariantId));
            
            if (!sku) return res.status(400).json({ message: 'Variant not found' });

            priceForCalculation = sku.price; // سعر الـ SKU هو الأساس للحساب
            finalStock = sku.stock;

            const optionParent = product.variations
                .flatMap(v => v.options)
                .find(o => o.skus.some(s => s._id.equals(selectedVariantId)));
            
            if (optionParent?.image) finalImage = optionParent.image;
            
            // إنشاء نص وصفي للمتغير
            variantDetailsText = [optionParent?.name_en, sku.name_en].filter(Boolean).join(' / ');
        }

        // 2. التحقق من وجود عرض خاص.
        const activeAd = await Advertisement.findOne({
            productRef: productId,
            isActive: true,
            startDate: { $lte: new Date() },
            $or: [{ endDate: { $gte: new Date() } }, { endDate: null }]
        });
        
        // 3. حساب السعر النهائي. يبدأ بالسعر الأساسي ثم يطبق الخصم إن وجد.
        let finalPrice = priceForCalculation;
        
        if (activeAd && activeAd.discountPercentage > 0) {
            const discountMultiplier = 1 - (activeAd.discountPercentage / 100);
            finalPrice = priceForCalculation * discountMultiplier;
        }

        // تقريب السعر لتجنب مشاكل الأرقام العشرية
        finalPrice = Math.round(finalPrice * 100) / 100;

        // --- ( نهاية التعديل الجوهري لمنطق السعر ) ---

        if (existingItemIndex > -1) {
            userCart.items[existingItemIndex].quantity += quantity;
            // تحديث السعر في حال تغير (مثلاً بدأ عرض جديد على منتج موجود في السلة)
            userCart.items[existingItemIndex].price = finalPrice; 
            userCart.items[existingItemIndex].stock = finalStock;
        } else {
            userCart.items.push({ 
                product: productId, 
                name: product.name,
                image: finalImage,
                price: finalPrice, // استخدام السعر النهائي المحسوب
                quantity, 
                selectedVariant: selectedVariantId,
                variantDetailsText: variantDetailsText,
                stock: finalStock
            });
        }

        await userCart.save();
        const populatedCart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name');
        res.status(201).json({ cart: populatedCart.items });

    } catch (error) {
        console.error("Cart POST error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.put('/', protect, async (req, res) => {
    try {
        const { productId, quantity, selectedVariantId = null } = req.body;
        const numQuantity = Number(quantity);
        if (isNaN(numQuantity) || numQuantity < 0) return res.status(400).json({ message: 'Invalid quantity' });

        const userCart = await Cart.findOne({ user: req.user.id });
        if (!userCart) return res.status(404).json({ message: 'Cart not found' });

        const itemIndex = userCart.items.findIndex(item => 
            item.product.toString() === productId && 
            String(item.selectedVariant || null) === String(selectedVariantId || null)
        );

        if (itemIndex === -1) return res.status(404).json({ message: 'Item not found in cart' });

        if (numQuantity === 0) {
            userCart.items.splice(itemIndex, 1);
        } else {
            userCart.items[itemIndex].quantity = numQuantity;
        }

        await userCart.save();
        const populatedCart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name');
        res.status(200).json({ cart: populatedCart.items });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.delete('/clear', protect, async (req, res) => {
    try {
        const userCart = await Cart.findOne({ user: req.user.id });

        if (!userCart) {
            return res.status(200).json({ message: 'Cart is already empty.' });
        }

        userCart.items = [];
        await userCart.save();

        res.status(200).json({ message: 'Cart cleared successfully.' });
        
    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ message: 'Internal Server Error while clearing cart.' });
    }
});

module.exports = router;