import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import EditProductModal from './EditProductModal';
import AddProductPage from './AddProductPage';
import { useLanguage } from '../../LanguageContext';

const ProductList = () => {
  const { t } = useLanguage();

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
      setError(t.errorFetchingProducts + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId, productName) => {
    if (window.confirm(`${t.confirmDelete} "${productName}"?`)) {
      try {
        await axios.delete(`${SERVER_URL}/api/product/${productId}`);
        setProducts(prev => prev.filter(p => p._id !== productId));
        alert(t.productDeleted);
      } catch (err) {
        alert(t.errorDeletingProduct + (err.response?.data?.message || err.message));
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

  if (loading) return <p className="text-center">{t.loading}</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{t.productListTitle}</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700"
        >
          <FaPlus /> {t.addProduct || 'Add Product'}
        </button>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-500 text-center">{t.noProducts}</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3">{t.image}</th>
                <th className="px-4 py-3">{t.name}</th>
                <th className="px-4 py-3">{t.description}</th>
                <th className="px-4 py-3">{t.category}</th>
                <th className="px-4 py-3">{t.price}</th>
                <th className="px-4 py-3 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id} className="border-t">
                  <td className="px-4 py-3">
                    <img
                      src={
                        product.image
                          ? `${SERVER_URL}${product.image}`
                          : 'https://via.placeholder.com/80x80?text=No+Image'
                      }
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded border"
                    />
                  </td>
                  <td className="px-4 py-3 font-semibold">{product.name}</td>
                  <td className="px-4 py-3">{product.description || t.noDescription}</td>
                  <td className="px-4 py-3">
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs">
                      {product.category || t.uncategorized}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-green-600">${product.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleOpenEditModal(product)}
                      className="text-blue-600 hover:text-blue-800 mx-2"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id, product.name)}
                      className="text-red-600 hover:text-red-800 mx-2"
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={handleCloseEditModal}
          onProductUpdated={handleProductUpdated}
          serverUrl={SERVER_URL}
        />
      )}

      {/* Add Modal */}
      {showAddModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-xl">
      <button
        onClick={() => setShowAddModal(false)}
        className="absolute top-2 right-4 text-xl font-bold text-gray-600 hover:text-red-600"
      >
        &times;
      </button>
      <AddProductPage onProductAdded={handleProductAdded} />
    </div>
  </div>
)}

    </div>
  );
};

export default ProductList;
