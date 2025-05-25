const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Product = require('../models/Product'); 
router.get('/', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user.wishlist);
  } catch (error) {
    next(error);
  }
});
router.post('/:productId', protect, async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user.wishlist.includes(productId)) {
      const updatedUser = await User.findById(req.user.id).populate('wishlist');
      return res.status(200).json({ message: 'Product already in wishlist.', wishlist: updatedUser.wishlist });
    } else {
      user.wishlist.push(productId);
      await user.save();
    }
    const updatedUser = await User.findById(req.user.id).populate('wishlist');
    res.status(200).json({ message: 'Product added to wishlist successfully.', wishlist: updatedUser.wishlist });

  } catch (error) {
    next(error); 
  }
});
router.delete('/:productId', protect, async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const initialLength = user.wishlist.length;
    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId
    );

    if (user.wishlist.length === initialLength) {
        return res.status(404).json({ message: 'Product not found in wishlist.' });
    }

    await user.save();
    const updatedUser = await User.findById(req.user.id).populate('wishlist');
    res.status(200).json({ message: 'Product removed from wishlist successfully.', wishlist: updatedUser.wishlist });

  } catch (error) {
    next(error); 
  }
});

module.exports = router;