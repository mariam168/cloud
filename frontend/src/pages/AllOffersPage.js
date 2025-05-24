// client/src/pages/AllOffersPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { CalendarDays, Tag, PercentCircle, ShoppingCart, Heart, Loader } from 'lucide-react'; // إضافة الأيقونات الجديدة
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';


const AllOffersPage = ({ serverUrl = 'http://localhost:5000' }) => {
    const { t, language } = useLanguage();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // استخدام الـ Contexts
    const { addToCart, isInCart, toggleCart: toggleItemInCart, loadingCart } = useCart();
    const { toggleFavorite, isFavorite, loadingWishlist } = useWishlist();
    const { isAuthenticated, navigate } = useAuth(); // navigate لاستخدامها عند الحاجة لتسجيل الدخول


    useEffect(() => {
        const fetchAllOffers = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${serverUrl}/api/advertisements?isActive=true`);
                setOffers(response.data.sort((a, b) => (a.order || 0) - (b.order || 0) || new Date(b.createdAt) - new Date(a.createdAt)));
                setError(null);
            } catch (err) {
                console.error("Error fetching all offers:", err);
                setError((t('general.errorFetchingData') || 'Failed to load offers.') + (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
            }
        };
        fetchAllOffers();
    }, [serverUrl, t]);

    const formatCurrency = (amount, currencyCode = 'SAR') => {
        if (amount === null || amount === undefined) return 'N/A';
        const options = {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 0, 
            maximumFractionDigits: 2, 
        };
        try {
            return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', options).format(amount);
        } catch (e) {
            console.warn("Invalid currency code or amount:", currencyCode, amount, e);
            return `${currencyCode} ${amount?.toFixed(2)}`; 
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return t('general.notApplicable') || 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', options);
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
                                        src={offer.image ? `${serverUrl}${offer.image}` : ''}
                                        alt={offer.title?.[language] || offer.title?.en || t('general.unnamedItem')}
                                        className="max-h-full max-w-full object-contain"
                                    />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {offer.title?.[language] || offer.title?.en || t('general.unnamedItem')}
                                </h2>
                                {offer.description?.[language] && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-3 flex-grow line-clamp-3">
                                        {offer.description?.[language] || offer.description?.en}
                                    </p>
                                )}
                                
                                <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                                    {(offer.originalPrice !== null || offer.discountedPrice !== null) && (
                                        <div className="flex items-baseline justify-center gap-2 mb-2">
                                            {offer.discountedPrice !== null ? (
                                                <>
                                                    <span className="text-green-600 dark:text-green-400 font-bold text-lg">
                                                        {formatCurrency(offer.discountedPrice, offer.currency)}
                                                    </span>
                                                    {offer.originalPrice !== null && offer.originalPrice > offer.discountedPrice && (
                                                        <span className="text-gray-500 dark:text-gray-400 text-sm line-through">
                                                            {formatCurrency(offer.originalPrice, offer.currency)}
                                                        </span>
                                                    )}
                                                </>
                                            ) : offer.originalPrice !== null ? (
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

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between gap-2 mt-3">
                                        {offer.type !== 'weeklyOffer' && (
                                            <button
                                                onClick={(e) => { e.preventDefault(); toggleItemInCart(offer); }} // منع الانتقال للصفحة
                                                className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out
                                                    ${isInCart(offer._id) 
                                                        ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                                                        : 'bg-green-600 text-white hover:bg-green-700'
                                                    }
                                                    ${loadingCart ? 'opacity-70 cursor-not-allowed' : ''}
                                                `}
                                                disabled={loadingCart}
                                            >
                                                {loadingCart ? (
                                                    <Loader size={16} className="animate-spin" />
                                                ) : isInCart(offer._id) ? (
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

                                        <button
                                            onClick={(e) => { e.preventDefault(); toggleFavorite(offer); }} // منع الانتقال للصفحة
                                            className={`p-2 rounded-full text-white transition-all duration-300 ease-in-out shadow-sm hover:shadow-md
                                                ${isFavorite(offer._id) 
                                                    ? 'bg-red-500 hover:bg-red-600' 
                                                    : 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                                                }
                                                ${loadingWishlist ? 'opacity-70 cursor-not-allowed' : ''}
                                            `}
                                            disabled={loadingWishlist}
                                            aria-label={isFavorite(offer._id) ? (t('general.removeFromWishlist') || 'Remove from Wishlist') : (t('general.addToWishlist') || 'Add to Wishlist')}
                                        >
                                            {loadingWishlist ? (
                                                <Loader size={16} className="animate-spin" />
                                            ) : (
                                                <Heart size={16} fill={isFavorite(offer._id) ? 'white' : 'none'} />
                                            )}
                                        </button>
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