import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import EditCategoryModal from './EditCategoryModal';

const CategoryList = ({ refreshTrigger, serverUrl, onCategoryAction }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${serverUrl}/api/categories`);
      setCategories(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching categories:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || "حدث خطأ أثناء جلب الفئات.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [refreshTrigger, serverUrl]);

  const handleDelete = async (categoryId, categoryName) => {
    if (window.confirm(`هل أنت متأكد أنك تريد حذف الفئة: "${categoryName}"؟`)) {
      try {
        await axios.delete(`${serverUrl}/api/categories/${categoryId}`);
        alert("تم حذف الفئة بنجاح!");
        if (onCategoryAction) onCategoryAction(); 
        else fetchCategories(); 
      } catch (err) {
        console.error("Error deleting category:", err.response ? err.response.data : err.message);
        alert(err.response?.data?.message || "حدث خطأ أثناء حذف الفئة.");
      }
    }
  };

  const handleOpenEditModal = (category) => {
    setEditingCategory(category);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingCategory(null);
  };

  const handleCategoryUpdated = () => {
    if (onCategoryAction) onCategoryAction(); 
    else fetchCategories(); 
    handleCloseEditModal();
  };

  if (loading) return <p className="text-center text-gray-600 text-lg py-5">جاري تحميل الفئات...</p>;
  if (error) return <p className="text-center text-red-600 text-lg p-4 bg-red-100 rounded-md py-5">خطأ: {error}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h3 className="text-2xl font-bold text-center mb-8 text-gray-700">قائمة الفئات</h3>
      {categories.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">لا توجد فئات لعرضها حاليًا.</p>
      ) : (
        <ul className="bg-white shadow-lg rounded-lg divide-y divide-gray-200">
          {categories.map(category => (
            <li key={category._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p className="text-lg font-medium text-purple-700">{category.name}</p>
                {category.description && <p className="text-sm text-gray-500">{category.description}</p>}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleOpenEditModal(category)}
                  className="text-blue-500 hover:text-blue-700 transition-colors"
                  aria-label="تعديل الفئة"
                >
                  <FaEdit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(category._id, category.name)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  aria-label="حذف الفئة"
                >
                  <FaTrashAlt size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {showEditModal && editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={handleCloseEditModal}
          onCategoryUpdated={handleCategoryUpdated}
          serverUrl={serverUrl}
        />
      )}
    </div>
  );
};

export default CategoryList;