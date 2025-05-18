import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../LanguageContext';
const EditCategoryModal = ({ category, onClose, onCategoryUpdated, serverUrl }) => {
    const { t, language } = useLanguage();
    const [editedCategory, setEditedCategory] = useState({
        name_en: '',
        name_ar: '', 
        description_en: '',
        description_ar: '', 
    });
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [errorMessage, setErrorMessage] = useState(''); 
    useEffect(() => {
        if (category) {
            setEditedCategory({
                name_en: category.name?.en || '',
                name_ar: category.name?.ar || '', 
                description_en: category.description?.en || '',
                description_ar: category.description?.ar || '', 
            });
        }
    }, [category]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedCategory(prev => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');
        if (!editedCategory.name_en.trim() || !editedCategory.name_ar.trim()) {
            setErrorMessage(t.adminCategoryPage?.categoryNamesRequired || "اسم الفئة باللغتين مطلوب."); // Use translated message
            setIsSubmitting(false);
            return;
        }

        try {
            await axios.put(`${serverUrl}/api/categories/${category._id}`, {
                name_en: editedCategory.name_en.trim(), 
                name_ar: editedCategory.name_ar.trim(),
                description_en: editedCategory.description_en.trim(), 
                description_ar: editedCategory.description_ar.trim(),
            });
            alert(t.adminCategoryPage?.updateSuccess || "تم تحديث الفئة بنجاح!");
            if (onCategoryUpdated) {
                onCategoryUpdated(); 
            }
            onClose();
        } catch (err) {
            console.error("Error updating category:", err.response ? err.response.data : err.message);
            const backendMessage = err.response?.data?.message;
            setErrorMessage(
                backendMessage || (t.adminCategoryPage?.errorUpdatingCategory || "حدث خطأ أثناء تحديث الفئة.")
            );
        } finally {
            setIsSubmitting(false); 
        }
    };
    if (!category) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold mb-6 text-center text-gray-700">{t.adminCategoryPage?.editCategoryModalTitle || 'Edit Category'}</h3>
                {errorMessage && <p className="text-red-500 bg-red-100 p-3 rounded mb-4 text-sm">{errorMessage}</p>}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="edit-category-name_en" className="block text-sm font-medium text-gray-700 mb-1">
                            {t.adminCategoryPage?.categoryNameLabelEn || 'Category Name (English)'} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="edit-category-name_en"
                            name="name_en" 
                            value={editedCategory.name_en}
                            onChange={handleChange}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-category-name_ar" className="block text-sm font-medium text-gray-700 mb-1">
                            {t.adminCategoryPage?.categoryNameLabelAr || 'اسم الفئة (العربية)'} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="edit-category-name_ar"
                            name="name_ar" 
                            value={editedCategory.name_ar}
                            onChange={handleChange}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-right" 
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-category-description_en" className="block text-sm font-medium text-gray-700 mb-1">
                            {t.adminCategoryPage?.categoryDescriptionLabelEn || 'Description (English) (Optional)'}
                        </label>
                        <textarea
                            id="edit-category-description_en"
                            name="description_en" 
                            value={editedCategory.description_en}
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-category-description_ar" className="block text-sm font-medium text-gray-700 mb-1">
                            {t.adminCategoryPage?.categoryDescriptionLabelAr || 'الوصف (العربية) (اختياري)'}
                        </label>
                        <textarea
                            id="edit-category-description_ar"
                            name="description_ar" 
                            value={editedCategory.description_ar}
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-right"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                            {t.adminCategoryPage?.cancelButton || 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400"
                        >
                            {isSubmitting ? (t.adminCategoryPage?.savingChangesButton || "Saving Changes...") : (t.adminCategoryPage?.saveChangesButton || "Save Changes")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCategoryModal;
