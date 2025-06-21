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

    return (
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link to="/" className="flex items-center gap-3 text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Store className="h-7 w-7 text-white" />
                        </div>
                        <span className="hidden sm:block">{t('mainHeader.siteName')}</span>
                    </Link>

                    <nav className="hidden lg:flex gap-8">
                        {navLinks.map(link => (
                            <NavLink 
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) => 
                                    `text-lg font-semibold transition-colors hover:text-blue-600 dark:hover:text-blue-400 relative after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-blue-600 after:bottom-0 after:left-0 after:scale-x-0 after:origin-left after:transition-transform after:duration-300 ${isActive ? 'text-blue-600 dark:text-blue-400 after:scale-x-100' : 'text-gray-600 dark:text-gray-300 group-hover:after:scale-x-100'}`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2 md:gap-3">
                        <form onSubmit={handleSearch} className="relative hidden md:block">
                            <input
                                type="text"
                                className="w-40 md:w-56 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-all duration-300 focus:w-64"
                                placeholder={t('mainHeader.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button type="submit" className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                                <Search size={20} />
                            </button>
                        </form>
                        
                        <Link to={isAuthenticated ? "/profile" : "/login"} className="p-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <UserCircle size={24} />
                        </Link>
                        <Link to="/wishlist" className="relative p-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <Heart size={24} />
                            {wishlistItems?.length > 0 && <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{wishlistItems.length}</span>}
                        </Link>
                        <Link to="/cart" className="relative p-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <ShoppingCart size={24} />
                            {getCartCount > 0 && <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{getCartCount}</span>}
                        </Link>

                        <button className="lg:hidden p-2 text-gray-600 dark:text-gray-300" onClick={() => setIsMenuOpen(true)}>
                            <Menu size={28} />
                        </button>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" onClick={() => setIsMenuOpen(false)}>
                    <div className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white dark:bg-gray-900 shadow-2xl p-6 flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setIsMenuOpen(false)} className="self-end p-2 mb-8"><X size={30}/></button>
                        <nav className="flex flex-col items-center gap-8">
                            {navLinks.map(link => (
                                <NavLink key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)} className="text-2xl font-semibold text-gray-800 dark:text-white">{link.label}</NavLink>
                            ))}
                        </nav>
                        <form onSubmit={handleSearch} className="relative mt-10">
                            <input type="text" className="w-full px-4 py-3 border-2 rounded-full outline-none focus:ring-2 focus:ring-blue-500" placeholder={t('mainHeader.searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            <button type="submit" className="absolute top-1/2 right-2 -translate-y-1/2 p-2 text-gray-500"><Search size={22} /></button>
                        </form>
                    </div>
                </div>
            )}
        </header>
    );
};

export default MainHeader;