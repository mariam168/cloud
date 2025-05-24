import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import EditProductModal from './EditProductModal';
import AddProductPage from './AddProductPage';
import { useLanguage } from '../../LanguageContext';

const ProductList = () => {
    const { t, language } = useLanguage();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const SERVER_URL = 'http://localhost:5000';

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${SERVER_URL}/api/products`);
            setProducts(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError((t('general.errorFetchingProducts') || 'Error fetching products: ') + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (productId, productNames) => {
        const productName = productNames?.[language] || productNames?.en || productNames?.ar || t('general.unnamedProduct');
        // Using a custom modal/dialog instead of window.confirm for better UX in Canvas
        const confirmDelete = window.confirm(t('adminProduct.confirmDelete', productName)); // Replace with your custom modal logic
        if (confirmDelete) {
            try {
                await axios.delete(`${SERVER_URL}/api/product/${productId}`);
                setProducts(prev => prev.filter(p => p._id !== productId));
                alert(t('adminProduct.deleteSuccess') || 'Product deleted successfully!'); // Replace with custom success message UI
            } catch (err) {
                console.error('Error deleting product:', err);
                alert((t('adminProduct.errorDeletingProduct') || 'An error occurred while deleting the product.') + (err.response?.data?.message || err.message)); // Replace with custom error message UI
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

    if (loading) return <p className="text-center">{t('general.loading') || 'Loading...'}</p>;
    if (error) return <p className="text-center text-red-600">{error}</p>;

    return (
        <div className="max-w-7xl mx-auto p-4 bg-gray-50 dark:bg-gray-900 min-h-screen rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t('productAdmin.productListTitle') || 'Product List'}</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors duration-200 shadow-md"
                >
                    <FaPlus /> {t('productAdmin.addProductButton') || 'Add Product'}
                </button>
            </div>
            {products.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">{t('productAdmin.noProducts') || 'No products to display currently.'}</p>
            ) : (
                <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
                        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                            <tr>
                                <th className="px-4 py-3">{t('productAdmin.imageTable') || 'Image'}</th>
                                <th className="px-4 py-3">{t('productAdmin.nameTable') || 'Name'}</th>
                                <th className="px-4 py-3">{t('productAdmin.descriptionTable') || 'Description'}</th>
                                <th className="px-4 py-3">{t('productAdmin.categoryTable') || 'Category'}</th>
                                <th className="px-4 py-3">{t('productAdmin.subCategoryTable') || 'Sub-Category'}</th> {/* New header */}
                                <th className="px-4 py-3">{t('productAdmin.priceTable') || 'Price'}</th>
                                <th className="px-4 py-3 text-center">{t('productAdmin.actionsTable') || 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product._id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-4 py-3">
                                        <img
                                            src={
                                                product.image
                                                    ? `${SERVER_URL}${product.image}`
                                                    : 'https://placehold.co/80x80/E0E0E0/333333?text=No+Image' // Placeholder for no image
                                            }
                                            alt={product.name?.[language] || product.name?.en || product.name?.ar || t('general.unnamedProduct')}
                                            className="w-16 h-16 object-cover rounded border border-gray-200 dark:border-gray-600"
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/80x80/E0E0E0/333333?text=No+Image'; }} // Fallback on error
                                        />
                                    </td>
                                    <td className="px-4 py-3 font-semibold">
                                        {product.name?.[language] || product.name?.en || product.name?.ar || t('general.unnamedProduct')}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                        {product.description?.[language] || product.description?.en || product.description?.ar || t('productAdmin.noDescription') || 'No Description'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-indigo-100 px-2 py-1 rounded-full text-xs font-medium">
                                            {product.category || t('productAdmin.uncategorized') || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="bg-purple-100 text-purple-700 dark:bg-purple-700 dark:text-purple-100 px-2 py-1 rounded-full text-xs font-medium">
                                            {product.subCategory || t('productAdmin.noSubCategory') || 'No Sub-Category'} {/* Display subCategory */}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-bold text-green-600 dark:text-green-400">{t('shopPage.currencySymbol') || "$"}{product.price?.toFixed(2) || '0.00'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => handleOpenEditModal(product)}
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mx-2 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                                            title={t('adminCategoryPage.editCategory') || 'Edit'}
                                        >
                                            <FaEdit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product._id, product.name)}
                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 mx-2 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                                            title={t('adminCategoryPage.deleteCategory') || 'Delete'}
                                        >
                                            <FaTrashAlt size={18} />
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg relative w-full max-w-xl max-h-[90vh] overflow-y-auto transform scale-95 md:scale-100 transition-transform duration-300">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-4 right-4 text-2xl font-bold text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                            &times;
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">{t('productAdmin.addProductTitle') || 'Add New Product'}</h2>
                        <AddProductPage onProductAdded={handleProductAdded} serverUrl={SERVER_URL} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;
