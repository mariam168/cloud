import { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { useToast } from '../components/ToastNotification'; // <--- استيراد useToast

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { t } = useLanguage(); 
    const { showToast } = useToast(); // <--- استخدام useToast
    const [cartItems, setCartItems] = useState([]);
    const [loadingCart, setLoadingCart] = useState(false);
    const [cartInitialized, setCartInitialized] = useState(false);
    const { isAuthenticated, API_BASE_URL, token } = useAuth();
    const navigate = useNavigate();

    const fetchCart = useCallback(async () => {
        if (isAuthenticated && API_BASE_URL && token) {
            setLoadingCart(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/api/cart`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCartItems(response.data.cart || []); 
            } catch (error) {
                console.error('CartContext: Failed to fetch cart:', error.response?.data?.message || error.message);
                setCartItems([]);
                showToast(t('cart.fetchError') || 'فشل في جلب السلة.', 'error'); // <--- استخدام showToast
            } finally {
                setLoadingCart(false);
                setCartInitialized(true);
            }
        } else {
            setCartItems([]);
            setCartInitialized(true);
        }
    }, [isAuthenticated, API_BASE_URL, token, t, showToast]); 

    useEffect(() => {
        if (isAuthenticated && token) {
            fetchCart();
        } else {
            setCartItems([]);
            setCartInitialized(true);
        }
    }, [isAuthenticated, token, fetchCart]);

    const areVariantsEqualClient = useCallback((variantId1, variantId2) => {
        if (!variantId1 && !variantId2) return true;
        if (!variantId1 || !variantId2) return false;
        return String(variantId1) === String(variantId2);
    }, []);

    const addToCart = async (product, quantity = 1, selectedVariantId = null) => { 
        if (!isAuthenticated) {
            showToast(t('cart.loginRequired') || 'يرجى تسجيل الدخول لإضافة المنتجات إلى السلة.', 'info'); // <--- استخدام showToast
            navigate('/login');
            return;
        }
        const productId = product._id; 
        
        if (!productId) {
            showToast(t('cart.productDataIncomplete') || 'بيانات المنتج غير مكتملة!', 'error'); // <--- استخدام showToast
            return;
        }
        const numQuantity = Number(quantity);
        if (isNaN(numQuantity) || !Number.isInteger(numQuantity) || numQuantity < 1) {
            showToast(t('cart.quantityInvalid') || 'الكمية يجب أن تكون عدداً صحيحاً موجباً.', 'warning'); // <--- استخدام showToast
            return;
        }

        setLoadingCart(true); 
        try {
            const response = await axios.post(`${API_BASE_URL}/api/cart/${productId}`, { 
                quantity: numQuantity, 
                selectedVariantId: selectedVariantId 
            }, { 
                headers: { Authorization: `Bearer ${token}` }
            });
            setCartItems(response.data.cart || []);
            const productName = (typeof product.name === 'object' ? (product.name.en || product.name.ar) : product.name) || t('general.unnamedProduct'); 
            console.log(`تمت إضافة ${numQuantity} من المنتج ${productName} للسلة مع الـ variant ID: ${selectedVariantId}.`);
            showToast(t('cart.productAddedSuccess', { productName }) || `تمت إضافة المنتج ${productName} للسلة بنجاح.`, 'success'); // <--- استخدام showToast
        } catch (error) {
            console.error('Error adding product to cart:', error.response?.data?.message || error.message);
            showToast(t('cart.addError', { message: error.response?.data?.message || error.message }) || `حدث خطأ أثناء إضافة المنتج للسلة: ${error.response?.data?.message || error.message}`, 'error'); // <--- استخدام showToast
        } finally {
            setLoadingCart(false); 
        }
    };

    const removeFromCart = async (productId, selectedVariantId = null) => { 
        if (!isAuthenticated) return;
        setLoadingCart(true); 
        try {
            const response = await axios.delete(`${API_BASE_URL}/api/cart/${productId}`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { selectedVariantId: selectedVariantId } 
            });
            setCartItems(response.data.cart || []);
            console.log('تمت إزالة المنتج من السلة:', productId, selectedVariantId);
            showToast(t('cart.productRemovedSuccess') || 'تمت إزالة المنتج من السلة بنجاح.', 'info'); // <--- استخدام showToast
        } catch (error) {
            console.error('Error removing product from cart:', error.response?.data?.message || error.message);
            showToast(t('cart.removeError', { message: error.response?.data?.message || error.message }) || `فشل في إزالة المنتج من السلة: ${error.response?.data?.message || error.message}`, 'error'); // <--- استخدام showToast
        } finally {
            setLoadingCart(false); 
        }
    };

    const isInCart = useCallback((productId, selectedVariantId = null) => {
        if (!productId) return false;
        const stringProductId = typeof productId === 'object' && productId._id ? productId._id.toString() : String(productId);

        return cartItems.some(item => 
            item.product && item.product.toString() === stringProductId && 
            areVariantsEqualClient(item.selectedVariant, selectedVariantId)
        );
    }, [cartItems, areVariantsEqualClient]);
    
    const getCartItemQuantity = useCallback((productId, selectedVariantId = null) => {
        const stringProductId = typeof productId === 'object' && productId._id ? productId._id.toString() : String(productId);

        const item = cartItems.find(item =>
            item.product && item.product.toString() === stringProductId &&
            areVariantsEqualClient(item.selectedVariant, selectedVariantId)
        );
        return item ? item.quantity : 0;
    }, [cartItems, areVariantsEqualClient]);

    const toggleCart = async (product, selectedVariantId = null) => { 
        if (!isAuthenticated) {
            showToast(t('cart.loginRequired') || 'يرجى تسجيل الدخول لاستخدام السلة.', 'info'); // <--- استخدام showToast
            navigate('/login');
            return;
        }
        const productId = product._id;
        if (!productId) {
            showToast(t('cart.productDataIncomplete') || 'بيانات المنتج غير مكتملة.', 'error'); // <--- استخدام showToast
            return;
        }
        if (isInCart(productId, selectedVariantId)) { 
            await removeFromCart(productId, selectedVariantId); 
        } else {
            await addToCart(product, 1, selectedVariantId); 
        }
    };

    const updateCartItemQuantity = async (productId, quantity, selectedVariantId = null) => { 
        if (!isAuthenticated) {
            showToast(t('cart.loginRequired') || 'يرجى تسجيل الدخول لتحديث السلة.', 'info'); // <--- استخدام showToast
            navigate('/login');
            return;
        }
        const numQuantity = Number(quantity);
        if (isNaN(numQuantity) || !Number.isInteger(numQuantity) || numQuantity < 1) {
            showToast(t('cart.quantityInvalid') || 'الكمية يجب أن تكون عدداً صحيحاً موجباً.', 'warning'); // <--- استخدام showToast
            return;
        }
        setLoadingCart(true); 
        try {
            const response = await axios.put(`${API_BASE_URL}/api/cart/${productId}`, { 
                quantity: numQuantity,
                selectedVariantId: selectedVariantId 
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCartItems(response.data.cart || []);
            console.log(`تم تحديث كمية المنتج ${productId} إلى ${numQuantity} مع الـ variant ID: ${selectedVariantId}.`);
            showToast(t('cart.updateSuccess') || 'تم تحديث كمية المنتج بنجاح.', 'success'); // <--- استخدام showToast
        } catch (error) {
            console.error('Error updating cart item quantity:', error.response?.data?.message || error.message);
            showToast(t('cart.updateError', { message: error.response?.data?.message || error.message }) || `حدث خطأ أثناء تحديث كمية المنتج: ${error.response?.data?.message || error.message}`, 'error'); // <--- استخدام showToast
        } finally {
            setLoadingCart(false); 
        }
    };

    const clearCart = async () => {
        if (!isAuthenticated) return;
        setLoadingCart(true); 
        try {
            const response = await axios.delete(`${API_BASE_URL}/api/cart`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCartItems([]);
            console.log('Cart cleared successfully.');
            showToast(t('cart.clearSuccess') || 'تم مسح السلة بالكامل.', 'info'); // <--- استخدام showToast
        } catch (error) {
            console.error('Error clearing cart:', error.response?.data?.message || error.message);
            showToast(t('cart.clearError', { message: error.response?.data?.message || error.message }) || `فشل في مسح السلة: ${error.response?.data?.message || error.message}`, 'error'); // <--- استخدام showToast
        } finally {
            setLoadingCart(false); 
        }
    };

    const getCartCount = useMemo(() => {
        if (!Array.isArray(cartItems)) {
            return 0;
        }
        return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
    }, [cartItems]);
    
    const cartTotal = useMemo(() => {
        return cartItems.reduce((acc, item) => {
            const itemPrice = item.price || 0; 
            return acc + (itemPrice * item.quantity);
        }, 0);
    }, [cartItems]);


    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            isInCart,
            toggleCart,
            updateCartItemQuantity,
            clearCart,
            loadingCart,
            fetchCart,
            getCartCount, 
            cartInitialized,
            cartTotal 
        }}>
            {children}
        </CartContext.Provider>
    );
};