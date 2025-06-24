import React, { useEffect, useState, useCallback } from 'react';
import { Pencil, Trash2, PlusCircle, Loader2, ListTree, Frown } from 'lucide-react'; // Added Loader2, ListTree, Frown icons
import CategoryForm from './CategoryForm';
import axios from 'axios';
import { useLanguage } from '../../LanguageContext'; // Assuming LanguageContext is available here

const CategoryList = ({ serverUrl }) => {
    const { t } = useLanguage(); // Initialize translation hook
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [loading, setLoading] = useState(true); // Default to true for initial load
    const [error, setError] = useState(null); // State for handling fetch errors

    // Memoize fetchCategories for better performance and to prevent re-creation
    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const resp = await axios.get(`${serverUrl}/api/categories`, {
                headers: { 'x-admin-request': 'true' } // Ensure admin header is sent for all category fetches
            });
            setCategories(resp.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError(t('categoryList.fetchError') || 'Failed to load categories. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [serverUrl, t]); // Depend on serverUrl and t

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]); // Depend on the memoized fetchCategories

    const fetchCategoryForEdit = async (categoryId) => {
        setLoading(true);
        setError(null);
        try {
            const resp = await axios.get(`${serverUrl}/api/categories/${categoryId}`, {
                headers: { 'x-admin-request': 'true' },
            });
            const category = resp.data;

            // Normalize data for the form, ensuring name and description are objects
            const normalizedCategory = {
                ...category,
                name: {
                    en: category.name?.en || category.name || '',
                    ar: category.name?.ar || '',
                },
                description: {
                    en: category.description?.en || category.description || '',
                    ar: category.description?.ar || '',
                },
                subCategories: (category.subCategories || []).map((sub) => ({
                    ...sub,
                    tempId: sub._id || `new_sub_${Date.now() + Math.random()}`, // Ensure tempId for new subs
                    name: {
                        en: sub.name?.en || sub.name || '',
                        ar: sub.name?.ar || '',
                    },
                    description: {
                        en: sub.description?.en || sub.description || '',
                        ar: sub.description?.ar || '',
                    },
                })),
            };

            setSelectedCategory(normalizedCategory);
            setIsFormOpen(true);
        } catch (err) {
            console.error('Error fetching category for edit:', err);
            setError(t('categoryList.editFetchError') || 'Failed to load category for editing.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category) => {
        fetchCategoryForEdit(category._id);
    };

    const handleAdd = () => {
        setSelectedCategory(null);
        setIsFormOpen(true);
    };

    const handleDelete = async (categoryId) => {
        if (!window.confirm(t('categoryList.confirmDelete') || 'Are you sure you want to delete this category? This action cannot be undone.')) {
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await axios.delete(`${serverUrl}/api/categories/${categoryId}`, {
                headers: { 'x-admin-request': 'true' }
            });
            fetchCategories(); // Re-fetch categories after deletion
        } catch (err) {
            console.error('Error deleting category:', err);
            setError(err.response?.data?.message || t('categoryList.deleteError') || 'Failed to delete category.');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = () => {
        setIsFormOpen(false);
        setSelectedCategory(null);
        fetchCategories(); // Re-fetch categories after form submission
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900 min-h-[calc(100vh-160px)] rounded-lg shadow-inner">
            {/* Header and Add Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 mb-6 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3 mb-4 sm:mb-0">
                    <ListTree size={32} className="text-purple-600 dark:text-purple-400" />
                    {t('categoryList.title') || 'Product Categories'}
                </h2>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 text-white px-6 py-2.5 shadow-md hover:bg-indigo-700 transition-colors transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                >
                    <PlusCircle size={20} />
                    {t('categoryList.addCategory')}
                </button>
            </div>

            {/* Loading, Error, and Empty States */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow">
                    <Loader2 size={48} className="animate-spin text-indigo-500 mb-4" />
                    <p className="text-lg text-gray-600 dark:text-gray-300">{t('categoryList.loading') || 'Loading categories...'}</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 bg-red-50 dark:bg-red-900/10 rounded-lg shadow border border-red-200 dark:border-red-700">
                    <Frown size={48} className="text-red-500 mb-4" />
                    <p className="text-lg text-red-700 dark:text-red-300 text-center">{error}</p>
                    <button
                        onClick={fetchCategories}
                        className="mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                    >
                        {t('general.retry') || 'Retry'}
                    </button>
                </div>
            ) : (
                <>
                    {/* Categories Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-slate-700">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                <thead className="bg-gray-100 dark:bg-slate-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            {t('categoryList.nameEn')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            {t('categoryList.nameAr')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            {t('categoryList.subcategories')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            {t('categoryList.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                    {categories.length > 0 ? (
                                        categories.map((category) => (
                                            <tr key={category._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    {category.name?.en || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-right">
                                                    {category.name?.ar || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    {category.subCategories?.length || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 transition-colors p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                                            title={t('categoryList.editAction') || "Edit Category"}
                                                            onClick={() => handleEdit(category)}
                                                            aria-label={`Edit ${category.name?.en || 'category'}`}
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button
                                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 transition-colors p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20"
                                                            title={t('categoryList.deleteAction') || "Delete Category"}
                                                            onClick={() => handleDelete(category._id)}
                                                            aria-label={`Delete ${category.name?.en || 'category'}`}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Frown size={40} className="mb-3" />
                                                    {t('categoryList.noCategories') || 'No categories available yet. Click "Add Category" to create one!'}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Category Form Modal */}
            {isFormOpen && (
                <CategoryForm
                    categoryToEdit={selectedCategory}
                    onFormSubmit={handleFormSubmit}
                    onCancel={() => {
                        setIsFormOpen(false);
                        setSelectedCategory(null);
                    }}
                    serverUrl={serverUrl}
                />
            )}
        </div>
    );
};

export default CategoryList;