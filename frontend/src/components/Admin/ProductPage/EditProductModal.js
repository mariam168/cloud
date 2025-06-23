// components/Admin/ProductPage/EditProductModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../LanguageContext';
import { X, PlusCircle, Trash2 } from 'lucide-react';

const EditProductModal = ({ product, onClose, onProductUpdated, serverUrl }) => {
    const { t } = useLanguage();
    const [editedProduct, setEditedProduct] = useState({ name_en: '', name_ar: '', description_en: '', description_ar: '', basePrice: '', category: '', subCategoryName: '' });
    const [attributes, setAttributes] = useState([]);
    const [variations, setVariations] = useState([]);
    const [mainImageFile, setMainImageFile] = useState(null);
    const [currentMainImageUrl, setCurrentMainImageUrl] = useState('');
    const [clearMainImage, setClearMainImage] = useState(false);
    const [optionImageFiles, setOptionImageFiles] = useState({});
    const [categories, setCategories] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // ✅ مصحح: إضافة هيدر لضمان الحصول على بيانات اللغة كاملة
        axios.get(`${serverUrl}/api/categories`, {
            headers: { 'x-admin-request': 'true' }
        }).then(res => setCategories(res.data));
    }, [serverUrl]);
    
    // ✅✅✅ الإصلاح الرئيسي هنا: تعبئة النموذج من كائن المنتج المعقد
    useEffect(() => {
        if (product) {
            // التعامل مع الاسم سواء كان كائن أو نص عادي (للتوافقية)
            const nameEn = typeof product.name === 'object' && product.name !== null ? product.name.en || '' : product.name || '';
            const nameAr = typeof product.name === 'object' && product.name !== null ? product.name.ar || '' : '';
            
            // التعامل مع الوصف بنفس الطريقة
            const descEn = typeof product.description === 'object' && product.description !== null ? product.description.en || '' : product.description || '';
            const descAr = typeof product.description === 'object' && product.description !== null ? product.description.ar || '' : '';

            setEditedProduct({
                name_en: nameEn,
                name_ar: nameAr,
                description_en: descEn,
                description_ar: descAr,
                basePrice: product.basePrice || '',
                // التعامل مع الفئة سواء كانت ID أو كائن populated
                category: product.category?._id || product.category || '',
                subCategoryName: product.subCategoryName || '',
            });
            
            // تحويل nested attributes & variations إلى حالة يمكن التعامل معها
            setAttributes(product.attributes ? JSON.parse(JSON.stringify(product.attributes)) : []);
            setVariations(product.variations ? JSON.parse(JSON.stringify(product.variations.map(v => ({...v, tempId: v._id, options: v.options.map(o => ({...o, tempId: o._id}))})))) : []);
            
            setCurrentMainImageUrl(product.mainImage ? `${serverUrl}${product.mainImage}` : '');
            
            // إعادة تعيين الملفات عند فتح النموذج
            setMainImageFile(null);
            setClearMainImage(false);
            setOptionImageFiles({});
        }
    }, [product, serverUrl]);

    const handleProductChange = (e) => setEditedProduct(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleMainImageSelect = (e) => { const file = e.target.files[0]; if (file) { setMainImageFile(file); setCurrentMainImageUrl(URL.createObjectURL(file)); setClearMainImage(false); } };
    const handleRemoveMainImage = () => { setMainImageFile(null); setCurrentMainImageUrl(''); setClearMainImage(true); };
    const addAttribute = () => setAttributes(prev => [...prev, { key_en: '', key_ar: '', value_en: '', value_ar: '' }]);
    const removeAttribute = (index) => setAttributes(prev => prev.filter((_, i) => i !== index));
    const handleAttributeChange = (index, field, value) => setAttributes(prev => prev.map((attr, i) => (i === index ? { ...attr, [field]: value } : attr)));
    const addVariation = () => setVariations(prev => [...prev, { tempId: `var_${Date.now()}`, name_en: '', name_ar: '', options: [] }]);
    const removeVariation = (vIndex) => setVariations(prev => prev.filter((_, i) => i !== vIndex));
    const handleVariationNameChange = (vIndex, lang, value) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, [`name_${lang}`]: value } : v)));
    const addOptionToVariation = (vIndex) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, options: [...v.options, { tempId: `opt_${Date.now()}`, name_en: '', name_ar: '', skus: [] }] } : v)));
    const removeOption = (vIndex, oIndex) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, options: v.options.filter((_, j) => j !== oIndex) } : v)));
    const handleOptionNameChange = (vIndex, oIndex, lang, value) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, options: v.options.map((o, j) => (j === oIndex ? { ...o, [`name_${lang}`]: value } : o)) } : v)));
    const handleOptionImageChange = (vIndex, oIndex, file) => setOptionImageFiles(prev => ({ ...prev, [`variationImage_${vIndex}_${oIndex}`]: file }));
    const addSkuToOption = (vIndex, oIndex) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, options: v.options.map((o, j) => (j === oIndex ? { ...o, skus: [...o.skus, { name_en: '', name_ar: '', price: editedProduct.basePrice, stock: 0, sku: '' }] } : o)) } : v)));
    const removeSku = (vIndex, oIndex, sIndex) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, options: v.options.map((o, j) => (j === oIndex ? { ...o, skus: o.skus.filter((_, k) => k !== sIndex) } : o)) } : v)));
    const handleSkuChange = (vIndex, oIndex, sIndex, field, value) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, options: v.options.map((o, j) => (j === oIndex ? { ...o, skus: o.skus.map((s, k) => (k === sIndex ? { ...s, [field]: value } : s)) } : o)) } : v)));
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');
        const formData = new FormData();
        Object.entries(editedProduct).forEach(([key, value]) => formData.append(key, value));
        if (mainImageFile) formData.append('mainImage', mainImageFile);
        formData.append('clearMainImage', String(clearMainImage));
        formData.append('attributes', JSON.stringify(attributes));
        const finalVariations = variations.map((v, vIndex) => ({
            _id: v._id, name_en: v.name_en, name_ar: v.name_ar,
            options: v.options.map((o, oIndex) => {
                const imageFile = optionImageFiles[`variationImage_${vIndex}_${oIndex}`];
                const cleanOption = { _id: o._id, name_en: o.name_en, name_ar: o.name_ar, image: o.image, skus: o.skus.map(s => ({...s, sku: s.sku || null})) };
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
            await axios.put(`${serverUrl}/api/products/${product._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            onProductUpdated();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "An unknown error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedCategory = categories.find(c => c._id === editedProduct.category);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">{t('productAdmin.editProductTitle')}</h2>
                    <button onClick={onClose} className="p-2"><X size={24} /></button>
                </div>
                {errorMessage && <div className="p-3 bg-red-100 text-red-700 rounded-md mb-4">{errorMessage}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md">
                        <legend className="px-2 font-semibold text-gray-700">Basic Information</legend>
                        <div><label>Name (EN)</label><input name="name_en" value={editedProduct.name_en} onChange={handleProductChange} className="w-full p-2 border rounded mt-1" required /></div>
                        <div><label>Name (AR)</label><input name="name_ar" value={editedProduct.name_ar} onChange={handleProductChange} className="w-full p-2 border rounded mt-1 text-right" /></div>
                        <div className="md:col-span-2"><label>Description (EN)</label><textarea name="description_en" value={editedProduct.description_en} onChange={handleProductChange} className="w-full p-2 border rounded mt-1" rows="3"></textarea></div>
                        <div className="md:col-span-2"><label>Description (AR)</label><textarea name="description_ar" value={editedProduct.description_ar} onChange={handleProductChange} className="w-full p-2 border rounded mt-1 text-right" rows="3"></textarea></div>
                        <div><label>Base Price</label><input type="number" name="basePrice" value={editedProduct.basePrice} onChange={handleProductChange} className="w-full p-2 border rounded mt-1" required/></div>
                        <div>
                            <label>Main Image</label>
                            <div className="flex items-center gap-4 mt-1">
                                {currentMainImageUrl && (
                                    <div className="relative">
                                        <img src={currentMainImageUrl} alt="Preview" className="w-24 h-24 object-cover rounded-lg border"/>
                                        <button type="button" onClick={handleRemoveMainImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 leading-none hover:bg-red-600"><X size={14}/></button>
                                    </div>
                                )}
                                <input type="file" onChange={handleMainImageSelect} className="w-full"/>
                            </div>
                        </div>
                        <div>
                            <label>Category</label>
                            <select name="category" value={editedProduct.category} onChange={handleProductChange} className="w-full p-2 border rounded mt-1" required>
                                <option value="">Select</option>
                                {/* ✅ مصحح: عرض الاسم باللغة الإنجليزية */}
                                {categories.map(c => <option key={c._id} value={c._id}>{c.name?.en || c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label>Sub-Category</label>
                            <select name="subCategoryName" value={editedProduct.subCategoryName} onChange={handleProductChange} className="w-full p-2 border rounded mt-1" disabled={!selectedCategory}>
                                <option value="">Select</option>
                                {selectedCategory && selectedCategory.subCategories.map(sc => <option key={sc._id} value={sc.name?.en || sc.name}>{sc.name?.en || sc.name}</option>)}
                            </select>
                        </div>
                    </fieldset>
                    <fieldset className="border p-4 rounded-md space-y-4">
                        <legend className="px-2 font-semibold text-gray-700">Fixed Attributes</legend>
                        {attributes.map((attr, index) => (
                            <div key={index} className="grid grid-cols-1 lg:grid-cols-11 gap-2 items-center">
                                <input placeholder="Attribute Name (EN)" value={attr.key_en} onChange={e => handleAttributeChange(index, 'key_en', e.target.value)} className="p-2 border rounded lg:col-span-2"/>
                                <input placeholder="اسم الخاصية (AR)" value={attr.key_ar} onChange={e => handleAttributeChange(index, 'key_ar', e.target.value)} className="p-2 border rounded lg:col-span-2 text-right"/>
                                <input placeholder="Attribute Value (EN)" value={attr.value_en} onChange={e => handleAttributeChange(index, 'value_en', e.target.value)} className="p-2 border rounded lg:col-span-3"/>
                                <input placeholder="قيمة الخاصية (AR)" value={attr.value_ar} onChange={e => handleAttributeChange(index, 'value_ar', e.target.value)} className="p-2 border rounded lg:col-span-3 text-right"/>
                                <button type="button" onClick={() => removeAttribute(index)} className="text-red-500 p-2 rounded-full hover:bg-red-100 justify-self-end lg:justify-self-center"><Trash2 size={18}/></button>
                            </div>
                        ))}
                         <button type="button" onClick={addAttribute} className="flex items-center gap-2 text-sm text-blue-600 font-semibold"><PlusCircle size={16}/>Add Attribute</button>
                    </fieldset>
                    <fieldset className="border p-4 rounded-md space-y-4">
                        <legend className="px-2 font-semibold text-gray-700">Product Variations</legend>
                        {variations.map((v, vIndex) => (
                            <div key={v.tempId} className="p-4 border rounded-lg bg-gray-50 space-y-4">
                                <div className="flex justify-between items-center pb-2 border-b">
                                    <h4 className="font-semibold text-lg text-gray-800">Variation Group #{vIndex + 1}</h4>
                                    <button type="button" onClick={() => removeVariation(vIndex)}><Trash2 className="text-red-500"/></button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input placeholder="Variation Name (e.g. Color)" value={v.name_en} onChange={e => handleVariationNameChange(vIndex, 'en', e.target.value)} className="p-2 border rounded"/>
                                    <input placeholder="اسم المجموعة (مثال: اللون)" value={v.name_ar} onChange={e => handleVariationNameChange(vIndex, 'ar', e.target.value)} className="p-2 border rounded text-right"/>
                                </div>
                                <div className="space-y-3">
                                    <h5 className="font-medium text-gray-600">Options for "{v.name_en || 'this group'}"</h5>
                                    {v.options.map((opt, oIndex) => (
                                        <div key={opt.tempId} className="p-3 border rounded-md bg-white space-y-3">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-4 flex-grow">
                                                    <input placeholder="Option Name (e.g. Red)" value={opt.name_en} onChange={e => handleOptionNameChange(vIndex, oIndex, 'en', e.target.value)} className="p-2 border rounded w-full"/>
                                                    <input placeholder="اسم الخيار (مثال: أحمر)" value={opt.name_ar} onChange={e => handleOptionNameChange(vIndex, oIndex, 'ar', e.target.value)} className="p-2 border rounded w-full text-right"/>
                                                    <input type="file" onChange={e => handleOptionImageChange(vIndex, oIndex, e.target.files[0])} className="text-xs w-40"/>
                                                </div>
                                                <button type="button" onClick={() => removeOption(vIndex, oIndex)} className="ml-2"><Trash2 className="text-red-400" size={18}/></button>
                                            </div>
                                            <div className="pl-4 mt-2 space-y-2">
                                                <h6 className="text-sm font-semibold text-gray-500">SKUs for "{opt.name_en || 'this option'}"</h6>
                                                {opt.skus.map((sku, sIndex) => (
                                                     <div key={sku._id || sIndex} className="grid grid-cols-1 md:grid-cols-11 gap-2 items-center">
                                                        <input placeholder="SKU Name (EN)" value={sku.name_en} onChange={e => handleSkuChange(vIndex, oIndex, sIndex, 'name_en', e.target.value)} className="p-2 border rounded col-span-2"/>
                                                        <input placeholder="اسم SKU (AR)" value={sku.name_ar} onChange={e => handleSkuChange(vIndex, oIndex, sIndex, 'name_ar', e.target.value)} className="p-2 border rounded text-right col-span-2"/>
                                                        <input type="number" placeholder="Price" value={sku.price} onChange={e => handleSkuChange(vIndex, oIndex, sIndex, 'price', e.target.value)} className="p-2 border rounded col-span-2"/>
                                                        <input type="number" placeholder="Stock" value={sku.stock} onChange={e => handleSkuChange(vIndex, oIndex, sIndex, 'stock', e.target.value)} className="p-2 border rounded col-span-2"/>
                                                        <input type="text" placeholder="SKU (Unique ID)" value={sku.sku} onChange={e => handleSkuChange(vIndex, oIndex, sIndex, 'sku', e.target.value)} className="p-2 border rounded col-span-2"/>
                                                        <button type="button" onClick={() => removeSku(vIndex, oIndex, sIndex)} className="text-red-400 p-2 rounded-full hover:bg-red-50 justify-self-center"><Trash2 size={16}/></button>
                                                    </div>
                                                ))}
                                                <button type="button" onClick={() => addSkuToOption(vIndex, oIndex)} className="flex items-center gap-2 text-xs text-blue-600"><PlusCircle size={14}/>Add SKU</button>
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addOptionToVariation(vIndex)} className="flex items-center gap-2 text-sm text-blue-600 font-semibold"><PlusCircle size={16}/>Add Option</button>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={addVariation} className="flex items-center gap-2 text-sm text-blue-600 font-semibold"><PlusCircle size={16}/>Add Variation Group</button>
                    </fieldset>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-indigo-600 text-white rounded">{isSubmitting ? "Saving..." : "Save Changes"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProductModal;