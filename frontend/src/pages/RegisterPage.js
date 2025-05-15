// frontend/src/pages/RegisterPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, API_BASE_URL } = useAuth(); // استخدام API_BASE_URL من السياق

  const { name, email, password, password2 } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (password !== password2) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // استخدام API_BASE_URL
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, { name, email, password /*, role: 'user' -  الخادم سيعينها 'user' افتراضياً */ });
      login(res.data.user, res.data.token);
      navigate('/');
      alert('Registration successful! You are now logged in.');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors && Array.isArray(errors)) {
        setError(errors.map(er => er.msg).join(', '));
      } else if (err.response?.data?.message) { // للرسائل العامة مثل 'User already exists' أو 'Category name already exists'
        setError(err.response.data.message);
      } else if (err.response?.data?.msg) { // للرسائل الفردية
        setError(err.response.data.msg);
      }
       else {
        setError('Registration failed. Please try again or check server logs.');
      }
      console.error("Registration error:", err.response ? err.response : err);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white shadow-xl rounded-lg">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">إنشاء حساب جديد</h1>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</p>}
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">الاسم</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={onChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">كلمة المرور</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            minLength="6"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">تأكيد كلمة المرور</label>
          <input
            type="password"
            name="password2"
            value={password2}
            onChange={onChange}
            minLength="6"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'جاري التسجيل...' : 'تسجيل'}
          </button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        لديك حساب بالفعل؟{' '}
        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          تسجيل الدخول
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;