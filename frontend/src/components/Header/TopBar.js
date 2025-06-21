import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../../context/AuthContext'; 
import { Globe, Sun, Moon, LogOut, LayoutDashboard } from 'lucide-react'; 

const TopBar = () => {
    const { t, changeLanguage } = useLanguage();
    const { currentUser, isAuthenticated, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(() => localStorage.getItem('darkMode') === 'true');

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    }, [isDark]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    
    return (
        <div className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-10">
                    <div className="flex items-center gap-4">
                        <button onClick={changeLanguage} className="flex items-center gap-1.5 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                            <Globe size={16} />
                            <span>{t('topBar.language')}</span>
                        </button>
                        <button onClick={() => setIsDark(!isDark)} className="flex items-center gap-1.5 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                            {isDark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} />}
                        </button>
                    </div>

                    <div className="flex items-center gap-4 font-medium">
                        {isAuthenticated ? (
                            <>
                                {isAdmin && (
                                    <Link to="/admin/dashboard" className="flex items-center gap-1.5 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                                        <LayoutDashboard size={16} />
                                        <span>{t('topBar.dashboard')}</span>
                                    </Link>
                                )}
                                <span className="hidden md:block text-gray-800 dark:text-gray-200">{t('topBar.welcome')}, {currentUser?.name}</span>
                                <button onClick={handleLogout} className="flex items-center gap-1.5 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                    <LogOut size={16} />
                                    <span>{t('topBar.logout')}</span>
                                </button>
                            </>
                        ) : (
                           <span className="text-gray-800 dark:text-gray-200">{t('topBar.helloGuest')}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;