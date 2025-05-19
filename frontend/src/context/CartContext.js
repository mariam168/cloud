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
        if (!product || !product._id) {
            alert('بيانات المنتج غير مكتملة!');
            return;
        }
        const numQuantity = Number(quantity);
        if (isNaN(numQuantity) || !Number.isInteger(numQuantity) || numQuantity < 1) {
            alert('الكمية يجب أن تكون عدداً صحيحاً موجباً.');
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/api/cart/${product._id}`, { quantity: numQuantity }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCartItems(response.data.cart || []);
            console.log(`تمت إضافة ${numQuantity} من المنتج ${typeof product.name === 'object' ? (product.name.en || product.name.ar || 'Unnamed Product') : product.name} للسلة.`);
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
        if (!product || !product._id) {
            alert('بيانات المنتج غير مكتملة.');
            return;
        }
        if (isInCart(product._id)) {
            await removeFromCart(product._id);
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
            getCartCount,
            cartInitialized
        }}>
            {children}
        </CartContext.Provider>
    );
};