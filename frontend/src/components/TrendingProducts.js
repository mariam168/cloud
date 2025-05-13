import React from "react";
import ProductCard from "./ProductCard"; 
import { useLanguage } from "../components/LanguageContext";

const products = [
  {
    id: 1,
    category: "Speaker",
    name: "Big Power Sound Speaker",
    price: 13200,
    image: "https://i.imgur.com/vkqJWaC.png",
  },
  {
    id: 2,
    category: "Laptop",
    name: "Apple MacBook Air",
    price: 43152,
    image: "https://i.imgur.com/92XZMok.png",
  },
  {
    id: 3,
    category: "Camera",
    name: "Wifi Security Camera",
    price: 19152,
    image: "https://i.imgur.com/BmEosDd.png",
  },
  {
    id: 4,
    category: "Watch",
    name: "Xiaomi Mi Band 5",
    price: 9552,
    image: "https://i.imgur.com/dZLxrU2.png",
  },
];

const TrendingProducts = () => {
  const { t } = useLanguage();

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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;
