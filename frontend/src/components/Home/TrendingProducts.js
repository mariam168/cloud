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
      const response = await fetch("http://localhost:5000/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
}, []);


  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {t.trendingProducts}
          </h2>
          <div className="w-16 h-1 bg-blue-600 mx-auto my-2 rounded-full" />
          <p className="text-sm text-gray-500 dark:text-gray-300">
            {t.trendingDesc}
          </p>
        </div>

        {loading && <p className="text-center text-gray-600 dark:text-gray-400">Loading...</p>}
        {error && <p className="text-center text-red-600 dark:text-red-400">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard product={product} key={product._id || product.id} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingProducts;
