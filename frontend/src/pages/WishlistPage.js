import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from "../components/LanguageContext";
import { HeartCrack, HeartHandshake, Loader } from 'lucide-react';

const WishlistPage = () => {
    const { wishlistItems, loadingWishlist } = useWishlist();
    const { isAuthenticated } = useAuth();
    const { t } = useLanguage();

    const messageContainerClasses = "container mx-auto px-4 py-20 text-center min-h-[70vh] flex flex-col items-center justify-center";
    const messageBoxClasses = "bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-12 max-w-lg w-full border border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out hover:scale-105";
    const messageTextClasses = "text-lg md:text-xl text-gray-700 dark:text-gray-300 font-semibold mb-6";

    if (loadingWishlist) {
        return (
            <div className={`${messageContainerClasses} bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black`}>
                <div className={`${messageBoxClasses}`}>
                    <Loader size={48} className="text-blue-600 dark:text-blue-400 animate-spin mb-6 mx-auto" />
                    <p className={messageTextClasses}>
                        {t('wishlistPage.loadingWishlist') || 'Loading wishlist...'}
                    </p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className={`${messageContainerClasses} bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-900/50`}>
                <div className={`${messageBoxClasses}`}>
                    <HeartHandshake size={48} className="text-red-600 dark:text-red-400 mb-6 mx-auto" />
                    <p className={messageTextClasses}>
                        {t('wishlistPage.pleaseLogin') || 'Please log in to view your wishlist.'}
                    </p>
                    <Link
                        to="/login"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 transform hover:-translate-y-1"
                    >
                        {t('topBar.signIn') || 'Sign In'}
                    </Link>
                </div>
            </div>
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <div className={`${messageContainerClasses} bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-900/50`}>
                <div className={`${messageBoxClasses}`}>
                    <HeartCrack size={48} className="text-yellow-600 dark:text-yellow-400 mb-6 mx-auto" />
                    <p className={messageTextClasses}>
                        {t('wishlistPage.emptyWishlist') || 'Your wishlist is currently empty.'}
                    </p>
                    <Link
                        to="/shop"
                        className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 transform hover:-translate-y-1"
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
                <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-12 text-gray-800 dark:text-white leading-tight tracking-wide drop-shadow-lg">
                    {t('wishlistPage.wishlistTitle') || 'My Wishlist'}
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
                    {wishlistItems.map(product => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WishlistPage;
