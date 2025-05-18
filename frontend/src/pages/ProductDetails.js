import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Plus, Minus, ShoppingCart, Heart, ShieldCheck, Truck, Award } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false); 
    const { addToCart, isInCart, updateCartItemQuantity, cartItems } = useCart();
    const { isAuthenticated } = useAuth();
    useEffect(() => {
        setLoading(true);
        setError(null);
        axios.get(`http://localhost:5000/api/products/${id}`)
            .then(res => {
                if (res.data) {
                    setProduct(res.data);
                    setLoading(false);
                } else {
                    setError('Product data not found.');
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error('Error fetching product:', err);
                if (err.response && err.response.status === 404) {
                    setError('Product not found.');
                } else {
                    setError('Failed to load product. Please check your connection or try again.');
                }
                setLoading(false);
            });
    }, [id]); 
    const handleQuantityChange = (event) => {
        const value = event.target.value;
        setQuantity(value === '' ? '' : parseInt(value, 10));
    };
    const incrementQuantity = () => {
        setQuantity(prev => (typeof prev === 'number' ? prev + 1 : 1));
    };
    const decrementQuantity = () => {
        setQuantity(prev => (typeof prev === 'number' && prev > 1 ? prev - 1 : 1));
    };
    const handleWishlistToggle = () => {
        if (!isAuthenticated) {
             alert('يرجى تسجيل الدخول لإضافة المنتج إلى المفضلة.');
             return;
        }
        setIsWishlisted(prev => !prev);
        console.log(`Wishlist toggled for product ${id}. New state: ${!isWishlisted}`);
    };
    const handleAddToCart = () => {
        if (!product) return; 
        const quantityToAdd = typeof quantity === 'number' && quantity > 0 ? quantity : 1;
        addToCart(product, quantityToAdd);
    };
    const productInCart = product ? isInCart(product._id) : false;
    const cartItem = product ? cartItems.find(item => item.product && item.product.toString() === product._id.toString()) : null;
    const currentCartQuantity = cartItem ? cartItem.quantity : 0;
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-xl text-gray-700 dark:text-gray-300">
                <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading product details...</span>
            </div>
        );
    }
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-xl text-red-600 dark:text-red-400 p-4 text-center">
                Error: {error}
            </div>
        );
    }
    if (!product) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-xl text-gray-700 dark:text-gray-300">
                Product data is missing.
            </div>
        );
    }
    const displayQuantity = typeof quantity === 'number' && quantity > 0 ? quantity : '';
    return (
        <div className="container mx-auto p-4 md:p-8 max-w-7xl bg-white dark:bg-slate-900 shadow-2xl rounded-xl my-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                <div className="lg:col-span-2 flex flex-col items-center">
                    <div className="w-full max-w-md md:max-w-lg lg:max-w-full p-4 bg-gray-100 dark:bg-slate-800 rounded-xl shadow-inner flex items-center justify-center overflow-hidden">
                        {product.image ? (
                            <img
                                src={`http://localhost:5000${product.image}`}
                                alt={product.name || 'Product Image'}
                                className="w-full h-auto max-h-[500px] object-contain rounded-lg transition-transform duration-300 ease-in-out hover:scale-105"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/500?text=Image+Not+Available' }}
                            />
                        ) : (
                            <div className="w-full h-[500px] flex items-center justify-center text-gray-500 dark:text-gray-400 text-lg">
                                No Image Available
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
                            {product.category || 'Uncategorized'}
                        </p>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                            {product.name || 'Unnamed Product'}
                        </h1>
                    </div>
                    <div className="flex items-baseline gap-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-3xl md:text-4xl font-extrabold text-green-600 dark:text-green-400">
                            ${product.price?.toFixed(2) || 'N/A'}
                        </p>
                    </div>
                    <div className="flex flex-col gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</h3>
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
                                aria-label={`Add ${typeof quantity === 'number' && quantity > 0 ? quantity : 1} of ${product.name} to cart`}
                            >
                                <ShoppingCart size={20} className="inline-block mr-2" />
                                Add to Cart ({typeof quantity === 'number' && quantity > 0 ? quantity : 1}) 
                            </button>
                            <button
                                className={`p-3 rounded-lg shadow-md transition-colors duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-pink-300 dark:focus:ring-pink-700
                                    ${isWishlisted
                                        ? 'bg-pink-500 hover:bg-pink-600 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-300'
                                    }
                                `}
                                onClick={handleWishlistToggle}
                                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                            >
                                <Heart size={24} fill={isWishlisted ? 'white' : 'none'} stroke={isWishlisted ? 'white' : 'currentColor'} />
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-around items-center text-gray-600 dark:text-gray-400 text-xs mt-4">
                        <div className="flex flex-col items-center text-center">
                            <ShieldCheck size={24} /> <span>Secure Payment</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <Truck size={24} /> <span>Fast Shipping</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <Award size={24} /> <span>Quality Guarantee</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Product Description</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {product.description || 'No detailed description available for this product.'}
                </p>
            </div>
        </div>
    );
};

export default ProductDetails;
