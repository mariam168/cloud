import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import EditProductModal from './EditProductModal';
import AddProductPage from './AddProductPage';
import { useLanguage } from '../../LanguageContext';
// ** التغيير هنا: تمت إضافة CheckCircle و Copy إلى قائمة الاستيراد **
import { Loader2, Info, Edit, Trash2, PlusCircle, XCircle, X, Copy, CheckCircle } from 'lucide-react';

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
            const response = await axios.get(`${SERVER_URL}/api/products`);
            setProducts(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError((t('general.errorFetchingData') || 'Error fetching products: ') + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    }, [t, SERVER_URL]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleDelete = async (productId, productNames) => {
        const productName = productNames?.[language] || productNames?.en || productNames?.ar || t('general.unnamedProduct');
        const confirmDelete = window.confirm(t('productAdmin.confirmDelete', { productName: productName }));
        if (confirmDelete) {
            try {
                await axios.delete(`${SERVER_URL}/api/product/${productId}`);
                setProducts(prev => prev.filter(p => p._id !== productId));
                alert(t('productAdmin.deleteSuccess') || 'Product deleted successfully!');
            } catch (err) {
                console.error('Error deleting product:', err);
                alert((t('productAdmin.deleteError') || 'An error occurred while deleting the product.') + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleOpenEditModal = (product) => {
        setEditingProduct(product);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingProduct(null);
    };

    const handleProductUpdated = () => {
        fetchProducts();
        handleCloseEditModal();
    };

    const handleProductAdded = () => {
        fetchProducts();
        setShowAddModal(false);
    };

    const copyToClipboard = (id) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-xl font-semibold text-gray-700 dark:text-gray-300 py-8">
            <Loader2 size={48} className="text-blue-500 dark:text-blue-400 animate-spin mb-4" />
            <span className="text-lg">{t('general.loading')}</span>
        </div>
    );
    
    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg shadow-sm border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 py-8">
            <XCircle size={48} className="mb-4" />
            <p className="text-lg font-medium">{t('general.error')}: {error}</p>
        </div>
    );

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {t('adminProductsPage.productList')}
                </h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <PlusCircle size={20} /> {t('productAdmin.addProductButton')}
                </button>
            </div>

            {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-10 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">
                    <Info size={48} className="mb-4 text-gray-400 dark:text-gray-500" />
                    <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">{t('productAdmin.noProducts')}</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <table className="min-w-full text-sm text-gray-700 dark:text-gray-300 divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('productAdmin.imageTable')}</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('productAdmin.nameTable')}</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('productAdmin.categoryTable')}</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('productAdmin.priceTable')}</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('productAdmin.actionsTable')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {products.map(product => (
                                <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span 
                                                className="font-mono text-xs text-gray-500 dark:text-gray-400 cursor-pointer"
                                                title={product._id}
                                            >
                                                ...{product._id.slice(-6)}
                                            </span>
                                            <button 
                                                onClick={() => copyToClipboard(product._id)}
                                                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                                title={t('general.copyId') || 'Copy ID'}
                                            >
                                                {copiedId === product._id ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <img
                                            src={product.mainImage ? `${SERVER_URL}${product.mainImage}` : '/images/placeholder-product-image.png'}
                                            alt={product.name?.[language] || product.name?.en || t('general.unnamedProduct')}
                                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
                                            onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-product-image.png'; }}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-white">
                                        {product.name?.[language] || product.name?.en || t('general.unnamedProduct')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2.5 py-0.5 rounded-full text-xs font-medium">
                                            {product.category || t('productAdmin.uncategorized')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600 dark:text-green-400">
                                        {t('general.currencySymbol')}{product.price?.toFixed(2) || '0.00'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button
                                            onClick={() => handleOpenEditModal(product)}
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mx-1 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                            title={t('adminCategoryPage.editCategory') || 'Edit'}
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product._id, product.name)}
                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 mx-1 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            title={t('adminCategoryPage.deleteCategory') || 'Delete'}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {showEditModal && editingProduct && (
                <EditProductModal
                    product={editingProduct}
                    onClose={handleCloseEditModal}
                    onProductUpdated={handleProductUpdated}
                    serverUrl={SERVER_URL}
                />
            )}
            
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl relative w-full max-w-xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('productAdmin.addNewProduct')}</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                aria-label={t('general.close')}
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <AddProductPage onProductAdded={handleProductAdded} serverUrl={SERVER_URL} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;