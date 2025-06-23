import React, { useEffect, useState, useCallback } from "react";
import ProductCard from "../ProductCard";
import { useLanguage } from "../LanguageContext";
import { Loader2, TrendingUp, AlertCircle, Info } from "lucide-react";
import axios from 'axios'; // سنستخدم axios للاتساق

const TrendingProducts = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // جلب المنتجات والإعلانات في نفس الوقت
        const productsPromise = axios.get(`${API_BASE_URL}/api/products`);
        const advertisementsPromise = axios.get(`${API_BASE_URL}/api/advertisements?isActive=true`);

        const [productsRes, advertisementsRes] = await Promise.all([
          productsPromise,
          advertisementsPromise
        ]);

        const allProducts = productsRes.data;
        const allAdvertisements = advertisementsRes.data;

        // ربط كل منتج بالإعلان الخاص به
        let enrichedProducts = allProducts.map(product => {
          const associatedAd = allAdvertisements.find(ad => (ad.productRef?._id || ad.productRef) === product._id);
          return {
            ...product,
            advertisement: associatedAd || null
          };
        });

        // ترتيب المنتجات: العروض أولاً، ثم حسب تاريخ الإنشاء (الأحدث أولاً)
        enrichedProducts.sort((a, b) => {
            const isAAdvertised = !!a.advertisement;
            const isBAdvertised = !!b.advertisement;

            if (isAAdvertised && !isBAdvertised) return -1;
            if (!isAAdvertised && isBAdvertised) return 1;
            
            // الفرز حسب تاريخ الإنشاء كعامل ثانوي
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        setProducts(enrichedProducts.slice(0, 8)); // عرض أول 8 منتجات رائجة/عليها عروض
      } catch (err) {
        console.error("Error fetching trending products:", err);
        setError(t('general.errorFetchingData'));
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingData();
  }, [t, API_BASE_URL]); 

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 ease-in-out">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-800 dark:text-white sm:text-5xl flex items-center justify-center gap-4 group">
            <TrendingUp 
              size={48}
              className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300 ease-out"
            /> 
            {t('homepage.trendingProductsTitle')}
          </h2>
          <div className="w-32 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto mt-5 mb-8 rounded-full shadow-lg" />
          <p className="text-lg text-gray-600 dark:text-gray-300 sm:text-xl max-w-3xl mx-auto leading-relaxed">
            {t('homepage.trendingProductsDesc')} 
          </p>
        </div>

        {loading && (
             <div className="flex flex-col justify-center items-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                <Loader2 size={60} className="animate-spin text-blue-600 dark:text-blue-400 mb-6" />
                <p className="text-gray-700 dark:text-gray-300 text-2xl font-semibold">{t('general.loading')}</p>
             </div>
        )}
        {error && (
            <div className="text-center text-red-700 dark:text-red-300 text-xl p-10 bg-red-50 dark:bg-red-900/30 rounded-2xl shadow-xl border border-red-200 dark:border-red-800 flex flex-col items-center justify-center gap-5">
                <AlertCircle size={60} className="text-red-600 dark:text-red-400" /> 
                <p className="font-semibold">{t('general.error')}: {error}</p>
            </div>
        )}

        {!loading && !error && products.length === 0 && (
             <div className="text-center text-gray-700 dark:text-gray-300 text-xl p-10 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-5">
                 <Info size={60} className="text-blue-500 dark:text-blue-400" />
                 <p className="font-semibold">{t('homepage.noTrendingProductsFound')}</p>
             </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                advertisement={product.advertisement} // تمرير بيانات الإعلان
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingProducts;