const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product'); 
const { protect } = require('../middleware/authMiddleware');

// Helper function to compare variant IDs, handling null/undefined
const areVariantsEqual = (variantId1, variantId2) => {
    // If both are null/undefined, they are considered equal (for products without variants)
    if (!variantId1 && !variantId2) return true;
    // If one is null/undefined and the other isn't, they are not equal
    if (!variantId1 || !variantId2) return false;
    // Compare string representations of ObjectIds
    return variantId1.toString() === variantId2.toString();
};

// @route   POST /api/cart/:productId
// @desc    Add item to cart or update quantity if exists
// @access  Private
router.post('/:productId', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId; // Product ID from URL params
        const { quantity = 1, selectedVariantId = null } = req.body; // Quantity and selectedVariantId from request body
        
        const numQuantity = Number(quantity);
        if (isNaN(numQuantity) || !Number.isInteger(numQuantity) || numQuantity < 1) {
             return res.status(400).json({ message: 'Quantity must be a positive integer.' });
        }

        let userCart = await Cart.findOne({ user: userId });
        if (!userCart) {
            userCart = new Cart({ user: userId, items: [] });
        }

        const productToAdd = await Product.findById(productId);
        if (!productToAdd) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let itemPrice = productToAdd.price;
        let itemImage = productToAdd.mainImage;
        let variantDetailsForCart = null;
        let currentStock = productToAdd.stock; // Default to product's overall stock

        // Handle variations
        if (productToAdd.variations && productToAdd.variations.length > 0) {
            if (!selectedVariantId) {
                return res.status(400).json({ message: 'Product requires a variant selection (e.g., Color, Size).' });
            }
            const chosenVariant = productToAdd.variations.id(selectedVariantId);
            if (!chosenVariant) {
                return res.status(400).json({ message: 'Invalid product variant selected. Please check product options.' });
            }
            currentStock = chosenVariant.stock; // Use variant's stock
            itemPrice += chosenVariant.priceAdjustment || 0;
            itemImage = chosenVariant.image || productToAdd.mainImage; // Use variant image if available, else main product image
            variantDetailsForCart = {
                options: chosenVariant.options,
                image: chosenVariant.image,
                priceAdjustment: chosenVariant.priceAdjustment,
                sku: chosenVariant.sku,
                stock: chosenVariant.stock 
            };
        } else {
            // For products without variations, ensure selectedVariantId is null
            if (selectedVariantId) {
                // If a variant ID is sent for a product without variations, it's an error.
                return res.status(400).json({ message: 'Product does not have variations; no variant selection is allowed.' });
            }
        }

        // Check stock before adding to cart (for both initial add and quantity increase)
        if (currentStock !== undefined && currentStock < numQuantity) {
            return res.status(400).json({ message: `Not enough stock. Available: ${currentStock}` });
        }

        // Find if the exact item (product + variant) already exists in cart
        const existingItemIndex = userCart.items.findIndex(
            (item) => item.product.toString() === productId && 
                      areVariantsEqual(item.selectedVariant, selectedVariantId)
        );

        if (existingItemIndex > -1) {
            const newQuantity = userCart.items[existingItemIndex].quantity + numQuantity;
            
            if (currentStock !== undefined && newQuantity > currentStock) {
                return res.status(400).json({ message: `Not enough stock. You have ${userCart.items[existingItemIndex].quantity} in cart. Available: ${currentStock}` });
            }
            userCart.items[existingItemIndex].quantity = newQuantity;
            // Update price and image in cart item in case product/variant details changed
            userCart.items[existingItemIndex].price = itemPrice; 
            userCart.items[existingItemIndex].image = itemImage;
            userCart.items[existingItemIndex].variantDetails = variantDetailsForCart; // Update variant details
        } else {
            userCart.items.push({
                product: productId, 
                name: productToAdd.name, 
                image: itemImage, 
                price: itemPrice, 
                quantity: numQuantity, 
                selectedVariant: selectedVariantId, 
                variantDetails: variantDetailsForCart // Store variant details
            });
        }

        await userCart.save();

        // Populate product name for the response (only name field needed)
        const updatedCart = await Cart.findOne({ user: userId }).populate('items.product', 'name');
        res.status(201).json({ message: 'Product added to cart successfully', cart: updatedCart.items });

    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        // Populate product name for the response
        const userCart = await Cart.findOne({ user: userId }).populate('items.product', 'name');

        if (!userCart) {
            // If no cart found, return an empty cart to the frontend
            return res.status(200).json({ message: 'Cart not found for this user, returning empty.', cart: [] });
        }

        res.status(200).json({ message: 'Cart fetched successfully', cart: userCart.items });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// @route   DELETE /api/cart/:productId
// @desc    Remove an item (or a specific variant of an item) from cart
// @access  Private
router.delete('/:productId', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const productIdToRemove = req.params.productId;
        const { selectedVariantId = null } = req.body; // Variant ID from request body
        
        let userCart = await Cart.findOne({ user: userId });

        if (!userCart) {
            return res.status(404).json({ message: 'Cart not found for this user' });
        }

        const initialItemCount = userCart.items.length;
        userCart.items = userCart.items.filter(
            (item) => !(item.product.toString() === productIdToRemove && 
                        areVariantsEqual(item.selectedVariant, selectedVariantId))
        );

        if (userCart.items.length === initialItemCount) {
            // No item was removed, means it wasn't found with the specified product/variant combination
            return res.status(404).json({ message: 'Product not found in cart with specified options' });
        }

        await userCart.save();

        const updatedCart = await Cart.findOne({ user: userId }).populate('items.product', 'name');
        res.status(200).json({ message: 'Product removed from cart successfully', cart: updatedCart.items });

    } catch (error) {
        console.error('Error removing product from cart:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// @route   PUT /api/cart/:productId
// @desc    Update quantity of an item (or a specific variant of an item) in cart
// @access  Private
router.put('/:productId', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const productIdToUpdate = req.params.productId;
        const { quantity, selectedVariantId = null } = req.body; // Quantity and variant ID from request body
        
        const numQuantity = Number(quantity);
        if (isNaN(numQuantity) || !Number.isInteger(numQuantity) || numQuantity < 1) {
            return res.status(400).json({ message: 'Quantity must be a positive integer.' });
        }

        let userCart = await Cart.findOne({ user: userId });
        if (!userCart) {
            return res.status(404).json({ message: 'Cart not found for this user' });
        }

        // Fetch product details to check stock
        const productDetails = await Product.findById(productIdToUpdate);
        if (!productDetails) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let currentStock = productDetails.stock;
        if (selectedVariantId) {
            const chosenVariant = productDetails.variations.id(selectedVariantId);
            if (!chosenVariant) {
                return res.status(400).json({ message: 'Invalid product variant selected.' });
            }
            currentStock = chosenVariant.stock; // Use variant stock
        }

        if (currentStock !== undefined && numQuantity > currentStock) {
            return res.status(400).json({ message: `Not enough stock. Available: ${currentStock}` });
        }

        // Find the specific item (product + variant) to update
        const itemIndex = userCart.items.findIndex(
            (item) => item.product.toString() === productIdToUpdate &&
                      areVariantsEqual(item.selectedVariant, selectedVariantId)
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Product not found in cart with specified options' });
        }

        userCart.items[itemIndex].quantity = numQuantity;
        await userCart.save();

        const updatedCart = await Cart.findOne({ user: userId }).populate('items.product', 'name');
        res.status(200).json({ message: 'Cart item quantity updated successfully', cart: updatedCart.items });

    } catch (error) {
        console.error('Error updating cart item quantity:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// @route   DELETE /api/cart
// @desc    Clear entire cart for the user
// @access  Private
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