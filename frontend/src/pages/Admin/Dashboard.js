import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell,
} from 'recharts'; // Importing necessary Recharts components
import { useLanguage } from '../../components/LanguageContext'; // Assuming LanguageContext is available

// Define placeholder data types (adjust based on your actual backend data structure)
// Example: Sales data over time
// { date: 'Jan', sales: 4000, revenue: 2400 }
// Example: Product sales count
// { name: 'Product A', sales: 150 }
// Example: Category distribution
// { name: 'Electronics', value: 300 }


const AdminChartsPage = ({ serverUrl = 'http://localhost:5000' }) => {
    // Get translation function and current language from context
    const { t, language } = useLanguage();

    // State for different types of chart data
    const [salesData, setSalesData] = useState([]);
    const [productSalesData, setProductSalesData] = useState([]);
    const [categoryDistributionData, setCategoryDistributionData] = useState([]);

    // State for loading and error handling
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch data from backend API endpoints
    useEffect(() => {
        const fetchChartData = async () => {
            try {
                setLoading(true);
                setError(null);

                // --- Fetch Sales Data (Example: Sales over time) ---
                // Replace with your actual API endpoint for sales data
                const salesRes = await fetch(`${serverUrl}/api/dashboard/sales-over-time`);
                if (!salesRes.ok) throw new Error(`Failed to fetch sales data: ${salesRes.status}`);
                const salesData = await salesRes.json();
                setSalesData(salesData);

                // --- Fetch Product Sales Data (Example: Top selling products) ---
                // Replace with your actual API endpoint for product sales data
                const productSalesRes = await fetch(`${serverUrl}/api/dashboard/product-sales`);
                 if (!productSalesRes.ok) throw new Error(`Failed to fetch product sales data: ${productSalesRes.status}`);
                const productSalesData = await productSalesRes.json();
                setProductSalesData(productSalesData);

                // --- Fetch Category Distribution Data (Example: Sales/Product count by category) ---
                // Replace with your actual API endpoint for category data
                const categoryRes = await fetch(`${serverUrl}/api/dashboard/category-distribution`);
                 if (!categoryRes.ok) throw new Error(`Failed to fetch category distribution data: ${categoryRes.status}`);
                const categoryData = await categoryRes.json();
                setCategoryDistributionData(categoryData);


            } catch (err) {
                console.error("Error fetching chart data:", err);
                setError(t.adminChartsPage?.errorFetchingData || 'حدث خطأ أثناء جلب البيانات.');
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
        // Add dependencies if the API endpoints or parameters change based on state/props
    }, [serverUrl, t.adminChartsPage?.errorFetchingData]); // Re-run if serverUrl or translation changes

    // Placeholder colors for charts (customize as needed)
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    // Render loading state
    if (loading) {
        return <div className="text-center text-gray-600 text-lg py-10">{t.adminChartsPage?.loadingData || 'جاري تحميل البيانات...'}</div>;
    }

    // Render error state
    if (error) {
        return <div className="text-center text-red-600 text-lg p-4 bg-red-100 rounded-md py-10">{t.general?.error || 'خطأ'}: {error}</div>;
    }

    if (salesData.length === 0 && productSalesData.length === 0 && categoryDistributionData.length === 0) {
         return <div className="text-center text-gray-500 text-lg py-10">{t.adminChartsPage?.noDataAvailable || 'لا توجد بيانات لعرض الرسوم البيانية.'}</div>;
    }
    return (
        <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
                {t.adminChartsPage?.dashboardTitle || 'لوحة تحكم الإحصائيات'}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">
                        {t.adminChartsPage?.salesOverTimeTitle || 'المبيعات بمرور الوقت'}
                    </h3>
                    {salesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="date" stroke="#555" />
                                <YAxis stroke="#555" />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} name={t.adminChartsPage?.salesLabel || 'المبيعات'} />

                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                         <p className="text-center text-gray-500 dark:text-gray-400">{t.adminChartsPage?.noSalesData || 'لا توجد بيانات مبيعات.'}</p>
                    )}
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                     <h3 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">
                        {t.adminChartsPage?.topProductsTitle || 'المنتجات الأكثر مبيعاً'}
                    </h3>
                    {productSalesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={productSalesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="name" stroke="#555" />
                                <YAxis stroke="#555" />
                                <Tooltip />
                                <Legend />

                                <Bar dataKey="sales" fill="#82ca9d" name={t.adminChartsPage?.salesCountLabel || 'عدد المبيعات'} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                         <p className="text-center text-gray-500 dark:text-gray-400">{t.adminChartsPage?.noProductSalesData || 'لا توجد بيانات مبيعات المنتجات.'}</p>
                    )}
                </div>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow lg:col-span-2"> 
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">
                        {t.adminChartsPage?.categoryDistributionTitle || 'توزيع حسب الفئة'}
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
                                    label 
                                >
                                    {categoryDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                         <p className="text-center text-gray-500 dark:text-gray-400">{t.adminChartsPage?.noCategoryData || 'لا توجد بيانات فئات.'}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminChartsPage;
