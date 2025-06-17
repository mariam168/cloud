import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { CalendarDays, Tag, PercentCircle, ShoppingCart, Heart, Loader2, Info, ImageOff } from 'lucide-react'; // <<<<<<< تم إضافة ImageOff هنا!
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';


const AllOffersPage = () => {
    const { t, language } = useLanguage();
    const { API_BASE_URL, isAuthenticated, navigate } = useAuth(); // Assuming navigate is also from useAuth or passed down

    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { addToCart, isInCart, loading: loadingCart } = useCart(); // Renamed loadingCart for consistency
    const { toggleFavorite, isFavorite, loading: loadingWishlist } = useWishlist(); // Renamed loadingWishlist for consistency

    const formatCurrency = useCallback((amount) => {
        if (amount === null || amount === undefined || amount === "") return t('general.notApplicable');
        const options = {
            style: 'currency',
            currency: t('general.currencyCode'), // Use global currency code
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        };
        const locale = language === 'ar' ? 'ar-SA' : 'en-US'; // Saudi Arabia locale for SAR, US for USD
        try {
            return new Intl.NumberFormat(locale, options).format(amount);
        } catch (e) {
            console.warn("Invalid currency code or amount in formatCurrency (AllOffersPage):", t('general.currencyCode'), amount, e);
            return `${t('general.currencySymbol')}${Number(amount).toFixed(2)}`; // Fallback
        }
    }, [language, t]);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return t('general.notApplicable');
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        const locale = language === 'ar' ? 'ar-EG' : 'en-US';
        return new Date(dateString).toLocaleDateString(locale, options);
    }, [language, t]);

    const fetchAllOffers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${API_BASE_URL}/api/advertisements?isActive=true`);
            // Sort by order, then by creation date as a fallback
            setOffers(response.data.sort((a, b) => (a.order || 0) - (b.order || 0) || new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            console.error("Error fetching all offers:", err.response?.data?.message || err.message);
            setError((t('general.errorFetchingData')) + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, t]);

    useEffect(() => {
        fetchAllOffers();
    }, [fetchAllOffers]);

    const handleAddToCartClick = useCallback((e, offer) => {
        e.preventDefault(); // Prevent navigating to offer details page
        e.stopPropagation(); // Stop event propagation to parent Link
        
        if (!isAuthenticated) {
            alert(t('cart.loginRequired'));
            navigate('/login');
            return;
        }
        if (!offer.productRef || !offer.productRef._id) { 
            alert(t('cart.productNotLinked'));
            return;
        }
        addToCart(offer.productRef);
    }, [isAuthenticated, addToCart, navigate, t]);

    const handleToggleFavoriteClick = useCallback((e, offer) => {
        e.preventDefault(); // Prevent navigating to offer details page
        e.stopPropagation(); // Stop event propagation to parent Link

        if (!isAuthenticated) {
            alert(t('wishlist.loginRequired'));
            navigate('/login');
            return;
        }
        if (!offer.productRef || !offer.productRef._id) { 
            alert(t('wishlist.productNotLinked'));
            return;
        }
        toggleFavorite(offer.productRef);
    }, [isAuthenticated, toggleFavorite, navigate, t]);

    const handleImageError = useCallback((e) => {
        e.target.onerror = null;
        e.target.src = '/images/placeholder-product-image.png'; // Using a generic placeholder image
        e.target.alt = t('general.imageFailedToLoad');
    }, [t]);


    if (loading) {
        return (
            <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-20 px-4 transition-colors duration-500 ease-in-out">
                <div className="flex flex-col items-center justify-center text-xl font-semibold text-gray-700 dark:text-gray-300">
                    <Loader2 size={64} className="text-blue-500 dark:text-blue-400 animate-spin mb-4" />
                    <span className="text-2xl">{t('general.loading')}</span>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-20 px-4 transition-colors duration-500 ease-in-out">
                <div className="flex flex-col items-center justify-center text-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md mx-auto border border-gray-200 dark:border-gray-700">
                    <Info size={64} className="mb-6 text-red-500 dark:text-red-400" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('general.error')}</h2>
                    <p className="text-lg text-red-600 dark:text-red-300">{error}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-16 px-4 md:px-8 lg:px-12 transition-colors duration-300">
            <div className="container mx-auto">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-12 text-center leading-tight">
                    {t('allOffersPage.title')}
                </h1>

                {offers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md mx-auto border border-gray-200 dark:border-gray-700">
                        <Info size={64} className="mb-6 text-blue-500 dark:text-blue-400" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('allOffersPage.noOffersTitle')}</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400">{t('allOffersPage.noOffers')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"> {/* Adjusted gap */}
                        {offers.map(offer => (
                            <Link to={`/advertisements/${offer._id}`} key={offer._id} className="block group">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 border border-gray-100 dark:border-gray-700"> {/* Subtle hover effect */}
                                    <div className="flex justify-center items-center mb-4 h-40">
                                        {offer.image ? (
                                            <img
                                                src={`${API_BASE_URL}${offer.image}`}
                                                alt={offer.title?.[language] || offer.title?.en || t('general.unnamedItem')}
                                                className="max-h-full max-w-full object-contain rounded-md"
                                                onError={handleImageError}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-base">
                                                <ImageOff size={48} className="mb-2" /> {/*<<<<< استخدام ImageOff هنا */}
                                                {t('general.noImage')}
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {offer.title?.[language] || offer.title?.en || t('general.unnamedItem')}
                                    </h2>
                                    {offer.description && (offer.description?.[language] || offer.description?.en || offer.description?.ar) && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-3 flex-grow line-clamp-3">
                                            {offer.description?.[language] || offer.description?.en || offer.description?.ar}
                                        </p>
                                    )}

                                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700"> {/* Clearer border */}
                                        {/* Price Display */}
                                        {(offer.originalPrice !== null || offer.discountedPrice !== null) && (
                                            <div className="flex items-baseline justify-center gap-2 mb-2">
                                                {offer.discountedPrice !== null && offer.discountedPrice !== undefined ? (
                                                    <>
                                                        <span className="text-green-600 dark:text-green-400 font-bold text-xl"> {/* Larger discounted price */}
                                                            {formatCurrency(offer.discountedPrice)}
                                                        </span>
                                                        {offer.originalPrice !== null && offer.originalPrice !== undefined && offer.originalPrice > offer.discountedPrice && (
                                                            <span className="text-gray-500 dark:text-gray-400 text-base line-through"> {/* Original price size */}
                                                                {formatCurrency(offer.originalPrice)}
                                                            </span>
                                                        )}
                                                    </>
                                                ) : offer.originalPrice !== null && offer.originalPrice !== undefined ? (
                                                    <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">
                                                        {formatCurrency(offer.originalPrice)}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500 dark:text-gray-400 text-sm">{t('general.priceNotAvailable')}</span>
                                                )}
                                            </div>
                                        )}

                                        {/* Dates Display */}
                                        {(offer.startDate || offer.endDate) && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center flex items-center justify-center gap-1">
                                                <CalendarDays size={14} className="text-indigo-500/80" /> {/* Muted icon color */}
                                                {offer.startDate && ` ${formatDate(offer.startDate)}`}
                                                {offer.startDate && offer.endDate && ' - '}
                                                {offer.endDate && `${formatDate(offer.endDate)}`}
                                            </p>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex items-center justify-between gap-3 mt-4"> {/* Increased gap */}
                                            {offer.productRef && offer.productRef._id && offer.type !== 'weeklyOffer' && offer.discountedPrice !== null && offer.discountedPrice !== undefined && (
                                                <button
                                                    onClick={(e) => handleAddToCartClick(e, offer)}
                                                    className={`flex-1 flex items-center justify-center gap-1 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ease-in-out shadow-sm
                                                        ${isInCart(offer.productRef._id) 
                                                            ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 cursor-default'
                                                            : 'bg-green-500 text-white hover:bg-green-600' // Subtle green
                                                        }
                                                        ${loadingCart ? 'opacity-70 cursor-not-allowed' : ''}
                                                    `}
                                                    disabled={loadingCart}
                                                >
                                                    {loadingCart ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : isInCart(offer.productRef._id) ? ( 
                                                        <>
                                                            <ShoppingCart size={16} />
                                                            {t('general.inCartShort')}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ShoppingCart size={16} />
                                                            {t('general.addToCartShort')}
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                            {offer.productRef && offer.productRef._id && (
                                                <button
                                                    onClick={(e) => handleToggleFavoriteClick(e, offer)}
                                                    className={`p-2 rounded-full transition-all duration-200 ease-in-out shadow-sm hover:shadow-md
                                                        ${isFavorite(offer.productRef._id)
                                                            ? 'bg-red-500 text-white hover:bg-red-600' // Subtle red
                                                            : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                                                        }
                                                        ${loadingWishlist ? 'opacity-70 cursor-not-allowed' : ''}
                                                    `}
                                                    disabled={loadingWishlist}
                                                    aria-label={isFavorite(offer.productRef._id) ? (t('general.removeFromWishlist')) : (t('general.addToWishlist'))}
                                                >
                                                    {loadingWishlist ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <Heart size={16} fill={isFavorite(offer.productRef._id) ? 'currentColor' : 'none'} />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default AllOffersPage;