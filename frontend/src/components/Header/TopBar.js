import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../../context/AuthContext'; 
import { Globe, Sun, Moon, User } from 'lucide-react'; 
const TopBar = () => {
    const { t, toggleLanguage, language } = useLanguage();
    const { currentUser, isAuthenticated, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [dark, setDark] = useState(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return savedDarkMode ? JSON.parse(savedDarkMode) : prefersDark;
    });
    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', JSON.stringify(true));
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', JSON.stringify(false));
        }
    }, [dark]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActiveLink = useCallback((pathname) => {
        if (pathname === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(pathname);
    }, [location.pathname]);

    return (
        <div 
            className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 py-3 shadow-sm dark:shadow-xl transition-all duration-300 ease-in-out border-b border-gray-100 dark:border-gray-800"
            dir={language === 'ar' ? 'rtl' : 'ltr'} 
        >
            <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-y-2 gap-x-4 items-center">
                <div className="flex items-center gap-4 order-1 col-span-1">
                    <div className="flex items-center gap-1.5">
                        <Globe size={16} className="text-blue-500 dark:text-blue-400" />
                        <button 
                            onClick={toggleLanguage} 
                            className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200 font-medium text-sm rounded-md px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-900 whitespace-nowrap"
                            title={language === 'en' ? (t('topBar.languageArabic') || 'التبديل إلى العربية') : (t('topBar.languageEnglish') || 'Switch to English')}
                            aria-label={language === 'en' ? (t('topBar.languageArabic') || 'التبديل إلى العربية') : (t('topBar.languageEnglish') || 'Switch to English')}
                        >
                            {language === 'en' ? (t('topBar.languageArabic') || 'العربية') : (t('topBar.languageEnglish') || 'English')}
                        </button>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm hidden sm:inline-block whitespace-nowrap">
                        {isAuthenticated && currentUser ? (
                            <>{t('topBar.helloUser') || 'Hello'}, <span className="font-semibold text-gray-900 dark:text-white">{currentUser.name}</span></>
                        ) : (
                            t('topBar.helloGuest') || 'Hello Guest'
                        )}
                    </span>
                </div>

                <nav className="flex flex-wrap justify-center gap-x-4 order-3 col-span-full sm:col-span-1 md:order-2 my-2 sm:my-0">
                    <Link
                        to="/"
                        className={`text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200 relative py-0.5 group font-medium text-sm ${isActiveLink('/') ? 'font-bold text-blue-700 dark:text-blue-300' : ''}`}
                    >
                        {t('topBar.home') || 'Home'}
                        <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ${isActiveLink('/') ? 'scale-x-100' : ''}`} />
                    </Link>
                    <Link
                        to="/shop"
                        className={`text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200 relative py-0.5 group font-medium text-sm ${isActiveLink('/shop') ? 'font-bold text-blue-700 dark:text-blue-300' : ''}`}
                    >
                        {t('topBar.shop') || 'Shop'}
                        <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ${isActiveLink('/shop') ? 'scale-x-100' : ''}`} />
                    </Link>
                    <Link
                        to="/about"
                        className={`text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200 relative py-0.5 group font-medium text-sm ${isActiveLink('/about') ? 'font-bold text-blue-700 dark:text-blue-300' : ''}`}
                    >
                        {t('topBar.aboutUs') || 'About Us'}
                        <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ${isActiveLink('/about') ? 'scale-x-100' : ''}`} />
                    </Link>
                    <Link
                        to="/contact"
                        className={`text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200 relative py-0.5 group font-medium text-sm ${isActiveLink('/contact') ? 'font-bold text-blue-700 dark:text-blue-300' : ''}`}
                    >
                        {t('topBar.contactUs') || 'Contact Us'}
                        <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ${isActiveLink('/contact') ? 'scale-x-100' : ''}`} />
                    </Link>
                    {isAuthenticated && (isAdmin || currentUser?.role === 'admin') && (
                         <Link
                             to="/admin/dashboard"
                             className={`text-white px-3 py-1.5 rounded-full font-bold bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 dark:from-purple-500 dark:to-indigo-600 dark:hover:from-purple-600 dark:hover:to-indigo-700 shadow-sm transition-all duration-300 text-nowrap`}
                         >
                             {t('topBar.dashboard') || "Dashboard"}
                         </Link>
                    )}
                </nav>

                <div className="flex items-center gap-3 justify-end order-2 col-span-1">
                    {isAuthenticated ? (
                        <>
                            <button
                                onClick={handleLogout}
                                className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 font-semibold transition-colors duration-200 text-sm rounded-md px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-900 whitespace-nowrap"
                            >
                                {t('topBar.logout') || 'Logout'}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200 rounded-md px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-900 text-sm whitespace-nowrap">
                                <User size={16} className="text-gray-500 dark:text-gray-400" />
                                {t('topBar.signIn') || 'Sign In'}
                            </Link>
                            <span className="text-gray-400 dark:text-gray-500 text-sm mx-0.5 hidden sm:inline-block">|</span>
                            <Link to="/register" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200 rounded-md px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-900 text-sm whitespace-nowrap">{t('topBar.register') || 'Register'}</Link>
                        </>
                    )}
                    <button
                        className="ml-1 p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors duration-200 flex items-center justify-center shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-900"
                        onClick={() => setDark(!dark)}
                        aria-label={dark ? (t('topBar.lightMode') || "Switch to light mode") : (t('topBar.darkMode') || "Switch to dark mode")}
                        title={dark ? (t('topBar.lightMode') || "Light Mode") : (t('topBar.darkMode') || "Dark Mode")}
                    >
                        {dark ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-blue-600" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TopBar;