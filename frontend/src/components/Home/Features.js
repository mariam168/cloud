import {
    Truck,
    MessageCircleQuestion,
    CreditCard,
    RotateCcw,
    Award, // أيقونة إضافية محتملة إذا أردت استبدال Truck أو إضافة ميزة أخرى
    ShieldCheck // أيقونة إضافية محتملة
} from "lucide-react";
import { useLanguage } from "../LanguageContext";

const Features = () => {
    const { t } = useLanguage();

    // تم تعديل الأيقونات لتكون جزءًا من العنصر مباشرة لتخصيص أفضل
    const features = [
        {
            icon: <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full shadow-inner group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors duration-300 ease-in-out transform group-hover:scale-105">
                      <Truck className="w-8 h-8 text-blue-700 dark:text-blue-300" />
                  </div>,
            title: t('features.freeShipping') || 'Free Shipping',
            desc: t('features.freeShippingDesc') || 'Free shipping on all orders over $100',
        },
        {
            icon: <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full shadow-inner group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors duration-300 ease-in-out transform group-hover:scale-105">
                      <MessageCircleQuestion className="w-8 h-8 text-green-700 dark:text-green-300" />
                  </div>,
            title: t('features.support247') || 'Support 24/7',
            desc: t('features.support247Desc') || 'Get help anytime you need it',
        },
        {
            icon: <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full shadow-inner group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors duration-300 ease-in-out transform group-hover:scale-105">
                      <CreditCard className="w-8 h-8 text-purple-700 dark:text-purple-300" />
                  </div>,
            title: t('features.onlinePayment') || 'Online Payment',
            desc: t('features.onlinePaymentDesc') || 'Secure online payment options',
        },
        {
            icon: <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full shadow-inner group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800 transition-colors duration-300 ease-in-out transform group-hover:scale-105">
                      <RotateCcw className="w-8 h-8 text-yellow-700 dark:text-yellow-300" />
                  </div>,
            title: t('features.easyReturn') || 'Easy Return',
            desc: t('features.easyReturnDesc') || 'Hassle-free returns within 30 days',
        },
    ];

    return (
        <div className="bg-white dark:bg-gray-900 py-12 sm:py-16 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300 ease-in-out">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        // تصميم البطاقة: خلفية بيضاء، ظلال أنيقة، حدود دقيقة، تأثير رفع
                        className="flex flex-col items-center text-center space-y-4 p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 ease-in-out group border border-gray-100 dark:border-gray-700"
                    >
                        {feature.icon} {/* الأيقونة مع الخلفية والتأثير */}
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 ease-in-out leading-tight">
                            {feature.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {feature.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Features;