// components/Admin/AdvertisementPage/EditAdvertisementModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../LanguageContext';
import { FaSpinner, FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa'; // Added icons

const EditAdvertisementModal = ({ advertisement, onClose, onAdvertisementUpdated, serverUrl }) => {
    const { t, language } = useLanguage();

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
    const [submitMessage, setSubmitMessage] = useState(''); // Renamed from errorMessage
    const [submitMessageType, setSubmitMessageType] = useState(''); // 'success' or 'error'

    // Fetch products for the dropdown
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${serverUrl}/api/products`, {
                    headers: { 'x-admin-request': 'true' }
                });
                setProducts(res.data);
            } catch (error) {
                console.error("Failed to fetch products for dropdown:", error);
                setSubmitMessage(t('advertisementAdmin.errorFetchingProducts') || 'Failed to load products for linking.');
                setSubmitMessageType('error');
            }
        };
        fetchProducts();
    }, [serverUrl, t]);

    // Initialize form fields with existing advertisement data
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
            // Clear any previous messages
            setSubmitMessage('');
            setSubmitMessageType('');
        }
    }, [advertisement, serverUrl, t]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditedAdvertisement(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setCurrentImageUrl(URL.createObjectURL(file)); // Show preview of new image
        } else {
            setImageFile(null);
            // Revert to original image if file input is cleared
            setCurrentImageUrl(advertisement.image ? `${serverUrl}${advertisement.image}` : '');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage('');
        setSubmitMessageType('');

        // Basic validation
        if (!editedAdvertisement.title_en.trim() || !editedAdvertisement.title_ar.trim()) {
            setSubmitMessage(t('advertisementAdmin.titleRequired') || 'Title (English & Arabic) are required!');
            setSubmitMessageType('error');
            setIsSubmitting(false);
            return;
        }

        const formData = new FormData();
        Object.keys(editedAdvertisement).forEach(key => {
            // Append only if value is not empty, and convert boolean to string
            if (key === 'isActive') {
                formData.append(key, editedAdvertisement[key] ? 'true' : 'false');
            } else if (editedAdvertisement[key] !== "" && editedAdvertisement[key] !== null) {
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

            setSubmitMessage(t('advertisementAdmin.updateSuccess') || 'Advertisement updated successfully!');
            setSubmitMessageType('success');
            setTimeout(() => { // Give time for message to be seen before closing
                onAdvertisementUpdated(); // This will trigger a re-fetch in the parent
                onClose();
            }, 1500); // Close after 1.5 seconds
        } catch (err) {
            console.error("Error updating advertisement:", err.response?.data);
            const msg = err.response?.data?.message || err.message;
            setSubmitMessage(`${t('advertisementAdmin.updateError') || 'Error updating advertisement:'} ${msg}`);
            setSubmitMessageType('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!advertisement) return null;

    const inputClasses = "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
    const checkboxClasses = "h-5 w-5 text-indigo-600 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:checked:bg-indigo-600";
    const fileInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-700 dark:file:text-indigo-100 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-600 cursor-pointer";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-95 animate-scale-in relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 text-3xl font-bold transition-colors duration-200"
                    aria-label={t('general.close') || 'Close'}
                >
                    <FaTimes />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white border-b pb-3 border-gray-200 dark:border-gray-700">
                    {t('advertisementAdmin.editAdvertisementTitle') || 'Edit Advertisement'}
                </h2>

                {/* Submission Message */}
                {submitMessage && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
                        submitMessageType === 'success' ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" :
                        "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                    }`}>
                        {submitMessageType === 'success' ? <FaCheckCircle className="text-xl" /> : <FaExclamationCircle className="text-xl" />}
                        <p className="text-sm font-medium">{submitMessage}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Title (English) */}
                    <div>
                        <label htmlFor="edit-title_en" className={labelClasses}>{t('advertisementAdmin.titleEn')}</label>
                        <input
                            type="text"
                            id="edit-title_en"
                            name="title_en"
                            value={editedAdvertisement.title_en}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder={t('advertisementAdmin.titleEnPlaceholder') || 'Enter title in English'}
                            required
                        />
                    </div>

                    {/* Title (Arabic) */}
                    <div>
                        <label htmlFor="edit-title_ar" className={labelClasses}>{t('advertisementAdmin.titleAr')}</label>
                        <input
                            type="text"
                            id="edit-title_ar"
                            name="title_ar"
                            value={editedAdvertisement.title_ar}
                            onChange={handleChange}
                            className={`${inputClasses} text-right`}
                            placeholder={t('advertisementAdmin.titleArPlaceholder') || 'ادخل العنوان باللغة العربية'}
                            required
                            dir="rtl"
                        />
                    </div>

                    {/* Description (English) */}
                    <div>
                        <label htmlFor="edit-description_en" className={labelClasses}>{t('advertisementAdmin.descriptionEn')}</label>
                        <textarea
                            id="edit-description_en"
                            name="description_en"
                            value={editedAdvertisement.description_en}
                            onChange={handleChange}
                            className={inputClasses}
                            rows="3"
                            placeholder={t('advertisementAdmin.descriptionEnPlaceholder') || 'Enter description in English (optional)'}
                        />
                    </div>

                    {/* Description (Arabic) */}
                    <div>
                        <label htmlFor="edit-description_ar" className={labelClasses}>{t('advertisementAdmin.descriptionAr')}</label>
                        <textarea
                            id="edit-description_ar"
                            name="description_ar"
                            value={editedAdvertisement.description_ar}
                            onChange={handleChange}
                            className={`${inputClasses} text-right`}
                            rows="3"
                            placeholder={t('advertisementAdmin.descriptionArPlaceholder') || 'ادخل الوصف باللغة العربية (اختياري)'}
                            dir="rtl"
                        />
                    </div>

                    {/* Link to Product */}
                    <div>
                        <label htmlFor="edit-productRef" className={labelClasses}>{t('advertisementAdmin.linkToProduct')}</label>
                        <select
                            id="edit-productRef"
                            name="productRef"
                            value={editedAdvertisement.productRef}
                            onChange={handleChange}
                            className={inputClasses}
                        >
                            <option value="">{t('advertisementAdmin.noProductLinked')}</option>
                            {products.map(product => (
                                <option key={product._id} value={product._id}>
                                    {product.name?.[language] || product.name?.en || product.name?.ar || t('general.unnamedProduct')}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Link URL */}
                    <div>
                        <label htmlFor="edit-link" className={labelClasses}>{t('advertisementAdmin.linkLabel')}</label>
                        <input
                            type="url"
                            id="edit-link"
                            name="link"
                            value={editedAdvertisement.link}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder={t('advertisementAdmin.linkPlaceholder') || 'e.g., https://example.com/ad-page'}
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label htmlFor="edit-type" className={labelClasses}>{t('advertisementAdmin.typeLabel')}</label>
                        <select
                            id="edit-type"
                            name="type"
                            value={editedAdvertisement.type}
                            onChange={handleChange}
                            className={inputClasses}
                        >
                            <option value="slide">{t('advertisementAdmin.typeSlide') || 'Slide'}</option>
                            <option value="sideOffer">{t('advertisementAdmin.typeSideOffer') || 'Side Offer'}</option>
                            <option value="weeklyOffer">{t('advertisementAdmin.typeWeeklyOffer') || 'Weekly Offer'}</option>
                            <option value="other">{t('advertisementAdmin.typeOther') || 'Other'}</option>
                        </select>
                    </div>

                    {/* Order */}
                    <div>
                        <label htmlFor="edit-order" className={labelClasses}>{t('advertisementAdmin.orderLabel')}</label>
                        <input
                            type="number"
                            id="edit-order"
                            name="order"
                            value={editedAdvertisement.order}
                            onChange={handleChange}
                            className={inputClasses}
                            min="0"
                            placeholder="0"
                        />
                    </div>

                    {/* Start Date */}
                    <div>
                        <label htmlFor="edit-startDate" className={labelClasses}>{t('advertisementAdmin.startDate')}</label>
                        <input
                            type="date"
                            id="edit-startDate"
                            name="startDate"
                            value={editedAdvertisement.startDate}
                            onChange={handleChange}
                            className={inputClasses}
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label htmlFor="edit-endDate" className={labelClasses}>{t('advertisementAdmin.endDate')}</label>
                        <input
                            type="date"
                            id="edit-endDate"
                            name="endDate"
                            value={editedAdvertisement.endDate}
                            onChange={handleChange}
                            className={inputClasses}
                        />
                    </div>

                    {/* Original Price */}
                    <div>
                        <label htmlFor="edit-originalPrice" className={labelClasses}>{t('advertisementAdmin.originalPrice')}</label>
                        <input
                            type="number"
                            id="edit-originalPrice"
                            name="originalPrice"
                            value={editedAdvertisement.originalPrice}
                            onChange={handleChange}
                            className={inputClasses}
                            step="0.01"
                            placeholder="0.00"
                        />
                    </div>

                    {/* Discounted Price */}
                    <div>
                        <label htmlFor="edit-discountedPrice" className={labelClasses}>{t('advertisementAdmin.discountedPrice')}</label>
                        <input
                            type="number"
                            id="edit-discountedPrice"
                            name="discountedPrice"
                            value={editedAdvertisement.discountedPrice}
                            onChange={handleChange}
                            className={inputClasses}
                            step="0.01"
                            placeholder="0.00"
                        />
                    </div>

                    {/* Currency */}
                    <div>
                        <label htmlFor="edit-currency" className={labelClasses}>{t('advertisementAdmin.currency')}</label>
                        <input
                            type="text"
                            id="edit-currency"
                            name="currency"
                            value={editedAdvertisement.currency}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="SAR, USD, EGP etc."
                        />
                    </div>

                    {/* Is Active Checkbox */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="edit-isActive"
                            name="isActive"
                            checked={editedAdvertisement.isActive}
                            onChange={handleChange}
                            className={checkboxClasses}
                        />
                        <label htmlFor="edit-isActive" className="ml-2 block text-base text-gray-900 dark:text-gray-300">
                            {t('advertisementAdmin.isActive')}
                        </label>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label htmlFor="edit-image" className={labelClasses}>{t('advertisementAdmin.imageOptional')}</label>
                        {currentImageUrl && (
                            <img
                                src={currentImageUrl}
                                alt={t('advertisementAdmin.currentImage') || "Current advertisement image"}
                                className="mt-2 mb-3 w-32 h-32 object-cover rounded-lg shadow-sm border border-gray-300 dark:border-gray-600"
                            />
                        )}
                        <input
                            type="file"
                            id="edit-image"
                            name="image"
                            onChange={handleImageChange}
                            accept="image/*"
                            className={fileInputClasses}
                        />
                        {imageFile && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                {t('advertisementAdmin.newImageSelected') || 'New image selected'}: {imageFile.name}
                            </p>
                        )}
                        {!imageFile && advertisement.image && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                {t('advertisementAdmin.noNewImageSelected') || 'No new image selected. Keeping existing image.'}
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {t('general.cancel') || 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold transition-all duration-200"
                        >
                            {isSubmitting ? (
                                <>
                                    <FaSpinner className="animate-spin" /> {t('advertisementAdmin.updatingButton')}
                                </>
                            ) : (
                                <>
                                    <FaCheckCircle /> {t('advertisementAdmin.updateButton')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditAdvertisementModal;