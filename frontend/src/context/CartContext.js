import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
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
    const [cartInitialized, setCartInitialized] = useState(false); // New state for initialization status

    const { isAuthenticated, API_BASE_URL, token } = useAuth();
    const navigate = useNavigate();

    // Calculate total quantity of items in the cart
    const getCartCount = useCallback(() => {
        // Ensure cartItems is an array before reducing
        if (!Array.isArray(cartItems)) {
             console.warn("CartContext: cartItems is not an array.", cartItems);
             return 0;
        }
        return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
    }, [cartItems]);

    // Fetch the user's cart from the backend
    const fetchCart = useCallback(async () => {
        // Only fetch if authenticated and API_BASE_URL and token are available
        if (isAuthenticated && API_BASE_URL && token) {
            setLoadingCart(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/api/cart`, { // Correct URL using backticks
                    headers: { Authorization: `Bearer ${token}` }
                });
                // The backend now sends { message, cart: itemsArray }, so access .cart
                setCartItems(response.data.cart || []);
            } catch (error) {
                console.error('CartContext: Failed to fetch cart:', error.response?.data?.message || error.message);
                 // Clear cart items on fetch error (e.g., expired token, 404)
                setCartItems([]);
            } finally {
                setLoadingCart(false);
                setCartInitialized(true); // Mark cart as initialized after fetch attempt
            }
        } else {
            // If not authenticated or missing info, clear cart and mark as initialized
            setCartItems([]);
            setCartInitialized(true);
        }
    }, [isAuthenticated, API_BASE_URL, token]); // Dependencies for useCallback

    // Effect to fetch cart when authentication status or token changes
    useEffect(() => {
        // Fetch cart only if authenticated and token is available
        if (isAuthenticated && token) {
            fetchCart();
        } else {
            // If not authenticated, clear cart and mark as initialized immediately
            setCartItems([]);
            setCartInitialized(true);
        }
    }, [isAuthenticated, token, fetchCart]); // Dependencies for useEffect


    // Add a product to the cart with a specific quantity
    // Now accepts a quantity parameter
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
         // Validate quantity before sending
        const numQuantity = Number(quantity);
        if (isNaN(numQuantity) || !Number.isInteger(numQuantity) || numQuantity < 1) {
             alert('الكمية يجب أن تكون عدداً صحيحاً موجباً.');
             return;
        }


        try {
            // Send product ID in the URL parameter and quantity in the request body
            const response = await axios.post(`${API_BASE_URL}/api/cart/${product._id}`, { quantity: numQuantity }, { // Send quantity in body
                headers: { Authorization: `Bearer ${token}` }
            });
            // The backend now sends { message, cart: itemsArray }, so access .cart
            setCartItems(response.data.cart || []);
            console.log(`تمت إضافة ${numQuantity} من المنتج ${product.name} للسلة.`);
        } catch (error) {
            alert(`حدث خطأ أثناء إضافة المنتج للسلة: ${error.response?.data?.message || error.message}`);
        }
    };

    // Remove a product from the cart
    const removeFromCart = async (productId) => {
        if (!isAuthenticated) return;
        try {
            // Send product ID in the URL parameter using backticks
            const response = await axios.delete(`${API_BASE_URL}/api/cart/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // The backend now sends { message, cart: itemsArray }, so access .cart
            setCartItems(response.data.cart || []);
            console.log('تمت إزالة المنتج من السلة:', productId);
        } catch (error) {
            alert(`فشل في إزالة المنتج من السلة: ${error.response?.data?.message || error.message}`);
        }
    };

    // Check if a product is already in the cart
    const isInCart = (productId) => {
        if (!productId) return false;
        // Ensure you are comparing the Mongoose product ID from the cart item (item.product)
        // and converting both to string for reliable comparison
        return cartItems.some(item => item.product && item.product.toString() === productId.toString());
    };

    // Toggle (add/remove) a product from the cart
    // This version is suitable for ProductCard where quantity is always 1 for toggle
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

        // Use product._id for the check and toggle logic
        if (isInCart(product._id)) {
            // If already in cart, remove it
            await removeFromCart(product._id);
        } else {
            // If not in cart, add with quantity 1
            await addToCart(product, 1); // Add with default quantity 1
        }
    };

    // Function to update the quantity of an existing item in the cart
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
             alert(`حدث خطأ أثناء تحديث كمية المنتج: ${error.response?.data?.message || error.message}`);
        }
    };


    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart, // Now accepts quantity
            removeFromCart,
            isInCart,
            toggleCart, // Still adds/removes with quantity 1
            updateCartItemQuantity, // New function to update quantity
            loadingCart,
            fetchCart,
            getCartCount, // Exposing the function to get total quantity
            cartInitialized // Exposing the initialization status
        }}>
            {children}
        </CartContext.Provider>
    );
};
