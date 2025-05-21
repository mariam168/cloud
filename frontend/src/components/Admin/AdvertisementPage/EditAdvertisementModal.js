import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../LanguageContext';

const EditAdvertisementModal = ({ advertisement, onClose, onAdvertisementUpdated, serverUrl }) => {
    const { t } = useLanguage();
    const [editedAdvertisement, setEditedAdvertisement] = useState({
        title_en: '',
        title_ar: '',
        description_en: '',
        description_ar: '',
        link: '',
        type: 'slide',
        isActive: true,
        order: 0,
    });
    const [imageFile, setImageFile] = useState(null);
    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

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
        setImageFile(file);
        if (file) {
            setCurrentImageUrl(URL.createObjectURL(file));
        } else if (advertisement && advertisement.image) {
            setCurrentImageUrl(`${serverUrl}${advertisement.image}`);
        } else {
            setCurrentImageUrl('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        if (!editedAdvertisement.title_en || editedAdvertisement.title_en.trim() === "" || !editedAdvertisement.title_ar || editedAdvertisement.title_ar.trim() === "") {
            setErrorMessage(t('advertisementAdmin.titleRequired') || "Advertisement English and Arabic titles are required.");
            setIsSubmitting(false);
            return;
        }

        const formData = new FormData();
        formData.append('title_en', editedAdvertisement.title_en);
        formData.append('title_ar', editedAdvertisement.title_ar);
        formData.append('description_en', editedAdvertisement.description_en);
        formData.append('description_ar', editedAdvertisement.description_ar);
        formData.append('link', editedAdvertisement.link);
        formData.append('type', editedAdvertisement.type);
        formData.append('isActive', editedAdvertisement.isActive);
        formData.append('order', editedAdvertisement.order);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const response = await axios.put(`${serverUrl}/api/advertisements/${advertisement._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onAdvertisementUpdated(response.data);
            alert(t('advertisementAdmin.updateSuccess') || "Advertisement updated successfully!");
            onClose();
        } catch (err) {
            console.error("Error updating advertisement:", err.response ? err.response.data : err.message);
            setErrorMessage(
                (t('advertisementAdmin.updateError') || "An error occurred while updating the advertisement.") +
                (err.response && err.response.data && typeof err.response.data === 'string'
                    ? err.response.data
                    : err.response?.data?.message || err.message)
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!advertisement) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto transition-colors duration-300">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-700 dark:text-white">{t('advertisementAdmin.editAdvertisementTitle') || 'Edit Advertisement'}</h2>
                {errorMessage && <p className="text-red-500 bg-red-100 p-3 rounded mb-4 text-sm dark:bg-red-900/30 dark:text-red-300">{errorMessage}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="edit-title_en" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('advertisementAdmin.titleEn') || 'Title (English)'}</label>
                        <input
                            type="text"
                            id="edit-title_en"
                            name="title_en"
                            value={editedAdvertisement.title_en}
                            onChange={handleChange}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-title_ar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('advertisementAdmin.titleAr') || 'العنوان (العربية)'}</label>
                        <input
                            type="text"
                            id="edit-title_ar"
                            name="title_ar"
                            value={editedAdvertisement.title_ar}
                            onChange={handleChange}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-description_en" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('advertisementAdmin.descriptionEn') || 'Description (English)'}</label>
                        <textarea
                            id="edit-description_en"
                            name="description_en"
                            value={editedAdvertisement.description_en}
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-description_ar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('advertisementAdmin.descriptionAr') || 'الوصف (العربية)'}</label>
                        <textarea
                            id="edit-description_ar"
                            name="description_ar"
                            value={editedAdvertisement.description_ar}
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-link" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('advertisementAdmin.linkLabel') || 'Link URL'}</label>
                        <input
                            type="text"
                            id="edit-link"
                            name="link"
                            value={editedAdvertisement.link}
                            onChange={handleChange}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('advertisementAdmin.typeLabel') || 'Type'}</label>
                        <select
                            id="edit-type"
                            name="type"
                            value={editedAdvertisement.type}
                            onChange={handleChange}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="slide">{t('advertisementAdmin.typeSlide') || 'Slide'}</option>
                            <option value="sideOffer">{t('advertisementAdmin.typeSideOffer') || 'Side Offer'}</option>
                            <option value="weeklyOffer">{t('advertisementAdmin.typeWeeklyOffer') || 'Weekly Offer'}</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="edit-order" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('advertisementAdmin.orderLabel') || 'Order (for display)'}</label>
                        <input
                            type="number"
                            id="edit-order"
                            name="order"
                            value={editedAdvertisement.order}
                            onChange={handleChange}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            min="0"
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="edit-isActive"
                            name="isActive"
                            checked={editedAdvertisement.isActive}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor="edit-isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">{t('advertisementAdmin.isActive') || 'Is Active'}</label>
                    </div>
                    <div>
                        <label htmlFor="edit-image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('advertisementAdmin.imageOptional') || 'Image (Optional to change current)'}</label>
                        {currentImageUrl && (
                            <img src={currentImageUrl} alt="Current advertisement" className="mt-2 mb-2 w-32 h-32 object-cover rounded" />
                        )}
                        <input
                            type="file"
                            id="edit-image"
                            name="image"
                            onChange={handleImageChange}
                            accept="image/*"
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-200 dark:hover:file:bg-indigo-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:cursor-not-allowed"
                        >
                            {t('adminCategoryPage.cancelButton') || 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-indigo-700 dark:hover:bg-indigo-600"
                        >
                            {isSubmitting ? (t('advertisementAdmin.updatingButton') || "Saving...") : (t('advertisementAdmin.updateButton') || "Save Changes")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditAdvertisementModal;
