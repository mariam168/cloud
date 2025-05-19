import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { useLanguage } from '../../components/LanguageContext';

const AdminDashboardPage = ({ serverUrl = 'http://localhost:5000' }) => {
    const { t, language } = useLanguage();
    const [summaryStats, setSummaryStats] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [productSalesData, setProductSalesData] = useState([]);
    const [categoryDistributionData, setCategoryDistributionData] = useState([]);
    const [orderStatusData, setOrderStatusData] = useState([]);
    const [userRegistrationData, setUserRegistrationData] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                const statsRes = await axios.get(`${serverUrl}/api/dashboard/summary-stats`);
                setSummaryStats(statsRes.data);

                const salesRes = await axios.get(`${serverUrl}/api/dashboard/sales-over-time`);
                setSalesData(salesRes.data);

                const productSalesRes = await axios.get(`${serverUrl}/api/dashboard/product-sales`);
                setProductSalesData(productSalesRes.data);

                const categoryRes = await axios.get(`${serverUrl}/api/dashboard/category-distribution`);
                setCategoryDistributionData(categoryRes.data);

                const orderStatusRes = await axios.get(`${serverUrl}/api/dashboard/order-status-distribution`);
                setOrderStatusData(orderStatusRes.data);

                const userRegRes = await axios.get(`${serverUrl}/api/dashboard/user-registration-over-time`);
                setUserRegistrationData(userRegRes.data);

                const recentOrdersRes = await axios.get(`${serverUrl}/api/dashboard/recent-orders`);
                setRecentOrders(recentOrdersRes.data);

            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError(t('adminDashboardPage.errorFetchingData') || 'Error fetching data.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [serverUrl, t]);

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A52A2A', '#800080'];

    if (loading) {
        return <div className="text-center text-gray-600 text-lg py-10">{t('general.loading') || 'Loading Data...'}</div>;
    }

    if (error) {
        return <div className="text-center text-red-600 text-lg p-4 bg-red-100 rounded-md py-10">{t('general.error') || 'Error'}: {error}</div>;
    }

    if (!summaryStats && salesData.length === 0 && productSalesData.length === 0 && categoryDistributionData.length === 0 && orderStatusData.length === 0 && userRegistrationData.length === 0 && recentOrders.length === 0) {
         return <div className="text-center text-gray-500 text-lg py-10">{t('adminDashboardPage.noDataAvailable') || 'No data available to display dashboard.'}</div>;
    }

    return (
        <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
                {t('adminDashboardPage.dashboardTitle') || 'Dashboard Overview'}
            </h2>

            {summaryStats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex flex-col items-center text-center">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-white">{t('adminDashboardPage.totalRevenue') || 'Total Revenue'}</h3>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                             {t('shopPage.currencySymbol') || "EGP"} {summaryStats.totalRevenue?.toFixed(2) || '0.00'}
                        </p>
                    </div>
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex flex-col items-center text-center">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-white">{t('adminDashboardPage.totalOrders') || 'Total Orders'}</h3>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                             {summaryStats.totalOrders || 0}
                        </p>
                    </div>
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex flex-col items-center text-center">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-white">{t('adminDashboardPage.totalProducts') || 'Total Products'}</h3>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                             {summaryStats.totalProducts || 0}
                        </p>
                    </div>
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex flex-col items-center text-center">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-white">{t('adminDashboardPage.totalUsers') || 'Total Users'}</h3>
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                             {summaryStats.totalUsers || 0}
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">
                        {t('adminDashboardPage.salesOverviewChartTitle') || 'Sales Overview (Last 6 Months)'}
                    </h3>
                    {salesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="date" stroke="#555" />
                                <YAxis stroke="#555" />
                                <Tooltip formatter={(value, name) => {
                                    if (name === (t('adminDashboardPage.revenueLabel') || 'Revenue')) return [`${t('shopPage.currencySymbol') || "EGP"} ${value?.toFixed(2)}`, name];
                                    return [value, name];
                                }} />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} name={t('adminDashboardPage.revenueLabel') || 'Revenue'} />
                                <Line type="monotone" dataKey="orders" stroke="#82ca9d" name={t('adminDashboardPage.orderCountLabel') || 'Order Count'} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                         <p className="text-center text-gray-500 dark:text-gray-400">{t('adminDashboardPage.noSalesData') || 'No sales data available.'}</p>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                     <h3 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">
                         {t('adminDashboardPage.topSellingProductsTitle') || 'Top Selling Products'}
                     </h3>
                    {productSalesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={productSalesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis
                                    dataKey="name"
                                    stroke="#555"
                                    tickFormatter={(value) => value?.[language] || value?.en || value?.ar || value}
                                />
                                <YAxis stroke="#555" />
                                <Tooltip
                                     formatter={(value, name, props) => {
                                         if (name === (t('adminDashboardPage.quantitySoldLabel') || 'Quantity Sold')) {
                                             return [`${value} ${t('adminDashboardPage.itemsSoldLabel') || 'items sold'}`, props.payload.name?.[language] || props.payload.name?.en || props.payload.name?.ar || props.payload.name];
                                         }
                                          if (name === (t('adminDashboardPage.revenueLabel') || 'Revenue')) {
                                             return [`${t('shopPage.currencySymbol') || "EGP"} ${value?.toFixed(2)}`, props.payload.name?.[language] || props.payload.name?.en || props.payload.name?.ar || props.payload.name];
                                          }
                                         return [value, name];
                                     }}
                                />
                                <Legend />
                                <Bar dataKey="quantitySold" fill="#82ca9d" name={t('adminDashboardPage.quantitySoldLabel') || 'Quantity Sold'} />
                                <Bar dataKey="revenue" fill="#8884d8" name={t('adminDashboardPage.revenueLabel') || 'Revenue'} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                         <p className="text-center text-gray-500 dark:text-gray-400">{t('adminDashboardPage.noTopProductsData') || 'No top selling products data available.'}</p>
                    )}
                </div>

                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                     <h3 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">
                         {t('adminDashboardPage.categoryDistributionChartTitle') || 'Category Distribution'}
                     </h3>
                    {categoryDistributionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryDistributionData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                >
                                    {categoryDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                     formatter={(value, name, props) => [`${value} ${t('adminDashboardPage.items') || 'items'}`, props.payload.name]}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                         <p className="text-center text-gray-500 dark:text-gray-400">{t('adminDashboardPage.noCategoryData') || 'No category data available.'}</p>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                     <h3 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">
                         {t('adminDashboardPage.ordersByStatusTitle') || 'Orders by Status'}
                     </h3>
                    {orderStatusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={orderStatusData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="status" stroke="#555" />
                                <YAxis stroke="#555" />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#ffc658" name={t('adminDashboardPage.orderCountLabel') || 'Order Count'} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                         <p className="text-center text-gray-500 dark:text-gray-400">{t('adminDashboardPage.noOrderStatusData') || 'No order status data available.'}</p>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow lg:col-span-2">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">
                        {t('adminDashboardPage.userRegistrationTitle') || 'User Registration Over Time'}
                    </h3>
                    {userRegistrationData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={userRegistrationData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="date" stroke="#555" />
                                <YAxis stroke="#555" />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="users" stroke="#ff7300" activeDot={{ r: 8 }} name={t('adminDashboardPage.usersRegisteredLabel') || 'Users Registered'} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                         <p className="text-center text-gray-500 dark:text-gray-400">{t('adminDashboardPage.noUserRegistrationData') || 'No user registration data available.'}</p>
                    )}
                </div>

             
            </div>
        </div>
    );
};

export default AdminDashboardPage;
