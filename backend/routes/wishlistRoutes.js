const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); 
const User = require('../models/User');
const Product = require('../models/Product'); 
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});
router.post('/:productId', protect, async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.wishlist.includes(productId)) {
    } else {
      user.wishlist.push(productId);
      await user.save();
    }
    const updatedUser = await User.findById(req.user.id).populate('wishlist');
    res.status(200).json({ message: 'Product added to wishlist', product, wishlist: updatedUser.wishlist });

  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});
router.delete('/:productId', protect, async (req, res) => {
  try {
    const productId = req.params.productId;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId
    );
    await user.save();

    const updatedUser = await User.findById(req.user.id).populate('wishlist');
    res.status(200).json({ message: 'Product removed from wishlist', productId, wishlist: updatedUser.wishlist });

  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;