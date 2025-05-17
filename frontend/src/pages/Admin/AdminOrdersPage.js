import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; // Assuming useAuth is in context folder
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../components/LanguageContext'; // Assuming LanguageContext is in components
import { Loader2 } from 'lucide-react'; // Loading icon
import { toast } from 'react-toastify';
import {Link} from 'react-router-dom';

const AdminOrdersPage = () => {
    const { t } = useLanguage(); // For localization
    const { isAuthenticated, user, token, API_BASE_URL } = useAuth(); // Get auth state and user info
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      

        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                // Make GET request to fetch all orders (requires admin token)
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                const response = await axios.get(`${API_BASE_URL}/api/orders`, config);
                setOrders(response.data);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError(t.errorFetchingOrders || 'Failed to fetch orders.');
            } finally {
                setLoading(false);
            }
        };

        // Fetch orders only if authenticated and user is admin
        if (isAuthenticated && user && user.role === 'admin' && token) {
            fetchOrders();
        }

    }, [isAuthenticated, user, token, API_BASE_URL, navigate, t]); // Dependencies

    // Show loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-xl text-gray-700 dark:text-gray-300">
                <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-4" />
                <span>{t.loadingOrders || 'Loading orders...'}</span>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-xl text-red-600 dark:text-red-400 p-4 text-center">
                {t.error || 'Error'}: {error}
            </div>
        );
    }

     // Show message if no orders found
     if (!orders || orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-xl text-gray-700 dark:text-gray-300 p-4 text-center">
                <span>{t.noOrdersFound || 'No orders found.'}</span>
            </div>
        );
    }


    // Display orders in a table
    return (
        <div className="container mx-auto p-4 md:p-8 max-w-6xl bg-white dark:bg-slate-900 shadow-2xl rounded-xl my-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
                {t.allOrders || 'All Orders'}
            </h1>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-slate-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {t.orderID || 'Order ID'}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {t.user || 'User'}
                            </th>
                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {t.date || 'Date'}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {t.total || 'Total'}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {t.paid || 'Paid'}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {t.delivered || 'Delivered'}
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">{t.details || 'Details'}</span>
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
                                    {/* Display user name or email, check if user object exists */}
                                    {order.user ? order.user.name || order.user.email : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                    {/* Format date */}
                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                    ${order.totalPrice?.toFixed(2) || '0.00'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {/* Display paid status with icons */}
                                    {order.isPaid ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                            {t.yes || 'Yes'}
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                                            {t.no || 'No'}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                     {/* Display delivered status with icons */}
                                    {order.isDelivered ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                            {t.yes || 'Yes'}
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                                            {t.no || 'No'}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {/* Link to order details page (TODO: Create this page) */}
                                    <Link to={`/admin/orders/${order._id}`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-600">
                                        {t.details || 'Details'}
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
