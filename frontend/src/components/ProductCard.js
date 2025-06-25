import React from "react";
import { Heart, Award, ShoppingCart } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "./ToastNotification";

const ProductCard = ({ product, advertisement }) => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const { toggleFavorite, isFavorite } = useWishlist();
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const { isAuthenticated, API_BASE_URL } = useAuth();

    if (!product || typeof product !== 'object') {
        return null;
    }
    
    const adData = advertisement || product.advertisement;

    const handleCardClick = (e) => {
        if (e.target.closest('button')) return;
        if (product?._id) {
            navigate(`/shop/${product._id}`);
        }
    };

    const handleToggleFavorite = (e) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            showToast(t('wishlist.loginRequired'), 'info');
            navigate('/login');
            return;
        }
        if (product?._id) {
            toggleFavorite(product);
        }
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (product?._id) {
            addToCart(product, 1);
        }
    };

    const productName = product.name || t('general.unnamedProduct');
    const productCategoryName = product.category?.name || t('productCard.uncategorized');
    
    const isAdvertised = !!adData;
    const productIsFavorite = product._id ? isFavorite(product._id) : false;
    const imageUrl = product.mainImage ? `${API_BASE_URL}${product.mainImage}` : 'https://via.placeholder.com/400?text=No+Image';

    let displayPrice = isAdvertised ? adData.discountedPrice : product.basePrice;
    let originalPrice = isAdvertised ? adData.originalPrice : null;
    let discountPercentage = 0;

    if (isAdvertised && originalPrice != null && displayPrice < originalPrice) {
        discountPercentage = Math.round(((originalPrice - displayPrice) / originalPrice) * 100);
    }
    
    const formatPrice = (price) => {
        if (price == null) return t('general.notApplicable');
        const currencyCode = adData?.currency || product.currency || 'SAR';
        const locale = language === 'ar' ? 'ar-SA' : 'en-US';
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode,
        }).format(Number(price));
    };

    return (
        <div
            className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            onClick={handleCardClick}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
            <div className="relative cursor-pointer">
                <div className="relative w-full h-56 bg-gray-100 dark:bg-zinc-800 flex items-center justify-center p-4">
                    <img
                        src={imageUrl}
                        alt={productName}
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=No+Image'; }}
                    />
                </div>

                {discountPercentage > 0 && (
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                        <Award size={14} />
                        <span>{discountPercentage}% {t('general.off')}</span>
                    </div>
                )}
                
                <button
                    className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-gray-700 shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-110 dark:bg-zinc-900/50 dark:text-white"
                    title={productIsFavorite ? t('productCard.removeFromFavorites') : t('productCard.addToFavorites')}
                    onClick={handleToggleFavorite}
                >
                    <Heart size={18} fill={productIsFavorite ? "currentColor" : "none"} className={productIsFavorite ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}/>
                </button>
            </div>
            
            <div className="flex flex-1 flex-col p-5">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {productCategoryName}
                </p>
                <h3 className="mb-4 text-base font-bold text-gray-800 dark:text-white line-clamp-2 cursor-pointer" title={productName}>
                    {productName}
                </h3>
                
                <div className="mt-auto flex items-baseline gap-2">
                    <p className="text-xl font-extrabold text-gray-900 dark:text-white">
                        {formatPrice(displayPrice)}
                    </p>
                    {originalPrice && originalPrice > displayPrice && (
                        <p className="text-sm font-medium text-gray-400 line-through dark:text-zinc-500">
                            {formatPrice(originalPrice)}
                        </p>
                    )}
                </div>

                <button
                    className="mt-4 w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-indigo-600 dark:bg-white dark:text-black dark:hover:bg-indigo-500 dark:hover:text-white flex items-center justify-center gap-2"
                    onClick={handleAddToCart}
                >
                    <ShoppingCart size={16} />
                    {t('productCard.addToCart')}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;