import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    PlusCircle,
    Trash2,
    X,
    Image as ImageIcon,
    Loader, // تمت إضافة Loader لزر الإرسال
    LayoutList // تمت إضافة أيقونة جديدة لقسم الفئات الفرعية
} from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

const CategoryForm = ({ categoryToEdit, onFormSubmit, onCancel, serverUrl }) => {
    const { t } = useLanguage();
    const [category, setCategory] = useState({
        name: { en: '', ar: '' },
        description: { en: '', ar: '' },
    });
    const [subCategories, setSubCategories] = useState([]);
    const [mainImageFile, setMainImageFile] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState('');
    const [clearMainImage, setClearMainImage] = useState(false);
    const [subCategoryFiles, setSubCategoryFiles] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const API_URL = `${serverUrl}/api/categories`;

    useEffect(() => {
        if (categoryToEdit) {
            setCategory({
                name: {
                    en: categoryToEdit.name?.en || '',
                    ar: categoryToEdit.name?.ar || '',
                },
                description: {
                    en: categoryToEdit.description?.en || '',
                    ar: categoryToEdit.description?.ar || '',
                },
            });
            setSubCategories(
                categoryToEdit.subCategories?.map((sub) => ({
                    ...sub,
                    // تأكد من أن tempId فريد للفئات الفرعية الجديدة المضافة في النموذج،
                    // ولكن استخدم _id الموجود إذا كانت فئة فرعية موجودة بالفعل
                    tempId: sub._id || `new_${Date.now() + Math.random()}`,
                    preview: sub.imageUrl ? `${serverUrl}${sub.imageUrl}` : '',
                })) || []
            );
            setMainImagePreview(categoryToEdit.imageUrl ? `${serverUrl}${categoryToEdit.imageUrl}` : '');
        } else {
            resetForm();
        }
    }, [categoryToEdit, serverUrl]);

    const resetForm = () => {
        setCategory({ name: { en: '', ar: '' }, description: { en: '', ar: '' } });
        setSubCategories([]);
        setMainImageFile(null);
        setMainImagePreview('');
        setClearMainImage(false);
        setSubCategoryFiles({});
        setMessage({ text: '', type: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ text: '', type: '' }); // مسح الرسائل السابقة

        // التحقق الأساسي من صحة اسم الفئة الرئيسية
        if (!category.name.en.trim() || !category.name.ar.trim()) {
            setMessage({ text: t('categoryForm.validationCategoryNameRequired'), type: 'error' });
            setIsSubmitting(false);
            return;
        }

        // التحقق الأساسي من صحة أسماء الفئات الفرعية
        for (const sub of subCategories) {
            if (!sub.name.en.trim() || !sub.name.ar.trim()) {
                setMessage({ text: t('categoryForm.validationSubcategoryNameRequired'), type: 'error' });
                setIsSubmitting(false);
                return;
            }
        }


        const formData = new FormData();

        formData.append('name_en', category.name.en);
        formData.append('name_ar', category.name.ar);
        formData.append('description_en', category.description.en);
        formData.append('description_ar', category.description.ar);

        // قم بإلحاق clearMainImage فقط إذا كنت تقوم بتحرير فئة موجودة
        if (categoryToEdit) {
            formData.append('clearMainImage', String(clearMainImage));
        }

        if (mainImageFile) {
            formData.append('mainImage', mainImageFile);
        }

        // تحضير بيانات الفئات الفرعية للواجهة الخلفية
        const subCategoryPayload = subCategories.map((sub) => {
            // أرسل _id للفئات الفرعية الموجودة، أو تجاهله للفئات الجديدة
            const subData = {
                name: sub.name,
                description: sub.description,
                // أرسل imageUrl فقط إذا كان موجودًا ولا توجد صورة جديدة تم تحميلها
                imageUrl: sub._id && !subCategoryFiles[sub.tempId] ? sub.imageUrl : undefined,
                // الإشارة إلى ما إذا تم تحميل صورة جديدة لهذه الفئة الفرعية
                hasNewImage: !!subCategoryFiles[sub.tempId]
            };
            if (sub._id) {
                subData._id = sub._id;
            }
            return subData;
        });
        formData.append('subCategories', JSON.stringify(subCategoryPayload));

        // إلحاق ملفات صور الفئات الفرعية الجديدة
        Object.keys(subCategoryFiles).forEach((tempId) => {
            formData.append(`subCategoryImages`, subCategoryFiles[tempId], tempId); // استخدم tempId كاسم للملف للتعرف عليه في الواجهة الخلفية
        });


        try {
            const url = categoryToEdit ? `${API_URL}/${categoryToEdit._id}` : API_URL;
            const method = categoryToEdit ? 'put' : 'post';
            const headers = {
                'Content-Type': 'multipart/form-data', // Axios يضبط تلقائيًا الحدود
                'x-admin-request': 'true',
            };
            await axios[method](url, formData, { headers });
            setMessage({ text: t('categoryForm.successMessage', { action: categoryToEdit ? t('categoryForm.updated') : t('categoryForm.created') }), type: 'success' });
            setTimeout(() => onFormSubmit(), 1500); // إغلاق النموذج وتحديث القائمة بعد تأخير
        } catch (err) {
            console.error('Submission error:', err);
            const errorMessage = err.response?.data?.message || t('categoryForm.errorMessage');
            setMessage({ text: errorMessage, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMainFieldChange = (e) => {
        const { name, value } = e.target;
        const [field, lang] = name.split('_');
        setCategory((prev) => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));
    };

    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMainImageFile(file);
            setMainImagePreview(URL.createObjectURL(file));
            setClearMainImage(false); // إذا تم تحديد صورة جديدة، فلا تقم بمسح الصورة الموجودة عند الإرسال
        }
    };

    const handleRemoveMainImage = () => {
        setMainImageFile(null);
        setMainImagePreview('');
        setClearMainImage(true); // إرسال إشارة إلى الواجهة الخلفية لإزالة الصورة إذا كان تعديلاً
    };

    const handleAddSubCategory = () => {
        const newSub = {
            tempId: `new_${Date.now() + Math.random()}`, // ضمان tempId فريد للإدخالات الجديدة
            name: { en: '', ar: '' },
            description: { en: '', ar: '' },
            preview: '',
            hasNewImage: false,
        };
        setSubCategories((prev) => [...prev, newSub]);
    };

    const handleSubCategoryChange = (tempId, field, lang, value) => {
        setSubCategories((prev) =>
            prev.map((sub) =>
                sub.tempId === tempId
                    ? { ...sub, [field]: { ...sub[field], [lang]: value } }
                    : sub
            )
        );
    };

    const handleSubCategoryImageChange = (tempId, file) => {
        if (file) {
            setSubCategoryFiles((prev) => ({ ...prev, [tempId]: file }));
            setSubCategories((prev) =>
                prev.map((sub) =>
                    sub.tempId === tempId
                        ? { ...sub, hasNewImage: true, preview: URL.createObjectURL(file) }
                        : sub
                )
            );
        }
    };

    const handleRemoveSubCategory = (tempId) => {
        setSubCategories((prev) => prev.filter((sub) => sub.tempId !== tempId));
        setSubCategoryFiles((prev) => {
            const newFiles = { ...prev };
            delete newFiles[tempId]; // إزالة الملف المرتبط إذا كان تحميلًا جديدًا
            return newFiles;
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform scale-95 animate-scale-in transition-all duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                        {categoryToEdit ? t('categoryForm.editCategoryTitle') : t('categoryForm.addCategoryTitle')}
                    </h3>
                    <button
                        onClick={onCancel}
                        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white transition-colors"
                        aria-label={t('general.close')}
                    >
                        <X size={24} />
                    </button>
                </div>

                {message.text && (
                    <div
                        className={`mb-4 p-3 rounded-lg flex items-center gap-3 ${
                            message.type === 'success'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                        role="alert"
                    >
                        {message.type === 'success' ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                        )}
                        <p className="text-sm font-medium">{message.text}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* تفاصيل الفئة الرئيسية */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <label htmlFor="name_en" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('categoryForm.categoryNameEnLabel')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name_en"
                                name="name_en"
                                value={category.name.en}
                                onChange={handleMainFieldChange}
                                className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="name_ar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('categoryForm.categoryNameArLabel')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name_ar"
                                name="name_ar"
                                value={category.name.ar}
                                onChange={handleMainFieldChange}
                                className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                                dir="rtl"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="description_en" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('categoryForm.descriptionEnLabel')}
                            </label>
                            <textarea
                                id="description_en"
                                name="description_en"
                                value={category.description.en}
                                onChange={handleMainFieldChange}
                                rows="2"
                                className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            ></textarea>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="description_ar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('categoryForm.descriptionArLabel')}
                            </label>
                            <textarea
                                id="description_ar"
                                name="description_ar"
                                value={category.description.ar}
                                onChange={handleMainFieldChange}
                                rows="2"
                                className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                dir="rtl"
                            ></textarea>
                        </div>
                    </div>

                    {/* صورة الفئة الرئيسية */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('categoryForm.categoryImageLabel')}
                        </label>
                        <div className="mt-2 flex items-center gap-4">
                            <div className="flex-shrink-0 h-24 w-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600 shadow-sm">
                                {mainImagePreview ? (
                                    <img src={mainImagePreview} alt="Category Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <ImageIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                                )}
                            </div>
                            <label className="block">
                                <span className="sr-only">Choose category image</span>
                                <input
                                    type="file"
                                    onChange={handleMainImageChange}
                                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-indigo-50 file:text-indigo-700
                                        hover:file:bg-indigo-100"
                                    accept="image/*"
                                />
                            </label>
                            {mainImagePreview && (
                                <button
                                    type="button"
                                    onClick={handleRemoveMainImage}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
                                >
                                    <Trash2 size={16} className="mr-1" /> {t('categoryForm.removeImage')}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* قسم الفئات الفرعية */}
                    <div className="p-4 sm:p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                        <h4 className="text-xl font-semibold mb-5 text-gray-800 dark:text-white flex items-center gap-2">
                            <LayoutList size={22} className="text-indigo-500" />
                            {t('categoryForm.subCategoriesTitle')}
                        </h4>
                        <div className="space-y-6">
                            {subCategories.length === 0 && (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                    {t('categoryForm.noSubcategoriesMessage')}
                                </p>
                            )}
                            {subCategories.map((sub, index) => (
                                <div key={sub.tempId} className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                                    <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 w-full">
                                        <div className="md:col-span-2 font-medium text-gray-700 dark:text-gray-300">
                                            {t('categoryForm.subCategory')} {index + 1}
                                        </div>
                                        <div>
                                            <label htmlFor={`sub_name_en_${sub.tempId}`} className="sr-only">Sub-Category Name (EN)</label>
                                            <input
                                                type="text"
                                                id={`sub_name_en_${sub.tempId}`}
                                                placeholder={t('categoryForm.subCategoryNameEnPlaceholder')}
                                                value={sub.name?.en || ''}
                                                onChange={(e) => handleSubCategoryChange(sub.tempId, 'name', 'en', e.target.value)}
                                                className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor={`sub_name_ar_${sub.tempId}`} className="sr-only">اسم القسم الفرعي (AR)</label>
                                            <input
                                                type="text"
                                                id={`sub_name_ar_${sub.tempId}`}
                                                placeholder={t('categoryForm.subCategoryNameArPlaceholder')}
                                                value={sub.name?.ar || ''}
                                                onChange={(e) => handleSubCategoryChange(sub.tempId, 'name', 'ar', e.target.value)}
                                                className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                required
                                                dir="rtl"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label htmlFor={`sub_description_en_${sub.tempId}`} className="sr-only">Description (EN)</label>
                                            <textarea
                                                id={`sub_description_en_${sub.tempId}`}
                                                placeholder={t('categoryForm.subCategoryDescriptionEnPlaceholder')}
                                                value={sub.description?.en || ''}
                                                onChange={(e) => handleSubCategoryChange(sub.tempId, 'description', 'en', e.target.value)}
                                                className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                rows="2"
                                            ></textarea>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label htmlFor={`sub_description_ar_${sub.tempId}`} className="sr-only">الوصف (AR)</label>
                                            <textarea
                                                id={`sub_description_ar_${sub.tempId}`}
                                                placeholder={t('categoryForm.subCategoryDescriptionArPlaceholder')}
                                                value={sub.description?.ar || ''}
                                                onChange={(e) => handleSubCategoryChange(sub.tempId, 'description', 'ar', e.target.value)}
                                                className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                rows="2"
                                                dir="rtl"
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center flex-shrink-0 mt-4 sm:mt-0">
                                        <div className="h-20 w-20 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600 shadow-sm">
                                            {sub.preview ? (
                                                <img src={sub.preview} alt="Sub Preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <ImageIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                            )}
                                        </div>
                                        <label
                                            htmlFor={`sub-img-${sub.tempId}`}
                                            className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                                        >
                                            {t('categoryForm.changeImage')}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                id={`sub-img-${sub.tempId}`}
                                                className="sr-only" // مخفي بصريًا ولكن يمكن الوصول إليه
                                                onChange={(e) => handleSubCategoryImageChange(sub.tempId, e.target.files[0])}
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSubCategory(sub.tempId)}
                                            className="mt-2 p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                                            aria-label={t('categoryForm.removeSubCategory')}
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={handleAddSubCategory}
                            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800"
                        >
                            <PlusCircle size={20} className="mr-2" /> {t('categoryForm.addSubCategoryButton')}
                        </button>
                    </div>

                    {/* إجراءات النموذج */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                            disabled={isSubmitting} // تعطيل الإلغاء أثناء الإرسال
                        >
                            {t('general.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader size={20} className="animate-spin mr-2" /> {t('general.saving')}
                                </>
                            ) : (
                                <>{categoryToEdit ? t('general.saveChanges') : t('general.addCategory')}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryForm;