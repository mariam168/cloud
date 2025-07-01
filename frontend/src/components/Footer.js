import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import { Store, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    const { t, language } = useLanguage();

    const quickLinks = [
        { path: "/about", label: t('footer.aboutUs') },
        { path: "/contact", label: t('footer.contactUs') },
        { path: "/faq", label: t('footer.faq') },
        { path: "/shop", label: t('footer.allProducts') },
    ];

    const legalLinks = [
        { path: "/terms-of-service", label: t('footer.termsOfService') },
        { path: "/privacy-policy", label: t('footer.privacyPolicy') },
        { path: "/shipping-policy", label: t('footer.shippingPolicy') },
        { path: "/return-policy", label: t('footer.returnPolicy') },
    ];

    const socialLinks = [
        { href: "https://facebook.com", icon: Facebook, label: "Facebook" },
        { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
        { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
        { href: "https://linkedin.com", icon: Linkedin, label: "LinkedIn" },
    ];

    return (
        <footer className="bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 py-16 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-6 md:col-span-2 lg:col-span-1">
                        <Link to="/" className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
                            <div className="bg-indigo-600 p-2.5 rounded-lg">
                                <Store className="h-6 w-6 text-white" />
                            </div>
                            <span>{t('mainHeader.siteName')}</span>
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-zinc-400">
                            {t('footer.description')}
                        </p>
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-white mb-2">{t('footer.newsletterTitle')}</p>
                            <form className="flex gap-2">
                                <input 
                                    type="email" 
                                    placeholder={t('footer.emailPlaceholder')}
                                    className="w-full rounded-lg border-gray-200 bg-gray-50 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button type="submit" className="rounded-lg bg-gray-900 px-5 text-sm font-semibold text-white transition hover:bg-indigo-600 dark:bg-white dark:text-black dark:hover:bg-indigo-500">
                                    {t('footer.subscribe')}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div>
                        <p className="text-base font-bold text-gray-900 dark:text-white">{t('footer.quickLinks')}</p>
                        <ul className="mt-6 space-y-3">
                            {quickLinks.map(link => (
                                <li key={link.path}>
                                    <Link to={link.path} className="text-sm text-gray-600 transition hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="text-base font-bold text-gray-900 dark:text-white">{t('footer.legal')}</p>
                        <ul className="mt-6 space-y-3">
                            {legalLinks.map(link => (
                                <li key={link.path}>
                                    <Link to={link.path} className="text-sm text-gray-600 transition hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div>
                        <p className="text-base font-bold text-gray-900 dark:text-white">{t('footer.contactInfo')}</p>
                        <ul className="mt-6 space-y-4 text-sm">
                           <li className="flex items-start gap-3">
                                <MapPin size={18} className="mt-1 flex-shrink-0 text-gray-500 dark:text-zinc-400"/>
                                <span className="text-gray-600 dark:text-zinc-300">{t('footer.address')}</span>
                           </li>
                           <li className="flex items-start gap-3">
                                <Phone size={18} className="mt-1 flex-shrink-0 text-gray-500 dark:text-zinc-400"/>
                                <a href={`tel:${t('footer.phone')}`} className="text-gray-600 transition hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400">{t('footer.phone')}</a>
                           </li>
                           <li className="flex items-start gap-3">
                                <Mail size={18} className="mt-1 flex-shrink-0 text-gray-500 dark:text-zinc-400"/>
                                <a href={`mailto:${t('footer.email')}`} className="text-gray-600 transition hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400">{t('footer.email')}</a>
                           </li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 py-6 sm:flex-row dark:border-zinc-800">
                    <p className="text-sm text-gray-500 dark:text-zinc-400">
                        © {new Date().getFullYear()} {t('footer.copyright', { siteName: t('mainHeader.siteName') })}
                    </p>
                    <ul className="flex items-center gap-4">
                        {socialLinks.map(link => (
                             <li key={link.label}>
                                <a 
                                    href={link.href} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    aria-label={link.label}
                                    className="text-gray-500 transition hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
                                >
                                   <link.icon size={22} />
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </footer>
    );
};

export default Footer;