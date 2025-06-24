import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import EditProductModal from './EditProductModal';
import AddProductModal from './AddProductModal';
import { useLanguage } from '../../LanguageContext';
import { Loader2, Info, Edit, Trash2, PlusCircle, Copy, CheckCircle, Image as ImageIcon, XCircle, Search } from 'lucide-react';

const ProductList = () => {
    const { t, language } = useLanguage();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const SERVER_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const headers = { 'x-admin-request': 'true' };
            const [productsResponse, categoriesResponse] = await Promise.all([
                axios.get(`${SERVER_URL}/api/products`, { headers }),
                axios.get(`${SERVER_URL}/api/categories`, { headers })
            ]);

            const categoriesMap = new Map(categoriesResponse.data.map(cat => [cat._id, cat]));
            const productsWithCategories = productsResponse.data.map(prod => ({
                ...prod,
                category: categoriesMap.get(prod.category) || prod.category
            }));

            setProducts(productsWithCategories);
            setFilteredProducts(productsWithCategories);
            setError(null);
        } catch (err) {
            setError(`${t('general.errorFetchingData') || 'Error fetching data'}: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    }, [t, SERVER_URL]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        const filteredData = products.filter(item =>
            (item.name?.en?.toLowerCase().includes(lowercasedFilter)) ||
            (item.name?.ar?.toLowerCase().includes(lowercasedFilter))
        );
        setFilteredProducts(filteredData);
    }, [searchTerm, products]);
    
    const getDisplayName = (item) => {
        if (!item || !item.name) return '';
        if (typeof item.name === 'object') return item.name[language] || item.name.en || '';
        return item.name;
    };
    
    const getCategoryName = (product) => {
        if (!product?.category?.name) return t('productAdmin.uncategorized');
        return getDisplayName(product.category);
    };

    const handleDelete = async (productId, productName) => {
        if (window.confirm(t('productAdmin.confirmDelete', { productName: productName || 'this product' }))) {
            try {
                await axios.delete(`${SERVER_URL}/api/products/${productId}`);
                fetchProducts(); // Refetch to ensure data consistency
                alert(t('productAdmin.deleteSuccess'));
            } catch (err) {
                alert(`${t('productAdmin.deleteError')}: ${err.response?.data?.message || err.message}`);
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
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-96"><Loader2 size={48} className="animate-spin text-blue-500" /></div>;
    }

    if (error) {
        return <div className="p-6 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-3"><XCircle />{error}</div>;
    }

    return (
        <div className="p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700">
            <header className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-slate-700 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('adminProductsPage.productList')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {t('adminProductsPage.manageProductsMessage', { count: filteredProducts.length })}
                    </p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder={t('general.search') + '...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                        <PlusCircle size={20} />
                        <span className="hidden sm:inline">{t('productAdmin.addProductButton')}</span>
                    </button>
                </div>
            </header>

            {filteredProducts.length === 0 ? (
                <div className="text-center p-16 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                    <Info size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold">{t('productAdmin.noProducts')}</h3>
                    <p className="mt-1">{t('productAdmin.tryDifferentSearch')}</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-slate-700">
                            <tr>
                                <th className="p-4 text-left font-semibold text-gray-600 dark:text-gray-300"></th>
                                <th className="p-4 text-left font-semibold text-gray-600 dark:text-gray-300">{t('productAdmin.nameTable')}</th>
                                <th className="p-4 text-left font-semibold text-gray-600 dark:text-gray-300">{t('productAdmin.categoryTable')}</th>
                                <th className="p-4 text-left font-semibold text-gray-600 dark:text-gray-300">{t('productAdmin.priceTable')}</th>
                                <th className="p-4 text-center font-semibold text-gray-600 dark:text-gray-300">{t('productAdmin.actionsTable')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {filteredProducts.map(product => (
                                <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-150">
                                    <td className="p-4">
                                        {product.mainImage ? (
                                            <img src={`${SERVER_URL}${product.mainImage}`} alt={getDisplayName(product)} className="w-16 h-16 object-cover rounded-md border border-gray-200 dark:border-slate-600" />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded-md flex items-center justify-center">
                                                <ImageIcon className="text-gray-400" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{getDisplayName(product)}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="font-mono text-xs text-gray-500" title={product._id}>ID: ...{product._id.slice(-6)}</span>
                                            <button onClick={() => copyToClipboard(product._id)} className="text-gray-400 hover:text-blue-500">
                                                {copiedId === product._id ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300">{getCategoryName(product)}</td>
                                    <td className="p-4 font-semibold text-green-600 dark:text-green-400">{t('general.currencySymbol')}{product.basePrice?.toFixed(2)}</td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            <button onClick={() => handleOpenEditModal(product)} className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors" title={t('actions.edit')}>
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(product._id, getDisplayName(product))} className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors" title={t('actions.delete')}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
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