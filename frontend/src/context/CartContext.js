import { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { useToast } from '../components/ToastNotification';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { t } = useLanguage(); 
    const { showToast } = useToast();
    const [cartItems, setCartItems] = useState([]);
    const [loadingCart, setLoadingCart] = useState(true);
    const { isAuthenticated, API_BASE_URL, token } = useAuth();
    const navigate = useNavigate();

    const fetchCart = useCallback(async () => {
        if (!isAuthenticated || !token) {
            setCartItems([]);
            setLoadingCart(false);
            return;
        }
        setLoadingCart(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/cart`, { headers: { Authorization: `Bearer ${token}` } });
            setCartItems(response.data.cart || []); 
        } catch (error) {
            console.error('CartContext: Failed to fetch cart:', error.response?.data?.message || error.message);
            setCartItems([]);
        } finally {
            setLoadingCart(false);
        }
    }, [isAuthenticated, API_BASE_URL, token]); 

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            setCartItems([]);
            setLoadingCart(false);
        }
    }, [isAuthenticated, fetchCart]);
    
    const addToCart = async (product, quantity = 1, selectedVariantId = null) => { 
        if (!isAuthenticated) { showToast(t('cart.loginRequired'), 'info'); navigate('/login'); return; }
        setLoadingCart(true); 
        try {
            await axios.post(`${API_BASE_URL}/api/cart`, { 
                productId: product._id,
                quantity, 
                selectedVariantId 
            }, { headers: { Authorization: `Bearer ${token}` } });
            await fetchCart();
            showToast(t('cart.productAddedSuccess'), 'success');
        } catch (error) {
            showToast(error.response?.data?.message || t('cart.addError'), 'error');
        } finally {
            setLoadingCart(false); 
        }
    };
    
    const updateCartItemQuantity = async (productId, quantity, selectedVariantId = null) => {
        setLoadingCart(true); 
        try {
            await axios.put(`${API_BASE_URL}/api/cart`, { productId, quantity, selectedVariantId }, { headers: { Authorization: `Bearer ${token}` } });
            await fetchCart();
            if(quantity > 0) showToast(t('cart.updateSuccess'), 'success');
            else showToast(t('cart.productRemovedSuccess'), 'info');
        } catch (error) {
            showToast(error.response?.data?.message || t('cart.updateError'), 'error');
        } finally {
            setLoadingCart(false); 
        }
    };

    const cartTotal = useMemo(() => cartItems.reduce((acc, item) => acc + ((item.price || 0) * item.quantity), 0), [cartItems]);
    const getCartCount = useMemo(() => cartItems.reduce((total, item) => total + (item.quantity || 0), 0), [cartItems]);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, updateCartItemQuantity, loadingCart, getCartCount, cartTotal, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
};