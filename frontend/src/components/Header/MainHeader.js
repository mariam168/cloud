import { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { ShoppingCart, Heart, Search, Phone, Store, UserCircle } from 'lucide-react'; 
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext'; 
import { useCart } from '../../context/CartContext'; 
const MainHeader = () => {
    const { t, language } = useLanguage(); 
    const [searchTerm, setSearchTerm] = useState('');
    const { getCartCount, loadingCart } = useCart();
    const navigate = useNavigate();
    const { isAuthenticated, currentUser } = useAuth();
    const { wishlistItems, loading: loadingWishlist } = useWishlist();

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

    const cartItemCount = getCartCount;
    const favItemCount = !loadingWishlist && Array.isArray(wishlistItems) ? wishlistItems.length : 0;

    const searchInputRoundedClass = language === 'ar' ? 'rounded-r-full' : 'rounded-l-full';
    const searchButtonRoundedClass = language === 'ar' ? 'rounded-l-full' : 'rounded-r-full';

    return (
        <div 
            className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-lg dark:shadow-2xl py-4 transition-all duration-300 ease-in-out"
            dir={language === 'ar' ? 'rtl' : 'ltr'} 
        >
            <div className="container mx-auto px-4 sm:px-6 py-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[auto_1fr_auto] items-center gap-y-4 gap-x-4">
                <Link 
                    to="/" 
                    className="flex items-center gap-2 text-2xl md:text-3xl font-extrabold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 ease-in-out flex-shrink-0 tracking-wide col-span-2 md:col-span-1 order-1"
                >
                    <Store className="h-8 w-8 text-blue-800 dark:text-blue-300" />
                    <span>{t('mainHeader.siteName') || "TechXpress"}</span>
                </Link>

                <div className="flex flex-grow items-center order-3 col-span-2 md:col-span-1 md:order-2 w-full mx-auto md:mx-0 
                                  border border-gray-300 dark:border-gray-600 rounded-full focus-within:ring-3 focus-within:ring-blue-500 
                                  focus-within:border-blue-500 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg dark:hover:shadow-xl">
                    <input
                        type="text"
                        className={`flex-grow px-4 py-2.5 outline-none bg-transparent text-gray-800 dark:text-gray-200 
                                    placeholder-gray-500 dark:placeholder-gray-400 text-sm md:text-base ${searchInputRoundedClass}`}
                        placeholder={t('mainHeader.searchPlaceholder') || "Search for products..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button
                        onClick={handleSearch}
                        className={`bg-blue-600 h-full px-5 py-2.5 text-white hover:bg-blue-700 dark:bg-blue-700 
                                    dark:hover:bg-blue-600 transition-colors duration-200 ease-in-out flex items-center justify-center ${searchButtonRoundedClass}`}
                        aria-label={t('mainHeader.searchPlaceholder') || "Search"}
                    >
                        <Search size={20} />
                    </button>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 justify-end order-2 md:order-3 col-span-2 md:col-span-1">
                    <div className="hidden lg:flex items-center gap-2 text-gray-600 dark:text-gray-300 flex-shrink-0">
                        <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{t('mainHeader.hotline') || "Hotline"}</div>
                            <div className="font-bold text-gray-800 dark:text-white tracking-wide text-sm">(+100) 123 456 7890</div>
                        </div>
                    </div>

                    {isAuthenticated ? (
                        <Link 
                            to="/profile" 
                            className="flex items-center gap-1 text-gray-600 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 ease-in-out px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                            title={t('mainHeader.myProfile') || "My Profile"}
                        >
                            <UserCircle className="h-6 w-6" />
                            <span className="hidden sm:inline-block text-sm font-medium whitespace-nowrap">{currentUser?.name || t('mainHeader.myAccount')}</span>
                        </Link>
                    ) : (
                        <Link 
                            to="/login" 
                            className="flex items-center gap-1 text-gray-600 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 ease-in-out px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                            title={t('mainHeader.loginRegister') || "Login/Register"}
                        >
                            <UserCircle className="h-6 w-6" />
                            <span className="hidden sm:inline-block text-sm font-medium whitespace-nowrap">{t('mainHeader.login')}</span>
                        </Link>
                    )}

                    <Link 
                        to="/wishlist" 
                        className="relative p-2 rounded-full text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 ease-in-out"
                        title={t('mainHeader.myWishlist') || "My Wishlist"}
                    >
                        <Heart className="h-6 w-6" />
                        {favItemCount > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[0.6rem] font-extrabold text-white ring-1 ring-white dark:ring-gray-900">
                                {favItemCount}
                            </span>
                        )}
                    </Link>

                    <Link 
                        to="/cart" 
                        className="relative p-2 rounded-full text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 ease-in-out"
                        title={t('mainHeader.myCart') || "My Cart"}
                    >
                        <ShoppingCart className="h-6 w-6" />
                        {cartItemCount > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[0.6rem] font-extrabold text-white ring-1 ring-white dark:ring-gray-900">
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