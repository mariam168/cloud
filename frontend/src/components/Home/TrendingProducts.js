import React, { useEffect, useState } from "react";
import ProductCard from "../ProductCard";
import { useLanguage } from "../LanguageContext";

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
        setProducts(data);
      } catch (err) {
        console.error("Error fetching trending products:", err);
        setError(t.general?.errorFetchingProducts || "فشل تحميل المنتجات الأكثر رواجًا.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [t.general?.errorFetchingProducts]);


  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 ease-in-out">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white sm:text-4xl">
            {t.trendingProducts || "المنتجات الأكثر رواجًا"}
          </h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto mt-4 mb-6 rounded-full shadow-md" />
          <p className="text-base text-gray-600 dark:text-gray-300 sm:text-lg max-w-2xl mx-auto">
            {t.trendingDesc || "اكتشف منتجاتنا الأكثر شعبية هذا الأسبوع."}
          </p>
        </div>

        {loading && (
             <div className="flex justify-center items-center py-10">
                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="ml-3 text-gray-600 dark:text-gray-400 text-lg">{t.general?.loading || 'جاري التحميل...'}</p>
             </div>
        )}
        {error && (
            <div className="text-center text-red-600 dark:text-red-400 text-lg p-4 bg-red-100 dark:bg-red-900/20 rounded-md">
                {t.general?.error || 'خطأ'}: {error}
            </div>
        )}

        {!loading && !error && products.length === 0 && (
             <p className="text-center text-gray-600 dark:text-gray-400 text-lg">
                 {t.trendingProducts?.noProductsFound || 'لم يتم العثور على منتجات رائجة.'}
             </p>
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
