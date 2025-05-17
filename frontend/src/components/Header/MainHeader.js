import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { ShoppingCart, Heart, Search, Phone, Store } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

const MainHeader = () => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    // Use getCartCount from useCart context
    const { getCartCount, loadingCart, cartInitialized } = useCart();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { wishlistCount } = useWishlist(); // Assuming wishlistCount is provided by useWishlist

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        try {
            // Ensure this search endpoint is correct and handles the 'search' query parameter
            const res = await fetch(`http://localhost:5000/api/products?search=${encodeURIComponent(searchTerm)}`);
            if (!res.ok) {
                console.error('Search API error:', res.status, await res.text());
                alert(t.searchError || 'An error occurred during search.');
                return;
            }
            const data = await res.json();
            // Store search results and query in localStorage for the shop page to use
            localStorage.setItem('searchResults', JSON.stringify(data));
            localStorage.setItem('searchTermQuery', searchTerm);
            navigate('/shop'); // Navigate to the shop page to display results
        } catch (error) {
            console.error('Search fetch error:', error);
            alert(t.searchError || 'An error occurred during search.');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Calculate the total number of items in the cart, ensuring data is loaded
    // cartInitialized checks if the initial fetch attempt is done.
    // loadingCart checks if a fetch is currently in progress.
    const cartItemCount = cartInitialized && !loadingCart ? getCartCount() : 0;


    return (
        <div className="border-b bg-white px-4 sm:px-6 py-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="container mx-auto flex flex-wrap items-center justify-between gap-y-4 gap-x-6">
                {/* Site Logo/Name */}
                <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600 dark:text-blue-400">
                    <Store className="h-6 w-6" /> {/* Store icon */}
                    <span>{t.siteName || "TechXpress"}</span>
                </Link>

                {/* Search Bar */}
                <div className="flex max-w-md sm:max-w-xl flex-grow items-center overflow-hidden rounded border shadow-sm dark:border-gray-600 order-3 sm:order-2 w-full sm:w-auto">
                    {/* Category Select (Static for now) */}
                    <select className="border-r p-2.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-blue-500">
                        <option>{t.allCategories || "All"}</option>
                        {/* Add dynamic categories here if fetching from backend */}
                    </select>
                    {/* Search Input */}
                    <input
                        type="text"
                        className="flex-grow p-2.5 outline-none dark:bg-gray-800 dark:text-white"
                        placeholder={t.searchPlaceholder || "Search for products..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    {/* Search Button */}
                    <button onClick={handleSearch} className="bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 transition-colors">
                        <Search size={18} /> {/* Search icon */}
                    </button>
                </div>

                {/* Right-side Icons (Phone, Wishlist, Cart) */}
                <div className="flex items-center gap-4 sm:gap-6 order-2 sm:order-3">
                    {/* Hotline Info (Hidden on small screens) */}
                    <div className="hidden sm:flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Phone className="h-5 w-5" /> {/* Phone icon */}
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{t.hotline || "Hotline"}</div>
                            <div className="font-semibold">(+100) 123 456 7890</div>
                        </div>
                    </div>

                    {/* Wishlist Icon (Shown if authenticated) */}
                    {isAuthenticated && (
                        <Link to="/wishlist" className="relative text-gray-700 dark:text-gray-200 hover:text-red-500 dark:hover:text-red-400 transition-colors" title={t.myWishlist || "My Wishlist"}>
                            <Heart className="h-6 w-6" /> {/* Heart icon */}
                            {/* Wishlist count badge */}
                            {wishlistCount > 0 && (
                                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>
                    )}

                    {/* Cart Icon */}
                    <Link to="/cart" className="relative text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title={t.myCart || "My Cart"}>
                        <ShoppingCart className="h-6 w-6" /> {/* Shopping Cart icon */}
                        {/* Cart item count badge */}
                        {cartItemCount > 0 && (
                            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                                {cartItemCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default MainHeader;
