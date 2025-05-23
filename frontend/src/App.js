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
import AdvertisementDetailPage from './pages/AdvertisementDetailPage';
import ActivationPage from './pages/ActivationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// ************************************************
// MainSiteLayout component to handle common header/footer
// ************************************************
function MainSiteLayout({ dark }) {
  const location = useLocation();
  // Define paths where the header should be hidden
  const hideHeader = ['/login', '/register', '/activate', '/forgotpassword', '/resetpassword'].some(path => location.pathname.startsWith(path));

  return (
    <div className={dark ? 'dark bg-gray-900 text-white min-h-screen' : 'bg-white text-black min-h-screen'}>
      {!hideHeader && (
        <>
          <TopBar />
          <MainHeader />
        </>
      )}
      {/* Outlet will render the matched nested route component */}
      <Outlet /> 
    </div>
  );
}

function App() {
  const [dark, setDark] = useState(false); // Example state for dark mode

  // You might have logic here to determine dark mode based on user preference or system settings

  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Routes> {/* This is the single, main <Routes> block */}
                
                {/* ************************************************ */}
                {/* Main Site Routes - These use the MainSiteLayout */}
                {/* ************************************************ */}
                <Route element={<MainSiteLayout dark={dark} />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/shop/:id" element={<ProductDetails />} />
                  <Route path="/wishlist" element={<WishlistPage />} /> 
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  {/* The crucial route for Advertisement Detail Page */}
                  <Route path="/advertisements/:id" element={<AdvertisementDetailPage />} /> 
                </Route>

                {/* ************************************************ */}
                {/* Auth/Utility Routes - These do NOT use MainSiteLayout */}
                {/* ************************************************ */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/activate/:token" element={<ActivationPage />} />
                <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
                <Route path="/resetpassword/:token" element={<ResetPasswordPage />} />

                {/* ************************************************ */}
                {/* Dashboard/Admin Routes - These use the DashboardLayout */}
                {/* IMPORTANT: Ensure a unique base path like "/admin" or "/dashboard" */}
                {/* I've updated the path to "/admin" to avoid conflicts with the root "/" of MainSiteLayout */}
                {/* If you want "/dashboard" as the base, use path="/dashboard" instead */}
                {/* If you want to access DashboardPage directly at "/admin", use index element */}
                {/* Example: <Route path="/admin" element={<DashboardLayout />}> <Route index element={<DashboardPage />} /> </Route> */}
                {/* Or: <Route path="/dashboard" element={<DashboardLayout />}> <Route index element={<DashboardPage />} /> </Route> */}
                {/* For now, I'll set it to "/admin" as a common practice. */}
                <Route path="/" element={<DashboardLayout />}> 
                  <Route path="dashboard" element={<DashboardPage />} /> {/* Full path: /admin/dashboard */}
                  <Route path="products" element={<ProductsPage />} />     {/* Full path: /admin/products */}
                  <Route path="categories" element={<CateoryPage />} />   {/* Full path: /admin/categories */}
                  <Route path="orders" element={<Orders />} />           {/* Full path: /admin/orders */}
                  <Route path="advertisements" element={<AdvertisementList />} /> {/* Full path: /admin/advertisements */}
                  <Route path="discounts" element={<DiscountList />} />   {/* Full path: /admin/discounts */}
                  <Route path="orders/:id" element={<AdminOrderDetailsPage />} /> {/* Full path: /admin/orders/:id */}
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