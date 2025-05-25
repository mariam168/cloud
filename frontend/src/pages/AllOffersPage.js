
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { CalendarDays, Tag, PercentCircle, ShoppingCart, Heart, Loader2 } from 'lucide-react'; 
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';


const AllOffersPage = () => {
    const { t, language } = useLanguage();
    const { API_BASE_URL, isAuthenticated, navigate } = useAuth(); 

    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { addToCart, isInCart, loadingCart } = useCart();
    const { toggleFavorite, isFavorite, loadingWishlist } = useWishlist();

    const formatCurrency = useCallback((amount, currencyCode = 'SAR') => {
        if (amount === null || amount === undefined || amount === "") return t('general.notApplicable') || 'N/A';
        const options = {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        };
        const locale = language === 'ar' ? 'ar-SA' : 'en-US';
        try {
            return new Intl.NumberFormat(locale, options).format(amount);
        } catch (e) {
            console.warn("Invalid currency code or amount in formatCurrency (AllOffersPage):", currencyCode, amount, e);
            return `${t('shopPage.currencySymbol') || '$'} ${Number(amount).toFixed(2)}`;
        }
    }, [language, t]);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return t('general.notApplicable') || 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        const locale = language === 'ar' ? 'ar-EG' : 'en-US';
        return new Date(dateString).toLocaleDateString(locale, options);
    }, [language, t]);

    const fetchAllOffers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${API_BASE_URL}/api/advertisements?isActive=true`);
            setOffers(response.data.sort((a, b) => (a.order || 0) - (b.order || 0) || new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            console.error("Error fetching all offers:", err.response?.data?.message || err.message);
            setError((t('general.errorFetchingData') || 'Failed to load offers.') + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, t]);

    useEffect(() => {
        fetchAllOffers();
    }, [fetchAllOffers]);
    const handleAddToCartClick = (e, offer) => {
        e.preventDefault(); 
        if (!isAuthenticated) {
            alert(t('cart.loginRequired') || 'يرجى تسجيل الدخول لإضافة المنتجات إلى السلة.');
            navigate('/login');
            return;
        }
        if (!offer.productRef) { 
            alert(t('cart.productNotLinked') || 'هذا العرض لا يرتبط بمنتج محدد يمكن إضافته للسلة.');
            return;
        }
        addToCart(offer.productRef);
    };
    const handleToggleFavoriteClick = (e, offer) => {
        e.preventDefault(); 
        if (!isAuthenticated) {
            alert(t('wishlist.loginRequired') || 'يرجى تسجيل الدخول لإضافة المنتجات إلى المفضلة.');
            navigate('/login');
            return;
        }
        if (!offer.productRef) { 
            alert(t('wishlist.productNotLinked') || 'هذا العرض لا يرتبط بمنتج محدد يمكن إضافته للمفضلة.');
            return;
        }
        toggleFavorite(offer.productRef);
    };
    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = '/images/placeholder-offer-image.png';
        e.target.alt = t('general.imageFailedToLoad') || "Image failed to load";
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
                <p className="text-xl text-gray-700 dark:text-gray-300">{t('general.loading') || 'Loading all offers...'}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                <p className="text-xl">{error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 my-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                {t('allOffersPage.title') || 'All Available Offers'}
            </h1>

            {offers.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400 text-lg">
                    {t('allOffersPage.noOffers') || 'No offers are available at the moment.'}
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {offers.map(offer => (
                        <Link to={`/advertisements/${offer._id}`} key={offer._id} className="block group">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:scale-105 border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-center items-center mb-4 h-40">
                                    <img
                                        src={offer.image ? `${API_BASE_URL}${offer.image}` : ''}
                                        alt={offer.title?.[language] || offer.title?.en || t('general.unnamedItem')}
                                        className="max-h-full max-w-full object-contain"
                                        onError={handleImageError}
                                    />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {offer.title?.[language] || offer.title?.en || t('general.unnamedItem')}
                                </h2>
                                {offer.description && (offer.description?.[language] || offer.description?.en || offer.description?.ar) && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-3 flex-grow line-clamp-3">
                                        {offer.description?.[language] || offer.description?.en || offer.description?.ar}
                                    </p>
                                )}

                                <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                                    {(offer.originalPrice !== null || offer.discountedPrice !== null) && (
                                        <div className="flex items-baseline justify-center gap-2 mb-2">
                                            {offer.discountedPrice !== null && offer.discountedPrice !== undefined ? (
                                                <>
                                                    <span className="text-green-600 dark:text-green-400 font-bold text-lg">
                                                        {formatCurrency(offer.discountedPrice, offer.currency)}
                                                    </span>
                                                    {offer.originalPrice !== null && offer.originalPrice !== undefined && offer.originalPrice > offer.discountedPrice && (
                                                        <span className="text-gray-500 dark:text-gray-400 text-sm line-through">
                                                            {formatCurrency(offer.originalPrice, offer.currency)}
                                                        </span>
                                                    )}
                                                </>
                                            ) : offer.originalPrice !== null && offer.originalPrice !== undefined ? (
                                                <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                                                    {formatCurrency(offer.originalPrice, offer.currency)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500 dark:text-gray-400 text-sm">{t('general.priceNotAvailable') || 'Price N/A'}</span>
                                            )}
                                        </div>
                                    )}

                                    {(offer.startDate || offer.endDate) && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center flex items-center justify-center gap-1">
                                            <CalendarDays size={14} className="text-indigo-500" />
                                            {offer.startDate && ` ${formatDate(offer.startDate)}`}
                                            {offer.startDate && offer.endDate && ' - '}
                                            {offer.endDate && `${formatDate(offer.endDate)}`}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between gap-2 mt-3">
                                        {offer.productRef && offer.productRef._id && offer.type !== 'weeklyOffer' && offer.discountedPrice !== null && offer.discountedPrice !== undefined && (
                                            <button
                                                onClick={(e) => handleAddToCartClick(e, offer)}
                                                className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out
                                                    ${isInCart(offer.productRef._id) 
                                                        ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 cursor-default'
                                                        : 'bg-green-600 text-white hover:bg-green-700'
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
                                                        {t('general.inCartShort') || 'In Cart'}
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingCart size={16} />
                                                        {t('general.addToCartShort') || 'Add'}
                                                    </>
                                                )}
                                            </button>
                                        )}
                                        {offer.productRef && offer.productRef._id && (
                                            <button
                                                onClick={(e) => handleToggleFavoriteClick(e, offer)}
                                                className={`p-2 rounded-full text-white transition-all duration-300 ease-in-out shadow-sm hover:shadow-md
                                                    ${isFavorite(offer.productRef._id)
                                                        ? 'bg-red-500 hover:bg-red-600'
                                                        : 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                                                    }
                                                    ${loadingWishlist ? 'opacity-70 cursor-not-allowed' : ''}
                                                `}
                                                disabled={loadingWishlist}
                                                aria-label={isFavorite(offer.productRef._id) ? (t('general.removeFromWishlist') || 'Remove from Wishlist') : (t('general.addToWishlist') || 'Add to Wishlist')}
                                            >
                                                {loadingWishlist ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <Heart size={16} fill={isFavorite(offer.productRef._id) ? 'white' : 'none'} />
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
    );
};

export default AllOffersPage;