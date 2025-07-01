import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/ToastNotification';
import { useLanguage } from '../components/LanguageContext';
import axios from 'axios';
import { User, ShoppingBag, Heart, LogOut, Loader2, Save, KeyRound, Eye } from 'lucide-react';

// A small, reusable Card component for consistent styling
const Card = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 ${className}`}>
        {children}
    </div>
);

const ProfilePage = () => {
    const { t, language, isRTL } = useLanguage();
    const { currentUser, logout, token, API_BASE_URL, login } = useAuth(); // Assuming login updates the context
    const { wishlistItems, toggleFavorite, loadingWishlist } = useWishlist();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState('profile');
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    
    const [name, setName] = useState(currentUser?.name || '');
    const [email, setEmail] = useState(currentUser?.email || '');
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const fetchOrders = useCallback(async () => {
        if (!token) return;
        setLoadingOrders(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/orders/myorders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(response.data);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            showToast(t('profile.fetchOrdersError'), 'error');
        } finally {
            setLoadingOrders(false);
        }
    }, [API_BASE_URL, token, showToast, t]);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        } else {
            setName(currentUser.name);
            setEmail(currentUser.email);
            if (activeTab === 'orders') {
                fetchOrders();
            }
        }
    }, [currentUser, navigate, activeTab, fetchOrders]);
    
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsUpdatingProfile(true);
        try {
            const { data } = await axios.put(`${API_BASE_URL}/api/users/profile`, { name }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast(t('profile.updateSuccess'), 'success');
            // Update user in context to reflect the change immediately
            login(data.user, token);
        } catch (error) {
            showToast(error.response?.data?.message || t('profile.updateError'), 'error');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setIsUpdatingPassword(true);
        try {
            await axios.put(`${API_BASE_URL}/api/users/profile/password`, { currentPassword, newPassword }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast(t('profile.passwordUpdateSuccess'), 'success');
            setCurrentPassword('');
            setNewPassword('');
        } catch (error) {
            showToast(error.response?.data?.message || t('profile.passwordUpdateError'), 'error');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleLogout = () => {
        logout();
        showToast(t('profile.logoutSuccess'), 'info');
        navigate('/');
    };

    if (!currentUser) {
        return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin h-8 w-8" /></div>;
    }

    const navigationItems = [
        { id: 'profile', label: t('profile.profileDetails'), icon: User },
        { id: 'orders', label: t('profile.myOrders'), icon: ShoppingBag },
        { id: 'wishlist', label: t('profile.myWishlist'), icon: Heart },
    ];
    
    const inputStyle = "w-full px-4 py-2.5 bg-gray-100 dark:bg-zinc-700/50 border-2 border-transparent rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-700 focus:border-indigo-500 outline-none transition duration-200 text-gray-800 dark:text-gray-200";
    const primaryButtonStyle = "flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-800 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-200";

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card>
                            <form onSubmit={handleProfileUpdate}>
                                <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('profile.profileInfo')}</h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className='space-y-1'>
                                        <label htmlFor="name" className="text-sm font-medium text-gray-600 dark:text-zinc-400">{t('profile.name')}</label>
                                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputStyle} />
                                    </div>
                                    <div className='space-y-1'>
                                        <label htmlFor="email" className="text-sm font-medium text-gray-600 dark:text-zinc-400">{t('profile.email')}</label>
                                        <input type="email" id="email" value={email} disabled className={`${inputStyle} cursor-not-allowed opacity-70`} />
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 border-t border-gray-200 dark:border-zinc-700 flex justify-end rounded-b-xl">
                                    <button type="submit" disabled={isUpdatingProfile} className={primaryButtonStyle}>
                                        {isUpdatingProfile ? <Loader2 className="animate-spin h-5 w-5" /> : <Save size={18} />}
                                        <span>{isUpdatingProfile ? t('profile.saving') : t('profile.saveChanges')}</span>
                                    </button>
                                </div>
                            </form>
                        </Card>
                        <Card>
                            <form onSubmit={handlePasswordChange}>
                                <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('profile.changePassword')}</h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className='space-y-1'>
                                        <label className="text-sm font-medium text-gray-600 dark:text-zinc-400">{t('profile.currentPassword')}</label>
                                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputStyle} required/>
                                    </div>
                                    <div className='space-y-1'>
                                        <label className="text-sm font-medium text-gray-600 dark:text-zinc-400">{t('profile.newPassword')}</label>
                                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputStyle} required/>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 border-t border-gray-200 dark:border-zinc-700 flex justify-end rounded-b-xl">
                                    <button type="submit" disabled={isUpdatingPassword} className={primaryButtonStyle}>
                                        {isUpdatingPassword ? <Loader2 className="animate-spin h-5 w-5" /> : <KeyRound size={18} />}
                                        <span>{isUpdatingPassword ? t('profile.updating') : t('profile.updatePassword')}</span>
                                    </button>
                                </div>
                            </form>
                        </Card>
                    </div>
                );
            case 'orders':
                return (
                    <Card>
                        <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('profile.myOrders')}</h3>
                        </div>
                        <div className="p-6">
                            {loadingOrders ? (
                                <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin h-8 w-8 text-indigo-500" /></div>
                            ) : orders.length > 0 ? (
                                <ul className="space-y-4">
                                    {orders.map(order => (
                                        <li key={order._id} className="p-4 bg-gray-50 dark:bg-zinc-700/30 rounded-lg border border-gray-200 dark:border-zinc-700">
                                            <div className="grid grid-cols-2 md:grid-cols-4 items-center gap-4">
                                                <div className="col-span-2 md:col-span-1">
                                                    <p className="font-semibold text-gray-800 dark:text-gray-100">{t('profile.order')} <span className="text-indigo-600 dark:text-indigo-400">#{order._id.substring(18)}</span></p>
                                                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                                                        {new Date(order.createdAt).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </p>
                                                </div>
                                                <div className="text-right md:text-left">
                                                    <p className="text-lg font-bold text-gray-800 dark:text-white">
                                                        {new Intl.NumberFormat(language, { style: 'currency', currency: 'USD' }).format(order.totalPrice)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-start md:justify-center gap-2">
                                                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${order.isPaid ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>
                                                        {order.isPaid ? t('profile.paid') : t('profile.notPaid')}
                                                    </span>
                                                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${order.isDelivered ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300' : 'bg-gray-200 text-gray-800 dark:bg-zinc-600 dark:text-zinc-200'}`}>
                                                        {order.isDelivered ? t('profile.delivered') : t('profile.notDelivered')}
                                                    </span>
                                                </div>
                                                <Link to={`/order/${order._id}`} className="col-span-2 md:col-span-1 flex justify-center items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
                                                    <span>{t('profile.viewDetails')}</span>
                                                    <Eye size={16} />
                                                </Link>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center py-10 text-gray-500 dark:text-zinc-400">{t('profile.noOrders')}</p>
                            )}
                        </div>
                    </Card>
                );
            case 'wishlist':
                 return (
                    <Card>
                         <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('profile.myWishlist')}</h3>
                        </div>
                        <div className="p-6">
                            {loadingWishlist ? (
                                <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin h-8 w-8 text-indigo-500" /></div>
                            ) : wishlistItems.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {wishlistItems.map(item => (
                                        <div key={item._id} className="group relative border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                            <Link to={`/product/${item._id}`}>
                                                <img src={item.mainImage} alt={item.name[language]} className="w-full h-48 object-cover" />
                                            </Link>
                                            <div className="p-4">
                                                <h4 className="text-md font-semibold text-gray-800 dark:text-white truncate">{item.name[language]}</h4>
                                                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                                                    {new Intl.NumberFormat(language, { style: 'currency', currency: 'USD' }).format(item.basePrice)}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => toggleFavorite(item._id)} 
                                                className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-zinc-900/80 rounded-full text-red-500 hover:bg-white dark:hover:bg-zinc-800 scale-100 group-hover:opacity-100 opacity-100 sm:opacity-0 sm:scale-90 group-hover:scale-100 transition-all duration-200">
                                                <Heart fill="currentColor" size={20} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center py-10 text-gray-500 dark:text-zinc-400">{t('profile.noWishlistItems')}</p>
                            )}
                        </div>
                    </Card>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-zinc-900 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-8">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center ring-4 ring-white dark:ring-zinc-900">
                        <User className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">{currentUser.name}</h1>
                        <p className="text-md text-gray-500 dark:text-zinc-400">{currentUser.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="mt-2 sm:mt-0 sm:ml-auto flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-200"
                    >
                        <LogOut size={18} />
                        <span>{t('profile.logout')}</span>
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 dark:border-zinc-700 mb-8">
                    <nav className="-mb-px flex space-x-1 sm:space-x-4" style={{justifyContent: isRTL ? "flex-end" : "flex-start"}}>
                        {navigationItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`whitespace-nowrap flex items-center gap-2 py-4 px-3 sm:px-4 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none ${
                                    activeTab === item.id
                                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:border-zinc-600'
                                }`}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="animate-fade-in" key={activeTab}>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;