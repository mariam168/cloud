import { Heart, ShoppingCart, Star, Info } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";

const ProductCard = ({ product }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { toggleFavorite, isFavorite } = useWishlist();
    const { isAuthenticated, API_BASE_URL } = useAuth();

    const handleCardClick = () => {
        if (!product?._id) return;
        navigate(`/shop/${product._id}`);
    };

    const handleToggleFavorite = (e) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            alert(t('wishlist.loginRequired'));
            navigate('/login');
            return;
        }
        if (!product?._id) return;
        toggleFavorite(product);
    };
    const handleActionClick = (e) => {
        e.stopPropagation();
        handleCardClick(); 
    };

    if (!product || typeof product !== 'object') {
        return null;
    }

    const productIsFavorite = product._id ? isFavorite(product._id) : false;

    const imageUrl = product.mainImage ? `${API_BASE_URL}${product.mainImage}` : '/images/placeholder-product-image.png';

    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = '/images/placeholder-product-image.png';
    };

    const productName = product.name || t('general.unnamedProduct');
    const productCategoryName = product.category?.name || t('productCard.uncategorized');
    
    const formatPrice = (price) => {
        if (price === undefined || price === null) return t('general.notApplicable');
        const currencyCode = t('general.currencyCode') || 'USD';
        return new Intl.NumberFormat(t.language === 'ar' ? 'ar-EG' : 'en-US', {
            style: 'currency',
            currency: currencyCode,
        }).format(Number(price));
    };

    return (
        <div
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden cursor-pointer group"
            onClick={handleCardClick}
        >
            <div className="relative w-full h-48 overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-700 p-4 rounded-t-xl">
                <img
                    src={imageUrl}
                    alt={productName}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={handleImageError}
                />
                
                <button
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 shadow-md hover:bg-white hover:scale-110 transition-all duration-200 z-10"
                    title={productIsFavorite ? t('productCard.removeFromFavorites') : t('productCard.addToFavorites')}
                    onClick={handleToggleFavorite}
                >
                    <Heart size={18} fill={productIsFavorite ? "currentColor" : "none"} className={productIsFavorite ? 'text-red-500' : 'text-gray-700'}/>
                </button>
            </div>
            
            <div className="p-5 flex flex-col flex-grow">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                    {productCategoryName}
                </p>
                <h3
                    className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 mb-2"
                    title={productName}
                >
                    {productName}
                </h3>
                
                <div className="flex items-center text-sm text-yellow-500 mb-3">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill={i < (product.rating || 0) ? "currentColor" : "none"} strokeWidth={1} className={i < (product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'} />
                    ))}
                    <span className="ml-1 text-gray-600 dark:text-gray-300 text-xs">({product.rating?.toFixed(1) || '0.0'})</span>
                </div>
                
                <p className="text-xl font-extrabold text-green-600 dark:text-green-400 mb-4 mt-auto">
                    {formatPrice(product.basePrice)}
                </p>

                <button
                    className="w-full px-4 py-2 rounded-lg shadow-md text-white font-semibold transition-all duration-200 hover:scale-[1.01] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                    title={t('productCard.viewDetails')}
                    onClick={handleActionClick}
                >
                    <Info size={18} />
                    {t('productCard.viewDetails')}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;