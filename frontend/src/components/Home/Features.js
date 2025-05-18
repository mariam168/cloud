import {
    Truck,
    MessageCircleQuestion,
    CreditCard,
    RotateCcw,
} from "lucide-react";
import { useLanguage } from "../LanguageContext"; // Make sure the path is correct

const Features = () => {
    const { t } = useLanguage(); // Use the language hook

    // Use translations for feature titles and descriptions
    const features = [
        {
            icon: <Truck className="w-8 h-8 text-blue-600" />,
            title: t.features?.freeShipping || 'Free Shipping', // Access translations via t.features
            desc: t.features?.freeShippingDesc || 'Free shipping on all orders over $100', // Access translations via t.features
        },
        {
            icon: <MessageCircleQuestion className="w-8 h-8 text-blue-600" />,
            title: t.features?.support247 || 'Support 24/7', // Access translations via t.features
            desc: t.features?.support247Desc || 'Get help anytime you need it', // Access translations via t.features
        },
        {
            icon: <CreditCard className="w-8 h-8 text-blue-600" />,
            title: t.features?.onlinePayment || 'Online Payment', // Access translations via t.features
            desc: t.features?.onlinePaymentDesc || 'Secure online payment options', // Access translations via t.features
        },
        {
            icon: <RotateCcw className="w-8 h-8 text-blue-600" />,
            title: t.features?.easyReturn || 'Easy Return', // Access translations via t.features
            desc: t.features?.easyReturnDesc || 'Hassle-free returns within 30 days', // Access translations via t.features
        },
    ];

    return (
        <div className="bg-white dark:bg-gray-900 border-t dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="flex flex-col items-center text-center space-y-2"
                    >
                        {feature.icon}
                        <h3 className="font-medium text-sm text-gray-800 dark:text-white">
                            {feature.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                            {feature.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Features;
