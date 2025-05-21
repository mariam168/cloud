import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../components/LanguageContext';
import { Loader2 } from 'lucide-react';

const ForgotPasswordPage = () => {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { API_BASE_URL } = useAuth();

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/forgotpassword`, { email });
            setMessage(t('auth.resetEmailSent') || res.data.message);
            setEmail(''); // Clear email field
        } catch (err) {
            const errorMessage = err.response?.data?.message || (t('auth.resetEmailError') || 'Failed to send password reset email.');
            setError(errorMessage);
            console.error("Forgot password error:", err.response ? err.response.data : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-100 to-teal-200 px-4 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300 ease-in-out">
            <div className="w-full max-w-md bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-2xl transition-colors duration-300 ease-in-out">
                <h1 className="text-3xl font-bold text-center text-teal-700 dark:text-teal-400 mb-6 transition-colors duration-300 ease-in-out">
                    {t('auth.forgotPasswordTitle') || 'Forgot Password'}
                </h1>
                <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                    {t('auth.forgotPasswordInstructions') || 'Enter your email address and we\'ll send you a link to reset your password.'}
                </p>

                {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm dark:bg-red-900/30 dark:text-red-300">{error}</p>}
                {message && <p className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm dark:bg-green-900/30 dark:text-green-300">{message}</p>}

                <form onSubmit={onSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('auth.emailLabel') || 'Email Address'}
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:placeholder-gray-400 transition-colors duration-300 ease-in-out"
                            placeholder="example@email.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-teal-600 text-white font-semibold rounded-md shadow hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                        {loading ? (t('general.sending') || 'Sending...') : (t('auth.sendResetLink') || 'Send Reset Link')}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    <Link to="/login" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors duration-200 ease-in-out">
                        {t('auth.loginNow') || 'Back to Login'}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
