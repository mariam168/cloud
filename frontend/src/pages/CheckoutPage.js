import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { ShoppingCart, Loader2, CheckCircle, Tag, Package, CreditCard, MapPin, ArrowRight, XCircle } from 'lucide-react'; // Added XCircle for error
import { useCart } from '../context/CartContext';
import { useToast } from '../components/ToastNotification'; // <--- استيراد useToast

const CheckoutPage = () => {
    const { t, language } = useLanguage();
    const { showToast } = useToast(); // <--- استخدام useToast
    const navigate = useNavigate();
    const { 
        cartItems, 
        loadingCart, 
        clearCart,
        cartTotal // تأكد أن cartTotal متاح من CartContext
    } = useCart();
    const { isAuthenticated, token, API_BASE_URL = 'http://localhost:5000' } = useAuth();

    const [shippingAddress, setShippingAddress] = useState({
        address: '123 Main St',
        city: 'Cairo',
        postalCode: '11511',
        country: 'Egypt',
    });
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
    const [placingOrder, setPlacingOrder] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false); // لحالة عرض رسالة النجاح في الواجهة الأمامية

    // --- Discount State and Logic ---
    const [discountCode, setDiscountCode] = useState('');
    const [availableDiscounts, setAvailableDiscounts] = useState([]);
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    // setDiscountMessage سيظل موجودًا إذا كنت تستخدمه لرسائل داخلية في الواجهة (مثل تحت حقل الخصم)
    // ولكني سأركز على showToast للرسائل العامة.
    const [discountMessage, setDiscountMessage] = useState(''); 

    // Format price function for consistent display
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
            console.error("Error formatting currency in CheckoutPage:", e);
            return `${t('general.currencySymbol')}${Number(price).toFixed(2)}`;
        }
    }, [language, t]);

    // Fetch active discounts on component mount
    useEffect(() => {
        const fetchActiveDiscounts = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/discounts/active`);
                setAvailableDiscounts(response.data);
            } catch (error) {
                console.error("Error fetching active discounts:", error);
                // Optionally show a toast for this if it's critical
                // showToast(t('checkoutPage.errorFetchingDiscounts') || 'فشل في جلب الخصومات المتاحة.', 'error');
            }
        };
        fetchActiveDiscounts();
    }, [API_BASE_URL]);

    // Calculate subtotal (before discount, tax, shipping)
    const calculateSubtotal = useCallback(() => {
        if (!Array.isArray(cartItems)) {
            return 0;
        }
        return cartItems.reduce((total, item) => {
            const price = typeof item.price === 'number' ? item.price : 0;
            const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
            return total + (price * quantity);
        }, 0);
    }, [cartItems]);

    // Calculate discount amount
    const calculateDiscountAmount = useCallback(() => {
        if (!appliedDiscount) {
            return 0;
        }

        const currentSubtotal = calculateSubtotal();

        // Invalidate discount if min order is no longer met
        if (currentSubtotal < appliedDiscount.minOrderAmount) {
            setAppliedDiscount(null);
            showToast(t('checkoutPage.minOrderNotMet', { amount: formatPrice(appliedDiscount.minOrderAmount) }) || `الخصم غير ساري: يجب أن يكون إجمالي الطلب ${formatPrice(appliedDiscount.minOrderAmount)} على الأقل.`, 'warning');
            setDiscountMessage(t('checkoutPage.minOrderNotMet', { amount: formatPrice(appliedDiscount.minOrderAmount) })); // For inline feedback
            return 0;
        }

        let discountValue = 0;
        if (appliedDiscount.percentage) {
            discountValue = currentSubtotal * (appliedDiscount.percentage / 100);
        } else if (appliedDiscount.fixedAmount) {
            discountValue = appliedDiscount.fixedAmount;
        }

        // Apply maximum discount amount if defined
        if (appliedDiscount.maxDiscountAmount && discountValue > appliedDiscount.maxDiscountAmount) {
            discountValue = appliedDiscount.maxDiscountAmount;
        }

        return discountValue;
    }, [appliedDiscount, calculateSubtotal, t, formatPrice, showToast]);

    // Calculate final total (subtotal - discount + tax + shipping)
    const calculateFinalTotal = useCallback(() => {
        const subtotal = calculateSubtotal();
        const discountAmount = calculateDiscountAmount();
        const taxPrice = 0; // Assuming 0 for now
        const shippingPrice = 0; // Assuming 0 for now (يمكنك إضافة منطق الشحن هنا)

        return subtotal - discountAmount + taxPrice + shippingPrice;
    }, [calculateSubtotal, calculateDiscountAmount]);

    // Re-evaluate discount if cart items change (important for dynamic pricing)
    useEffect(() => {
        if (appliedDiscount) {
            calculateDiscountAmount(); // This will trigger calculateDiscountAmount and potentially invalidate the discount
        }
    }, [cartItems, appliedDiscount, calculateDiscountAmount]);


    const handleApplyDiscount = useCallback(() => {
        setDiscountMessage(''); // Clear previous inline message
        setAppliedDiscount(null); // Clear previously applied discount

        if (!discountCode.trim()) {
            showToast(t('checkoutPage.enterDiscountCodePlaceholder') || 'الرجاء إدخال رمز الخصم.', 'warning');
            return;
        }

        const codeToApply = discountCode.trim().toUpperCase();
        const foundDiscount = availableDiscounts.find(
            (d) => d.code === codeToApply &&
                   new Date(d.startDate) <= new Date() &&
                   new Date(d.endDate) >= new Date() &&
                   d.isActive
        );

        if (!foundDiscount) {
            showToast(t('checkoutPage.invalidOrExpiredDiscount') || 'رمز الخصم غير صالح أو منتهي الصلاحية.', 'error');
            return;
        }

        const currentSubtotal = calculateSubtotal();
        if (currentSubtotal < foundDiscount.minOrderAmount) {
            showToast(t('checkoutPage.minOrderNotMet', { amount: formatPrice(foundDiscount.minOrderAmount) }) || `الخصم يتطلب إجمالي طلب ${formatPrice(foundDiscount.minOrderAmount)} على الأقل.`, 'warning');
            setDiscountMessage(t('checkoutPage.minOrderNotMet', { amount: formatPrice(foundDiscount.minOrderAmount) })); // For inline feedback
            return;
        }

        setAppliedDiscount(foundDiscount);
        showToast(t('checkoutPage.discountAppliedSuccessfully') || 'تم تطبيق الخصم بنجاح!', 'success');
        setDiscountMessage(t('checkoutPage.discountAppliedSuccessfully')); // For inline feedback
    }, [discountCode, availableDiscounts, calculateSubtotal, formatPrice, t, showToast]);

    const handleRemoveDiscount = useCallback(() => {
        setAppliedDiscount(null);
        setDiscountCode('');
        setDiscountMessage(t('checkoutPage.discountRemoved') || 'تمت إزالة الخصم.');
        showToast(t('checkoutPage.discountRemoved') || 'تمت إزالة الخصم.', 'info');
    }, [t, showToast]);


    const handlePlaceOrder = useCallback(async () => {
        setPlacingOrder(true); // بدء عملية وضع الطلب

        if (!isAuthenticated) {
            showToast(t('checkoutPage.pleaseLoginToCheckout') || 'يرجى تسجيل الدخول للمتابعة إلى الدفع.', 'info');
            navigate('/login');
            setPlacingOrder(false);
            return;
        }

        if (!cartItems || cartItems.length === 0) {
            showToast(t('cartPage.cartEmptyCheckout') || 'سلتك فارغة لا يمكن المتابعة إلى الدفع.', 'warning');
            setPlacingOrder(false);
            return;
        }

        // **التحقق من صحة بيانات الشحن والدفع**
        if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.country || !shippingAddress.postalCode || !paymentMethod) {
            showToast(t('checkoutPage.shippingPaymentRequired') || 'الرجاء إدخال عنوان الشحن وطريقة الدفع.', 'warning');
            setPlacingOrder(false);
            return;
        }

        // **التحقق الحاسم: فلترة وتجهيز orderItems**
        const orderItemsToSend = [];
        let hasProblematicItems = false; // لتتبع إذا كان هناك أي مشكلة في عناصر السلة

        for (const item of cartItems) {
            // التحقق من أن المنتج موجود (لم يتم حذفه من DB بعد Populate)
            if (!item.product || !item.product._id) { // item.product هنا هو الكائن المحمل
                console.warn("Skipping checkout for a cart item with missing/corrupted product data:", item);
                showToast(t('checkoutPage.removedCorruptedItem') || 'تمت إزالة بعض المنتجات المعطوبة من سلتك. يرجى المراجعة.', 'warning');
                hasProblematicItems = true;
                continue; // تخطي هذا العنصر غير الصالح
            }

            // التحقق من الـ variant للمنتجات التي تتطلب ذلك
            // item.product.variations هنا تشير إلى variations المنتج الأصلي (المحمل)
            if (item.product.variations && item.product.variations.length > 0 && !item.selectedVariant) {
                showToast(
                    t('checkoutPage.variantRequiredError', { productName: item.name?.[language] || item.name?.en || item.name?.ar }) || 
                    `المنتج "${item.name?.[language] || item.name?.en}" يتطلب تحديد خيار (لون/مقاس).`, 
                    'error'
                );
                setPlacingOrder(false);
                return; // إيقاف العملية إذا كان هناك منتج يتطلب variant ولم يتم اختياره
            }
            
            // التحقق من المخزون في الواجهة الأمامية كطبقة أولى
            // item.variantDetails.stock هو المخزون الذي تم تسجيله في السلة وقت الإضافة
            const currentItemStock = item.variantDetails?.stock; 
            if (currentItemStock !== undefined && item.quantity > currentItemStock) {
                showToast(
                    t('checkoutPage.notEnoughStockForProduct', { productName: item.name?.[language] || item.name?.en || item.name?.ar, availableStock: currentItemStock }) ||
                    `لا يوجد مخزون كافٍ للمنتج "${item.name?.[language] || item.name?.en}". المتوفر: ${currentItemStock}.`,
                    'error'
                );
                setPlacingOrder(false);
                return; // إيقاف العملية
            }

            // إضافة العنصر إلى قائمة الطلبات بعد التحقق
            orderItemsToSend.push({
                // نرسل _id الخاص بالمنتج (من الكائن المحمل)
                product: item.product._id, 
                name: item.name,
                quantity: item.quantity,
                image: item.image, // الصورة التي كانت معروضة في السلة (variant أو رئيسية)
                price: item.price, // السعر النهائي (شامل تعديل الـ variant)
                selectedVariant: item.selectedVariant, // ID الـ variant (قد يكون null لمنتجات غير متنوعة)
                variantDetails: item.variantDetails // تفاصيل الـ variant كـ snapshot
            });
        }

        // إذا كان هناك أي عناصر بها مشاكل وتم تخطيها، ننبه المستخدم ونوقف العملية
        if (hasProblematicItems && orderItemsToSend.length === 0) {
            showToast(t('checkoutPage.noValidItemsAfterCleanup') || 'لا توجد منتجات صالحة في سلتك بعد التنظيف.', 'error');
            setPlacingOrder(false);
            return;
        }

        if (orderItemsToSend.length === 0) {
            showToast(t('cartPage.cartEmptyCheckout') || 'سلتك فارغة لا يمكن المتابعة إلى الدفع.', 'warning');
            setPlacingOrder(false);
            return;
        }

        // Final check for discount validity before placing order
        // هذا التحقق مهم لأن المخزون أو السعر الإجمالي قد يتغير بعد تطبيق الخصم
        if (appliedDiscount) {
            const currentSubtotal = calculateSubtotal();
            if (currentSubtotal < appliedDiscount.minOrderAmount) {
                showToast(t('checkoutPage.discountInvalidOrder') || 'الخصم غير صالح لهذا الطلب. يرجى مراجعة شروط الخصم.', 'warning');
                setAppliedDiscount(null); // إزالة الخصم المطبق
                setDiscountCode('');
                setDiscountMessage(t('checkoutPage.discountInvalidated') || 'تم إلغاء الخصم المطبق.');
                setPlacingOrder(false);
                return;
            }
        }

        try {
            const orderData = {
                orderItems: orderItemsToSend,
                shippingAddress: shippingAddress,
                paymentMethod: paymentMethod,
                taxPrice: 0, 
                shippingPrice: 0, 
                discount: appliedDiscount ? {
                    code: appliedDiscount.code,
                    percentage: appliedDiscount.percentage,
                    fixedAmount: appliedDiscount.fixedAmount,
                    minOrderAmount: appliedDiscount.minOrderAmount,
                    maxDiscountAmount: appliedDiscount.maxDiscountAmount,
                    discountAmount: calculateDiscountAmount()
                } : undefined, // إرسال تفاصيل الخصم المطبق
                totalPrice: calculateFinalTotal(),
            };

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };

            const response = await axios.post(`${API_BASE_URL}/api/orders`, orderData, config);
            
            setOrderSuccess(true); // لتشغيل عرض رسالة النجاح في الواجهة
            clearCart(); // مسح السلة في الـ frontend (سيتم مسحها في الـ backend أيضاً)
            setAppliedDiscount(null);
            setDiscountCode('');
            setDiscountMessage('');

            showToast(t('checkoutPage.orderPlacedSuccess', { orderId: response.data._id }) || `تم تأكيد طلبك بنجاح! رقم الطلب: ${response.data._id}`, 'success');
            
            setTimeout(() => {
                navigate(`/orders/${response.data._id}`); // التوجيه لصفحة تفاصيل الطلب
            }, 3000); 

        } catch (error) {
            console.error('Error placing order:', error.response?.data?.message || error.message);
            showToast(
                t('checkoutPage.orderPlacementError', { message: error.response?.data?.message || error.message }) ||
                `حدث خطأ عند إنشاء الطلب: ${error.response?.data?.message || error.message}`,
                'error'
            );
        } finally {
            setPlacingOrder(false);
        }
    }, [isAuthenticated, cartItems, shippingAddress, paymentMethod, appliedDiscount, calculateSubtotal, calculateDiscountAmount, calculateFinalTotal, navigate, t, showToast, token, API_BASE_URL, clearCart, language]);

    // Redirect if cart is empty and not in loading state
    useEffect(() => {
        // إذا كانت السلة فارغة ولم نكن في حالة loading ولم تكن قد تم وضع طلب بنجاح
        if (!loadingCart && (!cartItems || cartItems.length === 0) && !orderSuccess) {
            showToast(t('checkoutPage.cartEmptyRedirect') || 'سلتك فارغة. سيتم توجيهك إلى صفحة التسوق.', 'info');
            navigate('/shop');
        }
    }, [loadingCart, cartItems, navigate, orderSuccess, showToast, t]);


    if (loadingCart) {
        return (
            <section className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-20 px-4 transition-colors duration-500 ease-in-out">
                <div className="flex flex-col items-center justify-center text-xl font-semibold text-gray-700 dark:text-gray-300">
                    <Loader2 size={64} className="text-blue-500 dark:text-blue-400 animate-spin mb-4" />
                    <span className="text-2xl">{t('general.loading')}</span>
                </div>
            </section>
        );
    }
    if (orderSuccess) {
        return (
            <section className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-20 px-4 transition-colors duration-500 ease-in-out">
                <div className="flex flex-col items-center justify-center text-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg mx-auto max-w-lg border border-gray-200 dark:border-gray-700 animate-fade-in-down">
                    <CheckCircle size={80} className="text-green-500 mb-6 drop-shadow-md" />
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        {t('checkoutPage.orderPlacedSuccessTitle')}
                    </h2>
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                        {t('checkoutPage.orderPlacedSuccessMessage')}
                    </p>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {t('checkoutPage.redirecting')}
                    </div>
                </div>
            </section>
        );
    }
    // If cart is empty, redirect is handled by useEffect, so no need for explicit return here.


    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscountAmount();
    const finalTotal = calculateFinalTotal();

    return (
        <section className="w-full bg-gray-50 dark:bg-gray-900 py-16 px-4 transition-colors duration-500 ease-in-out md:px-8 lg:px-12">
            <div className="container mx-auto p-6 md:p-10 max-w-6xl bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"> {/* Main card: lighter shadow */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-10 text-center border-b-2 border-blue-500/50 dark:border-blue-400/50 pb-4 inline-block mx-auto leading-tight"> {/* Muted border color */}
                    {t('checkoutPage.checkoutTitle')}
                </h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16"> {/* Ample gap */}
                    {/* LEFT COLUMN: Order Summary & Discount Code */}
                    <div className="flex flex-col gap-10"> {/* More space between sections */}
                        {/* Order Summary Card (Receipt-like) */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600 shadow-sm"> {/* Soft background, subtle border/shadow */}
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                                <Package size={24} className="text-blue-500/70 dark:text-blue-400/70" /> {/* Muted icon color */}
                                {t('checkoutPage.orderSummary')}
                            </h2>
                            <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-600"> {/* Clean dividers */}
                                {cartItems.map(item => (
                                    <div key={item.product?._id ? `${item.product._id}-${item.selectedVariant || 'no-variant'}` : `corrupted-${Math.random()}`} className="py-3 flex justify-between items-center text-base text-gray-800 dark:text-gray-200">
                                        {/* Display specific details for cart item if product is null, but avoid errors */}
                                        {item.product ? (
                                            <>
                                                <span className="flex-grow pr-3 font-medium"> 
                                                    {item.name?.[language] || (typeof item.name === 'object' ? item.name?.en || item.name?.ar : item.name) || t('general.unnamedProduct')}
                                                    {item.variantDetails && item.variantDetails.options && item.variantDetails.options.length > 0 && (
                                                        <span className="text-gray-500 dark:text-gray-400 text-sm font-normal"> ({item.variantDetails.options.map(opt => `${opt.optionValue}`).join(', ')})</span>
                                                    )}
                                                    <span className="text-gray-500 dark:text-gray-400 text-sm font-normal"> x {item.quantity}</span>
                                                </span>
                                                <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(item.price * item.quantity)}</span>
                                            </>
                                        ) : (
                                            <span className="flex-grow pr-3 font-medium text-red-500 dark:text-red-400 flex items-center gap-2">
                                                <XCircle size={20} /> {t('checkoutPage.corruptedItem') || 'Corrupted Item'}
                                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">(ID: {item.product ? item.product._id : 'N/A'})</span>
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {/* Totals Section */}
                            <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-700"> {/* Clearer border */}
                                <div className="flex justify-between items-center text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                                    <span>{t('general.subtotal')}</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                {appliedDiscount && (
                                    <div className="flex justify-between items-center text-green-600 dark:text-green-400 font-semibold mb-3 text-lg">
                                        <span className="flex items-center gap-2">
                                            <Tag size={18} /> {t('checkoutPage.discount')} ({appliedDiscount.code})
                                        </span>
                                        <span>-{formatPrice(discountAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center font-bold text-2xl text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700 mt-4"> {/* Stronger total display */}
                                    <span>{t('general.total')}</span>
                                    <span className="text-blue-600 dark:text-blue-400 font-extrabold">{formatPrice(finalTotal)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Discount Code Card */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600 shadow-sm"> {/* Consistent card styling */}
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <Tag size={22} className="text-purple-500/70 dark:text-purple-400/70" /> {/* Muted icon color */}
                                {t('checkoutPage.discountCode')}
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    placeholder={t('checkoutPage.enterDiscountCodePlaceholder')}
                                    value={discountCode}
                                    onChange={(e) => setDiscountCode(e.target.value)}
                                    className="flex-grow px-4 py-2.5 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-base transition-colors duration-200 shadow-sm" 
                                    disabled={appliedDiscount !== null}
                                />
                                {appliedDiscount ? (
                                    <button
                                        onClick={handleRemoveDiscount}
                                        className="px-5 py-2.5 bg-red-500/90 text-white rounded-lg hover:bg-red-600/90 transition-colors duration-200 text-base font-semibold shadow-sm focus:outline-none focus:ring-1 focus:ring-red-400" 
                                    >
                                        {t('checkoutPage.remove')}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleApplyDiscount}
                                        className="px-5 py-2.5 bg-blue-500/90 text-white rounded-lg hover:bg-blue-600/90 transition-colors duration-200 text-base font-semibold shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400" 
                                        disabled={!discountCode.trim()}
                                    >
                                        {t('checkoutPage.apply')}
                                    </button>
                                )}
                            </div>
                            {discountMessage && (
                                <p className={`mt-3 text-sm font-medium ${appliedDiscount ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {discountMessage}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Shipping & Payment */}
                    <div className="flex flex-col gap-10"> {/* More space between sections */}
                        {/* Shipping Address Card */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600 shadow-sm"> {/* Consistent card styling */}
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                                <MapPin size={24} className="text-orange-500/70 dark:text-orange-400/70" /> {/* Muted icon color */}
                                {t('checkoutPage.shippingAddress')}
                            </h2>
                            <div className="flex flex-col gap-3"> {/* Consistent gap between inputs */}
                                <input
                                    type="text"
                                    placeholder={t('checkoutPage.enterAddressPlaceholder')}
                                    value={shippingAddress.address}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-base transition-colors duration-200 shadow-sm"
                                />
                                <input
                                    type="text"
                                    placeholder={t('checkoutPage.enterCityPlaceholder')}
                                    value={shippingAddress.city}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-base transition-colors duration-200 shadow-sm" 
                                />
                                <input
                                    type="text"
                                    placeholder={t('checkoutPage.enterPostalCodePlaceholder')}
                                    value={shippingAddress.postalCode}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-base transition-colors duration-200 shadow-sm" 
                                />
                                <input
                                    type="text"
                                    placeholder={t('checkoutPage.enterCountryPlaceholder')}
                                    value={shippingAddress.country}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 mt-3 text-base transition-colors duration-200 shadow-sm" 
                                />
                            </div>
                        </div>
                        
                        {/* Payment Method Card */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600 shadow-sm"> {/* Consistent card styling */}
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <CreditCard size={20} className="text-cyan-500/70 dark:text-cyan-400/70" /> {/* Muted icon color */}
                                {t('checkoutPage.paymentMethod')}
                            </h3>
                            <div className="relative">
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-base transition-colors duration-200 shadow-sm appearance-none pr-10" 
                                    style={{ paddingRight: language === 'ar' ? '1.5rem' : '2.5rem', paddingLeft: language === 'ar' ? '2.5rem' : '1.5rem' }}
                                >
                                    <option value="Cash on Delivery">{t('checkoutPage.cashOnDelivery')}</option>
                                </select>
                                {/* Custom SVG for select dropdown */}
                                <svg className={`absolute top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 pointer-events-none ${language === 'ar' ? 'left-3' : 'right-3'}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                        </div>
                        
                        {/* Place Order Button */}
                        <button
                            className="mt-2 w-full flex items-center justify-center bg-green-500/90 hover:bg-green-600/90 text-white font-bold py-3.5 px-8 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-1 focus:ring-green-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-xl" 
                            onClick={handlePlaceOrder}
                            disabled={cartItems.length === 0 || placingOrder || finalTotal < 0 || !shippingAddress.address || !shippingAddress.city || !shippingAddress.country || !shippingAddress.postalCode}
                        >
                            {placingOrder && <Loader2 size={24} className="animate-spin mr-3" />}
                            {placingOrder ? (t('checkoutPage.placingOrder')) : (t('checkoutPage.placeOrder'))}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CheckoutPage;