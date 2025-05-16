import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext'; 
const CartContext = createContext();
export const useCart = () => useContext(CartContext);
export const CartProvider = ({ children }) => {
  const { currentUser, loadingAuth } = useAuth(); 
  const [cartItems, setCartItems] = useState([]);
  const [cartInitialized, setCartInitialized] = useState(false);
  const getCartStorageKey = React.useCallback(() => {
    if (currentUser && currentUser.id) { 
      return `cartItems_${currentUser.id}`;
    }
    return 'cartItems_guest'; 
  }, [currentUser]);
  useEffect(() => {
    if (loadingAuth) {
      setCartInitialized(false);
      return;
    }
    const storageKey = getCartStorageKey();
    const localData = localStorage.getItem(storageKey);
    try {
      const parsedData = localData ? JSON.parse(localData) : [];
      setCartItems(Array.isArray(parsedData) ? parsedData : []);
    } catch (error) {
      console.error("CartContext: Error parsing cart data from localStorage:", error);
      setCartItems([]); 
      localStorage.removeItem(storageKey);
    }
    setCartInitialized(true); 
  }, [currentUser, loadingAuth, getCartStorageKey]);
  useEffect(() => {
    if (!cartInitialized || loadingAuth) {
      return;
    }

    const storageKey = getCartStorageKey();
    if (cartItems && cartItems.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(cartItems));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [cartItems, currentUser, cartInitialized, loadingAuth, getCartStorageKey]);
  const addToCart = (product, quantity) => {
    if (!product || !product.id || typeof quantity !== 'number' || quantity <= 0) {
        console.error("CartContext: Invalid product data or quantity provided to addToCart.", { product, quantity });
        alert("لا يمكن إضافة المنتج إلى السلة. بيانات المنتج أو الكمية غير صالحة.");
        return;
    }
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });
    alert(`تمت إضافة ${quantity} من ${product.name || 'منتج غير مسمى'} إلى السلة!`);
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    const quantityNum = parseInt(newQuantity, 10);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity: quantityNum } : item
        )
      );
    }
  };
  const clearCart = () => {
    setCartItems([]);
  };
  const getCartCount = () => {
    if (!cartInitialized) return 0;
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const getCartTotal = () => {
    if (!cartInitialized) return 0;
    return cartItems.reduce((total, item) => {
        const price = parseFloat(item.price);
        const quantity = parseInt(item.quantity, 10);
        if (isNaN(price) || isNaN(quantity)) {
            console.warn(`CartContext: Invalid price or quantity for item ${item.id}: Price=${item.price}, Quantity=${item.quantity}`);
            return total;
        }
        return total + price * quantity;
    }, 0);
  };
  if (loadingAuth && !cartInitialized) {
    return null;
  }
  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartCount,
      getCartTotal,
      cartInitialized
    }}>
      {children}
    </CartContext.Provider>
  );
};