import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { useToast } from '../components/ToastNotification'; // استيراد useToast

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { t } = useLanguage();
  const { showToast } = useToast(); // استخلاص showToast من useToast
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const { isAuthenticated, currentUser, API_BASE_URL, token } = useAuth(); 
  const navigate = useNavigate();

  const fetchWishlist = useCallback(async () => {
    if (isAuthenticated && API_BASE_URL && token) {
      setLoadingWishlist(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/wishlist`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setWishlistItems(response.data || []); 
        console.log("WishlistContext: Fetched wishlist successfully.", response.data);
      } catch (error) {
        console.error('WishlistContext: Failed to fetch wishlist:', error.response?.data?.message || error.message);
        // لا داعي لعرض toast عند فشل جلب القائمة، لأنها قد تكون مجرد مشكلة مؤقتة أو عدم وجود عناصر
        setWishlistItems([]); 
      } finally {
        setLoadingWishlist(false);
      }
    } else {
      setWishlistItems([]); 
    }
  }, [isAuthenticated, API_BASE_URL, token]);

  useEffect(() => {
    if (isAuthenticated && currentUser && token) {
      fetchWishlist();
    } else if (!isAuthenticated) {
      setWishlistItems([]); 
    }
  }, [isAuthenticated, currentUser, token, fetchWishlist]); 

  const addToWishlist = async (productOrProductId) => {
    if (!isAuthenticated || !API_BASE_URL) {
      showToast(t('wishlist.loginRequired') || 'Please login to add items to your wishlist.', 'info');
      navigate('/login');
      return;
    }

    let productId = '';
    if (typeof productOrProductId === 'string') {
        productId = productOrProductId;
    } else if (typeof productOrProductId === 'object' && productOrProductId !== null) {
        productId = productOrProductId._id;
    } else {
        showToast(t('wishlist.productDataIncompleteAdd') || 'Product data is incomplete!', 'error');
        return;
    }

    if (!productId) { 
        showToast(t('wishlist.productDataIncompleteAdd') || 'Product data is incomplete!', 'error');
        return;
    }

    if (isFavorite(productId)) { 
        console.log("WishlistContext: Product already in wishlist (local check):", productId);
        showToast(t('wishlist.alreadyInWishlist') || "Product is already in your wishlist.", 'info'); // يمكن أن يكون info بدلاً من warning
        return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/wishlist/${productId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistItems(response.data.wishlist || []);
      console.log("WishlistContext: Added to wishlist (server response). Product ID:", productId, "Updated wishlist:", response.data.wishlist);
      // لا تعرض toast عند النجاح هنا (حسب طلبك)
    } catch (error) {
      console.error('WishlistContext: Failed to add to wishlist:', error.response?.data?.message || error.message);
      showToast(`${t('wishlist.addFailed') || 'Could not add product to wishlist. '}${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated || !API_BASE_URL) {
      // لا داعي لعرض toast هنا، لأنه يجب التعامل مع عدم المصادقة قبل محاولة الإزالة
      return;
    }
    if (!productId) {
        console.error("WishlistContext: Product ID is undefined in removeFromWishlist!");
        showToast(t('wishlist.productDataIncompleteRemove') || "Cannot remove product from wishlist: Product ID is missing.", 'error');
        return;
    }
    // لا نتحقق من isFavorite هنا لأننا نريد السماح للسيرفر بإزالة العنصر حتى لو كانت الحالة المحلية غير متزامنة
    // if (!isFavorite(productId)) { ... } 
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/wishlist/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistItems(response.data.wishlist || []); 
      console.log("WishlistContext: Removed from wishlist (server response). Product ID:", productId, "Updated wishlist:", response.data.wishlist);
      // لا تعرض toast عند النجاح هنا (حسب طلبك)
    } catch (error) {
      console.error('WishlistContext: Failed to remove from wishlist:', error.response?.data?.message || error.message);
      showToast(`${t('wishlist.removeFailed') || 'Could not remove product from wishlist. '}${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const isFavorite = useCallback((productId) => {
    if (!productId || !Array.isArray(wishlistItems)) {
        return false;
    }
    return wishlistItems.some(item => item && item._id && item._id.toString() === productId.toString());
  }, [wishlistItems]); 

  const toggleFavorite = async (productOrProductId) => {
    if (!isAuthenticated) {
        showToast(t('wishlist.loginRequiredToggle') || "Please log in to use the wishlist.", 'info');
        navigate('/login');
        return;
    }

    let productId;
    if (typeof productOrProductId === 'string') {
        productId = productOrProductId;
    } else if (typeof productOrProductId === 'object' && productOrProductId !== null) {
        productId = productOrProductId._id;
    } else {
        showToast(t('wishlist.productDataIncompleteToggle') || "Cannot toggle favorite status: Product data is incomplete.", 'error');
        return;
    }

    if (!productId) { 
        showToast(t('wishlist.productDataIncompleteToggle') || "Cannot toggle favorite status: Product data is incomplete.", 'error');
        return;
    }

    if (isFavorite(productId)) { 
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productOrProductId);
    }
  };

  const value = {
    wishlistItems, 
    addToWishlist,
    removeFromWishlist,
    isFavorite,
    toggleFavorite,
    wishlistCount: wishlistItems.length, 
    loadingWishlist,
    fetchWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};