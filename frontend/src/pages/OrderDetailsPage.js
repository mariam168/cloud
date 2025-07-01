import React from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../components/LanguageContext';
import { useToast } from '../components/ToastNotification';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Loader2, AlertCircle, ShoppingCart, Truck, CreditCard, User, PackageCheck,
    ArrowLeft, Printer
} from 'lucide-react';
const MotionDiv = ({ children, delay = 0, className = "" }) => (
    <motion.div
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
    >
        {children}
    </motion.div>
);

const DetailBlock = ({ icon: Icon, title, children }) => (
    <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg">
        <div className="p-5 border-b border-gray-200 dark:border-zinc-700 flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/10 rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-md font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="p-5 text-sm text-gray-600 dark:text-zinc-300">
            {children}
        </div>
    </div>
);

const OrderItemCard = ({ item, language, serverUrl }) => (
    <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors duration-200">
        <img
            src={item.image ? `${serverUrl}${item.image}` : 'https://via.placeholder.com/200'}
            alt={item.name[language]}
            className="w-20 h-20 rounded-md object-cover bg-gray-200 dark:bg-zinc-700 flex-shrink-0"
        />
        <div className="flex-grow">
            <Link to={`/product/${item.product}`} className="font-bold text-gray-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {item.name[language]}
            </Link>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">{item.variantDetailsText}</p>
            <p className="text-sm font-mono text-gray-600 dark:text-zinc-300 mt-1">
                {item.quantity} x {new Intl.NumberFormat(language, { style: 'currency', currency: 'USD' }).format(item.price)}
            </p>
        </div>
        <p className="font-bold text-lg text-gray-900 dark:text-white">
            {new Intl.NumberFormat(language, { style: 'currency', currency: 'USD' }).format(item.quantity * item.price)}
        </p>
    </div>
);

const OrderActionButton = ({ onPrint, t }) => (
    <div>
        <button 
            onClick={onPrint} 
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-zinc-200 bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-zinc-600 transition-all transform hover:-translate-y-0.5"
        >
            <Printer size={16} /> {t('orderDetails.printInvoice')}
        </button>
    </div>
);


const OrderDetailsPage = () => {
    const { id: orderId } = useParams();
    const { token, API_BASE_URL } = useAuth();
    const SERVER_ROOT_URL = API_BASE_URL.replace('/api', '');
    const { t, language, isRTL } = useLanguage();
    const { showToast } = useToast();

    const [order, setOrder] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await axios.get(`${API_BASE_URL}/api/orders/${orderId}`, { headers: { Authorization: `Bearer ${token}` } });
                setOrder(data);
            } catch (err) {
                showToast(err.response?.data?.message || t('orderDetails.fetchError'), 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId, token, API_BASE_URL, showToast, t]);

    if (loading) return <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-zinc-900"><Loader2 className="w-16 h-16 animate-spin text-indigo-500" /></div>;
    if (!order) return <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-zinc-900"><AlertCircle className="w-16 h-16 text-red-500" /></div>;

    const { shippingAddress, paymentMethod, orderItems, totalPrice, isPaid, isDelivered, user: orderUser, createdAt } = order;

    return (
        <AnimatePresence>
            <div className="min-h-screen bg-slate-100 dark:bg-zinc-900">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <header>
                        <MotionDiv delay={0.1}>
                            <Link to="/profile" className="inline-flex items-center gap-2 text-gray-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition-colors">
                                <ArrowLeft style={{ transform: isRTL ? 'scaleX(-1)' : 'scaleX(1)' }} size={18} />
                                <span>{t('orderDetails.backToOrders')}</span>
                            </Link>
                            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-lg">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                    <div>
                                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t('orderDetails.title')}</h1>
                                        <p className="text-gray-500 dark:text-zinc-400 font-mono mt-1">#{order._id}</p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
                                        isDelivered 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-300' 
                                        : isPaid 
                                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-500/10 dark:text-sky-300' 
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-300'
                                    }`}>
                                        <PackageCheck size={18} />
                                        <span>{isDelivered ? t('orderDetails.statusDelivered') : isPaid ? t('orderDetails.statusShipped') : t('orderDetails.statusPlaced')}</span>
                                    </div>
                                </div>
                            </div>
                        </MotionDiv>
                    </header>
                    
                    <main className="mt-8">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                            <div className="lg:col-span-3 space-y-8">
                                <MotionDiv delay={0.2}>
                                    <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg p-6">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3"><ShoppingCart size={22} className="text-indigo-500"/>{t('orderDetails.orderItems')} ({orderItems.length})</h3>
                                        <div className="mt-4 -mx-2 divide-y divide-gray-200 dark:divide-zinc-700">
                                            {orderItems.map((item, index) => (
                                                <OrderItemCard key={index} item={item} language={language} serverUrl={SERVER_ROOT_URL} />
                                            ))}
                                        </div>
                                    </div>
                                </MotionDiv>
                            </div>

                            <div className="lg:col-span-2 space-y-8 lg:sticky top-8">
                                <MotionDiv delay={0.3}>
                                    <DetailBlock icon={User} title={t('profile.profileInfo')}>
                                        <div className="space-y-1">
                                            <p className="font-semibold text-gray-800 dark:text-white">{orderUser.name}</p>
                                            <a href={`mailto:${orderUser.email}`} className="text-indigo-600 hover:underline">{orderUser.email}</a>
                                        </div>
                                    </DetailBlock>
                                </MotionDiv>

                                <MotionDiv delay={0.4}>
                                    <DetailBlock icon={Truck} title={t('orderDetails.shippingAddress')}>
                                        <address className="not-italic space-y-1">
                                            <p>{shippingAddress.address}</p>
                                            <p>{shippingAddress.city}, {shippingAddress.postalCode}, {shippingAddress.country}</p>
                                        </address>
                                    </DetailBlock>
                                </MotionDiv>
                                
                                <MotionDiv delay={0.5}>
                                    <DetailBlock icon={CreditCard} title={t('orderDetails.paymentDetails')}>
                                        <p><strong>{t('orderDetails.paymentMethod')}:</strong> {paymentMethod}</p>
                                        <div className="border-t border-dashed border-gray-300 dark:border-zinc-600 my-3"></div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">{t('orderDetails.total')}:</span>
                                            <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">{new Intl.NumberFormat(language, { style: 'currency', currency: 'USD' }).format(totalPrice)}</span>
                                        </div>
                                    </DetailBlock>
                                </MotionDiv>

                                <MotionDiv delay={0.6}>
                                    <OrderActionButton 
                                        onPrint={() => window.print()} 
                                        t={t}
                                    />
                                </MotionDiv>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </AnimatePresence>
    );
};

export default OrderDetailsPage;