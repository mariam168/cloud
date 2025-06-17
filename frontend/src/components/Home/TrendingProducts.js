import React, { useEffect, useState } from "react";
import ProductCard from "../ProductCard";
import { useLanguage } from "../LanguageContext";
import { Loader2, TrendingUp, AlertCircle, Info } from "lucide-react"; // تم إضافة أيقونة Info

const TrendingProducts = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("http://localhost:5000/api/products"); 
        if (!response.ok) {
             const errorText = await response.text();
             throw new Error(`Failed to fetch products: ${response.status} ${errorText}`);
        }
        const data = await response.json();
        setProducts(data.slice(0, 8)); // عرض أول 8 منتجات كمثال للرائجة
      } catch (err) {
        console.error("Error fetching trending products:", err);
        setError(t('general.errorFetchingData') || "Failed to load trending products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [t]); 


  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 ease-in-out">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16"> {/* تم زيادة الـ margin-bottom */}
          <h2 className="text-4xl font-extrabold text-gray-800 dark:text-white sm:text-5xl flex items-center justify-center gap-4 group"> {/* تكبير العنوان وزيادة الـ gap وتأثير group */}
            <TrendingUp 
              size={48} // تكبير الأيقونة
              className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300 ease-out" // تأثير Hover للأيقونة
            /> 
            {t('homepage.trendingProductsTitle') || "Trending Products"}
          </h2>
          {/* خط فاصل أنيق بتدرج لوني وظل أعمق */}
          <div className="w-32 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto mt-5 mb-8 rounded-full shadow-lg" />
          <p className="text-lg text-gray-600 dark:text-gray-300 sm:text-xl max-w-3xl mx-auto leading-relaxed"> {/* تكبير حجم الخط وزيادة الـ max-width */}
            {t('homepage.trendingProductsDesc') || "Discover our most popular products this week. Handpicked for quality and trending popularity!"} 
          </p>
        </div>

        {loading && (
             <div className="flex flex-col justify-center items-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300"> {/* تحسين شكل مربع التحميل */}
                <Loader2 size={60} className="animate-spin text-blue-600 dark:text-blue-400 mb-6" /> {/* أيقونة أكبر */}
                <p className="text-gray-700 dark:text-gray-300 text-2xl font-semibold">{t('general.loading') || 'Loading...'}</p>
             </div>
        )}
        {error && (
            <div className="text-center text-red-700 dark:text-red-300 text-xl p-10 bg-red-50 dark:bg-red-900/30 rounded-2xl shadow-xl border border-red-200 dark:border-red-800 flex flex-col items-center justify-center gap-5 transition-all duration-300"> {/* تحسين شكل رسالة الخطأ */}
                <AlertCircle size={60} className="text-red-600 dark:text-red-400" /> 
                <p className="font-semibold">{t('general.error') || 'Error'}: {error}</p>
                <p className="text-base text-red-500 dark:text-red-400">Please try again later or contact support.</p>
            </div>
        )}

        {!loading && !error && products.length === 0 && (
             <div className="text-center text-gray-700 dark:text-gray-300 text-xl p-10 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-5 transition-all duration-300"> {/* تحسين شكل رسالة لا يوجد منتجات */}
                 <Info size={60} className="text-blue-500 dark:text-blue-400" /> {/* أيقونة Info جديدة */}
                 <p className="font-semibold">{t('homepage.noTrendingProductsFound') || 'No trending products found.'}</p>
                 <p className="text-base text-gray-500 dark:text-gray-400">Check back soon for exciting new additions!</p>
             </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard product={product} key={product._id} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingProducts;