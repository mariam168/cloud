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
      icon: <Truck className="w-8 h-8 text-blue-600" />,
      title: t.freeShipping,
      desc: t.freeShippingDesc,
    },
    {
      icon: <MessageCircleQuestion className="w-8 h-8 text-blue-600" />,
      title: t.support247,
      desc: t.support247Desc,
    },
    {
      icon: <CreditCard className="w-8 h-8 text-blue-600" />,
      title: t.onlinePayment,
      desc: t.onlinePaymentDesc,
    },
    {
      icon: <RotateCcw className="w-8 h-8 text-blue-600" />,
      title: t.easyReturn,
      desc: t.easyReturnDesc,
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
