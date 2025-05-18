import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../../context/AuthContext'; 
const TopBar = () => {
    const { t, toggleLanguage } = useLanguage();
    const { currentUser, isAuthenticated, logout, isAdmin } = useAuth();
    const navigate = useNavigate(); 
    const [dark, setDark] = useState(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        return savedDarkMode ? JSON.parse(savedDarkMode) : false;
    });
    useEffect(() => {
        if (dark) {
            document.body.classList.add('dark');
            localStorage.setItem('darkMode', JSON.stringify(true));
        } else {
            document.body.classList.remove('dark');
            localStorage.setItem('darkMode', JSON.stringify(false));
        }
    }, [dark]); 
    const handleLogout = () => {
        logout();
        navigate('/login'); 
    };

    return (
        <div className="bg-slate-900 text-white text-xs dark:bg-gray-800 py-2 sm:py-3 shadow-md">
            <div className="container mx-auto px-4 flex flex-wrap justify-between items-center">
                <div className="flex items-center gap-4 mb-2 sm:mb-0">
                    <div className="flex items-center gap-3 sm:gap-4 border-l border-gray-700 pl-3 sm:pl-4 ml-3 sm:ml-4">
                        <span>{t.topBar?.currency || 'العملة'}</span>
                        <button onClick={toggleLanguage} className="hover:text-gray-300">
                            {t.topBar?.language || 'اللغة'}
                        </button>
                    </div>
                </div>
                <nav className="flex flex-wrap justify-center gap-3 sm:gap-4 items-center order-last sm:order-none w-full sm:w-auto my-2 sm:my-0">
                    <Link to="/" className="hover:text-gray-300">{t.topBar?.home || 'الرئيسية'}</Link>
                    <Link to="/shop" className="hover:text-gray-300">{t.topBar?.shop || 'المتجر'}</Link>
                    <Link to="/about" className="hover:text-gray-300">{t.topBar?.aboutUs || 'من نحن'}</Link>
                    <Link to="/contact" className="hover:text-gray-300">{t.topBar?.contactUs || 'اتصل بنا'}</Link>
                    {isAuthenticated && (isAdmin || currentUser?.role === 'admin') && (
                         <Link to="/dashboard" className="hover:text-gray-300 bg-indigo-500 px-2 py-1 rounded-sm text-xs font-semibold">
                             {t.topBar?.dashboard || "لوحة التحكم"}
                         </Link>
                    )}
                </nav>
                <div className="flex items-center gap-2 sm:gap-3">
                
                    {isAuthenticated && currentUser ? (
                        <>
                            <span className="text-gray-300 hidden sm:inline">{t.topBar?.helloUser || 'مرحباً'}, {currentUser.name}</span>
                            <button
                                onClick={handleLogout}
                                className="hover:text-red-400 font-semibold transition-colors"
                            >
                                {t.topBar?.logout || 'تسجيل الخروج'}
                            </button>
                        </>
                    ) : (
                        <>
                            <span className="text-gray-400 hidden sm:inline">{t.topBar?.helloGuest || 'أهلاً بك يا زائر'}</span>
                            <Link to="/login" className="hover:text-gray-300">{t.topBar?.signIn || 'تسجيل الدخول'}</Link>
                            <span className="text-gray-400 mx-1">|</span> 
                            <Link to="/register" className="hover:text-gray-300">{t.topBar?.register || 'التسجيل'}</Link>
                        </>
                    )}
                    <button
                        className="ml-2 px-2 py-1 sm:px-3 rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors text-xs"
                        onClick={() => setDark(!dark)}
                        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {dark ? `☀️ ${t.topBar?.light || 'فاتح'}` : `🌙 ${t.topBar?.dark || 'داكن'}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
