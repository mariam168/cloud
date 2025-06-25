import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { ShoppingCart, Loader2, CheckCircle, Tag, Package, CreditCard, MapPin, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/ToastNotification';

const CheckoutPage = () => {
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { cartItems, loadingCart, clearCart, cartTotal } = useCart();
    const { isAuthenticated, token, API_BASE_URL = 'http://localhost:5000' } = useAuth();

    const [shippingAddress, setShippingAddress] = useState({
        address: '123 Main St', city: 'Cairo', postalCode: '11511', country: 'Egypt',
    });
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
    const [placingOrder, setPlacingOrder] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [createdOrder, setCreatedOrder] = useState(null);
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);

    const formatPrice = useCallback((price) => {
        if (price === undefined || price === null) return t('general.priceNotAvailable');
        return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
            style: 'currency', currency: t('general.currencyCode')
        }).format(Number(price));
    }, [language, t]);
    
    const subtotal = cartTotal;
    const discountAmount = appliedDiscount?.amount || 0;
    const finalTotal = subtotal - discountAmount;

    const handleApplyDiscount = () => {
        if(discountCode.toUpperCase() === "SAVE10") {
            const amount = subtotal * 0.10;
            setAppliedDiscount({ code: "SAVE10", amount });
            showToast(t('checkoutPage.discountAppliedSuccessfully'), 'success');
        } else {
            showToast(t('checkoutPage.invalidOrExpiredDiscount'), 'error');
        }
    };

    const handlePlaceOrder = useCallback(async () => {
        setPlacingOrder(true);
        if (!isAuthenticated) {
            showToast(t('checkoutPage.pleaseLoginToCheckout'), 'info');
            navigate('/login');
            setPlacingOrder(false);
            return;
        }
        if (!cartItems || cartItems.length === 0) {
            showToast(t('cartPage.cartEmptyCheckout'), 'warning');
            setPlacingOrder(false);
            return;
        }

        const orderData = {
            shippingAddress,
            paymentMethod,
            discount: appliedDiscount,
        };

        try {
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
            const { data } = await axios.post(`${API_BASE_URL}/api/orders`, orderData, config);
            
            // *** التصحيح هنا: التعامل مع الاستجابة بشكل أكثر أمانًا ***
            const newOrder = data.order || data;
            setCreatedOrder(newOrder);
            
            setOrderSuccess(true);
            clearCart();
            showToast(t('checkoutPage.orderPlacedSuccessTitle'), 'success');
            
        } catch (error) {
            const errorMessage = error.response?.data?.message || t('checkoutPage.orderPlacementError');
            showToast(errorMessage, 'error');
            console.error("Order placement error:", error.response || error);
        } finally {
            setPlacingOrder(false);
        }
    }, [isAuthenticated, cartItems, shippingAddress, paymentMethod, appliedDiscount, navigate, t, showToast, token, API_BASE_URL, clearCart]);

    useEffect(() => {
        if (!loadingCart && cartItems.length === 0 && !orderSuccess) {
            navigate('/shop');
        }
    }, [loadingCart, cartItems, orderSuccess, navigate]);

    if (loadingCart) return <div className="flex justify-center items-center h-screen"><Loader2 size={48} className="animate-spin text-blue-500" /></div>;
    
    if (orderSuccess) {
        return (
            <section className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-20 px-4">
                <div className="flex flex-col items-center text-center p-10 bg-white rounded-2xl shadow-xl max-w-lg mx-auto">
                    <CheckCircle size={80} className="text-green-500 mb-6 drop-shadow-md" />
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4">{t('checkoutPage.orderPlacedSuccessTitle')}</h2>
                    <p className="text-lg text-gray-600 mb-2">{t('checkoutPage.orderPlacedSuccessMessage')}</p>
                    <p className="text-md text-gray-500 mb-8 font-mono bg-gray-100 px-3 py-1 rounded-md">
                        {t('adminOrdersPage.orderID')}: {createdOrder?._id}
                    </p>
                    <Link to="/shop" className="inline-flex items-center bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 shadow-md transition-transform hover:-translate-y-0.5">
                        {t('cartPage.continueShopping')} <ArrowRight size={18} className="ml-2" />
                    </Link>
                </div>
            </section>
        );
    }
    
    return (
        <section className="w-full bg-gray-50 py-12 px-4">
            <div className="container mx-auto max-w-6xl p-6 bg-white rounded-xl shadow-md">
                <h1 className="text-3xl font-bold text-center mb-10">{t('checkoutPage.checkoutTitle')}</h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div>
                        <div className="bg-gray-100 rounded-lg p-6 mb-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center"><Package size={24} className="mr-3 text-blue-500" />{t('checkoutPage.orderSummary')}</h2>
                            <div className="divide-y">
                                {cartItems.map(item => (
                                    <div key={`${item.product._id}-${item.selectedVariant}`} className="py-3 flex justify-between items-center">
                                        <div>
                                            <p>{item.name} x {item.quantity}</p>
                                            <p className="text-xs text-gray-500">{item.variantDetailsText}</p>
                                        </div>
                                        <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t">
                                <div className="flex justify-between font-medium mb-2"><span>{t('general.subtotal')}</span><span>{formatPrice(subtotal)}</span></div>
                                {appliedDiscount && <div className="flex justify-between text-green-600 font-medium mb-2"><span>{t('checkoutPage.discount')}</span><span>-{formatPrice(discountAmount)}</span></div>}
                                <div className="flex justify-between font-bold text-xl mt-4"><span>{t('general.total')}</span><span className="text-blue-600">{formatPrice(finalTotal)}</span></div>
                            </div>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-6">
                             <h3 className="text-xl font-bold mb-4 flex items-center"><Tag size={20} className="mr-2 text-purple-500" />{t('checkoutPage.discountCode')}</h3>
                             <div className="flex gap-2">
                                <input type="text" placeholder={t('checkoutPage.enterDiscountCodePlaceholder')} value={discountCode} onChange={e => setDiscountCode(e.target.value)} className="flex-grow p-2 border rounded-lg" disabled={!!appliedDiscount} />
                                <button onClick={appliedDiscount ? () => setAppliedDiscount(null) : handleApplyDiscount} className={`px-4 py-2 rounded-lg text-white font-semibold ${appliedDiscount ? 'bg-red-500' : 'bg-blue-500'}`}>{appliedDiscount ? t('checkoutPage.remove') : t('checkoutPage.apply')}</button>
                             </div>
                        </div>
                    </div>
                    <div>
                        <div className="bg-gray-100 rounded-lg p-6 mb-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center"><MapPin size={24} className="mr-3 text-orange-500" />{t('checkoutPage.shippingAddress')}</h2>
                            <div className="space-y-3">
                                <input type="text" placeholder={t('checkoutPage.enterAddressPlaceholder')} value={shippingAddress.address} onChange={(e) => setShippingAddress(prev => ({...prev, address: e.target.value}))} className="w-full p-2 border rounded-lg" />
                                <input type="text" placeholder={t('checkoutPage.enterCityPlaceholder')} value={shippingAddress.city} onChange={(e) => setShippingAddress(prev => ({...prev, city: e.target.value}))} className="w-full p-2 border rounded-lg" />
                                <input type="text" placeholder={t('checkoutPage.enterPostalCodePlaceholder')} value={shippingAddress.postalCode} onChange={(e) => setShippingAddress(prev => ({...prev, postalCode: e.target.value}))} className="w-full p-2 border rounded-lg" />
                                <input type="text" placeholder={t('checkoutPage.enterCountryPlaceholder')} value={shippingAddress.country} onChange={(e) => setShippingAddress(prev => ({...prev, country: e.target.value}))} className="w-full p-2 border rounded-lg" />
                            </div>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-6">
                            <h3 className="text-xl font-bold mb-4 flex items-center"><CreditCard size={20} className="mr-2 text-cyan-500" />{t('checkoutPage.paymentMethod')}</h3>
                            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full p-2 border rounded-lg">
                                <option value="Cash on Delivery">{t('checkoutPage.cashOnDelivery')}</option>
                            </select>
                        </div>
                        <button onClick={handlePlaceOrder} disabled={placingOrder} className="mt-8 w-full flex items-center justify-center bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400">
                            {placingOrder ? <Loader2 className="animate-spin mr-2" /> : <ShoppingCart className="mr-2" />}
                            {placingOrder ? t('checkoutPage.placingOrder') : t('checkoutPage.placeOrder')}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CheckoutPage;