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
import DashboardPage from './pages/Admin/Dashboard';
import ProductsPage from './pages/Admin/Products';
import CateoryPage from './pages/Admin/Categories';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  const [dark, setDark] = useState(false);
  return (
    <Router>
      <AuthProvider>  
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
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
       
          </Routes>
           <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<CateoryPage />} />
       
        </Route>
      </Routes>
        </div>
      </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;