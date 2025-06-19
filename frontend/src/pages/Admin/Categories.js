import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLanguage } from '../../components/LanguageContext';
import { Plus, Edit, Trash2, Loader, AlertCircle, ChevronDown, ChevronRight, Image as ImageIcon } from 'lucide-react';
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

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${serverUrl}/api/categories`);
            setCategories(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || t('adminCategoryPage.errorFetchingCategories'));
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

    const handleOpenEditForm = (category) => {
        setCategoryToEdit(category);
        setIsFormOpen(true);
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
        const confirmMessage = t('adminCategoryPage.confirmDelete', { categoryName });
        if (window.confirm(confirmMessage)) {
            try {
                await axios.delete(`${serverUrl}/api/categories/${categoryId}`);
                fetchCategories();
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete category.');
            }
        }
    };

    const toggleExpand = (categoryId) => {
        setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
    };

    if (loading) return <div className="flex justify-center p-10"><Loader className="animate-spin text-blue-500" size={40} /></div>
    if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-md"><AlertCircle className="inline mr-2" />{error}</div>

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('adminCategoryPage.manageCategories')}</h1>
                    <button onClick={handleOpenAddForm} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm">
                        <Plus size={20} /> {t('adminCategoryPage.addCategoryButton')}
                    </button>
                </div>
                
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="divide-y divide-gray-200">
                        {categories.map(cat => (
                            <div key={cat._id}>
                                <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer" onClick={() => cat.subCategories?.length > 0 && toggleExpand(cat._id)}>
                                    <div className="flex items-center gap-4 flex-grow">
                                        {cat.subCategories?.length > 0 ? (
                                            <button className="p-1 rounded-full hover:bg-gray-200">
                                                {expandedCategories[cat._id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                            </button>
                                        ) : <div className="w-8 h-8"></div>}
                                        {cat.imageUrl ? <img src={`${serverUrl}${cat.imageUrl}`} alt={cat.name} className="w-12 h-12 rounded-md object-cover"/> : <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center"><ImageIcon className="text-gray-400"/></div> }
                                        <span className="font-medium text-gray-900">{cat.name}</span>
                                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{cat.subCategories?.length || 0} {t('adminCategoryPage.subCategoriesCount')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); handleOpenEditForm(cat); }} className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50" aria-label={t('adminCategoryPage.editCategory')}><Edit size={18}/></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(cat._id, cat.name); }} className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50" aria-label={t('adminCategoryPage.deleteCategory')}><Trash2 size={18}/></button>
                                    </div>
                                </div>
                                {expandedCategories[cat._id] && cat.subCategories?.length > 0 && (
                                    <div className="pl-12 pr-4 pb-4 bg-gray-50">
                                        <ul className="divide-y divide-gray-200 border-l-2 border-gray-200 pl-4">
                                            {cat.subCategories.map(sub => (
                                                <li key={sub._id} className="flex items-center py-3">
                                                     {sub.imageUrl ? <img src={`${serverUrl}${sub.imageUrl}`} alt={sub.name} className="w-10 h-10 rounded-md object-cover mr-3"/> : <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center mr-3"><ImageIcon className="text-gray-400"/></div> }
                                                    <span className="text-gray-700">{sub.name}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

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