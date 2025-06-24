import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';

import { useLanguage } from '../../components/LanguageContext';

import {
    Loader2, DollarSign, ShoppingCart, Package, Users, Info,
    LineChart, BarChart3, PieChart as PieIcon, ListOrdered,
    LayoutDashboard,
    Box,
} from 'lucide-react';

const CHART_PRIMARY_COLOR = '#6366F1';
const CHART_SECONDARY_COLOR = '#34D399';
const CHART_TERTIARY_COLOR = '#FCD34D';

const PIE_COLORS = [
    '#6366F1',
    '#34D399',
    '#FCD34D',
    '#EF4444',
    '#A855F7',
    '#EC4899',
    '#0EA5E9',
    '#F97316',
];

const ORDER_STATUS_CLASSES = {
    pending: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700/50',
    processing: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-300 dark:border-blue-700/50',
    shipped: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700/50',
    delivered: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/50',
    cancelled: 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300 border-rose-300 dark:border-rose-700/50',
};

const CustomTooltip = ({ active, payload, label, currencySymbol }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <p className="label text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{label}</p>
                {payload.map((pld, index) => (
                    <p key={index} style={{ color: pld.stroke || pld.fill }} className="intro text-xs font-medium">
                        {`${pld.name}: `}
                        <span className="font-bold">
                            {pld.dataKey === 'revenue' ? `${currencySymbol || '$'}${pld.value.toFixed(2)}` : pld.value}
                        </span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const StatCard = ({ icon, title, value, color }) => {
    const iconColors = {
        green: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
        blue: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20',
        purple: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20',
        indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20',
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700
                    hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-in-out">
            <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg ${iconColors[color]}`}>
                    {React.cloneElement(icon, { size: 26, strokeWidth: 2 })}
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
                </div>
            </div>
        </div>
    );
};

const ChartContainer = ({ title, icon, children, className = '' }) => (
    <div className={`bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 ${className}`}>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
            {React.cloneElement(icon, { className: "text-gray-500 dark:text-gray-400", size: 24, strokeWidth: 2 })}
            <span>{title}</span>
        </h3>
        <div className="mt-4">
            {children}
        </div>
    </div>
);

const AdminDashboardPage = () => {
    const { t, language } = useLanguage();
    const { API_BASE_URL } = useAuth();

    const [summaryStats, setSummaryStats] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [productSalesData, setProductSalesData] = useState([]);
    const [categoryDistributionData, setCategoryDistributionData] = useState([]);
    const [orderStatusData, setOrderStatusData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        const axiosConfig = { headers: { 'accept-language': language } };

        try {
            const [
                statsRes,
                salesRes,
                productSalesRes,
                categoryRes,
                orderStatusRes,
            ] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/dashboard/summary-stats`, axiosConfig),
                axios.get(`${API_BASE_URL}/api/dashboard/sales-over-time`, axiosConfig),
                axios.get(`${API_BASE_URL}/api/dashboard/product-sales`, axiosConfig),
                axios.get(`${API_BASE_URL}/api/dashboard/category-distribution`, axiosConfig),
                axios.get(`${API_BASE_URL}/api/dashboard/order-status-distribution`, axiosConfig),
            ]);

            setSummaryStats(statsRes.data);
            setSalesData(salesRes.data);
            setProductSalesData(productSalesRes.data);
            setCategoryDistributionData(categoryRes.data);
            setOrderStatusData(orderStatusRes.data);

        } catch (err) {
            console.error("Failed to fetch dashboard data:", err);
            setError(t('adminDashboardPage.errorFetchingData') + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, t, language]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const getStatusClass = useCallback((status) => {
        return ORDER_STATUS_CLASSES[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-500/20';
    }, []);

    const translateKey = useCallback((key, prefix) => t(`${prefix}.${key}`) || key, [t]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-gray-300">
                <Loader2 size={48} className="animate-spin text-blue-500 mb-3" />
                <p>{t('general.loadingData')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="m-8 p-8 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded-lg text-center flex flex-col items-center gap-4 shadow-lg">
                <Info className="mx-auto text-rose-500 dark:text-rose-400" size={32} />
                <h2 className="text-xl font-semibold">{t('general.error')}</h2>
                <p>{error}</p>
                <button
                    onClick={fetchDashboardData}
                    className="mt-4 px-6 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors shadow-md"
                >
                    {t('general.tryAgain')}
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900 min-h-screen font-sans text-gray-900 dark:text-white">
            <header className="mb-10 pb-4 border-b border-gray-200 dark:border-slate-700">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
                    <LayoutDashboard size={36} className="text-gray-600 dark:text-gray-400" />
                    {t('adminDashboardPage.dashboardTitle')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-md">
                    {t('adminDashboardPage.welcomeMessage')}
                </p>
            </header>

            {summaryStats && (
                <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                    <StatCard icon={<DollarSign />} title={t('adminDashboardPage.totalRevenue')} value={`${t('general.currencySymbol')} ${summaryStats.totalRevenue?.toFixed(2)}`} color="green" />
                    <StatCard icon={<ShoppingCart />} title={t('adminDashboardPage.totalOrders')} value={summaryStats.totalOrders} color="blue" />
                    <StatCard icon={<Box />} title={t('adminDashboardPage.totalProducts')} value={summaryStats.totalProducts} color="purple" />
                    <StatCard icon={<Users />} title={t('adminDashboardPage.totalUsers')} value={summaryStats.totalUsers} color="indigo" />
                </section>
            )}

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                <ChartContainer title={t('adminDashboardPage.salesOverviewChartTitle')} icon={<LineChart />} className="lg:col-span-2">
                    {salesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART_PRIMARY_COLOR} stopOpacity={0.2}/><stop offset="95%" stopColor={CHART_PRIMARY_COLOR} stopOpacity={0}/></linearGradient>
                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART_SECONDARY_COLOR} stopOpacity={0.2}/><stop offset="95%" stopColor={CHART_SECONDARY_COLOR} stopOpacity={0}/></linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} vertical={false} />
                                <XAxis dataKey="date" tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.7 }} strokeOpacity={0.05} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.7 }} strokeOpacity={0.05} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip currencySymbol={t('general.currencySymbol')} />} />
                                <Legend wrapperStyle={{ fontSize: "14px", marginTop: "10px", color: 'currentColor', opacity: 0.8 }} />
                                <Area type="monotone" dataKey="revenue" name={t('adminDashboardPage.revenueLabel')} stroke={CHART_PRIMARY_COLOR} strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" dot={false} activeDot={{ r: 5 }} />
                                <Area type="monotone" dataKey="orders" name={t('adminDashboardPage.orderCountLabel')} stroke={CHART_SECONDARY_COLOR} strokeWidth={2} fillOpacity={1} fill="url(#colorOrders)" dot={false} activeDot={{ r: 5 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
                            {t('general.noDataForChart')}
                        </div>
                    )}
                </ChartContainer>

                <ChartContainer title={t('adminDashboardPage.categoryDistributionChartTitle')} icon={<PieIcon />}>
                    {categoryDistributionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={categoryDistributionData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="60%"
                                    outerRadius="85%"
                                    paddingAngle={3}
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                >
                                    {categoryDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip currencySymbol={t('general.currencySymbol')} />} />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: "10px", fontSize: "13px", color: 'currentColor', opacity: 0.8 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
                            {t('general.noDataForChart')}
                        </div>
                    )}
                </ChartContainer>

                <ChartContainer title={t('adminDashboardPage.topSellingProductsTitle')} icon={<BarChart3 />} className="lg:col-span-2">
                    {productSalesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={productSalesData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.7 }} strokeOpacity={0.05} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.7 }} strokeOpacity={0.05} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip currencySymbol={t('general.currencySymbol')} />} />
                                <Legend wrapperStyle={{ fontSize: "14px", marginTop: "10px", color: 'currentColor', opacity: 0.8 }} />
                                <Bar dataKey="quantitySold" name={t('adminDashboardPage.quantitySoldLabel')} fill={CHART_TERTIARY_COLOR} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
                            {t('general.noDataForChart')}
                        </div>
                    )}
                </ChartContainer>

                <ChartContainer title={t('adminDashboardPage.ordersByStatusTitle')} icon={<ListOrdered />}>
                    {orderStatusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={orderStatusData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} vertical={false} />
                                <XAxis dataKey="status" tickFormatter={(key) => translateKey(key, 'adminDashboardPage.orderStatuses')} tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.7 }} strokeOpacity={0.05} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.7 }} strokeOpacity={0.05} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip currencySymbol={t('general.currencySymbol')} />} />
                                <Legend wrapperStyle={{ fontSize: "14px", marginTop: "10px", color: 'currentColor', opacity: 0.8 }} />
                                <Bar dataKey="count" name={t('adminDashboardPage.orderCountLabel')} fill={CHART_PRIMARY_COLOR} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
                            {t('general.noDataForChart')}
                        </div>
                    )}
                </ChartContainer>
            </section>
        </div>
    );
};

export default AdminDashboardPage;