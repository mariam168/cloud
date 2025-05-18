import React, { useState, useEffect } from 'react';
// Assuming LanguageContext is in src/components
import { useLanguage } from '../../components/LanguageContext';

// Assuming Card component is in src/components/ui or installed via shadcn/ui
// Use the correct path based on your project structure
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"; // Corrected path for basic Card or shadcn/ui

// Import recharts components for charts
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from 'recharts';

// Define your backend server URL
const SERVER_URL = 'http://localhost:5000'; // <-- Change this to your actual backend URL

function App() {
    const { t } = useLanguage();

    // State for fetched and processed data
    const [stockData, setStockData] = useState([]);
    const [categoryDistributionData, setCategoryDistributionData] = useState([]);
    const [salesOverviewData, setSalesOverviewData] = useState([]);
    const [userCount, setUserCount] = useState(0); // State for user count
    const [topSellingProductsData, setTopSellingProductsData] = useState([]); // State for top selling products
    const [ordersByStatusData, setOrdersByStatusData] = useState([]); // State for orders by status

    // State for loading indicators
    const [isLoadingStock, setIsLoadingStock] = useState(true);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [isLoadingSales, setIsLoadingSales] = useState(true);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true); // Loading for users
    const [isLoadingTopProducts, setIsLoadingTopProducts] = useState(true); // Loading for top products
    const [isLoadingOrderStatus, setIsLoadingOrderStatus] = useState(true); // Loading for order status

    // State for errors
    const [errorStock, setErrorStock] = useState(null);
    const [errorCategories, setErrorCategories] = useState(null);
    const [errorSales, setErrorSales] = useState(null);
    const [errorUsers, setErrorUsers] = useState(null); // Error for users
    const [errorTopProducts, setErrorTopProducts] = useState(null); // Error for top products
    const [errorOrderStatus, setErrorOrderStatus] = useState(null); // Error for order status

    // Colors for the Pie Charts (can be customized)
    const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A280F3', '#FF6666', '#66C2A5', '#FC8D62', '#8DA0CB', '#E78AC3'];
    const STATUS_COLORS = { // Colors for order statuses - customize as needed
        'Pending': '#FFBB28',
        'Processing': '#00C49F',
        'Shipped': '#0088FE',
        'Delivered': '#66C2A5',
        'Cancelled': '#FF6666',
        'Default': '#A280F3', // For any status not explicitly listed
    };


    // --- Data Fetching and Processing ---

    // Effect to fetch Product Stock Data
    useEffect(() => {
        const fetchStockData = async () => {
            setIsLoadingStock(true);
            setErrorStock(null);
            try {
                const response = await fetch(`${SERVER_URL}/api/products`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const products = await response.json();

                // Process product data to get stock levels
                // Uses product.stock if available. If not, it will be undefined (charts might show 0)
                const processedStockData = products.map(product => ({
                    name: product.name,
                    stock: product.stock // Use the actual stock from the backend
                }));

                setStockData(processedStockData);

            } catch (error) {
                console.error("Error fetching stock data:", error);
                setErrorStock(t.adminDashboardPage?.errorFetchingStock || "Failed to fetch stock data.");
            } finally {
                setIsLoadingStock(false);
            }
        };

        fetchStockData();
    }, [SERVER_URL, t.adminDashboardPage]); // Dependency array

    // Effect to fetch Category Distribution Data
    useEffect(() => {
        const fetchCategoryData = async () => {
            setIsLoadingCategories(true);
            setErrorCategories(null);
            try {
                // Fetch both products and categories
                const [productsResponse, categoriesResponse] = await Promise.all([
                    fetch(`${SERVER_URL}/api/products`),
                    fetch(`${SERVER_URL}/api/categories`)
                ]);

                if (!productsResponse.ok) throw new Error(`HTTP error fetching products! status: ${productsResponse.status}`);
                if (!categoriesResponse.ok) throw new Error(`HTTP error fetching categories! status: ${categoriesResponse.status}`);

                const products = await productsResponse.json();
                const categories = await categoriesResponse.json();

                // Create a map of category ID to category name
                const categoryMap = categories.reduce((map, category) => {
                    map[category._id] = category.name;
                    return map;
                }, {});

                // Count products per category using the category ID from the product and the category map
                const categoryCounts = products.reduce((counts, product) => {
                    // Use the category ID from the product to find the category name
                    const categoryName = product.category ? categoryMap[product.category] || 'Uncategorized' : 'Uncategorized';
                    counts[categoryName] = (counts[categoryName] || 0) + 1;
                    return counts;
                }, {});

                // Convert counts object to array format for recharts PieChart
                const processedCategoryData = Object.keys(categoryCounts).map(name => ({
                    name,
                    value: categoryCounts[name]
                }));

                setCategoryDistributionData(processedCategoryData);

            } catch (error) {
                console.error("Error fetching category data:", error);
                setErrorCategories(t.adminDashboardPage?.errorFetchingCategories || "Failed to fetch category data.");
            } finally {
                setIsLoadingCategories(false);
            }
        };

        fetchCategoryData();
    }, [SERVER_URL, t.adminDashboardPage]); // Dependency array

    // Effect to fetch Sales Overview Data
    useEffect(() => {
        const fetchSalesData = async () => {
            setIsLoadingSales(true);
            setErrorSales(null);
            try {
                const response = await fetch(`${SERVER_URL}/api/orders`); // Assuming this endpoint exists via orderRoutes
                if (!response.ok) {
                     if (response.status === 404) {
                         console.warn("Orders endpoint not found. Skipping sales data fetch.");
                         setErrorSales("Orders endpoint not found or not accessible.");
                         setIsLoadingSales(false);
                         return;
                     }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const orders = await response.json();

                // Process order data to get monthly sales
                const monthlySales = orders.reduce((acc, order) => {
                    if (order.createdAt || order.date) {
                        const orderDate = new Date(order.createdAt || order.date);
                        if (!isNaN(orderDate)) {
                            const month = orderDate.toLocaleString('default', { month: 'short' });
                            const year = orderDate.getFullYear();
                            const monthYear = `${month} ${year}`;

                            const orderTotal = order.total || 0;

                            acc[monthYear] = (acc[monthYear] || 0) + orderTotal;
                        } else {
                             console.warn("Invalid date found in order:", order);
                        }
                    } else {
                         console.warn("Order missing date field (createdAt or date):", order);
                    }
                    return acc;
                }, {});

                // Convert monthlySales object to array format for recharts LineChart
                const processedSalesData = Object.keys(monthlySales).map(monthYear => ({
                    month: monthYear,
                    sales: monthlySales[monthYear]
                }));

                // Sort by date for a meaningful line chart
                processedSalesData.sort((a, b) => new Date(a.month) - new Date(b.month));

                setSalesOverviewData(processedSalesData);

            } catch (error) {
                console.error("Error fetching sales data:", error);
                 if (error.message.includes('404')) {
                     setErrorSales(t.adminDashboardPage?.errorFetchingSales + " (Orders endpoint not found or not accessible).");
                 } else {
                    setErrorSales(t.adminDashboardPage?.errorFetchingSales || "Failed to fetch sales data.");
                 }

            } finally {
                setIsLoadingSales(false);
            }
        };

        fetchSalesData();
    }, [SERVER_URL, t.adminDashboardPage]); // Dependency array

    // Effect to fetch User Count
    // Assumes an endpoint like /api/auth/users exists and returns an array of users
    useEffect(() => {
        const fetchUserCount = async () => {
            setIsLoadingUsers(true);
            setErrorUsers(null);
            try {
                // ** IMPORTANT: Replace with your actual endpoint to get users **
                // This is an assumption based on 'authRoutes' import
                const response = await fetch(`${SERVER_URL}/api/auth/users`);
                 if (!response.ok) {
                     if (response.status === 404) {
                         console.warn("Users endpoint not found. Skipping user count fetch.");
                         setErrorUsers("Users endpoint not found or not accessible. (Assumed /api/auth/users)");
                         setIsLoadingUsers(false);
                         return;
                     }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const users = await response.json();
                setUserCount(users.length); // Assuming the response is an array of users

            } catch (error) {
                console.error("Error fetching user data:", error);
                 if (error.message.includes('404')) {
                     setErrorUsers(t.adminDashboardPage?.errorFetchingUsers + " (Assumed /api/auth/users endpoint not found).");
                 } else {
                    setErrorUsers(t.adminDashboardPage?.errorFetchingUsers || "Failed to fetch user data.");
                 }
            } finally {
                setIsLoadingUsers(false);
            }
        };

        fetchUserCount();
    }, [SERVER_URL, t.adminDashboardPage]); // Dependency array

    // Effect to fetch Top Selling Products
    // Fetches orders and products to calculate total quantity sold per product
    useEffect(() => {
        const fetchTopSellingProducts = async () => {
            setIsLoadingTopProducts(true);
            setErrorTopProducts(null);
            try {
                 // Fetch both orders and products
                const [ordersResponse, productsResponse] = await Promise.all([
                    fetch(`${SERVER_URL}/api/orders`),
                    fetch(`${SERVER_URL}/api/products`)
                ]);

                if (!ordersResponse.ok) throw new Error(`HTTP error fetching orders! status: ${ordersResponse.status}`);
                if (!productsResponse.ok) throw new Error(`HTTP error fetching products! status: ${productsResponse.status}`);

                const orders = await ordersResponse.json();
                const products = await productsResponse.json();

                // Create a map of product ID to product name
                const productMap = products.reduce((map, product) => {
                    map[product._id] = product.name;
                    return map;
                }, {});

                // Calculate total quantity sold per product
                const productSales = orders.reduce((acc, order) => {
                    // Assuming order.items is an array of objects like { product: 'productId', quantity: N }
                    if (order.items && Array.isArray(order.items)) {
                        order.items.forEach(item => {
                            const productId = item.product; // Assuming 'product' field holds product ID
                            const quantity = item.quantity || 0; // Assuming 'quantity' field

                            if (productId) {
                                acc[productId] = (acc[productId] || 0) + quantity;
                            }
                        });
                    } else {
                         console.warn("Order missing items array or items format is unexpected:", order);
                    }
                    return acc;
                }, {});

                // Convert sales data to array format for recharts, using product names
                const processedTopProductsData = Object.keys(productSales).map(productId => ({
                    name: productMap[productId] || `Product ID: ${productId}`, // Use product name or ID if name not found
                    quantitySold: productSales[productId]
                }));

                // Sort by quantity sold in descending order and take top N (e.g., top 5)
                processedTopProductsData.sort((a, b) => b.quantitySold - a.quantitySold);
                const topN = processedTopProductsData.slice(0, 5); // Get top 5

                setTopSellingProductsData(topN);

            } catch (error) {
                console.error("Error fetching top selling products data:", error);
                 if (error.message.includes('404')) {
                     setErrorTopProducts(t.adminDashboardPage?.errorFetchingTopProducts + " (Orders or Products endpoint not found).");
                 } else {
                    setErrorTopProducts(t.adminDashboardPage?.errorFetchingTopProducts || "Failed to fetch top selling products data.");
                 }
            } finally {
                setIsLoadingTopProducts(false);
            }
        };

        fetchTopSellingProducts();
    }, [SERVER_URL, t.adminDashboardPage]); // Dependency array

    // Effect to fetch Orders by Status
    // Fetches orders and counts them by their status field
    useEffect(() => {
        const fetchOrdersByStatus = async () => {
            setIsLoadingOrderStatus(true);
            setErrorOrderStatus(null);
            try {
                const response = await fetch(`${SERVER_URL}/api/orders`); // Assuming this endpoint exists
                if (!response.ok) {
                     if (response.status === 404) {
                         console.warn("Orders endpoint not found. Skipping order status fetch.");
                         setErrorOrderStatus("Orders endpoint not found or not accessible.");
                         setIsLoadingOrderStatus(false);
                         return;
                     }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const orders = await response.json();

                // Count orders by status
                const statusCounts = orders.reduce((counts, order) => {
                    const status = order.status || 'Unknown'; // Assuming 'status' field exists, default to 'Unknown'
                    counts[status] = (counts[status] || 0) + 1;
                    return counts;
                }, {});

                // Convert statusCounts object to array format for recharts PieChart
                const processedOrderStatusData = Object.keys(statusCounts).map(status => ({
                    name: status,
                    value: statusCounts[status]
                }));

                setOrdersByStatusData(processedOrderStatusData);

            } catch (error) {
                console.error("Error fetching order status data:", error);
                 if (error.message.includes('404')) {
                     setErrorOrderStatus(t.adminDashboardPage?.errorFetchingOrderStatus + " (Orders endpoint not found).");
                 } else {
                    setErrorOrderStatus(t.adminDashboardPage?.errorFetchingOrderStatus || "Failed to fetch order status data.");
                 }
            } finally {
                setIsLoadingOrderStatus(false);
            }
        };

        fetchOrdersByStatus();
    }, [SERVER_URL, t.adminDashboardPage]); // Dependency array


    return (
        <div className="App container mx-auto p-4 min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300"> {/* Added dark mode background */}
            {/* Header */}
            <header className="text-center my-8">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white"> {/* Added dark mode */}
                    {t.adminDashboardPage?.dashboardTitle || 'Admin Dashboard'} {/* Use translated title */}
                </h1>
            </header>

            {/* Main Content Area - Displaying Charts */}
            {/* Use grid for layout, ensuring responsiveness */}
            <main className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                 {/* Total Users Card */}
                 <Card className="dark:bg-gray-800 col-span-1 flex flex-col items-center justify-center p-6"> {/* Added dark mode */}
                     <CardHeader className="pb-2">
                         <CardTitle className="text-lg font-medium text-gray-800 dark:text-white text-center">{t.adminDashboardPage?.userCountTitle || "Total Users"}</CardTitle> {/* Added dark mode */}
                     </CardHeader>
                     <CardContent className="text-center">
                         {isLoadingUsers ? (
                             <div className="text-center text-gray-600 dark:text-gray-300">{t.general?.loading || "Loading..."}</div>
                         ) : errorUsers ? (
                             <div className="text-center text-red-600 dark:text-red-400">{errorUsers}</div>
                         ) : (
                             <div className="text-5xl font-bold text-gray-900 dark:text-white">{userCount}</div> 
                         )}
                     </CardContent>
                 </Card>

                {/* Product Stock Chart */}
                <Card className="dark:bg-gray-800 col-span-1 md:col-span-2 lg:col-span-1"> {/* Added dark mode, col-span for grid */}
                    <CardHeader>
                        <CardTitle className="text-gray-800 dark:text-white">{t.adminDashboardPage?.productStockChartTitle || "Product Stock Levels"}</CardTitle> {/* Added dark mode */}
                    </CardHeader>
                    <CardContent>
                        {isLoadingStock ? (
                            <div className="text-center text-gray-600 dark:text-gray-300">{t.general?.loading || "Loading..."}</div>
                        ) : errorStock ? (
                            <div className="text-center text-red-600 dark:text-red-400">{errorStock}</div>
                        ) : stockData.length === 0 ? (
                             <div className="text-center text-gray-600 dark:text-gray-300">{t.adminDashboardPage?.noStockData || "No stock data available."}</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={stockData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" stroke="#888888" />
                                    <YAxis stroke="#888888" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="stock" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Category Distribution Chart */}
                <Card className="dark:bg-gray-800 col-span-1 md:col-span-2 lg:col-span-1"> {/* Added dark mode, col-span for grid */}
                    <CardHeader>
                        <CardTitle className="text-gray-800 dark:text-white">{t.adminDashboardPage?.categoryDistributionChartTitle || "Product Distribution by Category"}</CardTitle> {/* Added dark mode */}
                    </CardHeader>
                    <CardContent>
                         {isLoadingCategories ? (
                            <div className="text-center text-gray-600 dark:text-gray-300">{t.general?.loading || "Loading..."}</div>
                        ) : errorCategories ? (
                            <div className="text-center text-red-600 dark:text-red-400">{errorCategories}</div>
                        ) : categoryDistributionData.length === 0 ? (
                             <div className="text-center text-gray-600 dark:text-gray-300">{t.adminDashboardPage?.noCategoryData || "No category data available."}</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categoryDistributionData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {categoryDistributionData.map((entry, index) => (
                                            <Cell key={`cell-${entry.name}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Sales Overview Chart */}
                <Card className="dark:bg-gray-800 col-span-1 md:col-span-2 lg:col-span-3"> {/* Added dark mode, spans columns for wider chart */}
                    <CardHeader>
                        <CardTitle className="text-gray-800 dark:text-white">{t.adminDashboardPage?.salesOverviewChartTitle || "Sales Overview (Last 6 Months)"}</CardTitle> {/* Added dark mode */}
                    </CardHeader>
                    <CardContent>
                        {isLoadingSales ? (
                            <div className="text-center text-gray-600 dark:text-gray-300">{t.general?.loading || "Loading..."}</div>
                        ) : errorSales ? (
                            <div className="text-center text-red-600 dark:text-red-400">{errorSales}</div>
                        ) : salesOverviewData.length === 0 ? (
                             <div className="text-center text-gray-600 dark:text-gray-300">{t.adminDashboardPage?.noSalesData || "No sales data available."}</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={salesOverviewData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" stroke="#888888" />
                                    <YAxis stroke="#888888" />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                 {/* Top Selling Products Chart */}
                 <Card className="dark:bg-gray-800 col-span-1 md:col-span-2 lg:col-span-1"> {/* Added dark mode, col-span for grid */}
                     <CardHeader>
                         <CardTitle className="text-gray-800 dark:text-white">{t.adminDashboardPage?.topSellingProductsTitle || "Top Selling Products"}</CardTitle> {/* Added dark mode */}
                     </CardHeader>
                     <CardContent>
                         {isLoadingTopProducts ? (
                             <div className="text-center text-gray-600 dark:text-gray-300">{t.general?.loading || "Loading..."}</div>
                         ) : errorTopProducts ? (
                             <div className="text-center text-red-600 dark:text-red-400">{errorTopProducts}</div>
                         ) : topSellingProductsData.length === 0 ? (
                              <div className="text-center text-gray-600 dark:text-gray-300">{t.adminDashboardPage?.noTopProductsData || "No top selling products data available."}</div>
                         ) : (
                             <ResponsiveContainer width="100%" height={300}>
                                 <BarChart data={topSellingProductsData} layout="vertical"> {/* Vertical bar chart for names */}
                                     <CartesianGrid strokeDasharray="3 3" />
                                     <XAxis type="number" stroke="#888888" /> {/* Quantity on X-axis */}
                                     <YAxis type="category" dataKey="name" stroke="#888888" /> {/* Product names on Y-axis */}
                                     <Tooltip />
                                     <Legend />
                                     <Bar dataKey="quantitySold" fill="#82ca9d" name="Quantity Sold"/> {/* Data key for quantity */}
                                 </BarChart>
                             </ResponsiveContainer>
                         )}
                     </CardContent>
                 </Card>

                 {/* Orders by Status Chart */}
                 <Card className="dark:bg-gray-800 col-span-1 md:col-span-2 lg:col-span-1"> {/* Added dark mode, col-span for grid */}
                     <CardHeader>
                         <CardTitle className="text-gray-800 dark:text-white">{t.adminDashboardPage?.ordersByStatusTitle || "Orders by Status"}</CardTitle> {/* Added dark mode */}
                     </CardHeader>
                     <CardContent>
                         {isLoadingOrderStatus ? (
                             <div className="text-center text-gray-600 dark:text-gray-300">{t.general?.loading || "Loading..."}</div>
                         ) : errorOrderStatus ? (
                             <div className="text-center text-red-600 dark:text-red-400">{errorOrderStatus}</div>
                         ) : ordersByStatusData.length === 0 ? (
                              <div className="text-center text-gray-600 dark:text-gray-300">{t.adminDashboardPage?.noOrderStatusData || "No order status data available."}</div>
                         ) : (
                             <ResponsiveContainer width="100%" height={300}>
                                 <PieChart>
                                     <Pie
                                         data={ordersByStatusData}
                                         cx="50%"
                                         cy="50%"
                                         outerRadius={80}
                                         dataKey="value"
                                         label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                     >
                                         {ordersByStatusData.map((entry, index) => (
                                             <Cell key={`cell-${entry.name}`} fill={STATUS_COLORS[entry.name] || STATUS_COLORS['Default']} />
                                         ))}
                                     </Pie>
                                     <Tooltip />
                                     <Legend />
                                 </PieChart>
                             </ResponsiveContainer>
                         )}
                     </CardContent>
                 </Card>


            </main>

            {/* Footer */}
            <footer className="text-center mt-16 py-6 text-gray-600 border-t border-gray-300 dark:text-gray-400 dark:border-gray-700"> {/* Added dark mode */}
                <p>&copy; {new Date().getFullYear()} {t.adminDashboardPage?.footerText || 'My Store. All rights reserved.'}</p> {/* Use translated text */}
            </footer>
        </div>
    );
}

export default App;
