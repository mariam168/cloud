
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Tag, Calendar, Percent, Copy, Search } from "lucide-react"; 
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
                setSideOffersData(sideOffersRes.data);

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

    const nextSlide = () => {
        if (slidesLength > 0) {
            setCurrent((prev) => (prev + 1) % slidesLength);
        }
    };

    const prevSlide = () => {
        if (slidesLength > 0) {
            setCurrent((prev) => (prev - 1 + slidesLength) % slidesLength);
        }
    };

    const handleCopyCode = (code) => {
        const el = document.createElement('textarea');
        el.value = code;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const currentSlideContent = slidesLength > 0 ? slidesData[current] : null;
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
    
    const hasContent = currentSlideContent || Object.keys(sideOffersData).length > 0 || discountsData.length > 0;

    if (loading) {
        return (
            <section className="w-full min-h-[400px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-slate-900 dark:to-gray-950 animate-pulse transition-all duration-700 rounded-lg">
                <div className="text-gray-600 dark:text-gray-400 text-xl font-medium tracking-wide">
                    {t('general.loading') || 'Loading awesome deals...'}
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="w-full min-h-[400px] flex items-center justify-center bg-gradient-to-br from-red-50 to-red-200 dark:from-red-950 dark:to-red-900 text-red-800 dark:text-red-300 rounded-lg shadow-md">
                <div className="text-xl font-semibold">
                    {t('general.error') || 'Error'}: {error}
                </div>
            </section>
        );
    }

    if (!hasContent) {
        return (
            <section className="w-full min-h-[400px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 text-gray-700 dark:text-gray-300 rounded-lg shadow-md">
                <div className="text-xl font-semibold">
                    {t('heroSection.noDataAvailable') || 'No exciting offers available right now.'}
                </div>
            </section>
        );
    }

    return (
        <section className="w-full py-12 px-4 bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-black transition-colors duration-500 ease-in-out sm:py-16 md:py-20 lg:py-24 overflow-hidden font-sans">
            <div className="mx-auto grid max-w-7xl h-full grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
                {currentSlideContent && (
                    <div
                        className="relative col-span-1 md:col-span-2 flex flex-col items-center justify-center gap-6 rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-800 md:flex-row overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all duration-500 ease-in-out hover:scale-[1.005] group/main"
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                    >
                        {slidesLength > 1 && (
                            <div
                                className={`absolute inset-0 z-10 flex items-center justify-between px-6 transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0 md:opacity-100"
                                    }`}
                            >
                                <button
                                    onClick={prevSlide}
                                    className="rounded-full bg-white/60 p-2.5 text-gray-700 shadow-md hover:bg-white hover:text-indigo-600 dark:bg-gray-700/60 dark:text-gray-200 dark:hover:bg-gray-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 backdrop-blur-sm"
                                    aria-label="Previous Slide"
                                >
                                    <ChevronLeft size={28} />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="rounded-full bg-white/60 p-2.5 text-gray-700 shadow-md hover:bg-white hover:text-indigo-600 dark:bg-gray-700/60 dark:text-gray-200 dark:hover:bg-gray-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 backdrop-blur-sm"
                                    aria-label="Next Slide"
                                >
                                    <ChevronRight size={28} />
                                </button>
                            </div>
                        )}
                        <div className="relative z-20 flex flex-col md:flex-row items-center justify-center flex-1 text-center md:text-left p-4 md:p-0">
                            <div className="h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 lg:h-72 lg:w-72 flex items-center justify-center p-4 md:p-0 order-1 md:order-2 flex-shrink-0">
                                <img
                                    src={currentSlideContent.image ? `${serverUrl}${currentSlideContent.image}` : ''} 
                                    alt={currentSlideContent.title?.[language] || currentSlideContent.title?.en || t('general.unnamedItem')}
                                    className="h-full w-full object-contain mx-auto drop-shadow-lg group-hover/main:scale-105 transition-transform duration-500 ease-in-out"
                                    role="img"
                                />
                            </div>
                            <div className="flex-1 ml-0 md:ml-8 p-4 md:p-6 lg:p-8 order-2 md:order-1 mt-4 md:mt-0">
                                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                    {t('heroSection.bigSale') || "Limited Time Offer"}
                                </p>
                                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-blue-200 md:text-4xl lg:text-5xl text-balance leading-tight">
                                    {currentSlideContent.title?.[language] || currentSlideContent.title?.en || t('general.unnamedItem')}
                                </h1>
                                <p className="mt-3 text-base text-gray-600 dark:text-gray-300 md:text-lg leading-relaxed">
                                    {currentSlideContent.description?.[language] || currentSlideContent.description?.en || t('advertisementAdmin.noDescription')}
                                </p>

                                <p className="mt-4 text-xl font-bold text-gray-800 dark:text-white lg:text-2xl flex items-baseline justify-center md:justify-start gap-2">
                                    {currentSlideContent.discountedPrice !== null ? (
                                        <>
                                            <span className="text-blue-600 dark:text-blue-400">
                                                {formatCurrency(currentSlideContent.discountedPrice, currentSlideContent.currency)}
                                            </span>
                                            {currentSlideContent.originalPrice !== null && currentSlideContent.originalPrice > currentSlideContent.discountedPrice && (
                                                <span className="text-gray-500 dark:text-gray-400 text-sm md:text-base line-through">
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
                                        className="rounded-full bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 active:scale-95"
                                    >
                                        {t('general.shopNow') || "Shop Now"}
                                    </button>
                                </Link>
                            </div>
                        </div>
                        {slidesLength > 1 && (
                            <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 transform flex justify-center gap-2">
                                {slidesData.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrent(index)}
                                        aria-label={`Go to slide ${index + 1}`}
                                        className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ease-out
                                            ${current === index ? "bg-indigo-600 w-7 shadow-sm" : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-600/70 dark:hover:bg-gray-500/70"}
                                        `}
                                    ></button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                <div className="col-span-1 flex flex-col gap-6">
                    {sideOffersData.iphoneOffer && (
                        <a href={sideOffersData.iphoneOffer.link || '#'} className="block">
                            <div className="flex items-center gap-4 rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 dark:from-gray-700 dark:to-blue-900 border border-blue-100 dark:border-blue-700 cursor-pointer group/iphone">
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-tight">
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
                                />
                            </div>
                        </a>
                    )}
                    {sideOffersData.weeklyOffer && (
                        <a href={sideOffersData.weeklyOffer.link || '#'} className="block">
                            <div className="rounded-3xl bg-gradient-to-br from-blue-700 to-indigo-900 p-6 text-white shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 dark:from-purple-800 dark:to-indigo-900 border border-blue-600 dark:border-purple-700 cursor-pointer">
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
                    <Link to="/all-offers" className="block mt-4">
                        <div className="flex items-center gap-4 rounded-3xl bg-gradient-to-r from-purple-50 to-pink-50 p-6 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 dark:from-purple-900 dark:to-pink-900 border border-purple-200 dark:border-purple-700 cursor-pointer text-center">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-purple-800 dark:text-pink-300">
                                    {t('heroSection.allOffersTitle') || 'Discover All Offers!'}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {t('heroSection.allOffersDesc') || 'Explore all available promotions and discounts in one place.'}
                                </p>
                            </div>
                            <div className="flex-shrink-0 bg-purple-100 dark:bg-pink-900/30 rounded-full p-3 flex items-center justify-center">
                                <Search size={28} className="text-purple-700 dark:text-pink-400" />
                            </div>
                        </div>
                    </Link>

                    {discountsData.length > 0 && (
                        <div className="flex flex-col gap-4 mt-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">
                                {t('homepage.discountsTitle') || 'Exclusive Discount Codes'}
                            </h3>
                            {discountsData.map((discount) => (
                                <div
                                    key={discount._id}
                                    className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-green-50 to-teal-50 p-4 shadow-sm hover:shadow-md transform hover:scale-[1.01] transition-all duration-300 dark:from-gray-700 dark:to-gray-800 border border-gray-100 dark:border-gray-700 cursor-pointer group/discount"
                                    onClick={() => handleCopyCode(discount.code)}
                                >
                                    <div className="flex-shrink-0 bg-green-100 dark:bg-teal-900/30 rounded-full p-2.5 group-hover/discount:bg-green-200 dark:group-hover/discount:bg-teal-800 transition-colors duration-300">
                                        <Tag size={20} className="text-green-700 dark:text-teal-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                                            {t('homepage.discountCode') || 'Your Code'}
                                        </p>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover/discount:text-green-700 dark:group-hover/discount:text-teal-300 transition-colors duration-300">
                                            {discount.code}
                                        </h4>
                                        <p className="text-sm text-green-600 dark:text-teal-400">
                                            {discount.percentage ? (
                                                <span className="flex items-center gap-1">
                                                    <Percent size={14} /> {discount.percentage}% {t('homepage.off') || 'OFF'}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    {formatCurrency(discount.fixedAmount, discount.currency)} {t('homepage.off') || 'OFF'}
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                            <Calendar size={12} /> {t('homepage.validUntil') || 'Valid until'}: {formatDate(discount.endDate)}
                                        </p>
                                    </div>
                                    <button
                                        className="ml-auto p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95 flex items-center justify-center"
                                        aria-label={t('homepage.copyCode') || 'Copy Code'}
                                        onClick={(e) => { e.stopPropagation(); handleCopyCode(discount.code); }}
                                    >
                                        {copiedCode === discount.code ? (
                                            <span className="text-sm px-1.5">{t('homepage.copied') || 'Copied!'}</span>
                                        ) : (
                                            <Copy size={18} />
                                        )}
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