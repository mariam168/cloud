import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { LanguageProvider } from './components/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import TopBar from './components/Header/TopBar';
import MainHeader from './components/Header/MainHeader';
import Home from './pages/Home';
import About from './pages/About';
import ContactUs from './pages/ContactUs';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './components/layouts/DashboardLayout';
import DashboardPage from './pages/Admin/Dashboard';
import ProductsPage from './pages/Admin/Products';
import CateoryPage from './pages/Admin/Categories';
import WishlistPage from './pages/WishlistPage';
import { WishlistProvider } from './context/WishlistContext'; 
import { CartProvider } from './context/CartContext';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import Orders from './pages/Admin/AdminOrdersPage';
import AdvertisementList from './components/Admin/AdvertisementPage/AdvertisementList';
import DiscountList from './components/Admin/DiscountPage/DiscountList';
import AdminOrderDetailsPage from './pages/Admin/AdminOrderDetailsPage';
import AdvertisementDetailsPage from './pages/AdvertisementDetailsPage';
import ActivationPage from './pages/ActivationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AllOffersPage from './pages/AllOffersPage';
function MainSiteLayout({ dark }) {
  const location = useLocation();
  const hideHeader = ['/login', '/register', '/activate', '/forgotpassword', '/resetpassword'].some(path => location.pathname.startsWith(path));
  return (
    <div className={dark ? 'dark bg-gray-900 text-white min-h-screen' : 'bg-white text-black min-h-screen'}>
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
  const [dark, setDark] = useState(false);
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Routes>
                <Route element={<MainSiteLayout dark={dark} />}>
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
                <Route path="/" element={<DashboardLayout />}> 
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="products" element={<ProductsPage />} />    
                  <Route path="categories" element={<CateoryPage />} />   
                  <Route path="orders" element={<Orders />} />         
                  <Route path="advertisements" element={<AdvertisementList />} /> 
                  <Route path="discounts" element={<DiscountList />} />   
                  <Route path="orders/:id" element={<AdminOrderDetailsPage />} />
                </Route>

              </Routes>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;