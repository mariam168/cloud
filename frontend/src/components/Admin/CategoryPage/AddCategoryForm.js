import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddCategoryModal = ({ isOpen, onClose, onCategoryAdded, serverUrl }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setMessage({ text: '', type: '' }); 
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ text: 'اسم الفئة مطلوب.', type: 'error' });
      return;
    }
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      await axios.post(`${serverUrl}/api/categories`, { name, description });
      setMessage({ text: 'تمت إضافة الفئة بنجاح!', type: 'success' });
      setName(''); 
      setDescription('');

      if (onCategoryAdded) {
        onCategoryAdded();
      }
    } catch (err) {
      console.error("Error adding category:", err.response ? err.response.data : err.message);
      setMessage({ text: err.response?.data?.message || "حدث خطأ أثناء إضافة الفئة.", type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out scale-100">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-700">إضافة فئة جديدة</h3>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                aria-label="إغلاق"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>

        {message.text && (
          <p className={`text-center mb-4 p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="modal-category-name" className="block text-sm font-medium text-gray-700 mb-1">
              اسم الفئة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="modal-category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              required
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="modal-category-description" className="block text-sm font-medium text-gray-700 mb-1">
              وصف الفئة (اختياري)
            </label>
            <textarea
              id="modal-category-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
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
              className="px-6 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "جاري الإضافة..." : "إضافة الفئة"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;