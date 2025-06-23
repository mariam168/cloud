// components/Admin/AdvertisementPage/AddAdvertisementPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLanguage } from '../../LanguageContext';

const AddAdvertisementPage = ({ onAdvertisementAdded, serverUrl = 'http://localhost:5000' }) => {
    const { t } = useLanguage();
    const [advertisement, setAdvertisement] = useState({
        title_en: "", title_ar: "", description_en: "", description_ar: "",
        link: "", type: "slide", isActive: true, order: 0,
        startDate: "", endDate: "", originalPrice: "", discountedPrice: "",
        currency: "SAR", productRef: "",
    });

    const [products, setProducts] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState("");

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

        if (!advertisement.title_en.trim() || !advertisement.title_ar.trim() || !imageFile) {
            setSubmitMessage(t('advertisementAdmin.titleAndImageRequired'));
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        Object.keys(advertisement).forEach(key => {
            formData.append(key, advertisement[key]);
        });
        formData.append("image", imageFile);

        try {
            await axios.post(`${serverUrl}/api/advertisements`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setSubmitMessage(t('advertisementAdmin.addSuccess'));
            setAdvertisement({
                title_en: "", title_ar: "", description_en: "", description_ar: "",
                link: "", type: "slide", isActive: true, order: 0,
                startDate: "", endDate: "", originalPrice: "", discountedPrice: "", currency: "SAR", productRef: ""
            });
            setImageFile(null);
            document.getElementById("advertisement-image").value = null;

            if (onAdvertisementAdded) onAdvertisementAdded();
        } catch (error) {
            console.error("Error adding advertisement:", error.response?.data);
            setSubmitMessage(`${t('advertisementAdmin.addError')} ${error.response?.data?.message || error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 dark:bg-gray-800 p-6 rounded-lg shadow-md">
            {submitMessage && (
                <p className={`text-center mb-4 p-2 rounded ${submitMessage.includes('Success') ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {submitMessage}
                </p>
            )}
            
            <div><label htmlFor="title_en" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('advertisementAdmin.titleEn')}</label><input type="text" id="title_en" name="title_en" value={advertisement.title_en} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" required/></div>
            <div><label htmlFor="title_ar" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('advertisementAdmin.titleAr')}</label><input type="text" id="title_ar" name="title_ar" value={advertisement.title_ar} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white" required/></div>
            <div><label htmlFor="description_en" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('advertisementAdmin.descriptionEn')}</label><textarea id="description_en" name="description_en" value={advertisement.description_en} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows="3"/></div>
            <div><label htmlFor="description_ar" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('advertisementAdmin.descriptionAr')}</label><textarea id="description_ar" name="description_ar" value={advertisement.description_ar} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows="3"/></div>
            
            <div>
                <label htmlFor="productRef" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('advertisementAdmin.linkToProduct')}</label>
                <select id="productRef" name="productRef" value={advertisement.productRef} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="">{t('advertisementAdmin.noProductLinked')}</option>
                    {/* ✅ مصحح: عرض الاسم باللغة الإنجليزية أو العربية كبديل */}
                    {products.map(product => (<option key={product._id} value={product._id}>{product.name?.en || product.name?.ar || 'Unnamed Product'}</option>))}
                </select>
            </div>

            <div><label htmlFor="link" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('advertisementAdmin.linkLabel')}</label><input type="text" id="link" name="link" value={advertisement.link} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"/></div>
            <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('advertisementAdmin.typeLabel')}</label>
                {/* ✅ مصحح: إضافة جميع الأنواع */}
                <select id="type" name="type" value={advertisement.type} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="slide">{t('advertisementAdmin.typeSlide') || 'Slide'}</option>
                    <option value="sideOffer">{t('advertisementAdmin.typeSideOffer') || 'Side Offer'}</option>
                    <option value="weeklyOffer">{t('advertisementAdmin.typeWeeklyOffer') || 'Weekly Offer'}</option>
                    <option value="other">{t('advertisementAdmin.typeOther') || 'Other'}</option>
                </select>
            </div>
            <div><label htmlFor="order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('advertisementAdmin.orderLabel')}</label><input type="number" id="order" name="order" value={advertisement.order} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" min="0"/></div>
            <div><label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('advertisementAdmin.startDate')}</label><input type="date" id="startDate" name="startDate" value={advertisement.startDate} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"/></div>
            <div><label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('advertisementAdmin.endDate')}</label><input type="date" id="endDate" name="endDate" value={advertisement.endDate} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"/></div>
            <div><label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('advertisementAdmin.originalPrice')}</label><input type="number" id="originalPrice" name="originalPrice" value={advertisement.originalPrice} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" step="0.01"/></div>
            <div><label htmlFor="discountedPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('advertisementAdmin.discountedPrice')}</label><input type="number" id="discountedPrice" name="discountedPrice" value={advertisement.discountedPrice} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" step="0.01"/></div>
            <div><label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('advertisementAdmin.currency')}</label><input type="text" id="currency" name="currency" value={advertisement.currency} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"/></div>
            <div className="flex items-center"><input type="checkbox" id="isActive" name="isActive" checked={advertisement.isActive} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded"/><label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">{t('advertisementAdmin.isActive')}</label></div>
            <div><label htmlFor="advertisement-image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('advertisementAdmin.imageLabel')}</label><input type="file" id="advertisement-image" name="image" onChange={handleImageChange} className="w-full p-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" accept="image/*" required/></div>
            
            <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400">
                {isSubmitting ? t('advertisementAdmin.submittingButton') : t('advertisementAdmin.addButton')}
            </button>
        </form>
    );
};

export default AddAdvertisementPage;