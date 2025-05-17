const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');     // Import the Mongoose Cart model
const Product = require('../models/Product'); // Import the Product model to fetch product details
const { protect } = require('../middleware/authMiddleware'); // Import your authentication middleware

// @desc    Add product to user's cart with a specific quantity
// @route   POST /api/cart/:productId
// @access  Private (requires authentication)
router.post('/:productId', protect, async (req, res) => {
    try {
        // userId is available from req.user.id after the 'protect' middleware
        const userId = req.user.id;
        const productId = req.params.productId; // Get product ID from URL parameter
        const { quantity = 1 } = req.body; // Get quantity from body, default to 1 if not provided

        // Validate quantity
        const numQuantity = Number(quantity);
        if (isNaN(numQuantity) || !Number.isInteger(numQuantity) || numQuantity < 1) {
             return res.status(400).json({ message: 'Quantity must be a positive integer.' });
        }


        // 1. Find the product to get its details (name, price, image)
        const productToAdd = await Product.findById(productId);
        if (!productToAdd) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // 2. Find the user's cart or create a new one if it doesn't exist
        let userCart = await Cart.findOne({ user: userId });

        if (!userCart) {
            // Create a new cart for the user if one doesn't exist
            userCart = new Cart({ user: userId, items: [] });
        }

        // 3. Check if the product already exists in the cart
        const existingItemIndex = userCart.items.findIndex(
            (item) => item.product.toString() === productId // Convert ObjectId to string for comparison
        );

        if (existingItemIndex > -1) {
            // Product exists, add the specified quantity
            userCart.items[existingItemIndex].quantity += numQuantity;
        } else {
            // Product does not exist, add it as a new item with the specified quantity
            userCart.items.push({
                product: productId,
                name: productToAdd.name,
                image: productToAdd.image,
                price: productToAdd.price,
                quantity: numQuantity, // Use the specified quantity
            });
        }

        // 4. Save the updated cart to the database
        await userCart.save();

        // 5. Respond with the updated list of cart items
        res.status(201).json({ message: 'Product added to cart successfully', cart: userCart.items });

    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private (requires authentication)
router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from the protect middleware

        // Find the user's cart
        const userCart = await Cart.findOne({ user: userId });

        if (!userCart) {
            // If no cart found, return an empty array (common practice for user experience)
            return res.status(200).json({ message: 'Cart not found for this user, returning empty.', cart: [] });
        }

        res.status(200).json({ message: 'Cart fetched successfully', cart: userCart.items });

    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// @desc    Remove product from user's cart
// @route   DELETE /api/cart/:productId
// @access  Private (requires authentication)
router.delete('/:productId', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const productIdToRemove = req.params.productId;

        let userCart = await Cart.findOne({ user: userId });

        if (!userCart) {
            return res.status(404).json({ message: 'Cart not found for this user' });
        }

        // Find the index of the item to remove
        const itemIndex = userCart.items.findIndex(
            (item) => item.product.toString() === productIdToRemove
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        // Remove the item from the array using splice
        userCart.items.splice(itemIndex, 1);

        // Save the updated cart
        await userCart.save();

        res.status(200).json({ message: 'Product removed from cart successfully', cart: userCart.items });

    } catch (error) {
        console.error('Error removing product from cart:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// @desc    Update quantity of a product in the user's cart
// @route   PUT /api/cart/:productId
// @access  Private (requires authentication)
router.put('/:productId', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const productIdToUpdate = req.params.productId;
        const { quantity } = req.body; // Expect quantity in the request body

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

        userCart.items[itemIndex].quantity = numQuantity; // Use the specified quantity

        await userCart.save();
        res.status(200).json({ message: 'Cart item quantity updated successfully', cart: userCart.items });

    } catch (error) {
        console.error('Error updating cart item quantity:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});


module.exports = router;
