import React, { useState, useEffect, useCallback } from "react";
import { Tag, Calendar, Percent, Copy, Search, Sparkles, Loader, ShoppingCart, Loader2 } from "lucide-react";
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
                const now = new Date();
                for (const key in sideOffersRes.data) {
                    const offer = sideOffersRes.data[key];
                    if (!offer) continue;
                    const isActive = offer.isActive === undefined || offer.isActive === true;
                    const startDate = offer.startDate ? new Date(offer.startDate) : new Date(0);
                    const endDate = offer.endDate ? new Date(offer.endDate) : new Date('9999-12-31T23:59:59');

                    if (isActive && now >= startDate && now <= endDate) {
                        activeSideOffers[key] = offer;
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
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    if (loading) {
        return (
            <section className="w-full min-h-[400px] flex items-center justify-center bg-gray-100 dark:bg-gray-900 animate-pulse rounded-xl">
                <Loader2 size={40} className="animate-spin text-blue-500" />
            </section>
        );
    }

    if (error) {
        return (
            <section className="w-full min-h-[400px] flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl">
                <div className="flex items-center gap-2">
                    <Sparkles size={24} /> {error}
                </div>
            </section>
        );
    }

    if (!hasContent) {
        return (
            <section className="w-full min-h-[400px] flex items-center justify-center bg-blue-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl">
                <div className="flex flex-col items-center gap-3">
                    <ShoppingCart size={40} className="text-blue-500" />
                    {t('heroSection.noDataAvailable')}
                </div>
            </section>
        );
    }

    return (
        <section className="w-full py-12 px-4 bg-gray-50 dark:bg-gray-900 sm:py-16 md:py-20 lg:py-24">
            <div className="mx-auto grid max-w-7xl h-full grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
                {currentSlideContent && (
                    <div
                        className="relative col-span-1 md:col-span-2 flex flex-col items-center justify-center gap-6 rounded-3xl bg-white p-10 shadow-xl dark:bg-gray-800 md:flex-row overflow-hidden border border-gray-100 dark:border-gray-700 group/main"
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                    >
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center flex-1 text-center md:text-left">
                            <div className="h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 lg:h-72 lg:w-72 flex items-center justify-center flex-shrink-0 order-1 md:order-2">
                                <img
                                    src={currentSlideContent.image ? `${serverUrl}${currentSlideContent.image}` : ''}
                                    alt={currentSlideContent.title}
                                    className="h-full w-full object-contain mx-auto group-hover/main:scale-105 transition-transform duration-500"
                                    onError={(e) => { e.target.src = '/images/placeholder-product-image.png'; }}
                                />
                            </div>
                            <div className="flex-1 ml-0 md:ml-8 mt-4 md:mt-0 p-4 md:p-6 lg:p-8 order-2 md:order-1">
                                <p className="mb-2 text-base font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                    {t('heroSection.bigSale')}
                                </p>
                                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
                                    {currentSlideContent.title}
                                </h1>
                                <p className="mt-3 text-base text-gray-600 dark:text-gray-300 md:text-lg">
                                    {currentSlideContent.description}
                                </p>
                                <p className="mt-4 text-2xl font-bold text-gray-800 dark:text-white lg:text-3xl flex items-baseline justify-center md:justify-start gap-2">
                                    {currentSlideContent.discountedPrice != null ? (
                                        <>
                                            <span className="text-blue-600 dark:text-blue-400">
                                                {formatCurrency(currentSlideContent.discountedPrice, currentSlideContent.currency)}
                                            </span>
                                            {currentSlideContent.originalPrice != null && (
                                                <span className="text-gray-500 dark:text-gray-400 text-base md:text-lg line-through">
                                                    {formatCurrency(currentSlideContent.originalPrice, currentSlideContent.currency)}
                                                </span>
                                            )}
                                        </>
                                    ) : currentSlideContent.originalPrice != null ? (
                                        <span className="text-blue-600 dark:text-blue-400">
                                            {t('heroSection.price')}: {formatCurrency(currentSlideContent.originalPrice, currentSlideContent.currency)}
                                        </span>
                                    ) : (
                                        <span className="text-gray-500 dark:text-gray-400">{t('general.priceNotAvailable')}</span>
                                    )}
                                </p>
                                {(currentSlideContent.startDate || currentSlideContent.endDate) && (
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center md:justify-start gap-2">
                                        <Calendar size={16} />
                                        {t('heroSection.validUntil')}: {formatDate(currentSlideContent.endDate)}
                                    </p>
                                )}
                                <Link
                                    to={currentSlideContent.productRef ? `/shop/${currentSlideContent.productRef._id || currentSlideContent.productRef}` : (currentSlideContent.link || '#')}
                                    className="inline-block mt-6"
                                >
                                    <button className="rounded-full bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105">
                                        {t('general.shopNow')}
                                    </button>
                                </Link>
                            </div>
                        </div>
                        {slidesLength > 1 && (
                            <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 flex justify-center gap-2">
                                {slidesData.map((_, index) => (
                                    <button key={index} onClick={() => setCurrent(index)} className={`h-3 w-3 rounded-full transition-all ${current === index ? "bg-blue-600 w-8" : "bg-gray-300"}`}></button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                <div className="col-span-1 flex flex-col gap-6">
                    {Object.values(sideOffersData).map((offer, index) => offer && (
                         <a key={index} href={offer.link || '#'} className="block">
                            <div className="flex items-center gap-4 rounded-3xl bg-white p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all dark:bg-gray-800 group/side">
                                <div className="flex-1">
                                    <h2 className="text-base font-bold text-gray-800 dark:text-white lg:text-lg group-hover/side:text-blue-600">{offer.title}</h2>
                                    <p className="mt-1 text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(offer.discountedPrice, offer.currency)}</p>
                                </div>
                                <img src={offer.image ? `${serverUrl}${offer.image}` : ''} alt={offer.title} className="w-24 h-24 object-contain" />
                            </div>
                        </a>
                    ))}
                    <Link to="/all-offers" className="block mt-4">
                        <div className="flex items-center gap-4 rounded-3xl bg-blue-500 p-6 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all text-center">
                            <div className="flex-1"><h3 className="text-xl font-bold">{t('heroSection.allOffersTitle')}</h3></div>
                            <Search size={32} />
                        </div>
                    </Link>
                    {discountsData.map((discount) => (
                        <div key={discount._id} className="relative flex items-center gap-4 rounded-2xl bg-white p-5 shadow-lg dark:bg-gray-800 cursor-pointer" onClick={() => handleCopyCode(discount.code)}>
                            {copiedCode === discount.code && (<div className="absolute inset-0 bg-green-500/80 flex items-center justify-center text-white text-2xl font-bold animate-fade-in z-20">{t('homepage.copied')}</div>)}
                            <div className="flex-shrink-0 bg-green-100 p-3 rounded-full"><Tag size={24} className="text-green-700" /></div>
                            <div className="flex-1"><h4 className="text-xl font-bold text-gray-900 dark:text-white">{discount.code}</h4><p className="text-sm text-green-600">{discount.percentage ? `${discount.percentage}% OFF` : `${formatCurrency(discount.fixedAmount)} OFF`}</p></div>
                            <button className="ml-auto p-2 rounded-full bg-blue-500 text-white"><Copy size={20} /></button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HeroSection;