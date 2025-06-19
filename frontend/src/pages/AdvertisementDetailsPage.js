import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../components/LanguageContext';
import { CalendarDays, Tag, PercentCircle, ShoppingCart, Heart, Loader2, Info, ImageOff, ExternalLink } from 'lucide-react'; // Added Info, ImageOff, ExternalLink
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext'; 

const AdvertisementDetailsPage = () => {
    const { t, language } = useLanguage();
    const { id } = useParams();
    const { API_BASE_URL, isAuthenticated, navigate } = useAuth(); 
    const [advertisement, setAdvertisement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { addToCart, isInCart, loading: loadingCart } = useCart();
    const { toggleFavorite, isFavorite, loading: loadingWishlist } = useWishlist();

    const formatCurrency = useCallback((amount) => {
        if (amount === null || amount === undefined || amount === "") return t('general.notApplicable');
        const options = {
            style: 'currency',
            currency: t('general.currencyCode'), 
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        };
        const locale = language === 'ar' ? 'ar-SA' : 'en-US';
        try {
            return new Intl.NumberFormat(locale, options).format(Number(amount));
        } catch (e) {
            console.warn("Invalid currency code or amount in formatCurrency (AdvertisementDetailsPage):", t('general.currencyCode'), amount, e);
            return `${t('general.currencySymbol')}${Number(amount).toFixed(2)}`; 
        }
    }, [language, t]);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return t('general.notApplicable');
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        const locale = language === 'ar' ? 'ar-EG' : 'en-US';
        return new Date(dateString).toLocaleDateString(locale, options);
    }, [language, t]);

    const fetchAdvertisementDetails = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${API_BASE_URL}/api/advertisements/${id}`);
            setAdvertisement(response.data);
        } catch (err) {
            console.error("Error fetching advertisement details:", err.response?.data?.message || err.message);
            if (err.response && err.response.status === 404) {
                setError(t('advertisementDetails.notFound'));
            } else {
                setError((t('general.errorFetchingData')) + (err.response?.data?.message || err.message));
            }
        } finally {
            setLoading(false);
        }
    }, [id, API_BASE_URL, t]);

    useEffect(() => {
        if (id) {
            fetchAdvertisementDetails();
        }
    }, [id, fetchAdvertisementDetails]);

    const handleAddToCartClick = useCallback((e) => {
        e.preventDefault(); 
        e.stopPropagation(); 
        
        if (!isAuthenticated) {
            alert(t('cart.loginRequired'));
            navigate('/login');
            return;
        }
        if (!advertisement.productRef || !advertisement.productRef._id) { 
            alert(t('allOffersPage.productNotLinked')); 
            return;
        }
        addToCart(advertisement.productRef);
    }, [isAuthenticated, addToCart, navigate, t, advertisement]);

    const handleToggleFavoriteClick = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation(); 

        if (!isAuthenticated) {
            alert(t('wishlist.loginRequired'));
            navigate('/login');
            return;
        }
        if (!advertisement.productRef || !advertisement.productRef._id) { 
            alert(t('allOffersPage.productNotLinked'));
            return;
        }
        toggleFavorite(advertisement.productRef);
    }, [isAuthenticated, toggleFavorite, navigate, t, advertisement]); 

    const handleImageError = useCallback((e) => {
        e.target.onerror = null;
        e.target.src = '/images/placeholder-product-image.png'; 
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

    if (!advertisement) {
        return (
            <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-20 px-4 transition-colors duration-500 ease-in-out">
                 <div className="flex flex-col items-center justify-center text-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md mx-auto border border-gray-200 dark:border-gray-700">
                    <Info size={64} className="mb-6 text-gray-400 dark:text-gray-500" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('advertisementDetails.noDetailsTitle')}</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">{t('advertisementDetails.noDetails')}</p>
                 </div>
            </section>
        );
    }

    const offerTitle = advertisement.title?.[language] || advertisement.title?.en || advertisement.title?.ar || t('general.unnamedItem');
    const offerDescription = advertisement.description?.[language] || advertisement.description?.en || advertisement.description?.ar || t('advertisementAdmin.noDescription');

    return (
        <section className="w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-16 px-4 md:px-8 lg:px-12 transition-colors duration-300">
            <div className="container mx-auto max-w-6xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 border border-gray-200 dark:border-gray-700">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 text-center leading-tight">
                    {offerTitle}
                </h1>
                <p className="text-center text-lg font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-10">
                    {advertisement.type === 'slide' ? t('advertisementDetails.typeSlide') :
                     advertisement.type === 'sideOffer' ? t('advertisementDetails.typeSideOffer') :
                     advertisement.type === 'weeklyOffer' ? t('advertisementDetails.typeWeeklyOffer') :
                     t('advertisementDetails.typeOther')}
                </p>

                <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
                    <div className="w-full lg:w-1/2 flex justify-center items-center flex-shrink-0 p-6 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-inner border border-gray-200 dark:border-gray-600">
                        {advertisement.image ? (
                            <img
                                src={`${API_BASE_URL}${advertisement.image}`}
                                alt={offerTitle}
                                className="max-w-full h-auto max-h-[400px] object-contain rounded-lg transition-transform duration-300 ease-in-out hover:scale-105"
                                onError={handleImageError}
                            />
                        ) : (
                            <div className="w-full h-[300px] flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-lg">
                                <ImageOff size={64} className="mb-4" />
                                {t('general.noImage')}
                            </div>
                        )}
                    </div>
                    <div className="w-full lg:w-1/2 flex flex-col justify-between">
                        <div className="mb-8">
                            <h3 className="sr-only">{t('general.description') || 'Description'}</h3> 
                            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                                {offerDescription}
                            </p>
                        </div>
                        {(advertisement.originalPrice !== null || advertisement.discountedPrice !== null) && (
                            <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 mb-8">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{t('advertisementDetails.priceDetails') || 'Price Details'}</h3>
                                {advertisement.originalPrice !== null && advertisement.originalPrice !== undefined && (
                                    <p className="text-md md:text-lg flex items-center gap-2 mb-2">
                                        <Tag size={20} className="text-gray-500/80 dark:text-gray-400/80" />
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{t('advertisementDetails.originalPrice')}:</span>{" "}
                                        <span className={`font-semibold ${advertisement.discountedPrice !== null && advertisement.discountedPrice !== undefined && advertisement.originalPrice > advertisement.discountedPrice ? 'line-through text-gray-500 dark:text-gray-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                            {formatCurrency(advertisement.originalPrice)}
                                        </span>
                                    </p>
                                )}
                                {advertisement.discountedPrice !== null && advertisement.discountedPrice !== undefined && (
                                    <p className="text-2xl md:text-3xl font-bold flex items-center gap-2 mt-2">
                                        <PercentCircle size={28} className="text-green-600 dark:text-green-400" />
                                        <span className="font-semibold text-gray-800 dark:text-gray-200">{t('advertisementDetails.currentPrice')}:</span>{" "}
                                        <span className="text-green-600 dark:text-green-400">
                                            {formatCurrency(advertisement.discountedPrice)}
                                        </span>
                                    </p>
                                )}
                                {(advertisement.discountedPrice === null && advertisement.originalPrice === null) && (
                                    <p className="text-lg text-gray-500 dark:text-gray-400">{t('general.priceNotAvailable')}</p>
                                )}
                            </div>
                        )}
                        {(advertisement.startDate || advertisement.endDate) && (
                            <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 mb-8">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                    <CalendarDays size={24} className="text-indigo-600/80 dark:text-indigo-400/80" />
                                    {t('advertisementDetails.validity')}
                                </h3>
                                {advertisement.startDate && (
                                    <p className="text-base text-gray-700 dark:text-gray-300 mb-1">
                                        <span className="font-medium">{t('heroSection.validFrom')}:</span>{" "}
                                        {formatDate(advertisement.startDate)}
                                    </p>
                                )}
                                {advertisement.endDate && (
                                    <p className="text-base text-gray-700 dark:text-gray-300">
                                        <span className="font-medium">{t('heroSection.validUntil')}:</span>{" "}
                                        {formatDate(advertisement.endDate)}
                                    </p>
                                )}
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
                            {advertisement.productRef && advertisement.productRef._id && advertisement.type !== 'weeklyOffer' && advertisement.discountedPrice !== null && advertisement.discountedPrice !== undefined && (
                                <button
                                    onClick={handleAddToCartClick}
                                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-200 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5
                                        ${isInCart(advertisement.productRef._id)
                                            ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 cursor-default'
                                            : 'bg-blue-500 text-white hover:bg-blue-600' 
                                        }
                                        ${loadingCart ? 'opacity-70 cursor-not-allowed' : ''}
                                    `}
                                    disabled={loadingCart}
                                >
                                    {loadingCart ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : isInCart(advertisement.productRef._id) ? ( 
                                        <>
                                            <ShoppingCart size={20} className={`${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                                            {t('general.inCartShort')}
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart size={20} className={`${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                                            {t('general.addToCartShort')}
                                        </>
                                    )}
                                </button>
                            )}
                            {advertisement.productRef && advertisement.productRef._id && (
                                <button
                                    onClick={handleToggleFavoriteClick}
                                    className={`p-3 rounded-lg transition-all duration-200 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5
                                        ${isFavorite(advertisement.productRef._id)
                                            ? 'bg-red-500 text-white hover:bg-red-600' 
                                            : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                                        }
                                        ${loadingWishlist ? 'opacity-70 cursor-not-allowed' : ''}
                                    `}
                                    disabled={loadingWishlist}
                                    aria-label={isFavorite(advertisement.productRef._id) ? (t('general.removeFromWishlist')) : (t('general.addToWishlist'))}
                                >
                                    {loadingWishlist ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <Heart size={20} fill={isFavorite(advertisement.productRef._id) ? 'currentColor' : 'none'} />
                                    )}
                                </button>
                            )}
                        </div>
                        {advertisement.link && advertisement.link !== '#' && (
                            <div className="mt-6 text-center">
                                <a
                                    href={advertisement.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center bg-indigo-500 text-white font-semibold py-3 px-8 rounded-lg hover:bg-indigo-600 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                    {t('advertisementDetails.goToOffer')}
                                    <ExternalLink size={20} className={`${language === 'ar' ? 'mr-2' : 'ml-2'}`} />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AdvertisementDetailsPage;