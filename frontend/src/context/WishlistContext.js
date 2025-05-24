import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom'; 

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const { isAuthenticated, currentUser, API_BASE_URL, token } = useAuth();
  const navigate = useNavigate();

  const fetchWishlist = useCallback(async () => {
    if (isAuthenticated && API_BASE_URL && token) {
      setLoadingWishlist(true);
      try {
        // التأكد من إرسال التوكن لطلب المفضلة
        const response = await axios.get(`${API_BASE_URL}/api/wishlist`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setWishlistItems(response.data || []);
      } catch (error) {
        console.error('WishlistContext: Failed to fetch wishlist:', error.response ? error.response.data : error.message);
      } finally {
        setLoadingWishlist(false); 
      }
    } else {
      setWishlistItems([]);
    }
  }, [isAuthenticated, API_BASE_URL, token]); // إضافة token إلى dep array

  useEffect(() => {
    if (isAuthenticated && currentUser && token) { // إضافة token إلى dep array
      fetchWishlist(); 
    } else if (!isAuthenticated) {
      setWishlistItems([]);
    }
  }, [isAuthenticated, currentUser, token, fetchWishlist]); // إضافة token إلى dep array

  const addToWishlist = async (product) => {
    console.log("WishlistContext: addToWishlist called with product:", product);
    if (!isAuthenticated || !API_BASE_URL) {
      alert('Please login to add items to your wishlist.');
      navigate('/login');
      return;
    }
    const productId = product._id; // التأكد من الحصول على الـ ID بغض النظر عن نوع الكائن
    if (!productId) {
      console.error("WishlistContext: Product ID is undefined in addToWishlist!", product);
      alert("لا يمكن إضافة المنتج للمفضلة: بيانات المنتج غير مكتملة عند الإضافة.");
      return;
    }
    // في حال كانت wishlistItems تحوي فقط الـ IDs:
    if (wishlistItems.some(item => item.toString() === productId.toString())) {
        console.log("WishlistContext: Product already in wishlist:", productId);
        return; 
    }

    try {
      // التأكد من إرسال التوكن لطلب الإضافة
      const response = await axios.post(`${API_BASE_URL}/api/wishlist/${productId}`, {}, { // استخدام productId هنا
        headers: { Authorization: `Bearer ${token}` }
      });
      // تحديث قائمة المفضلة من الاستجابة أو إعادة جلبها بالكامل
      setWishlistItems(response.data.wishlist || []); 
      console.log("WishlistContext: Added to wishlist (server response), product ID:", productId);
    } catch (error) {
      console.error('WishlistContext: Failed to add to wishlist:', error.response ? error.response : error);
      alert(`Could not add product to wishlist. Server said: ${error.response?.data?.message || error.message}`);
    }
  };

  const removeFromWishlist = async (productId) => {
    console.log("WishlistContext: removeFromWishlist called with productId:", productId);
    if (!isAuthenticated || !API_BASE_URL) return;
    if (!productId) {
        console.error("WishlistContext: Product ID is undefined in removeFromWishlist!");
        alert("لا يمكن إزالة المنتج من المفضلة: معرّف المنتج مفقود.");
        return;
    }

    try {
      // التأكد من إرسال التوكن لطلب الحذف
      const response = await axios.delete(`${API_BASE_URL}/api/wishlist/${productId}`, { // استخدام productId هنا
          headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistItems(response.data.wishlist || []);
      console.log("WishlistContext: Removed from wishlist (server), product ID:", productId);
    } catch (error) {
      console.error('WishlistContext: Failed to remove from wishlist:', error.response ? error.response.data : error.message);
      alert('Could not remove product from wishlist.');
    }
  };

  const isFavorite = (productId) => {
    if (!productId) return false;
    // إذا كانت wishlistItems تخزن فقط الـ IDs:
    return wishlistItems.some(item => item.toString() === productId.toString());
    // إذا كانت تخزن كائنات المنتجات:
    // return wishlistItems.some(item => item._id && item._id.toString() === productId.toString());
  };

  const toggleFavorite = async (product) => {
    console.log("WishlistContext: toggleFavorite called with product:", product);
    if (!isAuthenticated) {
        alert("يرجى تسجيل الدخول لاستخدام المفضلة.");
        navigate('/login'); 
        return;
    }
    const productId = product._id; // التأكد من الحصول على الـ ID بغض النظر عن نوع الكائن
    if (!productId) {
        console.error("WishlistContext: Product ID is undefined in toggleFavorite!", product);
        alert("لا يمكن تبديل حالة المفضلة: بيانات المنتج غير مكتملة.");
        return;
    }
    if (isFavorite(productId)) { // استخدام productId هنا
      await removeFromWishlist(productId); // استخدام productId هنا
    } else {
      await addToWishlist(product); 
    }
  };

  const value = {
    wishlistItems, 
    addToWishlist,
    removeFromWishlist, 
    isFavorite, 
    toggleFavorite,
    wishlistCount: wishlistItems.length, // يعتمد على أن wishlistItems هي مصفوفة IDs أو كائنات Product
    loadingWishlist,
    fetchWishlist, 
  };
  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};