import { useLanguage } from "../components/LanguageContext";
import about from '../Assets/about.jpg'; 

const AboutUs = () => {
    const { t } = useLanguage();

    return (
        // 1. تحديث خلفية الصفحة لتطابق صفحة الدفع (رمادي فاتح / أسود)
        <section className="w-full min-h-screen bg-gray-100 dark:bg-black py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
            {/* 2. تحديث تصميم البطاقة الرئيسية لتكون متناسقة */}
            <div className="container mx-auto max-w-screen-xl">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* قسم الصورة */}
                        <div className="relative h-80 md:h-auto">
                             <img
                                src={about}
                                alt={t('aboutUsPage.imageAlt')}
                                className="absolute inset-0 w-full h-full object-cover" 
                            />
                        </div>

                        {/* قسم النص */}
                        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                {t('aboutUsPage.title')}
                            </h2>
                            {/* 3. تحديث ألوان النصوص لتكون أكثر وضوحاً وتناسقاً */}
                            <p className="mt-6 text-base text-gray-600 dark:text-zinc-400 leading-relaxed">
                                {t('aboutUsPage.commitment')}
                            </p>
                            <p className="mt-4 text-base text-gray-600 dark:text-zinc-400 leading-relaxed">
                                {t('aboutUsPage.belief')}
                            </p>
                            <p className="mt-4 text-base text-gray-600 dark:text-zinc-400 leading-relaxed">
                                {t('aboutUsPage.explore')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;