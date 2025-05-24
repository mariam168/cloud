
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loadingCart, setLoadingCart] = useState(false);
    const [cartInitialized, setCartInitialized] = useState(false);
    const { isAuthenticated, API_BASE_URL, token } = useAuth();
    const navigate = useNavigate();

    const getCartCount = useCallback(() => {
        if (!Array.isArray(cartItems)) {
            return 0;
        }
        return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
    }, [cartItems]);

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
            } finally {
                setLoadingCart(false);
                setCartInitialized(true);
            }
        } else {
            setCartItems([]);
            setCartInitialized(true);
        }
    }, [isAuthenticated, API_BASE_URL, token]);

    useEffect(() => {
        if (isAuthenticated && token) {
            fetchCart();
        } else {
            setCartItems([]);
            setCartInitialized(true);
        }
    }, [isAuthenticated, token, fetchCart]);

    const addToCart = async (product, quantity = 1) => {
        if (!isAuthenticated) {
            alert('يرجى تسجيل الدخول لإضافة المنتجات إلى السلة.');
            navigate('/login');
            return;
        }
        // هنا نقوم بتعديل كيفية استخراج product._id:
        // إذا كان المنتج هو كائن إعلان (advertisement) من الـ Hero Section أو AllOffersPage
        // فسيكون الـ _id في المسار الرئيسي للكائن.
        // إذا كان منتجاً من صفحة منتجات (product card) فغالباً _id سيكون في المسار الرئيسي.
        const productId = product._id; 
        
        if (!productId) {
            alert('بيانات المنتج غير مكتملة!');
            return;
        }
        const numQuantity = Number(quantity);
        if (isNaN(numQuantity) || !Number.isInteger(numQuantity) || numQuantity < 1) {
            alert('الكمية يجب أن تكون عدداً صحيحاً موجباً.');
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/api/cart/${productId}`, { quantity: numQuantity }, { // استخدام productId هنا
                headers: { Authorization: `Bearer ${token}` }
            });
            setCartItems(response.data.cart || []);
            const productName = typeof product.title === 'object' ? (product.title.en || product.title.ar || 'Unnamed Product') : product.name; // للتعامل مع الإعلانات كمنتجات
            console.log(`تمت إضافة ${numQuantity} من المنتج ${productName} للسلة.`);
        } catch (error) {
            console.error('Error adding product to cart:', error.response?.data?.message || error.message);
            alert(`حدث خطأ أثناء إضافة المنتج للسلة: ${error.response?.data?.message || error.message}`);
        }
    };

    const removeFromCart = async (productId) => {
        if (!isAuthenticated) return;
        try {
            const response = await axios.delete(`${API_BASE_URL}/api/cart/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCartItems(response.data.cart || []);
            console.log('تمت إزالة المنتج من السلة:', productId);
        } catch (error) {
            console.error('Error removing product from cart:', error.response?.data?.message || error.message);
            alert(`فشل في إزالة المنتج من السلة: ${error.response?.data?.message || error.message}`);
        }
    };

    // تحديث isInCart للتحقق من productId مباشرة
    const isInCart = (productId) => {
        if (!productId) return false;
        return cartItems.some(item => item.product && item.product.toString() === productId.toString());
    };

    const toggleCart = async (product) => {
        if (!isAuthenticated) {
            alert('يرجى تسجيل الدخول لاستخدام السلة.');
            navigate('/login');
            return;
        }
        const productId = product._id;
        if (!productId) {
            alert('بيانات المنتج غير مكتملة.');
            return;
        }
        if (isInCart(productId)) {
            await removeFromCart(productId);
        } else {
            await addToCart(product, 1);
        }
    };

    const updateCartItemQuantity = async (productId, quantity) => {
        if (!isAuthenticated) {
            alert('يرجى تسجيل الدخول لتحديث السلة.');
            navigate('/login');
            return;
        }
        const numQuantity = Number(quantity);
        if (isNaN(numQuantity) || !Number.isInteger(numQuantity) || numQuantity < 1) {
            alert('الكمية يجب أن تكون عدداً صحيحاً موجباً.');
            return;
        }
        try {
            const response = await axios.put(`${API_BASE_URL}/api/cart/${productId}`, { quantity: numQuantity }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCartItems(response.data.cart || []);
            console.log(`تم تحديث كمية المنتج ${productId} إلى ${numQuantity}.`);
        } catch (error) {
            console.error('Error updating cart item quantity:', error.response?.data?.message || error.message);
            alert(`حدث خطأ أثناء تحديث كمية المنتج: ${error.response?.data?.message || error.message}`);
        }
    };

    const clearCart = async () => {
        if (!isAuthenticated) return;
        try {
            const response = await axios.delete(`${API_BASE_URL}/api/cart`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCartItems([]);
            console.log('Cart cleared successfully.');
        } catch (error) {
            console.error('Error clearing cart:', error.response?.data?.message || error.message);
            alert(`فشل في مسح السلة: ${error.response?.data?.message || error.message}`);
        }
    };

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
            getCartCount, // هذا يعيد الرقم، لا مجموعة العناصر
            cartInitialized
        }}>
            {children}
        </CartContext.Provider>
    );
};