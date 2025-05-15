// frontend/src/context/WishlistContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => {
  return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    // الآن سنخزن كائنات منتجات كاملة (أو جزئية) بدلاً من IDs فقط
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  // عدّل addToWishlist ليقبل كائن المنتج
  const addToWishlist = (product) => {
    // تأكد أن المنتج غير موجود بالفعل بناءً على _id
    if (!wishlistItems.find(item => item._id === product._id)) {
      // قم بتخزين فقط الحقول التي تحتاجها في القائمة المنسدلة وتفاصيل المنتج
      const itemToAdd = {
        _id: product._id,
        name: product.name,
        image: product.image, // تأكد أن هذا المسار صحيح أو كامل
        price: product.price,
        // يمكنك إضافة category إذا أردت
      };
      setWishlistItems(prevItems => [...prevItems, itemToAdd]);
    }
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems(prevItems => prevItems.filter(item => item._id !== productId));
  };

  const isFavorite = (productId) => {
    return wishlistItems.some(item => item._id === productId);
  };

  // عدّل toggleFavorite ليمرر كائن المنتج عند الإضافة
  const toggleFavorite = (product) => { // الآن يستقبل كائن المنتج كاملاً
    if (isFavorite(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product); // مرر المنتج كاملاً
    }
  };

  const value = {
    wishlistItems, // هذه الآن مصفوفة من كائنات المنتجات
    addToWishlist,
    removeFromWishlist,
    isFavorite,
    toggleFavorite,
    wishlistCount: wishlistItems.length,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};