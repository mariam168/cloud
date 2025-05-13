import { Eye, ShoppingCart, Heart } from "lucide-react";
import { useLanguage } from "../components/LanguageContext";
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { t } = useLanguage();
  const navigate = useNavigate(); 
  const handleViewProduct = () => {
    navigate(`/shop/${product.id}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition duration-300 p-4">
      <div className="relative group">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-40 object-contain"
        />
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 flex gap-3 transition duration-300">
          <button
            className="bg-white dark:bg-gray-700 p-2 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-600"
            title={t.view || 'View Product'} 
            onClick={handleViewProduct} 
          >
            <Eye size={18} className="text-gray-700 dark:text-white" />
          </button>
          <button
            className="bg-white dark:bg-gray-700 p-2 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-600"
            title={t.addToCart || 'Add to Cart'} 
          >
            <ShoppingCart size={18} className="text-gray-700 dark:text-white" />
          </button>
          <button
            className="bg-white dark:bg-gray-700 p-2 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-600"
            title={t.addToFavorites || 'Add to Favorites'} 
          >
            <Heart size={18} className="text-gray-700 dark:text-white" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs text-gray-400 dark:text-gray-300">
          {product.category}
        </p>
        <h3 className="text-sm font-medium text-gray-800 dark:text-white">
          {product.name}
        </h3>
        <div className="flex items-center text-sm text-yellow-500 mt-1">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <span key={i}>★</span>
            ))}
          <span className="ml-1 text-gray-500 dark:text-gray-300 text-xs">
            5.0 {t.reviews || 'Reviews'} 
          </span>
        </div>

        <p className="mt-2 text-blue-700 dark:text-blue-400 font-semibold text-lg">
          EGP {product.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
