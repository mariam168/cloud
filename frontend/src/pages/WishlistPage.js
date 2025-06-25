import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from "../components/LanguageContext";
import { HeartCrack, UserCheck, Loader2, Heart } from 'lucide-react';

const WishlistPage = () => {
    const { wishlistItems, loadingWishlist } = useWishlist();
    const { isAuthenticated } = useAuth();
    const { t } = useLanguage();

    const EmptyState = ({ icon: Icon, title, message, buttonText, buttonLink }) => (
        <div className="flex min-h-[60vh] flex-col items-center justify-center bg-gray-100 dark:bg-black p-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/10 mb-6">
                    <Icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">{message}</p>
                <Link to={buttonLink} className="mt-6 inline-block rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 dark:bg-white dark:text-black dark:hover:bg-indigo-500 dark:hover:text-white">
                    {buttonText}
                </Link>
            </div>
        </div>
    );

    if (loadingWishlist) {
        return (
            <div className="flex min-h-[80vh] w-full items-center justify-center bg-white dark:bg-black">
                <Loader2 size={48} className="animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <EmptyState
                icon={UserCheck}
                title={t('wishlistPage.loginRequiredTitle', 'Please Log In')}
                message={t('wishlistPage.pleaseLogin', 'Log in to see your favorite items and build your wishlist.')}
                buttonText={t('auth.login', 'Log In')}
                buttonLink="/login"
            />
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <EmptyState
                icon={HeartCrack}
                title={t('wishlistPage.emptyWishlistTitle', 'Your Wishlist is Empty')}
                message={t('wishlistPage.emptyWishlist', "You haven't added any items yet. Start exploring and save what you love!")}
                buttonText={t('mainHeader.shop', 'Go Shopping')}
                buttonLink="/shop"
            />
        );
    }

    return (
        <section className="w-full bg-gray-100 dark:bg-black">
            <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
                <header className="text-center mb-12">
                     <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl lg:text-5xl flex items-center justify-center gap-3">
                        <Heart size={36} className="text-red-500" />
                        {t('wishlistPage.wishlistTitle', 'My Wishlist')}
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-gray-600 dark:text-zinc-400">
                        {t('wishlistPage.wishlistSubtitle', 'Here are the items you saved for later. Don\'t let them get away!')}
                    </p>
                </header>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {wishlistItems.map(product => (
                        <ProductCard product={product} key={product._id} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WishlistPage;