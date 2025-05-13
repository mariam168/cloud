import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import EditProductModal from './EditProductModal'; 
const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null); 
  const [showEditModal, setShowEditModal] = useState(false);

  const SERVER_URL = 'http://localhost:5000';

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${SERVER_URL}/api/products`);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err.response ? err.response.data : err.message);
      setError("حدث خطأ أثناء جلب المنتجات: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId, productName) => {
    if (window.confirm(`هل أنت متأكد أنك تريد حذف المنتج: "${productName}"؟`)) {
      try {
        await axios.delete(`${SERVER_URL}/api/product/${productId}`);
        setProducts(prevProducts => prevProducts.filter(p => p._id !== productId));
        alert("تم حذف المنتج بنجاح!");
      } catch (err) {
        console.error("Error deleting product:", err.response ? err.response.data : err.message);
        alert("حدث خطأ أثناء حذف المنتج: " + (err.response?.data?.message || err.message));
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

  const handleProductUpdated = (updatedProduct) => {
    setProducts(prevProducts =>
      prevProducts.map(p => (p._id === updatedProduct._id ? updatedProduct : p))
    );
    fetchProducts(); 
    handleCloseEditModal(); 
  };


  if (loading) {
    return <p className="text-center text-gray-600 text-lg">جاري تحميل المنتجات...</p>;
  }

  if (error) {
    return <p className="text-center text-red-600 text-lg p-4 bg-red-100 rounded-md">خطأ: {error}</p>;
  }

  if (products.length === 0) {
    return <p className="text-center text-gray-500 text-lg">لا توجد منتجات لعرضها حاليًا.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-700">قائمة المنتجات</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 flex flex-col">
            {product.image ? (
              <img
                src={`${SERVER_URL}${product.image}`}
                alt={product.name}
                className="w-full h-56 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x200.png?text=No+Image';
                  e.target.alt = 'Image not available';
                }}
              />
            ) : (
              <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">لا توجد صورة</span>
              </div>
            )}
            <div className="p-6 flex-grow flex flex-col">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-3 flex-grow">{product.description || "لا يوجد وصف متاح."}</p>
              {product.category && (
                <p className="text-xs text-indigo-600 bg-indigo-100 rounded-full px-3 py-1 self-start mb-3">
                  {product.category}
                </p>
              )}
              <p className="text-xl font-bold text-green-600 mt-auto">${product.price.toFixed(2)}</p>
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => handleOpenEditModal(product)}
                  className="text-blue-500 hover:text-blue-700 transition-colors"
                  aria-label="تعديل المنتج"
                >
                  <FaEdit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(product._id, product.name)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  aria-label="حذف المنتج"
                >
                  <FaTrashAlt size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showEditModal && editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={handleCloseEditModal}
          onProductUpdated={handleProductUpdated} 
          serverUrl={SERVER_URL}
        />
      )}
    </div>
  );
};

export default ProductList;





