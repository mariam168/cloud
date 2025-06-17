import React, { useState, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { useLanguage } from '../../LanguageContext';
import { XCircle, PlusCircle, Image as ImageIcon, MinusCircle } from 'lucide-react'; 

// تعريف الفئات وخصائصها (يجب أن يكون هذا التعريف متطابقاً)
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


const AddProductPage = ({ onProductAdded, serverUrl = 'http://localhost:5000' }) => {
    const { t, language } = useLanguage();
    const [product, setProduct] = useState({
        name_en: "",
        name_ar: "",
        description_en: "",
        description_ar: "",
        price: "",
        category: "",
        subCategory: "",
        attributes: {}, 
        variations: [], // الآن هي مصفوفة من كائنات Variant
    });
    const [mainImageFile, setMainImageFile] = useState(null);
    const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
    const [videoFiles, setVideoFiles] = useState([]);
    
    // جديد: لحفظ ملفات صور الـ Variants الجديدة مؤقتًا { variantIndex: File }
    const [variantImageFiles, setVariantImageFiles] = useState({}); 

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState("");

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setProduct((prev) => ({
            ...prev,
            [name]: value,
        }));
        // عند تغيير الفئة، قم بتحديث الخصائص والـ variations الافتراضية
        if (name === "category") {
            setProduct((prev) => ({
                ...prev,
                attributes: {}, // امسح الـ attributes القديمة
                variations: [], // امسح الـ variations القديمة
            }));
            setVariantImageFiles({}); // امسح صور الـ variations القديمة
        }
    }, []);

    const handleAttributeChange = useCallback((key, value) => {
        setProduct((prev) => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                [key]: value,
            },
        }));
    }, []);

    // **جديد: إضافة Variant جديد**
    const addVariant = useCallback(() => {
        setProduct(prev => ({
            ...prev,
            variations: [
                ...prev.variations,
                // Variant جديد بقيم افتراضية
                { options: [], image: null, priceAdjustment: 0, stock: 0, sku: '' } 
            ]
        }));
    }, []);

    // **جديد: إزالة Variant**
    const removeVariant = useCallback((indexToRemove) => {
        setProduct(prev => {
            const newVariations = prev.variations.filter((_, index) => index !== indexToRemove);
            // لو كان فيه ملف مؤقت للـ variant اللي اتحذف، احذفه من قائمة الملفات المؤقتة
            setVariantImageFiles(prevFiles => {
                const newFiles = { ...prevFiles };
                delete newFiles[indexToRemove]; // حذف الملف المرتبط بالـ index
                // عند الحذف، قد تتغير مؤشرات الملفات الأخرى، لذا يفضل إعادة ترقيمها
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

    // **جديد: إضافة خيار لـ Variant معين (مثال: إضافة "Color" إلى Variant)**
    const addOptionToVariant = useCallback((variantIndex) => {
        setProduct(prev => {
            const newVariations = [...prev.variations];
            newVariations[variantIndex].options.push({ optionName: "", optionValue: "" });
            return { ...prev, variations: newVariations };
        });
    }, []);

    // **جديد: إزالة خيار من Variant معين**
    const removeOptionFromVariant = useCallback((variantIndex, optionIndexToRemove) => {
        setProduct(prev => {
            const newVariations = [...prev.variations];
            newVariations[variantIndex].options = newVariations[variantIndex].options.filter((_, index) => index !== optionIndexToRemove);
            return { ...prev, variations: newVariations };
        });
    }, []);

    // **جديد: تحديث بيانات Variant موجود (مثل priceAdjustment, stock, sku)**
    const handleVariantFieldChange = useCallback((variantIndex, field, value) => {
        setProduct(prev => {
            const newVariations = [...prev.variations];
            newVariations[variantIndex] = { ...newVariations[variantIndex], [field]: value };
            return { ...prev, variations: newVariations };
        });
    }, []);

    // **جديد: تحديث قيمة خيار معين داخل Variant (مثال: تغيير "Red" إلى "Blue" للـ Color)**
    const handleVariantOptionValueChange = useCallback((variantIndex, optionIndex, field, value) => {
        setProduct(prev => {
            const newVariations = [...prev.variations];
            newVariations[variantIndex].options[optionIndex][field] = value;
            return { ...prev, variations: newVariations };
        });
    }, []);

    // **جديد: التعامل مع ملف صورة الـ Variant**
    const handleVariantImageChange = useCallback((variantIndex, file) => {
        setVariantImageFiles(prev => ({
            ...prev,
            [variantIndex]: file // نستخدم index الـ variant كـ key لربط الملف
        }));

        setProduct(prev => {
            const newVariations = [...prev.variations];
            newVariations[variantIndex] = { 
                ...newVariations[variantIndex], 
                image: file ? URL.createObjectURL(file) : null // لعرض المعاينة في الواجهة الأمامية
            };
            return { ...prev, variations: newVariations };
        });
    }, []);

    // **جديد: إزالة صورة Variant (مسح الصورة فقط)**
    const handleRemoveVariantImage = useCallback((variantIndex) => {
        setVariantImageFiles(prevFiles => {
            const newFiles = { ...prevFiles };
            delete newFiles[variantIndex]; // حذف الملف المرتبط
            return newFiles;
        });

        setProduct(prev => {
            const newVariations = [...prev.variations];
            newVariations[variantIndex] = { ...newVariations[variantIndex], image: null };
            return { ...prev, variations: newVariations };
        });
    }, []);

    const handleMainImageChange = useCallback((e) => {
        setMainImageFile(e.target.files[0]);
    }, []);

    const handleAdditionalImagesChange = useCallback((e) => {
        const files = Array.from(e.target.files);
        setAdditionalImageFiles((prev) => [...prev, ...files]);
    }, []);

    const handleRemoveAdditionalImage = useCallback((indexToRemove) => {
        setAdditionalImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    }, []);

    const handleVideosChange = useCallback((e) => {
        const files = Array.from(e.target.files);
        setVideoFiles((prev) => [...prev, ...files]);
    }, []);

    const handleRemoveVideo = useCallback((indexToRemove) => {
        setVideoFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitMessage("");

        if (!product.name_en || product.name_en.trim() === "" || !product.name_ar || product.name_ar.trim() === "" || product.price === undefined || product.price === null || Number(product.price) < 0) {
            setSubmitMessage(t('productAdmin.nameAndPriceRequired') || "Product English and Arabic names, and price are required.");
            return;
        }

        if (!mainImageFile) {
            setSubmitMessage(t('productAdmin.mainImageRequired') || "Product main image is required.");
            return;
        }

        // تحقق من أن كل variant تم إدخاله بالحد الأدنى من البيانات
        if (product.variations.length > 0) {
            for (const variant of product.variations) {
                if (!variant.options || variant.options.length === 0) {
                    setSubmitMessage(t('productAdmin.variantOptionsRequired') || "Each variant must have at least one option.");
                    return;
                }
                for (const option of variant.options) {
                    if (!option.optionName || !option.optionValue) {
                        setSubmitMessage(t('productAdmin.allVariantOptionsRequired') || "All variant options must have a name and value.");
                        return;
                    }
                }
                if (variant.stock === undefined || variant.stock === null || variant.stock < 0) {
                    setSubmitMessage(t('productAdmin.variantStockRequired') || "Variant stock is required and must be non-negative.");
                    return;
                }
            }
        }


        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("name_en", product.name_en);
            formData.append("name_ar", product.name_ar);
            formData.append("description_en", product.description_en);
            formData.append("description_ar", product.description_ar);
            formData.append("price", product.price);
            
            if (product.category) formData.append("category", product.category);
            if (product.subCategory) formData.append("subCategory", product.subCategory);
            
            if (Object.keys(product.attributes).length > 0) {
                formData.append("attributes", JSON.stringify(product.attributes));
            }

            // إرسال الـ variations كـ JSON string، مع إضافة مؤشر لربطها بالملفات المرفوعة
            const variationsToSend = product.variations.map((variant, index) => ({
                // لا ترسل الـ URL المؤقت للصورة من الـ frontend، فقط إذا كانت موجودة مسبقًا (في حالة التعديل)
                // وفي حالة الإضافة، نرسل البيانات الأساسية للـ variant، والـ backend سيتولى ربط الصورة.
                ...variant,
                image: variantImageFiles[index] ? null : variant.image, // لو فيه ملف جديد، لا ترسل URL مؤقت
                tempFileIndex: variantImageFiles[index] ? index : undefined // مؤشر للملف في قائمة variantImageFiles
            }));
            if (product.variations.length > 0) {
                formData.append("variations", JSON.stringify(variationsToSend));
            }

            // إرسال ملفات الصور والفيديوهات
            if (mainImageFile) formData.append("mainImage", mainImageFile);
            additionalImageFiles.forEach((file) => {
                formData.append("additionalImages", file);
            });
            videoFiles.forEach((file) => {
                formData.append("videos", file);
            });

            // **الإصلاح هنا:** يجب تسمية جميع الملفات بنفس اسم الحقل لكي يتعامل معها multer كمصفوفة
            Object.values(variantImageFiles).forEach((file) => {
                formData.append("variantImages", file); // Append كل ملف بنفس الاسم "variantImages"
            });


            await axios.post(`${serverUrl}/api/product`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setSubmitMessage(t('productAdmin.addSuccess') || "Product added successfully!");
            // إعادة ضبط النموذج
            setProduct({ name_en: "", name_ar: "", description_en: "", description_ar: "", price: "", category: "", subCategory: "", attributes: {}, variations: [] });
            setMainImageFile(null);
            setAdditionalImageFiles([]);
            setVideoFiles([]);
            setVariantImageFiles({}); // إعادة ضبط ملفات صور الـ variations
            
            // إعادة ضبط حقول File Input يدوياً
            if (document.getElementById("mainImage")) document.getElementById("mainImage").value = null;
            if (document.getElementById("additionalImages")) document.getElementById("additionalImages").value = null;
            if (document.getElementById("videos")) document.getElementById("videos").value = null;
            // لا يمكن إعادة ضبط حقول ملفات الـ variants بشكل مباشر بنفس الطريقة بسهولة،
            // لذلك نعتمد على أن setVariantImageFiles({}) ستزيل المعاينات.

            if (onProductAdded) {
                onProductAdded();
            }

        } catch (error) {
            console.error("Error adding product:", error.response ? error.response.data : error.message);
            setSubmitMessage(
                (t('productAdmin.addError') || "Error adding product: ") +
                (error.response && error.response.data && typeof error.response.data === 'string'
                    ? error.response.data
                    : error.response?.data?.message || error.message)
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentCategoryAttributes = useMemo(() => {
        return product.category ? (CATEGORY_ATTRIBUTES[product.category] || CATEGORY_ATTRIBUTES.others) : [];
    }, [product.category]);

    // تحديد خيارات الـ Variations المتاحة للفئة المختارة (للعرض في dropdown اسم الخيار)
    const currentCategoryVariationsOptions = useMemo(() => {
        return product.category ? (CATEGORY_VARIATIONS_OPTIONS[product.category] || []) : [];
    }, [product.category]);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {submitMessage && (
                <p className={`text-center mb-4 p-2 rounded ${submitMessage.includes(t('productAdmin.addSuccess') || "successfully") || submitMessage.includes("بنجاح") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {submitMessage}
                </p>
            )}
            <div>
                <label htmlFor="name_en" className="block text-sm font-medium text-gray-700 mb-1">{t('productAdmin.productNameEn') || 'Product Name (English)'}</label>
                <input
                    type="text"
                    id="name_en"
                    name="name_en"
                    value={product.name_en}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </div>
            <div>
                <label htmlFor="name_ar" className="block text-sm font-medium text-gray-700 mb-1">{t('productAdmin.productNameAr') || 'اسم المنتج (العربية)'}</label>
                <input
                    type="text"
                    id="name_ar"
                    name="name_ar"
                    value={product.name_ar}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right"
                    required
                />
            </div>
            <div>
                <label htmlFor="description_en" className="block text-sm font-medium text-gray-700 mb-1">{t('productAdmin.descriptionEn') || 'Product Description (English)'}</label>
                <textarea
                    id="description_en"
                    name="description_en"
                    value={product.description_en}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    rows="4"
                />
            </div>
            <div>
                <label htmlFor="description_ar" className="block text-sm font-medium text-gray-700 mb-1">{t('productAdmin.descriptionAr') || 'وصف المنتج (العربية)'}</label>
                <textarea
                    id="description_ar"
                    name="description_ar"
                    value={product.description_ar}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right"
                    rows="4"
                />
            </div>
            <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">{t('productAdmin.priceLabel') || 'Product Price'}</label>
                <input
                    type="number"
                    id="price"
                    name="price"
                    value={product.price}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    min="0"
                    step="any"
                />
            </div>
            
            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">{t('productAdmin.categoryLabel') || 'Category'}</label>
                <select
                    id="category"
                    name="category"
                    value={product.category}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
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
                <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700 mb-1">{t('productAdmin.subCategoryLabel') || 'Sub-Category (Optional)'}</label>
                <input
                    type="text"
                    id="subCategory"
                    name="subCategory"
                    value={product.subCategory}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            {product.category && currentCategoryAttributes.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('productAdmin.specificAttributes') || 'Category Specific Attributes'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentCategoryAttributes.map(attr => (
                            <div key={attr.key}>
                                <label htmlFor={`attr-${attr.key}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {language === 'ar' ? attr.label_ar : attr.label_en}
                                </label>
                                <input
                                    type={attr.type}
                                    id={`attr-${attr.key}`}
                                    name={`attr-${attr.key}`}
                                    value={product.attributes[attr.key] || ''}
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

            {/* **القسم الجديد والمهم: إدارة الـ Variants** */}
            {product.category && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('productAdmin.productVariants') || 'Product Variants'}</h3>
                    {product.variations.map((variant, variantIndex) => (
                        <div key={variantIndex} className="relative p-4 mb-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 shadow-sm">
                            <button
                                type="button"
                                onClick={() => removeVariant(variantIndex)}
                                className="absolute top-2 right-2 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                                aria-label={t('productAdmin.removeVariant') || 'Remove Variant'}
                            >
                                <XCircle size={20} />
                            </button>
                            <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                                {t('productAdmin.variant')} #{variantIndex + 1}
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
                                        
                                        {/* Dynamic input/select for optionValue */}
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
                                    <label htmlFor={`priceAdjustment-${variantIndex}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t('productAdmin.priceAdjustment') || 'Price Adjustment'}
                                    </label>
                                    <input
                                        type="number"
                                        id={`priceAdjustment-${variantIndex}`}
                                        value={variant.priceAdjustment || 0}
                                        onChange={(e) => handleVariantFieldChange(variantIndex, 'priceAdjustment', Number(e.target.value))}
                                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                                        step="any"
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`stock-${variantIndex}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t('productAdmin.stock') || 'Stock'}
                                    </label>
                                    <input
                                        type="number"
                                        id={`stock-${variantIndex}`}
                                        value={variant.stock || 0}
                                        onChange={(e) => handleVariantFieldChange(variantIndex, 'stock', Number(e.target.value))}
                                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`sku-${variantIndex}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t('productAdmin.sku') || 'SKU (Optional)'}
                                    </label>
                                    <input
                                        type="text"
                                        id={`sku-${variantIndex}`}
                                        value={variant.sku || ''}
                                        onChange={(e) => handleVariantFieldChange(variantIndex, 'sku', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                {/* Variant Image Upload */}
                                <div className="flex flex-col items-center justify-center w-full">
                                    <label htmlFor={`variant-image-${variantIndex}`} className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                                        {variant.image ? (
                                            <img src={variant.image} alt="Variant" className="w-full h-full object-cover rounded-md" />
                                        ) : (
                                            <ImageIcon size={32} className="text-gray-400 dark:text-gray-300" />
                                        )}
                                        <input
                                            type="file"
                                            id={`variant-image-${variantIndex}`}
                                            name={`variantImages[${variantIndex}]`} // مهم جداً: استخدام الأقواس المربعة لـ Multer
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

            <div>
                <label htmlFor="mainImage" className="block text-sm font-medium text-gray-700 mb-1">{t('productAdmin.mainImageLabel') || 'Main Product Image'}</label>
                <input
                    type="file"
                    id="mainImage"
                    name="mainImage"
                    onChange={handleMainImageChange}
                    className="w-full p-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    accept="image/*"
                    required
                />
                {mainImageFile && (
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {t('productAdmin.selectedFile')}: {mainImageFile.name}
                    </div>
                )}
            </div>

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
                    {additionalImageFiles.map((file, index) => (
                        <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-300">
                            <img src={URL.createObjectURL(file)} alt={`Additional ${index}`} className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => handleRemoveAdditionalImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 text-xs hover:bg-red-600"
                                aria-label={t('productAdmin.removeImage') || 'Remove image'}
                            >
                                <XCircle size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

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
                    {videoFiles.map((file, index) => (
                        <div key={index} className="relative w-32 h-24 rounded-md overflow-hidden border border-gray-300 bg-black flex items-center justify-center">
                            <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" controls={false} />
                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white text-xs">
                                {t('productAdmin.videoPreview') || 'Video Preview'}
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveVideo(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 text-xs hover:bg-red-600"
                                aria-label={t('productAdmin.removeVideo') || 'Remove video'}
                            >
                                <XCircle size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 transition duration-150 ease-in-out"
            >
                {isSubmitting ? (t('productAdmin.submittingButton') || "Adding...") : (t('productAdmin.addButton') || "Add Product")}
            </button>
        </form>
    );
};

export default AddProductPage;