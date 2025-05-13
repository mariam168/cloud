import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './components/LanguageContext';
import TopBar from './components/Header/TopBar';
import MainHeader from './components/Header/MainHeader';
import Shop from './pages/Shop';
import Home from './pages/Home';
import About from './pages/About';
import ContactUs from './pages/ContactUs';
import ProductDetails from './pages/ProductDetails';
import DashboardLayout from './components/layouts/DashboardLayout';
import DashboardPage from './pages/Dashboard';
import ProductsPage from './pages/Products.js';
function App() {
  const [dark, setDark] = useState(false);
  return (
    <Router>
      <LanguageProvider>
        <div className={dark ? 'dark bg-gray-900 text-white min-h-screen' : 'bg-white text-black min-h-screen'}>
          <TopBar />
          <MainHeader />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:id" element={<ProductDetails />} /> 
       
          </Routes>
           <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          {/* <Route path="categories" element={<CategoriesPage />} />
          <Route path="orders" element={<OrdersPage />} /> */}
        </Route>
      </Routes>
        </div>
      </LanguageProvider>
    </Router>
  );
}

export default App;