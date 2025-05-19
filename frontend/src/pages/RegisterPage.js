import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../components/LanguageContext'; // Import useLanguage

const RegisterPage = () => {
    const { t } = useLanguage(); // Get translation function
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password2: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, API_BASE_URL } = useAuth();

    const { name, email, password, password2 } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        if (password !== password2) {
            setError(t('registerPage.passwordMatchError') || 'Passwords do not match'); // Translate error message
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/register`, { name, email, password });
            login(res.data.user, res.data.token);
            navigate('/');
            alert(t('registerPage.registrationSuccess') || 'Registration successful! You are now logged in.'); // Translate success message
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors && Array.isArray(errors)) {
                setError(errors.map(er => er.msg).join(', '));
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data?.msg) {
                setError(err.response.data.msg);
            } else {
                setError(t('registerPage.registrationFailed') || 'Registration failed. Please try again or check server logs.'); // Translate generic error
            }
            console.error("Registration error:", err.response ? err.response : err);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-100 to-purple-200 px-4 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300 ease-in-out">
            <div className="w-full max-w-md mx-auto mt-10 p-8 bg-white dark:bg-gray-700 shadow-xl rounded-lg transition-colors duration-300 ease-in-out">
                <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
                    {t('registerPage.title') || 'Create New Account'} {/* Translate title */}
                </h1>
                {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm dark:bg-red-900/30 dark:text-red-300">{error}</p>}
                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('registerPage.nameLabel') || 'Name'} {/* Translate label */}
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={name}
                            onChange={onChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('registerPage.emailLabel') || 'Email Address'} {/* Translate label */}
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('registerPage.passwordLabel') || 'Password'} {/* Translate label */}
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            minLength="6"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('registerPage.confirmPasswordLabel') || 'Confirm Password'} {/* Translate label */}
                        </label>
                        <input
                            type="password"
                            name="password2"
                            value={password2}
                            onChange={onChange}
                            minLength="6"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-700 dark:hover:bg-indigo-600 transition duration-150 ease-in-out"
                        >
                            {loading ? (t('registerPage.submittingButton') || 'Registering...') : (t('registerPage.registerButton') || 'Register')} {/* Translate button text */}
                        </button>
                    </div>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    {t('registerPage.alreadyHaveAccount') || 'Already have an account?'}{' '} {/* Translate text */}
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200 ease-in-out">
                        {t('registerPage.signInLink') || 'Sign in here'} {/* Translate link text */}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
