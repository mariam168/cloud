import React, { useState } from "react";
import axios from "axios";
import { useLanguage } from '../../LanguageContext';

const AddAdvertisementPage = ({ onAdvertisementAdded, serverUrl = 'http://localhost:5000' }) => {
    const { t } = useLanguage();
    const [advertisement, setAdvertisement] = useState({
        title_en: "",
        title_ar: "",
        description_en: "",
        description_ar: "",
        link: "",
        type: "slide", 
        isActive: true,
        order: 0,
    });
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAdvertisement((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitMessage("");

        if (!advertisement.title_en || advertisement.title_en.trim() === "" || !advertisement.title_ar || advertisement.title_ar.trim() === "") {
            setSubmitMessage(t('advertisementAdmin.titleRequired') || "Advertisement English and Arabic titles are required.");
            return;
        }

        if (!imageFile) {
            setSubmitMessage(t('advertisementAdmin.imageRequired') || "Advertisement image is required.");
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("title_en", advertisement.title_en);
            formData.append("title_ar", advertisement.title_ar);
            formData.append("description_en", advertisement.description_en);
            formData.append("description_ar", advertisement.description_ar);
            formData.append("link", advertisement.link);
            formData.append("type", advertisement.type);
            formData.append("isActive", advertisement.isActive);
            formData.append("order", advertisement.order);
            formData.append("image", imageFile);

            await axios.post(`${serverUrl}/api/advertisements`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setSubmitMessage(t('advertisementAdmin.addSuccess') || "Advertisement added successfully!");
            setAdvertisement({
                title_en: "", title_ar: "", description_en: "", description_ar: "",
                link: "", type: "slide", isActive: true, order: 0
            });
            setImageFile(null);
            const fileInput = document.getElementById("advertisement-image");
            if (fileInput) fileInput.value = null;

            if (onAdvertisementAdded) {
                onAdvertisementAdded();
            }

        } catch (error) {
            console.error("Error adding advertisement:", error.response ? error.response.data : error.message);
            setSubmitMessage(
                (t('advertisementAdmin.addError') || "Error adding advertisement: ") +
                (error.response && error.response.data && typeof error.response.data === 'string'
                    ? error.response.data
                    : error.response?.data?.message || error.message)
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 dark:bg-gray-800 p-6 rounded-lg shadow-md">
            {submitMessage && (
                <p className={`text-center mb-4 p-2 rounded ${submitMessage.includes(t('advertisementAdmin.addSuccess') || "successfully") ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"}`}>
                    {submitMessage}
                </p>
            )}
            <div>
                <label htmlFor="title_en" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('advertisementAdmin.titleEn') || 'Title (English)'}</label>
                <input
                    type="text"
                    id="title_en"
                    name="title_en"
                    value={advertisement.title_en}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                />
            </div>
            <div>
                <label htmlFor="title_ar" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('advertisementAdmin.titleAr') || 'العنوان (العربية)'}</label>
                <input
                    type="text"
                    id="title_ar"
                    name="title_ar"
                    value={advertisement.title_ar}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                />
            </div>
            <div>
                <label htmlFor="description_en" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('advertisementAdmin.descriptionEn') || 'Description (English)'}</label>
                <textarea
                    id="description_en"
                    name="description_en"
                    value={advertisement.description_en}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows="3"
                />
            </div>
            <div>
                <label htmlFor="description_ar" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('advertisementAdmin.descriptionAr') || 'الوصف (العربية)'}</label>
                <textarea
                    id="description_ar"
                    name="description_ar"
                    value={advertisement.description_ar}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows="3"
                />
            </div>
            <div>
                <label htmlFor="link" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('advertisementAdmin.linkLabel') || 'Link URL'}</label>
                <input
                    type="text"
                    id="link"
                    name="link"
                    value={advertisement.link}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
            </div>
            <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('advertisementAdmin.typeLabel') || 'Type'}</label>
                <select
                    id="type"
                    name="type"
                    value={advertisement.type}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                    <option value="slide">{t('advertisementAdmin.typeSlide') || 'Slide'}</option>
                    <option value="sideOffer">{t('advertisementAdmin.typeSideOffer') || 'Side Offer'}</option>
                    <option value="weeklyOffer">{t('advertisementAdmin.typeWeeklyOffer') || 'Weekly Offer'}</option>
                </select>
            </div>
            <div>
                <label htmlFor="order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('advertisementAdmin.orderLabel') || 'Order (for display)'}</label>
                <input
                    type="number"
                    id="order"
                    name="order"
                    value={advertisement.order}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="0"
                />
            </div>
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={advertisement.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">{t('advertisementAdmin.isActive') || 'Is Active'}</label>
            </div>
            <div>
                <label htmlFor="advertisement-image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('advertisementAdmin.imageLabel') || 'Advertisement Image'}</label>
                <input
                    type="file"
                    id="advertisement-image"
                    name="image"
                    onChange={handleImageChange}
                    className="w-full p-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-200 dark:hover:file:bg-indigo-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    accept="image/*"
                    required
                />
            </div>
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150 ease-in-out dark:bg-indigo-700 dark:hover:bg-indigo-600"
            >
                {isSubmitting ? (t('advertisementAdmin.submittingButton') || "Adding...") : (t('advertisementAdmin.addButton') || "Add Advertisement")}
            </button>
        </form>
    );
};

export default AddAdvertisementPage;
