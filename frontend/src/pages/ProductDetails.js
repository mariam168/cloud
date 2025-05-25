import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Minus, ShoppingCart, Heart, ShieldCheck, Truck, Award, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../components/LanguageContext';
import { useWishlist } from '../context/WishlistContext';

const ProductDetails = () => {
    const { id } = useParams();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const { API_BASE_URL, isAuthenticated } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const { addToCart, isInCart, loadingCart } = useCart();
    const { toggleFavorite, isFavorite, loadingWishlist } = useWishlist();

    const formatPrice = useCallback((price) => {
        if (price === undefined || price === null) return t('general.notApplicable') || 'N/A';
        try {
            const currencyCode = t('shopPage.currencyCode') || 'SAR';
            if (!/^[A-Z]{3}$/.test(currencyCode)) {
                console.warn(`Invalid currency code from translation: "${currencyCode}". Falling back to SAR.`);
                return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'SAR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(price));
            }
            return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(Number(price));
        } catch (e) {
            console.error("Error formatting currency in ProductDetails:", e);
            return `${t('shopPage.currencySymbol') || '$'}${Number(price).toFixed(2)}`;
        }
    }, [language, t]);

    const fetchProductDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/products/${id}`);
            if (res.data) {
                setProduct(res.data);
                setQuantity(1);
            } else {
                setError(t('productDetailsPage.productDataNotFound') || 'Product data not found.');
            }
        } catch (err) {
            console.error('Error fetching product:', err.response ? err.response.data : err.message);
            if (err.response && err.response.status === 404) {
                setError(t('productDetailsPage.notFound') || 'Product not found.');
            } else {
                setError(t('productDetailsPage.failedToLoad') || 'Failed to load product. Please check your connection or try again.');
            }
        } finally {
            setLoading(false);
        }
    }, [id, API_BASE_URL, t]);

    useEffect(() => {
        fetchProductDetails();
    }, [fetchProductDetails]);

    const handleQuantityChange = (event) => {
        const value = event.target.value;
        setQuantity(value === '' ? '' : Math.max(1, parseInt(value, 10)));
    };

    const incrementQuantity = () => {
        setQuantity(prev => (typeof prev === 'number' ? prev + 1 : 1));
    };

    const decrementQuantity = () => {
        setQuantity(prev => (typeof prev === 'number' && prev > 1 ? prev - 1 : 1));
    };

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            alert(t('cart.loginRequired') || 'Please log in to add products to your cart.');
            navigate('/login');
            return;
        }
        if (!product) return;
        const quantityToAdd = typeof quantity === 'number' && quantity > 0 ? quantity : 1;
        addToCart(product, quantityToAdd);
    };

    const handleToggleFavorite = () => {
        if (!isAuthenticated) {
            alert(t('wishlist.loginRequired') || 'Please log in to add to favorites.');
            navigate('/login');
            return;
        }
        if (!product) return;
        toggleFavorite(product);
    };

    const productIsFavorite = product ? isFavorite(product._id) : false;
    const productInCart = product ? isInCart(product._id) : false;

    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = '/images/placeholder-product-image.png';
        e.target.alt = t('general.imageFailedToLoad') || "Image failed to load";
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-xl text-gray-700 dark:text-gray-300">
                <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-4" />
                <span>{t('general.loading') || 'Loading...'}</span>
            </div>
        );
    }
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-xl text-red-600 dark:text-red-400 p-4 text-center">
                {t('general.error') || 'Error'}: {error}
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-xl text-gray-700 dark:text-gray-300">
                {t('productDetailsPage.productDataMissing') || 'Product data is missing.'}
            </div>
        );
    }
    const displayQuantity = typeof quantity === 'number' && quantity > 0 ? quantity : '';
    const productName = product.name?.[language] || product.name?.en || product.name?.ar || t('general.unnamedProduct');
    const productDescription = product.description?.[language] || product.description?.en || product.description?.ar || t('adminProduct.noDescription');
    const productCategory = product.category?.name?.[language] || product.category?.name?.en || product.category?.name?.ar || product.category || t('adminProduct.uncategorized');

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-7xl bg-white dark:bg-slate-900 shadow-2xl rounded-xl my-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                <div className="lg:col-span-2 flex flex-col items-center">
                    <div className="w-full max-w-md md:max-w-lg lg:max-w-full p-4 bg-gray-100 dark:bg-slate-800 rounded-xl shadow-inner flex items-center justify-center overflow-hidden">
                        {product.image ? (
                            <img
                                src={`${API_BASE_URL}${product.image}`}
                                alt={productName}
                                className="w-full h-auto max-h-[500px] object-contain rounded-lg transition-transform duration-300 ease-in-out hover:scale-105"
                                onError={handleImageError}
                            />
                        ) : (
                            <div className="w-full h-[500px] flex items-center justify-center text-gray-500 dark:text-gray-400 text-lg">
                                {t('general.noImageAvailable') || 'No Image Available'}
                            </div>
                        )}
                    </div>
                    <div className="mt-6 w-full max-w-md md:max-w-lg lg:max-w-full">
                        <h3 className="sr-only">Product Images</h3>
                        <div className="flex space-x-4 overflow-x-auto pb-2">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`flex-shrink-0 w-20 h-20 bg-gray-200 dark:bg-slate-700 rounded-md flex items-center justify-center cursor-pointer ring-2 ring-transparent hover:ring-blue-500 transition-all ${i === 0 ? 'ring-blue-500' : ''}`}
                                    onClick={() => console.log('Thumbnail clicked:', i)}
                                    title={`View Image ${i + 1}`}
                                >
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Thumb {i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div>
                        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase mb-1">
                            {productCategory}
                        </p>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                            {productName}
                        </h1>
                    </div>
                    <div className="flex items-baseline gap-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-3xl md:text-4xl font-extrabold text-green-600 dark:text-green-400">
                            {formatPrice(product.price)}
                        </p>
                    </div>
                    <div className="flex flex-col gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('productDetailsPage.quantity') || 'Quantity'}</h3>
                            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md w-32 overflow-hidden">
                                <button
                                    onClick={decrementQuantity}
                                    className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={typeof quantity !== 'number' || quantity <= 1}
                                    aria-label="Decrease quantity"
                                >
                                    <Minus size={18} />
                                </button>
                                <input
                                    type="number"
                                    value={displayQuantity}
                                    onChange={handleQuantityChange}
                                    onBlur={() => {
                                        if (typeof quantity !== 'number' || quantity < 1) {
                                            setQuantity(1);
                                        }
                                    }}
                                    className="w-12 text-center border-none focus:ring-0 bg-transparent text-gray-800 dark:text-white [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0"
                                    min="1"
                                    step="1"
                                    aria-label="Product quantity"
                                />
                                <button
                                    onClick={incrementQuantity}
                                    className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                    aria-label="Increase quantity"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 mt-4">
                            <button
                                className="flex-1 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-700"
                                onClick={handleAddToCart}
                                aria-label={`Add ${typeof quantity === 'number' && quantity > 0 ? quantity : 1} of ${productName} to cart`}
                            >
                                <ShoppingCart size={20} className="inline-block mr-2" />
                                {t('shopPage.addToCart') || 'Add to Cart'} ({typeof quantity === 'number' && quantity > 0 ? quantity : 1})
                            </button>
                            <button
                                className={`p-3 rounded-lg shadow-md transition-colors duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-pink-300 dark:focus:ring-pink-700
                                     ${productIsFavorite
                                        ? 'bg-red-500 hover:bg-red-600'
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-300'
                                    }
                                `}
                                onClick={handleToggleFavorite}
                                aria-label={productIsFavorite ? (t('shopPage.removeFromFavorites') || 'Remove from favorites') : (t('shopPage.addToFavorites') || 'Add to favorites')}
                                title={productIsFavorite ? (t('shopPage.removeFromFavorites') || 'Remove from Favorites') : (t('shopPage.addToFavorites') || 'Add to Favorites')}
                            >
                                <Heart size={24} fill={productIsFavorite ? 'white' : 'none'} />
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-around items-center text-gray-600 dark:text-gray-400 text-xs mt-4">
                        <div className="flex flex-col items-center text-center">
                            <ShieldCheck size={24} />
                            <span>{t('productDetailsPage.securePayment') || 'Secure Payment'}</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <Truck size={24} />
                            <span>{t('productDetailsPage.fastShipping') || 'Fast Shipping'}</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <Award size={24} />
                            <span>{t('productDetailsPage.qualityGuarantee') || 'Quality Guarantee'}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t('productDetailsPage.productDescription') || 'Product Description'}</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {productDescription}
                </p>
            </div>
        </div>
    );
};

export default ProductDetails;