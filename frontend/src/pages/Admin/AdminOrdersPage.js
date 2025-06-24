import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../components/LanguageContext';
import {
    Loader2,
    CheckCircle,
    XCircle,
    ShoppingCart,
    Eye,
    Info // يمكن استخدامها لرسالة "لا توجد طلبات"
} from 'lucide-react';
import { useToast } from '../../components/ToastNotification';

const AdminOrdersPage = () => {
    const { t, language } = useLanguage();
    const { currentUser, token, API_BASE_URL, loadingAuth } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = useCallback(async () => {
        setLoadingOrders(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_BASE_URL}/api/orders`, config);
            setOrders(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError(t('adminOrdersPage.errorFetchingOrdersToast'));
            showToast({ message: t('adminOrdersPage.errorFetchingOrdersToast'), type: 'error' });
        } finally {
            setLoadingOrders(false);
        }
    }, [token, API_BASE_URL, t, showToast]);

    useEffect(() => {
        if (loadingAuth) return;

        if (!currentUser || currentUser.role !== 'admin') {
            navigate('/');
            showToast({ message: t('general.accessDenied'), type: 'error' });
            return;
        }

        if (token) {
            fetchOrders();
        }
    }, [currentUser, token, navigate, loadingAuth, fetchOrders, showToast, t]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
            style: 'currency', currency: t('general.currencyCode') || 'USD'
        }).format(Number(price || 0));
    };

    // --- Loading and Error States (Styled for a calmer look) ---
    if (loadingAuth || loadingOrders) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-700 dark:text-gray-300">
                <Loader2 className="animate-spin h-14 w-14 text-indigo-500 dark:text-indigo-400 mb-4" />
                <p className="text-xl font-medium">{t('general.loadingOrders')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 text-red-700 dark:text-red-200 p-8">
                <XCircle className="h-16 w-16 mb-4 opacity-70" />
                <p className="text-2xl font-bold mb-4">{t('general.errorOccurred')}</p>
                <p className="text-lg text-center max-w-md">{error}</p>
                <button
                    onClick={fetchOrders}
                    className="mt-8 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-700"
                >
                    {t('general.tryAgain')}
                </button>
            </div>
        );
    }

    // --- Main Content (Refined for a softer aesthetic) ---
    return (
        <div className="container mx-auto p-4 md:p-8 max-w-7xl bg-white dark:bg-gray-800 rounded-3xl shadow-xl my-8 border border-gray-100 dark:border-gray-700">
            {/* Page Title */}
            <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-8 pb-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
                <ShoppingCart className="text-indigo-600 dark:text-indigo-400" size={36} strokeWidth={2} />
                {t('adminOrdersPage.allOrders')}
            </h1>

            {/* No Orders Found Message */}
            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                    <Info className="h-16 w-16 mb-6 text-indigo-400 dark:text-indigo-300 opacity-80" />
                    <p className="text-2xl font-semibold mb-3">{t('adminOrdersPage.noOrdersFound')}</p>
                    <p className="text-lg text-gray-500 dark:text-gray-400">{t('adminOrdersPage.checkLater')}</p>
                </div>
            ) : (
                /* Orders Table */
                <div className="overflow-hidden shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('adminOrdersPage.user')}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('adminOrdersPage.date')}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('adminOrdersPage.total')}</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('adminOrdersPage.paid')}</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('adminOrdersPage.delivered')}</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('adminOrdersPage.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                            {orders.map((order, index) => (
                                <tr
                                    key={order._id}
                                    className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'} hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-400" title={order._id}>
                                        <span className="font-bold text-gray-700 dark:text-gray-300">#</span>{order._id.slice(-8)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                                        {order.user?.name || t('general.notAvailable')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                        {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-md font-extrabold text-indigo-700 dark:text-indigo-400">
                                        {formatPrice(order.totalPrice)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                        {order.isPaid ?
                                            <CheckCircle className="text-green-500 dark:text-green-400 inline-block h-6 w-6" title={t('general.yes')} /> :
                                            <XCircle className="text-red-500 dark:text-red-400 inline-block h-6 w-6" title={t('general.no')} />
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                        {order.isDelivered ?
                                            <CheckCircle className="text-green-500 dark:text-green-400 inline-block h-6 w-6" title={t('general.yes')} /> :
                                            <XCircle className="text-red-500 dark:text-red-400 inline-block h-6 w-6" title={t('general.no')} />
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <Link
                                            to={`/admin/orders/${order._id}`}
                                            className="inline-flex items-center justify-center p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-all duration-200 ease-in-out transform hover:scale-110"
                                            title={t('adminOrdersPage.viewDetails')}
                                        >
                                            <Eye size={20} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminOrdersPage;