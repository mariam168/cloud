import { Eye, Heart, ShoppingCart } from "lucide-react"; // Import ShoppingCart icon
import { useLanguage } from "./LanguageContext"; // Assuming LanguageContext is in the same components folder
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext"; // Assuming useWishlist is in context folder
import { useAuth } from "../context/AuthContext"; // Assuming useAuth is in context folder
import { useCart } from "../context/CartContext"; // Assuming useCart is in context folder

const ProductCard = ({ product }) => {
    const { t } = useLanguage(); // Hook for localization
    const navigate = useNavigate(); // Hook for navigation
    // Get wishlist state and actions from WishlistContext
    const { toggleFavorite, isFavorite } = useWishlist();
    // Get cart state and actions from CartContext
    // Use toggleCart for the quick add/remove from card view (adds/removes with quantity 1)
    const { toggleCart, isInCart } = useCart();
    // Get authentication state from AuthContext
    const { isAuthenticated } = useAuth();

    // Handle clicking on the product card or view button to navigate to product details page
    const handleViewProduct = () => {
        // Ensure product data and ID are available before navigating
        if (!product || !product._id) {
            console.error("Product data is incomplete for navigation.", product);
            alert("Cannot view product details: Product data is missing.");
            return;
        }
        navigate(`/shop/${product._id}`); // Navigate to the product details page using the product ID
    };

    // Handle toggling the product in the wishlist
    const handleToggleFavorite = (e) => {
        e.stopPropagation(); // Prevent the click event from bubbling up to the parent div (which navigates)
        // Require authentication for wishlist action
        if (!isAuthenticated) {
            alert(t.pleaseLoginToAddFavorites || "يرجى تسجيل الدخول لإضافة المنتج إلى المفضلة.");
            navigate('/login'); // Navigate to login page
            return;
        }
        // Ensure product data and ID are available
        if (!product || !product._id) {
            console.error("Product ID is undefined before toggling favorite!", product);
            alert("لا يمكن إضافة المنتج للمفضلة: بيانات المنتج غير مكتملة.");
            return;
        }
        // Call toggleFavorite from the wishlist context
        toggleFavorite(product);
    };

    // Handle toggling the product in the cart (add/remove with quantity 1)
    const handleToggleCart = (e) => {
        e.stopPropagation(); // Prevent the click event from bubbling up
        // Require authentication for cart action
        if (!isAuthenticated) {
            alert(t.pleaseLoginToAddCart || "يرجى تسجيل الدخول لإضافة المنتج إلى السلة.");
            navigate('/login'); // Navigate to login page
            return;
        }
        // Call toggleCart from the cart context (adds/removes with quantity 1)
        toggleCart(product);
        // The alert below might show before state is fully updated due to async operation,
        // consider using a toast notification library for better user experience.
        // alert(isInCart(product._id) ? (t.removedFromCart || "تمت إزالة المنتج من السلة.") : (t.addedToCart || "تمت إضافة المنتج إلى السلة."));
        // A more sophisticated notification could be triggered after the toggleCart async operation completes.
    };

    // Basic validation check for the product prop to prevent rendering errors
    if (!product || typeof product !== 'object') {
        console.error("ProductCard received invalid product data:", product);
        return <div className="text-red-500 p-4">Error: Invalid product data.</div>;
    }

    // Check if the product is currently favorited or in the cart
    // Ensure product._id exists before using it for checks
    const productIsFavorite = product._id ? isFavorite(product._id) : false;
    const productInCart = product._id ? isInCart(product._id) : false;

    // Construct image URL, handling potential missing image or different formats
    // Assumes backend serves images from /uploads
    const imageUrl = product.image?.startsWith("http") || product.image?.startsWith("/")
        ? product.image?.startsWith("/") ? `http://localhost:5000${product.image}` : product.image
        : product.image ? `http://localhost:5000/${product.image}` : 'https://via.placeholder.com/300x200.png?text=No+Image'; // Fallback if no image string

    return (
        // Main container for the product card
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 p-4 flex flex-col justify-between">
            {/* Product Image and Hover Actions Section */}
            <div className="relative group cursor-pointer" onClick={handleViewProduct}>
                <img
                    src={imageUrl}
                    alt={product.name || 'Product Image'}
                    className="w-full h-40 sm:h-48 object-contain mb-2 rounded-md"
                    // Fallback image on error loading the source
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x200.png?text=No+Image'; }}
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
                         {/* Display ShoppingCart icon, change color based on whether it's in cart */}
                         <ShoppingCart size={18} className={productInCart ? 'text-red-500 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'} />
                    </button>
                    {/* Add/Remove from Wishlist Button */}
                    <button
                        className={`bg-white dark:bg-gray-700 p-2.5 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transform hover:scale-110 transition-transform ${productIsFavorite ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-white'}`}
                        title={productIsFavorite ? (t.removeFromFavorites || "Remove from Favorites") : (t.addToFavorites || "Add to Favorites")}
                        onClick={handleToggleFavorite} // Use the toggle favorite handler
                    >
                        {/* Display Heart icon, fill color based on whether it's favorited */}
                        <Heart size={18} fill={productIsFavorite ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>
            {/* Product Details Section */}
            <div className="mt-4">
                {/* Product Category */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.category || "Uncategorized"}</p>
                {/* Product Name (Truncated) */}
                <h3
                    className="text-sm font-semibold text-gray-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer truncate"
                    onClick={handleViewProduct} // Make name clickable to view details
                    title={product.name || 'No name'} // Tooltip for full name
                >
                    {product.name || 'Unnamed Product'}
                </h3>
                {/* Static Rating (Placeholder) - Replace with dynamic rating if available */}
                <div className="flex items-center text-xs text-yellow-400 mt-1">
                    {Array(5).fill(0).map((_, i) => (<span key={i}>★</span>))} {/* Static 5 stars */}
                    <span className="ml-1 text-gray-500 dark:text-gray-300 text-xs"> (5.0) </span> {/* Static rating value */}
                </div>
                {/* Product Price */}
                <p className="mt-2 text-indigo-700 dark:text-indigo-400 font-bold text-lg">
                    {/* Display price formatted with currency symbol and locale */}
                    {t.currencySymbol || "EGP"} {product.price ? Number(product.price).toLocaleString(t.locale || 'ar-EG') : 'N/A'}
                </p>
            </div>
        </div>
    );
};

export default ProductCard;
