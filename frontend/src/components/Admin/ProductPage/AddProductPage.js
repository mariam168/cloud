import React, { useState } from "react";
import axios from "axios";
const AddProductPage = ({ onProductAdded, serverUrl = 'http://localhost:5000' }) => {
  const [product, setProduct] = useState({
    name_en: "", 
    name_ar: "",
    description_en: "",
    description_ar: "",
    price: "",
    category: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
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
    setSubmitMessage("");
    if (!product.name_en || !product.name_ar || !product.price) {
      setSubmitMessage("Product English and Arabic names, and price are required.");
      return;
    }
    if (!imageFile) {
       setSubmitMessage("Product image is required.");
       return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name_en", product.name_en);
      formData.append("name_ar", product.name_ar); 
      formData.append("description_en", product.description_en); 
      formData.append("description_ar", product.description_ar); 
      formData.append("price", product.price);
      formData.append("image", imageFile); 
      if (product.category) {
        formData.append("category", product.category);
      }
      await axios.post(`${serverUrl}/api/product`, formData, {
        headers: {
          "Content-Type": "multipart/form-data", 
        },
      });
      setSubmitMessage("Product added successfully!");
      setProduct({ name_en: "", name_ar: "", description_en: "", description_ar: "", price: "", category: "" });
      setImageFile(null);
      const fileInput = document.getElementById("image");
      if (fileInput) fileInput.value = null;
      if (onProductAdded) {
        onProductAdded();
      }
    } catch (error) {
      console.error("Error adding product:", error.response ? error.response.data : error.message);
      setSubmitMessage(
        "Error adding product: " +
        (error.response && error.response.data && typeof error.response.data === 'string'
          ? error.response.data
          : error.response?.data?.message || error.message) 
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitMessage && (
        <p className={`text-center mb-4 p-2 rounded ${submitMessage.includes("successfully") || submitMessage.includes("بنجاح") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {submitMessage}
        </p>
      )}
      <div>
        <label htmlFor="name_en" className="block text-sm font-medium text-gray-700 mb-1">Product Name (English)</label>
        <input
          type="text"
          id="name_en"
          name="name_en"
          value={product.name_en}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label htmlFor="name_ar" className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج (العربية)</label>
        <input
          type="text"
          id="name_ar"
          name="name_ar"
          value={product.name_ar}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right" // Added text-right for Arabic input
          required
        />
      </div>
      <div>
        <label htmlFor="description_en" className="block text-sm font-medium text-gray-700 mb-1">Product Description (English)</label>
        <textarea
          id="description_en"
          name="description_en"
          value={product.description_en}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          rows="4"
        />
      </div>
      <div>
        <label htmlFor="description_ar" className="block text-sm font-medium text-gray-700 mb-1">وصف المنتج (العربية)</label>
        <textarea
          id="description_ar"
          name="description_ar"
          value={product.description_ar}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right" // Added text-right for Arabic input
          rows="4"
        />
      </div>
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Product Price</label>
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
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category (Optional)</label>
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
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
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
        {isSubmitting ? "Adding..." : "Add Product"}
      </button>
    </form>
  );
};

export default AddProductPage;
