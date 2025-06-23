import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import { useLanguage } from '../../components/LanguageContext';
import { Loader2, DollarSign, ShoppingCart, Package, Users, Info, TrendingUp, BarChart2, PieChart as PieIcon, ClipboardList } from 'lucide-react';

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label, currencySymbol }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                <p className="label text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">{label}</p>
                {payload.map((pld, index) => (
                    <p key={index} style={{ color: pld.stroke || pld.fill }} className="intro text-xs font-medium">
                        {`${pld.name}: `}
                        <span className="font-semibold">
                            {pld.dataKey === 'revenue' ? `${currencySymbol || '$'}${pld.value.toFixed(2)}` : pld.value}
                        </span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const AdminDashboardPage = () => {
    const { t, language } = useLanguage();
    const { API_BASE_URL } = useAuth();
    const [summaryStats, setSummaryStats] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [productSalesData, setProductSalesData] = useState([]);
    const [categoryDistributionData, setCategoryDistributionData] = useState([]);
    const [orderStatusData, setOrderStatusData] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const axiosConfig = { headers: { 'accept-language': language } };
            const [statsRes, salesRes, productSalesRes, categoryRes, orderStatusRes, recentOrdersRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/dashboard/summary-stats`, axiosConfig),
                axios.get(`${API_BASE_URL}/api/dashboard/sales-over-time`, axiosConfig),
                axios.get(`${API_BASE_URL}/api/dashboard/product-sales`, axiosConfig),
                axios.get(`${API_BASE_URL}/api/dashboard/category-distribution`, axiosConfig),
                axios.get(`${API_BASE_URL}/api/dashboard/order-status-distribution`, axiosConfig),
                axios.get(`${API_BASE_URL}/api/dashboard/recent-orders`, axiosConfig)
            ]);
            setSummaryStats(statsRes.data);
            setSalesData(salesRes.data);
            setProductSalesData(productSalesRes.data);
            setCategoryDistributionData(categoryRes.data);
            setOrderStatusData(orderStatusRes.data);
            setRecentOrders(recentOrdersRes.data);
        } catch (err) {
            setError(t('adminDashboardPage.errorFetchingData') + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, t, language]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const PIE_COLORS = ['#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#ef4444', '#6366f1'];

    const getStatusClass = (status) => {
        const statuses = {
            pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border-amber-500/20',
            processing: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/10 dark:text-cyan-400 border-cyan-500/20',
            shipped: 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 border-blue-500/20',
            delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-500/20',
            cancelled: 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400 border-rose-500/20',
        };
        return statuses[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-500/20';
    };

    const translateKey = useCallback((key, prefix) => t(`${prefix}.${key}`) || key, [t]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-slate-900"><Loader2 size={48} className="animate-spin text-blue-500" /></div>;
    }
    if (error) {
        return <div className="m-8 p-8 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded-lg text-center flex flex-col items-center gap-4"><Info className="mx-auto" size={32} /><span>{error}</span></div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900 min-h-screen font-sans">
            <header className="mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {t('adminDashboardPage.dashboardTitle')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-md">
                    {t('adminDashboardPage.welcomeMessage')}
                </p>
            </header>

            {summaryStats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                    <StatCard icon={<DollarSign />} title={t('adminDashboardPage.totalRevenue')} value={`${t('general.currencySymbol')} ${summaryStats.totalRevenue?.toFixed(2)}`} color="green" />
                    <StatCard icon={<ShoppingCart />} title={t('adminDashboardPage.totalOrders')} value={summaryStats.totalOrders} color="blue" />
                    <StatCard icon={<Package />} title={t('adminDashboardPage.totalProducts')} value={summaryStats.totalProducts} color="purple" />
                    <StatCard icon={<Users />} title={t('adminDashboardPage.totalUsers')} value={summaryStats.totalUsers} color="sky" />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <ChartContainer title={t('adminDashboardPage.salesOverviewChartTitle')} icon={<TrendingUp />} className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
                            <XAxis dataKey="date" tick={{ fill: 'currentColor', fontSize: 12 }} strokeOpacity={0.4} />
                            <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} strokeOpacity={0.4} />
                            <Tooltip content={<CustomTooltip currencySymbol={t('general.currencySymbol')} />} />
                            <Legend wrapperStyle={{fontSize: "14px"}} />
                            <Area type="monotone" dataKey="revenue" name={t('adminDashboardPage.revenueLabel')} stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                            <Area type="monotone" dataKey="orders" name={t('adminDashboardPage.orderCountLabel')} stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorOrders)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <ChartContainer title={t('adminDashboardPage.categoryDistributionChartTitle')} icon={<PieIcon />}>
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                            <Pie data={categoryDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="60%" outerRadius="85%" paddingAngle={5}>
                                {categoryDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="" />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip currencySymbol={t('general.currencySymbol')} />} />
                            <Legend iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <ChartContainer title={t('adminDashboardPage.recentOrdersTitle')} icon={<ClipboardList />} className="lg:col-span-3">
                    <div className="overflow-x-auto -mx-6">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('adminDashboardPage.orderId')}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('adminDashboardPage.customer')}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('adminDashboardPage.date')}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('adminDashboardPage.total')}</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('adminDashboardPage.status')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                {recentOrders.map(order => (
                                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                            <Link to={`/dashboard/orders/${order._id}`}>{order._id.slice(-8)}</Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 font-medium">{order.user?.name || t('adminDashboardPage.guestUser')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString(language, { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{t('general.currencySymbol')}{order.totalPrice?.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <span className={`px-3 py-1 rounded-full font-semibold text-xs inline-block border ${getStatusClass(order.status)}`}>
                                                {translateKey(order.status, 'adminDashboardPage.orderStatuses')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ChartContainer>
            </div>
        </div>
    );
};

// A redesigned StatCard component for a cleaner look
const StatCard = ({ icon, title, value, color }) => {
    const colors = {
        green: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/10',
        blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10',
        purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10',
        sky: 'text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-500/10',
    };
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center space-x-4">
                <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg ${colors[color]}`}>
                    {React.cloneElement(icon, { size: 24, strokeWidth: 2 })}
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
                </div>
            </div>
        </div>
    );
};

// A redesigned ChartContainer
const ChartContainer = ({ title, icon, children, className = '' }) => (
    <div className={`bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 ${className}`}>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
            {React.cloneElement(icon, { className: "text-gray-400 dark:text-gray-500", size: 22, strokeWidth: 2 })}
            <span>{title}</span>
        </h3>
        <div className="mt-4">
            {children}
        </div>
    </div>
);

export default AdminDashboardPage;