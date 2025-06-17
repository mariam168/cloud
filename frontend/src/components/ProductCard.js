import { Heart, ShoppingCart, Star, Sparkles, Info } from "lucide-react"; // تم إضافة Info هنا
import { useLanguage } from "./LanguageContext"; 
import { useNavigate, Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext"; 
import { useAuth } from "../context/AuthContext"; 
import { useCart } from "../context/CartContext"; 

const ProductCard = ({ product }) => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const { toggleFavorite, isFavorite } = useWishlist();
    const { isAuthenticated, API_BASE_URL } = useAuth(); // no addToCart or isInCart here for direct use in ProductCard

    // النقر على الصورة أو تفاصيل المنتج سيؤدي إلى عرض المنتج
    const handleCardClick = () => { 
        if (!product || !product._id) {
            console.error("Product data is incomplete for navigation.", product);
            // alert(t('productCard.viewProductError') || "Cannot view product details: Product data is missing."); // لا تعرض alert في هذه الدالة
            return;
        }
        navigate(`/shop/${product._id}`); // التغيير هنا: `/products/` بدلاً من `/shop/`
    };

    const handleToggleFavorite = (e) => {
        e.stopPropagation(); // منع النقر على البطاقة بالكامل عند النقر على هذا الزر
        if (!isAuthenticated) {
            alert(t('wishlist.loginRequired') || "Please log in to add to favorites."); 
            navigate('/login');
            return;
        }
        if (!product || !product._id) {
            console.error("Product ID is undefined before toggling favorite!", product);
            alert(t('productCard.addToFavoritesError') || "Cannot add product to favorites: Product data is incomplete."); 
            return;
        }
        toggleFavorite(product); 
    };

    // هذا الزر لن يقوم بالإضافة المباشرة للسلة، بل سيُحيل إلى صفحة التفاصيل لاختيار الـ variations
    const handleViewDetailsClick = (e) => { 
        e.stopPropagation(); // منع النقر على البطاقة بالكامل عند النقر على هذا الزر
        handleCardClick(); // إعادة استخدام دالة النقر على البطاقة للذهاب لصفحة التفاصيل
    };

    if (!product || typeof product !== 'object') {
        console.error("ProductCard received invalid product data:", product);
        return <div className="text-red-500 p-4">{t('general.invalidProductData') || "Error: Invalid product data."}</div>; 
    }

    const productIsFavorite = product._id ? isFavorite(product._id) : false;

    // استخدام `mainImage` بدلاً من `image`
    const imageUrl = product.mainImage 
        ? `${API_BASE_URL}${product.mainImage}`
        : '/images/placeholder-product-image.png'; 
        
    const handleImageError = (e) => {
        e.target.onerror = null; 
        e.target.src = '/images/placeholder-product-image.png'; 
        e.target.alt = t('general.imageFailedToLoad') || "Image failed to load"; 
    };

    const productName = typeof product.name === 'object' ? (product.name?.[language] || product.name?.en || product.name?.ar) : product.name || t('general.unnamedProduct'); 
    // تأكد أن product.category هو string الآن، وليس object
    const productCategoryName = product.category || t('productCard.uncategorized'); 
    
    const formatPrice = (price) => {
        if (price === undefined || price === null) return t('general.notApplicable') || 'N/A';
        try {
            const currencyCode = t('shopPage.currencyCode') || 'SAR'; 
            if (!/^[A-Z]{3}$/.test(currencyCode)) { 
                // console.warn(`Invalid currency code from translation: "${currencyCode}". Falling back to SAR.`); // لا تعرض تحذير هنا
                return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'SAR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(price));
            }
            return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(Number(price));
        } catch (e) {
            console.error("Error formatting currency in ProductCard:", e);
            return `${t('shopPage.currencySymbol') || '$'}${Number(price).toFixed(2)}`; 
        }
    };

    // منطق لتحديد الشارة المميزة (يمكنك تعديله بناءً على خصائص المنتج الفعلية من الباك إند)
    const hasSpecialBadge = product.isFeatured || (product.discountPercentage && product.discountPercentage > 0) || false; // مثال: خاصية isFeatured أو discountPercentage
    const badgeText = product.discountPercentage > 0 ? `${product.discountPercentage}% ${t('general.off')}` : (hasSpecialBadge ? (t('productCard.specialOffer') || 'Special Offer') : '');
    const badgeColorClass = product.discountPercentage > 0 ? 'bg-red-600' : 'bg-blue-600';

    // جديد: هل المنتج له variations (مثال: ألوان، مقاسات)
    const hasVariations = product.variations && product.variations.length > 0;

    return (
        <div 
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden cursor-pointer group"
            onClick={handleCardClick} // النقر على البطاقة بالكامل لعرض تفاصيل المنتج
        >
            {/* Image Area */}
            <div 
                className="relative w-full h-48 overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-700 p-4 rounded-t-xl"
            >
                <img
                    src={imageUrl}
                    alt={productName}
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300" 
                    onError={handleImageError} 
                />
                
                {/* Fixed Favorite Button on Image */}
                <button
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 shadow-md hover:bg-white hover:scale-110 transition-all duration-200 z-10"
                    title={productIsFavorite ? (t('productCard.removeFromFavorites') || "Remove from Favorites") : (t('productCard.addToFavorites') || "Add to Favorites")} 
                    onClick={handleToggleFavorite} 
                >
                    <Heart size={18} fill={productIsFavorite ? "currentColor" : "none"} className={productIsFavorite ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-white'}/>
                </button>

                {/* Badge for Special Offers/Features */}
                {hasSpecialBadge && (
                    <span className={`absolute top-3 left-3 ${badgeColorClass} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md z-10 animate-fade-in-down flex items-center gap-1`}>
                        <Sparkles size={12} className="text-yellow-200" />
                        {badgeText}
                    </span>
                )}
                {/* جديد: شارة لوجود Variations */}
                {hasVariations && !hasSpecialBadge && ( // لا تعرضها لو فيه شارة تانية
                    <span className={`absolute top-3 left-3 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md z-10 animate-fade-in-down flex items-center gap-1`}>
                        <Sparkles size={12} className="text-yellow-200" />
                        {t('productCard.variationsAvailable') || 'Variations'}
                    </span>
                )}
            </div>
            
            {/* Product Details */}
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
                
                {/* Rating */}
                <div className="flex items-center text-sm text-yellow-500 mb-3">
                    {Array(Math.floor(product.rating || 0)).fill(0).map((_, i) => (
                        <Star key={i} size={16} fill="currentColor" strokeWidth={0} className="text-yellow-500" />
                    ))}
                    {Array(5 - Math.floor(product.rating || 0)).fill(0).map((_, i) => (
                        <Star key={i + Math.floor(product.rating || 0)} size={16} strokeWidth={1} className="text-gray-300 dark:text-gray-500" />
                    ))}
                    <span className="ml-1 text-gray-600 dark:text-gray-300 text-xs"> ({product.rating?.toFixed(1) || '0.0'}) </span> 
                </div>
                
                {/* Price */}
                <p className="text-xl font-extrabold text-green-600 dark:text-green-400 mb-4 mt-auto"> 
                    {formatPrice(product.price)}
                </p>

                {/* Fixed Action Button - View Details or Add to Cart (if no variations) */}
                <button
                    className="w-full px-4 py-2 rounded-lg shadow-md text-white font-semibold transition-all duration-200 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ backgroundColor: hasVariations ? '#3B82F6' : '#22C55E' }} // أزرق لو فيه variations، أخضر لو مفيش
                    title={hasVariations ? (t('productCard.viewDetails') || "View Details") : (t('productCard.addToCart') || "Add to Cart")} 
                    onClick={handleViewDetailsClick} // دايماً اذهب لصفحة التفاصيل
                >
                    {hasVariations ? (
                        <>
                            <Info size={18} /> {/* أيقونة Info */}
                            {t('productCard.viewDetails') || "View Details"}
                        </>
                    ) : (
                        <>
                            <ShoppingCart size={18} />
                            {t('productCard.addToCart') || "Add to Cart"}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;