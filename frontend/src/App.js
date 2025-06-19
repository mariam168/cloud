import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet, Navigate } from 'react-router-dom';
import { LanguageProvider } from './components/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import TopBar from './components/Header/TopBar';
import MainHeader from './components/Header/MainHeader';
import Home from './pages/Home';
import About from './pages/About';
import ContactUs from './pages/ContactUs';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardLayout from './components/layouts/DashboardLayout';
import WishlistPage from './pages/WishlistPage';
import { WishlistProvider } from './context/WishlistContext'; 
import { CartProvider } from './context/CartContext';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AdvertisementDetailsPage from './pages/AdvertisementDetailsPage';
import ActivationPage from './pages/Auth/ActivationPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import AllOffersPage from './pages/AllOffersPage';
import { ToastProvider } from './components/ToastNotification';
import AdminDashboardPage from './pages/Admin/Dashboard'; 
import AdminProductsPage from './pages/Admin/Products';
import AdminCategoriesPage from './pages/Admin/Categories';
import AdminOrdersPage from './pages/Admin/AdminOrdersPage';
import AdminOrderDetailsPage from './pages/Admin/AdminOrderDetailsPage';
import AdvertisementList from './components/Admin/AdvertisementPage/AdvertisementList';
import DiscountList from './components/Admin/DiscountPage/DiscountList';

function MainSiteLayout() {
  const location = useLocation();
  const hideHeader = ['/login', '/register', '/activate', '/forgotpassword', '/resetpassword'].some(path => location.pathname.startsWith(path));
  return (
    <div className="bg-white text-black min-h-screen">
      {!hideHeader && (
        <>
          <TopBar />
          <MainHeader />
        </>
      )}
      <Outlet /> 
    </div>
  );
}

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <WishlistProvider>
              <CartProvider>
                <Routes>
                  <Route element={<MainSiteLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/shop/:id" element={<ProductDetails />} />
                    <Route path="/wishlist" element={<WishlistPage />} /> 
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/advertisements/:id" element={<AdvertisementDetailsPage />} />
                    <Route path="/all-offers" element={<AllOffersPage />} />
                  </Route>

                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/activate/:token" element={<ActivationPage />} />
                  <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
                  <Route path="/resetpassword/:token" element={<ResetPasswordPage />} />
                  
                  <Route path="/admin" element={<DashboardLayout />}> 
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                    <Route path="products" element={<AdminProductsPage />} />    
                    <Route path="categories" element={<AdminCategoriesPage />} />   
                    <Route path="orders" element={<AdminOrdersPage />} />         
                    <Route path="orders/:id" element={<AdminOrderDetailsPage />} />
                    <Route path="advertisements" element={<AdvertisementList />} /> 
                    <Route path="discounts" element={<DiscountList />} />   
                  </Route>
                </Routes>
              </CartProvider>
            </WishlistProvider>
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;