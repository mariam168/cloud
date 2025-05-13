import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "../components/LanguageContext"; 
import hero1 from "../Assets/hero1.png"; 

const images = [
  hero1,
  "https://i.imgur.com/4Z8VnYF.jpeg",

  "https://via.placeholder.com/600x400",
  "https://via.placeholder.com/600x400/abcdef", 
];

const HeroSection = () => {
  const { t } = useLanguage(); 
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);

  const imagesLength = images.length; 

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % imagesLength);
    }, 5000); 

    if (hovered) {
      clearInterval(timer);
    }

    return () => clearInterval(timer);
  }, [imagesLength, hovered]); 

  const nextSlide = () =>
    setCurrent((prev) => (prev + 1) % imagesLength);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + imagesLength) % imagesLength);

  return (
    <section className="w-full bg-gradient-to-br from-gray-50 to-white px-4 py-8 transition-colors duration-300 dark:from-gray-800 dark:to-gray-900 md:px-6 lg:px-8"> {/* Adjusted padding */}
      <div className="mx-auto grid max-w-screen-lg grid-cols-1 gap-6 md:grid-cols-3"> 
        <div className="col-span-2 flex flex-col items-center gap-6 rounded-xl bg-white p-6 shadow-lg transition-transform duration-300 hover:scale-[1.01] dark:bg-gray-800 md:flex-row"> {/* Adjusted gap, rounded, and shadow */}
          {/* Text Content */}
          <div className="flex-1 text-center md:text-left">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              {t.bigSale}
            </p>
            <h1 className="text-2xl font-extrabold leading-tight text-gray-900 dark:text-white md:text-3xl lg:text-4xl"> 
              {t.heroTitle}
            </h1>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 md:text-base"> 
              {t.heroDesc}
            </p>
            <p className="mt-4 text-lg font-bold text-gray-900 dark:text-white lg:text-xl"> 
              {t.comboOffer}:{" "}
              <span className="text-blue-700 dark:text-blue-400">
                EGP 28,320.00
              </span>
            </p>
            <button className="mt-6 rounded-md bg-blue-600 px-6 py-2 text-base font-semibold text-white shadow-md transition duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
              {t.shopNow}
            </button>
          </div>


          <div
            className="relative h-56 w-56 overflow-hidden rounded-lg bg-gray-100 shadow-inner dark:bg-gray-700 md:h-72 md:w-72 lg:h-80 lg:w-80" 
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div
              className="flex h-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`CCTV Slide ${index + 1}`}
                  className="h-full w-full flex-shrink-0 object-contain"
                />
              ))}
            </div>

           
            <div
              className={`absolute inset-0 flex items-center justify-between p-3 transition-opacity duration-300 ${ 
                hovered ? "opacity-100" : "opacity-0 md:group-focus-within:opacity-100"
              }`}
            >
              <button
                onClick={prevSlide} 
                aria-label="Previous Slide"
              >
                <ChevronLeft size={20} /> 
              </button>
              <button
                onClick={nextSlide}
                className="rounded-full bg-white/70 p-2 text-gray-800 shadow-lg transition duration-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" 
                aria-label="Next Slide"
              >
                <ChevronRight size={20} /> 
              </button>
            </div>

            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1"> 
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${ 
                    current === index ? "bg-blue-600 w-4" : "bg-white/50"
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">

          <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-lg transition-transform duration-300 hover:scale-[1.02] dark:bg-gray-800"> 
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-300">
                {t.installment}
              </p>
              <h2 className="mt-1 text-base font-bold text-gray-800 dark:text-white lg:text-lg">
                iPhone 12 Pro Max
              </h2>
              <p className="mt-1.5 text-lg font-bold text-blue-700 dark:text-blue-400">
                EGP 12,480.00
              </p>
            </div>
            <img
              src="https://i.imgur.com/yjP8iXx.png"
              alt="iPhone 12 Pro Max"
              className="w-16 object-contain md:w-20 lg:w-24" 
            />
          </div>

          <div className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 p-5 text-white shadow-lg transition-transform duration-300 hover:scale-[1.02] dark:from-blue-800 dark:to-blue-950">
            <h2 className="mb-2 text-lg font-bold lg:text-xl">{t.weeklySale}</h2> {/* Adjusted margin-bottom and font sizes */}
            <p className="mb-4 text-sm text-blue-100 dark:text-blue-200 lg:text-base"> {/* Adjusted margin-bottom and font sizes */}
              {t.weeklyDesc}{" "}
              <span className="font-extrabold text-yellow-300">
                50% {t.off}
              </span>{" "}
              {t.thisWeek}
            </p>
            <button className="rounded-md bg-white px-5 py-2 font-semibold text-blue-800 shadow-md transition duration-300 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"> {/* Adjusted padding, rounded, and font size */}
              {t.shopNow}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;