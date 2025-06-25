import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLanguage } from '../../LanguageContext';
import { FaPlus, FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const AddAdvertisementPage = ({ onAdvertisementAdded, serverUrl = 'http://localhost:5000' }) => {
    const { t, language } = useLanguage();

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
    const [submitMessageType, setSubmitMessageType] = useState("");

    const [productSearchTerm, setProductSearchTerm] = useState("");
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
    const productDropdownRef = useRef(null);

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (productDropdownRef.current && !productDropdownRef.current.contains(event.target)) {
                setIsProductDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const filteredProducts = products.filter(product => {
        const nameEn = product.name?.en?.toLowerCase() || '';
        const nameAr = product.name?.ar || '';
        const searchTerm = productSearchTerm.toLowerCase();
        return nameEn.includes(searchTerm) || nameAr.includes(productSearchTerm);
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAdvertisement((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleProductSearchChange = (e) => {
        setProductSearchTerm(e.target.value);
        setIsProductDropdownOpen(true);
        if (e.target.value === "") {
            setAdvertisement(prev => ({ ...prev, productRef: "" }));
        }
    };

    const handleProductSelect = (product) => {
        if (product) {
            setAdvertisement(prev => ({ ...prev, productRef: product._id }));
            setProductSearchTerm(product.name?.[language] || product.name?.en);
        } else {
            setAdvertisement(prev => ({ ...prev, productRef: "" }));
            setProductSearchTerm("");
        }
        setIsProductDropdownOpen(false);
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitMessage("");
        setSubmitMessageType("");

        if (!advertisement.title_en.trim() || !advertisement.title_ar.trim() || !imageFile) {
            setSubmitMessage(t('advertisementAdmin.titleAndImageRequired') || 'Title (English & Arabic) and Image are required!');
            setSubmitMessageType('error');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        Object.keys(advertisement).forEach(key => {
            if (advertisement[key] !== "" && advertisement[key] !== null) {
                formData.append(key, advertisement[key]);
            }
        });
        formData.append("image", imageFile);

        try {
            await axios.post(`${serverUrl}/api/advertisements`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setSubmitMessage(t('advertisementAdmin.addSuccess') || 'Advertisement added successfully!');
            setSubmitMessageType('success');

            setAdvertisement({
                title_en: "", title_ar: "", description_en: "", description_ar: "",
                link: "", type: "slide", isActive: true, order: 0,
                startDate: "", endDate: "", originalPrice: "", discountedPrice: "", currency: "SAR", productRef: ""
            });
            setImageFile(null);
            setProductSearchTerm("");
            document.getElementById("advertisement-image").value = '';

            if (onAdvertisementAdded) onAdvertisementAdded();
        } catch (error) {
            console.error("Error adding advertisement:", error.response?.data);
            const errorMessage = error.response?.data?.message || error.message;
            setSubmitMessage(`${t('advertisementAdmin.addError') || 'Error adding advertisement:'} ${errorMessage}`);
            setSubmitMessageType('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
    const checkboxClasses = "h-5 w-5 text-indigo-600 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:checked:bg-indigo-600";
    const fileInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-700 dark:file:text-indigo-100 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-600 cursor-pointer";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {submitMessage && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${submitMessageType === 'success' ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"}`}>
                    {submitMessageType === 'success' ? <FaCheckCircle className="text-xl" /> : <FaExclamationCircle className="text-xl" />}
                    <p className="text-sm font-medium">{submitMessage}</p>
                </div>
            )}

            <div>
                <label htmlFor="title_en" className={labelClasses}>{t('advertisementAdmin.titleEn')}</label>
                <input type="text" id="title_en" name="title_en" value={advertisement.title_en} onChange={handleChange} className={inputClasses} placeholder={t('advertisementAdmin.titleEnPlaceholder') || 'Enter title in English'} required />
            </div>

            <div>
                <label htmlFor="title_ar" className={labelClasses}>{t('advertisementAdmin.titleAr')}</label>
                <input type="text" id="title_ar" name="title_ar" value={advertisement.title_ar} onChange={handleChange} className={`${inputClasses} text-right`} placeholder={t('advertisementAdmin.titleArPlaceholder') || 'ادخل العنوان باللغة العربية'} required dir="rtl" />
            </div>

            <div>
                <label htmlFor="description_en" className={labelClasses}>{t('advertisementAdmin.descriptionEn')}</label>
                <textarea id="description_en" name="description_en" value={advertisement.description_en} onChange={handleChange} className={inputClasses} rows="3" placeholder={t('advertisementAdmin.descriptionEnPlaceholder') || 'Enter description in English (optional)'} />
            </div>

            <div>
                <label htmlFor="description_ar" className={labelClasses}>{t('advertisementAdmin.descriptionAr')}</label>
                <textarea id="description_ar" name="description_ar" value={advertisement.description_ar} onChange={handleChange} className={`${inputClasses} text-right`} rows="3" placeholder={t('advertisementAdmin.descriptionArPlaceholder') || 'ادخل الوصف باللغة العربية (اختياري)'} dir="rtl" />
            </div>

            <div className="relative" ref={productDropdownRef}>
                <label htmlFor="productRef" className={labelClasses}>{t('advertisementAdmin.linkToProduct')}</label>
                <input
                    type="text"
                    id="productRef"
                    value={productSearchTerm}
                    onChange={handleProductSearchChange}
                    onFocus={() => setIsProductDropdownOpen(true)}
                    className={inputClasses}
                    placeholder={t('advertisementAdmin.searchProductPlaceholder') || "Search for a product..."}
                    autoComplete="off"
                />
                {isProductDropdownOpen && (
                    <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        <li className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={() => handleProductSelect(null)}>
                            {t('advertisementAdmin.noProductLinked')}
                        </li>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <li key={product._id} className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={() => handleProductSelect(product)}>
                                    {product.name?.[language] || product.name?.en || product.name?.ar}
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-2 text-gray-500 italic">
                                {t('advertisementAdmin.noProductsFound') || "No products found."}
                            </li>
                        )}
                    </ul>
                )}
            </div>

            <div>
                <label htmlFor="link" className={labelClasses}>{t('advertisementAdmin.linkLabel')}</label>
                <input type="url" id="link" name="link" value={advertisement.link} onChange={handleChange} className={inputClasses} placeholder={t('advertisementAdmin.linkPlaceholder') || 'e.g., https://example.com/ad-page'} />
            </div>

            <div>
                <label htmlFor="type" className={labelClasses}>{t('advertisementAdmin.typeLabel')}</label>
                <select id="type" name="type" value={advertisement.type} onChange={handleChange} className={inputClasses}>
                    <option value="slide">{t('advertisementAdmin.typeSlide') || 'Slide'}</option>
                    <option value="sideOffer">{t('advertisementAdmin.typeSideOffer') || 'Side Offer'}</option>
                    <option value="weeklyOffer">{t('advertisementAdmin.typeWeeklyOffer') || 'Weekly Offer'}</option>
                    <option value="other">{t('advertisementAdmin.typeOther') || 'Other'}</option>
                </select>
            </div>

            <div>
                <label htmlFor="order" className={labelClasses}>{t('advertisementAdmin.orderLabel')}</label>
                <input type="number" id="order" name="order" value={advertisement.order} onChange={handleChange} className={inputClasses} min="0" placeholder="0" />
            </div>

            <div>
                <label htmlFor="startDate" className={labelClasses}>{t('advertisementAdmin.startDate')}</label>
                <input type="date" id="startDate" name="startDate" value={advertisement.startDate} onChange={handleChange} className={inputClasses} />
            </div>

            <div>
                <label htmlFor="endDate" className={labelClasses}>{t('advertisementAdmin.endDate')}</label>
                <input type="date" id="endDate" name="endDate" value={advertisement.endDate} onChange={handleChange} className={inputClasses} />
            </div>

            <div>
                <label htmlFor="originalPrice" className={labelClasses}>{t('advertisementAdmin.originalPrice')}</label>
                <input type="number" id="originalPrice" name="originalPrice" value={advertisement.originalPrice} onChange={handleChange} className={inputClasses} step="0.01" placeholder="0.00" />
            </div>

            <div>
                <label htmlFor="discountedPrice" className={labelClasses}>{t('advertisementAdmin.discountedPrice')}</label>
                <input type="number" id="discountedPrice" name="discountedPrice" value={advertisement.discountedPrice} onChange={handleChange} className={inputClasses} step="0.01" placeholder="0.00" />
            </div>

            <div>
                <label htmlFor="currency" className={labelClasses}>{t('advertisementAdmin.currency')}</label>
                <input type="text" id="currency" name="currency" value={advertisement.currency} onChange={handleChange} className={inputClasses} placeholder="SAR, USD, EGP etc." />
            </div>

            <div className="flex items-center">
                <input type="checkbox" id="isActive" name="isActive" checked={advertisement.isActive} onChange={handleChange} className={checkboxClasses} />
                <label htmlFor="isActive" className="ml-2 block text-base text-gray-900 dark:text-gray-300">
                    {t('advertisementAdmin.isActive')}
                </label>
            </div>

            <div>
                <label htmlFor="advertisement-image" className={labelClasses}>{t('advertisementAdmin.imageLabel')}</label>
                <input type="file" id="advertisement-image" name="image" onChange={handleImageChange} className={fileInputClasses} accept="image/*" required />
                {imageFile && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {t('advertisementAdmin.selectedImage') || 'Selected image'}: {imageFile.name}
                    </p>
                )}
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold transition-all duration-200">
                {isSubmitting ? (<><FaSpinner className="animate-spin" /> {t('advertisementAdmin.submittingButton')}</>) : (<><FaPlus /> {t('advertisementAdmin.addButton')}</>)}
            </button>
        </form>
    );
};

export default AddAdvertisementPage;