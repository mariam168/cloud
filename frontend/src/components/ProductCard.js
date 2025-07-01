import React from "react";
import { Heart, Award, Star, ArrowRight } from "lucide-react"; 
import { useLanguage } from "./LanguageContext";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./ToastNotification";

const StarRating = ({ rating }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <Star
                key={i}
                size={14}
                className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
                fill="currentColor"
            />
        ))}
    </div>
);

const ProductCard = ({ product, advertisement }) => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const { toggleFavorite, isFavorite } = useWishlist();
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
    const handleViewDetails = (e) => {
        e.stopPropagation();
        if (product?._id) {
            navigate(`/shop/${product._id}`);
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
        const currencyCode = adData?.currency || product.currency || 'EGP';
        const locale = language === 'ar' ? 'ar-EG' : 'en-US';
        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currencyCode,
            }).format(Number(price));
        } catch (error) {
            console.error("Price formatting error:", error);
            return `${price} ${currencyCode}`;
        }
    };
    return (
        <div
            className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
            <div className="relative cursor-pointer" onClick={handleCardClick}>
                <div className="relative flex w-full items-center justify-center overflow-hidden bg-gray-100 p-4 aspect-square dark:bg-zinc-800">
                    <img
                        src={imageUrl}
                        alt={productName} 
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=No+Image'; }}
                        loading="lazy"
                    />
                </div>

                {discountPercentage > 0 && (
                    <div className={`absolute top-3 z-10 flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-md ${language === 'ar' ? 'right-3' : 'left-3'}`}>
                        <Award size={14} />
                        <span>{discountPercentage}% {t('general.off')}</span>
                    </div>
                )}
                
                <button
                    aria-label={productIsFavorite ? t('productCard.removeFromFavorites') : t('productCard.addToFavorites')}
                    className={`absolute top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white dark:bg-zinc-900/70 dark:text-white dark:hover:bg-zinc-800 ${language === 'ar' ? 'left-3' : 'right-3'}`}
                    onClick={handleToggleFavorite}
                >
                    <Heart size={18} fill={productIsFavorite ? "currentColor" : "none"} className={productIsFavorite ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}/>
                </button>
            </div>
            
            <div className="flex flex-1 flex-col p-4">
                <div className="flex-1">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {productCategoryName}
                    </p>
                    <h3
                        className="mb-2 min-h-[40px] cursor-pointer text-base font-bold text-gray-800 line-clamp-2 dark:text-white"
                        title={productName}
                        onClick={handleCardClick}
                    >
                        {productName}
                    </h3>
                    {product.numReviews > 0 && (
                        <div className="flex items-center gap-1.5">
                            <StarRating rating={product.averageRating} />
                            <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">({product.numReviews})</span>
                        </div>
                    )}
                </div>
                
                <div className="mt-auto pt-2">
                     <div className="flex flex-col">
                        <p className="text-xl font-extrabold text-gray-900 dark:text-white">
                            {formatPrice(displayPrice)}
                        </p>
                        {originalPrice && originalPrice > displayPrice && (
                            <p className="-mt-1 text-sm font-medium text-gray-400 line-through dark:text-zinc-500">
                                {formatPrice(originalPrice)}
                            </p>
                        )}
                    </div>
                    <button
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-500"
                        onClick={handleViewDetails}
                    >
                        <ArrowRight size={16} />
                        {t('productCard.viewDetails')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;