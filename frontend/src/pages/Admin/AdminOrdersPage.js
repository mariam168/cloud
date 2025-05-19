import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../components/LanguageContext';
import { Loader2 } from 'lucide-react';

const AdminOrdersPage = () => {
    const { t } = useLanguage();
    const { isAuthenticated, currentUser, token, API_BASE_URL, loadingAuth } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
       if (loadingAuth) {
           return;
       }

       if (!isAuthenticated || !currentUser || currentUser.role !== 'admin') {
           navigate('/');
           setLoadingOrders(false);
           return;
       }

       const fetchOrders = async () => {
           setLoadingOrders(true);
           setError(null);
           try {
               const config = {
                   headers: {
                       Authorization: `Bearer ${token}`,
                   },
               };
               const response = await axios.get(`${API_BASE_URL}/api/orders`, config);
               setOrders(response.data);
           } catch (err) {
               setError(t('adminOrdersPage.errorFetchingOrders') || 'Failed to fetch orders.');
           } finally {
               setLoadingOrders(false);
           }
       };

       if (token && API_BASE_URL) {
           fetchOrders();
       }

    }, [isAuthenticated, currentUser, token, API_BASE_URL, navigate, t, loadingAuth]);

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
                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                    ${order.totalPrice?.toFixed(2) || '0.00'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {order.isPaid ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                            {t('adminOrdersPage.yes') || 'Yes'}
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                                            {t('adminOrdersPage.no') || 'No'}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {order.isDelivered ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                            {t('adminOrdersPage.yes') || 'Yes'}
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                                            {t('adminOrdersPage.no') || 'No'}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/admin/orders/${order._id}`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-600">
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
