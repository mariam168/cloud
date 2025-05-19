import { useCart } from '../context/CartContext';
import { useLanguage } from '../components/LanguageContext';
import { Trash2, Plus, Minus, ShoppingCart, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
const CartPage = () => {
    const { t, language } = useLanguage(); 
    const navigate = useNavigate();
    const { cartItems, loadingCart, fetchCart, removeFromCart, updateCartItemQuantity } = useCart();
    const calculateTotal = () => {
        if (!Array.isArray(cartItems)) {
            return 0;
        }
        return cartItems.reduce((total, item) => {
            const price = typeof item.price === 'number' ? item.price : 0;
            const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
            return total + (price * quantity);
        }, 0); 
    };
    const handleQuantityChange = (productId, quantity) => {
        const numQuantity = Number(quantity);
        if (!isNaN(numQuantity) && Number.isInteger(numQuantity) && numQuantity >= 1) {
            updateCartItemQuantity(productId, numQuantity);
        } else if (quantity === '') {
        } else {
            console.warn(`Invalid quantity input: ${quantity}`);
        }
    };
    const handleIncrementQuantity = (productId, currentQuantity) => {
        const newQuantity = typeof currentQuantity === 'number' ? currentQuantity + 1 : 1;
        updateCartItemQuantity(productId, newQuantity);
    };
    const handleDecrementQuantity = (productId, currentQuantity) => {
        if (typeof currentQuantity === 'number' && currentQuantity > 1) {
            updateCartItemQuantity(productId, currentQuantity - 1); 
        }
    };
    const handleRemoveItem = (productId) => {
        removeFromCart(productId); 
    };
    const handleProceedToCheckout = () => {
        if (!cartItems || cartItems.length === 0) {
            alert(t('cartPage.cartEmptyCheckout') || 'Your cart is empty. Add items before checking out.');
            return;
        }
        navigate('/checkout');
    };
    if (loadingCart) {
        return (
            <section className="w-full bg-gray-50 dark:bg-gray-900 py-20 px-4 md:px-8 lg:px-12 min-h-[80vh] flex items-center justify-center transition-colors duration-500 ease-in-out">
                <div className="flex flex-col items-center justify-center text-xl font-semibold text-gray-700 dark:text-gray-300">
                    <Loader size={48} className="text-blue-600 dark:text-blue-400 animate-spin mb-4" />
                    <span>{t('general.loading') || 'Loading...'}</span> 
                </div>
            </section>
        );
    }
    if (!cartItems || cartItems.length === 0) {
        return (
            <section className="w-full bg-gray-50 dark:bg-gray-900 py-20 px-4 md:px-8 lg:px-12 min-h-[80vh] flex items-center justify-center transition-colors duration-500 ease-in-out">
                <div className="flex flex-col items-center justify-center text-xl text-gray-700 dark:text-gray-300 p-8 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md mx-auto">
                    <ShoppingCart size={64} className="mb-6 text-gray-500 dark:text-gray-400"/>
                    <span className="text-2xl font-bold mb-4">{t('cartPage.cartEmpty') || 'Your cart is empty.'}</span>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{t('cartPage.cartEmptyDesc') || 'Looks like you haven\'t added anything to your cart yet.'}</p> 
                    <Link to="/shop" className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 transform hover:-translate-y-1">
                        {t('cartPage.continueShopping') || 'Continue Shopping'} 
                    </Link>
                </div>
            </section>
        );
    }
    return (
        <section className="w-full bg-gray-50 dark:bg-gray-900 py-12 px-4 transition-colors duration-500 ease-in-out md:px-8 lg:px-12">
            <div className="container mx-auto p-6 md:p-8 max-w-4xl bg-white dark:bg-gray-800 shadow-lg rounded-xl">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-8 border-b pb-4 border-gray-200 dark:border-gray-700 leading-tight">
                    {t('cartPage.shoppingCart') || 'Shopping Cart'}
                </h1>
                <div className="flex flex-col gap-6">
                    {cartItems.map(item => (
                        <div key={item.product} className="flex flex-col sm:flex-row items-center border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0 last:pb-0">
                            <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                                <Link to={`/shop/${item.product}`} className="block rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <img
                                        src={`http://localhost:5000${item.image}`} 
                                        alt={typeof item.name === 'object' ? (item.name?.[language] || item.name?.en || item.name?.ar) : item.name || t('general.unnamedProduct') || 'Product Image'} 
                                        className="w-24 h-24 object-cover"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/96?text=No+Image' }}
                                    />
                                </Link>
                            </div>
                            <div className="flex-grow flex flex-col sm:flex-row justify-between w-full">
                                <div className="flex-grow mb-4 sm:mb-0 pr-4">
                                    <Link to={`/shop/${item.product}`} className="text-lg font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                                        {item.name?.[language] || (typeof item.name === 'object' ? item.name?.en || item.name?.ar : item.name) || t('general.unnamedProduct') || 'Unnamed Product'} 
                                    </Link>
                                    <p className="text-green-600 dark:text-green-400 font-bold text-xl mt-1">
                                        {t('shopPage.currencySymbol') || '$'}{item.price ? Number(item.price).toFixed(2) : 'N/A'} 
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                                        <button
                                            onClick={() => handleDecrementQuantity(item.product, item.quantity)}
                                            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            disabled={item.quantity <= 1} 
                                            aria-label={t('cartPage.decreaseQuantity') || 'Decrease quantity'} 
                                        >
                                            <Minus size={18} />
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
                                            className="w-14 text-center border-none focus:ring-0 bg-transparent text-gray-800 dark:text-white [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0 text-base font-medium"
                                            min="1" 
                                            aria-label={t('cartPage.productQuantity') || 'Product quantity'} 
                                        />
                                        <button
                                            onClick={() => handleIncrementQuantity(item.product, item.quantity)}
                                            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            aria-label={t('cartPage.increaseQuantity') || 'Increase quantity'}
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveItem(item.product)}
                                        className="p-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        aria-label={t('cartPage.removeItem') || 'Remove Item'} 
                                        title={t('cartPage.removeItem') || 'Remove Item'} 
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-4 mb-4 sm:mb-0 w-full sm:w-auto text-center sm:text-left">
                        <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                             {t('cartPage.cartTotal') || 'Cart Total'}:
                        </div>
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                            {t('shopPage.currencySymbol') || '$'}{calculateTotal().toFixed(2)} 
                        </div>
                    </div>
                    <button
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                        onClick={handleProceedToCheckout}
                        disabled={cartItems.length === 0}
                    >
                        {t('cartPage.proceedToCheckout') || 'Proceed to Checkout'} 
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CartPage;
