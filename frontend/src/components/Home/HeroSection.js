import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "../LanguageContext"; 
const HeroSection = () => {
    const { t } = useLanguage();
    const slides = t.heroSlidesData || [];
    const sideOffers = t.heroSideOffers || {};
    const [current, setCurrent] = useState(0);
    const [hovered, setHovered] = useState(false); 
    const slidesLength = slides.length;
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
    const currentSlideData = slidesLength > 0 ? slides[current] : null;
    if (!currentSlideData && Object.keys(sideOffers).length === 0) { 
        return (
             <section className="w-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 h-[50vh] flex items-center justify-center dark:from-slate-800 dark:via-slate-900 dark:to-black">
              
                 <div className="text-gray-700 dark:text-gray-300">{t.general?.loading || 'جاري التحميل...'}</div>
             </section>
        );
    }
    return (
        <section className="w-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 h-auto py-8 px-4 transition-colors duration-300 dark:from-slate-800 dark:via-slate-900 dark:to-black sm:h-[75vh] md:h-[80vh] lg:h-[90vh]">
            <div className="mx-auto grid max-w-7xl h-full grid-cols-1 gap-6 md:grid-cols-3">
                {currentSlideData && (
                     <div
                        className="relative col-span-1 md:col-span-2 flex flex-col items-center gap-6 rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800 md:flex-row overflow-hidden"
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)} 
                    >
                     
                        {slidesLength > 1 && (
                             <div
                                className={`absolute inset-0 z-10 flex items-center justify-between px-2 sm:px-4 transition-opacity duration-300 ${
                                    hovered ? "opacity-100" : "opacity-0 md:opacity-100"
                                }`}
                            >
                                <button
                                    onClick={prevSlide}
                                    className="rounded-full  bg-white/80 p-2 text-indigo-600 shadow-lg hover:bg-white hover:text-indigo-700 hover:shadow-xl dark:bg-slate-700/80 dark:text-indigo-300 dark:hover:bg-slate-600/80 transition-colors"
                                    aria-label="Previous Slide"
                                >
                                    <ChevronLeft size={28} />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="rounded-full bg-white/80 p-2 text-indigo-600 shadow-lg hover:bg-white hover:text-indigo-700 hover:shadow-xl dark:bg-slate-700/80 dark:text-indigo-300 dark:hover:bg-slate-600/80 transition-colors"
                                    aria-label="Next Slide"
                                >
                                    <ChevronRight size={28} /> 
                                </button>
                            </div>
                        )}
                        <div key={current} className="flex flex-col md:flex-row items-center justify-center flex-1 text-center md:text-left transition-all duration-700 ease-out animate-fade-slide-in p-4 md:p-0">
                            <div className="h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 lg:h-80 lg:w-80 transition-all duration-700 ease-in-out flex items-center justify-center p-4 md:p-0 order-1 md:order-2"> 
                                <img
                                    key={current + "-img"}
                                    src={currentSlideData.image} 
                                    alt={currentSlideData.title} 
                                    className="h-full w-full object-contain mx-auto animate-fadeIn" 
                                    role="img" 
                                />
                            </div>
                             <div className="flex-1 ml-4 p-4 md:p-6 lg:p-8 order-2 md:order-1"> 
                                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                                    {t.heroSection?.bigSale || "تخفيضات كبرى"}
                                </p>
                                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-teal-300 md:text-4xl lg:text-5xl text-balance">
                                    {currentSlideData.title}
                                </h1>
                                <p className="mt-3 text-base text-gray-600 dark:text-gray-300 md:text-lg leading-relaxed">
                                    {currentSlideData.desc} 
                                </p>
                                <p className="mt-4 text-xl font-bold text-neutral-800 dark:text-white lg:text-2xl">
                                    {t.heroSection?.comboOffer || "عرض الباقة"}:{" "}
                                    <span className="text-indigo-700 dark:text-indigo-400">{currentSlideData.price}</span> 
                                </p>                          
                                <button className="mt-6 rounded-lg bg-blue-900 px-8 py-3 text-base font-semibold text-white shadow-md hover:bg-teal-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50">
                                    
                                    {t.general?.shopNow || "تسوق الآن"}
                                </button>
                            </div>
                        </div>
                        {slidesLength > 1 && (
                            <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 transform flex justify-center gap-2">
                                {slides.map((_, index) => (
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
                {Object.keys(sideOffers).length > 0 && (
                    <div className="col-span-1 flex flex-col gap-6">
                        {sideOffers.iphoneOffer && (
                            <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-xl hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 dark:bg-slate-800">
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {t.heroSection?.installment || "متوفر بالتقسيط"}
                                    </p>
                                    
                                    <h2 className="mt-1 text-base font-bold text-gray-700 dark:text-teal-300 lg:text-lg">
                                        {sideOffers.iphoneOffer.productName} 
                                    </h2>
                                    <p className="mt-1.5 text-lg font-bold text-indigo-700 dark:text-indigo-400">
                                        {sideOffers.iphoneOffer.price} 
                                    </p>
               
                                </div>
                              
                                <img
                                    src={sideOffers.iphoneOffer.image}
                                    alt={sideOffers.iphoneOffer.productName || 'Side Offer Image'} 
                                    className="w-16 object-contain md:w-20 lg:w-24"
                                />
                            </div>
                        )}

              
                        <div className="rounded-xl bg-gradient-to-r from-black to-gray-900 p-6 text-white shadow-xl hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 dark:from-indigo-800 dark:to-indigo-600">
                            <h2 className="mb-2 text-lg font-bold lg:text-xl">
                                {t.heroSection?.weeklySale || "عروض الأسبوع"}
                            </h2>
                            <p className="mb-4 text-sm text-indigo-100 dark:text-indigo-200 lg:text-base">                     
                                {t.heroSection?.weeklyDesc || "لا تفوت عروضنا الأسبوعية المذهلة! خصم يصل إلى"}{" "}
                                <span className="font-extrabold text-yellow-300">50% {t.heroSection?.off || "خصم"}</span>{" "}
                                {t.heroSection?.thisWeek || "هذا الأسبوع."}
                            </p>
                            <button className="rounded-md bg-white px-6 py-2.5 font-semibold text-indigo-800 shadow-md hover:bg-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75">
                                {t.general?.shopNow || "تسوق الآن"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default HeroSection;
