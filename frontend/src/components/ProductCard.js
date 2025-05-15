// frontend/src/components/ProductCard.js (أو المسار الصحيح لملفك)
import { Eye, ShoppingCart, Heart } from "lucide-react";
import { useLanguage } from "./LanguageContext"; // تأكد من المسار إذا كان مختلفاً
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext"; // <-- استيراد سياق المفضلة
import { useAuth } from "../context/AuthContext"; // <-- استيراد سياق المصادقة (اختياري للتحقق من تسجيل الدخول)


const ProductCard = ({ product }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { wishlistItems, toggleFavorite, isFavorite } = useWishlist(); // <-- استخدام سياق المفضلة
  const { isAuthenticated } = useAuth(); // <-- (اختياري) للتحقق إذا كان المستخدم مسجل دخوله قبل الإضافة للمفضلة

  const handleViewProduct = () => {
    navigate(`/shop/${product._id}`);
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation(); // لمنع أي أحداث أخرى (مثل فتح تفاصيل المنتج إذا كان القلب داخل رابط)
    if (!isAuthenticated) {
        alert(t.pleaseLoginToAddFavorites || "يرجى تسجيل الدخول لإضافة المنتج إلى المفضلة.");
        navigate('/login'); // توجيه المستخدم لصفحة تسجيل الدخول
        return;
    }
    toggleFavorite(product._id);
  };

  const productIsFavorite = isFavorite(product._id);

  const imageUrl = product.image?.startsWith("http")
    ? product.image
    : `http://localhost:5000${product.image}`; // تأكد أن هذا هو عنوان الخادم الصحيح

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 p-4 flex flex-col justify-between">
      <div className="relative group cursor-pointer" onClick={handleViewProduct}>
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-40 sm:h-48 object-contain mb-2 rounded-md" // object-contain للحفاظ على أبعاد الصورة
          onError={(e) => {
            console.log("Image load error:", imageUrl);
            e.target.src = 'https://via.placeholder.com/300x200.png?text=No+Image'; // صورة بديلة
          }}
        />
        {/* الأزرار التي تظهر عند المرور بالفأرة */}
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* زر عرض المنتج */}
          <button
            className="bg-white dark:bg-gray-700 p-2.5 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transform hover:scale-110 transition-transform"
            title={t.view || "View Product"}
            onClick={(e) => { e.stopPropagation(); handleViewProduct(); }}
          >
            <Eye size={18} className="text-gray-700 dark:text-white" />
          </button>
          {/* زر إضافة للسلة */}
          <button
            className="bg-white dark:bg-gray-700 p-2.5 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transform hover:scale-110 transition-transform"
            title={t.addToCart || "Add to Cart"}
            onClick={(e) => { e.stopPropagation(); alert('Add to cart clicked for ' + product.name); /* تنفيذ منطق السلة */ }}
          >
            <ShoppingCart size={18} className="text-gray-700 dark:text-white" />
          </button>
          {/* زر إضافة للمفضلة */}
          <button
            className={`bg-white dark:bg-gray-700 p-2.5 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transform hover:scale-110 transition-transform ${productIsFavorite ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-white'}`}
            title={productIsFavorite ? (t.removeFromFavorites || "Remove from Favorites") : (t.addToFavorites || "Add to Favorites")}
            onClick={handleToggleFavorite} // <-- استدعاء الدالة الجديدة
          >
            <Heart size={18} fill={productIsFavorite ? "currentColor" : "none"} /> {/* تغيير شكل القلب */}
          </button>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.category || "Uncategorized"}</p>
        <h3
            className="text-sm font-semibold text-gray-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer truncate"
            onClick={handleViewProduct}
            title={product.name}
        >
            {product.name}
        </h3>
        {/* التقييم (مثال ثابت) */}
        <div className="flex items-center text-xs text-yellow-400 mt-1">
          {Array(5).fill(0).map((_, i) => (
            <span key={i}>★</span>
          ))}
          <span className="ml-1 text-gray-500 dark:text-gray-300 text-xs">
            (5.0) {/* يمكنك جعل هذا ديناميكياً */}
          </span>
        </div>

        <p className="mt-2 text-indigo-700 dark:text-indigo-400 font-bold text-lg">
          {/* تأكد أن t.currencySymbol موجود في ملفات اللغة أو استخدم العملة مباشرة */}
          {t.currencySymbol || "EGP"} {Number(product.price).toLocaleString(t.locale || 'ar-EG')}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;