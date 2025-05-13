import React from 'react';
import { useLanguage } from '../LanguageContext';
import { ShoppingCart, Heart, Search, Phone, Store } from 'lucide-react';

const MainHeader = () => {
  const { t } = useLanguage();

  return (
    <div className="border-b bg-white px-6 py-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-2 text-xl font-bold text-blue-600">
          <Store className="h-6 w-6" />
          <span>TechXpress</span>
        </div>
        <div className="flex max-w-xl flex-grow items-center overflow-hidden rounded border shadow-sm dark:border-gray-600">
          <select className="border-r p-2 text-sm dark:border-gray-600 dark:bg-gray-800">
            <option>All</option>
          </select>
          <input
            type="text"
            className="flex-grow p-2 outline-none dark:bg-gray-800 dark:text-white"
            placeholder={t.searchPlaceholder}
          />
          <button className="bg-blue-600 px-4 py-2 text-white">
            <Search size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <Phone className="h-4 w-4" />
          <div>
            <div className="text-gray-500 dark:text-gray-400">{t.hotline}</div>
            <div>(+100) 123 456 7890</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Heart className="h-5 w-5 text-gray-800 dark:text-white" />
            <span className="absolute -right-2 -top-2 rounded-full bg-red-600 px-1 text-xs text-white">
              0 
            </span>
          </div>
          <div className="relative">
            <ShoppingCart className="h-5 w-5 text-gray-800 dark:text-white" />
            <span className="absolute -right-2 -top-2 rounded-full bg-blue-600 px-1 text-xs text-white">
              0 
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainHeader;