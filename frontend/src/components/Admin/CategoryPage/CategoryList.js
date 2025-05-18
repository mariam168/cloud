
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import EditCategoryModal from './EditCategoryModal';
import { useLanguage } from '../../LanguageContext';
const CategoryList = ({ refreshTrigger, serverUrl, onCategoryAction }) => {
    const { t, language } = useLanguage();
    const [categories, setCategories] = useState([]); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null); 
    const [editingCategory, setEditingCategory] = useState(null); 
    const [showEditModal, setShowEditModal] = useState(false)
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${serverUrl}/api/categories`);
            setCategories(response.data); 
            setError(null); 
        } catch (err) {
            console.error("Error fetching categories:", err.response ? err.response.data : err.message);
            setError(t.adminCategoryPage?.errorFetchingCategories || "حدث خطأ أثناء جلب الفئات.");
        } finally {
            setLoading(false); 
        }
    };
    useEffect(() => {
        fetchCategories();
    }, [refreshTrigger, serverUrl, language]);
    const handleDelete = async (categoryId, categoryNames) => {
        const categoryName = categoryNames?.[language] || categoryNames?.en || categoryNames?.ar || 'this category';
        if (window.confirm(t.adminCategoryPage?.confirmDelete(categoryName) || `Are you sure you want to delete the category: "${categoryName}"?`)) { 
            try {
                await axios.delete(`${serverUrl}/api/categories/${categoryId}`);
                alert(t.adminCategoryPage?.deleteSuccess || "Category deleted successfully!");
                if (onCategoryAction) onCategoryAction();
                else fetchCategories(); 
            } catch (err) {
                console.error("Error deleting category:", err.response ? err.response.data : err.message);
                alert(t.adminCategoryPage?.errorDeletingCategory || "An error occurred while deleting the category.");
            }
        }
    };
    const handleOpenEditModal = (category) => {
        setEditingCategory(category);
        setShowEditModal(true);
    };
    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingCategory(null);
    };
    const handleCategoryUpdated = () => {
        if (onCategoryAction) onCategoryAction();
        else fetchCategories();
        handleCloseEditModal(); 
    };
    if (loading) return <p className="text-center text-gray-600 text-lg py-5">{t.adminCategoryPage?.loadingCategories || 'Loading Categories...'}</p>;
    if (error) return <p className="text-center text-red-600 text-lg p-4 bg-red-100 rounded-md py-5">{t.general?.error || 'Error'}: {error}</p>;

    return (
        <div className="max-w-3xl mx-auto mt-10">
           {categories.length === 0 ? (
                <p className="text-center text-gray-500 text-lg">{t.adminCategoryPage?.noCategoriesFound || 'No categories found.'}</p>
            ) : (
                <ul className="bg-white shadow-lg rounded-lg divide-y divide-gray-200">
                    {categories.map(category => (
                        <li key={category._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                            <div>
                                <p className="text-lg font-medium text-purple-700">
                                    {category.name?.[language] || category.name?.en || category.name?.ar || 'Unnamed Category'}
                                </p>
                                {category.description && (
                                     <p className="text-sm text-gray-500">
                                        {category.description?.[language] || category.description?.en || category.description?.ar || ''}
                                     </p>
                                )}
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => handleOpenEditModal(category)} 
                                    className="text-blue-500 hover:text-blue-700 transition-colors"
                                    aria-label={t.adminCategoryPage?.editCategory || "Edit Category"} 
                                >
                                    <FaEdit size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(category._id, category.name)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                    aria-label={t.adminCategoryPage?.deleteCategory || "Delete Category"}
                                >
                                    <FaTrashAlt size={18} />
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
