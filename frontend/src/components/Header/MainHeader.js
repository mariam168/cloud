import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../LanguageContext';
import { ShoppingCart, Heart, Search, Store, User, Menu, X } from 'lucide-react';
import { useNavigate, Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

const MainHeader = () => {
    const { t, language } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { wishlistItems } = useWishlist();
    const { cartItems } = useCart();
    const cartCount = cartItems?.length || 0;

    const [searchTerm, setSearchTerm] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchActive, setIsSearchActive] = useState(false);
    
    const searchRef = useRef(null);
    const searchInputRef = useRef(null);

    const isRTL = language === 'ar';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchActive(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isSearchActive && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchActive]);

    useEffect(() => {
        setIsMenuOpen(false);
        setIsSearchActive(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
        return () => { document.body.style.overflow = 'auto' };
    }, [isMenuOpen]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
        setIsSearchActive(false);
        setSearchTerm('');
    };
    const navLinks = [
        { path: "/", label: t('topBar.home') },
        { path: "/shop", label: t('topBar.shop') },
        { path: "/about", label: t('topBar.aboutUs') },
        { path: "/contact", label: t('topBar.contactUs') }
    ];

    const iconButtonStyle = "relative p-2.5 rounded-full text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-white transition-colors duration-300";
    const badgeStyle = "absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-900";

    return (
        <>
            <header className="sticky top-12 z-40 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-zinc-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <Link to="/" className="flex items-center gap-2.5 text-xl font-bold text-gray-800 dark:text-white">
                            <div className="bg-indigo-600 p-2.5 rounded-lg">
                                <Store className="h-6 w-6 text-white" />
                            </div>
                            <span className="hidden sm:block">{t('mainHeader.siteName')}</span>
                        </Link>

                        <nav className="hidden lg:flex items-center gap-2">
                            {navLinks.map(link => (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    className={({ isActive }) =>
                                        `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${isActive 
                                            ? 'bg-gray-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400' 
                                            : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-100/50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-white'}`
                                    }
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                        </nav>

                        <div className="flex items-center gap-1 sm:gap-2">
                            <div ref={searchRef} className="relative hidden md:flex items-center">
                                <form onSubmit={handleSearchSubmit}>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        className={`h-11 outline-none rounded-full bg-gray-100 dark:bg-zinc-800 border-2 border-transparent text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 transition-all duration-300 ease-in-out ${isSearchActive ? 'w-56 pl-4 pr-11' : 'w-0 pl-0 pr-0'}`}
                                        placeholder={t('mainHeader.searchPlaceholder')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onBlur={() => { if (!searchTerm) setIsSearchActive(false); }}
                                    />
                                </form>
                                <button
                                    onClick={() => setIsSearchActive(prev => !prev)}
                                    className={`${iconButtonStyle}`}
                                >
                                    <Search size={22} />
                                </button>
                            </div>

                            <Link to={isAuthenticated ? "/profile" : "/login"} className={iconButtonStyle}><User size={22} /></Link>
                            <Link to="/wishlist" className={iconButtonStyle}>
                                <Heart size={22} />
                                {wishlistItems?.length > 0 && <span className={badgeStyle}>{wishlistItems.length}</span>}
                            </Link>
                            <Link to="/cart" className={iconButtonStyle}>
                                <ShoppingCart size={22} />
                                {cartCount > 0 && <span className={`${badgeStyle} !bg-indigo-600`}>{cartCount}</span>}
                            </Link>
                            <button className={`${iconButtonStyle} lg:hidden`} onClick={() => setIsMenuOpen(true)}><Menu size={24} /></button>
                        </div>
                    </div>
                </div>
            </header>

            <div className={`fixed inset-0 z-50 transition-opacity duration-300 lg:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
                <div className={`fixed top-0 h-full w-4/5 max-w-sm bg-white dark:bg-zinc-900 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isRTL ? 'left-0' : 'right-0'} ${isMenuOpen ? 'translate-x-0' : (isRTL ? '-translate-x-full' : 'translate-x-full')}`}>
                    <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-800">
                        <span className="text-lg font-bold text-gray-800 dark:text-white">{t('mainHeader.menu')}</span>
                        <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"><X size={24} /></button>
                    </div>
                    <nav className="flex flex-col gap-2 p-4">
                        {navLinks.map(link => (
                            <NavLink 
                                key={link.path} 
                                to={link.path} 
                                className={({isActive}) => `text-base font-medium p-4 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>
                    <div className="mt-auto p-6 border-t border-gray-200 dark:border-zinc-800">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <input
                                type="text"
                                className="w-full h-12 px-4 pr-12 text-base border-2 border-gray-200 dark:border-zinc-700 bg-transparent rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white"
                                placeholder={t('mainHeader.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button type="submit" className="absolute top-1/2 right-4 -translate-y-1/2 p-2 text-gray-500 dark:text-zinc-400"><Search size={20} /></button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MainHeader;