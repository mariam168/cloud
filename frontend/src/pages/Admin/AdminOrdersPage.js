import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../components/LanguageContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react'; 
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
        } catch (err) {
            setError(t('adminOrdersPage.errorFetchingOrdersToast'));
        } finally {
            setLoadingOrders(false);
        }
    }, [token, API_BASE_URL, t]);

    useEffect(() => {
        if (loadingAuth) return;
        if (!currentUser || currentUser.role !== 'admin') {
            navigate('/');
            return;
        }
        if (token) fetchOrders();
    }, [currentUser, token, navigate, loadingAuth, fetchOrders]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
            style: 'currency', currency: t('general.currencyCode')
        }).format(Number(price || 0));
    };

    if (loadingAuth || loadingOrders) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div>;
    }

    if (error) {
        return <div className="text-xl text-red-600 text-center p-8">{error}</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-7xl bg-white rounded-xl my-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">{t('adminOrdersPage.allOrders')}</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('adminOrdersPage.user')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('adminOrdersPage.date')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('adminOrdersPage.total')}</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('adminOrdersPage.paid')}</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('adminOrdersPage.delivered')}</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Details</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500" title={order._id}>...{order._id.slice(-8)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.user?.name || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{formatPrice(order.totalPrice)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">{order.isPaid ? <CheckCircle className="text-green-500 inline-block"/> : <XCircle className="text-red-500 inline-block"/>}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">{order.isDelivered ? <CheckCircle className="text-green-500 inline-block"/> : <XCircle className="text-red-500 inline-block"/>}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/admin/orders/${order._id}`} className="text-blue-600 hover:text-blue-900">{t('adminOrdersPage.details')}</Link>
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