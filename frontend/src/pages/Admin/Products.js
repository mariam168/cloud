import React, { useState } from 'react';
import AddProductPage from '../../components/Admin/ProductPage/AddProductPage';
import ProductList from '../../components/Admin/ProductPage/ProductList';
function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const handleProductAdded = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div className="App container mx-auto p-4">
     
      <main>
        
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