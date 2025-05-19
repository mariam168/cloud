import {
    Truck,
    MessageCircleQuestion,
    CreditCard,
    RotateCcw,
} from "lucide-react";
import { useLanguage } from "../LanguageContext";

const Features = () => {
    const { t } = useLanguage();
    const features = [
        {
            icon: <Truck className="w-10 h-10 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300 ease-in-out" />,
            title: t('features.freeShipping') || 'Free Shipping',
            desc: t('features.freeShippingDesc') || 'Free shipping on all orders over $100',
        },
        {
            icon: <MessageCircleQuestion className="w-10 h-10 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300 ease-in-out" />,
            title: t('features.support247') || 'Support 24/7',
            desc: t('features.support247Desc') || 'Get help anytime you need it',
        },
        {
            icon: <CreditCard className="w-10 h-10 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300 ease-in-out" />,
            title: t('features.onlinePayment') || 'Online Payment',
            desc: t('features.onlinePaymentDesc') || 'Secure online payment options',
        },
        {
            icon: <RotateCcw className="w-10 h-10 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300 ease-in-out" />,
            title: t('features.easyReturn') || 'Easy Return',
            desc: t('features.easyReturnDesc') || 'Hassle-free returns within 30 days',
        },
    ];

    return (
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-12 sm:py-16 transition-colors duration-300 ease-in-out">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg bg-gray-100 dark:bg-gray-800 shadow-md hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 ease-in-out group"
                    >
                        {feature.icon}
                        <h3 className="font-semibold text-base text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 ease-in-out">
                            {feature.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {feature.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Features;
