import { useLanguage } from "../components/LanguageContext";
import about from '../Assets/about.jpg'; // Assuming this image is clean and high-quality

const AboutUs = () => {
    const { t } = useLanguage();

    return (
        <section className="w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-20 px-4 md:px-8 lg:px-12 transition-colors duration-300">
            <div className="mx-auto max-w-screen-xl bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12 lg:p-16 border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20"> {/* Increased gap for more whitespace */}
                    {/* Image Column - Order changed for desktop (image first) */}
                    <div className="w-full md:w-1/2 order-2 md:order-1"> {/* Order change for responsive layout */}
                        <img
                            src={about}
                            alt={t('aboutUsPage.imageAlt')}
                            className="rounded-2xl shadow-lg w-full h-64 md:h-80 lg:h-96 object-cover object-center transform transition-transform duration-300 ease-in-out hover:scale-102 border-4 border-white dark:border-gray-700" /* Subtle border and hover */
                        />
                    </div>

                    {/* Text Column - Order changed for desktop (text second) */}
                    <div className="w-full md:w-1/2 flex flex-col justify-center order-1 md:order-2"> {/* Order change for responsive layout */}
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                            {t('aboutUsPage.title')}
                        </h2>
                        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4"> {/* Increased font size, added bottom margin */}
                            {t('aboutUsPage.commitment')}
                        </p>
                        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4"> {/* Increased font size, added bottom margin */}
                            {t('aboutUsPage.belief')}
                        </p>
                        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 leading-relaxed"> {/* Increased font size */}
                            {t('aboutUsPage.explore')}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;