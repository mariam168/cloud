// backend/routes/wishlistRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // middleware لحماية المسارات
const User = require('../models/User');
const Product = require('../models/Product'); // للتأكد من وجود المنتج

// @route   GET /api/wishlist
// @desc    Get current user's wishlist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    // .populate('wishlist') لجلب تفاصيل المنتجات في المفضلة وليس فقط IDs
    // إذا أردت فقط IDs: const user = await User.findById(req.user.id).select('wishlist');
    // ثم: const products = await Product.find({ '_id': { $in: user.wishlist } });
    // لكن populate أسهل إذا كانت العلاقة صحيحة.

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.wishlist); // إرجاع مصفوفة المنتجات المفضلة
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/wishlist/:productId
// @desc    Add a product to current user's wishlist
// @access  Private
router.post('/:productId', protect, async (req, res) => {
  try {
    const productId = req.params.productId;
    // تحقق إذا كان المنتج موجوداً (اختياري لكن جيد)
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // تحقق إذا كان المنتج موجوداً بالفعل في المفضلة
    if (user.wishlist.includes(productId)) {
      // إذا أردت أن لا يتم إضافته مرة أخرى، يمكنك إرجاع رسالة أو القائمة الحالية
      // return res.status(200).json({ message: 'Product already in wishlist', wishlist: user.wishlist });
      // أو ببساطة لا تفعل شيئاً وأرجع القائمة المحدثة (التي لم تتغير)
    } else {
      user.wishlist.push(productId);
      await user.save();
    }
    
    // إرجاع المنتج الذي تمت إضافته (أو القائمة الكاملة المحدثة)
    const updatedUser = await User.findById(req.user.id).populate('wishlist');
    res.status(200).json({ message: 'Product added to wishlist', product, wishlist: updatedUser.wishlist });

  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/wishlist/:productId
// @desc    Remove a product from current user's wishlist
// @access  Private
router.delete('/:productId', protect, async (req, res) => {
  try {
    const productId = req.params.productId;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // إزالة المنتج من مصفوفة المفضلة
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