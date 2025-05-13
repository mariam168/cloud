import React, { useState, useEffect } from 'react';
import axios from 'axios';
const EditProductModal = ({ product, onClose, onProductUpdated, serverUrl }) => {
  const [editedProduct, setEditedProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (product) {
      setEditedProduct({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
      });
      setCurrentImageUrl(product.image ? `${serverUrl}${product.image}` : '');
    }
  }, [product, serverUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
    if (e.target.files[0]) {
        setCurrentImageUrl(URL.createObjectURL(e.target.files[0]));
    } else if (product && product.image) {
        setCurrentImageUrl(`${serverUrl}${product.image}`); 
    } else {
        setCurrentImageUrl('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    if (!editedProduct.name || !editedProduct.price) {
        setErrorMessage("اسم المنتج والسعر مطلوبان.");
        setIsSubmitting(false);
        return;
    }


    const formData = new FormData();
    formData.append('name', editedProduct.name);
    formData.append('description', editedProduct.description);
    formData.append('price', editedProduct.price);
    formData.append('category', editedProduct.category);
    if (imageFile) { 
      formData.append('image', imageFile);
    }

    try {
      const response = await axios.put(`${serverUrl}/api/product/${product._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onProductUpdated(response.data);
      alert("تم تحديث المنتج بنجاح!");
      onClose(); 
    } catch (err) {
      console.error("Error updating product:", err.response ? err.response.data : err.message);
      setErrorMessage("حدث خطأ أثناء تحديث المنتج: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">تعديل المنتج</h2>
        {errorMessage && <p className="text-red-500 bg-red-100 p-3 rounded mb-4 text-sm">{errorMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">اسم المنتج</label>
            <input
              type="text"
              id="edit-name"
              name="name"
              value={editedProduct.name}
              onChange={handleChange}
              className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">الوصف</label>
            <textarea
              id="edit-description"
              name="description"
              value={editedProduct.description}
              onChange={handleChange}
              rows="3"
              className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700">السعر</label>
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
            <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700">الفئة</label>
            <input
              type="text"
              id="edit-category"
              name="category"
              value={editedProduct.category}
              onChange={handleChange}
              className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="edit-image" className="block text-sm font-medium text-gray-700">صورة المنتج (اختياري لتغيير الصورة الحالية)</label>
            {currentImageUrl && (
                <img src={currentImageUrl} alt="Current product" className="mt-2 mb-2 w-32 h-32 object-cover rounded"/>
            )}
            <input
              type="file"
              id="edit-image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
              {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;