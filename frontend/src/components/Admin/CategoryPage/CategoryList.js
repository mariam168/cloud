import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt } from 'react-icons/fa'; // Kept original react-icons/fa
import EditCategoryModal from './EditCategoryModal';
import { useLanguage } from '../../LanguageContext'; // Corrected import path
import { Loader2, Info, XCircle, Edit, Trash2, ImageOff } from 'lucide-react'; // Added lucide icons for modern look

const CategoryList = ({ refreshTrigger, serverUrl = 'http://localhost:5000', onCategoryAction }) => { // Default serverUrl
    const { t, language } = useLanguage();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const fetchCategories = async () => { // No change to function logic
        try {
            setLoading(true);
            const response = await axios.get(`${serverUrl}/api/categories`);
            setCategories(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching categories:", err.response ? err.response.data : err.message);
            // Use t() function directly for error message from translation file
            setError(t('adminCategoryPage.errorFetchingCategories') || "An error occurred while fetching categories.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { // No change to function logic
        fetchCategories();
    }, [refreshTrigger, serverUrl, language]); 

    const handleDelete = async (categoryId, categoryNames) => { // No change to function logic
        const categoryName = categoryNames?.[language] || categoryNames?.en || categoryNames?.ar || t('general.unnamedCategory'); // Used t()
        if (window.confirm(t('adminCategoryPage.confirmDelete', { categoryName: categoryName }))) { // Used t() with placeholder
            try {
                await axios.delete(`${serverUrl}/api/categories/${categoryId}`);
                alert(t('adminCategoryPage.deleteSuccess') || "Category deleted successfully!"); // Used t()
                if (onCategoryAction) onCategoryAction(); 
                else fetchCategories(); 
            } catch (err) {
                console.error("Error deleting category:", err.response ? err.response.data : err.message);
                alert(t('adminCategoryPage.errorDeletingCategory') || "An error occurred while deleting the category."); // Used t()
            }
        }
    };

    const handleOpenEditModal = (category) => { // No change to function logic
        setEditingCategory(category);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => { // No change to function logic
        setShowEditModal(false);
        setEditingCategory(null);
    };

    const handleCategoryUpdated = () => { // No change to function logic
        if (onCategoryAction) onCategoryAction(); 
        else fetchCategories(); 
        handleCloseEditModal(); 
    };

    // Loading State
    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-xl font-semibold text-gray-700 dark:text-gray-300 py-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <Loader2 size={48} className="text-blue-500 dark:text-blue-400 animate-spin mb-4" />
            <span className="text-lg">{t('general.loading')}</span>
        </div>
    );
    
    // Error State
    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg shadow-sm border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 py-8">
            <XCircle size={48} className="mb-4" />
            <p className="text-lg font-medium">{t('general.error')}: {error}</p>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"> {/* Main content wrapper */}
            {categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-10 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">
                    <Info size={48} className="mb-4 text-gray-400 dark:text-gray-500" />
                    <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">{t('adminCategoryPage.noCategoriesFound')}</p>
                </div>
            ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700"> {/* Clean dividers */}
                    {categories.map(category => (
                        <li key={category._id} className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 rounded-lg"> {/* Added flex-col for mobile, rounded corners for hover */}
                            <div className="flex items-center w-full sm:w-auto mb-4 sm:mb-0">
                                {category.imageUrl ? ( 
                                    <img
                                        src={`${serverUrl}${category.imageUrl}`}
                                        alt={category.name?.[language] || category.name?.en || category.name?.ar || t('general.unnamedCategory')}
                                        className="w-16 h-16 object-cover rounded-lg mr-4 border border-gray-200 dark:border-gray-600 shadow-sm"
                                        onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-product-image.png'; }} // Consistent placeholder
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-lg mr-4 flex items-center justify-center bg-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 shadow-sm">
                                        <ImageOff size={32} className="text-gray-400 dark:text-gray-500" />
                                    </div>
                                )}
                                <div className="text-center sm:text-left">
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                        {category.name?.[language] || category.name?.en || category.name?.ar || t('general.unnamedCategory')}
                                    </p>
                                    {category.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2" title={category.description?.[language] || category.description?.en || category.description?.ar || t('adminCategoryPage.noDescription')}>
                                            {category.description?.[language] || category.description?.en || category.description?.ar || t('adminCategoryPage.noDescription')}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex space-x-3 mt-4 sm:mt-0"> {/* Adjusted spacing for mobile */}
                                <button
                                    onClick={() => handleOpenEditModal(category)}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                    aria-label={t('adminCategoryPage.editCategory')}
                                >
                                    <Edit size={20} /> {/* Lucide icon */}
                                </button>
                                <button
                                    onClick={() => handleDelete(category._id, category.name)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-red-400"
                                    aria-label={t('adminCategoryPage.deleteCategory')}
                                >
                                    <Trash2 size={20} /> {/* Lucide icon */}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {showEditModal && editingCategory && (
                <EditCategoryModal
                    category={editingCategory}
                    onClose={handleCloseEditModal}
                    onCategoryUpdated={handleCategoryUpdated}
                    serverUrl={serverUrl}
                />
            )}
        </div>
    );
};

export default CategoryList;