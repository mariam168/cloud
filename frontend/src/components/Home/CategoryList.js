import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../LanguageContext'; // Assuming you have a LanguageContext
import { Link } from 'react-router-dom'; // Import Link for navigation

const CategoryList = () => {
    const { t, language } = useLanguage(); // Use the language context for dynamic text
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Define your backend server URL here.
    // It's highly recommended to use environment variables for this.
    // Create a .env file in your frontend root (e.g., frontend/.env)
    // and add: REACT_APP_API_BASE_URL=http://localhost:5000
    const SERVER_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                // Use the SERVER_URL constant
                const response = await axios.get(`${SERVER_URL}/api/categories`);
                setCategories(response.data);
                setError(null); // Clear any previous errors
            } catch (err) {
                console.error('Error fetching categories:', err);
                // Use the translation for a user-friendly message
                setError(t?.homePage?.categoryFetchError || 'Failed to fetch categories. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
        // Re-run effect if language changes, to update displayed names/descriptions
    }, [SERVER_URL, language, t]);

    if (loading) {
        return (
            <section className="py-12 bg-gray-50">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-xl text-gray-600">{t?.homePage?.loadingCategories || 'Loading categories...'}</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-12 bg-gray-50">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-xl text-red-600 bg-red-100 p-4 rounded-md">{error}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 bg-gray-50 dark:bg-gray-900 transition-colors duration-500 ease-in-out">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 dark:text-white mb-10">
                    {t?.homePage?.shopByCategory || 'Shop by Category'}
                </h2>

                {categories.length === 0 ? (
                    <p className="text-center text-gray-600 dark:text-gray-400 text-lg">
                        {t?.homePage?.noCategoriesFound || 'No categories found.'}
                    </p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {categories.map((category) => (
                            // Link to the shop page, passing the category name as a query parameter
                            <Link
                                key={category._id}
                                to={`/shop?category=${encodeURIComponent(category.name.en)}`}
                                className="category-card bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group cursor-pointer border border-gray-200 dark:border-gray-700"
                            >
                                {category.imageUrl && (
                                    <div className="relative w-full h-32 sm:h-40 overflow-hidden">
                                        <img
                                            // Construct the full image URL using the server URL and the relative path from the database
                                            src={`${SERVER_URL}${category.imageUrl}`}
                                            alt={category.name?.[language] || category.name?.en || 'Category Image'}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x300/E0E0E0/333333?text=No+Image`; }} // Fallback image
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                                    </div>
                                )}
                                <div className="p-4 text-center">
                                    {/* Display name based on current language */}
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                                        {category.name?.[language] || category.name?.en || category.name?.ar || 'Unnamed Category'}
                                    </h3>
                                    {/* Display description based on current language, if available */}
                                    {category.description && (category.description?.[language] || category.description?.en || category.description?.ar) && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                            {category.description?.[language] || category.description?.en || category.description?.ar}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default CategoryList;