import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../components/LanguageContext';
import { Loader2, XCircle, CheckCircle } from 'lucide-react'; 
import { useToast } from '../../components/ToastNotification';

const AdminOrdersPage = () => {
    const { t, language } = useLanguage();
    const { isAuthenticated, currentUser, token, API_BASE_URL, loadingAuth } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast(); 
    
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = useCallback(async () => {
        setLoadingOrders(true);
        setError(null);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            // هذا المسار يجلب جميع الطلبات للادمن
            const response = await axios.get(`${API_BASE_URL}/api/orders`, config); 
            setOrders(response.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            setError(t('adminOrdersPage.errorFetchingOrders', { message: errorMessage }) || `Failed to fetch orders: ${errorMessage}`);
            showToast(t('adminOrdersPage.errorFetchingOrdersToast') || 'فشل في جلب الطلبات.', 'error'); 
        } finally {
            setLoadingOrders(false);
        }
    }, [token, API_BASE_URL, t, showToast]);

    useEffect(() => {
        if (loadingAuth) {
            return;
        }

        if (!isAuthenticated || !currentUser || currentUser.role !== 'admin') {
            navigate('/');
            showToast(t('general.unauthorizedAccess') || 'غير مصرح لك بالوصول.', 'error'); 
            setLoadingOrders(false);
            return;
        }

        if (token && API_BASE_URL) {
            fetchOrders();
        }

    }, [isAuthenticated, currentUser, token, API_BASE_URL, navigate, t, loadingAuth, fetchOrders, showToast]);

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
            console.error("Error formatting currency in AdminOrdersPage:", e);
            return `${t('general.currencySymbol')}${Number(price).toFixed(2)}`;
        }
    }, [language, t]);

    if (loadingAuth || loadingOrders) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-xl text-gray-700 dark:text-gray-300">
                <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-4" />
                <span>{t('adminOrdersPage.loadingOrders') || 'Loading orders...'}</span>
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

    if (!orders || orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-xl text-gray-700 dark:text-gray-300 p-4 text-center">
                <span>{t('adminOrdersPage.noOrdersFound') || 'No orders found.'}</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-6xl bg-white dark:bg-slate-900 shadow-2xl rounded-xl my-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
                {t('adminOrdersPage.allOrders') || 'All Orders'}
            </h1>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-slate-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {t('adminOrdersPage.orderID') || 'Order ID'}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {t('adminOrdersPage.user') || 'User'}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {t('adminOrdersPage.date') || 'Date'}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {t('checkoutPage.total') || 'Total'}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {t('adminOrdersPage.paid') || 'Paid'}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {t('adminOrdersPage.delivered') || 'Delivered'}
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">{t('adminOrdersPage.details') || 'Details'}</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {order._id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                    {order.user ? order.user.name || order.user.email : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                    {formatPrice(order.totalPrice)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {order.isPaid ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                            <CheckCircle size={16} className="inline mr-1" /> {t('adminOrdersPage.yes') || 'Yes'}
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                                            <XCircle size={16} className="inline mr-1" /> {t('adminOrdersPage.no') || 'No'}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {order.isDelivered ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                            <CheckCircle size={16} className="inline mr-1" /> {t('adminOrdersPage.yes') || 'Yes'}
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                                            <XCircle size={16} className="inline mr-1" /> {t('adminOrdersPage.no') || 'No'}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {/* توجيه إلى صفحة تفاصيل الطلب الجديدة للادمن */}
                                    <Link to={`/orders/${order._id}`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-600">
                                        {t('adminOrdersPage.details') || 'Details'}
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrdersPage;