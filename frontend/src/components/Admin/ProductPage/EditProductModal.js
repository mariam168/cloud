import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../LanguageContext';

const EditProductModal = ({ product, onClose, onProductUpdated, serverUrl }) => {
    const { t } = useLanguage();
    const [editedProduct, setEditedProduct] = useState({
        name_en: '',
        name_ar: '',
        description_en: '',
        description_ar: '',
        price: '',
        category: '',
        subCategory: '', // New state for subCategory
    });
    const [imageFile, setImageFile] = useState(null);
    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (product) {
            setEditedProduct({
                name_en: product.name?.en || '',
                name_ar: product.name?.ar || '',
                description_en: product.description?.en || '',
                description_ar: product.description?.ar || '',
                price: product.price || '',
                category: product.category || '',
                subCategory: product.subCategory || '', // Initialize subCategory from product
            });
            setCurrentImageUrl(product.image ? `${serverUrl}${product.image}` : '');
        }
    }, [product, serverUrl]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        if (file) {
            setCurrentImageUrl(URL.createObjectURL(file));
        } else if (product && product.image) {
            setCurrentImageUrl(`${serverUrl}${product.image}`);
        } else {
            setCurrentImageUrl('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        if (!editedProduct.name_en || editedProduct.name_en.trim() === "" || !editedProduct.name_ar || editedProduct.name_ar.trim() === "" || editedProduct.price === undefined || editedProduct.price === null || Number(editedProduct.price) < 0) {
            setErrorMessage(t('productAdmin.nameAndPriceRequired') || "Product name and price are required.");
            setIsSubmitting(false);
            return;
        }

        const formData = new FormData();
        formData.append('name_en', editedProduct.name_en);
        formData.append('name_ar', editedProduct.name_ar);
        formData.append('description_en', editedProduct.description_en);
        formData.append('description_ar', editedProduct.description_ar);
        formData.append('price', editedProduct.price);
        formData.append('category', editedProduct.category);
        formData.append('subCategory', editedProduct.subCategory); // Append subCategory
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const response = await axios.put(`${serverUrl}/api/product/${product._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onProductUpdated(response.data);
            // Replaced alert with a custom message box or similar UI for better UX
            // For this example, I'll use a simple console log and rely on the parent component to show success message
            console.log(t('productAdmin.updateSuccess') || "Product updated successfully!");
            onClose();
        } catch (err) {
            console.error("Error updating product:", err.response ? err.response.data : err.message);
            setErrorMessage(
                (t('productAdmin.updateError') || "An error occurred while updating the product.") +
                (err.response && err.response.data && typeof err.response.data === 'string'
                    ? err.response.data
                    : err.response?.data?.message || err.message)
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!product) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">{t('productAdmin.editProductTitle') || 'Edit Product'}</h2>
                {errorMessage && <p className="text-red-500 bg-red-100 p-3 rounded mb-4 text-sm">{errorMessage}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="edit-name_en" className="block text-sm font-medium text-gray-700">{t('productAdmin.productNameEn') || 'Product Name (English)'}</label>
                        <input
                            type="text"
                            id="edit-name_en"
                            name="name_en"
                            value={editedProduct.name_en}
                            onChange={handleChange}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-name_ar" className="block text-sm font-medium text-gray-700">{t('productAdmin.productNameAr') || 'اسم المنتج (العربية)'}</label>
                        <input
                            type="text"
                            id="edit-name_ar"
                            name="name_ar"
                            value={editedProduct.name_ar}
                            onChange={handleChange}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-description_en" className="block text-sm font-medium text-gray-700">{t('productAdmin.descriptionEn') || 'Description (English)'}</label>
                        <textarea
                            id="edit-description_en"
                            name="description_en"
                            value={editedProduct.description_en}
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-description_ar" className="block text-sm font-medium text-gray-700">{t('productAdmin.descriptionAr') || 'الوصف (العربية)'}</label>
                        <textarea
                            id="edit-description_ar"
                            name="description_ar"
                            value={editedProduct.description_ar}
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right"
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700">{t('productAdmin.priceLabel') || 'Price'}</label>
                        <input
                            type="number"
                            id="edit-price"
                            name="price"
                            value={editedProduct.price}
                            onChange={handleChange}
                            min="0"
                            step="any"
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700">{t('productAdmin.categoryLabel') || 'Category'}</label>
                        <input
                            type="text"
                            id="edit-category"
                            name="category"
                            value={editedProduct.category}
                            onChange={handleChange}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    {/* New input for Sub-Category */}
                    <div>
                        <label htmlFor="edit-subCategory" className="block text-sm font-medium text-gray-700">{t('productAdmin.subCategoryLabel') || 'Sub-Category'}</label>
                        <input
                            type="text"
                            id="edit-subCategory"
                            name="subCategory"
                            value={editedProduct.subCategory}
                            onChange={handleChange}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-image" className="block text-sm font-medium text-gray-700">{t('productAdmin.imageOptional') || 'Product Image (Optional to change current)'}</label>
                        {currentImageUrl && (
                            <img src={currentImageUrl} alt="Current product" className="mt-2 mb-2 w-32 h-32 object-cover rounded" />
                        )}
                        <input
                            type="file"
                            id="edit-image"
                            name="image"
                            onChange={handleImageChange}
                            accept="image/*"
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {t('adminCategoryPage.cancelButton') || 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                        >
                            {isSubmitting ? (t('productAdmin.updatingButton') || "Saving...") : (t('productAdmin.updateButton') || "Save Changes")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProductModal;
