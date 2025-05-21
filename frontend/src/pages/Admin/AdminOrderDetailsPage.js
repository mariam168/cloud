import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../components/LanguageContext';
import { Loader2, CheckCircle, XCircle, Truck, DollarSign, User, MapPin, Package, Calendar, Clock, ChevronLeft } from 'lucide-react';

const AdminOrderDetailsPage = () => {
    const { id } = useParams();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const { isAuthenticated, currentUser, token, API_BASE_URL, loadingAuth } = useAuth();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [uiMessage, setUiMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        console.log("AdminOrderDetailsPage useEffect triggered.");
        console.log("loadingAuth:", loadingAuth);
        console.log("isAuthenticated:", isAuthenticated);
        console.log("currentUser:", currentUser);
        console.log("token:", token ? "Token present" : "Token missing");
        console.log("API_BASE_URL:", API_BASE_URL);
        console.log("order ID from useParams (id):", id);

        if (loadingAuth) {
            console.log("Auth is still loading, returning early.");
            return;
        }

        if (!isAuthenticated || !currentUser || currentUser.role !== 'admin') {
            console.log("User not authenticated or not admin, redirecting.");
            navigate('/');
            return;
        }

        const fetchOrderDetails = async () => {
            setLoading(true);
            setError(null);
            setUiMessage({ type: '', text: '' });
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                console.log(`Attempting to fetch order details from: ${API_BASE_URL}/api/orders/${id}`);
                const response = await axios.get(`${API_BASE_URL}/api/orders/${id}`, config);
                setOrder(response.data);
                console.log("Order details fetched successfully:", response.data);
            } catch (err) {
                console.error("Error fetching order details:", err.response ? err.response.data : err.message);
                setError(t('adminOrdersPage.errorFetchingOrderDetails') || 'Failed to fetch order details.');
                setUiMessage({ type: 'error', text: t('adminOrdersPage.errorFetchingOrderDetails') || 'Failed to fetch order details.' });
            } finally {
                setLoading(false);
                console.log("setLoading(false) called.");
            }
        };

        if (token && API_BASE_URL && id) {
            console.log("All necessary data available (token, API_BASE_URL, id). Calling fetchOrderDetails.");
            fetchOrderDetails();
        } else {
            console.log("Missing token, API_BASE_URL, or id. Not calling fetchOrderDetails yet.");
        }
    }, [id, isAuthenticated, currentUser, token, API_BASE_URL, navigate, t, loadingAuth]);

    // Effect to clear UI messages after a delay
    useEffect(() => {
        if (uiMessage.text) {
            const timer = setTimeout(() => {
                setUiMessage({ type: '', text: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [uiMessage]);

    const handleMarkAsPaid = async () => {
        setUpdatingStatus(true);
        setUiMessage({ type: '', text: '' });
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };
            const paymentResult = {
                id: 'mock_payment_id_' + Date.now(),
                status: 'COMPLETED',
                update_time: new Date().toISOString(),
                email_address: order.user?.email, // Use optional chaining here
            };
            const response = await axios.put(`${API_BASE_URL}/api/orders/${id}/pay`, paymentResult, config);
            setOrder(response.data);
            setUiMessage({ type: 'success', text: t('adminOrdersPage.paidSuccess') || 'Order marked as paid successfully!' });
            console.log(t('adminOrdersPage.paidSuccess') || 'Order marked as paid successfully!');
        } catch (err) {
            const errorMessage = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : (t('adminOrdersPage.paidError') || 'Failed to mark order as paid.');
            setError(errorMessage);
            setUiMessage({ type: 'error', text: errorMessage });
            console.error("Error marking order as paid:", err.response ? err.response.data : err.message);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleMarkAsDelivered = async () => {
        setUpdatingStatus(true);
        setUiMessage({ type: '', text: '' });
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axios.put(`${API_BASE_URL}/api/orders/${id}/deliver`, {}, config);
            setOrder(response.data);
            setUiMessage({ type: 'success', text: t('adminOrdersPage.deliveredSuccess') || 'Order marked as delivered successfully!' });
            console.log(t('adminOrdersPage.deliveredSuccess') || 'Order marked as delivered successfully!');
        } catch (err) {
            const errorMessage = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : (t('adminOrdersPage.deliveredError') || 'Failed to mark order as delivered.');
            setError(errorMessage);
            setUiMessage({ type: 'error', text: errorMessage });
            console.error("Error marking order as delivered:", err.response ? err.response.data : err.message);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const formatPrice = (price) => {
        return `${t('shopPage.currencySymbol') || '$'}${price?.toFixed(2)}`;
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', options);
    };

    if (loading || loadingAuth) {
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

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-xl text-gray-700 dark:text-gray-300 p-4 text-center">
                <span>{t('adminOrdersPage.orderNotFound') || 'Order not found.'}</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-6xl bg-white dark:bg-slate-900 shadow-2xl rounded-xl my-8">
            <Link to="/admin/orders" className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600 mb-6">
                <ChevronLeft size={20} className="mr-2" />
                {t('general.back') || 'Back to Orders'}
            </Link>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
                {t('adminOrdersPage.orderDetails') || 'Order Details'} - {order._id}
            </h1>

            {/* UI Message Display */}
            {uiMessage.text && (
                <div className={`p-4 mb-6 rounded-lg text-white font-semibold flex items-center justify-center gap-2
                    ${uiMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
                >
                    {uiMessage.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    <span>{uiMessage.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Summary / Shipping / Payment */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Shipping Address */}
                    <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <MapPin size={24} className="mr-3 text-indigo-600 dark:text-indigo-400" />
                            {t('adminOrdersPage.shippingAddress') || 'Shipping Address'}
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            <strong>{t('adminOrdersPage.address') || 'Address'}:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 mt-2">
                            <strong>{t('adminOrdersPage.status') || 'Status'}:</strong>
                            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${order.isDelivered ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                                {order.isDelivered ? (t('adminOrdersPage.delivered') || 'Delivered') : (t('adminOrdersPage.notDelivered') || 'Not Delivered')}
                            </span>
                            {order.deliveredAt && (
                                <span className="ml-2 text-gray-500 dark:text-gray-400 text-xs">
                                    ({formatDateTime(order.deliveredAt)})
                                </span>
                            )}
                        </p>
                        {!order.isDelivered && (
                            <button
                                onClick={handleMarkAsDelivered}
                                disabled={updatingStatus}
                                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {updatingStatus ? <Loader2 className="animate-spin mr-2" size={20} /> : <Truck size={20} className="mr-2" />}
                                {updatingStatus ? (t('adminOrdersPage.markingDelivered') || 'Marking Delivered...') : (t('adminOrdersPage.markAsDelivered') || 'Mark As Delivered')}
                            </button>
                        )}
                    </div>

                    {/* Payment Method & Status */}
                    <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <DollarSign size={24} className="mr-3 text-green-600 dark:text-green-400" />
                            {t('adminOrdersPage.paymentMethod') || 'Payment Method'}
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            <strong>{t('adminOrdersPage.method') || 'Method'}:</strong> {order.paymentMethod}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 mt-2">
                            <strong>{t('adminOrdersPage.status') || 'Status'}:</strong>
                            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${order.isPaid ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                                {order.isPaid ? (t('adminOrdersPage.paid') || 'Paid') : (t('adminOrdersPage.notPaid') || 'Not Paid')}
                            </span>
                            {order.paidAt && (
                                <span className="ml-2 text-gray-500 dark:text-gray-400 text-xs">
                                    ({formatDateTime(order.paidAt)})
                                </span>
                            )}
                        </p>
                        {!order.isPaid && (
                            <button
                                onClick={handleMarkAsPaid}
                                disabled={updatingStatus}
                                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {updatingStatus ? <Loader2 className="animate-spin mr-2" size={20} /> : <CheckCircle size={20} className="mr-2" />}
                                {updatingStatus ? (t('adminOrdersPage.markingPaid') || 'Marking Paid...') : (t('adminOrdersPage.markAsPaid') || 'Mark As Paid')}
                            </button>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <Package size={24} className="mr-3 text-purple-600 dark:text-purple-400" />
                            {t('adminOrdersPage.orderItems') || 'Order Items'}
                        </h2>
                        <div className="space-y-4">
                            {order.orderItems.map((item) => (
                                <div key={item.product} className="flex items-center border-b pb-4 last:border-b-0 dark:border-gray-700">
                                    <img
                                        src={item.image ? `${API_BASE_URL}${item.image}` : 'https://placehold.co/60x60?text=No+Image'}
                                        alt={item.name?.[language] || item.name?.en || t('general.unnamedItem')}
                                        className="w-16 h-16 object-cover rounded-lg mr-4 shadow-sm"
                                    />
                                    <div className="flex-1">
                                        <Link to={`/product/${item.product}`} className="text-lg font-medium text-blue-600 hover:underline dark:text-blue-400">
                                            {item.name?.[language] || item.name?.en || t('general.unnamedItem')}
                                        </Link>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            {item.quantity} x {formatPrice(item.price)} = {formatPrice(item.quantity * item.price)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Order Summary / User Info */}
                <div className="lg:col-span-1 space-y-8">
                    {/* User Information */}
                    <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <User size={24} className="mr-3 text-blue-600 dark:text-blue-400" />
                            {t('adminOrdersPage.customerInfo') || 'Customer Information'}
                        </h2>
                        {/* Apply optional chaining here */}
                        <p className="text-gray-700 dark:text-gray-300">
                            <strong>{t('adminOrdersPage.name') || 'Name'}:</strong> {order.user?.name || t('general.notAvailable') || 'N/A'}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 mt-2">
                            <strong>{t('adminOrdersPage.email') || 'Email'}:</strong> {order.user?.email || t('general.notAvailable') || 'N/A'}
                        </p>
                    </div>

                    {/* Order Totals */}
                    <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <DollarSign size={24} className="mr-3 text-yellow-600 dark:text-yellow-400" />
                            {t('adminOrdersPage.orderSummary') || 'Order Summary'}
                        </h2>
                        <div className="space-y-2 text-gray-700 dark:text-gray-300">
                            <div className="flex justify-between">
                                <span>{t('adminOrdersPage.itemsPrice') || 'Items Price'}:</span>
                                <span>{formatPrice(order.orderItems.reduce((acc, item) => acc + item.quantity * item.price, 0))}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>{t('adminOrdersPage.shippingPrice') || 'Shipping Price'}:</span>
                                <span>{formatPrice(order.shippingPrice)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>{t('adminOrdersPage.taxPrice') || 'Tax Price'}:</span>
                                <span>{formatPrice(order.taxPrice)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2 border-gray-300 dark:border-gray-600">
                                <span>{t('adminOrdersPage.totalPrice') || 'Total Price'}:</span>
                                <span>{formatPrice(order.totalPrice)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Dates */}
                    <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <Calendar size={24} className="mr-3 text-orange-600 dark:text-orange-400" />
                            {t('adminOrdersPage.dates') || 'Dates'}
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Clock size={16} /> <strong>{t('adminOrdersPage.orderedAt') || 'Ordered At'}:</strong> {formatDateTime(order.createdAt)}
                        </p>
                        {order.isPaid && order.paidAt && ( // Only show if paid and paidAt exists
                            <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2 mt-2">
                                <CheckCircle size={16} className="text-green-600" /> <strong>{t('adminOrdersPage.paidAt') || 'Paid At'}:</strong> {formatDateTime(order.paidAt)}
                            </p>
                        )}
                        {order.isDelivered && order.deliveredAt && ( // Only show if delivered and deliveredAt exists
                            <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2 mt-2">
                                <Truck size={16} className="text-indigo-600" /> <strong>{t('adminOrdersPage.deliveredAt') || 'Delivered At'}:</strong> {formatDateTime(order.deliveredAt)}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetailsPage;