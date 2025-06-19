import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from "../components/LanguageContext";
import { HeartCrack, HeartHandshake, Loader2, HeartPulse } from 'lucide-react';
const WishlistPage = () => {
    const { wishlistItems, loadingWishlist } = useWishlist();
    const { isAuthenticated } = useAuth();
    const { t } = useLanguage();
    const baseContainerClasses = "container mx-auto px-4 py-20 text-center min-h-[70vh] flex flex-col items-center justify-center";
    const baseMessageBoxClasses = "bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-12 max-w-lg w-full border border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out";
    const baseMessageTextClasses = "text-lg md:text-xl text-gray-700 dark:text-gray-300 font-semibold mb-6";
    const baseButtonClasses = "inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 transform hover:-translate-y-1";
    if (loadingWishlist) {
        return (
            <div className={`${baseContainerClasses} bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black`}>
                <div className={`${baseMessageBoxClasses} hover:scale-100`}> 
                    <Loader2 size={48} className="text-blue-600 dark:text-blue-400 animate-spin mb-6 mx-auto" />
                    <p className={baseMessageTextClasses}>
                        {t('wishlistPage.loadingWishlist') || 'Loading wishlist...'}
                    </p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className={`${baseContainerClasses} bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/50`}>
                <div className={`${baseMessageBoxClasses}`}>
                    <HeartHandshake size={48} className="text-red-600 dark:text-red-400 mb-6 mx-auto" />
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
                        {t('wishlistPage.loginRequiredTitle') || 'Access Denied'}
                    </h2>
                    <p className={baseMessageTextClasses}>
                        {t('wishlistPage.pleaseLogin') || 'Please log in to view your wishlist.'}
                    </p>
                    <Link
                        to="/login"
                        className={`${baseButtonClasses} bg-blue-600 focus:ring-blue-500`}
                    >
                        {t('topBar.signIn') || 'Sign In'}
                    </Link>
                </div>
            </div>
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <div className={`${baseContainerClasses} bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/50`}> {/* تغيير الألوان */}
                <div className={`${baseMessageBoxClasses}`}>
                    <HeartCrack size={48} className="text-indigo-600 dark:text-indigo-400 mb-6 mx-auto" /> {/* تغيير لون الأيقونة */}
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
                        {t('wishlistPage.emptyWishlistTitle') || 'Your Wishlist is Empty!'}
                    </h2>
                    <p className={baseMessageTextClasses}>
                        {t('wishlistPage.emptyWishlist') || 'Your wishlist is currently empty. Start adding your favorite items!'}
                    </p>
                    <Link
                        to="/shop"
                        className={`${baseButtonClasses} bg-green-600 hover:bg-green-700 focus:ring-green-500`}
                    >
                        {t('general.shopNow') || 'Shop Now'}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <section className="w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black py-16 px-4 transition-colors duration-500 ease-in-out md:px-8 lg:px-12">
            <div className="mx-auto max-w-screen-xl">
                <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-12 text-gray-800 dark:text-white leading-tight tracking-wide drop-shadow-lg flex items-center justify-center gap-3">
                    <HeartPulse size={48} className="text-red-500 dark:text-red-400" />
                    {t('wishlistPage.wishlistTitle') || 'My Wishlist'}
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
                    {wishlistItems.map(product => (
                        <ProductCard product={product} key={product._id} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WishlistPage;