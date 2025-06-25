import React, { useState, useEffect, useCallback } from "react";
import { Copy, Sparkles, Loader2, ShoppingCart, ArrowRight, TrendingUp, CheckCircle2, Tag } from "lucide-react";
import { useLanguage } from "../../components/LanguageContext";
import axios from 'axios';
import { Link } from 'react-router-dom';

const useCurrencyFormatter = () => {
    const { t, language } = useLanguage();
    const formatCurrencyForDisplay = useCallback((amount, currencyCode = 'SAR') => {
        if (amount == null) return t('general.notApplicable');
        const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
        const arabicCurrencySymbols = { 'SAR': ' ر.س', 'USD': ' دولار أمريكي', 'EGP': ' ج.م', 'AED': ' د.إ', 'KWD': ' د.ك', 'BHD': ' د.ب', 'OMR': ' ر.ع', 'QAR': ' ر.ق' };
        if (language === 'ar') {
            const formattedNumber = new Intl.NumberFormat('ar-SA', options).format(Number(amount));
            const symbol = arabicCurrencySymbols[currencyCode.toUpperCase()] || ` ${currencyCode.toUpperCase()}`;
            return `${formattedNumber}${symbol}`;
        } else {
            const ltrOptions = { style: 'currency', currency: currencyCode, minimumFractionDigits: 2, maximumFractionDigits: 2 };
            return new Intl.NumberFormat('en-US', ltrOptions).format(Number(amount));
        }
    }, [language, t]);
    return formatCurrencyForDisplay;
};

const DiscountCodeCard = ({ discount, t, isRTL, handleCopyCode, copiedCode }) => {
    const isCopied = copiedCode === discount.code;
    const formatCurrency = useCurrencyFormatter();

    return (
        <div
            onClick={() => !isCopied && handleCopyCode(discount.code)}
            className={`relative group bg-white dark:bg-zinc-900 rounded-2xl border ${isCopied ? 'border-emerald-500' : 'border-gray-200 dark:border-zinc-800'} shadow-sm hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors duration-300 cursor-pointer overflow-hidden`}
        >
            <div className={`absolute top-0 bottom-0 ${isRTL ? 'right-0' : 'left-0'} w-1.5 bg-emerald-500`}></div>
            <div className={`flex items-center justify-between gap-4 p-5 ${isRTL ? 'pr-8' : 'pl-8'}`}>
                <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">{discount.code}</h4>
                    {discount.percentage && (
                        <p className="text-sm mt-1 font-semibold text-emerald-600 dark:text-emerald-400">
                            {`${discount.percentage}% ${t('general.off')}`}
                        </p>
                    )}
                    {discount.fixedAmount && (
                         <p className="text-sm mt-1 font-semibold text-emerald-600 dark:text-emerald-400" dir="rtl" style={{ unicodeBidi: 'embed' }}>
                            {`${formatCurrency(discount.fixedAmount, discount.currency)} ${t('general.off')}`}
                        </p>
                    )}
                </div>
                <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${isCopied ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 group-hover:bg-emerald-500 group-hover:text-white'}`}>
                    {isCopied ? <CheckCircle2 size={24} /> : <Copy size={20} />}
                </div>
            </div>
        </div>
    );
};

const AllOffersCard = ({ t, isRTL }) => (
    <Link to="/all-offers" className="block group">
        <div className="bg-gray-800 dark:bg-zinc-800 text-white rounded-2xl p-6 shadow-md border border-gray-700 dark:border-zinc-700 relative overflow-hidden transition-all duration-300 hover:bg-black dark:hover:bg-zinc-900 hover:-translate-y-1">
            <div className={`flex items-center justify-between relative ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div>
                    <h3 className="text-xl font-bold">{t('heroSection.allOffersTitle')}</h3>
                    <p className="text-sm text-gray-300 dark:text-zinc-400 mt-1">{t('heroSection.allOffersSubtitle')}</p>
                </div>
                <div className={`p-3 bg-gray-700/50 dark:bg-zinc-700/50 rounded-full transition-transform duration-300 ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`}>
                    <TrendingUp size={24} />
                </div>
            </div>
        </div>
    </Link>
);

const HeroSection = ({ serverUrl = 'http://localhost:5000' }) => {
    const { t, language } = useLanguage();
    const formatCurrencyForDisplay = useCurrencyFormatter();
    const [slidesData, setSlidesData] = useState([]);
    const [sideOffersData, setSideOffersData] = useState([]);
    const [weeklyOfferData, setWeeklyOfferData] = useState(null);
    const [discountsData, setDiscountsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [current, setCurrent] = useState(0);
    const [copiedCode, setCopiedCode] = useState(null);
    const isRTL = language === 'ar';

    const fetchHeroData = useCallback(async () => {
        setLoading(true);
        setError(null);
        const axiosConfig = { headers: { 'accept-language': language } };
        try {
            const [adsResponse, discountsResponse] = await Promise.all([
                axios.get(`${serverUrl}/api/advertisements?isActive=true`, axiosConfig),
                axios.get(`${serverUrl}/api/discounts/active`, axiosConfig)
            ]);
            const allAds = adsResponse.data;
            setSlidesData(allAds.filter(ad => ad.type === 'slide').sort((a, b) => (a.order || 0) - (b.order || 0)));
            setSideOffersData(allAds.filter(ad => ad.type === 'sideOffer').sort((a, b) => (a.order || 0) - (b.order || 0)));
            setWeeklyOfferData(allAds.find(ad => ad.type === 'weeklyOffer'));
            setDiscountsData(discountsResponse.data);
        } catch (err) {
            console.error("Error fetching hero section data:", err);
            setError(t('general.errorFetchingData') || 'Failed to load hero section data.');
        } finally {
            setLoading(false);
        }
    }, [serverUrl, t, language]);

    useEffect(() => {
        fetchHeroData();
    }, [fetchHeroData]);

    const slidesLength = slidesData.length;

    useEffect(() => {
        if (slidesLength > 1) {
            const timer = setInterval(() => {
                setCurrent((prev) => (prev + 1) % slidesLength);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [slidesLength]);

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2500);
    };

    const currentSlideContent = slidesData[current];
    const hasContent = currentSlideContent || sideOffersData.length > 0 || weeklyOfferData || discountsData.length > 0;

    if (loading) { return <section dir={isRTL ? 'rtl' : 'ltr'} className="w-full min-h-[450px] flex items-center justify-center bg-gray-100 dark:bg-zinc-950 animate-pulse rounded-3xl"><Loader2 size={48} className="animate-spin text-indigo-600 dark:text-indigo-400" /></section>; }
    if (error) { return <section dir={isRTL ? 'rtl' : 'ltr'} className="w-full min-h-[450px] flex items-center justify-center bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300 rounded-3xl p-4 text-center"><div className="flex items-center gap-3"><Sparkles size={28} /><span className="font-semibold text-lg">{error}</span></div></section>; }
    if (!hasContent) { return <section dir={isRTL ? 'rtl' : 'ltr'} className="w-full min-h-[450px] flex items-center justify-center bg-gray-50 dark:bg-zinc-900 text-gray-700 dark:text-gray-400 rounded-3xl"><div className="flex flex-col items-center gap-4 text-center"><ShoppingCart size={48} className="text-indigo-500 dark:text-indigo-400" /><p className="font-semibold text-xl">{t('heroSection.noDataAvailable')}</p></div></section>; }

    return (
        <section dir={isRTL ? 'rtl' : 'ltr'} className="w-full py-12 px-4 bg-gray-100 dark:bg-black sm:py-16">
            <div className="mx-auto grid max-w-7xl h-full grid-cols-1 gap-8 lg:grid-cols-3">
                {currentSlideContent && (
                    <div className="relative col-span-1 lg:col-span-2 rounded-3xl bg-white dark:bg-zinc-900 p-6 sm:p-8 md:p-12 shadow-md border border-gray-200 dark:border-zinc-800 overflow-hidden group">
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 h-full">
                            <div className={`flex-shrink-0 relative ${isRTL ? 'md:order-1' : 'md:order-2'}`}>
                                <img src={`${serverUrl}${currentSlideContent.image}`} alt={currentSlideContent.title} className="relative z-10 w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 object-contain transition-transform duration-500 group-hover:scale-105" />
                            </div>
                            <div className={`w-full flex-1 text-center md:text-left ${isRTL ? 'md:order-2 md:text-right' : 'md:order-1'}`}>
                                <p className="font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-xs sm:text-sm">{currentSlideContent.category?.name || t('heroSection.featuredProduct')}</p>
                                <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                                    {currentSlideContent.title}
                                </h1>
                                <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600 dark:text-zinc-300 leading-relaxed max-w-lg mx-auto md:mx-0">
                                    {currentSlideContent.description}
                                </p>
                                <div className={`mt-4 sm:mt-6 flex items-baseline gap-3 justify-center ${isRTL ? 'md:justify-end flex-row-reverse' : 'md:justify-start flex-row'}`}>
                                    {currentSlideContent.discountedPrice != null && (
                                        <span className="text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400" dir="rtl" style={{ unicodeBidi: 'embed' }}>
                                            {formatCurrencyForDisplay(currentSlideContent.discountedPrice, currentSlideContent.currency)}
                                        </span>
                                    )}
                                    {currentSlideContent.originalPrice != null && (
                                        <span className="text-lg sm:text-xl line-through text-gray-500 dark:text-zinc-500" dir="rtl" style={{ unicodeBidi: 'embed' }}>
                                            {formatCurrencyForDisplay(currentSlideContent.originalPrice, currentSlideContent.currency)}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-6 sm:mt-8">
                                    <Link to={currentSlideContent.productRef?._id ? `/shop/${currentSlideContent.productRef._id}` : (currentSlideContent.link || '#')} className="inline-block">
                                        <button className="px-6 sm:px-8 py-3 sm:py-3.5 text-base sm:text-lg font-bold text-white bg-gray-900 dark:bg-white dark:text-black rounded-full shadow-sm hover:bg-indigo-600 dark:hover:bg-indigo-500 active:scale-95 transition-all duration-300 group/btn flex items-center gap-2">
                                            <span className="group-hover/btn:text-white dark:group-hover/btn:text-white">{t('general.shopNow')}</span>
                                            <ArrowRight size={20} className="transform transition-transform group-hover/btn:translate-x-1 group-hover/btn:text-white dark:group-hover/btn:text-white" style={{ transform: isRTL ? 'rotateY(180deg)' : 'none' }} />
                                        </button>
                                    </Link>
                                </div>
                             </div>
                        </div>
                        {slidesLength > 1 && (
                            <div className="absolute bottom-4 sm:bottom-6 inset-x-0 flex justify-center gap-2 z-20">
                                {slidesData.map((_, index) => (
                                    <button key={index} onClick={() => setCurrent(index)} className={`h-2.5 rounded-full transition-all duration-300 ${current === index ? "bg-indigo-500 w-8" : "bg-gray-300 dark:bg-zinc-700 w-2.5 hover:bg-gray-400 dark:hover:bg-zinc-600"}`}></button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                <div className="col-span-1 flex flex-col gap-6">
                    {sideOffersData.slice(0, 1).map((offer) => (
                        <Link key={offer._id} to={offer.link || '#'} className="block group">
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-zinc-800 transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-md">
                                <div className="flex items-center gap-4">
                                    <img src={offer.image ? `${serverUrl}${offer.image}` : ''} alt={offer.title} className="w-20 h-20 object-contain flex-shrink-0 bg-gray-100 dark:bg-zinc-800 rounded-lg p-1 transition-transform duration-300 group-hover:scale-105" />
                                    <div className="flex-1">
                                        <h2 className="font-bold text-base text-gray-800 dark:text-white">{offer.title}</h2>
                                        <p className="mt-1 font-bold text-indigo-600 dark:text-indigo-400 text-lg" dir="rtl" style={{ unicodeBidi: 'embed' }}>
                                            {formatCurrencyForDisplay(offer.discountedPrice, offer.currency)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {weeklyOfferData && (
                        <Link to={weeklyOfferData.link || '#'} className="block group">
                           <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-zinc-800 transition-all duration-300 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-md">
                                <div className="flex items-center gap-4">
                                    <img src={weeklyOfferData.image ? `${serverUrl}${weeklyOfferData.image}` : ''} alt={weeklyOfferData.title} className="w-20 h-20 object-contain flex-shrink-0 bg-gray-100 dark:bg-zinc-800 rounded-lg p-1 transition-transform duration-300 group-hover:scale-105" />
                                    <div className="flex-1">
                                        <h2 className="font-bold text-base text-gray-800 dark:text-white">{weeklyOfferData.title}</h2>
                                        <p className="mt-1 font-semibold text-blue-600 dark:text-blue-400">{weeklyOfferData.description}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )}
                    <AllOffersCard t={t} isRTL={isRTL} />
                    {discountsData.slice(0, 1).map((discount) => (
                        <DiscountCodeCard key={discount._id} discount={discount} t={t} isRTL={isRTL} handleCopyCode={handleCopyCode} copiedCode={copiedCode} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HeroSection;