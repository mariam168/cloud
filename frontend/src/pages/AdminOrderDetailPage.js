// pages/AdminOrderDetailPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../components/LanguageContext';
import { useToast } from '../components/ToastNotification';
import { Loader2, Package, User, MapPin, CreditCard, DollarSign, CheckCircle, XCircle, Truck, Info } from 'lucide-react';

const AdminOrderDetailPage = () => {
    const { id: orderId } = useParams();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const { isAuthenticated, currentUser, token, API_BASE_URL, loadingAuth } = useAuth();
    const { showToast } = useToast();

    const [order, setOrder] = useState(null);
    const [loadingOrder, setLoadingOrder] = useState(true);
    const [error, setError] = useState(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const fetchOrder = useCallback(async () => {
        setLoadingOrder(true);
        setError(null);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            // هذا المسار يستخدمه المستخدم العادي والادمن، ويحتوي على التحقق من الصلاحيات.
            const response = await axios.get(`${API_BASE_URL}/api/orders/${orderId}`, config);
            setOrder(response.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            setError(t('adminOrdersPage.errorFetchingOrderDetails', { message: errorMessage }) || `Failed to fetch order details: ${errorMessage}`);
            showToast(t('adminOrdersPage.errorFetchingOrderDetailsToast') || 'فشل في جلب تفاصيل الطلب.', 'error');
        } finally {
            setLoadingOrder(false);
        }
    }, [orderId, token, API_BASE_URL, t, showToast]);

    useEffect(() => {
        if (loadingAuth) {
            return;
        }

        // التحقق من أن المستخدم ادمن
        if (!isAuthenticated || !currentUser || currentUser.role !== 'admin') {
            navigate('/admin/orders'); // توجيههم لصفحة قائمة الطلبات أو لوحة التحكم
            showToast(t('general.unauthorizedAccess') || 'غير مصرح لك بالوصول.', 'error');
            setLoadingOrder(false);
            return;
        }

        if (token && API_BASE_URL && orderId) {
            fetchOrder();
        }

    }, [isAuthenticated, currentUser, token, API_BASE_URL, orderId, navigate, t, loadingAuth, fetchOrder, showToast]);

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
            console.error("Error formatting currency in AdminOrderDetailPage:", e);
            return `${t('general.currencySymbol')}${Number(price).toFixed(2)}`;
        }
    }, [language, t]);

    const handleUpdateOrderStatus = useCallback(async (statusType) => {
        setIsUpdatingStatus(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            let response;
            if (statusType === 'pay') {
                response = await axios.put(`${API_BASE_URL}/api/orders/${orderId}/pay`, { 
                    id: `PAYPAL_TEST_${Date.now()}`, // مثال لبيانات الدفع
                    status: 'COMPLETED',
                    update_time: new Date().toISOString(),
                    email_address: order.user ? order.user.email : 'admin@example.com'
                }, config);
            } else if (statusType === 'deliver') {
                response = await axios.put(`${API_BASE_URL}/api/orders/${orderId}/deliver`, {}, config);
            }

            if (response && response.data) {
                setOrder(response.data); // تحديث حالة الطلب في الواجهة
                showToast(t(`adminOrdersPage.statusUpdateSuccess.${statusType}`) || `Order status updated to ${statusType} successfully!`, 'success');
            }
        } catch (err) {
            console.error(`Error updating order status (${statusType}):`, err.response?.data?.message || err.message);
            showToast(t(`adminOrdersPage.statusUpdateError.${statusType}`) || `Failed to update order status to ${statusType}.`, 'error');
        } finally {
            setIsUpdatingStatus(false);
        }
    }, [orderId, token, API_BASE_URL, order, t, showToast]);


    if (loadingAuth || loadingOrder) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-xl text-gray-700 dark:text-gray-300">
                <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-4" />
                <span>{t('adminOrdersPage.loadingOrderDetails') || 'Loading order details...'}</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[80vh] text-xl text-red-600 dark:text-red-400 p-4 text-center">
                {t('general.error') || 'Error'}: {error}
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-xl text-gray-700 dark:text-gray-300 p-4 text-center">
                <Info size={48} className="mb-4 text-gray-400 dark:text-gray-500" />
                <span>{t('adminOrdersPage.orderNotFound') || 'Order not found.'}</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-5xl bg-white dark:bg-slate-900 shadow-2xl rounded-xl my-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
                {t('adminOrdersPage.order') || 'Order'} {order._id}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Order Status & Actions */}
                <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        {t('adminOrdersPage.orderStatus') || 'Order Status'}
                    </h2>
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <strong>{t('adminOrdersPage.payment') || 'Payment'}:</strong> 
                        {order.isPaid ? (
                            <span className="text-green-600 font-semibold flex items-center gap-1">
                                <CheckCircle size={18} /> {t('adminOrdersPage.paidAt') || 'Paid at'}: {new Date(order.paidAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                            </span>
                        ) : (
                            <span className="text-red-600 font-semibold flex items-center gap-1">
                                <XCircle size={18} /> {t('adminOrdersPage.notPaid') || 'Not Paid'}
                            </span>
                        )}
                    </p>
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                        <strong>{t('adminOrdersPage.delivery') || 'Delivery'}:</strong> 
                        {order.isDelivered ? (
                            <span className="text-green-600 font-semibold flex items-center gap-1">
                                <CheckCircle size={18} /> {t('adminOrdersPage.deliveredAt') || 'Delivered at'}: {new Date(order.deliveredAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                            </span>
                        ) : (
                            <span className="text-red-600 font-semibold flex items-center gap-1">
                                <XCircle size={18} /> {t('adminOrdersPage.notDelivered') || 'Not Delivered'}
                            </span>
                        )}
                    </p>

                    {/* Admin Actions */}
                    <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        {!order.isPaid && (
                            <button
                                onClick={() => handleUpdateOrderStatus('pay')}
                                disabled={isUpdatingStatus}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 disabled:opacity-50"
                            >
                                {isUpdatingStatus ? <Loader2 size={20} className="animate-spin" /> : <CreditCard size={20} />}
                                {t('adminOrdersPage.markAsPaid') || 'Mark as Paid'}
                            </button>
                        )}
                        {!order.isDelivered && (
                            <button
                                onClick={() => handleUpdateOrderStatus('deliver')}
                                disabled={isUpdatingStatus || !order.isPaid} 
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 disabled:opacity-50"
                            >
                                {isUpdatingStatus ? <Loader2 size={20} className="animate-spin" /> : <Truck size={20} />}
                                {t('adminOrdersPage.markAsDelivered') || 'Mark as Delivered'}
                            </button>
                        )}
                    </div>
                </div>

                {/* User & Shipping Info */}
                <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        {t('adminOrdersPage.customerInfo') || 'Customer Information'}
                    </h2>
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <User size={18} className="text-blue-500" />
                        <strong>{t('adminOrdersPage.customerName') || 'Name'}:</strong> {order.user?.name || 'N/A'}
                    </p>
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                        <User size={18} className="text-blue-500" />
                        <strong>{t('adminOrdersPage.customerEmail') || 'Email'}:</strong> {order.user?.email || 'N/A'}
                    </p>

                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                        <MapPin size={18} className="text-orange-500" />
                        {t('adminOrdersPage.shippingAddress') || 'Shipping Address'}
                    </h3>
                    <p className="text-base text-gray-700 dark:text-gray-300">
                        {order.shippingAddress.address}, {order.shippingAddress.city}
                    </p>
                    <p className="text-base text-gray-700 dark:text-gray-300">
                        {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                    </p>
                </div>
            </div>

            {/* Order Items Table */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                    {t('adminOrdersPage.orderItems') || 'Order Items'}
                </h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-slate-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {t('adminOrdersPage.item') || 'Item'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {t('adminOrdersPage.variant') || 'Variant'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {t('adminOrdersPage.quantity') || 'Quantity'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {t('adminOrdersPage.price') || 'Price'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {t('adminOrdersPage.total') || 'Total'}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {order.orderItems.map((item) => (
                                <tr key={item.product?._id || item.name.en}> {/* Fallback key if product is null, though it shouldn't be now */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-12 w-12">
                                                <img 
                                                    className="h-12 w-12 rounded-lg object-cover" 
                                                    src={item.image ? `${API_BASE_URL}${item.image}` : '/images/placeholder-product-image.png'} 
                                                    alt={item.name?.[language] || item.name?.en || item.name?.ar} 
                                                    onError={(e) => { e.target.onerror = null; e.target.src='/images/placeholder-product-image.png'; }}
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {item.name?.[language] || item.name?.en || item.name?.ar}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {item.variantDetails && item.variantDetails.options && item.variantDetails.options.length > 0 ? (
                                            item.variantDetails.options.map(opt => `${opt.optionName}: ${opt.optionValue}`).join(', ')
                                        ) : (
                                            t('adminOrdersPage.noVariantSelected') || 'N/A'
                                        )}
                                        {item.variantDetails && item.variantDetails.sku && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400">SKU: {item.variantDetails.sku}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {item.quantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {formatPrice(item.price)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {formatPrice(item.price * item.quantity)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Totals Summary */}
            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                <div className="flex justify-between items-center text-lg mb-2">
                    <span>{t('adminOrdersPage.subtotal') || 'Subtotal'}:</span>
                    <span>{formatPrice(order.totalPrice - order.taxPrice - order.shippingPrice)}</span>
                </div>
                {order.discount && order.discount.discountAmount > 0 && (
                     <div className="flex justify-between items-center text-lg text-green-600 dark:text-green-400 mb-2">
                        <span>{t('adminOrdersPage.discount') || 'Discount'} ({order.discount.code}):</span>
                        <span>-{formatPrice(order.discount.discountAmount)}</span>
                    </div>
                )}
                <div className="flex justify-between items-center text-lg mb-2">
                    <span>{t('adminOrdersPage.shipping') || 'Shipping'}:</span>
                    <span>{formatPrice(order.shippingPrice)}</span>
                </div>
                <div className="flex justify-between items-center text-lg mb-4">
                    <span>{t('adminOrdersPage.tax') || 'Tax'}:</span>
                    <span>{formatPrice(order.taxPrice)}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-2xl pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span>{t('adminOrdersPage.total') || 'Total'}:</span>
                    <span className="text-blue-600 dark:text-blue-400">{formatPrice(order.totalPrice)}</span>
                </div>
            </div>
            
            <div className="mt-8 text-center">
                <button
                    onClick={() => navigate('/admin/orders')}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 py-2.5 px-6 rounded-lg font-semibold transition-colors duration-200 shadow-md"
                >
                    {t('adminOrdersPage.backToOrders') || 'Back to Orders'}
                </button>
            </div>
        </div>
    );
};

export default AdminOrderDetailPage;