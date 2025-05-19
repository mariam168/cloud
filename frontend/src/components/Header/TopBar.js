import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Globe, Sun, Moon } from 'lucide-react';

const TopBar = () => {
    const { t, toggleLanguage, language } = useLanguage();
    const { currentUser, isAuthenticated, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [dark, setDark] = useState(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        return savedDarkMode ? JSON.parse(savedDarkMode) : false;
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

    const isActiveLink = (pathname) => {
        if (pathname === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(pathname);
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 text-gray-300 text-xs dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-2 shadow-xl transition-all duration-300 ease-in-out border-b border-gray-700 dark:border-gray-600">
            <div className="container mx-auto px-4 flex flex-wrap justify-between items-center gap-y-2">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Globe size={16} className="text-blue-400" />
                        <button onClick={toggleLanguage} className="hover:text-blue-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-1"
                             title={language === 'en' ? (t('topBar.languageArabic') || 'التبديل إلى العربية') : (t('topBar.languageEnglish') || 'Switch to English')}
                             aria-label={language === 'en' ? (t('topBar.languageArabic') || 'التبديل إلى العربية') : (t('topBar.languageEnglish') || 'Switch to English')}
                        >
                            {language === 'en' ? (t('topBar.languageArabic') || 'العربية') : (t('topBar.languageEnglish') || 'English')}
                        </button>
                    </div>
                </div>
                <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1 items-center order-last sm:order-none w-full sm:w-auto my-2 sm:my-0">
                    <Link
                        to="/"
                        className={`hover:text-white transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-400 after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-300 py-1 ${isActiveLink('/') ? 'font-bold text-blue-300 after:scale-x-100' : ''}`}
                    >
                        {t('topBar.home') || 'Home'}
                    </Link>
                    <Link
                        to="/shop"
                        className={`hover:text-white transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-400 after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-300 py-1 ${isActiveLink('/shop') ? 'font-bold text-blue-300 after:scale-x-100' : ''}`}
                    >
                        {t('topBar.shop') || 'Shop'}
                    </Link>
                    <Link
                        to="/about"
                        className={`hover:text-white transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-400 after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-300 py-1 ${isActiveLink('/about') ? 'font-bold text-blue-300 after:scale-x-100' : ''}`}
                    >
                        {t('topBar.aboutUs') || 'About Us'}
                    </Link>
                    <Link
                        to="/contact"
                        className={`hover:text-white transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-400 after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-300 py-1 ${isActiveLink('/contact') ? 'font-bold text-blue-300 after:scale-x-100' : ''}`}
                    >
                        {t('topBar.contactUs') || 'Contact Us'}
                    </Link>
                    {isAuthenticated && (isAdmin || currentUser?.role === 'admin') && (
                         <Link
                             to="/dashboard"
                             className={`hover:text-white bg-indigo-600 px-3 py-1 rounded-md text-xs font-semibold transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isActiveLink('/dashboard') ? 'ring-2 ring-blue-300' : ''}`}
                         >
                             {t('topBar.dashboard') || "Dashboard"}
                         </Link>
                    )}
                </nav>
                <div className="flex items-center gap-3">
                    {isAuthenticated && currentUser ? (
                        <>
                            <span className="text-gray-300 hidden sm:inline">{t('topBar.helloUser') || 'Hello'}, <span className="font-semibold text-white">{currentUser.name}</span></span>
                            <button
                                onClick={handleLogout}
                                className="hover:text-red-400 font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 rounded px-1"
                            >
                                {t('topBar.logout') || 'Logout'}
                            </button>
                        </>
                    ) : (
                        <>
                            <span className="text-gray-400 hidden sm:inline">{t('topBar.helloGuest') || 'Hello Guest'}</span>
                            <Link to="/login" className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded px-1">{t('topBar.signIn') || 'Sign In'}</Link>
                            <span className="text-gray-500 mx-0.5">|</span>
                            <Link to="/register" className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded px-1">{t('topBar.register') || 'Register'}</Link>
                        </>
                    )}
                    <button
                        className="ml-2 p-1.5 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-500"
                        onClick={() => setDark(!dark)}
                        aria-label={dark ? (t('topBar.lightMode') || "Switch to light mode") : (t('topBar.darkMode') || "Switch to dark mode")}
                        title={dark ? (t('topBar.lightMode') || "Light Mode") : (t('topBar.darkMode') || "Dark Mode")}
                    >
                        {dark ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
