import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { useLanguage } from '../../components/LanguageContext';
import { Loader2, DollarSign, ShoppingCart, Package, Users, Info, CalendarDays, ClipboardList } from 'lucide-react'; // Added DollarSign, Users, Info, ClipboardList

const AdminDashboardPage = () => { // Removed serverUrl prop, using API_BASE_URL from useAuth
    const { t, language } = useLanguage();
    const { API_BASE_URL } = useAuth(); // Assuming API_BASE_URL is available from useAuth

    const [summaryStats, setSummaryStats] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [productSalesData, setProductSalesData] = useState([]);
    const [categoryDistributionData, setCategoryDistributionData] = useState([]);
    const [orderStatusData, setOrderStatusData] = useState([]);
    const [userRegistrationData, setUserRegistrationData] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch data from API_BASE_URL
            const statsRes = await axios.get(`${API_BASE_URL}/api/dashboard/summary-stats`);
            setSummaryStats(statsRes.data);

            const salesRes = await axios.get(`${API_BASE_URL}/api/dashboard/sales-over-time`);
            setSalesData(salesRes.data.map(item => ({
                ...item,
                date: language === 'ar' ? new Date(item.date).toLocaleDateString('ar-EG', { month: 'short', year: 'numeric' }) : new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            }))); // Format date for display

            const productSalesRes = await axios.get(`${API_BASE_URL}/api/dashboard/product-sales`);
            setProductSalesData(productSalesRes.data);

            const categoryRes = await axios.get(`${API_BASE_URL}/api/dashboard/category-distribution`);
            setCategoryDistributionData(categoryRes.data);

            const orderStatusRes = await axios.get(`${API_BASE_URL}/api/dashboard/order-status-distribution`);
            setOrderStatusData(orderStatusRes.data);

            const userRegRes = await axios.get(`${API_BASE_URL}/api/dashboard/user-registration-over-time`);
             setUserRegistrationData(userRegRes.data.map(item => ({
                ...item,
                date: language === 'ar' ? new Date(item.date).toLocaleDateString('ar-EG', { month: 'short', year: 'numeric' }) : new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            }))); // Format date for display

            const recentOrdersRes = await axios.get(`${API_BASE_URL}/api/dashboard/recent-orders`);
            setRecentOrders(recentOrdersRes.data);

        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError(t('adminDashboardPage.errorFetchingData') + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, t, language]); // Added language to dependencies for date formatting

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Colors for Pie Charts (can be customized for a calmer palette)
    const PIE_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28', '#A52A2A', '#800080', '#0088FE', '#FF8042'];

    // Helper to get status class names
    const getStatusClass = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'shipped': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
            case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300';
        }
    };
    const translateOrderStatus = useCallback((statusKey) => {
        return t(`adminDashboardPage.orderStatuses.${statusKey}`) || statusKey;
    }, [t]);


    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-xl font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <Loader2 size={64} className="text-blue-500 dark:text-blue-400 animate-spin mb-4" />
                <span className="text-2xl">{t('general.loading')}</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md mx-auto border border-gray-200 dark:border-gray-700">
                <Info size={64} className="mb-6 text-red-500 dark:text-red-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('general.error')}</h2>
                <p className="text-lg text-red-600 dark:text-red-300">{error}</p>
            </div>
        );
    }

    if (!summaryStats && salesData.length === 0 && productSalesData.length === 0 && categoryDistributionData.length === 0 && orderStatusData.length === 0 && userRegistrationData.length === 0 && recentOrders.length === 0) {
         return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md mx-auto border border-gray-200 dark:border-gray-700">
                <Info size={64} className="mb-6 text-gray-400 dark:text-gray-500" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('adminDashboardPage.noDataAvailableTitle')}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">{t('adminDashboardPage.noDataAvailable')}</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 lg:p-10 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"> {/* Main content wrapper */}
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 dark:text-white mb-10 border-b-2 border-blue-500/50 dark:border-blue-400/50 pb-4 inline-block mx-auto leading-tight">
                {t('adminDashboardPage.dashboardTitle')}
            </h2>

            {/* Summary Stats Cards */}
            {summaryStats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-sm flex flex-col items-center text-center border border-gray-100 dark:border-gray-600 transition-all duration-200 hover:shadow-md hover:scale-102">
                        <DollarSign size={40} className="text-green-600 dark:text-green-400 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('adminDashboardPage.totalRevenue')}</h3>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                             {t('general.currencySymbol')} {summaryStats.totalRevenue?.toFixed(2) || '0.00'}
                        </p>
                    </div>
                     <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-sm flex flex-col items-center text-center border border-gray-100 dark:border-gray-600 transition-all duration-200 hover:shadow-md hover:scale-102">
                        <ShoppingCart size={40} className="text-blue-600 dark:text-blue-400 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('adminDashboardPage.totalOrders')}</h3>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                             {summaryStats.totalOrders || 0}
                        </p>
                    </div>
                     <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-sm flex flex-col items-center text-center border border-gray-100 dark:border-gray-600 transition-all duration-200 hover:shadow-md hover:scale-102">
                        <Package size={40} className="text-purple-600 dark:text-purple-400 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('adminDashboardPage.totalProducts')}</h3>
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                             {summaryStats.totalProducts || 0}
                        </p>
                    </div>
                     <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-sm flex flex-col items-center text-center border border-gray-100 dark:border-gray-600 transition-all duration-200 hover:shadow-md hover:scale-102">
                        <Users size={40} className="text-indigo-600 dark:text-indigo-400 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('adminDashboardPage.totalUsers')}</h3>
                        <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                             {summaryStats.totalUsers || 0}
                        </p>
                    </div>
                </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                        {t('adminDashboardPage.salesOverviewChartTitle')}
                    </h3>
                    {salesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={salesData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.5} />
                                <XAxis dataKey="date" stroke="#555" tick={{ fill: language === 'ar' ? '#666' : '#555', fontSize: 12 }} />
                                <YAxis stroke="#555" tick={{ fill: language === 'ar' ? '#666' : '#555', fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: language === 'ar' ? '#f0f0f0' : '#fff', borderColor: '#ccc', borderRadius: '8px', boxShadow: '0px 0px 5px rgba(0,0,0,0.1)' }}
                                    labelStyle={{ color: '#333' }}
                                    itemStyle={{ color: '#555' }}
                                    formatter={(value, name) => {
                                    if (name === (t('adminDashboardPage.revenueLabel'))) return [`${t('general.currencySymbol')} ${value?.toFixed(2)}`, name];
                                    return [value, name];
                                }} />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 6 }} name={t('adminDashboardPage.revenueLabel')} strokeWidth={2} />
                                <Line type="monotone" dataKey="orders" stroke="#82ca9d" name={t('adminDashboardPage.orderCountLabel')} strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                         <p className="text-center text-gray-500 dark:text-gray-400">{t('adminDashboardPage.noSalesData')}</p>
                    )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
                     <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                         {t('adminDashboardPage.topSellingProductsTitle')}
                     </h3>
                    {productSalesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={productSalesData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.5} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#555"
                                    tickFormatter={(value) => value?.[language] || value?.en || value?.ar || value}
                                    tick={{ fill: language === 'ar' ? '#666' : '#555', fontSize: 12 }}
                                    interval={0} // Show all labels
                                    angle={-45} // Rotate labels to prevent overlap
                                    textAnchor="end" // Align text to the end of the tick
                                    height={50} // Give more space for rotated labels
                                />
                                <YAxis stroke="#555" tick={{ fill: language === 'ar' ? '#666' : '#555', fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: language === 'ar' ? '#f0f0f0' : '#fff', borderColor: '#ccc', borderRadius: '8px', boxShadow: '0px 0px 5px rgba(0,0,0,0.1)' }}
                                    labelStyle={{ color: '#333' }}
                                    itemStyle={{ color: '#555' }}
                                     formatter={(value, name, props) => {
                                         if (name === (t('adminDashboardPage.quantitySoldLabel'))) {
                                             return [`${value} ${t('adminDashboardPage.itemsSoldLabel')}`, props.payload.name?.[language] || props.payload.name?.en || props.payload.name?.ar || props.payload.name];
                                         }
                                          if (name === (t('adminDashboardPage.revenueLabel'))) {
                                             return [`${t('general.currencySymbol')} ${value?.toFixed(2)}`, props.payload.name?.[language] || props.payload.name?.en || props.payload.name?.ar || props.payload.name];
                                          }
                                         return [value, name];
                                     }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                <Bar dataKey="quantitySold" fill="#82ca9d" name={t('adminDashboardPage.quantitySoldLabel')} />
                                <Bar dataKey="revenue" fill="#8884d8" name={t('adminDashboardPage.revenueLabel')} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                         <p className="text-center text-gray-500 dark:text-gray-400">{t('adminDashboardPage.noTopProductsData')}</p>
                    )}
                </div>

                 <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
                     <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                         {t('adminDashboardPage.categoryDistributionChartTitle')}
                     </h3>
                    {categoryDistributionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryDistributionData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => `${name?.[language] || name?.en || name?.ar || name} (${(percent * 100).toFixed(0)}%)`} // Translate category names
                                    labelLine={false} // Disable label lines for cleaner look
                                >
                                    {categoryDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: language === 'ar' ? '#f0f0f0' : '#fff', borderColor: '#ccc', borderRadius: '8px', boxShadow: '0px 0px 5px rgba(0,0,0,0.1)' }}
                                    labelStyle={{ color: '#333' }}
                                    itemStyle={{ color: '#555' }}
                                     formatter={(value, name, props) => [`${value} ${t('adminDashboardPage.items')}`, props.payload.name?.[language] || props.payload.name?.en || props.payload.name?.ar || props.payload.name]}
                                />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                         <p className="text-center text-gray-500 dark:text-gray-400">{t('adminDashboardPage.noCategoryData')}</p>
                    )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
                     <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                         {t('adminDashboardPage.ordersByStatusTitle')}
                     </h3>
                    {orderStatusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={orderStatusData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.5} />
                                <XAxis dataKey="status" stroke="#555" tickFormatter={translateOrderStatus} tick={{ fill: language === 'ar' ? '#666' : '#555', fontSize: 12 }} />
                                <YAxis stroke="#555" tick={{ fill: language === 'ar' ? '#666' : '#555', fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: language === 'ar' ? '#f0f0f0' : '#fff', borderColor: '#ccc', borderRadius: '8px', boxShadow: '0px 0px 5px rgba(0,0,0,0.1)' }}
                                    labelStyle={{ color: '#333' }}
                                    itemStyle={{ color: '#555' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                <Bar dataKey="count" fill="#ffc658" name={t('adminDashboardPage.orderCountLabel')} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                         <p className="text-center text-gray-500 dark:text-gray-400">{t('adminDashboardPage.noOrderStatusData')}</p>
                    )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 lg:col-span-2">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                        {t('adminDashboardPage.userRegistrationTitle')}
                    </h3>
                    {userRegistrationData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={userRegistrationData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.5} />
                                <XAxis dataKey="date" stroke="#555" tick={{ fill: language === 'ar' ? '#666' : '#555', fontSize: 12 }} />
                                <YAxis stroke="#555" tick={{ fill: language === 'ar' ? '#666' : '#555', fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: language === 'ar' ? '#f0f0f0' : '#fff', borderColor: '#ccc', borderRadius: '8px', boxShadow: '0px 0px 5px rgba(0,0,0,0.1)' }}
                                    labelStyle={{ color: '#333' }}
                                    itemStyle={{ color: '#555' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                <Line type="monotone" dataKey="users" stroke="#ff7300" activeDot={{ r: 6 }} name={t('adminDashboardPage.usersRegisteredLabel')} strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                         <p className="text-center text-gray-500 dark:text-gray-400">{t('adminDashboardPage.noUserRegistrationData')}</p>
                    )}
                </div>

                {/* Recent Orders Table */}
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 lg:col-span-2">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <ClipboardList size={24} className="text-gray-600 dark:text-gray-300" />
                        {t('adminDashboardPage.recentOrdersTitle')}
                    </h3>
                    {recentOrders.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                <thead className="bg-gray-100 dark:bg-gray-600">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            {t('adminDashboardPage.orderId')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            {t('adminDashboardPage.date')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            {t('adminDashboardPage.customer')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            {t('adminDashboardPage.total')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            {t('adminDashboardPage.status')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                                    {recentOrders.map(order => (
                                        <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                <Link to={`/dashboard/orders/${order._id}`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                                    {order._id.substring(0, 8)}...
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                {order.user?.name || t('adminDashboardPage.guestUser')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                {t('shopPage.currencySymbol')} {order.totalPrice?.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                                                    {translateOrderStatus(order.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400">{t('adminDashboardPage.noRecentOrders')}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;