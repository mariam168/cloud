import React, { useState, useEffect, useCallback } from "react";
import { Tag, Calendar, Percent, Copy, Search, Sparkles, Loader, ShoppingCart } from "lucide-react"; 
import { useLanguage } from "../../components/LanguageContext";
import axios from 'axios';
import { Link } from 'react-router-dom'; 

const HeroSection = ({ serverUrl = 'http://localhost:5000' }) => {
    const { t, language } = useLanguage();
    const [slidesData, setSlidesData] = useState([]);
    const [sideOffersData, setSideOffersData] = useState({});
    const [discountsData, setDiscountsData] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);
    const [current, setCurrent] = useState(0);
    const [hovered, setHovered] = useState(false); 
    const [copiedCode, setCopiedCode] = useState(null);
    const slidesLength = slidesData.length;

    useEffect(() => {
        const fetchHeroData = async () => {
            setLoading(true);
            setError(null);
            try {
                const slidesRes = await axios.get(`${serverUrl}/api/advertisements?type=slide&isActive=true`);
                const sortedSlides = slidesRes.data.sort((a, b) => (a.order || 0) - (b.order || 0));
                setSlidesData(sortedSlides); 
                
                const sideOffersRes = await axios.get(`${serverUrl}/api/hero-side-offers`);
                const activeSideOffers = {};
                for (const key in sideOffersRes.data) {
                    const offer = sideOffersRes.data[key];
                    if (offer.isActive === undefined || offer.isActive === true) { 
                        const now = new Date();
                        const start = offer.startDate ? new Date(offer.startDate) : new Date(0); 
                        const end = offer.endDate ? new Date(offer.endDate) : new Date('9999-12-31T23:59:59'); 
                        if (now >= start && now <= end) {
                            activeSideOffers[key] = offer;
                        }
                    }
                }
                setSideOffersData(activeSideOffers);

                const discountsRes = await axios.get(`${serverUrl}/api/discounts/active`);
                setDiscountsData(discountsRes.data);
            } catch (err) {
                console.error("Error fetching hero section data:", err);
                setError(t('general.errorFetchingData') || 'Failed to load hero section data.');
            } finally {
                setLoading(false);
            }
        };
        fetchHeroData();
    }, [serverUrl, t]);

    useEffect(() => {
        if (slidesLength > 0) {
            const timer = setInterval(() => {
                if (!hovered) {
                    setCurrent((prev) => (prev + 1) % slidesLength);
                }
            }, 5000);
            return () => clearInterval(timer);
        }
        return () => { };
    }, [slidesLength, hovered]);

    const formatCurrency = useCallback((amount, currencyCode = 'SAR') => {
        if (amount === null || amount === undefined) return t('general.notApplicable') || 'N/A';
        const options = {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 0, 
            maximumFractionDigits: 2, 
        };
        try {
            return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', options).format(Number(amount));
        } catch (e) {
            console.warn("Invalid currency code or amount:", currencyCode, amount, e);
            return `${currencyCode} ${Number(amount).toFixed(2)}`; 
        }
    }, [language, t]);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return t('general.notApplicable') || 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', options);
    }, [language, t]);
    
    const currentSlideContent = slidesLength > 0 ? slidesData[current] : null;
    const hasContent = currentSlideContent || Object.keys(sideOffersData).length > 0 || discountsData.length > 0;
    
    const handleCopyCode = (code) => {
        const el = document.createElement('textarea');
        el.value = code;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000); // Hide "Copied!" message after 2 seconds
    };

    // --- Loading, Error, No Content States (unchanged, as they are already good) ---
    if (loading) {
        return (
            <section className="w-full min-h-[400px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-slate-900 dark:to-gray-950 animate-pulse transition-all duration-700 rounded-xl shadow-inner">
                <div className="flex flex-col items-center text-gray-600 dark:text-gray-400 text-xl font-medium tracking-wide">
                    <Loader size={40} className="animate-spin text-blue-500 mb-3" />
                    {t('general.loading') || 'Loading awesome deals...'}
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="w-full min-h-[400px] flex items-center justify-center bg-gradient-to-br from-red-50 to-red-200 dark:from-red-950 dark:to-red-900 text-red-800 dark:text-red-300 rounded-xl shadow-md border border-red-300 dark:border-red-700">
                <div className="text-xl font-semibold flex items-center gap-2">
                    <Sparkles size={24} className="text-red-500" />
                    {t('general.error') || 'Error'}: {error}
                </div>
            </section>
        );
    }

    if (!hasContent) {
        return (
            <section className="w-full min-h-[400px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 text-gray-700 dark:text-gray-300 rounded-xl shadow-md border border-blue-200 dark:border-gray-700">
                <div className="text-xl font-semibold flex flex-col items-center gap-3">
                    <ShoppingCart size={40} className="text-blue-500" />
                    {t('heroSection.noDataAvailable') || 'No exciting offers available right now.'}
                </div>
            </section>
        );
    }

    // --- Main Hero Section Render ---
    return (
        <section className="w-full py-12 px-4 bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-black transition-colors duration-500 ease-in-out sm:py-16 md:py-20 lg:py-24 overflow-hidden font-sans">
            <div className="mx-auto grid max-w-7xl h-full grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
                {/* Main Carousel Slide */}
                {currentSlideContent && (
                    <div
                        className="relative col-span-1 md:col-span-2 flex flex-col items-center justify-center gap-6 rounded-3xl bg-white p-10 shadow-2xl dark:bg-gray-800 md:flex-row overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all duration-500 ease-in-out hover:scale-[1.005] group/main" // **CHANGE:** Slightly less aggressive scale on main hero for a smoother feel
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                    >
                        {/* Content Container for Image and Text */}
                        <div className="relative z-20 flex flex-col md:flex-row items-center justify-center flex-1 text-center md:text-left">
                            {/* Product Image */}
                            <div className="h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 lg:h-72 lg:w-72 flex items-center justify-center flex-shrink-0 order-1 md:order-2">
                                <img
                                    src={currentSlideContent.image ? `${serverUrl}${currentSlideContent.image}` : ''} 
                                    alt={currentSlideContent.title?.[language] || currentSlideContent.title?.en || t('general.unnamedItem')}
                                    className="h-full w-full object-contain mx-auto group-hover/main:scale-105 transition-transform duration-500 ease-in-out"
                                    role="img"
                                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-product-image.png'; }} 
                                />
                            </div>
                            {/* Text Content */}
                            {/* **CHANGE:** Added specific padding to the text content div to better define its area and spacing */}
                            <div className="flex-1 ml-0 md:ml-8 mt-4 md:mt-0 p-4 md:p-6 lg:p-8 order-2 md:order-1">
                                <p className="mb-2 text-base font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                    {t('heroSection.bigSale') || "Limited Time Offer"}
                                </p>
                                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-blue-200 md:text-5xl lg:text-6xl text-balance leading-tight">
                                    {currentSlideContent.title?.[language] || currentSlideContent.title?.en || t('general.unnamedItem')}
                                </h1>
                                <p className="mt-3 text-base text-gray-600 dark:text-gray-300 md:text-lg leading-relaxed">
                                    {currentSlideContent.description?.[language] || currentSlideContent.description?.en || t('advertisementAdmin.noDescription')}
                                </p>

                                <p className="mt-4 text-2xl font-bold text-gray-800 dark:text-white lg:text-3xl flex items-baseline justify-center md:justify-start gap-2">
                                    {currentSlideContent.discountedPrice !== null ? (
                                        <>
                                            <span className="text-blue-600 dark:text-blue-400">
                                                {formatCurrency(currentSlideContent.discountedPrice, currentSlideContent.currency)}
                                            </span>
                                            {currentSlideContent.originalPrice !== null && currentSlideContent.originalPrice > currentSlideContent.discountedPrice && (
                                                <span className="text-gray-500 dark:text-gray-400 text-base md:text-lg line-through">
                                                    {formatCurrency(currentSlideContent.originalPrice, currentSlideContent.currency)}
                                                </span>
                                            )}
                                        </>
                                    ) : currentSlideContent.originalPrice !== null ? (
                                        <span className="text-blue-600 dark:text-blue-400">
                                            {t('heroSection.price') || 'Price'}: {formatCurrency(currentSlideContent.originalPrice, currentSlideContent.currency)}
                                        </span>
                                    ) : (
                                        <span className="text-gray-500 dark:text-gray-400">{t('general.priceNotAvailable') || 'Price N/A'}</span>
                                    )}
                                </p>
                                {(currentSlideContent.startDate || currentSlideContent.endDate) && (
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1">
                                        <Calendar size={16} className="text-indigo-500 dark:text-indigo-400" />
                                        {currentSlideContent.startDate && (
                                            <span>{t('heroSection.validFrom') || 'Valid From'}: <span className="font-medium">{formatDate(currentSlideContent.startDate)}</span></span>
                                        )}
                                        {currentSlideContent.endDate && (
                                            <span>{t('heroSection.validUntil') || 'Valid Until'}: <span className="font-medium">{formatDate(currentSlideContent.endDate)}</span></span>
                                        )}
                                    </p>
                                )}

                                <Link to={`/advertisements/${currentSlideContent._id}`} className="inline-block mt-6"> 
                                    <button
                                        className="rounded-full bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-700 focus:ring-offset-2 active:scale-95"
                                    >
                                        {t('general.shopNow') || "Shop Now"}
                                    </button>
                                </Link>
                            </div>
                        </div>
                        {/* Carousel Navigation Dots */}
                        {slidesLength > 1 && (
                            <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 transform flex justify-center gap-2">
                                {slidesData.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrent(index)}
                                        aria-label={`Go to slide ${index + 1}`}
                                        className={`h-3 w-3 rounded-full transition-all duration-300 ease-out 
                                            ${current === index ? "bg-indigo-600 w-8 shadow-sm" : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"} 
                                        `}
                                    ></button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Side Offers & All Offers / Discount Codes */}
                <div className="col-span-1 flex flex-col gap-6">
                    {Object.keys(sideOffersData).length > 0 && (
                        <>
                            {sideOffersData.iphoneOffer && (
                                <a href={sideOffersData.iphoneOffer.link || '#'} className="block">
                                    <div className="flex items-center gap-4 rounded-3xl bg-white p-6 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 cursor-pointer group/iphone">
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-tight">
                                                {t('heroSection.installment') || "Easy Installments"}
                                            </p>
                                            <h2 className="mt-1 text-base font-bold text-gray-800 dark:text-emerald-300 lg:text-lg group-hover/iphone:text-blue-600 dark:group-hover/iphone:text-blue-400 transition-colors duration-300">
                                                {sideOffersData.iphoneOffer.title?.[language] || sideOffersData.iphoneOffer.title?.en || t('general.unnamedItem')}
                                            </h2>
                                            <p className="mt-1.5 text-lg font-bold text-indigo-600 dark:text-indigo-400 flex items-baseline gap-1">
                                                {sideOffersData.iphoneOffer.discountedPrice !== null ? (
                                                    <>
                                                        {formatCurrency(sideOffersData.iphoneOffer.discountedPrice, sideOffersData.iphoneOffer.currency)}
                                                        {sideOffersData.iphoneOffer.originalPrice !== null && sideOffersData.iphoneOffer.originalPrice > sideOffersData.iphoneOffer.discountedPrice && (
                                                            <span className="text-gray-500 dark:text-gray-400 text-sm line-through">
                                                                {formatCurrency(sideOffersData.iphoneOffer.originalPrice, sideOffersData.iphoneOffer.currency)}
                                                            </span>
                                                        )}
                                                    </>
                                                ) : sideOffersData.iphoneOffer.originalPrice !== null ? (
                                                    formatCurrency(sideOffersData.iphoneOffer.originalPrice, sideOffersData.iphoneOffer.currency)
                                                ) : (
                                                    'N/A'
                                                )}
                                            </p>
                                        </div>
                                        <img
                                            src={sideOffersData.iphoneOffer.image ? `${serverUrl}${sideOffersData.iphoneOffer.image}` : ''} 
                                            alt={sideOffersData.iphoneOffer.title?.[language] || sideOffersData.iphoneOffer.title?.en || t('general.unnamedItem')}
                                            className="w-24 h-24 object-contain flex-shrink-0 drop-shadow-md group-hover/iphone:scale-110 group-hover/iphone:-rotate-3 transition-transform duration-300"
                                            onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-product-image.png'; }} 
                                        />
                                    </div>
                                </a>
                            )}
                            {sideOffersData.weeklyOffer && (
                                <a href={sideOffersData.weeklyOffer.link || '#'} className="block">
                                    <div className="rounded-3xl bg-gradient-to-br from-purple-700 to-indigo-800 p-6 text-white shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 dark:from-purple-800 dark:to-indigo-900 border border-blue-600 dark:border-purple-700 cursor-pointer">
                                        <h2 className="mb-2 text-lg font-bold lg:text-xl">
                                            {sideOffersData.weeklyOffer.title?.[language] || sideOffersData.weeklyOffer.title?.en || t('heroSection.weeklySale') || "Weekly Flash Deals!"}
                                        </h2>

                                        <p className="mb-4 text-sm text-blue-100 dark:text-purple-200 lg:text-base leading-relaxed">
                                            {sideOffersData.weeklyOffer.description?.[language] || sideOffersData.weeklyOffer.description?.en || (t('heroSection.weeklyDesc') || "Unlock incredible savings on your favorite products! Get up to")}{" "}
                                            <span className="font-extrabold text-yellow-300">50% {t('heroSection.off') || "OFF"}</span>{" "}
                                            {t('heroSection.thisWeek') || "for a limited time."}
                                        </p>
                                        <button className="rounded-full bg-white px-6 py-2.5 font-semibold text-blue-800 shadow-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 active:scale-95">
                                            {t('general.shopNow') || "Explore Deals"}
                                        </button>
                                    </div>
                                </a>
                            )}
                        </>
                    )}

                    {/* All Offers Card (slightly more prominent, but still consistent) */}
                    <Link to="/all-offers" className="block mt-4">
                        <div className="flex items-center gap-4 rounded-3xl bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 dark:from-blue-700 dark:to-indigo-800 border border-blue-400 dark:border-indigo-600 cursor-pointer text-center"> {/* **CHANGE:** Added gradient, adjusted text colors for contrast */}
                            <div className="flex-1">
                                <h3 className="text-xl font-bold"> {/* Removed specific color classes, inherits white */}
                                    {t('heroSection.allOffersTitle') || 'Discover All Offers!'}
                                </h3>
                                <p className="text-sm text-blue-100 dark:text-indigo-200 mt-1"> {/* Adjusted text color for contrast */}
                                    {t('heroSection.allOffersDesc') || 'Explore all available promotions and discounts in one place.'}
                                </p>
                            </div>
                            <div className="flex-shrink-0 bg-white bg-opacity-20 rounded-full p-4 flex items-center justify-center"> {/* **CHANGE:** Background adjusted for gradient */}
                                <Search size={32} className="text-white" /> {/* **CHANGE:** Icon color to white */}
                            </div>
                        </div>
                    </Link>

                    {/* Discount Codes */}
                    {discountsData.length > 0 && (
                        <div className="flex flex-col gap-4 mt-2">
                          
                            {discountsData.map((discount) => (
                                <div
                                    key={discount._id}
                                    className="relative flex items-center gap-4 rounded-2xl bg-white p-5 shadow-lg dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-xl transform hover:scale-[1.015] transition-all duration-300 cursor-pointer group/discount overflow-hidden" // **CHANGE:** Removed redundant ring-1. Added overflow-hidden to ensure copied overlay respects border-radius.
                                    onClick={() => handleCopyCode(discount.code)}
                                >
                                    {copiedCode === discount.code && (
                                        <div className="absolute inset-0 bg-green-500/80 dark:bg-green-700/80 flex items-center justify-center text-white text-2xl font-bold animate-fade-in z-30 rounded-2xl"> {/* **CHANGE:** Added z-30 for higher stacking context and rounded corners */}
                                            {t('homepage.copied') || 'Copied!'}
                                        </div>
                                    )}
                                    <div className="flex-shrink-0 bg-green-100 dark:bg-teal-900/30 rounded-full p-3 group-hover/discount:bg-green-200 dark:group-hover/discount:bg-teal-800 transition-colors duration-300">
                                        <Tag size={24} className="text-green-700 dark:text-teal-400" />
                                    </div>
                                    <div className="flex-1 z-20"> {/* Ensure text content is above the copied overlay but below the copied text itself */}
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                                            {t('homepage.discountCode') || 'Your Code'}
                                        </p>
                                        <h4 className="text-xl font-bold text-gray-900 dark:text-white group-hover/discount:text-green-700 dark:group-hover/discount:text-teal-300 transition-colors duration-300">
                                            {discount.code}
                                        </h4>
                                        <p className="text-sm text-green-600 dark:text-teal-400">
                                            {discount.percentage ? (
                                                <span className="flex items-center gap-1">
                                                    <Percent size={16} /> {discount.percentage}% {t('homepage.off') || 'OFF'}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    {formatCurrency(discount.fixedAmount, discount.currency)} {t('homepage.off') || 'OFF'}
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                            <Calendar size={14} /> {formatDate(discount.endDate)}
                                        </p>
                                    </div>
                                    <button
                                        className="ml-auto p-2.5 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95 flex items-center justify-center z-20" 
                                        aria-label={t('homepage.copyCode') || 'Copy Code'}
                                        onClick={(e) => { e.stopPropagation(); handleCopyCode(discount.code); }}
                                    >
                                        <Copy size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default HeroSection;