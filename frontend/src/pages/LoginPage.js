// frontend/src/pages/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, API_BASE_URL } = useAuth();
  const { email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      login(res.data.user, res.data.token);
      navigate('/');
      alert('Login successful!');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors && Array.isArray(errors)) {
        setError(errors.map(er => er.msg).join(', '));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.msg) {
         setError(err.response.data.msg);
      }
      else {
        setError('Login failed. Please check your credentials.');
      }
      console.error("Login error:", err.response ? err.response : err);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white shadow-xl rounded-lg">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">تسجيل الدخول</h1>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</p>}
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
          <input type="email" name="email" value={email} onChange={onChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">كلمة المرور</label>
          <input type="password" name="password" value={password} onChange={onChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
        </div>
        <div>
          <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        ليس لديك حساب؟ <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">إنشاء حساب جديد</Link>
      </p>
    </div>
  );
};

export default LoginPage;