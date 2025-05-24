import { Eye, Heart, ShoppingCart } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const { toggleFavorite, isFavorite } = useWishlist();
    const { toggleCart, isInCart } = useCart();
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
        if (!isAuthenticated) {
            alert(t.pleaseLoginToAddFavorites || "Please log in to add to favorites.");
            navigate('/login');
            return;
        }
        if (!product || !product._id) {
            console.error("Product ID is undefined before toggling favorite!", product);
            alert("Cannot add product to favorites: Product data is incomplete.");
            return;
        }
        toggleFavorite(product);
    };

    const handleToggleCart = (e) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            alert(t.pleaseLoginToAddCart || "Please log in to add to cart.");
            navigate('/login');
            return;
        }
        if (!product || !product._id) {
            console.error("Product ID is undefined before toggling cart!", product);
            alert("Cannot add product to cart: Product data is incomplete.");
            return;
        }
        toggleCart(product);
    };

    if (!product || typeof product !== 'object') {
        console.error("ProductCard received invalid product data:", product);
        return <div className="text-red-500 p-4">Error: Invalid product data.</div>;
    }

    const productIsFavorite = product._id ? isFavorite(product._id) : false;
    const productInCart = product._id ? isInCart(product._id) : false;

    const imageUrl = product.image
        ? (product.image.startsWith("http") || product.image.startsWith("/"))
            ? product.image.startsWith("/") ? `http://localhost:5000${product.image}` : product.image
            : `http://localhost:5000/${product.image}`
        : "https://www.pinterest.com/pin/539798705342659016/";
     

    const productName = typeof product.name === 'object' ? (product.name?.[language] || product.name?.en || product.name?.ar) : product.name || 'Unnamed Product';
    const productDescription = typeof product.description === 'object' ? (product.description?.[language] || product.description?.en || product.description?.ar) : product.description || t.noDescription || 'No description available.';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 p-4 flex flex-col justify-between">
            <div className="relative group cursor-pointer" onClick={handleViewProduct}>
                <img
                    src={imageUrl}
                    alt={productName}
                    className="w-full h-40 sm:h-48 object-contain mb-2 rounded-md"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://www.pinterest.com/pin/539798705342659016/'; }}
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
                        title={productInCart ? (t.removeFromCart || "Remove from Cart") : (t.addToCart || "Add to Cart")}
                        onClick={handleToggleCart}
                    >
                        <ShoppingCart size={18} className={productInCart ? 'text-red-500 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'} />
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
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.category || t.uncategorized || "Uncategorized"}</p>
                <h3
                    className="text-sm font-semibold text-gray-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer truncate"
                    onClick={handleViewProduct}
                    title={productName}
                >
                    {productName}
                </h3>
                <div className="flex items-center text-xs text-yellow-400 mt-1">
                    {Array(5).fill(0).map((_, i) => (<span key={i}>★</span>))}
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