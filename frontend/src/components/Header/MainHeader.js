import React, { useState } from 'react';
import { useLanguage } from '../../components/LanguageContext';
import { ShoppingCart, Heart, Search, Phone, Store } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext'; 
import { useCart } from '../../context/CartContext'; 

const MainHeader = () => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const { cartItems, loadingCart, cartInitialized } = useCart();
    const navigate = useNavigate();
    const { isAuthenticated, currentUser } = useAuth();
    const { wishlistItems, loadingWishlist } = useWishlist();

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            navigate('/shop');
            return;
        }
        navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };
    const cartItemCount = cartInitialized && !loadingCart && Array.isArray(cartItems) ? cartItems.reduce((total, item) => total + (item.quantity || 0), 0) : 0;
    const favItemCount = !loadingWishlist && Array.isArray(wishlistItems) ? wishlistItems.length : 0;

    return (
        <div className="sticky top-0 z-50 border-b border-gray-200 bg-white px-4 sm:px-6 py-3 shadow-lg dark:border-gray-700 dark:bg-gray-900 transition-colors duration-300 ease-in-out">
            <div className="container mx-auto flex flex-wrap items-center justify-between gap-y-3 gap-x-4 sm:gap-x-6">

                <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 ease-in-out">
                    <Store className="h-8 w-8 text-blue-800 dark:text-blue-300" />
                    <span>{t('mainHeader.siteName') || "TechXpress"}</span>
                </Link>

                <div className="flex flex-grow max-w-full md:max-w-xl items-center rounded-full border border-gray-300 dark:border-gray-600 shadow-inner overflow-hidden order-3 sm:order-2 w-full focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200 ease-in-out">
                    <input
                        type="text"
                        className="flex-grow px-4 py-2.5 outline-none bg-transparent text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                        placeholder={t('mainHeader.searchPlaceholder') || "Search for products..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 ease-in-out flex items-center justify-center"
                        aria-label={t('mainHeader.searchPlaceholder') || "Search"}
                    >
                        <Search size={20} />
                    </button>
                </div>

                <div className="flex items-center gap-4 sm:gap-5 order-2 sm:order-3">
                    <div className="hidden md:flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{t('mainHeader.hotline') || "Hotline"}</div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">(+100) 123 456 7890</div>
                        </div>
                    </div>

                    {isAuthenticated && (
                        <Link to="/wishlist" className="relative text-gray-700 dark:text-gray-200 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200 ease-in-out"
                             title={t('mainHeader.myWishlist') || "My Wishlist"}
                             aria-label={t('mainHeader.myWishlist') || "My Wishlist"}
                        >
                            <Heart className="h-6 w-6" />
                            {favItemCount > 0 && (
                                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white ring-2 ring-white dark:ring-gray-900">
                                    {favItemCount}
                                </span>
                            )}
                        </Link>
                    )}

                    <Link to="/cart" className="relative text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 ease-in-out"
                         title={t('mainHeader.myCart') || "My Cart"}
                         aria-label={t('mainHeader.myCart') || "My Cart"}
                    >
                        <ShoppingCart className="h-6 w-6" />
                        {cartItemCount > 0 && (
                            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white ring-2 ring-white dark:ring-gray-900">
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