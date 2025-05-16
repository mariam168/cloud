// frontend/src/context/WishlistContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

import { useNavigate } from 'react-router-dom'; // Import useNavigate

// Create the context
const WishlistContext = createContext();

// Create a custom hook to use the context
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    // Throw an error if the hook is used outside of the provider
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

// Create the provider component
export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  // Destructure authentication state and API details from AuthContext
  const { isAuthenticated, currentUser, API_BASE_URL, token } = useAuth();

  // Initialize the navigate function using the hook
  // This line must be inside the functional component body
  const navigate = useNavigate();

  // useCallback hook to memoize the fetchWishlist function
  const fetchWishlist = useCallback(async () => {
    // Fetch wishlist only if authenticated, API_BASE_URL is set, and token is available
    if (isAuthenticated && API_BASE_URL && token) {
      setLoadingWishlist(true);
      try {
        // Make GET request to fetch wishlist
        const response = await axios.get(`${API_BASE_URL}/api/wishlist`);
        // Update wishlist items state with the response data
        setWishlistItems(response.data || []);
      } catch (error) {
        // Log error details
        console.error('WishlistContext: Failed to fetch wishlist:', error.response ? error.response.data : error.message);
        // Handle specific error statuses if needed (e.g., redirect on 401)
        // Note: Redirecting on 401 might be better handled globally or in AuthContext
        // if (error.response && error.response.status === 401) {
        //   navigate('/login'); // Example usage of navigate here if needed
        // }
      } finally {
        setLoadingWishlist(false); // Stop loading regardless of success or failure
      }
    } else {
      // Clear wishlist if not authenticated
      setWishlistItems([]);
    }
  }, [isAuthenticated, API_BASE_URL, token]); // Dependencies for useCallback

  // useEffect hook to fetch wishlist when authentication status, user, or token changes
  useEffect(() => {
    if (isAuthenticated && currentUser && token) {
      fetchWishlist(); // Fetch wishlist if authenticated and user/token are available
    } else if (!isAuthenticated) {
      setWishlistItems([]); // Clear wishlist if not authenticated
    }
  }, [isAuthenticated, currentUser, token, fetchWishlist]); // Dependencies for useEffect

  // Function to add a product to the wishlist
  const addToWishlist = async (product) => {
    console.log("WishlistContext: addToWishlist called with product:", product);

    // Check if user is authenticated and API base URL is set
    if (!isAuthenticated || !API_BASE_URL) {
      alert('Please login to add items to your wishlist.');
      // Optional: Navigate to login page
      // navigate('/login');
      return;
    }

    // Check if product and product ID are valid
    if (!product || !product._id) {
      console.error("WishlistContext: Product ID is undefined in addToWishlist!", product);
      alert("لا يمكن إضافة المنتج للمفضلة: بيانات المنتج غير مكتملة عند الإضافة.");
      return;
    }

    // Check if the product is already in the wishlist
    if (wishlistItems.find(item => item._id === product._id)) {
        console.log("WishlistContext: Product already in wishlist:", product.name);
        return; // Exit if already in wishlist
    }

    try {
      // Make POST request to add product to wishlist
      // Assuming the backend endpoint is /api/wishlist/:productId and expects productId in the URL
      const response = await axios.post(`${API_BASE_URL}/api/wishlist/${product._id}`);
      // Update wishlist items state with the new list from the server response
      setWishlistItems(response.data.wishlist || []);
      console.log("WishlistContext: Added to wishlist (server response):", response.data.product?.name);
      // Optional: Show a success message
      // alert(`${product.name} added to wishlist!`);
    } catch (error) {
      // Log full error object for debugging
      console.error('WishlistContext: Failed to add to wishlist:', error.response ? error.response : error);
      // Show user-friendly error message
      alert(`Could not add product to wishlist. Server said: ${error.response?.data?.message || error.message}`);
    }
  };

  // Function to remove a product from the wishlist
  const removeFromWishlist = async (productId) => {
    console.log("WishlistContext: removeFromWishlist called with productId:", productId);
    // Check if user is authenticated and API base URL is set
    if (!isAuthenticated || !API_BASE_URL) return;

    // Check if product ID is valid
    if (!productId) {
        console.error("WishlistContext: Product ID is undefined in removeFromWishlist!");
        alert("لا يمكن إزالة المنتج من المفضلة: معرّف المنتج مفقود.");
        return;
    }

    try {
      // Make DELETE request to remove product from wishlist
      // Assuming the backend endpoint is /api/wishlist/:productId
      const response = await axios.delete(`${API_BASE_URL}/api/wishlist/${productId}`);
      // Update wishlist items state with the new list from the server response
      setWishlistItems(response.data.wishlist || []);
      console.log("WishlistContext: Removed from wishlist (server), product ID:", productId);
      // Optional: Show success message
      // alert('Product removed from wishlist.');
    } catch (error) {
      // Log error details
      console.error('WishlistContext: Failed to remove from wishlist:', error.response ? error.response.data : error.message);
      // Show user-friendly error message
      alert('Could not remove product from wishlist.');
    }
  };

  // Function to check if a product is in the wishlist
  const isFavorite = (productId) => {
    // Return false if product ID is not provided
    if (!productId) return false;
    // Check if any item in the wishlist has the given product ID
    return wishlistItems.some(item => item._id === productId);
  };

  // Function to toggle the favorite status of a product (add or remove)
  const toggleFavorite = async (product) => {
    console.log("WishlistContext: toggleFavorite called with product:", product);
    // Check if user is authenticated
    if (!isAuthenticated) {
        alert("يرجى تسجيل الدخول لاستخدام المفضلة.");
        // Navigate to login page if not authenticated
        navigate('/login'); // Using the navigate function here
        return;
    }

    // Check if product and product ID are valid
    if (!product || !product._id) {
        console.error("WishlistContext: Product ID is undefined in toggleFavorite!", product);
        alert("لا يمكن تبديل حالة المفضلة: بيانات المنتج غير مكتملة.");
        return;
    }

    // Check if the product is currently a favorite
    if (isFavorite(product._id)) {
      // If it is, remove it from the wishlist
      await removeFromWishlist(product._id);
    } else {
      // If it's not, add it to the wishlist
      await addToWishlist(product); // Pass the full product object
    }
  };

  // The value object provided by the context
  const value = {
    wishlistItems, // Array of wishlist items
    addToWishlist, // Function to add item
    removeFromWishlist, // Function to remove item
    isFavorite, // Function to check if item is favorite
    toggleFavorite, // Function to toggle favorite status
    wishlistCount: wishlistItems.length, // Number of items in the wishlist
    loadingWishlist, // Loading state for fetching wishlist
    fetchWishlist, // Function to manually refetch wishlist
    // navigate, // You can expose navigate here if needed in components using the context
  };

  // Provide the context value to children components
  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
