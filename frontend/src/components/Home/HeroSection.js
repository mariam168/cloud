import React, { useState, useEffect, useCallback } from "react";
import { Copy, Sparkles, Loader2, ShoppingCart, ArrowRight, TrendingUp, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../../components/LanguageContext";
import axios from 'axios';
import { Link } from 'react-router-dom';

const useCurrencyFormatter = () => {
    const { t, language } = useLanguage();

    return useCallback((amount, currency = 'SAR') => {
        if (amount == null) return t('general.notApplicable');
        let safeCurrencyCode = (currency || 'SAR').toUpperCase();
        if (safeCurrencyCode === 'EG') {
            safeCurrencyCode = 'EGP';
        }
        const locale = language === 'ar' ? 'ar-SA' : 'en-US';
        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: safeCurrencyCode,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(Number(amount));
        } catch (error) {
            console.error("Currency formatting error:", error);
            return `${amount} ${safeCurrencyCode}`;
        }
    }, [language, t]);
};
const DiscountCodeCard = ({ discount, t, isRTL, handleCopyCode, copiedCode }) => {
    const isCopied = copiedCode === discount.code;
    const formatCurrency = useCurrencyFormatter();

    return (
        <div
            onClick={() => !isCopied && handleCopyCode(discount.code)}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors duration-300 dark:bg-zinc-900 ${isCopied ? 'border-emerald-500' : 'border-gray-200 hover:border-emerald-500 dark:border-zinc-800 dark:hover:border-emerald-500'}`}
        >
            <div className={`absolute top-0 bottom-0 w-1.5 bg-emerald-500 ${isRTL ? 'right-0' : 'left-0'}`}></div>
            <div className={`flex items-center justify-between gap-4 p-5 ${isRTL ? 'pr-8' : 'pl-8'}`}>
                <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">{discount.code}</h4>
                    {discount.percentage && (
                        <p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            {t('general.discountPercentage', { percentage: discount.percentage })}
                        </p>
                    )}
                    {discount.fixedAmount && (
                         <p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            {t('general.discountAmount', { amount: formatCurrency(discount.fixedAmount, discount.currency) })}
                        </p>
                    )}
                </div>
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${isCopied ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-emerald-500 group-hover:text-white dark:bg-zinc-800 dark:text-zinc-400'}`}>
                    {isCopied ? <CheckCircle2 size={24} /> : <Copy size={20} />}
                </div>
            </div>
        </div>
    );
};

const AllOffersCard = ({ t, isRTL }) => (
    <Link to="/all-offers" className="block group">
        <div className="relative overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 p-6 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-black dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-900">
            <div className={`relative flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div>
                    <h3 className="text-xl font-bold">{t('heroSection.allOffersTitle')}</h3>
                    <p className="mt-1 text-sm text-gray-300 dark:text-zinc-400">{t('heroSection.allOffersSubtitle')}</p>
                </div>
                <div className={`rounded-full bg-gray-700/50 p-3 transition-transform duration-300 group-hover:scale-110 dark:bg-zinc-700/50 ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`}>
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

    if (loading) { return <section dir={isRTL ? 'rtl' : 'ltr'} className="flex min-h-[450px] w-full items-center justify-center rounded-3xl bg-gray-100 dark:bg-zinc-950"><Loader2 size={48} className="animate-spin text-indigo-500" /></section>; }
    if (error) { return <section dir={isRTL ? 'rtl' : 'ltr'} className="flex min-h-[450px] w-full items-center justify-center rounded-3xl bg-red-100 p-4 text-center text-red-700 dark:bg-red-950/30 dark:text-red-300"><div className="flex items-center gap-3"><Sparkles size={28} /><span className="text-lg font-semibold">{error}</span></div></section>; }
    if (!hasContent) { return <section dir={isRTL ? 'rtl' : 'ltr'} className="flex min-h-[450px] w-full items-center justify-center rounded-3xl bg-gray-50 text-gray-700 dark:bg-zinc-900 dark:text-gray-400"><div className="flex flex-col items-center gap-4 text-center"><ShoppingCart size={48} className="text-indigo-500" /><p className="text-xl font-semibold">{t('heroSection.noDataAvailable')}</p></div></section>; }

    return (
        <section dir={isRTL ? 'rtl' : 'ltr'} className="w-full bg-gray-100 py-12 px-4 dark:bg-black sm:py-16">
            <div className="mx-auto grid h-full max-w-7xl grid-cols-1 gap-8 lg:grid-cols-3">
                {currentSlideContent && (
                    <div className="group relative col-span-1 overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-md dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 md:p-12 lg:col-span-2">
                        <div className="relative z-10 flex h-full flex-col items-center gap-8 md:flex-row">
                            <div className={`relative flex-shrink-0 ${isRTL ? 'md:order-1' : 'md:order-2'}`}>
                                <img src={`${serverUrl}${currentSlideContent.image}`} alt={currentSlideContent.title} className="relative z-10 h-40 w-40 object-contain transition-transform duration-500 group-hover:scale-105 sm:h-48 sm:w-48 md:h-64 md:w-64" />
                            </div>
                            <div className={`w-full flex-1 text-center md:text-left ${isRTL ? 'md:order-2 md:text-right' : 'md:order-1'}`}>
                                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 sm:text-sm">{currentSlideContent.category?.name || t('heroSection.featuredProduct')}</p>
                                <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
                                    {currentSlideContent.title}
                                </h1>
                                <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-gray-600 dark:text-zinc-300 sm:mt-4 sm:text-lg md:mx-0">
                                    {currentSlideContent.description}
                                </p>
                                <div className={`mt-4 flex items-baseline justify-center gap-3 sm:mt-6 ${isRTL ? 'md:justify-end flex-row-reverse' : 'md:justify-start'}`}>
                                    {currentSlideContent.discountedPrice != null && (
                                        <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 sm:text-4xl">
                                            {formatCurrencyForDisplay(currentSlideContent.discountedPrice, currentSlideContent.currency)}
                                        </span>
                                    )}
                                    {currentSlideContent.originalPrice != null && (
                                        <span className="text-lg text-gray-500 line-through dark:text-zinc-500 sm:text-xl">
                                            {formatCurrencyForDisplay(currentSlideContent.originalPrice, currentSlideContent.currency)}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-6 sm:mt-8">
                                    <Link to={currentSlideContent.productRef?._id ? `/shop/${currentSlideContent.productRef._id}` : (currentSlideContent.link || '#')} className="inline-block">
                                        <button className="group/btn flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-base font-bold text-white shadow-sm transition-all duration-300 active:scale-95 hover:bg-indigo-600 dark:bg-white dark:text-black dark:hover:bg-indigo-500 sm:px-8 sm:py-3.5 sm:text-lg">
                                            <span className="dark:group-hover/btn:text-white">{t('general.shopNow')}</span>
                                            <ArrowRight size={20} className={`transform transition-transform group-hover/btn:translate-x-1 dark:group-hover/btn:text-white ${isRTL ? 'rotate-180' : ''}`} />
                                        </button>
                                    </Link>
                                </div>
                             </div>
                        </div>
                        {slidesLength > 1 && (
                            <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center gap-2 sm:bottom-6">
                                {slidesData.map((_, index) => (
                                    <button key={index} onClick={() => setCurrent(index)} className={`h-2.5 rounded-full transition-all duration-300 ${current === index ? "w-8 bg-indigo-500" : "w-2.5 bg-gray-300 hover:bg-gray-400 dark:bg-zinc-700 dark:hover:bg-zinc-600"}`}></button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                <div className="col-span-1 flex flex-col gap-6">
                    {sideOffersData.slice(0, 1).map((offer) => (
                        <Link key={offer._id} to={offer.link || '#'} className="block group">
                            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-indigo-500/50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-500/50">
                                <div className="flex items-center gap-4">
                                    <img src={offer.image ? `${serverUrl}${offer.image}` : ''} alt={offer.title} className="h-20 w-20 flex-shrink-0 rounded-lg bg-gray-100 object-contain p-1 transition-transform duration-300 group-hover:scale-105 dark:bg-zinc-800" />
                                    <div className="flex-1">
                                        <h2 className="text-base font-bold text-gray-800 dark:text-white">{offer.title}</h2>
                                        <p className="mt-1 text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                            {formatCurrencyForDisplay(offer.discountedPrice, offer.currency)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {weeklyOfferData && (
                        <Link to={weeklyOfferData.link || '#'} className="block group">
                           <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-blue-500/50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-500/50">
                                <div className="flex items-center gap-4">
                                    <img src={weeklyOfferData.image ? `${serverUrl}${weeklyOfferData.image}` : ''} alt={weeklyOfferData.title} className="h-20 w-20 flex-shrink-0 rounded-lg bg-gray-100 object-contain p-1 transition-transform duration-300 group-hover:scale-105 dark:bg-zinc-800" />
                                    <div className="flex-1">
                                        <h2 className="text-base font-bold text-gray-800 dark:text-white">{weeklyOfferData.title}</h2>
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