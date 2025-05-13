import React, { useState } from "react";
import axios from "axios";

const AddProductPage = ({ onProductAdded }) => {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "", // حقل إضافي للفئة
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // لمنع الإرسال المتعدد
  const [submitMessage, setSubmitMessage] = useState(""); // لرسائل النجاح/الخطأ

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage(""); // مسح الرسائل السابقة

    if (!product.name || !product.price) {
      setSubmitMessage("اسم المنتج والسعر مطلوبان.");
      return;
    }
    if (!imageFile) {
        setSubmitMessage("صورة المنتج مطلوبة.");
        return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("description", product.description);
      formData.append("price", product.price);
      formData.append("image", imageFile);
      if (product.category) { // إضافة الفئة فقط إذا كانت موجودة
        formData.append("category", product.category);
      }

      await axios.post("http://localhost:5000/api/product", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSubmitMessage("تم إضافة المنتج بنجاح!");
      setProduct({ name: "", description: "", price: "", category: "" });
      setImageFile(null);
      // مسح حقل إدخال الملف
      const fileInput = document.getElementById("image");
      if (fileInput) fileInput.value = null;

      if (onProductAdded) {
        onProductAdded();
      }
    } catch (error) {
      console.error("Error adding product:", error.response ? error.response.data : error.message);
      setSubmitMessage("حدث خطأ أثناء إضافة المنتج: " + (error.response && error.response.data && typeof error.response.data === 'string' ? error.response.data : error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-700">إضافة منتج جديد</h2>
      {submitMessage && (
        <p className={`text-center mb-4 p-2 rounded ${submitMessage.includes("نجاح") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {submitMessage}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            اسم المنتج
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={product.name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            وصف المنتج
          </label>
          <textarea
            id="description"
            name="description"
            value={product.description}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            rows="4"
          />
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            سعر المنتج
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={product.price}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            required
            min="0"
            step="any"
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            فئة المنتج (اختياري)
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={product.category}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
            صورة المنتج
          </label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleImageChange}
            className="w-full p-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            accept="image/*"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 transition duration-150 ease-in-out"
        >
          {isSubmitting ? "جاري الإضافة..." : "إضافة المنتج"}
        </button>
      </form>
    </div>
  );
};

export default AddProductPage;