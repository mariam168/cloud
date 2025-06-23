// components/Admin/ProductPage/ProductList.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import EditProductModal from './EditProductModal';
import AddProductModal from './AddProductModal';
import { useLanguage } from '../../LanguageContext';
import { Loader2, Info, Edit, Trash2, PlusCircle, Copy, CheckCircle, Image as ImageIcon, XCircle } from 'lucide-react';

const ProductList = () => {
    const { t, language } = useLanguage();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const SERVER_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            // إرسال header مخصص لتجاوز middleware اللغة في الخلفية
            const response = await axios.get(`${SERVER_URL}/api/products`, {
                headers: {
                    'x-admin-request': 'true'
                }
            });
            // جلب الفئات مع بيانات اللغة الكاملة
            const categoriesResponse = await axios.get(`${SERVER_URL}/api/categories`, {
                headers: {
                    'x-admin-request': 'true'
                }
            });
            const categoriesMap = new Map(categoriesResponse.data.map(cat => [cat._id, cat]));

            // دمج بيانات الفئة مع المنتج
            const productsWithCategories = response.data.map(prod => ({
                ...prod,
                category: categoriesMap.get(prod.category) || prod.category
            }));

            setProducts(productsWithCategories);
            setError(null);
        } catch (err) {
            setError((t('general.errorFetchingData') || 'Error fetching products: ') + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    }, [t, SERVER_URL]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // ✅ دالة آمنة ومحسنة للتعامل مع الأسماء
    const getDisplayName = (product) => {
        if (!product || !product.name) return ''; // حماية من null أو undefined
        
        // إذا كان الاسم كائن
        if (typeof product.name === 'object' && product.name !== null) {
            return product.name[language] || product.name.en || '';
        }
        
        // إذا كان الاسم نصاً عادياً (للبيانات القديمة)
        return product.name;
    };
    
    // ✅ دالة آمنة ومحسنة للتعامل مع أسماء الفئات
    const getCategoryName = (product) => {
        if (!product || !product.category) return t('productAdmin.uncategorized');
        
        // إذا كانت الفئة كائن populated
        if (typeof product.category.name === 'object' && product.category.name !== null) {
            return product.category.name[language] || product.category.name.en || '';
        }
        
        // إذا كان اسم الفئة نصاً عادياً
        return product.category.name || t('productAdmin.uncategorized');
    };

    const handleDelete = async (productId, productName) => {
        const confirmDelete = window.confirm(t('productAdmin.confirmDelete', { productName: productName || t('general.unnamedProduct') }));
        if (confirmDelete) {
            try {
                await axios.delete(`${SERVER_URL}/api/products/${productId}`);
                setProducts(prev => prev.filter(p => p._id !== productId));
                alert(t('productAdmin.deleteSuccess'));
            } catch (err) {
                alert((t('productAdmin.deleteError') || 'An error occurred while deleting the product.') + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleOpenEditModal = (product) => {
        setEditingProduct(product);
        setShowEditModal(true);
    };

    const handleActionSuccess = () => {
        fetchProducts();
        setShowEditModal(false);
        setShowAddModal(false);
        setEditingProduct(null);
    };

    const copyToClipboard = (id) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 size={48} className="animate-spin text-blue-500" /></div>;
    if (error) return <div className="p-6 bg-red-100 text-red-700 rounded-lg"><XCircle className="inline mr-2" />{error}</div>;

    return (
        <div className="p-4 bg-white rounded-xl shadow-lg border">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h2 className="text-2xl font-bold text-gray-800">{t('adminProductsPage.productList')}</h2>
                <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md">
                    <PlusCircle size={20} /> {t('productAdmin.addProductButton')}
                </button>
            </div>

            {products.length === 0 ? (
                <div className="text-center p-10 text-gray-500"><Info size={48} className="mx-auto mb-4" /><p>{t('productAdmin.noProducts')}</p></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left font-semibold text-gray-600">ID</th>
                                <th className="p-3 text-left font-semibold text-gray-600">{t('productAdmin.imageTable')}</th>
                                <th className="p-3 text-left font-semibold text-gray-600">{t('productAdmin.nameTable')}</th>
                                <th className="p-3 text-left font-semibold text-gray-600">{t('productAdmin.categoryTable')}</th>
                                <th className="p-3 text-left font-semibold text-gray-600">{t('productAdmin.priceTable')}</th>
                                <th className="p-3 text-center font-semibold text-gray-600">{t('productAdmin.actionsTable')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products.map(product => (
                                <tr key={product._id} className="hover:bg-gray-50">
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs text-gray-500" title={product._id}>...{product._id.slice(-6)}</span>
                                            <button onClick={() => copyToClipboard(product._id)} className="text-gray-400 hover:text-gray-600">
                                                {copiedId === product._id ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        {product.mainImage ? <img src={`${SERVER_URL}${product.mainImage}`} alt={getDisplayName(product)} className="w-16 h-16 object-cover rounded-lg border"/> : <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center"><ImageIcon className="text-gray-400"/></div>}
                                    </td>
                                    {/* ✅ الإصلاح الرئيسي هنا */}
                                    <td className="p-3 font-medium text-gray-800">{getDisplayName(product)}</td>
                                    <td className="p-3 text-gray-600">{getCategoryName(product)}</td>
                                    <td className="p-3 font-bold text-green-600">{t('general.currencySymbol')}{product.basePrice?.toFixed(2)}</td>
                                    <td className="p-3 text-center">
                                        <button onClick={() => handleOpenEditModal(product)} className="text-blue-600 p-2 rounded-full hover:bg-blue-50"><Edit size={18} /></button>
                                        <button onClick={() => handleDelete(product._id, getDisplayName(product))} className="text-red-600 p-2 rounded-full hover:bg-red-50 ml-2"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {showEditModal && editingProduct && (
                <EditProductModal product={editingProduct} onClose={() => setShowEditModal(false)} onProductUpdated={handleActionSuccess} serverUrl={SERVER_URL} />
            )}
            
            {showAddModal && (
                <AddProductModal onClose={() => setShowAddModal(false)} onProductAdded={handleActionSuccess} serverUrl={SERVER_URL} />
            )}
        </div>
    );
};

export default ProductList;