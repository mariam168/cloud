import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, PlusCircle } from 'lucide-react';
import CategoryForm from './CategoryForm';
import axios from 'axios';

const CategoryList = ({ serverUrl }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${serverUrl}/api/categories`);
      setCategories(resp.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCategories();
  }, [serverUrl]);

  const fetchCategoryForEdit = async (categoryId) => {
  try {
    const resp = await axios.get(`${serverUrl}/api/categories/${categoryId}`, {
      headers: {
        'x-admin-request': 'true',
      },
    });
    const category = resp.data;

    // ✅ تعديل البيانات قبل ضبطها على الفورم
    category.name = {
      en: category.name || '',    // الاسم الحالي نعامله على إنه إنجليزي مبدئيًا
      ar: '',                      // ملوش نسخة عربي بنحط فاضي
    };
    category.description = {
      en: category.description || '', // نفس الفكرة
      ar: '',                          // ملوش نسخة عربي
    };
    category.subCategories = (category.subCategories || []).map((sub) => {
      return {
        ...sub,
        tempId: sub._id,
        name: {
          en: sub.name || '', // نعتمد على الاسم الحالي
          ar: '',              // ملوش نسخة عربي
        },
        description: {
          en: sub.description || '', 
          ar: '', 
        },
      };
    });

    setSelectedCategory(category);
    setIsFormOpen(true);
  } catch (error) {
    console.error('Error fetching category for edit:', error);
  }
};

  
  const handleEdit = (category) => {
    fetchCategoryForEdit(category._id);
  };
  
  const handleAdd = () => {
    setSelectedCategory(null);
    setIsFormOpen(true);
  };
  
  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(`${serverUrl}/api/categories/${categoryId}`);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };
  
  const handleFormSubmit = () => {
    setIsFormOpen(false);
    setSelectedCategory(null);
    fetchCategories();
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
        >
          <PlusCircle /> Add Category
        </button>
      </div>
      {loading && <p className="mt-4">Loading categories...</p>}
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg border">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="text-left p-3">Name (EN)</th>
              <th className="text-left p-3">Name (AR)</th>
              <th className="text-left p-3">Subcategories</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category._id}>
                <td className="p-3">{category.name?.en}</td>
                <td className="p-3">{category.name?.ar}</td>
                <td className="p-3">{category.subCategories?.length || 0}</td>
                <td className="p-3 flex gap-2">
                  <button
                    className="p-2 rounded hover:bg-gray-100"
                    title="Edit"
                    onClick={() => handleEdit(category)}
                  >
                    <Pencil className="text-gray-600" />
                  </button>
                  <button
                    className="p-2 rounded hover:bg-gray-100"
                    title="Delete"
                    onClick={() => handleDelete(category._id)}
                  >
                    <Trash2 className="text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center p-4 text-gray-500">
                  No categories available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <CategoryForm
          categoryToEdit={selectedCategory}
          onFormSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedCategory(null);
          }}
          serverUrl={serverUrl}
        />
      )}
    </div>
  );
};

export default CategoryList;

