import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { ShoppingCart, Heart, Search, Store, UserCircle, Menu, X } from 'lucide-react';
import { useNavigate, Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

const MainHeader = () => {
    const { t } = useLanguage();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { getCartCount } = useCart();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { wishlistItems } = useWishlist();

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
        setIsMenuOpen(false);
    };

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    const navLinks = [
        { path: "/", label: t('topBar.home') },
        { path: "/shop", label: t('topBar.shop') },
        { path: "/about", label: t('topBar.aboutUs') },
        { path: "/contact", label: t('topBar.contactUs') }
    ];

    const iconButtonStyle = "relative p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-300";

    return (
        <header className="sticky top-0 z-40 w-full bg-slate-50/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link to="/" className="flex items-center gap-2.5 text-2xl font-bold text-slate-900 dark:text-white">
                        <div className="bg-teal-500 p-2 rounded-lg shadow-md shadow-teal-500/20">
                            <Store className="h-7 w-7 text-white" />
                        </div>
                        <span className="hidden sm:block">{t('mainHeader.siteName')}</span>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-8">
                        {navLinks.map(link => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) =>
                                    `text-base font-medium transition-colors duration-300 relative ${isActive
                                        ? 'text-teal-600 dark:text-teal-400'
                                        : 'text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400'
                                    }`
                                }
                            >
                                {link.label}
                                {({ isActive }) =>
                                    isActive && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-teal-500 rounded-full"></span>
                                }
                            </NavLink>
                        ))}
                    </nav>

                    <div className="flex items-center gap-1 sm:gap-2">
                        <form onSubmit={handleSearch} className="relative hidden md:block group">
                            <input
                                type="text"
                                className="w-10 h-10 sm:w-48 sm:h-auto pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-full focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none dark:text-white transition-all duration-300 focus:w-60"
                                placeholder={t('mainHeader.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button type="submit" className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500">
                                <Search size={20} />
                            </button>
                        </form>
                        
                        <Link to={isAuthenticated ? "/profile" : "/login"} className={iconButtonStyle}>
                            <UserCircle size={24} />
                        </Link>
                        <Link to="/wishlist" className={iconButtonStyle}>
                            <Heart size={24} />
                            {wishlistItems?.length > 0 && <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{wishlistItems.length}</span>}
                        </Link>
                        <Link to="/cart" className={iconButtonStyle}>
                            <ShoppingCart size={24} />
                            {getCartCount > 0 && <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-white">{getCartCount}</span>}
                        </Link>

                        <button className="lg:hidden p-2 text-slate-600 dark:text-slate-300" onClick={() => setIsMenuOpen(true)}>
                            <Menu size={28} />
                        </button>
                    </div>
                </div>
            </div>

            <div 
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 lg:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
                onClick={() => setIsMenuOpen(false)}
            >
                <div
                    className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-slate-50 dark:bg-slate-900 shadow-2xl p-6 flex flex-col transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={() => setIsMenuOpen(false)} className="self-end p-2 mb-8 text-slate-600 dark:text-slate-300">
                        <X size={30} />
                    </button>
                    <nav className="flex flex-col items-center gap-y-8">
                        {navLinks.map(link => (
                            <NavLink 
                                key={link.path} 
                                to={link.path} 
                                onClick={() => setIsMenuOpen(false)} 
                                className="text-2xl font-semibold text-slate-800 dark:text-white"
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>
                    <form onSubmit={handleSearch} className="relative mt-auto">
                        <input
                            type="text"
                            className="w-full px-5 py-3 border-2 border-slate-200 dark:border-slate-700 bg-transparent rounded-full outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:text-white"
                            placeholder={t('mainHeader.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className="absolute top-1/2 right-3 -translate-y-1/2 p-2 text-gray-500">
                            <Search size={22} />
                        </button>
                    </form>
                </div>
            </div>
        </header>
    );
};

export default MainHeader;