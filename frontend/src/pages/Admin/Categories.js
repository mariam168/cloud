import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLanguage } from '../../components/LanguageContext';
import {
    Plus, Edit, Trash2, Loader, AlertCircle, ChevronDown, ChevronRight,
    Image as ImageIcon, LayoutList, Search, XCircle, Frown // Added Search, XCircle, Frown icons
} from 'lucide-react';
import CategoryForm from '../../components/Admin/CategoryPage/CategoryForm';

const AdminCategoriesPage = () => {
    const { t } = useLanguage();
    const serverUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [searchTerm, setSearchTerm] = useState(''); // State for the search input value
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // State for debounced search term

    // Debounce effect to delay updating `debouncedSearchTerm`
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300); // Adjust debounce delay as needed (e.g., 300ms)

        // Cleanup function to clear the timeout if searchTerm changes before the delay
        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm]); // Re-run effect whenever searchTerm changes

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${serverUrl}/api/categories`, {
                headers: { 'x-admin-request': 'true' }
            });
            setCategories(response.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError(err.response?.data?.message || t('adminCategoryPage.errorFetchingCategories') || 'Failed to load categories.');
        } finally {
            setLoading(false);
        }
    }, [serverUrl, t]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleOpenAddForm = () => {
        setCategoryToEdit(null);
        setIsFormOpen(true);
    };

    const handleOpenEditForm = async (category) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${serverUrl}/api/categories/${category._id}`, {
                headers: {
                    'x-admin-request': 'true',
                },
            });
            const fetchedCategory = response.data;
            const normalizedCategory = {
                ...fetchedCategory,
                name: {
                    en: fetchedCategory.name?.en || fetchedCategory.name || '',
                    ar: fetchedCategory.name?.ar || '',
                },
                description: {
                    en: fetchedCategory.description?.en || fetchedCategory.description || '',
                    ar: fetchedCategory.description?.ar || '',
                },
                subCategories: (fetchedCategory.subCategories || []).map(sub => ({
                    ...sub,
                    tempId: sub._id || `new_sub_${Date.now() + Math.random()}`,
                    name: {
                        en: sub.name?.en || sub.name || '',
                        ar: sub.name?.ar || '',
                    },
                    description: {
                        en: sub.description?.en || sub.description || '',
                        ar: sub.description?.ar || '',
                    },
                }))
            };

            setCategoryToEdit(normalizedCategory);
            setIsFormOpen(true);
        } catch (err) {
            console.error('Error fetching category details for edit:', err);
            setError(err.response?.data?.message || t('adminCategoryPage.errorFetchingEditDetails') || 'Failed to load category details for editing.');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = () => {
        setIsFormOpen(false);
        setCategoryToEdit(null);
        fetchCategories();
    };

    const handleCancelForm = () => {
        setIsFormOpen(false);
        setCategoryToEdit(null);
    };

    const handleDelete = async (categoryId, categoryName) => {
        const confirmMessage = t('adminCategoryPage.confirmDelete', { categoryName: categoryName?.en || categoryName || 'this category' });
        if (window.confirm(confirmMessage)) {
            setLoading(true);
            setError(null);
            try {
                await axios.delete(`${serverUrl}/api/categories/${categoryId}`, {
                    headers: { 'x-admin-request': 'true' }
                });
                fetchCategories();
            } catch (err) {
                console.error('Error deleting category:', err);
                setError(err.response?.data?.message || t('adminCategoryPage.errorDeletingCategory') || 'Failed to delete category.');
            } finally {
                setLoading(false);
            }
        }
    };

    const toggleExpand = (categoryId) => {
        setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
    };

    // Filter categories based on the debounced search term
    const filteredCategories = categories.filter(category => {
        if (!debouncedSearchTerm) {
            return true; // If no search term, show all categories
        }
        const lowerCaseSearchTerm = debouncedSearchTerm.toLowerCase();

        // Check category's English name
        const matchesCategoryNameEn = category.name?.en?.toLowerCase().includes(lowerCaseSearchTerm);
        // Check category's Arabic name
        const matchesCategoryNameAr = category.name?.ar?.toLowerCase().includes(lowerCaseSearchTerm);

        // Check if any subcategory matches by English or Arabic name
        const matchesSubcategory = category.subCategories?.some(sub =>
            sub.name?.en?.toLowerCase().includes(lowerCaseSearchTerm) ||
            sub.name?.ar?.toLowerCase().includes(lowerCaseSearchTerm)
        );

        return matchesCategoryNameEn || matchesCategoryNameAr || matchesSubcategory;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen-minus-header bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-gray-300">
                <Loader className="animate-spin text-blue-500 mb-4" size={50} />
                <p className="text-xl font-semibold">{t('general.loading') || 'Loading...'}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen-minus-header bg-red-50 dark:bg-red-950 p-6 rounded-lg shadow-md m-4 sm:m-6">
                <AlertCircle className="text-red-500 mb-4" size={50} />
                <p className="text-xl font-semibold text-red-800 dark:text-red-300 text-center mb-4">{t('general.errorOccurred') || 'An error occurred!'}</p>
                <p className="text-red-600 dark:text-red-400 text-center mb-6">{error}</p>
                <button
                    onClick={fetchCategories}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md transform hover:scale-105"
                >
                    <Loader size={20} className="mr-2" /> {t('general.retry') || 'Retry'}
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 dark:bg-slate-900 min-h-screen text-gray-900 dark:text-gray-100">
            <div className="max-w-7xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 mb-6 border-b border-gray-200 dark:border-slate-700">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-white flex items-center gap-3 mb-4 sm:mb-0">
                        <LayoutList size={36} className="text-purple-600 dark:text-purple-400" />
                        {t('adminCategoryPage.manageCategories')}
                    </h1>
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder={t('categoryList.searchPlaceholder') || 'Search categories...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                                aria-label={t('categoryList.searchCategoriesLabel') || 'Search categories'}
                            />
                            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')} // Clear search term
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600"
                                    aria-label={t('general.clearSearch') || 'Clear search'}
                                >
                                    <XCircle size={16} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={handleOpenAddForm}
                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 w-full sm:w-auto"
                        >
                            <Plus size={20} /> {t('adminCategoryPage.addCategoryButton')}
                        </button>
                    </div>
                </div>

                {/* Categories List */}
                <div className="divide-y divide-gray-200 dark:divide-slate-700 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map(cat => (
                            <div key={cat._id} className="last:border-b-0">
                                <div
                                    className="flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                    onClick={() => cat.subCategories?.length > 0 && toggleExpand(cat._id)}
                                >
                                    <div className="flex items-center gap-4 flex-grow">
                                        {/* Expand/Collapse Icon */}
                                        {cat.subCategories?.length > 0 ? (
                                            <button
                                                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300"
                                                onClick={(e) => { e.stopPropagation(); toggleExpand(cat._id); }}
                                                aria-label={expandedCategories[cat._id] ? t('general.collapse') : t('general.expand')}
                                            >
                                                {expandedCategories[cat._id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                            </button>
                                        ) : (
                                            <div className="w-8 h-8 flex-shrink-0"></div> // Spacer for alignment
                                        )}

                                        {/* Category Image */}
                                        {cat.imageUrl ? (
                                            <img
                                                src={`${serverUrl}${cat.imageUrl}`}
                                                alt={cat.name?.en || cat.name || 'Category Image'}
                                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover shadow-sm flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <ImageIcon className="text-gray-400 dark:text-gray-500" size={30} />
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-lg text-gray-900 dark:text-white mb-0.5">{cat.name?.en || cat.name}</span>
                                            {cat.name?.ar && <span className="font-arabic text-md text-gray-700 dark:text-gray-300">{cat.name?.ar}</span>}
                                            {cat.subCategories?.length > 0 && (
                                                <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {cat.subCategories.length} {t('adminCategoryPage.subCategoriesCount')}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleOpenEditForm(cat); }}
                                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                                            aria-label={t('adminCategoryPage.editCategory')}
                                        >
                                            <Edit size={20} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(cat._id, cat.name?.en || cat.name); }}
                                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                            aria-label={t('adminCategoryPage.deleteCategory')}
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Subcategories List (Expanded) */}
                                {expandedCategories[cat._id] && cat.subCategories?.length > 0 && (
                                    <div className="pl-6 pr-4 sm:pl-8 sm:pr-6 pb-4 pt-2 bg-gray-50 dark:bg-slate-700/50 transition-all duration-300 ease-in-out">
                                        <ul className="divide-y divide-gray-200 dark:divide-slate-600 border-l-2 border-gray-300 dark:border-slate-600 pl-4 sm:pl-6">
                                            {cat.subCategories.map(sub => (
                                                <li key={sub._id} className="flex items-center py-3">
                                                    {sub.imageUrl ? (
                                                        <img
                                                            src={`${serverUrl}${sub.imageUrl}`}
                                                            alt={sub.name?.en || sub.name || 'Subcategory Image'}
                                                            className="w-10 h-10 rounded-md object-cover mr-3 flex-shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gray-200 dark:bg-slate-600 rounded-md flex items-center justify-center mr-3 flex-shrink-0">
                                                            <ImageIcon className="text-gray-400 dark:text-gray-500" size={20} />
                                                        </div>
                                                    )}
                                                    <span className="text-gray-700 dark:text-gray-200 text-base">{sub.name?.en || sub.name}</span>
                                                    {sub.name?.ar && <span className="font-arabic text-sm text-gray-500 dark:text-gray-400 ml-2">{sub.name?.ar}</span>}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            {debouncedSearchTerm ? (
                                <>
                                    <Frown size={40} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                    <p className="text-lg font-medium">{t('categoryList.noSearchResults') || 'No categories found matching your search.'}</p>
                                    <p className="text-md mt-2">{t('categoryList.tryDifferentSearch') || 'Try a different search term or clear the search.'}</p>
                                </>
                            ) : (
                                <>
                                    <ImageIcon size={40} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                    <p className="text-lg font-medium">{t('adminCategoryPage.noCategoriesYet') || 'No categories found.'}</p>
                                    <p className="text-md mt-2">{t('adminCategoryPage.addFirstCategory') || 'Start by adding your first category above!'}</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Category Form Modal */}
            {isFormOpen && (
                <CategoryForm
                    categoryToEdit={categoryToEdit}
                    onFormSubmit={handleFormSubmit}
                    onCancel={handleCancelForm}
                    serverUrl={serverUrl}
                />
            )}
        </div>
    );
};

export default AdminCategoriesPage;