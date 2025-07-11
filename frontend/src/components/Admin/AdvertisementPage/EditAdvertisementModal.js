import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../LanguageContext';
import { Loader2, CheckCircle, XCircle, X } from 'lucide-react';

const EditAdvertisementModal = ({ advertisement, onClose, onAdvertisementUpdated, serverUrl }) => {
    const { t, language } = useLanguage();

    const [editedAdvertisement, setEditedAdvertisement] = useState({
        title_en: '', title_ar: '', description_en: '', description_ar: '',
        link: '', type: 'slide', isActive: true, order: 0,
        startDate: '', endDate: '', discountPercentage: '', productRef: '',
    });

    const [products, setProducts] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [submitMessageType, setSubmitMessageType] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${serverUrl}/api/products/admin-list`);
                setProducts(res.data);
            } catch (error) {
                console.error("Failed to fetch products for dropdown:", error);
                setSubmitMessage(t('advertisementAdmin.errorFetchingProducts'));
                setSubmitMessageType('error');
            }
        };
        fetchProducts();
    }, [serverUrl, t]);

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
                discountPercentage: advertisement.discountPercentage ?? '',
                productRef: advertisement.productRef?._id || '',
            });
            setCurrentImageUrl(advertisement.image ? `${serverUrl}${advertisement.image}` : '');
            setSubmitMessage('');
            setSubmitMessageType('');
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
        setSubmitMessage('');
        setSubmitMessageType('');

        if (!editedAdvertisement.title_en.trim() || !editedAdvertisement.title_ar.trim()) {
            setSubmitMessage(t('advertisementAdmin.titleRequired'));
            setSubmitMessageType('error');
            setIsSubmitting(false);
            return;
        }

        const formData = new FormData();
        Object.keys(editedAdvertisement).forEach(key => {
            if (key === 'productRef' && editedAdvertisement[key] === '') {
                 formData.append(key, '');
            } else if (key === 'isActive') {
                formData.append(key, editedAdvertisement[key] ? 'true' : 'false');
            } else if (editedAdvertisement[key] !== null) {
                formData.append(key, editedAdvertisement[key]);
            }
        });

        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            await axios.put(`${serverUrl}/api/advertisements/${advertisement._id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSubmitMessage(t('advertisementAdmin.updateSuccess'));
            setSubmitMessageType('success');
            setTimeout(() => {
                onAdvertisementUpdated();
                onClose();
            }, 1500);
        } catch (err) {
            console.error("Error updating advertisement:", err.response?.data);
            const msg = err.response?.data?.message || err.message;
            setSubmitMessage(`${t('advertisementAdmin.updateError')} ${msg}`);
            setSubmitMessageType('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!advertisement) return null;

    const inputClasses = "w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5";
    const checkboxLabelClasses = "flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-zinc-300 cursor-pointer";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg relative w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-zinc-800">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:text-zinc-500 dark:hover:text-white transition-colors">
                    <X size={24} />
                </button>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    {t('advertisementAdmin.editAdvertisementTitle')}
                </h2>

                {submitMessage && (
                    <div className={`flex items-center gap-3 p-3 rounded-lg mb-4 text-sm font-medium ${
                        submitMessageType === 'success' 
                        ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400" 
                        : "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                    }`}>
                        {submitMessageType === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                        <span>{submitMessage}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="edit-title_en" className={labelClasses}>{t('advertisementAdmin.titleEn')}</label>
                            <input type="text" id="edit-title_en" name="title_en" value={editedAdvertisement.title_en} onChange={handleChange} className={inputClasses} placeholder={t('advertisementAdmin.titleEnPlaceholder')} required />
                        </div>
                        <div>
                            <label htmlFor="edit-title_ar" className={labelClasses}>{t('advertisementAdmin.titleAr')}</label>
                            <input type="text" id="edit-title_ar" name="title_ar" value={editedAdvertisement.title_ar} onChange={handleChange} className={`${inputClasses} text-right`} placeholder={t('advertisementAdmin.titleArPlaceholder')} required dir="rtl" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="edit-description_en" className={labelClasses}>{t('advertisementAdmin.descriptionEn')}</label>
                        <textarea id="edit-description_en" name="description_en" value={editedAdvertisement.description_en} onChange={handleChange} className={inputClasses} rows="3" placeholder={t('advertisementAdmin.descriptionEnPlaceholder')} />
                    </div>
                    <div>
                        <label htmlFor="edit-description_ar" className={labelClasses}>{t('advertisementAdmin.descriptionAr')}</label>
                        <textarea id="edit-description_ar" name="description_ar" value={editedAdvertisement.description_ar} onChange={handleChange} className={`${inputClasses} text-right`} rows="3" placeholder={t('advertisementAdmin.descriptionArPlaceholder')} dir="rtl" />
                    </div>

                    <div>
                        <label htmlFor="edit-productRef" className={labelClasses}>{t('advertisementAdmin.linkToProduct')}</label>
                        <select id="edit-productRef" name="productRef" value={editedAdvertisement.productRef} onChange={handleChange} className={inputClasses}>
                            <option value="">{t('advertisementAdmin.noProductLinked')}</option>
                            {products.map(product => (
                                <option key={product._id} value={product._id}>
                                    {/* --- تصحيح نهائي: عرض الاسم مباشرة --- */}
                                    {product.name || t('general.unnamedProduct')}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        {/* --- تصحيح بسيط: استخدام مفتاح ترجمة صحيح --- */}
                        <label htmlFor="edit-discountPercentage" className={labelClasses}>{t('advertisementAdmin.discountPercentageLabel')} (%)</label>
                        <input type="number" id="edit-discountPercentage" name="discountPercentage" value={editedAdvertisement.discountPercentage} onChange={handleChange} className={inputClasses} min="0" max="100" placeholder="e.g., 10 for 10%" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="edit-link" className={labelClasses}>{t('advertisementAdmin.linkLabel')}</label>
                            <input type="url" id="edit-link" name="link" value={editedAdvertisement.link} onChange={handleChange} className={inputClasses} placeholder={t('advertisementAdmin.linkPlaceholder')} />
                        </div>
                        <div>
                            <label htmlFor="edit-type" className={labelClasses}>{t('advertisementAdmin.typeLabel')}</label>
                            <select id="edit-type" name="type" value={editedAdvertisement.type} onChange={handleChange} className={inputClasses}>
                                <option value="slide">{t('advertisementAdmin.typeSlide')}</option>
                                <option value="sideOffer">{t('advertisementAdmin.typeSideOffer')}</option>
                                <option value="weeklyOffer">{t('advertisementAdmin.typeWeeklyOffer')}</option>
                                <option value="other">{t('advertisementAdmin.typeOther')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="edit-startDate" className={labelClasses}>{t('advertisementAdmin.startDate')}</label>
                            <input type="date" id="edit-startDate" name="startDate" value={editedAdvertisement.startDate} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div>
                            <label htmlFor="edit-endDate" className={labelClasses}>{t('advertisementAdmin.endDate')}</label>
                            <input type="date" id="edit-endDate" name="endDate" value={editedAdvertisement.endDate} onChange={handleChange} className={inputClasses} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="edit-order" className={labelClasses}>{t('advertisementAdmin.orderLabel')}</label>
                            <input type="number" id="edit-order" name="order" value={editedAdvertisement.order} onChange={handleChange} className={inputClasses} min="0" placeholder="0" />
                        </div>
                        <div className="self-end">
                            <label className={checkboxLabelClasses}>
                                <input type="checkbox" id="edit-isActive" name="isActive" checked={editedAdvertisement.isActive} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary-light" />
                                <span>{t('advertisementAdmin.isActive')}</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="edit-image" className={labelClasses}>{t('advertisementAdmin.imageOptional')}</label>
                        {currentImageUrl && (
                            <img src={currentImageUrl} alt={t('advertisementAdmin.currentImage')} className="mt-2 mb-3 w-32 h-32 object-cover rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700" />
                        )}
                        <input type="file" id="edit-image" name="image" onChange={handleImageChange} accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 dark:file:bg-primary-light/10 file:text-primary-dark dark:file:text-primary-light hover:file:bg-primary/20 dark:hover:file:bg-primary-light/20" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-zinc-800">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-5 py-2.5 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50">
                            {t('general.cancel')}
                        </button>
                        <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60">
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                            <span>{isSubmitting ? t('advertisementAdmin.updatingButton') : t('advertisementAdmin.updateButton')}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditAdvertisementModal;