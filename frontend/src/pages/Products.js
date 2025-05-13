import React, { useState } from 'react';
import AddProductPage from '../components/AddProductPage';
import ProductList from '../components/ProductList';


function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleProductAdded = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div className="App container mx-auto p-4">
      <header className="text-center my-8">
        <h1 className="text-4xl font-bold text-gray-800">متجر المنتجات</h1>
      </header>
      <main>
        <section className="mb-12">
          <AddProductPage onProductAdded={handleProductAdded} />
        </section>
        <hr className="my-8 border-gray-300" />
        <section>
          <ProductList key={refreshKey} />
        </section>
      </main>
      <footer className="text-center mt-12 py-4 text-gray-600">
        <p>&copy; {new Date().getFullYear()} متجري. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}

export default App;