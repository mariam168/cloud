import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { useLanguage } from '../../LanguageContext';
import { XCircle, PlusCircle, Image as ImageIcon, MinusCircle } from 'lucide-react'; 

// تعريف الفئات وخصائصها (يجب أن يكون متطابقاً)
const CATEGORY_ATTRIBUTES = {
    electronics: [
        { key: "brand", type: "text", label_en: "Brand", label_ar: "الماركة" },
        { key: "processor", type: "text", label_en: "Processor", label_ar: "المعالج" },
        { key: "ram", type: "number", label_en: "RAM (GB)", label_ar: "الرام (جيجا بايت)" },
        { key: "screen_size", type: "number", label_en: "Screen Size (inches)", label_ar: "حجم الشاشة (بوصة)" },
    ],
    shoes: [
        { key: "brand", type: "text", label_en: "Brand", label_ar: "الماركة" },
        { key: "material", type: "text", label_en: "Material", label_ar: "الخامة" },
    ],
    clothes: [
        { key: "brand", type: "text", label_en: "Brand", label_ar: "الماركة" },
        { key: "material", type: "text", label_en: "Material", label_ar: "الخامة" },
    ],
    kitchens: [
        { key: "brand", type: "text", label_en: "Brand", label_ar: "الماركة" },
        { key: "material", type: "text", label_en: "Material", label_ar: "المادة المصنعة" },
        { key: "capacity", type: "text", label_en: "Capacity (e.g., 2L)", label_ar: "السعة (مثال: 2 لتر)" },
        { key: "power", type: "text", label_en: "Power (e.g., 1200W)", label_ar: "القدرة (مثال: 1200 واط)" },
    ],
    others: [ 
        { key: "material", type: "text", label_en: "Material", label_ar: "الخامة" },
        { key: "weight", type: "number", label_en: "Weight (kg)", label_ar: "الوزن (كيلوجرام)" },
    ]
};

// تعريف أنواع الـ Variations المتاحة لكل فئة (مثال: الألوان، المقاسات)
const CATEGORY_VARIATIONS_OPTIONS = {
    electronics: [
        { name_en: "Storage", name_ar: "التخزين", type: "text" },
    ],
    shoes: [
        { name_en: "Color", name_ar: "اللون", type: "text" },
        { name_en: "Size", name_ar: "المقاس", type: "number" },
    ],
    clothes: [
        { name_en: "Color", name_ar: "اللون", type: "text" },
        { name_en: "Size", name_ar: "المقاس", type: "select", options: ["XS", "S", "M", "L", "XL", "XXL"] },
    ],
    kitchens: [
        { name_en: "Color", name_ar: "اللون", type: "text" },
        { name_en: "Material", name_ar: "المادة", type: "text" },
    ],
    others: [
        { name_en: "Type", name_ar: "النوع", type: "text" },
    ],
};


const EditProductModal = ({ product, onClose, onProductUpdated, serverUrl }) => {
    const { t, language } = useLanguage();
    const [editedProduct, setEditedProduct] = useState({
        name_en: '',
        name_ar: '',
        description_en: '',
        description_ar: '',
        price: '',
        category: '',
        subCategory: '',
        attributes: {}, 
        variations: [], // الآن هي مصفوفة من كائنات Variant
    });
    const [mainImageFile, setMainImageFile] = useState(null);
    const [currentMainImageUrl, setCurrentMainImageUrl] = useState('');
    const [clearMainImage, setClearMainImage] = useState(false);

    const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
    const [existingAdditionalImageUrls, setExistingAdditionalImageUrls] = useState([]);
    
    const [videoFiles, setVideoFiles] = useState([]);
    const [existingVideoUrls, setExistingVideoUrls] = useState([]);

    // جديد: لحفظ ملفات صور الـ Variants الجديدة مؤقتًا { variantIndex: File }
    const [newVariantImageFiles, setNewVariantImageFiles] = useState({}); 

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
                subCategory: product.subCategory || '',
                attributes: product.attributes || {},
                // قم بعمل deep copy للـ variations لتجنب مشاكل الـ reference
                variations: product.variations ? product.variations.map(v => ({ ...v, // نسخ كل حقول الـ variant
                                                                             options: v.options.map(o => ({...o})) // ونسخ مصفوفة options الداخلية
                                                                           })) : [], 
            });
            setCurrentMainImageUrl(product.mainImage ? `${serverUrl}${product.mainImage}` : '');
            setExistingAdditionalImageUrls(product.additionalImages || []);
            setExistingVideoUrls(product.videos || []);
            setClearMainImage(false); 
            setMainImageFile(null);
            setAdditionalImageFiles([]);
            setNewVariantImageFiles({}); // امسح أي ملفات صور variants جديدة سابقة
        }
    }, [product, serverUrl]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setEditedProduct(prev => ({ ...prev, [name]: value }));
        // عند تغيير الفئة، قم بتحديث الخصائص والـ variations الافتراضية
        if (name === "category") {
            setEditedProduct((prev) => ({
                ...prev,
                attributes: {}, 
                variations: [], 
            }));
            setNewVariantImageFiles({}); // امسح صور الـ variations الجديدة
        }
    }, []);

    const handleAttributeChange = useCallback((key, value) => {
        setEditedProduct((prev) => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                [key]: value,
            },
        }));
    }, []);

    // **جديد: إضافة Variant جديد**
    const addVariant = useCallback(() => {
        setEditedProduct(prev => ({
            ...prev,
            variations: [
                ...prev.variations,
                { options: [], image: null, priceAdjustment: 0, stock: 0, sku: '' } 
            ]
        }));
    }, []);

    // **جديد: إزالة Variant**
    const removeVariant = useCallback((indexToRemove) => {
        setEditedProduct(prev => {
            const newVariations = prev.variations.filter((_, index) => index !== indexToRemove);
            // لو كان فيه ملف مؤقت للـ variant اللي اتحذف، احذفه من قائمة الملفات المؤقتة
            setNewVariantImageFiles(prevFiles => {
                const newFiles = { ...prevFiles };
                delete newFiles[indexToRemove];
                // إعادة ترقيم المفاتيح لو كانت أرقام متتالية
                const reindexedFiles = {};
                Object.keys(newFiles).forEach(oldIndex => {
                    if (Number(oldIndex) > indexToRemove) {
                        reindexedFiles[Number(oldIndex) - 1] = newFiles[oldIndex];
                    } else {
                        reindexedFiles[oldIndex] = newFiles[oldIndex];
                    }
                });
                return reindexedFiles;
            });
            return { ...prev, variations: newVariations };
        });
    }, []);

    // **جديد: إضافة خيار لـ Variant معين**
    const addOptionToVariant = useCallback((variantIndex) => {
        setEditedProduct(prev => {
            const newVariations = [...prev.variations];
            newVariations[variantIndex].options.push({ optionName: "", optionValue: "" });
            return { ...prev, variations: newVariations };
        });
    }, []);

    // **جديد: إزالة خيار من Variant معين**
    const removeOptionFromVariant = useCallback((variantIndex, optionIndexToRemove) => {
        setEditedProduct(prev => {
            const newVariations = [...prev.variations];
            newVariations[variantIndex].options = newVariations[variantIndex].options.filter((_, index) => index !== optionIndexToRemove);
            return { ...prev, variations: newVariations };
        });
    }, []);

    // **جديد: تحديث بيانات Variant موجود (مثل priceAdjustment, stock, sku)**
    const handleVariantFieldChange = useCallback((variantIndex, field, value) => {
        setEditedProduct(prev => {
            const newVariations = [...prev.variations];
            newVariations[variantIndex] = { ...newVariations[variantIndex], [field]: value };
            return { ...prev, variations: newVariations };
        });
    }, []);

    // **جديد: تحديث قيمة خيار معين داخل Variant**
    const handleVariantOptionValueChange = useCallback((variantIndex, optionIndex, field, value) => {
        setEditedProduct(prev => {
            const newVariations = [...prev.variations];
            newVariations[variantIndex].options[optionIndex][field] = value;
            return { ...prev, variations: newVariations };
        });
    }, []);

    // **جديد: التعامل مع ملف صورة الـ Variant (جديدة أو تحديث لموجودة)**
    const handleVariantImageChange = useCallback((variantIndex, file) => {
        if (!file) return;

        setNewVariantImageFiles(prev => ({
            ...prev,
            [variantIndex]: file // نستخدم index الـ variant كـ key لربط الملف
        }));

        setEditedProduct(prev => {
            const newVariations = [...prev.variations];
            newVariations[variantIndex] = { 
                ...newVariations[variantIndex], 
                image: URL.createObjectURL(file) // لعرض المعاينة في الواجهة الأمامية
            };
            return { ...prev, variations: newVariations };
        });
    }, []);

    // **جديد: إزالة صورة Variant (مسح الصورة فقط مع الاحتفاظ بالـ variant)**
    const handleRemoveVariantImage = useCallback((variantIndex) => {
        setNewVariantImageFiles(prevFiles => {
            const newFiles = { ...prevFiles };
            delete newFiles[variantIndex];
            return newFiles;
        });

        setEditedProduct(prev => {
            const newVariations = [...prev.variations];
            // قم بمسح مسار الصورة
            newVariations[variantIndex] = { ...newVariations[variantIndex], image: null };
            return { ...prev, variations: newVariations };
        });
    }, []);


    const handleMainImageChange = useCallback((e) => {
        const file = e.target.files[0];
        setMainImageFile(file);
        if (file) {
            setCurrentMainImageUrl(URL.createObjectURL(file));
            setClearMainImage(false);
        } else {
            setCurrentMainImageUrl(product.mainImage ? `${serverUrl}${product.mainImage}` : '');
        }
    }, [product, serverUrl]);

    const handleClearMainImage = useCallback(() => {
        setCurrentMainImageUrl('');
        setMainImageFile(null);
        setClearMainImage(true);
    }, []);

    const handleAdditionalImagesChange = useCallback((e) => {
        const files = Array.from(e.target.files);
        setAdditionalImageFiles((prev) => [...prev, ...files]);
    }, []);

    const handleRemoveExistingAdditionalImage = useCallback((urlToRemove) => {
        setExistingAdditionalImageUrls((prev) => prev.filter((url) => url !== urlToRemove));
    }, []);

    const handleRemoveNewAdditionalImage = useCallback((indexToRemove) => {
        setAdditionalImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    }, []);

    const handleVideosChange = useCallback((e) => {
        const files = Array.from(e.target.files);
        setVideoFiles((prev) => [...prev, ...files]);
    }, []);

    const handleRemoveExistingVideo = useCallback((urlToRemove) => {
        setExistingVideoUrls((prev) => prev.filter((url) => url !== urlToRemove));
    }, []);

    const handleRemoveNewVideo = useCallback((indexToRemove) => {
        setVideoFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        if (!editedProduct.name_en || editedProduct.name_en.trim() === "" || !editedProduct.name_ar || editedProduct.name_ar.trim() === "" || editedProduct.price === undefined || editedProduct.price === null || Number(editedProduct.price) < 0) {
            setErrorMessage(t('productAdmin.nameAndPriceRequired') || "Product name and price are required.");
            setIsSubmitting(false);
            return;
        }

        // تحقق من أن كل variant تم إدخاله بالحد الأدنى من البيانات
        if (editedProduct.variations.length > 0) {
            for (const variant of editedProduct.variations) {
                if (!variant.options || variant.options.length === 0) {
                    setErrorMessage(t('productAdmin.variantOptionsRequired') || "Each variant must have at least one option.");
                    setIsSubmitting(false);
                    return;
                }
                for (const option of variant.options) {
                    if (!option.optionName || !option.optionValue) {
                        setErrorMessage(t('productAdmin.allVariantOptionsRequired') || "All variant options must have a name and value.");
                        setIsSubmitting(false);
                        return;
                    }
                }
                if (variant.stock === undefined || variant.stock === null || variant.stock < 0) {
                    setErrorMessage(t('productAdmin.variantStockRequired') || "Variant stock is required and must be non-negative.");
                    setIsSubmitting(false);
                    return;
                }
            }
        }


        const formData = new FormData();
        formData.append('name_en', editedProduct.name_en);
        formData.append('name_ar', editedProduct.name_ar);
        formData.append('description_en', editedProduct.description_en);
        formData.append('description_ar', editedProduct.description_ar);
        formData.append('price', editedProduct.price);
        formData.append('category', editedProduct.category);
        formData.append('subCategory', editedProduct.subCategory);
        
        // إرسال الـ attributes كـ JSON string
        if (Object.keys(editedProduct.attributes).length > 0) {
            formData.append("attributes", JSON.stringify(editedProduct.attributes));
        }

        // إرسال الـ variations كـ JSON string
        // نرسل البيانات الحالية للـ variants، بما في ذلك _id للموجودة.
        // ونضيف tempFileIndex لربط الصور الجديدة في الـ backend
        const variationsToSend = editedProduct.variations.map((variant, index) => ({
            ...variant,
            image: newVariantImageFiles[index] ? null : variant.image, 
            tempFileIndex: newVariantImageFiles[index] ? index : undefined 
        }));
        if (editedProduct.variations.length > 0) {
            formData.append("variations", JSON.stringify(variationsToSend));
        }

        formData.append('clearMainImage', clearMainImage);

        if (mainImageFile) {
            formData.append('mainImage', mainImageFile);
        }

        // إرسال الـ URLs للصور/الفيديوهات الموجودة التي لم يتم حذفها
        existingAdditionalImageUrls.forEach(url => formData.append('existingImages', url));
        existingVideoUrls.forEach(url => formData.append('existingVideos', url));

        // إرسال ملفات الصور/الفيديوهات الإضافية الجديدة
        additionalImageFiles.forEach((file) => formData.append('additionalImages', file));
        videoFiles.forEach((file) => formData.append('videos', file));

        // **الإصلاح هنا:** يجب تسمية جميع الملفات بنفس اسم الحقل لكي يتعامل معها multer كمصفوفة
        Object.values(newVariantImageFiles).forEach((file) => {
            formData.append("variantImages", file); // Append كل ملف بنفس الاسم "variantImages"
        });

        try {
            const response = await axios.put(`${serverUrl}/api/product/${product._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onProductUpdated(response.data);
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

    const currentCategoryAttributes = useMemo(() => {
        return editedProduct.category ? (CATEGORY_ATTRIBUTES[editedProduct.category] || CATEGORY_ATTRIBUTES.others) : [];
    }, [editedProduct.category]);

    // تحديد خيارات الـ Variations المتاحة للفئة المختارة (للعرض في dropdown اسم الخيار)
    const currentCategoryVariationsOptions = useMemo(() => {
        return editedProduct.category ? (CATEGORY_VARIATIONS_OPTIONS[editedProduct.category] || []) : [];
    }, [editedProduct.category]);


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
                        <select
                            id="edit-category"
                            name="category"
                            value={editedProduct.category}
                            onChange={handleChange}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                            <option value="">{t('productAdmin.selectCategory') || 'Select a Category'}</option>
                            {Object.keys(CATEGORY_ATTRIBUTES).map(cat => (
                                <option key={cat} value={cat}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="edit-subCategory" className="block text-sm font-medium text-gray-700">{t('productAdmin.subCategoryLabel') || 'Sub-Category (Optional)'}</label>
                        <input
                            type="text"
                            id="edit-subCategory"
                            name="subCategory"
                            value={editedProduct.subCategory}
                            onChange={handleChange}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {editedProduct.category && currentCategoryAttributes.length > 0 && (
                        <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-700">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('productAdmin.specificAttributes') || 'Category Specific Attributes'}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentCategoryAttributes.map(attr => (
                                    <div key={attr.key}>
                                        <label htmlFor={`edit-attr-${attr.key}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {language === 'ar' ? attr.label_ar : attr.label_en}
                                        </label>
                                        <input
                                            type={attr.type}
                                            id={`edit-attr-${attr.key}`}
                                            name={`edit-attr-${attr.key}`}
                                            value={editedProduct.attributes[attr.key] || ''}
                                            onChange={(e) => handleAttributeChange(attr.key, e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                                            min={attr.type === "number" ? "0" : undefined}
                                            step={attr.type === "number" ? "any" : undefined}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* **القسم الجديد والمهم: إدارة الـ Variants (نفس منطق AddProductPage)** */}
                    {editedProduct.category && (
                        <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-700">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('productAdmin.productVariants') || 'Product Variants'}</h3>
                            {editedProduct.variations.map((variant, variantIndex) => (
                                <div key={variant._id || `new-${variantIndex}`} className="relative p-4 mb-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(variantIndex)}
                                        className="absolute top-2 right-2 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                                        aria-label={t('productAdmin.removeVariant') || 'Remove Variant'}
                                    >
                                        <XCircle size={20} />
                                    </button>
                                    <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                                        {t('productAdmin.variant') || 'Variant'} #{variantIndex + 1}
                                    </h4>

                                    {/* Options for this Variant */}
                                    <div className="mb-4">
                                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('productAdmin.variantOptions') || 'Variant Options'}
                                        </h5>
                                        {variant.options.map((option, optionIndex) => (
                                            <div key={optionIndex} className="flex flex-col sm:flex-row items-center gap-2 mb-2">
                                                <select
                                                    value={option.optionName}
                                                    onChange={(e) => handleVariantOptionValueChange(variantIndex, optionIndex, 'optionName', e.target.value)}
                                                    className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-md shadow-sm bg-white dark:bg-gray-700 dark:text-white"
                                                    required
                                                >
                                                    <option value="">{t('productAdmin.selectOptionType') || 'Select Option Type'}</option>
                                                    {currentCategoryVariationsOptions.map(optDef => (
                                                        <option key={optDef.name_en} value={optDef.name_en}>
                                                            {language === 'ar' ? optDef.name_ar : optDef.name_en}
                                                        </option>
                                                    ))}
                                                </select>
                                                
                                                {option.optionName && currentCategoryVariationsOptions.find(o => o.name_en === option.optionName)?.type === 'select' ? (
                                                    <select
                                                        value={option.optionValue}
                                                        onChange={(e) => handleVariantOptionValueChange(variantIndex, optionIndex, 'optionValue', e.target.value)}
                                                        className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-md shadow-sm bg-white dark:bg-gray-700 dark:text-white"
                                                        required
                                                    >
                                                        <option value="">{t('productAdmin.selectValue') || 'Select Value'}</option>
                                                        {currentCategoryVariationsOptions.find(o => o.name_en === option.optionName)?.options.map(val => (
                                                            <option key={val} value={val}>{val}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={option.optionValue}
                                                        onChange={(e) => handleVariantOptionValueChange(variantIndex, optionIndex, 'optionValue', e.target.value)}
                                                        placeholder={t('productAdmin.optionValuePlaceholder') || 'Option Value'}
                                                        className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                                                        required
                                                    />
                                                )}
                                                
                                                <button
                                                    type="button"
                                                    onClick={() => removeOptionFromVariant(variantIndex, optionIndex)}
                                                    className="p-1 text-red-500 hover:text-red-700"
                                                    aria-label={t('productAdmin.removeOption') || 'Remove Option'}
                                                >
                                                    <MinusCircle size={20} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => addOptionToVariant(variantIndex)}
                                            className="mt-2 bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm flex items-center gap-1 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                        >
                                            <PlusCircle size={16} /> {t('productAdmin.addOption') || 'Add Option'}
                                        </button>
                                    </div>

                                    {/* Variant Specific Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor={`edit-priceAdjustment-${variantIndex}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                {t('productAdmin.priceAdjustment') || 'Price Adjustment'}
                                            </label>
                                            <input
                                                type="number"
                                                id={`edit-priceAdjustment-${variantIndex}`}
                                                value={variant.priceAdjustment || 0}
                                                onChange={(e) => handleVariantFieldChange(variantIndex, 'priceAdjustment', Number(e.target.value))}
                                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                                                step="any"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor={`edit-stock-${variantIndex}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                {t('productAdmin.stock') || 'Stock'}
                                            </label>
                                            <input
                                                type="number"
                                                id={`edit-stock-${variantIndex}`}
                                                value={variant.stock || 0}
                                                onChange={(e) => handleVariantFieldChange(variantIndex, 'stock', Number(e.target.value))}
                                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor={`edit-sku-${variantIndex}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                {t('productAdmin.sku') || 'SKU (Optional)'}
                                            </label>
                                            <input
                                                type="text"
                                                id={`edit-sku-${variantIndex}`}
                                                value={variant.sku || ''}
                                                onChange={(e) => handleVariantFieldChange(variantIndex, 'sku', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        {/* Variant Image Upload */}
                                        <div className="flex flex-col items-center justify-center w-full">
                                            <label htmlFor={`edit-variant-image-${variantIndex}`} className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                                                {/* عرض الصورة الموجودة أو المعاينة الجديدة */}
                                                {variant.image ? (
                                                    <img src={variant.image.startsWith('/uploads') ? `${serverUrl}${variant.image}` : variant.image} alt="Variant" className="w-full h-full object-cover rounded-md" />
                                                ) : (
                                                    <ImageIcon size={32} className="text-gray-400 dark:text-gray-300" />
                                                )}
                                                <input
                                                    type="file"
                                                    id={`edit-variant-image-${variantIndex}`}
                                                    name={`variantImages[${variantIndex}]`} 
                                                    onChange={(e) => handleVariantImageChange(variantIndex, e.target.files[0])}
                                                    className="hidden"
                                                    accept="image/*"
                                                />
                                            </label>
                                            {variant.image && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveVariantImage(variantIndex)}
                                                    className="mt-1 text-xs text-red-500 hover:text-red-700"
                                                >
                                                    {t('productAdmin.removeImage') || 'Remove Image'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addVariant}
                                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors duration-200"
                            >
                                <PlusCircle size={20} /> {t('productAdmin.addVariant') || 'Add Variant'}
                            </button>
                        </div>
                    )}

                    {/* Main Image Upload */}
                    <div>
                        <label htmlFor="mainImage" className="block text-sm font-medium text-gray-700 mb-1">{t('productAdmin.mainImageLabel') || 'Main Product Image'}</label>
                        {currentMainImageUrl && (
                            <div className="mb-2 relative w-32 h-32 border border-gray-300 rounded-md overflow-hidden">
                                <img src={currentMainImageUrl} alt="Main Product" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={handleClearMainImage}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 text-xs hover:bg-red-600"
                                    aria-label={t('productAdmin.removeImage') || 'Remove image'}
                                >
                                    <XCircle size={16} />
                                </button>
                            </div>
                        )}
                        <input
                            type="file"
                            id="mainImage"
                            name="mainImage"
                            onChange={handleMainImageChange}
                            className="w-full p-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            accept="image/*"
                        />
                        {mainImageFile && (
                            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                {t('productAdmin.selectedFile')}: {mainImageFile.name}
                            </div>
                        )}
                    </div>

                    {/* Additional Images Upload */}
                    <div>
                        <label htmlFor="additionalImages" className="block text-sm font-medium text-gray-700 mb-1">{t('productAdmin.additionalImagesLabel') || 'Additional Product Images (Optional, multiple)'}</label>
                        <input
                            type="file"
                            id="additionalImages"
                            name="additionalImages"
                            onChange={handleAdditionalImagesChange}
                            className="w-full p-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            accept="image/*"
                            multiple
                        />
                        <div className="mt-2 flex flex-wrap gap-2">
                            {existingAdditionalImageUrls.map((url, index) => (
                                <div key={`existing-${index}`} className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-300">
                                    <img src={`${serverUrl}${url}`} alt={`Existing ${index}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveExistingAdditionalImage(url)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 text-xs hover:bg-red-600"
                                        aria-label={t('productAdmin.removeImage') || 'Remove image'}
                                    >
                                        <XCircle size={16} />
                                    </button>
                                </div>
                            ))}
                            {additionalImageFiles.map((file, index) => (
                                <div key={`new-${index}`} className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-300">
                                    <img src={URL.createObjectURL(file)} alt={`New ${index}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveNewAdditionalImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 text-xs hover:bg-red-600"
                                        aria-label={t('productAdmin.removeImage') || 'Remove image'}
                                    >
                                        <XCircle size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Videos Upload */}
                    <div>
                        <label htmlFor="videos" className="block text-sm font-medium text-gray-700 mb-1">{t('productAdmin.videosLabel') || 'Product Videos (Optional, multiple)'}</label>
                        <input
                            type="file"
                            id="videos"
                            name="videos"
                            onChange={handleVideosChange}
                            className="w-full p-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            accept="video/*"
                            multiple
                        />
                        <div className="mt-2 flex flex-wrap gap-2">
                            {existingVideoUrls.map((url, index) => (
                                <div key={`existing-video-${index}`} className="relative w-32 h-24 rounded-md overflow-hidden border border-gray-300 bg-black flex items-center justify-center">
                                    <video src={`${serverUrl}${url}`} className="w-full h-full object-cover" controls={false} />
                                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white text-xs">
                                        {t('productAdmin.videoPreview') || 'Video Preview'}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveExistingVideo(url)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 text-xs hover:bg-red-600"
                                        aria-label={t('productAdmin.removeVideo') || 'Remove video'}
                                    >
                                        <XCircle size={16} />
                                    </button>
                                </div>
                            ))}
                            {videoFiles.map((file, index) => (
                                <div key={`new-video-${index}`} className="relative w-32 h-24 rounded-md overflow-hidden border border-gray-300 bg-black flex items-center justify-center">
                                    <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" controls={false} />
                                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white text-xs">
                                        {t('productAdmin.videoPreview') || 'Video Preview'}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveNewVideo(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 text-xs hover:bg-red-600"
                                        aria-label={t('productAdmin.removeVideo') || 'Remove video'}
                                    >
                                        <XCircle size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {t('productAdmin.cancelButton') || 'Cancel'}
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