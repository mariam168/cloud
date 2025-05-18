
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../LanguageContext'; 

const AddCategoryModal = ({ isOpen, onClose, onCategoryAdded, serverUrl }) => {
    const { t, language } = useLanguage();
    const [category, setCategory] = useState({
        name_en: '', 
        name_ar: '', 
        description_en: '', 
        description_ar: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    useEffect(() => {
        if (isOpen) {
            setCategory({ name_en: '', name_ar: '', description_en: '', description_ar: '' });
            setMessage({ text: '', type: '' });
        }
    }, [isOpen]);

        
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCategory(prev => ({ ...prev, [name]: value }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!category.name_en.trim() || !category.name_ar.trim()) {
            setMessage({ text: t.adminCategoryPage?.categoryNamesRequiredError || 'اسم الفئة باللغتين مطلوب.', type: 'error' });
            return;
        }
        setIsSubmitting(true);
        setMessage({ text: '', type: '' });     

            try {
            await axios.post(`${serverUrl}/api/categories`, {
                name_en: category.name_en.trim(),   
                name_ar: category.name_ar.trim(),
                description_en: category.description_en.trim(), 
                description_ar: category.description_ar.trim(),
            });
            setMessage({ text: t.adminCategoryPage?.addSuccess || 'تمت إضافة الفئة بنجاح!', type: 'success' });
            setCategory({ name_en: '', name_ar: '', description_en: '', description_ar: '' });


            if (onCategoryAdded) {
                onCategoryAdded(); 
            }
        } catch (err) {
            console.error("Error adding category:", err.response ? err.response.data : err.message);
            const backendMessage = err.response?.data?.message;
            setMessage({
                text: backendMessage || (t.adminCategoryPage?.errorAddingCategory || "حدث خطأ أثناء إضافة الفئة."),
                type: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out scale-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-700">{t.adminCategoryPage?.addCategoryModalTitle || 'Add New Category'}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                        aria-label={t.adminCategoryPage?.closeButtonLabel || "Close"}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                {message.text && (
                    <p className={`text-center mb-4 p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </p>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="modal-category-name_en" className="block text-sm font-medium text-gray-700 mb-1">
                            {t.adminCategoryPage?.categoryNameLabelEn || 'Category Name (English)'} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="modal-category-name_en"
                            name="name_en" 
                            value={category.name_en}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                            required
                            autoFocus 
                        />
                    </div>
                    <div>
                        <label htmlFor="modal-category-name_ar" className="block text-sm font-medium text-gray-700 mb-1">
                            {t.adminCategoryPage?.categoryNameLabelAr || 'اسم الفئة (العربية)'} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="modal-category-name_ar"
                            name="name_ar" 
                            value={category.name_ar}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-right" // Added text-right
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="modal-category-description_en" className="block text-sm font-medium text-gray-700 mb-1">
                            {t.adminCategoryPage?.categoryDescriptionLabelEn || 'Description (English) (Optional)'}
                        </label>
                        <textarea
                            id="modal-category-description_en"
                            name="description_en" 
                            value={category.description_en}
                            onChange={handleChange}
                            rows="3"
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="modal-category-description_ar" className="block text-sm font-medium text-gray-700 mb-1">
                            {t.adminCategoryPage?.categoryDescriptionLabelAr || 'الوصف (العربية) (اختياري)'}
                        </label>
                        <textarea
                            id="modal-category-description_ar"
                            name="description_ar" 
                            value={category.description_ar}
                            onChange={handleChange}
                            rows="3"
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-right" // Added text-right
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
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (t.adminCategoryPage?.addingButton || "Adding...") : (t.adminCategoryPage?.addButton || "Add Category")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCategoryModal;
