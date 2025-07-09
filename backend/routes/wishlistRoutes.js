const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Product = require('../models/Product'); 
const Advertisement = require('../models/Advertisement');

// Helper Function to populate wishlist items with all necessary data
const populateWishlistItems = async (wishlist) => {
    if (!wishlist || wishlist.length === 0) {
        return [];
    }
    
    // 1. Fetch all products from the wishlist, populating their category
    const populatedProducts = await Product.find({
        '_id': { $in: wishlist }
    }).populate('category', 'name').lean();

    // 2. Find any active advertisements for these products
    const productIds = populatedProducts.map(p => p._id);
    const ads = await Advertisement.find({
        productRef: { $in: productIds },
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
    }).lean();
    
    // Create a map for quick lookups
    const adsMap = new Map(ads.map(ad => [ad.productRef.toString(), ad]));

    // 3. Combine product data with its related advertisement
    return populatedProducts.map(product => ({
        ...product,
        advertisement: adsMap.get(product._id.toString()) || null
    }));
};

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('wishlist').lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const fullyPopulatedWishlist = await populateWishlistItems(user.wishlist);
    
    res.json(fullyPopulatedWishlist);
  } catch (error) {
    next(error);
  }
});

// @desc    Add a product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
router.post('/:productId', protect, async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Use $addToSet to add the product ID to the wishlist array only if it's not already present.
    // This is more efficient than fetching the user, checking, and then saving.
    await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { wishlist: productId } 
    });
    
    // Fetch the updated user to populate and return the new wishlist
    const updatedUser = await User.findById(req.user.id).select('wishlist').lean();
    const fullyPopulatedWishlist = await populateWishlistItems(updatedUser.wishlist);

    res.status(200).json({ 
        message: 'Product added to wishlist successfully.', 
        wishlist: fullyPopulatedWishlist 
    });

  } catch (error) {
    next(error); 
  }
});

// @desc    Remove a product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
router.delete('/:productId', protect, async (req, res, next) => {
  try {
    const productId = req.params.productId;

    // Use $pull to remove the product ID from the wishlist array.
    await User.findByIdAndUpdate(req.user.id, {
        $pull: { wishlist: productId }
    });
    
    // Fetch the updated user to populate and return the new wishlist
    const updatedUser = await User.findById(req.user.id).select('wishlist').lean();
    const fullyPopulatedWishlist = await populateWishlistItems(updatedUser.wishlist);

    res.status(200).json({ 
        message: 'Product removed from wishlist successfully.', 
        wishlist: fullyPopulatedWishlist
    });

  } catch (error) {
    next(error); 
  }
});

module.exports = router;