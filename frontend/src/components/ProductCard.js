import { Eye, Heart } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { toggleFavorite, isFavorite } = useWishlist();
    // Use toggleCart from useCart context - this adds/removes with quantity 1
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
        e.stopPropagation(); // Prevent triggering parent click handler
        if (!isAuthenticated) {
            alert(t.pleaseLoginToAddFavorites || "يرجى تسجيل الدخول لإضافة المنتج إلى المفضلة.");
            navigate('/login');
            return;
        }
        if (!product || !product._id) {
            console.error("Product ID is undefined before toggling favorite!", product);
            alert("لا يمكن إضافة المنتج للمفضلة: بيانات المنتج غير مكتملة.");
            return;
        }
        // Call toggleFavorite from wishlist context
        toggleFavorite(product);
    };

    const handleToggleCart = (e) => {
        e.stopPropagation(); // Prevent triggering parent click handler
        if (!isAuthenticated) {
            alert(t.pleaseLoginToAddCart || "يرجى تسجيل الدخول لإضافة المنتج إلى السلة.");
            navigate('/login');
            return;
        }
        // Call toggleCart from cart context (adds/removes with quantity 1)
        toggleCart(product);
        // The alert below might show before state is fully updated, consider a toast library for better UX
        // alert(isInCart(product._id) ? (t.removedFromCart || "تمت إزالة المنتج من السلة.") : (t.addedToCart || "تمت إضافة المنتج إلى السلة."));
        // Consider adding a more sophisticated notification here after the toggleCart async operation completes
    };

    // Basic validation check for the product prop
    if (!product || typeof product !== 'object') {
        console.error("ProductCard received invalid product data:", product);
        return <div className="text-red-500 p-4">Error: Invalid product data.</div>;
    }

    // Ensure product._id exists before using it for checks
    const productIsFavorite = product._id ? isFavorite(product._id) : false;
    const productInCart = product._id ? isInCart(product._id) : false;

    // Construct image URL, handling potential missing image or different formats
    const imageUrl = product.image?.startsWith("http") || product.image?.startsWith("/")
        ? product.image?.startsWith("/") ? `http://localhost:5000${product.image}` : product.image
        : product.image ? `http://localhost:5000/${product.image}` : 'https://via.placeholder.com/300x200.png?text=No+Image'; // Fallback if no image string

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 p-4 flex flex-col justify-between">
            {/* Product Image and Hover Actions */}
            <div className="relative group cursor-pointer" onClick={handleViewProduct}>
                <img
                    src={imageUrl}
                    alt={product.name || 'Product Image'}
                    className="w-full h-40 sm:h-48 object-contain mb-2 rounded-md"
                    onError={(e) => {
                        console.warn("Image load error for:", imageUrl);
                        e.target.onerror = null; // Prevent infinite loop if fallback also fails
                        e.target.src = 'https://via.placeholder.com/300x200.png?text=No+Image'; // Fallback image on error
                    }}
                />
                {/* Hover Overlay with Action Buttons */}
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {/* View Product Button */}
                    <button
                        className="bg-white dark:bg-gray-700 p-2.5 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transform hover:scale-110 transition-transform"
                        title={t.view || "View Product"}
                        onClick={(e) => { e.stopPropagation(); handleViewProduct(); }} // Prevent card click when clicking button
                    >
                        <Eye size={18} className="text-gray-700 dark:text-white" />
                    </button>
                    {/* Add/Remove from Cart Button */}
                    <button
                        className="bg-white dark:bg-gray-700 p-2.5 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transform hover:scale-110 transition-transform"
                        title={productInCart ? (t.removeFromCart || "Remove from Cart") : (t.addToCart || "Add to Cart")}
                        onClick={handleToggleCart} // Use the toggle cart handler
                    >
                         {/* You might want an icon here instead of text */}
                         {productInCart ? 'Remove' : 'Add'} {/* Simplified text for button */}
                         {/* Example using ShoppingCart icon: */}
                         {/* <ShoppingCart size={18} className={productInCart ? 'text-red-500 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'} /> */}
                    </button>
                    {/* Add/Remove from Wishlist Button */}
                    <button
                        className={`bg-white dark:bg-gray-700 p-2.5 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transform hover:scale-110 transition-transform ${productIsFavorite ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-white'}`}
                        title={productIsFavorite ? (t.removeFromFavorites || "Remove from Favorites") : (t.addToFavorites || "Add to Favorites")}
                        onClick={handleToggleFavorite} // Use the toggle favorite handler
                    >
                        <Heart size={18} fill={productIsFavorite ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>
            {/* Product Details */}
            <div className="mt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.category || "Uncategorized"}</p>
                <h3
                    className="text-sm font-semibold text-gray-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer truncate"
                    onClick={handleViewProduct}
                    title={product.name || 'No name'}
                >
                    {product.name || 'Unnamed Product'}
                </h3>
                {/* Static Rating - replace with dynamic rating if available */}
                <div className="flex items-center text-xs text-yellow-400 mt-1">
                    {Array(5).fill(0).map((_, i) => (<span key={i}>★</span>))} {/* Static 5 stars */}
                    <span className="ml-1 text-gray-500 dark:text-gray-300 text-xs"> (5.0) </span> {/* Static rating */}
                </div>
                {/* Product Price */}
                <p className="mt-2 text-indigo-700 dark:text-indigo-400 font-bold text-lg">
                    {t.currencySymbol || "EGP"} {product.price ? Number(product.price).toLocaleString(t.locale || 'ar-EG') : 'N/A'}
                </p>
            </div>
        </div>
    );
};

export default ProductCard;
