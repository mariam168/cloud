import { useState, useCallback, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../components/LanguageContext';
import { Trash2, Plus, Minus, ShoppingCart, Loader2, ImageOff, ArrowRight } from 'lucide-react'; 
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastNotification';

const CartPage = () => {
    const { t, language } = useLanguage(); 
    const navigate = useNavigate();
    const { showToast } = useToast(); 
    const { 
        cartItems, 
        loadingCart, 
        removeFromCart, 
        updateCartItemQuantity,
        cartTotal 
    } = useCart();

    const formatPrice = useCallback((price) => {
        if (price === undefined || price === null) return t('general.priceNotAvailable');
        try {
            const currencyCode = t('general.currencyCode');
            return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(Number(price));
        } catch (e) {
            console.error("Error formatting currency in CartPage:", e);
            return `${t('general.currencySymbol')}${Number(price).toFixed(2)}`;
        }
    }, [language, t]);

    const handleQuantityChange = useCallback((productId, selectedVariantId, quantity, currentStock) => {
        const numQuantity = Number(quantity);
        if (isNaN(numQuantity) || !Number.isInteger(numQuantity) || numQuantity < 1) {
            const currentItem = cartItems.find(item => 
                item.product && String(item.product._id) === String(productId) && // استخدام String() للمقارنة الآمنة
                (item.selectedVariant ? String(item.selectedVariant) === String(selectedVariantId) : !selectedVariantId)
            );
            const validQuantity = (currentItem && currentItem.quantity) ? currentItem.quantity : 1;
            updateCartItemQuantity(productId, validQuantity, selectedVariantId);
            showToast(t('cartPage.quantityInvalid') || 'الكمية يجب أن تكون عدداً صحيحاً موجباً.', 'warning');
            return;
        }

        if (currentStock !== undefined && numQuantity > currentStock) {
            showToast(t('cartPage.notEnoughStockForUpdate', { quantity: currentStock }) || `لا يوجد مخزون كافٍ. المتوفر: ${currentStock}.`, 'warning');
            const currentItem = cartItems.find(item => 
                item.product && String(item.product._id) === String(productId) &&
                (item.selectedVariant ? String(item.selectedVariant) === String(selectedVariantId) : !selectedVariantId)
            );
            const validQuantity = (currentItem && currentItem.quantity) ? currentItem.quantity : 1;
            updateCartItemQuantity(productId, Math.min(numQuantity, currentStock, validQuantity), selectedVariantId);
            return;
        }

        updateCartItemQuantity(productId, numQuantity, selectedVariantId);
    }, [updateCartItemQuantity, cartItems, showToast, t]); 

    const handleIncrementQuantity = useCallback((productId, selectedVariantId, currentQuantity, currentStock) => {
        const newQuantity = typeof currentQuantity === 'number' ? currentQuantity + 1 : 1;
        if (currentStock !== undefined && newQuantity > currentStock) {
            showToast(t('cartPage.notEnoughStockForIncrement', { quantity: currentStock }) || `لا يمكنك زيادة الكمية أكثر من المخزون المتاح: ${currentStock}.`, 'warning');
            return;
        }
        updateCartItemQuantity(productId, newQuantity, selectedVariantId);
    }, [updateCartItemQuantity, showToast, t]);

    const handleDecrementQuantity = useCallback((productId, selectedVariantId, currentQuantity) => {
        if (typeof currentQuantity === 'number' && currentQuantity > 1) {
            updateCartItemQuantity(productId, currentQuantity - 1, selectedVariantId); 
        }
    }, [updateCartItemQuantity]);

    const handleRemoveItem = useCallback((productId, selectedVariantId) => {
        removeFromCart(productId, selectedVariantId); 
    }, [removeFromCart]);

    const handleProceedToCheckout = useCallback(() => {
        // **هنا هو المكان الحاسم للتأكد من تنظيف عناصر السلة قبل الإرسال**
        const cleanedCartItemsForCheckout = cartItems.filter(item => {
            if (!item.product) {
                console.warn("Skipping checkout for a cart item with null product:", item);
                showToast(t('cartPage.removedCorruptedItem') || 'تمت إزالة بعض المنتجات الفاسدة من سلتك.', 'warning');
                return false; // لا ترسل هذا العنصر
            }
            return true;
        });

        if (!cleanedCartItemsForCheckout || cleanedCartItemsForCheckout.length === 0) {
            showToast(t('cartPage.cartEmptyCheckout') || 'سلتك فارغة لا يمكن المتابعة إلى الدفع.', 'info');
            return;
        }
        
        // هنا يمكنك إرسال cleanedCartItemsForCheckout إلى صفحة الدفع
        // أو استخدامها في الطلب الذي سيُرسل إلى الـ backend لإنشاء الطلب
        // مثلاً: navigate('/checkout', { state: { orderItems: cleanedCartItemsForCheckout } });
        // ولكن بما أن CheckoutPage ستجلب السلة من Context، هذا التنظيف سيحدث تلقائياً.
        // فقط تأكد أن صفحة CheckoutPage تستخدم `useCart().cartItems` المحدثة.

        navigate('/checkout'); // أو مسار صفحة الدفع
    }, [cartItems, navigate, t, showToast]);

    const handleImageError = useCallback((e) => {
        e.target.onerror = null;
        e.target.src = '/images/placeholder-product-image.png'; 
        e.target.alt = t('general.imageFailedToLoad');
    }, [t]);

    if (loadingCart) {
        return (
            <section className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-20 px-4 transition-colors duration-500 ease-in-out">
                <div className="flex flex-col items-center justify-center text-xl font-semibold text-gray-700 dark:text-gray-300">
                    <Loader2 size={64} className="text-blue-600 dark:text-blue-400 animate-spin mb-4" />
                    <span className="text-2xl">{t('general.loading')}</span> 
                </div>
            </section>
        );
    }

    if (!cartItems || cartItems.length === 0) {
        return (
            <section className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-20 px-4 transition-colors duration-500 ease-in-out">
                <div className="flex flex-col items-center justify-center text-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md mx-auto border border-gray-200 dark:border-gray-700 animate-fade-in-down">
                    <ShoppingCart size={72} className="mb-6 text-gray-400 dark:text-gray-500"/>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{t('cartPage.cartEmpty')}</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">{t('cartPage.cartEmptyDesc')}</p> 
                    <Link to="/shop" className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        {t('cartPage.continueShopping')}
                        <ArrowRight size={18} className={`${language === 'ar' ? 'mr-2' : 'ml-2'}`} />
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full bg-gray-50 dark:bg-gray-950 py-16 px-4 transition-colors duration-500 ease-in-out md:px-8 lg:px-12 font-sans">
            <div className="container mx-auto p-6 md:p-8 max-w-5xl bg-white dark:bg-gray-800 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-10 text-center border-b border-blue-500 dark:border-blue-400 pb-4 inline-block mx-auto leading-tight">
                    {t('cartPage.shoppingCart')}
                </h1>

                <div className="flex flex-col gap-6">
                    {/* Iterating over cart items */}
                    {cartItems.map(item => {
                        if (!item.product) {
                            console.warn("Cart item found with missing product data, skipping render:", item);
                            return null;
                        }

                        const itemStock = item.variantDetails?.stock;
                        const isOutOfStock = itemStock !== undefined && itemStock <= 0;
                        const isQuantityExceedingStock = itemStock !== undefined && item.quantity > itemStock;

                        return (
                            <div 
                                key={`${item.product._id}-${item.selectedVariant || 'no-variant'}`} 
                                className="flex flex-col sm:flex-row items-center bg-white dark:bg-gray-700 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-600 transition-all duration-200 ease-in-out hover:shadow-md"
                            >
                                <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6 w-28 h-28">
                                    <Link to={`/shop/${item.product._id}`} className="block rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 transform hover:scale-103 transition-transform duration-200">
                                        {item.image ? (
                                            <img
                                                src={`http://localhost:5000${item.image}`} 
                                                alt={typeof item.name === 'object' ? (item.name?.[language] || item.name?.en || item.name?.ar) : item.name || t('general.unnamedProduct')} 
                                                className="w-full h-full object-cover"
                                                onError={handleImageError}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 text-xs bg-gray-200 dark:bg-gray-600">
                                                <ImageOff size={32} className="mb-1" />
                                                {t('general.noImageAvailable')}
                                            </div>
                                        )}
                                    </Link>
                                </div>
                                <div className="flex-grow flex flex-col sm:flex-row justify-between w-full">
                                    <div className="flex-grow mb-4 sm:mb-0 sm:pr-6 text-center sm:text-start">
                                        <Link to={`/shop/${item.product._id}`} className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                                            {item.name?.[language] || (typeof item.name === 'object' ? item.name?.en || item.name?.ar : item.name) || t('general.unnamedProduct')} 
                                        </Link>
                                        {item.variantDetails && item.variantDetails.options && item.variantDetails.options.length > 0 && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                                ({item.variantDetails.options.map(opt => `${opt.optionName}: ${opt.optionValue}`).join(', ')})
                                            </p>
                                        )}
                                        <p className="text-green-600 dark:text-green-400 font-bold text-xl md:text-2xl mt-1">
                                            {formatPrice(item.price)} 
                                        </p>
                                        {itemStock !== undefined && (
                                            <p className={`text-sm mt-1 ${isOutOfStock || isQuantityExceedingStock ? 'text-red-500' : 'text-green-500'}`}>
                                                {t('cartPage.stockStatus')}: {isOutOfStock ? t('cartPage.outOfStock') : `${itemStock} ${t('cartPage.inStock')}`}
                                                {isQuantityExceedingStock && !isOutOfStock && ` (${t('cartPage.yourQuantityExceedsStock')})`}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-700 shadow-xs">
                                            <button
                                                onClick={() => handleDecrementQuantity(item.product._id, item.selectedVariant, item.quantity)}
                                                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-blue-400"
                                                disabled={item.quantity <= 1} 
                                                aria-label={t('general.decreaseQuantity')} 
                                            >
                                                <Minus size={18} />
                                            </button>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item.product._id, item.selectedVariant, e.target.value, itemStock)}
                                                onBlur={(e) => {
                                                    const value = Number(e.target.value);
                                                    if (isNaN(value) || !Number.isInteger(value) || value < 1) {
                                                        const currentItem = cartItems.find(cartItem => cartItem.product && String(cartItem.product._id) === String(item.product._id) && (cartItem.selectedVariant ? String(cartItem.selectedVariant) === String(item.selectedVariant) : !item.selectedVariant));
                                                        const validQuantity = (currentItem && currentItem.quantity) ? currentItem.quantity : 1;
                                                        updateCartItemQuantity(item.product._id, validQuantity, item.selectedVariant);
                                                    } else if (itemStock !== undefined && value > itemStock) {
                                                        updateCartItemQuantity(item.product._id, itemStock, item.selectedVariant); 
                                                    }
                                                }}
                                                className="w-14 text-center border-x border-gray-300 dark:border-gray-600 focus:ring-0 bg-transparent text-gray-800 dark:text-white [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0 text-base font-medium"
                                                min="1" 
                                                aria-label={t('general.productQuantity')} 
                                            />
                                            <button
                                                onClick={() => handleIncrementQuantity(item.product._id, item.selectedVariant, item.quantity, itemStock)}
                                                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                                aria-label={t('general.increaseQuantity')}
                                                disabled={itemStock !== undefined && item.quantity >= itemStock}
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveItem(item.product._id, item.selectedVariant)}
                                            className="p-2 rounded-full text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-red-400 transform hover:scale-110"
                                            aria-label={t('cartPage.removeItem')} 
                                            title={t('cartPage.removeItem')} 
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 w-full md:w-auto text-center md:text-left shadow-sm border border-gray-100 dark:border-gray-600">
                        <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                             {t('cartPage.cartTotal')}:
                        </div>
                        <div className="text-3xl font-bold text-blue-700 dark:text-blue-400 mt-1">
                            {formatPrice(cartTotal)} 
                        </div>
                    </div>
                    <button
                        className="w-full md:w-auto flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 px-8 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                        onClick={handleProceedToCheckout}
                        disabled={cartItems.length === 0}
                    >
                        {t('cartPage.proceedToCheckout')}
                        <ArrowRight size={20} className={`${language === 'ar' ? 'mr-2' : 'ml-2'}`} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CartPage;