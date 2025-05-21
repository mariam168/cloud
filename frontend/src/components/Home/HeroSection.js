import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Tag, Calendar, Percent, Copy } from "lucide-react"; 
import { useLanguage } from "../../components/LanguageContext";
import axios from 'axios';

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
        return () => {}; 
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
    const formatCurrency = (amount) => {
        return `${t('shopPage.currencySymbol') || '$'}${amount?.toFixed(2)}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', options);
    };
    const hasContent = currentSlideContent || Object.keys(sideOffersData).length > 0 || discountsData.length > 0;
    if (loading) {
        return (
            <section className="w-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 h-[50vh] flex items-center justify-center dark:from-slate-800 dark:via-slate-900 dark:to-black">
                <div className="text-gray-700 dark:text-gray-300 text-lg font-semibold">{t('general.loading') || 'Loading...'}</div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="w-full bg-gradient-to-br from-red-100 via-red-200 to-red-300 h-[50vh] flex items-center justify-center dark:from-red-900/20 dark:via-red-900/50 dark:to-red-900/70">
                <div className="text-red-700 dark:text-red-300 text-lg font-semibold">{t('general.error') || 'Error'}: {error}</div>
            </section>
        );
    }

    if (!hasContent) {
        return (
            <section className="w-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 h-[50vh] flex items-center justify-center dark:from-slate-800 dark:via-slate-900 dark:to-black">
                <div className="text-gray-700 dark:text-gray-300 text-lg font-semibold">{t('heroSection.noDataAvailable') || 'No hero section data available.'}</div>
            </section>
        );
    }

    return (
        <section className="w-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 h-auto py-12 px-4 transition-colors duration-500 ease-in-out dark:from-slate-800 dark:via-slate-900 dark:to-black sm:py-16 md:py-20 lg:py-24 overflow-hidden">
            <div className="mx-auto grid max-w-7xl h-full grid-cols-1 gap-8 md:grid-cols-3">
                {currentSlideContent && (
                    <div
                        className="relative col-span-1 md:col-span-2 flex flex-col items-center gap-6 rounded-3xl bg-white p-8 shadow-3xl dark:bg-slate-800 md:flex-row overflow-hidden border border-gray-200 dark:border-slate-700 transform transition-transform duration-500 ease-in-out hover:scale-[1.01]"
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                    >
                        {slidesLength > 1 && (
                            <div
                                className={`absolute inset-0 z-10 flex items-center justify-between px-4 transition-opacity duration-300 ${
                                    hovered ? "opacity-100" : "opacity-0 md:opacity-100"
                                }`}
                            >
                                <button
                                    onClick={prevSlide}
                                    className="rounded-full bg-white/70 p-3 text-indigo-600 shadow-lg hover:bg-white hover:text-indigo-700 hover:shadow-xl dark:bg-slate-700/70 dark:text-indigo-300 dark:hover:bg-slate-600/70 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                                    aria-label="Previous Slide"
                                >
                                    <ChevronLeft size={32} />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="rounded-full bg-white/70 p-3 text-indigo-600 shadow-lg hover:bg-white hover:text-indigo-700 hover:shadow-xl dark:bg-slate-700/70 dark:text-indigo-300 dark:hover:bg-slate-600/70 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                                    aria-label="Next Slide"
                                >
                                    <ChevronRight size={32} />
                                </button>
                            </div>
                        )}
                        <div className="flex flex-col md:flex-row items-center justify-center flex-1 text-center md:text-left transition-all duration-700 ease-out p-4 md:p-0">
                            <div className="h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 lg:h-80 lg:w-80 transition-all duration-700 ease-in-out flex items-center justify-center p-4 md:p-0 order-1 md:order-2 flex-shrink-0">
                                <img
                                    src={currentSlideContent.image ? `${serverUrl}${currentSlideContent.image}` : 'https://placehold.co/320x320?text=No+Image'}
                                    alt={currentSlideContent.title?.[language] || currentSlideContent.title?.en || t('general.unnamedItem')}
                                    className="h-full w-full object-contain mx-auto drop-shadow-xl"
                                    role="img"
                                />
                            </div>
                            <div className="flex-1 ml-0 md:ml-8 p-4 md:p-6 lg:p-8 order-2 md:order-1">
                                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                                    {t('heroSection.bigSale') || "Big Sale"}
                                </p>
                                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-teal-300 md:text-4xl lg:text-5xl text-balance leading-tight">
                                    {currentSlideContent.title?.[language] || currentSlideContent.title?.en || t('general.unnamedItem')}
                                </h1 >
                                <p className="mt-3 text-base text-gray-600 dark:text-gray-300 md:text-lg leading-relaxed">
                                    {currentSlideContent.description?.[language] || currentSlideContent.description?.en || t('advertisementAdmin.noDescription')}
                                </p>
                                <p className="mt-4 text-xl font-bold text-neutral-800 dark:text-white lg:text-2xl">
                                    {t('heroSection.comboOffer') || "Combo Offer"}:{" "}
                                    <span className="text-indigo-700 dark:text-indigo-400">{currentSlideContent.price || 'N/A'}</span>
                                </p>
                                <a href={currentSlideContent.link} className="inline-block">
                                    <button className="mt-6 rounded-lg bg-blue-900 px-8 py-3 text-base font-semibold text-white shadow-md hover:bg-teal-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50">
                                        {t('general.shopNow') || "Shop Now"}
                                    </button>
                                </a>
                            </div>
                        </div>
                        {slidesLength > 1 && (
                            <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 transform flex justify-center gap-2">
                                {slidesData.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrent(index)}
                                        aria-label={`Go to slide ${index + 1}`}
                                        className={`h-2 w-2 rounded-full transition-all duration-300 ease-out
                                            ${current === index ? "bg-indigo-600 w-6 shadow-md dark:bg-indigo-400" : "bg-gray-300 dark:bg-gray-600/70 hover:bg-gray-400/70 dark:hover:bg-gray-500/70"}
                                        `}
                                    ></button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                <div className="col-span-1 flex flex-col gap-8">
                    {sideOffersData.iphoneOffer && (
                        <a href={sideOffersData.iphoneOffer.link} className="block">
                            <div className="flex items-center gap-4 rounded-xl bg-white p-6 shadow-xl hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 cursor-pointer">
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {t('heroSection.installment') || "Available in Installments"}
                                    </p>
                                    <h2 className="mt-1 text-base font-bold text-gray-700 dark:text-teal-300 lg:text-lg">
                                        {sideOffersData.iphoneOffer.productName?.[language] || sideOffersData.iphoneOffer.productName?.en || t('general.unnamedItem')}
                                    </h2>
                                    <p className="mt-1.5 text-lg font-bold text-indigo-700 dark:text-indigo-400">
                                        {sideOffersData.iphoneOffer.price || 'N/A'}
                                    </p>
                                </div>
                                <img
                                    src={sideOffersData.iphoneOffer.image ? `${serverUrl}${sideOffersData.iphoneOffer.image}` : 'https://placehold.co/80x80?text=No+Image'}
                                    alt={sideOffersData.iphoneOffer.productName?.[language] || sideOffersData.iphoneOffer.productName?.en || t('general.unnamedItem')}
                                    className="w-20 object-contain md:w-24 lg:w-28 flex-shrink-0 drop-shadow-md"
                                />
                            </div>
                        </a>
                    )}
                    {sideOffersData.weeklyOffer && (
                        <a href={sideOffersData.weeklyOffer.link} className="block">
                            <div className="rounded-xl bg-gradient-to-br from-black to-gray-900 p-6 text-white shadow-xl hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 dark:from-indigo-800 dark:to-indigo-600 border border-indigo-700 dark:border-indigo-500 cursor-pointer">
                                <h2 className="mb-2 text-lg font-bold lg:text-xl">
                                    {sideOffersData.weeklyOffer.title?.[language] || sideOffersData.weeklyOffer.title?.en || t('heroSection.weeklySale') || "Weekly Offers"}
                                </h2>
                                <p className="mb-4 text-sm text-indigo-100 dark:text-indigo-200 lg:text-base leading-relaxed">
                                    {sideOffersData.weeklyOffer.description?.[language] || sideOffersData.weeklyOffer.description?.en || (t('heroSection.weeklyDesc') || "Don't miss our amazing weekly offers! Get up to")}{" "}
                                    <span className="font-extrabold text-yellow-300">50% {t('heroSection.off') || "OFF"}</span>{" "}
                                    {t('heroSection.thisWeek') || "this week."}
                                </p>
                                <button className="rounded-md bg-white px-6 py-2.5 font-semibold text-indigo-800 shadow-md hover:bg-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75">
                                    {t('general.shopNow') || "Shop Now"}
                                </button>
                            </div>
                        </a>
                    )}
                    {discountsData.length > 0 && (
                        <>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mt-4 mb-2">
                                {t('homepage.discountsTitle') || 'Active Discounts'}
                            </h3>
                            {discountsData.map((discount) => (
                                <div
                                    key={discount._id}
                                    className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-teal-50 to-blue-50 p-4 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer"
                                    onClick={() => handleCopyCode(discount.code)} 
                                >
                                    <div className="flex-shrink-0 bg-teal-100 dark:bg-teal-900/30 rounded-full p-3">
                                        <Tag size={20} className="text-teal-600 dark:text-teal-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                            {t('homepage.discountCode') || 'Discount Code'}
                                        </p>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                            {discount.code}
                                        </h4>
                                        <p className="text-sm text-indigo-700 dark:text-indigo-400">
                                            {discount.percentage ? (
                                                <span className="flex items-center gap-1">
                                                    <Percent size={14} /> {discount.percentage}% {t('homepage.off') || 'OFF'}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    {formatCurrency(discount.fixedAmount)} {t('homepage.off') || 'OFF'}
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                            <Calendar size={12} /> {t('homepage.validUntil') || 'Valid until'}: {formatDate(discount.endDate)}
                                        </p>
                                    </div>
                                    <button
                                        className="ml-auto p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        aria-label={t('homepage.copyCode') || 'Copy Code'}
                                        onClick={(e) => { e.stopPropagation(); handleCopyCode(discount.code); }} // Stop propagation to prevent card click
                                    >
                                        {copiedCode === discount.code ? (
                                            <span className="text-sm">{t('homepage.copied') || 'Copied!'}</span>
                                        ) : (
                                            <Copy size={18} />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default HeroSection;