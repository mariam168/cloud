
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../components/LanguageContext';
import {
    Loader2,
    CheckCircle,
    XCircle,
    Truck,
    DollarSign,
    User,
    MapPin,
    Package,
    Calendar,
    Clock,
    ChevronLeft,
    Info, // Added for "Order Not Found"
    ReceiptText // New icon for Order Details title
} from 'lucide-react';
import { useToast } from '../../components/ToastNotification'; // Assuming this provides a more persistent/styled toast

const AdminOrderDetailsPage = () => {
    const { id } = useParams();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const { isAuthenticated, currentUser, token, API_BASE_URL, loadingAuth } = useAuth();
    const { showToast } = useToast();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    // Removed uiMessage state, will rely on useToast for feedback

    const fetchOrderDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axios.get(`${API_BASE_URL}/api/orders/${id}`, config);
            setOrder(response.data);
        } catch (err) {
            console.error("Error fetching order details:", err.response ? err.response.data : err.message);
            const errorMessage = t('adminOrdersPage.errorFetchingOrderDetails') || 'Failed to fetch order details.';
            setError(errorMessage);
            showToast({ message: errorMessage, type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [id, token, API_BASE_URL, t, showToast]);

    useEffect(() => {
        if (loadingAuth) return;

        if (!isAuthenticated || !currentUser || currentUser.role !== 'admin') {
            navigate('/');
            showToast({ message: t('general.accessDenied'), type: 'error' });
            return;
        }

        if (token && API_BASE_URL && id) {
            fetchOrderDetails();
        }
    }, [id, isAuthenticated, currentUser, token, API_BASE_URL, navigate, t, loadingAuth, fetchOrderDetails, showToast]);


    const handleUpdateStatus = async (type) => {
        setUpdatingStatus(true);
        let successMessage = ''; // Initialize successMessage
        let specificErrorMessage = ''; // Initialize specificErrorMessage here
        const defaultErrorMessage = t('general.errorOccurred') || 'An unexpected error occurred.'; // Default error

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };
            let response;

            if (type === 'pay') {
                const paymentResult = {
                    id: 'mock_payment_id_' + Date.now(),
                    status: 'COMPLETED',
                    update_time: new Date().toISOString(),
                    email_address: order.user?.email,
                };
                response = await axios.put(`${API_BASE_URL}/api/orders/${id}/pay`, paymentResult, config);
                successMessage = t('adminOrdersPage.paidSuccess') || 'Order marked as paid successfully!';
                specificErrorMessage = t('adminOrdersPage.paidError') || 'Failed to mark order as paid.';
            } else if (type === 'deliver') {
                response = await axios.put(`${API_BASE_URL}/api/orders/${id}/deliver`, {}, config);
                successMessage = t('adminOrdersPage.deliveredSuccess') || 'Order marked as delivered successfully!';
                specificErrorMessage = t('adminOrdersPage.deliveredError') || 'Failed to mark order as delivered.';
            }

            setOrder(response.data);
            showToast({ message: successMessage, type: 'success' });
        } catch (err) {
            // Use the specificErrorMessage if available, otherwise fallback to a generic one
            const msg = err.response?.data?.message || specificErrorMessage || defaultErrorMessage;
            setError(msg); // Set component-level error for persistent display if needed
            showToast({ message: msg, type: 'error' });
            console.error(`Error updating order status (${type}):`, err.response ? err.response.data : err.message);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const formatPrice = (price) => {
        // Use Intl.NumberFormat for robust currency formatting
        return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
            style: 'currency', currency: t('general.currencyCode') || 'USD'
        }).format(Number(price || 0));
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', options);
    };

    // --- Loading State ---
    if (loading || loadingAuth) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                <Loader2 className="animate-spin h-14 w-14 text-indigo-500 dark:text-indigo-400 mb-4" />
                <p className="text-xl font-medium">{t('general.loading') || 'Loading...'}</p>
            </div>
        );
    }

    // --- Error State ---
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 p-8 text-center">
                <XCircle className="h-16 w-16 mb-4 opacity-70" />
                <p className="text-2xl font-bold mb-4">{t('general.errorOccurred') || 'Error Occurred!'}</p>
                <p className="text-lg max-w-md">{error}</p>
                <button
                    onClick={fetchOrderDetails}
                    className="mt-8 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-700"
                >
                    {t('general.tryAgain') || 'Try Again'}
                </button>
            </div>
        );
    }

    // --- Order Not Found State ---
    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 p-8 text-center">
                <Info className="h-16 w-16 mb-6 text-yellow-500 dark:text-yellow-400 opacity-80" />
                <p className="text-2xl font-semibold mb-3">{t('adminOrdersPage.orderNotFound') || 'Order not found.'}</p>
                <p className="text-lg text-gray-500 dark:text-gray-400">{t('adminOrdersPage.checkOrderId') || 'Please check the order ID and try again.'}</p>
                <Link to="/admin/orders" className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition duration-300 flex items-center">
                    <ChevronLeft size={20} className="mr-2" /> {t('general.backToOrders') || 'Back to Orders'}
                </Link>
            </div>
        );
    }

    // --- Main Content ---
    return (
        <div className="container mx-auto p-4 md:p-8 max-w-7xl bg-white dark:bg-gray-900 shadow-2xl rounded-2xl my-8 border border-gray-100 dark:border-gray-800">
            {/* Back Button */}
            <Link to="/admin/orders" className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500 mb-6 font-medium transition-colors duration-200">
                <ChevronLeft size={20} className="mr-2" />
                {t('general.backToOrders') || 'Back to Orders'}
            </Link>

            {/* Page Title */}
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 pb-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
                <ReceiptText className="text-purple-600 dark:text-purple-400" size={36} strokeWidth={2} />
                {t('adminOrdersPage.orderDetails') || 'Order Details'}
                <span className="text-gray-500 dark:text-gray-400 text-2xl font-mono ml-2 opacity-80">#{order._id.slice(-8)}</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Shipping, Payment, Items) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Shipping Address Card */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <MapPin size={24} className="mr-3 text-indigo-600 dark:text-indigo-400" />
                            {t('adminOrdersPage.shippingAddress') || 'Shipping Address'}
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                            <strong>{t('adminOrdersPage.address') || 'Address'}:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
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
                                onClick={() => handleUpdateStatus('deliver')}
                                disabled={updatingStatus}
                                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium transform hover:scale-[1.01]"
                            >
                                {updatingStatus ? <Loader2 className="animate-spin mr-2" size={20} /> : <Truck size={20} className="mr-2" />}
                                {updatingStatus ? (t('adminOrdersPage.markingDelivered') || 'Marking Delivered...') : (t('adminOrdersPage.markAsDelivered') || 'Mark As Delivered')}
                            </button>
                        )}
                    </div>

                    {/* Payment Method Card */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <DollarSign size={24} className="mr-3 text-green-600 dark:text-green-400" />
                            {t('adminOrdersPage.paymentMethod') || 'Payment Method'}
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                            <strong>{t('adminOrdersPage.method') || 'Method'}:</strong> {order.paymentMethod}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
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
                                onClick={() => handleUpdateStatus('pay')}
                                disabled={updatingStatus}
                                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium transform hover:scale-[1.01]"
                            >
                                {updatingStatus ? <Loader2 className="animate-spin mr-2" size={20} /> : <CheckCircle size={20} className="mr-2" />}
                                {updatingStatus ? (t('adminOrdersPage.markingPaid') || 'Marking Paid...') : (t('adminOrdersPage.markAsPaid') || 'Mark As Paid')}
                            </button>
                        )}
                    </div>

                    {/* Order Items Card */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <Package size={24} className="mr-3 text-purple-600 dark:text-purple-400" />
                            {t('adminOrdersPage.orderItems') || 'Order Items'}
                        </h2>
                        <div className="space-y-6">
                            {order.orderItems.map((item) => (
                                <div key={item.product} className="flex items-start border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0">
                                    <img
                                        src={item.image ? `${API_BASE_URL}${item.image}` : 'https://via.placeholder.com/80x80?text=No+Image'}
                                        alt={item.name?.[language] || item.name?.en || t('general.unnamedItem')}
                                        className="w-20 h-20 object-cover rounded-lg mr-4 shadow-sm border border-gray-200 dark:border-gray-600"
                                    />
                                    <div className="flex-1">
                                        <Link
                                            to={`/product/${item.product}`}
                                            className="text-lg font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500 hover:underline transition-colors duration-200"
                                        >
                                            {item.name?.[language] || item.name?.en || t('general.unnamedItem')}
                                        </Link>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                            {item.quantity} x {formatPrice(item.price)}
                                        </p>
                                        <p className="text-gray-800 dark:text-gray-200 font-semibold mt-1">
                                            {t('adminOrdersPage.subtotal') || 'Subtotal'}: {formatPrice(item.quantity * item.price)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column (Customer Info, Order Summary, Dates) */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Customer Information Card */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <User size={24} className="mr-3 text-blue-600 dark:text-blue-400" />
                            {t('adminOrdersPage.customerInfo') || 'Customer Information'}
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            <strong>{t('adminOrdersPage.name') || 'Name'}:</strong> {order.user?.name || t('general.notAvailable')}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 mt-2">
                            <strong>{t('adminOrdersPage.email') || 'Email'}:</strong> {order.user?.email || t('general.notAvailable')}
                        </p>
                    </div>

                    {/* Order Summary Card */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <DollarSign size={24} className="mr-3 text-yellow-600 dark:text-yellow-400" />
                            {t('adminOrdersPage.orderSummary') || 'Order Summary'}
                        </h2>
                        <div className="space-y-3 text-gray-700 dark:text-gray-300">
                            <div className="flex justify-between items-center text-md">
                                <span>{t('adminOrdersPage.itemsPrice') || 'Items Price'}:</span>
                                <span className="font-medium">{formatPrice(order.itemsPrice)}</span>
                            </div>
                            <div className="flex justify-between items-center text-md">
                                <span>{t('adminOrdersPage.shippingPrice') || 'Shipping Price'}:</span>
                                <span className="font-medium">{formatPrice(order.shippingPrice)}</span>
                            </div>
                            <div className="flex justify-between items-center text-md">
                                <span>{t('adminOrdersPage.taxPrice') || 'Tax Price'}:</span>
                                <span className="font-medium">{formatPrice(order.taxPrice)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xl font-bold border-t pt-4 mt-4 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                                <span>{t('adminOrdersPage.totalPrice') || 'Total Price'}:</span>
                                <span>{formatPrice(order.totalPrice)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Dates Card */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <Calendar size={24} className="mr-3 text-orange-600 dark:text-orange-400" />
                            {t('adminOrdersPage.importantDates') || 'Important Dates'}
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                            <Clock size={16} className="text-gray-500" /> <strong>{t('adminOrdersPage.orderedAt') || 'Ordered At'}:</strong> {formatDateTime(order.createdAt)}
                        </p>
                        {order.isPaid && order.paidAt && (
                            <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                                <CheckCircle size={16} className="text-green-600 dark:text-green-400" /> <strong>{t('adminOrdersPage.paidAt') || 'Paid At'}:</strong> {formatDateTime(order.paidAt)}
                            </p>
                        )}
                        {order.isDelivered && order.deliveredAt && (
                            <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Truck size={16} className="text-indigo-600 dark:text-indigo-400" /> <strong>{t('adminOrdersPage.deliveredAt') || 'Delivered At'}:</strong> {formatDateTime(order.deliveredAt)}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetailsPage;
