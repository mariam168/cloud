import { useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../components/LanguageContext';
import { Trash2, Plus, Minus, ShoppingCart, Loader2, ImageOff, ArrowRight } from 'lucide-react'; 
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastNotification';

const CartPage = () => {
    const { t, language } = useLanguage(); 
    const navigate = useNavigate();
    const { showToast } = useToast(); 
    const { cartItems, loadingCart, updateCartItemQuantity, cartTotal } = useCart();

    const formatPrice = useCallback((price) => {
        if (price === undefined || price === null) return t('general.priceNotAvailable');
        return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: t('general.currencyCode') }).format(Number(price));
    }, [language, t]);

    const handleQuantityChange = (item, newQuantity) => {
        const numQuantity = Number(newQuantity);
        if (isNaN(numQuantity) || numQuantity < 0) return;
        
        if (item.stock !== undefined && numQuantity > item.stock) {
            showToast(t('cartPage.notEnoughStockForUpdate', { quantity: item.stock }), 'warning');
            updateCartItemQuantity(item.product._id, item.stock, item.selectedVariant);
            return;
        }
        updateCartItemQuantity(item.product._id, numQuantity, item.selectedVariant);
    }; 

    const handleProceedToCheckout = () => navigate('/checkout');
    
    if (loadingCart) {
        return <div className="flex justify-center items-center h-screen"><Loader2 size={48} className="animate-spin text-blue-500" /></div>;
    }

    if (!cartItems || cartItems.length === 0) {
        return (
            <section className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                    <ShoppingCart size={72} className="mx-auto mb-6 text-gray-400 dark:text-gray-500"/>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{t('cartPage.cartEmpty')}</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{t('cartPage.cartEmptyDesc')}</p> 
                    <Link to="/shop" className="inline-flex items-center bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 shadow-md transition-transform hover:-translate-y-0.5">
                        {t('cartPage.continueShopping')} <ArrowRight size={18} className="ml-2" />
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-gray-50 dark:bg-gray-900 py-16 px-4">
            <div className="container mx-auto p-6 md:p-8 max-w-5xl bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-700">
                <h1 className="text-4xl font-bold text-center mb-10 text-gray-800 dark:text-white">{t('cartPage.shoppingCart')}</h1>
                <div className="flex flex-col gap-6">
                    {cartItems.map(item => (
                        <div key={`${item.product._id}-${item.selectedVariant || 'no-variant'}`} className="flex flex-col sm:flex-row items-center p-4 border-b dark:border-gray-700">
                            <Link to={`/shop/${item.product._id}`} className="w-32 h-32 flex-shrink-0 mb-4 sm:mb-0 sm:mr-6 rounded-lg border overflow-hidden bg-gray-100 dark:bg-gray-700">
                                {item.image ? <img src={`http://localhost:5000${item.image}`} alt={item.name} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center"><ImageOff className="text-gray-400"/></div>}
                            </Link>
                            <div className="flex-grow text-center sm:text-left">
                                <Link to={`/shop/${item.product._id}`} className="text-xl font-semibold text-gray-800 dark:text-white hover:text-blue-600">{item.name}</Link>
                                
                                {item.variantDetailsText && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {item.variantDetailsText}
                                    </p>
                                )}
                                
                                <p className="text-xl font-bold text-green-600 mt-2">{formatPrice(item.price)}</p>
                            </div>
                            <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                <div className="flex items-center border rounded-md">
                                    <button onClick={() => handleQuantityChange(item, item.quantity - 1)} className="p-2" disabled={item.quantity <= 1}><Minus size={16} /></button>
                                    <input type="number" value={item.quantity} onChange={(e) => handleQuantityChange(item, e.target.value)} className="w-14 text-center border-x" />
                                    <button onClick={() => handleQuantityChange(item, item.quantity + 1)} className="p-2" disabled={item.stock !== undefined && item.quantity >= item.stock}><Plus size={16} /></button>
                                </div>
                                <button onClick={() => updateCartItemQuantity(item.product._id, 0, item.selectedVariant)} className="p-2 text-red-500 hover:bg-red-50 rounded-full"><Trash2 size={20} /></button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-10 pt-6 border-t dark:border-gray-700 flex justify-end">
                    <div className="w-full md:w-auto min-w-[300px]">
                        <div className="flex justify-between text-lg font-semibold mb-4">
                            <span className="text-gray-600 dark:text-gray-300">{t('cartPage.cartTotal')}:</span>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatPrice(cartTotal)}</span>
                        </div>
                        <button onClick={handleProceedToCheckout} className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-transform hover:scale-105">
                            {t('cartPage.proceedToCheckout')}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CartPage;