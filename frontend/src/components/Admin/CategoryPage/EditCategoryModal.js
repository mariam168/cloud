// frontend/src/components/EditCategoryModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditCategoryModal = ({ category, onClose, onCategoryUpdated, serverUrl }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setDescription(category.description || '');
    }
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("اسم الفئة مطلوب.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await axios.put(`${serverUrl}/api/categories/${category._id}`, { name, description });
      alert("تم تحديث الفئة بنجاح!");
      if (onCategoryUpdated) {
        onCategoryUpdated();
      }
      onClose();
    } catch (err) {
      console.error("Error updating category:", err.response ? err.response.data : err.message);
      setErrorMessage(err.response?.data?.message || "حدث خطأ أثناء تحديث الفئة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!category) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold mb-6 text-center text-gray-700">تعديل الفئة</h3>
        {errorMessage && <p className="text-red-500 bg-red-100 p-3 rounded mb-4 text-sm">{errorMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="edit-category-name" className="block text-sm font-medium text-gray-700 mb-1">
              اسم الفئة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="edit-category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
          <div>
            <label htmlFor="edit-category-description" className="block text-sm font-medium text-gray-700 mb-1">
              الوصف (اختياري)
            </label>
            <textarea
              id="edit-category-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400"
            >
              {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategoryModal;