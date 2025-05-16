// frontend/src/components/ProductCard.js
import { Eye, ShoppingCart, Heart } from "lucide-react";
import { useLanguage } from "./LanguageContext"; // Make sure this path is correct
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext"; // Make sure this path is correct
import { useAuth } from "../context/AuthContext";     // Make sure this path is correct

const ProductCard = ({ product }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useWishlist();
  const { isAuthenticated } = useAuth();

  const handleViewProduct = () => {
    if (!product || !product._id) {
      console.error("Product data is incomplete for navigation.", product);
      alert("Cannot view product details: Product data is missing.");
      return;
    }
    navigate(`/shop/${product._id}`);
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    // **Log the product object here**
    console.log("ProductCard: Toggling favorite for product:", product);

    if (!isAuthenticated) {
        alert(t.pleaseLoginToAddFavorites || "يرجى تسجيل الدخول لإضافة المنتج إلى المفضلة.");
        navigate('/login');
        return;
    }

    // **Add a check for product and product._id**
    if (!product || !product._id) {
      console.error("ProductCard: Product ID is undefined before toggling favorite!", product);
      alert("لا يمكن إضافة المنتج للمفضلة: بيانات المنتج غير مكتملة.");
      return;
    }
    toggleFavorite(product); // Pass the full product object
  };

  // **Check if product itself is valid before trying to access its properties**
  if (!product || typeof product !== 'object') {
    // Or handle this more gracefully, maybe return null or a placeholder
    console.error("ProductCard: Received invalid product prop", product);
    return <div className="text-red-500 p-4">Error: Invalid product data.</div>;
  }

  const productIsFavorite = product._id ? isFavorite(product._id) : false;

  const imageUrl = product.image?.startsWith("http") || product.image?.startsWith("/")
    ? product.image?.startsWith("/") ? `http://localhost:5000${product.image}` : product.image
    : `http://localhost:5000/${product.image}`; // Default if not absolute or server-relative

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 p-4 flex flex-col justify-between">
      <div className="relative group cursor-pointer" onClick={handleViewProduct}>
        <img
          src={imageUrl}
          alt={product.name || 'Product Image'}
          className="w-full h-40 sm:h-48 object-contain mb-2 rounded-md"
          onError={(e) => {
            console.warn("ProductCard: Image load error for:", imageUrl);
            e.target.src = 'https://via.placeholder.com/300x200.png?text=No+Image';
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            className="bg-white dark:bg-gray-700 p-2.5 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transform hover:scale-110 transition-transform"
            title={t.view || "View Product"}
            onClick={(e) => { e.stopPropagation(); handleViewProduct(); }}
          >
            <Eye size={18} className="text-gray-700 dark:text-white" />
          </button>
          <button
            className="bg-white dark:bg-gray-700 p-2.5 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transform hover:scale-110 transition-transform"
            title={t.addToCart || "Add to Cart"}
            onClick={(e) => { e.stopPropagation(); alert('Add to cart for ' + product.name); }}
          >
            <ShoppingCart size={18} className="text-gray-700 dark:text-white" />
          </button>
          <button
            className={`bg-white dark:bg-gray-700 p-2.5 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transform hover:scale-110 transition-transform ${productIsFavorite ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-white'}`}
            title={productIsFavorite ? (t.removeFromFavorites || "Remove from Favorites") : (t.addToFavorites || "Add to Favorites")}
            onClick={handleToggleFavorite}
          >
            <Heart size={18} fill={productIsFavorite ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.category || "Uncategorized"}</p>
        <h3
            className="text-sm font-semibold text-gray-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer truncate"
            onClick={handleViewProduct}
            title={product.name || 'No name'}
        >
            {product.name || 'Unnamed Product'}
        </h3>
        <div className="flex items-center text-xs text-yellow-400 mt-1">
          {Array(5).fill(0).map((_, i) => ( <span key={i}>★</span> ))}
          <span className="ml-1 text-gray-500 dark:text-gray-300 text-xs"> (5.0) </span>
        </div>
        <p className="mt-2 text-indigo-700 dark:text-indigo-400 font-bold text-lg">
          {t.currencySymbol || "EGP"} {product.price ? Number(product.price).toLocaleString(t.locale || 'ar-EG') : 'N/A'}
        </p>
      </div>
    </div>
  );
};
export default ProductCard;