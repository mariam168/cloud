import React, { useState, useEffect, useCallback } from 'react';
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
    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${SERVER_URL}/api/categories`, {
                headers: { 'Accept-Language': language }
            });
            const filteredCategories = response.data.filter(cat => 
                cat.imageUrl && cat.name 
            );
            setCategories(filteredCategories);
            setError(null);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError(t('categoryList.fetchError') || 'Failed to fetch categories.'); 
        } finally {
            setLoading(false);
        }
    }, [SERVER_URL, t, language]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);
    if (loading) {
        return (
            <section className="py-16 bg-gray-100 dark:bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                     <div className="h-10 w-1/2 bg-gray-200 dark:bg-zinc-800 rounded-lg mx-auto mb-12 animate-pulse"></div>
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {Array.from({ length: 6 }).map((_, index) => (
                             <div key={index} className="flex flex-col items-center animate-pulse">
                                 <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gray-200 dark:bg-zinc-800 rounded-full mb-4"></div>
                                 <div className="h-5 w-24 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
                             </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }
    if (error) {
        return (
            <section className="py-16 bg-gray-100 dark:bg-black">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-red-700 dark:text-red-400 p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-500/30 flex flex-col items-center gap-4">
                        <AlertCircle size={40} />
                        <p className="font-semibold text-xl">{t('general.error')}</p>
                        <p className="text-base">{error}</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-gray-100 dark:bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
                        {t('categoryList.title')}
                    </h2>
                    <p className="mt-3 text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
                        {t('categoryList.subtitle')}
                    </p>
                </div>

                {categories.length === 0 ? (
                    <div className="text-center p-10 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800">
                        <Info size={48} className="mx-auto mb-4 text-indigo-500" />
                        <p className="font-semibold text-xl text-gray-800 dark:text-white">{t('categoryList.noCategoriesFound')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {categories.map((category) => (
                            <Link
                                key={category._id}
                                to={`/shop?category=${encodeURIComponent(category.name)}`}
                                className="group flex flex-col items-center text-center p-4 rounded-2xl transition-all duration-300 transform hover:-translate-y-1.5"
                            >
                                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-4 bg-gray-200 dark:bg-zinc-800 transition-all duration-300 shadow-md group-hover:shadow-xl group-hover:shadow-indigo-500/20">
                                    <img
                                        src={`${SERVER_URL}${category.imageUrl}`}
                                        alt={category.name || t('categoryList.imageAlt')}
                                        className="w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-110"
                                        onError={(e) => { e.target.onerror = null; e.target.src = `https://via.placeholder.com/300?text=${encodeURIComponent(category.name[0]) || '?'}`; }} 
                                    />
                                </div>
                                <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white transition-colors duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                    {category.name || t('categoryList.unnamedCategory')}
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