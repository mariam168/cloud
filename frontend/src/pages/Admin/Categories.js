import React, { useState } from 'react';
import AddCategoryModal from '../../components/Admin/CategoryPage/AddCategoryForm';
import CategoryList from '../../components/Admin/CategoryPage/CategoryList';
const AddProductPage = ({ onProductAdded }) => {
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("تم استدعاء إضافة المنتج - يجب تنفيذ هذا بشكل كامل");
        if (onProductAdded) onProductAdded();
    };
    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-700">إضافة منتج جديد</h2>
            <form onSubmit={handleSubmit}>
                <button type="submit" className="w-full mt-4 bg-indigo-600 text-white py-3 px-4 rounded-lg">إضافة المنتج (مثال)</button>
            </form>
        </div>
    );
};

const ProductList = ({ key: refreshKey }) => { 
    console.log("ProductList key for refresh:", refreshKey);
    return <div className="max-w-7xl mx-auto"><h2 className="text-3xl font-bold text-center mb-10 text-gray-700">قائمة المنتجات (مثال)</h2> {/* يجب استبدال هذا بالعرض الفعلي */}</div>;
};
function App() {
  const [refreshProductsKey, setRefreshProductsKey] = useState(0);
  const [refreshCategoriesKey, setRefreshCategoriesKey] = useState(0);
  const [activeSection, setActiveSection] = useState('products'); 
  const SERVER_URL = 'http://localhost:5000';
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const handleProductAdded = () => {
    setRefreshProductsKey(prevKey => prevKey + 1);
  };

  const handleCategoryAction = () => {
    setRefreshCategoriesKey(prevKey => prevKey + 1);
  };
  return (
    <div className="App container mx-auto p-4 min-h-screen flex flex-col">
      <header className="text-center my-8">
        <h1 className="text-4xl font-bold text-gray-800">لوحة تحكم المتجر</h1>
      </header>

      <nav className="flex justify-center space-x-2 sm:space-x-4 mb-10">
        <button
          onClick={() => setActiveSection('products')}
          className={`px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-base rounded-md font-semibold transition-colors ${activeSection === 'products' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          إدارة المنتجات
        </button>
        <button
          onClick={() => setActiveSection('categories')}
          className={`px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-base rounded-md font-semibold transition-colors ${activeSection === 'categories' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          إدارة الفئات
        </button>
      </nav>

      <main className="flex-grow">
        {activeSection === 'products' && (
          <section id="products-section">
            <h2 className="text-3xl font-semibold text-center mb-6 text-indigo-700">قسم المنتجات</h2>
            <div className="mb-12">
              <AddProductPage onProductAdded={handleProductAdded} />
            </div>
            <hr className="my-8 border-gray-300" />
            <div>
              <ProductList key={refreshProductsKey} />
            </div>
          </section>
        )}

        {activeSection === 'categories' && (
          <section id="categories-section">
            <div className="flex justify-between items-center mb-6 px-2 sm:px-0">
                <h2 className="text-2xl sm:text-3xl font-semibold text-purple-700">قسم الفئات</h2>
                <button
                    onClick={() => setShowAddCategoryModal(true)}
                    className="bg-purple-600 text-white py-2 px-4 sm:px-5 rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 text-sm sm:text-base"
                >
                    + إضافة فئة جديدة
                </button>
            </div>
            <div>
              <CategoryList
                refreshTrigger={refreshCategoriesKey} 
                serverUrl={SERVER_URL}
                onCategoryAction={handleCategoryAction} 
              />
            </div>
          </section>
        )}
      </main>
      <AddCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onCategoryAdded={() => {
          handleCategoryAction(); 
        }}
        serverUrl={SERVER_URL}
      />

      <footer className="text-center mt-16 py-6 text-gray-600 border-t border-gray-300">
        <p>&copy; {new Date().getFullYear()} متجري. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}

export default App;