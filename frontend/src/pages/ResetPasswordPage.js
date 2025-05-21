import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../components/LanguageContext';
import { Loader2 } from 'lucide-react';

const ResetPasswordPage = () => {
    const { t } = useLanguage();
    const { token } = useParams(); 
    const navigate = useNavigate();
    const { API_BASE_URL } = useAuth();

    const [formData, setFormData] = useState({
        password: '',
        password2: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { password, password2 } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (password !== password2) {
            setError(t('auth.passwordMismatch') || 'Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const res = await axios.put(`${API_BASE_URL}/api/auth/resetpassword/${token}`, { password });
            setMessage(t('auth.passwordResetSuccess') || res.data.message);
            setFormData({ password: '', password2: '' }); 
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || (t('auth.passwordResetError') || 'Failed to reset password.');
            setError(errorMessage);
            console.error("Reset password error:", err.response ? err.response.data : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-100 to-pink-200 px-4 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300 ease-in-out">
            <div className="w-full max-w-md bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-2xl transition-colors duration-300 ease-in-out">
                <h1 className="text-3xl font-bold text-center text-purple-700 dark:text-purple-400 mb-6 transition-colors duration-300 ease-in-out">
                    {t('auth.resetPasswordTitle') || 'Reset Password'}
                </h1>

                {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm dark:bg-red-900/30 dark:text-red-300">{error}</p>}
                {message && <p className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm dark:bg-green-900/30 dark:text-green-300">{message}</p>}

                <form onSubmit={onSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('auth.newPasswordLabel') || 'New Password'}
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            minLength="6"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:placeholder-gray-400 transition-colors duration-300 ease-in-out"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label htmlFor="password2" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('auth.confirmNewPasswordLabel') || 'Confirm New Password'}
                        </label>
                        <input
                            type="password"
                            id="password2"
                            name="password2"
                            value={password2}
                            onChange={onChange}
                            minLength="6"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:placeholder-gray-400 transition-colors duration-300 ease-in-out"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-purple-600 text-white font-semibold rounded-md shadow hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                        {loading ? (t('general.resetting') || 'Resetting...') : (t('auth.resetPasswordButton') || 'Reset Password')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
