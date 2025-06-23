// components/Admin/AdvertisementPage/EditAdvertisementModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../LanguageContext';

const EditAdvertisementModal = ({ advertisement, onClose, onAdvertisementUpdated, serverUrl }) => {
    const { t } = useLanguage();
    const [editedAdvertisement, setEditedAdvertisement] = useState({
        title_en: '', title_ar: '', description_en: '', description_ar: '',
        link: '', type: 'slide', isActive: true, order: 0,
        startDate: '', endDate: '', originalPrice: '', discountedPrice: '',
        currency: '', productRef: '',
    });

    const [products, setProducts] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // ✅ مصحح: إضافة هيدر لضمان الحصول على بيانات اللغة كاملة للمنتجات
                const res = await axios.get(`${serverUrl}/api/products`, {
                    headers: { 'x-admin-request': 'true' }
                });
                setProducts(res.data);
            } catch (error) {
                console.error("Failed to fetch products for dropdown:", error);
            }
        };
        fetchProducts();
    }, [serverUrl]);

    useEffect(() => {
        if (advertisement) {
            setEditedAdvertisement({
                title_en: advertisement.title?.en || '',
                title_ar: advertisement.title?.ar || '',
                description_en: advertisement.description?.en || '',
                description_ar: advertisement.description?.ar || '',
                link: advertisement.link || '',
                type: advertisement.type || 'slide',
                isActive: advertisement.isActive,
                order: advertisement.order || 0,
                startDate: advertisement.startDate ? new Date(advertisement.startDate).toISOString().slice(0, 10) : '',
                endDate: advertisement.endDate ? new Date(advertisement.endDate).toISOString().slice(0, 10) : '',
                originalPrice: advertisement.originalPrice ?? '',
                discountedPrice: advertisement.discountedPrice ?? '',
                currency: advertisement.currency || 'SAR',
                productRef: advertisement.productRef?._id || advertisement.productRef || '',
            });
            setCurrentImageUrl(advertisement.image ? `${serverUrl}${advertisement.image}` : '');
        }
    }, [advertisement, serverUrl]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditedAdvertisement(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setCurrentImageUrl(URL.createObjectURL(file));
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');
    
        const formData = new FormData();
        Object.keys(editedAdvertisement).forEach(key => {
            formData.append(key, editedAdvertisement[key] ?? '');
        });
    
        if (imageFile) {
            formData.append('image', imageFile);
        }
    
        try {
            await axios.put(`${serverUrl}/api/advertisements/${advertisement._id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert(t('advertisementAdmin.updateSuccess'));
            onAdvertisementUpdated(); // This will trigger a re-fetch in the parent
            onClose();
        } catch (err) {
            console.error("Error updating advertisement:", err.response?.data);
            setErrorMessage(`${t('advertisementAdmin.updateError')} ${err.response?.data?.message || err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!advertisement) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-700 dark:text-white">{t('advertisementAdmin.editAdvertisementTitle')}</h2>
                {errorMessage && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{errorMessage}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div><label htmlFor="edit-title_en" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('advertisementAdmin.titleEn')}</label><input type="text" id="edit-title_en" name="title_en" value={editedAdvertisement.title_en} onChange={handleChange} className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600" required/></div>
                    <div><label htmlFor="edit-title_ar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('advertisementAdmin.titleAr')}</label><input type="text" id="edit-title_ar" name="title_ar" value={editedAdvertisement.title_ar} onChange={handleChange} className="w-full p-3 border rounded-md text-right dark:bg-gray-700 dark:border-gray-600" required/></div>
                    
                    <div>
                        <label htmlFor="edit-productRef" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('advertisementAdmin.linkToProduct')}</label>
                        <select id="edit-productRef" name="productRef" value={editedAdvertisement.productRef} onChange={handleChange} className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                            <option value="">{t('advertisementAdmin.noProductLinked')}</option>
                            {/* ✅ مصحح: عرض الاسم باللغة الإنجليزية أو العربية كبديل */}
                            {products.map(product => (<option key={product._id} value={product._id}>{product.name?.en || product.name?.ar || 'Unnamed Product'}</option>))}
                        </select>
                    </div>

                    {/* ... other fields like description, link, etc. ... */}

                    <div><label htmlFor="edit-originalPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('advertisementAdmin.originalPrice')}</label><input type="number" id="edit-originalPrice" name="originalPrice" value={editedAdvertisement.originalPrice} onChange={handleChange} className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600" step="0.01"/></div>
                    <div><label htmlFor="edit-discountedPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('advertisementAdmin.discountedPrice')}</label><input type="number" id="edit-discountedPrice" name="discountedPrice" value={editedAdvertisement.discountedPrice} onChange={handleChange} className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600" step="0.01"/></div>
                    
                    <div>
                        <label htmlFor="edit-image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('advertisementAdmin.imageOptional')}</label>
                        {currentImageUrl && (<img src={currentImageUrl} alt="Current advertisement" className="mt-2 mb-2 w-32 h-32 object-cover rounded" />)}
                        <input type="file" id="edit-image" name="image" onChange={handleImageChange} accept="image/*" className="w-full p-2 border rounded-md"/>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 border rounded-md">{t('adminCategoryPage.cancelButton')}</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-gray-400">
                            {isSubmitting ? t('advertisementAdmin.updatingButton') : t('advertisementAdmin.updateButton')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditAdvertisementModal;