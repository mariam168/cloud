import { useState } from 'react'; 
import { useCart } from '../context/CartContext'; 
import { useLanguage } from '../components/LanguageContext';
import { Link, useNavigate } from 'react-router-dom'; 
import { ShoppingCart } from 'lucide-react'; 
import axios from 'axios'; 
import { useAuth } from '../context/AuthContext'; 
const CheckoutPage = () => {
    const { t } = useLanguage();
    const { cartItems, loadingCart, clearCart } = useCart();
    const { isAuthenticated, token, API_BASE_URL } = useAuth();
    const navigate = useNavigate(); 
    const [shippingAddress, setShippingAddress] = useState({
        address: '123 Main St',
        city: 'Cairo',
        postalCode: '11511',
        country: 'Egypt',
    });
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery'); 
    const [placingOrder, setPlacingOrder] = useState(false);
    const calculateTotal = () => {
        if (!Array.isArray(cartItems)) {
            return 0;
        }
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };
    const handlePlaceOrder = async () => {
        if (!isAuthenticated) {
            alert(t.pleaseLoginToCheckout || 'Please log in to checkout.');
            navigate('/login');
            return;
        }
        if (cartItems.length === 0) {
            alert(t.cartEmptyCheckout || 'Your cart is empty. Add items before checking out.');
            return;
        }
        if (!shippingAddress.address || !paymentMethod) {
            alert(t.shippingPaymentRequired || 'Please provide shipping address and payment method.');
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
                alert(t.orderPlacedSuccess || 'Order placed successfully!'); 
                clearCart();
                navigate(`/order/${response.data._id}`); 
            } else {
                alert(t.orderPlacementFailed || 'Order placement failed.');
            }
        } catch (error) {
            console.error('Error placing order:', error.response?.data?.message || error.message);
            alert(`${t.orderPlacementError || 'Error placing order'}: ${error.response?.data?.message || error.message}`);
        } finally {
            setPlacingOrder(false); 
        }
    };
     if (loadingCart) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-xl text-gray-700 dark:text-gray-300">
                <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{t.loading || 'Loading...'}</span> 
            </div>
        );
    }
    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-xl text-gray-700 dark:text-gray-300 p-4 text-center">
                 <ShoppingCart size={48} className="mb-4 text-gray-500 dark:text-gray-400"/> 
                 <span>{t.cartEmptyCheckoutRedirect || 'Your cart is empty. Redirecting to shop...'}</span>
                 <Link to="/shop" className="mt-4 text-blue-600 hover:underline dark:text-blue-400">
                    {t.continueShopping || 'Continue Shopping'} 
                 </Link>
            </div>
        );
    }
    return (
        <div className="container mx-auto p-4 md:p-8 max-w-5xl bg-white dark:bg-slate-900 shadow-2xl rounded-xl my-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
                {t.checkout || 'Checkout'} 
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="lg:col-span-1">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                        {t.orderSummary || 'Order Summary'}
                    </h2>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                        {cartItems.map(item => (
                            <div key={item.product} className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300 mb-2 last:mb-0">
                                <span>{item.name} x {item.quantity}</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center font-bold text-gray-900 dark:text-white">
                            <span>{t.total || 'Total'}</span> 
                            <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                        {t.shippingAndPayment || 'Shipping & Payment'} 
                    </h2>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">{t.shippingAddress || 'Shipping Address'}</h3> 
                          <input
                                type="text"
                                placeholder="Enter Address"
                                value={shippingAddress.address}
                                onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                             <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">{t.paymentMethod || 'Payment Method'}</h3> 
                             <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                             >
                                <option value="Cash on Delivery">Cash on Delivery</option>
                              
                             </select>
                        </div>
                    </div>
                    <button
                        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handlePlaceOrder} 
                        disabled={cartItems.length === 0 || placingOrder} 
                    >
                         {placingOrder ? (t.placingOrder || 'Placing Order...') : (t.placeOrder || 'Place Order')} 
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
