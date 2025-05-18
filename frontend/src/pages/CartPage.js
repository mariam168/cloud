import { useCart } from '../context/CartContext'; 
import { useLanguage } from '../components/LanguageContext'; 
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom'; 
const CartPage = () => {
    const { t } = useLanguage(); 
    const navigate = useNavigate();
    const { cartItems, loadingCart, fetchCart, removeFromCart, updateCartItemQuantity } = useCart();
    const calculateTotal = () => {
        if (!Array.isArray(cartItems)) {
            return 0;
        }
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };
    const handleQuantityChange = (productId, quantity) => {
        const numQuantity = Number(quantity);
        if (!isNaN(numQuantity) && Number.isInteger(numQuantity) && numQuantity >= 1) {
            updateCartItemQuantity(productId, numQuantity);
        } else if (quantity === '') {
        }
    };
    const handleIncrementQuantity = (productId, currentQuantity) => {
        updateCartItemQuantity(productId, currentQuantity + 1);
    };
    const handleDecrementQuantity = (productId, currentQuantity) => {
        if (currentQuantity > 1) {
            updateCartItemQuantity(productId, currentQuantity - 1);
        }
    };
    const handleRemoveItem = (productId) => {
        removeFromCart(productId);
    };
    const handleProceedToCheckout = () => {
        if (cartItems.length === 0) {
            alert(t.cartEmptyCheckout || 'Your cart is empty. Add items before checking out.');
            return;
        }
        navigate('/checkout');
    };
    if (loadingCart) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-xl text-gray-700 dark:text-gray-300">
                <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{t.loadingCart || 'Loading cart...'}</span>
            </div>
        );
    }
    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-xl text-gray-700 dark:text-gray-300 p-4 text-center">
                 <ShoppingCart size={48} className="mb-4 text-gray-500 dark:text-gray-400"/>
                <span>{t.cartEmpty || 'Your cart is empty.'}</span>
                 <Link to="/shop" className="mt-4 text-blue-600 hover:underline dark:text-blue-400">
                    {t.continueShopping || 'Continue Shopping'}
                 </Link>
            </div>
        );
    }
    return (
        <div className="container mx-auto p-4 md:p-8 max-w-4xl bg-white dark:bg-slate-900 shadow-2xl rounded-xl my-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
                {t.shoppingCart || 'Shopping Cart'}
            </h1>
            <div className="flex flex-col gap-6">
                {cartItems.map(item => (
                    <div key={item.product} className="flex flex-col sm:flex-row items-center border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0">
                        <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                             <Link to={`/shop/${item.product}`}>
                                <img
                                    src={`http://localhost:5000${item.image}`} 
                                    alt={item.name || 'Product Image'}
                                    className="w-20 h-20 object-cover rounded-md shadow-md"
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/80?text=No+Image' }}
                                />
                             </Link>
                        </div>
                        <div className="flex-grow flex flex-col sm:flex-row justify-between">
                            <div className="flex-grow mb-4 sm:mb-0">
                                <Link to={`/shop/${item.product}`} className="text-lg font-semibold text-gray-800 dark:text-white hover:underline">
                                    {item.name || 'Unnamed Product'}
                                </Link>
                                <p className="text-green-600 dark:text-green-400 font-bold mt-1">
                                    ${item.price?.toFixed(2) || 'N/A'}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                                     <button
                                        onClick={() => handleDecrementQuantity(item.product, item.quantity)}
                                        className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={item.quantity <= 1}
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleQuantityChange(item.product, e.target.value)}
                                        onBlur={(e) => { 
                                            const value = Number(e.target.value);
                                            if (isNaN(value) || !Number.isInteger(value) || value < 1) {
                                                updateCartItemQuantity(item.product, 1);
                                            }
                                        }}
                                        className="w-12 text-center border-none focus:ring-0 bg-transparent text-gray-800 dark:text-white [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0"
                                        min="1"
                                        aria-label="Product quantity"
                                    />
                                    <button
                                        onClick={() => handleIncrementQuantity(item.product, item.quantity)}
                                        className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => handleRemoveItem(item.product)}
                                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-md transition-colors"
                                    aria-label="Remove item from cart"
                                    title={t.removeItem || 'Remove Item'}
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <div className="w-full sm:w-auto">
                    <div className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        {t.cartTotal || 'Cart Total'}: ${calculateTotal().toFixed(2)}
                    </div>
                    <button
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleProceedToCheckout} 
                        disabled={cartItems.length === 0} 
                    >
                         {t.proceedToCheckout || 'Proceed to Checkout'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
