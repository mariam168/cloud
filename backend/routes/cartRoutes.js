const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');
router.post('/:productId', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;
        const { quantity = 1 } = req.body;
        const numQuantity = Number(quantity);
        if (isNaN(numQuantity) || !Number.isInteger(numQuantity) || numQuantity < 1) {
             return res.status(400).json({ message: 'Quantity must be a positive integer.' });
        }
        let userCart = await Cart.findOne({ user: userId });
        if (!userCart) {
            userCart = new Cart({ user: userId, items: [] });
        }
        const existingItemIndex = userCart.items.findIndex(
            (item) => item.product.toString() === productId
        );
        if (existingItemIndex > -1) {
            userCart.items[existingItemIndex].quantity += numQuantity;
        } else {
            const productToAdd = await Product.findById(productId);
            if (!productToAdd) {
                return res.status(404).json({ message: 'Product not found' });
            }
            userCart.items.push({
                product: productId, 
                name: productToAdd.name,
                image: productToAdd.image,
                price: productToAdd.price,
                quantity: numQuantity, 
            });
        }
        await userCart.save();
        res.status(201).json({ message: 'Product added to cart successfully', cart: userCart.items });
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const userCart = await Cart.findOne({ user: userId });
        if (!userCart) {
            return res.status(200).json({ message: 'Cart not found for this user, returning empty.', cart: [] });
        }
        res.status(200).json({ message: 'Cart fetched successfully', cart: userCart.items });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
router.delete('/:productId', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const productIdToRemove = req.params.productId;
        let userCart = await Cart.findOne({ user: userId });
        if (!userCart) {
            return res.status(404).json({ message: 'Cart not found for this user' });
        }
        const itemIndex = userCart.items.findIndex(
            (item) => item.product.toString() === productIdToRemove
        );
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }
        userCart.items.splice(itemIndex, 1);
        await userCart.save();
        res.status(200).json({ message: 'Product removed from cart successfully', cart: userCart.items });
    } catch (error) {
        console.error('Error removing product from cart:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
router.put('/:productId', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const productIdToUpdate = req.params.productId;
        const { quantity } = req.body;
        const numQuantity = Number(quantity);
        if (isNaN(numQuantity) || !Number.isInteger(numQuantity) || numQuantity < 1) {
            return res.status(400).json({ message: 'Quantity must be a positive integer.' });
        }
        let userCart = await Cart.findOne({ user: userId });
        if (!userCart) {
            return res.status(404).json({ message: 'Cart not found for this user' });
        }
        const itemIndex = userCart.items.findIndex(
            (item) => item.product.toString() === productIdToUpdate
        );
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }
        userCart.items[itemIndex].quantity = numQuantity;
        await userCart.save();
        res.status(200).json({ message: 'Cart item quantity updated successfully', cart: userCart.items });
    } catch (error) {
        console.error('Error updating cart item quantity:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
router.delete('/', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await Cart.findOneAndDelete({ user: userId });
        if (result) {
            res.status(200).json({ message: 'Cart cleared successfully', cart: [] });
        } else {
            res.status(200).json({ message: 'No cart found to clear', cart: [] });
        }
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
module.exports = router;
