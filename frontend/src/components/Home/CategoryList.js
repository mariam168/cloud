import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../LanguageContext'; 
import { Link } from 'react-router-dom'; 
import { Loader2, AlertCircle, LayoutGrid, Info } from 'lucide-react';

const CategoryList = () => {
    const { t, language } = useLanguage(); 
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const SERVER_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${SERVER_URL}/api/categories`);
                const filteredCategories = response.data.filter(cat => 
                    cat.imageUrl && 
                    (cat.name?.en || cat.name?.ar) 
                );
                setCategories(filteredCategories);
                setError(null);
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError(t('homePage.categoryFetchError') || 'Failed to fetch categories. Please try again later.'); 
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [SERVER_URL, language, t]);

    if (loading) {
        return (
            <section className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-500 ease-in-out min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-xl font-semibold text-gray-700 dark:text-gray-300 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                    <Loader2 size={60} className="animate-spin text-blue-600 dark:text-blue-400 mb-6" />
                    <span className="text-2xl">{t('general.loading') || 'Loading categories...'}</span>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-500 ease-in-out min-h-[400px] flex items-center justify-center">
                <div className="text-center text-red-700 dark:text-red-300 text-xl p-10 bg-red-50 dark:bg-red-900/30 rounded-2xl shadow-xl border border-red-200 dark:border-red-800 flex flex-col items-center justify-center gap-5">
                    <AlertCircle size={60} className="text-red-600 dark:text-red-400" />
                    <p className="font-semibold">{t('general.error') || 'Error'}:</p>
                    <p className="text-base">{error}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 ease-in-out">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-800 dark:text-white mb-4 inline-flex items-center gap-4 group">
                        <LayoutGrid 
                            size={52} 
                            className="text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300 ease-out" 
                        />
                        {t('homepage.shopByCategory') || 'Shop by Category'}
                    </h2>
                    <div className="w-32 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 mx-auto mt-2 mb-12 rounded-full shadow-lg" />
                </div>

                {categories.length === 0 ? (
                    <div className="text-center text-gray-700 dark:text-gray-300 text-xl p-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-5">
                        <Info size={60} className="text-blue-500 dark:text-blue-400" />
                        <p className="font-semibold">{t('homePage.noCategoriesFound') || 'No categories found.'}</p>
                        <p className="text-base text-gray-500 dark:text-gray-400">Please check back later or try refreshing the page.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
                        {categories.map((category) => (
                            <Link
                                key={category._id}
                                to={`/shop?category=${encodeURIComponent(category.name.en || category.name.ar || 'Unknown')}`}
                                className="flex flex-col items-center justify-start text-center p-4 rounded-3xl  dark:bg-gray-800  transition-all duration-300 transform group hover:shadow-xl hover:scale-105 border border-transparent hover:border-indigo-300 dark:hover:border-indigo-700 overflow-hidden"
                            >
                                <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full overflow-hidden mb-5 border-4 border-gray-200 dark:border-gray-700 group-hover:border-indigo-500 transition-all duration-300 shadow-inner flex items-center justify-center bg-gray-100 dark:bg-gray-700 p-2">
                                    <img
                                       src={`${SERVER_URL}${category.imageUrl}`}
                                        alt={category.name?.[language] || category.name?.en || t('homePage.categoryImageAlt') || 'Category Image'}
                                        className="w-full h-full object-cover rounded-full transform group-hover:scale-110 transition-transform duration-300 ease-in-out"
                                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x400/D1D5DB/4B5563?text=${encodeURIComponent(t('general.noImage') || 'No Image')}`; }} 
                                    />
                                </div>
                                {/* ** التغيير هنا: تم زيادة حجم الخط ** */}
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 leading-snug tracking-tight px-2">
                                    {category.name?.[language] || category.name?.en || category.name?.ar || t('homePage.unnamedCategory') || 'Unnamed Category'}
                                </h3>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default CategoryList;