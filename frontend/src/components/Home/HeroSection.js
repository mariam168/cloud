import React, { useState, useEffect, useCallback } from "react";
import { Tag, Calendar, Copy, Sparkles, Loader2, ShoppingCart, ArrowRight } from "lucide-react";
import { useLanguage } from "../../components/LanguageContext";
import axios from 'axios';
import { Link } from 'react-router-dom';

const HeroSection = ({ serverUrl = 'http://localhost:5000' }) => {
    const { t, language } = useLanguage();
    const [slidesData, setSlidesData] = useState([]);
    const [sideOffersData, setSideOffersData] = useState([]);
    const [weeklyOfferData, setWeeklyOfferData] = useState(null);
    const [discountsData, setDiscountsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [current, setCurrent] = useState(0);
    const [hovered, setHovered] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);

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
        if (slidesLength > 1 && !hovered) {
            const timer = setInterval(() => {
                setCurrent((prev) => (prev + 1) % slidesLength);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [slidesLength, hovered]);

    const formatCurrency = useCallback((amount, currencyCode = 'SAR') => {
        if (amount == null) return t('general.notApplicable');
        const options = { style: 'currency', currency: currencyCode, minimumFractionDigits: 2, maximumFractionDigits: 2 };
        return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', options).format(Number(amount));
    }, [language, t]);

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const currentSlideContent = slidesData[current];
    const hasContent = currentSlideContent || sideOffersData.length > 0 || weeklyOfferData || discountsData.length > 0;

    if (loading) return <section className="w-full min-h-[450px] flex items-center justify-center bg-gray-100 dark:bg-slate-800/50 animate-pulse rounded-xl"><Loader2 size={48} className="animate-spin text-indigo-500" /></section>;
    if (error) return <section className="w-full min-h-[450px] flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-xl p-4 text-center"><div className="flex items-center gap-3"><Sparkles size={28} /><span className="font-semibold text-lg">{error}</span></div></section>;
    if (!hasContent) return <section className="w-full min-h-[450px] flex items-center justify-center bg-blue-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-xl"><div className="flex flex-col items-center gap-4 text-center"><ShoppingCart size={48} className="text-blue-400" /><p className="font-semibold text-xl">{t('heroSection.noDataAvailable')}</p></div></section>;

    return (
        <section className="w-full py-12 px-4 bg-gray-50 dark:bg-slate-900 sm:py-16">
            <div className="mx-auto grid max-w-7xl h-full grid-cols-1 gap-8 lg:grid-cols-3">
                {currentSlideContent && (
                    <div className="relative col-span-1 lg:col-span-2 flex flex-col justify-between rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-8 md:p-12 shadow-2xl shadow-indigo-500/30 overflow-hidden group" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
                        <div className="absolute -bottom-16 -right-10 w-48 h-48 bg-white/10 rounded-full filter blur-2xl opacity-50"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1 md:order-1 text-center md:text-left">
                                <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">{currentSlideContent.title}</h1>
                                <p className="mt-4 text-lg text-indigo-200">{currentSlideContent.description}</p>
                                <div className="mt-6 flex items-baseline justify-center md:justify-start gap-3">
                                    {currentSlideContent.discountedPrice != null && <span className="text-4xl font-bold">{formatCurrency(currentSlideContent.discountedPrice, currentSlideContent.currency)}</span>}
                                    {currentSlideContent.originalPrice != null && <span className="text-xl line-through opacity-70">{formatCurrency(currentSlideContent.originalPrice, currentSlideContent.currency)}</span>}
                                </div>
                                <Link to={currentSlideContent.productRef?._id ? `/shop/${currentSlideContent.productRef._id}` : (currentSlideContent.link || '#')} className="inline-block mt-8">
                                    <button className="rounded-full bg-white px-8 py-3.5 text-lg font-bold text-indigo-600 shadow-lg hover:bg-gray-100 transition-transform transform hover:scale-105 flex items-center gap-2">
                                        {t('general.shopNow')} <ArrowRight size={20} />
                                    </button>
                                </Link>
                            </div>
                            <div className="md:order-2 mt-8 md:mt-0 flex-shrink-0">
                                <img src={`${serverUrl}${currentSlideContent.image}`} alt={currentSlideContent.title} className="w-48 h-48 md:w-64 md:h-64 object-contain group-hover:scale-110 transition-transform duration-500" />
                            </div>
                        </div>
                        {slidesLength > 1 && (
                            <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 flex gap-2">
                                {slidesData.map((_, index) => (
                                    <button key={index} onClick={() => setCurrent(index)} className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${current === index ? "bg-white w-8" : "bg-white/50"}`}></button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                <div className="col-span-1 flex flex-col gap-6">
                    {sideOffersData.slice(0, 1).map((offer) => (
                         <Link key={offer._id} to={offer.link || '#'} className="block">
                            <div className="group flex items-center gap-4 rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-slate-700">
                                <div className="flex-1">
                                    <h2 className="font-bold text-gray-800 dark:text-white group-hover:text-blue-500">{offer.title}</h2>
                                    <p className="mt-1 font-bold text-blue-500 dark:text-blue-400">{formatCurrency(offer.discountedPrice, offer.currency)}</p>
                                </div>
                                <img src={offer.image ? `${serverUrl}${offer.image}` : ''} alt={offer.title} className="w-20 h-20 object-contain transition-transform group-hover:scale-110" />
                            </div>
                        </Link>
                    ))}
                     {weeklyOfferData && (
                         <Link to={weeklyOfferData.link || '#'} className="block">
                            <div className="group flex items-center gap-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-amber-200 dark:border-amber-500/20">
                                <div className="flex-1">
                                    <h2 className="font-bold text-gray-800 dark:text-white group-hover:text-amber-600">{weeklyOfferData.title}</h2>
                                    <p className="mt-1 font-semibold text-amber-600 dark:text-amber-400">{weeklyOfferData.description}</p>
                                </div>
                                <img src={weeklyOfferData.image ? `${serverUrl}${weeklyOfferData.image}` : ''} alt={weeklyOfferData.title} className="w-20 h-20 object-contain transition-transform group-hover:scale-110" />
                            </div>
                        </Link>
                    )}
                    
                    {/* ✅✅✅ New "All Offers" Card Added Here ✅✅✅ */}
                    <AllOffersCard t={t} />

                    {discountsData.slice(0, 1).map((discount) => (
                        <div key={discount._id} className="relative flex items-center gap-4 rounded-2xl bg-white dark:bg-slate-800 p-5 shadow-md border border-gray-200 dark:border-slate-700 cursor-pointer group" onClick={() => handleCopyCode(discount.code)}>
                            {copiedCode === discount.code && (<div className="absolute inset-0 bg-green-500/90 flex items-center justify-center text-white text-xl font-bold rounded-2xl z-20">{t('homepage.copied')}</div>)}
                            <div className="flex-shrink-0 bg-green-100 dark:bg-green-500/10 p-3 rounded-full"><Tag size={24} className="text-green-600 dark:text-green-400" /></div>
                            <div className="flex-1"><h4 className="text-lg font-bold text-gray-900 dark:text-white">{discount.code}</h4><p className="text-sm text-green-600 dark:text-green-400 font-semibold">{discount.percentage ? `${discount.percentage}% OFF` : `${formatCurrency(discount.fixedAmount)} OFF`}</p></div>
                            <button className="ml-auto p-2 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 transition-transform group-hover:scale-110 group-hover:text-indigo-500"><Copy size={20} /></button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// New component for the "All Offers" card
const AllOffersCard = ({ t }) => (
    <Link to="/all-offers" className="block group">
        <div className="relative rounded-2xl p-6 bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className="absolute -right-2 -bottom-2 w-20 h-20 bg-white/10 rounded-full filter blur-lg"></div>
            <h3 className="text-xl font-bold">{t('heroSection.allOffersTitle')}</h3>
            <p className="text-sm opacity-80 mt-1">{t('heroSection.allOffersSubtitle')}</p>
            <div className="flex justify-end mt-4">
                <div className="p-2 bg-white/20 rounded-full group-hover:bg-white transition-colors duration-300">
                    <ArrowRight className="text-white group-hover:text-blue-500 transition-colors duration-300" size={20} />
                </div>
            </div>
        </div>
    </Link>
);

export default HeroSection;