import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../LanguageContext';
import { PlusCircle, Trash2, X, Image as ImageIcon } from 'lucide-react';

const CategoryForm = ({ categoryToEdit, onFormSubmit, onCancel, serverUrl }) => {
    const { t } = useLanguage();
    
    const [category, setCategory] = useState({
        name_en: '', name_ar: '', description_en: '', description_ar: '', subCategories: []
    });
    
    const [mainImageFile, setMainImageFile] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState('');
    const [clearMainImage, setClearMainImage] = useState(false);
    const [subCategoryFiles, setSubCategoryFiles] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (categoryToEdit) {
            setCategory({
                _id: categoryToEdit._id,
                name_en: categoryToEdit.name?.en || '',
                name_ar: categoryToEdit.name?.ar || '',
                description_en: categoryToEdit.description?.en || '',
                description_ar: categoryToEdit.description?.ar || '',
                subCategories: categoryToEdit.subCategories?.map(sc => ({...sc, tempId: sc._id, preview: sc.imageUrl ? `${serverUrl}${sc.imageUrl}` : ''})) || []
            });
            // --- FIX: Use 'categoryToEdit' instead of 'sc' ---
            setMainImagePreview(categoryToEdit.imageUrl ? `${serverUrl}${categoryToEdit.imageUrl}` : '');
        } else {
            setCategory({ name_en: '', name_ar: '', description_en: '', description_ar: '', subCategories: [] });
            setMainImagePreview('');
        }
        setMainImageFile(null);
        setSubCategoryFiles({});
        setClearMainImage(false);
        setMessage({ text: '', type: '' });
    }, [categoryToEdit, serverUrl]);

    const handleMainFieldChange = (e) => {
        setCategory(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMainImageFile(file);
            setMainImagePreview(URL.createObjectURL(file));
            setClearMainImage(false);
        }
    };
    
    const handleRemoveMainImage = () => {
        setMainImageFile(null);
        setMainImagePreview('');
        setClearMainImage(true);
    };

    const handleAddSubCategory = () => {
        const newSub = { 
            tempId: `new_${Date.now()}`, 
            name: { en: '', ar: '' },
            description: { en: '', ar: '' },
            preview: '' 
        };
        setCategory(prev => ({ ...prev, subCategories: [...prev.subCategories, newSub] }));
    };

    const handleSubCategoryChange = (tempId, lang, value) => {
        setCategory(prev => ({
            ...prev,
            subCategories: prev.subCategories.map(sub => 
                sub.tempId === tempId ? { ...sub, name: { ...sub.name, [lang]: value } } : sub
            )
        }));
    };
    
    const handleSubCategoryImageChange = (tempId, file) => {
        if (file) {
            setSubCategoryFiles(prev => ({...prev, [tempId]: file }));
            setCategory(prev => ({
                ...prev,
                subCategories: prev.subCategories.map(sub => 
                    sub.tempId === tempId ? { ...sub, preview: URL.createObjectURL(file) } : sub
                )
            }));
        }
    };
    
    const handleRemoveSubCategory = (tempId) => {
        setCategory(prev => ({ ...prev, subCategories: prev.subCategories.filter(sub => sub.tempId !== tempId) }));
        setSubCategoryFiles(prev => {
            const newFiles = { ...prev };
            delete newFiles[tempId];
            return newFiles;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ text: '', type: '' });

        const formData = new FormData();
        formData.append('name_en', category.name_en);
        formData.append('name_ar', category.name_ar);
        formData.append('description_en', category.description_en);
        formData.append('description_ar', category.description_ar);
        
        if (categoryToEdit) {
            formData.append('clearMainImage', String(clearMainImage));
        }

        if (mainImageFile) {
            formData.append('mainImage', mainImageFile);
        }

        const subCategoryPayload = [];
        let newImageCounter = 0;
        
        category.subCategories.forEach(sub => {
            const fileForThisSub = subCategoryFiles[sub.tempId];
            const cleanSub = {
                name: {
                    en: sub.name?.en || '',
                    ar: sub.name?.ar || ''
                },
                description: {
                    en: sub.description?.en || '',
                    ar: sub.description?.ar || ''
                },
                imageUrl: sub.imageUrl || null
            };

            if (sub._id) {
                cleanSub._id = sub._id;
            }
            
            if (fileForThisSub) {
                formData.append('subCategoryImages', fileForThisSub);
                if (categoryToEdit) {
                    cleanSub.hasNewImage = true;
                } else {
                    cleanSub.tempImageIndex = newImageCounter++;
                }
            }
            subCategoryPayload.push(cleanSub);
        });

        formData.append('subCategories', JSON.stringify(subCategoryPayload));

        try {
            const url = categoryToEdit ? `${serverUrl}/api/categories/${categoryToEdit._id}` : `${serverUrl}/api/categories`;
            const method = categoryToEdit ? 'put' : 'post';

            await axios[method](url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            
            setMessage({ text: `Category ${categoryToEdit ? 'updated' : 'created'} successfully!`, type: 'success' });
            setTimeout(() => onFormSubmit(), 1000);
            
        } catch (err) {
            let errorMessage = err.response?.data?.message || 'An error occurred.';
            if (err.response?.data?.error?.includes('E11000')) {
                errorMessage = err.response.data.error.includes('name.en') ? 'A category with this English name already exists.' : 'A category with this Arabic name already exists.';
            }
            setMessage({ text: errorMessage, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">{categoryToEdit ? t('adminCategoryPage.editCategory') : t('adminCategoryPage.addCategoryModalTitle')}</h3>
                    <button onClick={onCancel} className="p-1 text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>
                
                {message.text && <p className={`mb-4 text-center p-2 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message.text}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-sm font-medium text-gray-700">{t('adminCategoryPage.categoryNameLabelEn')}</label><input type="text" name="name_en" value={category.name_en} onChange={handleMainFieldChange} className="w-full p-2 border rounded mt-1" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700">{t('adminCategoryPage.categoryNameLabelAr')}</label><input type="text" name="name_ar" value={category.name_ar} onChange={handleMainFieldChange} className="w-full p-2 border rounded mt-1 text-right" required /></div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('adminCategoryPage.categoryImageLabel')}</label>
                        <div className="mt-1 flex items-center gap-4">
                            <span className="h-20 w-20 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                                {mainImagePreview ? <img src={mainImagePreview} alt="Main Preview" className="h-full w-full object-cover" /> : <ImageIcon className="h-8 w-8 text-gray-400" />}
                            </span>
                            <input type="file" name="mainImage" onChange={handleMainImageChange} className="text-sm" accept="image/*" />
                            {mainImagePreview && <button type="button" onClick={handleRemoveMainImage} className="text-xs text-red-600">Remove</button>}
                        </div>
                    </div>
                    <div className="p-4 border-t border-b">
                        <h4 className="text-lg font-semibold mb-4">{t('adminCategoryPage.subCategoriesTitle')}</h4>
                        <div className="space-y-4">
                            {category.subCategories.map((sub) => (
                                <div key={sub.tempId} className="flex items-start gap-4 p-3 bg-gray-50 rounded-md border">
                                    <div className="flex-grow space-y-2">
                                        <input type="text" placeholder="Sub-Category Name (EN)" value={sub.name?.en || ''} onChange={(e) => handleSubCategoryChange(sub.tempId, 'en', e.target.value)} className="w-full p-2 border rounded" required />
                                        <input type="text" placeholder="Sub-Category Name (AR)" value={sub.name?.ar || ''} onChange={(e) => handleSubCategoryChange(sub.tempId, 'ar', e.target.value)} className="w-full p-2 border rounded text-right" required />
                                    </div>
                                    <div className="flex-shrink-0 flex flex-col items-center">
                                        <span className="h-16 w-16 rounded-md overflow-hidden bg-gray-200 flex items-center justify-center">
                                           {sub.preview ? <img src={sub.preview} alt="Sub Preview" className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 text-gray-400" />}
                                        </span>
                                        <input type="file" onChange={(e) => handleSubCategoryImageChange(sub.tempId, e.target.files[0])} className="hidden" id={`sub-img-${sub.tempId}`} accept="image/*" />
                                        <label htmlFor={`sub-img-${sub.tempId}`} className="text-xs text-blue-600 cursor-pointer mt-1">Change</label>
                                    </div>
                                    <button type="button" onClick={() => handleRemoveSubCategory(sub.tempId)} className="p-2 text-red-500 hover:bg-red-100 rounded-full self-center"><Trash2 size={18} /></button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={handleAddSubCategory} className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"><PlusCircle size={20} /> Add Sub-Category</button>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300">{isSubmitting ? 'Saving...' : 'Save Category'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryForm;