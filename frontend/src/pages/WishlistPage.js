import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard'; 
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
const WishlistPage = () => {
  const { wishlistItems, loadingWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  if (loadingWishlist) {
    return <div className="container mx-auto px-4 py-8 text-center"><p>جار تحميل المفضلة...</p></div>;
  }
  if (!isAuthenticated) {
      return (
        <div className="container mx-auto px-4 py-8 text-center">
            <p className="mb-4">يرجى تسجيل الدخول لعرض قائمة المفضلة الخاصة بك.</p>
            <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                تسجيل الدخول
            </Link>
        </div>
      )
  }
  if (wishlistItems.length === 0) {
    return <div className="container mx-auto px-4 py-8 text-center"><p>قائمة المفضلة فارغة حالياً.</p></div>;
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-10 text-gray-800 dark:text-white">قائمة المفضلة</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlistItems.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};
export default WishlistPage;