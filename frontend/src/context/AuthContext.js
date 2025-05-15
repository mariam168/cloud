// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const API_BASE_URL = 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loadingAuth, setLoadingAuth] = useState(true);

  const logout = () => { // عرف logout هنا لتكون متاحة في useEffect
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setCurrentUser(null);
    // التوجيه لصفحة الدخول يتم عادةً من المكون الذي يستدعي logout
    // أو يمكنك استخدام useNavigate هنا إذا كان AuthProvider مغلفاً بـ Router
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (e) {
        console.error("AuthContext: Failed to parse stored user or set auth header:", e);
        logout(); // استدعاء logout لإزالة البيانات غير الصالحة
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }

    // Interceptor لمعالجة خطأ 401 (Unauthorized) تلقائياً
    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401 && token) { // تحقق من وجود توكن سابقاً
          // إذا كان الخطأ 401 (Unauthorized) والتوكن كان موجوداً (يعني انتهت صلاحيته أو لم يعد صالحاً)
          console.warn("AuthContext: Received 401 Unauthorized with existing token. Logging out.");
          logout();
          // يمكنك توجيه المستخدم لصفحة الدخول هنا إذا أردت
          // window.location.href = '/login'; // هذا سيؤدي لإعادة تحميل كاملة للصفحة
        }
        return Promise.reject(error);
      }
    );
    setLoadingAuth(false);

    return () => { // تنظيف الـ interceptor عند إلغاء تحميل المكون
        axios.interceptors.response.eject(responseInterceptor);
    };

  }, [token]); // الاعتماد على token


  const login = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    setToken(userToken);
    setCurrentUser(userData);
  };


  const value = {
    currentUser,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    isAdmin: currentUser?.role === 'admin',
    loadingAuth,
    API_BASE_URL
  };

  return (
    <AuthContext.Provider value={value}>
      {!loadingAuth && children}
    </AuthContext.Provider>
  );
};