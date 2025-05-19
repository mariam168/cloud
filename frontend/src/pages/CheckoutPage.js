import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../components/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Loader, CheckCircle } from 'lucide-react'; 
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
const CheckoutPage = () => {
    const { t, language } = useLanguage(); 
    const { cartItems, loadingCart, clearCart } = useCart();
    const { isAuthenticated, token, API_BASE_URL = 'http://localhost:5000' } = useAuth();
    const navigate = useNavigate();
    const [shippingAddress, setShippingAddress] = useState({
        address: '123 Main St',
        city: 'Cairo', 
        postalCode: '11511',
        country: 'Egypt', 
    });
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
    const [placingOrder, setPlacingOrder] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
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
    const handlePlaceOrder = async () => {
        if (!isAuthenticated) {
            alert(t('checkoutPage.pleaseLoginToCheckout') || 'Please log in to checkout.');
            navigate('/login'); 
            return;
        }
        if (!cartItems || cartItems.length === 0) {
            alert(t('checkoutPage.cartEmptyCheckout') || 'Your cart is empty. Add items before checking out.');
            return;
        }if (!shippingAddress.address || !paymentMethod) {
             alert(t('checkoutPage.shippingPaymentRequired') || 'Please provide shipping address and payment method.');
            return;
        }
        setPlacingOrder(true); 
        try {
            const orderData = {
                orderItems: cartItems.map(item => ({
                    product: item.product,
                    name: item.name, 
                    quantity: item.quantity,
                    image: item.image,
                    price: item.price,
                })),
                shippingAddress: shippingAddress, 
                paymentMethod: paymentMethod, 
                taxPrice: 0,
                shippingPrice: 0, 
                totalPrice: calculateTotal(),
            };
            const config = {
                headers: {
                    'Content-Type': 'application/json', 
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axios.post(`${API_BASE_URL}/api/orders`, orderData, config);
            if (response.data && response.data._id) {
                setOrderSuccess(true);
                clearCart();
                 setTimeout(() => {
                     navigate('/');
                 }, 3000); 
            } else {
                alert(t('checkoutPage.orderPlacementFailed') || 'Order placement failed.');
            }
        } catch (error) {
            console.error('Error placing order:', error.response?.data?.message || error.message);
            alert(`${t('checkoutPage.orderPlacementError') || 'Error placing order'}: ${error.response?.data?.message || error.message}`);
        } finally {
            setPlacingOrder(false); 
        }
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
     if (orderSuccess) {
         return (
             <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl mx-auto max-w-lg my-12 transition-colors duration-500 ease-in-out"> 
                 <CheckCircle size={80} className="text-green-500 mb-6 animate-bounce-in" /> 
                 <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4"> 
                     {t('checkoutPage.orderPlacedSuccessTitle') || 'Order Placed Successfully!'}
                 </h2>
                 <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                     {t('checkoutPage.orderPlacedSuccessMessage') || 'Thank you for your purchase. You will be redirected to the home page shortly.'}
                 </p>
                 <div className="text-sm text-gray-500 dark:text-gray-400">
                     {t('checkoutPage.redirecting') || 'Redirecting...'}
                 </div>
             </div>
         );
     }
    if (!cartItems || cartItems.length === 0) {
         navigate('/shop');
         return null; 
    }
    return (
        <section className="w-full bg-gray-50 dark:bg-gray-900 py-12 px-4 transition-colors duration-500 ease-in-out md:px-8 lg:px-12">
            <div className="container mx-auto p-6 md:p-8 max-w-5xl bg-white dark:bg-gray-800 shadow-lg rounded-xl">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-8 border-b pb-4 border-gray-200 dark:border-gray-700 leading-tight">
                    {t('checkoutPage.checkoutTitle') || 'Checkout'} 
                </h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    <div className="lg:col-span-1">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                            {t('checkoutPage.orderSummary') || 'Order Summary'} 
                        </h2>
                        <div className="border border-gray-300 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-700 shadow-sm"> 
                            {cartItems.map(item => (
                                <div key={item.product} className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300 mb-3 last:mb-0">
                                    <span className="flex-grow pr-2">
                                        {item.name?.[language] || (typeof item.name === 'object' ? item.name?.en || item.name?.ar : item.name) || t('general.unnamedProduct') || 'Unnamed Item'} 
                                        <span className="text-gray-500 dark:text-gray-400"> x {item.quantity}</span>
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-white">{t('shopPage.currencySymbol') || '$'}{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600 flex justify-between items-center font-bold text-xl text-gray-900 dark:text-white"> 
                                <span>{t('general.total') || 'Total'}</span> 
                                <span className="text-blue-600 dark:text-blue-400">{t('shopPage.currencySymbol') || '$'}{calculateTotal().toFixed(2)}</span> 
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                            {t('checkoutPage.shippingAndPayment') || 'Shipping & Payment'}
                        </h2>
                        <div className="border border-gray-300 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-700 shadow-sm"> 
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">{t('checkoutPage.shippingAddress') || 'Shipping Address'}</h3>
                                <input
                                    type="text"
                                    placeholder={t('checkoutPage.enterAddressPlaceholder') || "Enter Address"} 
                                    value={shippingAddress.address}
                                    onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                />
                                 <input
                                    type="text"
                                    placeholder={t('checkoutPage.enterCityPlaceholder') || "Enter City"} 
                                    value={shippingAddress.city}
                                    onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 mt-3 transition-colors duration-200" 
                                />
                                  <input
                                    type="text"
                                    placeholder={t('checkoutPage.enterPostalCodePlaceholder') || "Enter Postal Code"} 
                                    value={shippingAddress.postalCode}
                                    onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 mt-3 transition-colors duration-200"
                                />
                                 <input
                                    type="text"
                                    placeholder={t('checkoutPage.enterCountryPlaceholder') || "Enter Country"} 
                                    value={shippingAddress.country}
                                    onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 mt-3 transition-colors duration-200"
                                />
                            </div>
                            <div>
                                 <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">{t('checkoutPage.paymentMethod') || 'Payment Method'}</h3>
                                 <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                 >
                                    <option value="Cash on Delivery">{t('checkoutPage.cashOnDelivery') || 'Cash on Delivery'}</option> 
                                 </select>
                            </div>
                        </div>
                        <button
                            className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center"
                            onClick={handlePlaceOrder}
                            disabled={cartItems.length === 0 || placingOrder}
                        >
                             {placingOrder && <Loader size={20} className="animate-spin mr-2" />}
                             {placingOrder ? (t('checkoutPage.placingOrder') || 'Placing Order...') : (t('checkoutPage.placeOrder') || 'Place Order')} {/* Using translation keys */}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CheckoutPage;
