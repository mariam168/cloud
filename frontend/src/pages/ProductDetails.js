import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from "../components/LanguageContext"; 
import { Heart } from "lucide-react"; 
const dummyProducts = [
    { id: 1, image: 'https://via.placeholder.com/400x400?text=Watch', category: 'Watch', name: 'Xiaomi Mi Band 5', brand: 'Xiaomi', rating: 5, reviews: 50, price: 9552.00, description: 'A smart band with various fitness tracking features.', specifications: [{ key: 'Display', value: '1.1 inch AMOLED' }, { key: 'Battery', value: '14 days' }, { key: 'Water Resistance', value: '50m' }] },
    { id: 2, image: 'https://via.placeholder.com/400x400?text=Speaker', category: 'Speaker', name: 'Big Power Sound Speaker', brand: 'Big Power', rating: 5, reviews: 50, price: 13200.00, description: 'Powerful speaker with deep bass.', specifications: [{ key: 'Connectivity', value: 'Bluetooth, AUX' }, { key: 'Battery', value: '10 hours' }] },
    { id: 3, image: 'https://via.placeholder.com/400x400?text=Camera', category: 'Camera', name: 'WiFi Security Camera', brand: 'HomeTech', rating: 5, reviews: 50, price: 19152.00, description: 'High-resolution security camera with night vision.', specifications: [{ key: 'Resolution', value: '1080p' }, { key: 'Field of View', value: '120°' }, { key: 'Storage', value: 'Cloud, SD Card' }] },
    { id: 8, image: 'https://via.placeholder.com/400x400?text=iPhone', category: 'Phone', name: 'iPhone 6x Plus', brand: 'Apple', rating: 5, reviews: 50, price: 19200.00, description: 'Smartphone with a 6.5-inch display', specifications: [{ key: 'Display', value: '6.5"' }, { key: 'Storage', value: '64GB' }, { key: 'Camera', value: '12MP' }] },
    { id: 9, image: 'https://via.placeholder.com/400x400?text=Headphone', category: 'Headphone', name: 'Wireless Headphones', brand: 'Bose', rating: 5, reviews: 50, price: 16800.00, description: 'Comfortable wireless headphones with noise cancellation.', specifications: [{ key: 'Connectivity', value: 'Bluetooth' }, { key: 'Battery', value: '20 hours' }, { key: 'Feature', value: 'Noise Cancellation' }] },
     { id: 10, image: 'https://via.placeholder.com/400x400?text=Speaker', category: 'Speaker', name: 'Mini Bluetooth Speaker', brand: 'MiniSound', rating: 4, reviews: 240, price: 3360.00, description: 'Compact and portable Bluetooth speaker.', specifications: [{ key: 'Connectivity', value: 'Bluetooth' }, { key: 'Battery', value: '5 hours' }] },
     { id: 11, image: 'https://via.placeholder.com/400x400?text=TV', category: 'TV', name: '65" 4K TV', brand: 'Samsung', rating: 4.5, reviews: 100, price: 25000.00, description: 'Large 4K Smart TV.', specifications: [{ key: 'Display Size', value: '65"' }, { key: 'Resolution', value: '4K UHD' }, { key: 'Type', value: 'Smart TV' }] },
];


const ProductDetails = () => {
  const { id } = useParams(); 
  const { t } = useLanguage(); 

  const [product, setProduct] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1); 
  useEffect(() => {
    const foundProduct = dummyProducts.find(p => p.id === Number(id)); 

    if (foundProduct) {
      setProduct(foundProduct);
      setLoading(false);
    } else {
      setProduct(null); 
      setLoading(false);
    }
    return () => {

    };
  }, [id]); 

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen dark:text-white">
        {t.loading || 'Loading...'}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 dark:text-red-400">
        {t.productNotFound || 'Product not found.'}
      </div>
    );
  }
  return (
    <section className="w-full bg-white py-12 px-4 transition-colors duration-300 dark:bg-gray-900 md:px-8 lg:px-12">
      <div className="mx-auto max-w-screen-xl">
        <div className="flex flex-col md:flex-row gap-8">

          <div className="w-full md:w-1/2 flex justify-center items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-4 shadow-md">
            <img
              src={product.image}
              alt={product.name}
              className="max-w-full max-h-96 object-contain"
            />
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{product.category}</p>
            <div className="flex items-baseline mt-4">
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  EGP {product.price.toLocaleString()}
                </p>
              
            </div>
             {product.description && (
                <p className="mt-4 text-gray-700 dark:text-gray-300 text-base">
                  {product.description}
                </p>
             )}
            {product.specifications && product.specifications.length > 0 && (
              <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-md shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t.specifications || 'Specifications'}</h3>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                  {product.specifications.map((spec, index) => (
                    <li key={index} className="mb-1">
                      <span className="font-medium">{spec.key}:</span> {spec.value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-6 flex items-center">
              <span className="text-gray-700 dark:text-gray-300 mr-4">{t.quantity || 'Quantity'}:</span>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-20 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button className="flex-1 bg-blue-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                {t.addToCart || 'Add To Cart'}
              </button>
              <button className="flex-1 bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-md hover:bg-gray-300 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 flex items-center justify-center dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                 <Heart size={20} className="mr-2"/> {t.toWishlist || 'To Wishlist'}
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default ProductDetails;
