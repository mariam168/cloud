// client/src/pages/AdvertisementDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // استيراد Link
import axios from 'axios';
import { useLanguage } from '../components/LanguageContext'; 
import { CalendarDays, Tag, PercentCircle, ShoppingCart, Heart, Loader } from 'lucide-react'; // إضافة ShoppingCart, Heart, Loader
import { useCart } from '../context/CartContext'; // استيراد CartContext
import { useWishlist } from '../context/WishlistContext'; // استيراد WishlistContext
import { useAuth } from '../context/AuthContext'; // استيراد AuthContext

const AdvertisementDetailsPage = ({ serverUrl = 'http://localhost:5000' }) => {
    const { t, language } = useLanguage();
    const { id } = useParams(); 
    const [advertisement, setAdvertisement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // استخدام الـ Contexts
    const { addToCart, isInCart, toggleCart: toggleItemInCart, loadingCart } = useCart();
    const { toggleFavorite, isFavorite, loadingWishlist } = useWishlist();
    const { isAuthenticated, navigate } = useAuth(); // navigate لاستخدامها عند الحاجة لتسجيل الدخول

    useEffect(() => {
        const fetchAdvertisementDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${serverUrl}/api/advertisements/${id}`);
                setAdvertisement(response.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching advertisement details:", err);
                if (err.response && err.response.status === 404) {
                    setError(t('advertisementDetails.notFound') || 'Advertisement not found.');
                } else {
                    setError((t('general.errorFetchingData') || 'Failed to load advertisement details.') + (err.response?.data?.message || err.message));
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchAdvertisementDetails();
        }
    }, [id, serverUrl, t]);

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
                <p className="text-xl text-gray-700 dark:text-gray-300">{t('general.loading') || 'Loading advertisement details...'}</p>
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

    if (!advertisement) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
                <p className="text-xl text-gray-700 dark:text-gray-300">{t('advertisementDetails.noDetails') || 'No advertisement details found.'}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl my-8 max-w-5xl transition-colors duration-300">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 text-center tracking-tight">
                {advertisement.title?.[language] || advertisement.title?.en || t('general.unnamedItem')}
            </h1>
            <p className="text-center text-sm font-medium text-indigo-600 dark:text-indigo-400 uppercase mb-8">
                {advertisement.type === 'slide' ? t('advertisementDetails.typeSlide') || 'Main Carousel Offer' : 
                 advertisement.type === 'sideOffer' ? t('advertisementDetails.typeSideOffer') || 'Side Offer' :
                 advertisement.type === 'weeklyOffer' ? t('advertisementDetails.typeWeeklyOffer') || 'Weekly Deal' :
                 t('advertisementDetails.typeOther') || 'Special Offer'}
            </p>

            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="w-full md:w-1/2 flex justify-center items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-inner border border-gray-100 dark:border-gray-600">
                    <img
                        src={advertisement.image ? `${serverUrl}${advertisement.image}` : ''}
                        alt={advertisement.title?.[language] || advertisement.title?.en || t('general.unnamedItem')}
                        className="max-w-full h-auto max-h-96 object-contain rounded-lg shadow-md"
                    />
                </div>

                <div className="w-full md:w-1/2 text-center md:text-left flex flex-col justify-between">
                    <div>
                        <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                            {advertisement.description?.[language] || advertisement.description?.en || (t('advertisementAdmin.noDescription') || 'No Description Available.')}
                        </p>

                        {/* Price and Discount Info */}
                        {(advertisement.originalPrice !== null || advertisement.discountedPrice !== null) && (
                            <div className="mb-4 text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                                {advertisement.originalPrice !== null && (
                                    <p className="text-md md:text-lg flex items-center gap-2 mb-1">
                                        <Tag size={20} className="text-gray-500 dark:text-gray-400" />
                                        <span className="font-semibold">{t('advertisementDetails.originalPrice') || 'Original Price'}:</span>{" "}
                                        <span className={`font-semibold ${advertisement.discountedPrice !== null && advertisement.originalPrice > advertisement.discountedPrice ? 'line-through text-gray-500 dark:text-gray-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                            {formatCurrency(advertisement.originalPrice, advertisement.currency)}
                                        </span>
                                    </p>
                                )}
                                {advertisement.discountedPrice !== null && (
                                    <p className="text-xl md:text-2xl font-bold flex items-center gap-2 mt-2">
                                        <PercentCircle size={24} className="text-green-600 dark:text-green-400" />
                                        <span className="font-semibold">{t('advertisementDetails.currentPrice') || 'Current Price'}:</span>{" "}
                                        <span className="text-green-600 dark:text-green-400">
                                            {formatCurrency(advertisement.discountedPrice, advertisement.currency)}
                                        </span>
                                    </p>
                                )}
                                {(advertisement.discountedPrice === null && advertisement.originalPrice === null) && (
                                    <p className="text-lg text-gray-500 dark:text-gray-400">{t('general.priceNotAvailable') || 'Price not available.'}</p>
                                )}
                            </div>
                        )}

                        {/* Dates Info */}
                        {(advertisement.startDate || advertisement.endDate) && (
                            <div className="mb-4 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                                <p className="text-md md:text-lg flex items-center gap-2 mb-1">
                                    <CalendarDays size={20} className="text-indigo-600 dark:text-indigo-400" />
                                    <span className="font-semibold">{t('advertisementDetails.validity') || 'Validity Period'}:</span>
                                </p>
                                {advertisement.startDate && (
                                    <p className="ml-8 text-sm md:text-base">
                                        {t('heroSection.validFrom') || 'From'}: <span className="font-medium">{formatDate(advertisement.startDate)}</span>
                                    </p>
                                )}
                                {advertisement.endDate && (
                                    <p className="ml-8 text-sm md:text-base">
                                        {t('heroSection.validUntil') || 'Until'}: <span className="font-medium">{formatDate(advertisement.endDate)}</span>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center md:justify-start gap-4 mt-8">
                        {/* Add to Cart Button */}
                        {advertisement.type !== 'weeklyOffer' && ( // غالباً العروض الأسبوعية هي عروض عامة وليست لمنتجات محددة تضاف للسلة
                            <button
                                onClick={() => toggleItemInCart(advertisement)} // تمرير كائن الإعلان لـ CartContext
                                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105
                                    ${isInCart(advertisement._id) 
                                        ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 cursor-default'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                    }
                                    ${loadingCart ? 'opacity-70 cursor-not-allowed' : ''}
                                `}
                                disabled={loadingCart}
                            >
                                {loadingCart ? (
                                    <Loader size={20} className="animate-spin" />
                                ) : isInCart(advertisement._id) ? (
                                    <>
                                        <ShoppingCart size={20} />
                                        {t('general.inCart') || 'In Cart'}
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart size={20} />
                                        {t('general.addToCart') || 'Add to Cart'}
                                    </>
                                )}
                            </button>
                        )}

                        {/* Favorite Button */}
                        <button
                            onClick={() => toggleFavorite(advertisement)} // تمرير كائن الإعلان لـ WishlistContext
                            className={`p-3 rounded-full text-white transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105
                                ${isFavorite(advertisement._id) 
                                    ? 'bg-red-500 hover:bg-red-600' 
                                    : 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                                }
                                ${loadingWishlist ? 'opacity-70 cursor-not-allowed' : ''}
                            `}
                            disabled={loadingWishlist}
                            aria-label={isFavorite(advertisement._id) ? (t('general.removeFromWishlist') || 'Remove from Wishlist') : (t('general.addToWishlist') || 'Add to Wishlist')}
                        >
                            {loadingWishlist ? (
                                <Loader size={20} className="animate-spin" />
                            ) : (
                                <Heart size={20} fill={isFavorite(advertisement._id) ? 'white' : 'none'} />
                            )}
                        </button>
                    </div>

                    {/* Go To Offer Link (if exists and not just a placeholder) */}
                    {advertisement.link && advertisement.link !== '#' && (
                        <div className="mt-4">
                            <a 
                                href={advertisement.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-block w-full text-center bg-indigo-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-indigo-700 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                {t('advertisementDetails.goToOffer') || 'Go To Offer'}
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdvertisementDetailsPage;