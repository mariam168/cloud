import React from "react";
import { Star, Heart, Award, Info } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";

const ProductCard = ({ product }) => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const { toggleFavorite, isFavorite } = useWishlist();
    const { isAuthenticated, API_BASE_URL } = useAuth();

    if (!product || typeof product !== 'object') {
        return null;
    }

    const handleCardClick = () => {
        if (product?._id) {
            navigate(`/shop/${product._id}`);
        }
    };

    const handleToggleFavorite = (e) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            alert(t('wishlist.loginRequired'));
            navigate('/login');
            return;
        }
        if (product?._id) {
            toggleFavorite(product);
        }
    };

    const productName = typeof product.name === 'object' ? product.name[language] || product.name.en : product.name || t('general.unnamedProduct');
    const productCategoryName = typeof product.category?.name === 'object' ? product.category.name[language] || product.category.name.en : product.category?.name || t('productCard.uncategorized');
    
    const isAdvertised = !!product.advertisement;
    const productIsFavorite = product._id ? isFavorite(product._id) : false;
    const imageUrl = product.mainImage ? `${API_BASE_URL}${product.mainImage}` : '/images/placeholder-product-image.png';

    let displayPrice = isAdvertised ? product.advertisement.discountedPrice : product.basePrice;
    let originalPrice = isAdvertised ? product.advertisement.originalPrice : null;
    let discountPercentage = 0;

    if (isAdvertised && originalPrice != null && displayPrice < originalPrice) {
        discountPercentage = Math.round(((originalPrice - displayPrice) / originalPrice) * 100);
    }
    
    const formatPrice = (price) => {
        if (price == null) return t('general.notApplicable');
        const currencyCode = product.advertisement?.currency || 'SAR';
        return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
            style: 'currency',
            currency: currencyCode,
        }).format(Number(price));
    };

    return (
        <div
            className="relative bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full overflow-hidden cursor-pointer group"
            onClick={handleCardClick}
        >
            {discountPercentage > 0 && (
                <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <Award size={14} />
                    <span>{discountPercentage}% {t('general.off')}</span>
                </div>
            )}
            
            <div className="relative w-full h-52 overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-slate-700 p-4 rounded-t-xl">
                <img
                    src={imageUrl}
                    alt={productName}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = '/images/placeholder-product-image.png'; }}
                />
                
                <button
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm text-gray-700 dark:text-gray-200 shadow-md hover:bg-white hover:scale-110 transition-all duration-200 z-10"
                    title={productIsFavorite ? t('productCard.removeFromFavorites') : t('productCard.addToFavorites')}
                    onClick={handleToggleFavorite}
                >
                    <Heart size={18} fill={productIsFavorite ? "currentColor" : "none"} className={productIsFavorite ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}/>
                </button>
            </div>
            
            <div className="p-5 flex flex-col flex-grow">
                <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1 uppercase tracking-wider">
                    {productCategoryName}
                </p>
                <h3
                    className="text-lg font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2 mb-2 flex-grow"
                    title={productName}
                >
                    {productName}
                </h3>
                
                <div className="flex items-center text-sm text-yellow-500 mb-4">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill={i < (product.rating || 0) ? "currentColor" : "none"} strokeWidth={1.5} className={i < (product.rating || 0) ? 'text-yellow-400' : 'text-gray-300 dark:text-slate-600'} />
                    ))}
                    <span className="ml-2 text-gray-600 dark:text-gray-400 text-xs font-medium">({product.rating?.toFixed(1) || '0.0'})</span>
                </div>
                
                <div className="flex items-baseline gap-2 mb-4">
                    <p className="text-2xl font-extrabold text-gray-800 dark:text-white">
                        {formatPrice(displayPrice)}
                    </p>
                    {originalPrice && originalPrice > displayPrice && (
                        <p className="text-md font-medium text-gray-400 dark:text-gray-500 line-through">
                            {formatPrice(originalPrice)}
                        </p>
                    )}
                </div>

                <button
                    className="w-full mt-auto px-4 py-2.5 rounded-lg shadow-md text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
                    title={t('productCard.viewDetails')}
                    onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
                >
                    <Info size={18} />
                    {t('productCard.viewDetails')}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;