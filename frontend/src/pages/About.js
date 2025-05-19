import { useLanguage } from "../components/LanguageContext";
import about from '../Assets/about.jpg'

const AboutUs = () => {
    const { t } = useLanguage();
    return (
        <section className="w-full bg-white dark:bg-gray-900 py-12 px-4 md:px-8 lg:px-12 transition-colors duration-300">
            <div className="mx-auto max-w-screen-xl">
                <div className="flex flex-col-reverse md:flex-row items-center gap-8">
                    <div className="w-full md:w-1/2 flex flex-col justify-center">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                            {t.aboutUsPage?.title || 'TechXpress - Your Go-To Electronics Store'}
                        </h2>
                        <p className="mt-4 text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed drop-shadow-sm">
                            {t.aboutUsPage?.commitment || 'At TechXpress, we are committed to bringing you the latest and greatest in electronics. Whether you’re looking for cutting-edge smartphones, high-performance laptops, or premium accessories, we offer a wide selection of top-quality products at unbeatable prices.'}
                        </p>
                        <p className="mt-4 text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed drop-shadow-sm">
                            {t.aboutUsPage?.belief || 'We believe in providing an exceptional shopping experience by ensuring fast delivery, secure payment options, and outstanding customer service. Our goal is to make tech shopping simple, reliable, and enjoyable for everyone.'}
                        </p>
                        <p className="mt-4 text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed drop-shadow-sm">
                            {t.aboutUsPage?.explore || 'Explore our collection and stay ahead with the latest technology trends. Your satisfaction is our priority!'}
                        </p>
                    </div>
                    <div className="w-full md:w-1/2">
                        <img
                            src={about}
                            alt={t.aboutUsPage?.imageAlt || "Handshake representing partnership and trust"}
                            className="rounded-lg shadow-2xl w-full h-64 md:h-auto object-cover transform transition-transform duration-300 hover:scale-102"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;