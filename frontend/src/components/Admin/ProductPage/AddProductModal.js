import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLanguage } from '../../LanguageContext';
import { X, PlusCircle, Trash2, Image as ImageIcon, UploadCloud, AlertCircle, ChevronsRight } from 'lucide-react';

const AddProductModal = ({ onClose, onProductAdded, serverUrl }) => {
    const { t, language } = useLanguage();
    const [product, setProduct] = useState({ name_en: '', name_ar: '', description_en: '', description_ar: '', basePrice: '', category: '', subCategoryName: '' });
    const [attributes, setAttributes] = useState([]);
    const [variations, setVariations] = useState([]);
    const [mainImageFile, setMainImageFile] = useState(null);
    const [mainImageUrl, setMainImageUrl] = useState('');
    const [optionImageFiles, setOptionImageFiles] = useState({});
    const [categories, setCategories] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getDisplayName = (item) => {
        if (!item?.name) return '';
        return typeof item.name === 'object' ? item.name[language] || item.name.en || '' : item.name;
    };

    const fetchCategories = useCallback(async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/categories`, { headers: { 'x-admin-request': 'true' } });
            setCategories(res.data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    }, [serverUrl]);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    const handleProductChange = (e) => setProduct(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleMainImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMainImageFile(file);
            setMainImageUrl(URL.createObjectURL(file));
        }
    };
    const handleRemoveMainImage = () => {
        setMainImageFile(null);
        setMainImageUrl('');
    };
    
    // Logic for Attributes
    const addAttribute = () => setAttributes(prev => [...prev, { key_en: '', key_ar: '', value_en: '', value_ar: '' }]);
    const removeAttribute = (index) => setAttributes(prev => prev.filter((_, i) => i !== index));
    const handleAttributeChange = (index, field, value) => setAttributes(prev => prev.map((attr, i) => (i === index ? { ...attr, [field]: value } : attr)));

    // Logic for Variations
    const addVariation = () => setVariations(prev => [...prev, { tempId: `var_${Date.now()}`, name_en: '', name_ar: '', options: [] }]);
    const removeVariation = (vIndex) => setVariations(prev => prev.filter((_, i) => i !== vIndex));
    const handleVariationNameChange = (vIndex, lang, value) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, [`name_${lang}`]: value } : v)));
    const addOptionToVariation = (vIndex) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, options: [...v.options, { tempId: `opt_${Date.now()}`, name_en: '', name_ar: '', skus: [] }] } : v)));
    const removeOption = (vIndex, oIndex) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, options: v.options.filter((_, j) => j !== oIndex) } : v)));
    const handleOptionNameChange = (vIndex, oIndex, lang, value) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, options: v.options.map((o, j) => (j === oIndex ? { ...o, [`name_${lang}`]: value } : o)) } : v)));
    const handleOptionImageChange = (vIndex, oIndex, file) => setOptionImageFiles(prev => ({ ...prev, [`variationImage_${vIndex}_${oIndex}`]: file }));
    const addSkuToOption = (vIndex, oIndex) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, options: v.options.map((o, j) => (j === oIndex ? { ...o, skus: [...o.skus, { name_en: '', name_ar: '', price: product.basePrice, stock: 0, sku: '' }] } : o)) } : v)));
    const removeSku = (vIndex, oIndex, sIndex) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, options: v.options.map((o, j) => (j === oIndex ? { ...o, skus: o.skus.filter((_, k) => k !== sIndex) } : o)) } : v)));
    const handleSkuChange = (vIndex, oIndex, sIndex, field, value) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, options: v.options.map((o, j) => (j === oIndex ? { ...o, skus: o.skus.map((s, k) => (k === sIndex ? { ...s, [field]: value } : s)) } : o)) } : v)));
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');
        const formData = new FormData();
        Object.entries(product).forEach(([key, value]) => formData.append(key, value));
        if (mainImageFile) formData.append('mainImage', mainImageFile);
        formData.append('attributes', JSON.stringify(attributes.filter(attr => attr.key_en && attr.value_en)));
        const finalVariations = variations.map((v, vIndex) => ({
            name_en: v.name_en, name_ar: v.name_ar,
            options: v.options.map((o, oIndex) => {
                const imageFile = optionImageFiles[`variationImage_${vIndex}_${oIndex}`];
                const cleanOption = { name_en: o.name_en, name_ar: o.name_ar, skus: o.skus.map(sku => ({ ...sku, sku: sku.sku || null })) };
                if (imageFile) {
                    const fieldName = `variationImage_${vIndex}_${oIndex}`;
                    formData.append(fieldName, imageFile);
                    cleanOption.imagePlaceholder = fieldName;
                }
                return cleanOption;
            })
        }));
        formData.append('variations', JSON.stringify(finalVariations));
        try {
            await axios.post(`${serverUrl}/api/products`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            onProductAdded();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "An unknown error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const selectedCategoryData = categories.find(c => c._id === product.category);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 p-2 sm:p-4 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col border border-slate-700">
                <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <PlusCircle className="text-indigo-500" />
                        {t('productAdmin.addNewProduct')}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                        <X size={24} className="text-gray-600 dark:text-gray-300"/>
                    </button>
                </header>
                
                <form id="add-product-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {errorMessage && (
                        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-3">
                            <AlertCircle size={20} />
                            <span>{errorMessage}</span>
                        </div>
                    )}
                    
                    <Fieldset legend={t('productAdmin.basicInfo')}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            <Input label={t('product.nameEn')} name="name_en" value={product.name_en} onChange={handleProductChange} required />
                            <Input label={t('product.nameAr')} name="name_ar" value={product.name_ar} onChange={handleProductChange} dir="rtl" />
                            <Textarea label={t('product.descriptionEn')} name="description_en" value={product.description_en} onChange={handleProductChange} className="md:col-span-2" />
                            <Textarea label={t('product.descriptionAr')} name="description_ar" value={product.description_ar} onChange={handleProductChange} dir="rtl" className="md:col-span-2" />
                            <Input label={t('product.basePrice')} name="basePrice" type="number" value={product.basePrice} onChange={handleProductChange} required />
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('product.mainImage')}</label>
                                <div className="flex items-center gap-4">
                                    <ImagePreview src={mainImageUrl} onRemove={handleRemoveMainImage} />
                                    <ImageUploader id="main-image-upload" onChange={handleMainImageSelect} t={t} />
                                </div>
                            </div>
                            <Select label={t('product.category')} name="category" value={product.category} onChange={handleProductChange} required>
                                <option value="">{t('forms.select')}</option>
                                {categories.map(c => <option key={c._id} value={c._id}>{getDisplayName(c)}</option>)}
                            </Select>
                            <Select label={t('product.subCategory')} name="subCategoryName" value={product.subCategoryName} onChange={handleProductChange} disabled={!selectedCategoryData?.subCategories?.length}>
                                <option value="">{t('forms.select')}</option>
                                {selectedCategoryData?.subCategories?.map(sc => <option key={sc._id} value={getDisplayName(sc)}>{getDisplayName(sc)}</option>)}
                            </Select>
                        </div>
                    </Fieldset>
                    
                    {/* ✅✅✅ LOGIC IS PRESERVED: Attributes Section ✅✅✅ */}
                    <Fieldset legend={t('productAdmin.fixedAttributes')}>
                        <div className="space-y-3">
                        {attributes.map((attr, index) => (
                            <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
                                <Input placeholder={t('product.attrNameEn')} value={attr.key_en} onChange={e => handleAttributeChange(index, 'key_en', e.target.value)} className="lg:col-span-1"/>
                                <Input placeholder={t('product.attrNameAr')} value={attr.key_ar} onChange={e => handleAttributeChange(index, 'key_ar', e.target.value)} dir="rtl" className="lg:col-span-1"/>
                                <Input placeholder={t('product.attrValueEn')} value={attr.value_en} onChange={e => handleAttributeChange(index, 'value_en', e.target.value)} className="lg:col-span-1"/>
                                <Input placeholder={t('product.attrValueAr')} value={attr.value_ar} onChange={e => handleAttributeChange(index, 'value_ar', e.target.value)} dir="rtl" className="lg:col-span-1"/>
                                <button type="button" onClick={() => removeAttribute(index)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 justify-self-end lg:justify-self-center">
                                    <Trash2 size={18}/>
                                </button>
                            </div>
                        ))}
                        </div>
                        <button type="button" onClick={addAttribute} className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-semibold mt-4">
                            <PlusCircle size={16}/>{t('productAdmin.addAttribute')}
                        </button>
                    </Fieldset>

                    <Fieldset legend={t('productAdmin.productVariations')}>
                        <div className="space-y-4">
                        {variations.map((v, vIndex) => (
                            <div key={v.tempId} className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800/50 space-y-4">
                                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-slate-700">
                                    <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200">{t('productAdmin.variationGroup')} #{vIndex + 1}</h4>
                                    <button type="button" onClick={() => removeVariation(vIndex)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"><Trash2 /></button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input placeholder={t('product.varNameEn')} value={v.name_en} onChange={e => handleVariationNameChange(vIndex, 'en', e.target.value)} />
                                    <Input placeholder={t('product.varNameAr')} value={v.name_ar} onChange={e => handleVariationNameChange(vIndex, 'ar', e.target.value)} dir="rtl"/>
                                </div>
                                <div className="space-y-3 pt-2">
                                    <h5 className="font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                        <ChevronsRight size={18} className="text-indigo-400"/>
                                        {t('productAdmin.optionsFor')} "{v.name_en || '...'}"
                                    </h5>
                                    {v.options.map((opt, oIndex) => (
                                        <div key={opt.tempId} className="p-4 pl-6 border-l-4 border-indigo-500 rounded-r-lg bg-white dark:bg-slate-800 space-y-4 shadow-sm">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
                                                    <Input placeholder={t('product.optionNameEn')} value={opt.name_en} onChange={e => handleOptionNameChange(vIndex, oIndex, 'en', e.target.value)} />
                                                    <Input placeholder={t('product.optionNameAr')} value={opt.name_ar} onChange={e => handleOptionNameChange(vIndex, oIndex, 'ar', e.target.value)} dir="rtl"/>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <input type="file" id={`option-img-${vIndex}-${oIndex}`} onChange={e => handleOptionImageChange(vIndex, oIndex, e.target.files[0])} className="hidden"/>
                                                    <label htmlFor={`option-img-${vIndex}-${oIndex}`} className="cursor-pointer text-sm text-blue-600 dark:text-blue-400 hover:underline">{t('forms.changeImage')}</label>
                                                    <button type="button" onClick={() => removeOption(vIndex, oIndex)} className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/50"><Trash2 size={16}/></button>
                                                </div>
                                            </div>
                                            <div className="pl-4 mt-2 space-y-3">
                                                <h6 className="text-sm font-semibold text-gray-500 dark:text-gray-400">SKUs for "{opt.name_en || 'this option'}"</h6>
                                                {opt.skus.map((sku, sIndex) => (
                                                    <div key={sIndex} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                                                        <Input placeholder="SKU Name (EN)" value={sku.name_en} onChange={e => handleSkuChange(vIndex, oIndex, sIndex, 'name_en', e.target.value)} />
                                                        <Input placeholder="اسم SKU (AR)" value={sku.name_ar} onChange={e => handleSkuChange(vIndex, oIndex, sIndex, 'name_ar', e.target.value)} dir="rtl" />
                                                        <Input type="number" placeholder="Price" value={sku.price} onChange={e => handleSkuChange(vIndex, oIndex, sIndex, 'price', e.target.value)} />
                                                        <Input type="number" placeholder="Stock" value={sku.stock} onChange={e => handleSkuChange(vIndex, oIndex, sIndex, 'stock', e.target.value)} />
                                                        <div className="flex items-center">
                                                            <Input type="text" placeholder="SKU ID" value={sku.sku} onChange={e => handleSkuChange(vIndex, oIndex, sIndex, 'sku', e.target.value)} />
                                                            <button type="button" onClick={() => removeSku(vIndex, oIndex, sIndex)} className="text-red-400 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/50 ml-2"><Trash2 size={16}/></button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button type="button" onClick={() => addSkuToOption(vIndex, oIndex)} className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-semibold"><PlusCircle size={14}/>Add SKU</button>
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addOptionToVariation(vIndex)} className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-800 dark:hover:text-indigo-300">
                                        <PlusCircle size={16}/>{t('productAdmin.addOption')}
                                    </button>
                                </div>
                            </div>
                        ))}
                        </div>
                        <button type="button" onClick={addVariation} className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-semibold mt-4 hover:text-indigo-800 dark:hover:text-indigo-300">
                            <PlusCircle size={18}/>{t('productAdmin.addVariationGroup')}
                        </button>
                    </Fieldset>
                </form>

                <footer className="flex-shrink-0 flex justify-end gap-4 p-4 mt-auto border-t border-gray-200 dark:border-slate-700">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                        {t('actions.cancel')}
                    </button>
                    <button type="submit" form="add-product-form" disabled={isSubmitting} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-indigo-500/30">
                        {isSubmitting ? t('actions.saving') : t('actions.saveProduct')}
                    </button>
                </footer>
            </div>
        </div>
    );
};

// Reusable Helper Components
const Fieldset = ({ legend, children }) => (
    <fieldset className="border border-gray-200 dark:border-slate-700/50 p-4 sm:p-6 rounded-2xl">
        <legend className="px-3 text-lg font-semibold text-gray-800 dark:text-gray-200">{legend}</legend>
        <div className="mt-4">{children}</div>
    </fieldset>
);
const Input = ({ label, ...props }) => (
    <div>
        {label && <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>}
        <input {...props} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
    </div>
);
const Textarea = ({ label, ...props }) => (
    <div className={props.className}>
        {label && <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>}
        <textarea {...props} rows="3" className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
    </div>
);
const Select = ({ label, children, ...props }) => (
    <div>
        {label && <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>}
        <select {...props} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none bg-chevron-down">
            {children}
        </select>
    </div>
);
const ImagePreview = ({ src, onRemove }) => (
    src ? (
        <div className="relative group/image">
            <img src={src} alt="Preview" className="w-32 h-32 object-cover rounded-xl border-2 border-transparent group-hover/image:border-indigo-500 transition-all"/>
            <button type="button" onClick={onRemove} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 leading-none hover:bg-red-600 shadow-md opacity-0 group-hover/image:opacity-100 transition-opacity"><X size={14}/></button>
        </div>
    ) : (
        <div className="w-32 h-32 bg-gray-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
            <ImageIcon className="text-gray-400 dark:text-slate-500" size={48}/>
        </div>
    )
);
const ImageUploader = ({ id, onChange, t }) => (
    <label htmlFor={id} className="flex-1 cursor-pointer flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:border-indigo-500 transition-all">
        <UploadCloud size={32} className="text-gray-400 dark:text-slate-500 mb-2"/>
        <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold">{t('forms.uploadImage')}</span>
        <span className="text-xs text-gray-400 dark:text-slate-500 mt-1">{t('forms.dragOrClick')}</span>
        <input id={id} type="file" onChange={onChange} className="hidden"/>
    </label>
);

export default AddProductModal;