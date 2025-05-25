import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../components/LanguageContext';

const RegisterPage = () => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password2: '',
        recaptchaToken: '',
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { API_BASE_URL } = useAuth();
    const recaptchaRef = useRef(null);
    const { name, email, password, password2, recaptchaToken } = formData;
    useEffect(() => {
        if (window.grecaptcha && recaptchaRef.current && !recaptchaRef.current.hasRendered) {
            recaptchaRef.current.hasRendered = true;
            window.grecaptcha.render(recaptchaRef.current, {
                sitekey: '6LdxtkMrAAAAACZQKQO1Zsg8sfYTUiv-EejfKkSZ',
                callback: (token) => {
                    setFormData(prev => ({ ...prev, recaptchaToken: token }));
                    setError('');
                },
                'expired-callback': () => {
                    setFormData(prev => ({ ...prev, recaptchaToken: '' }));
                    setError(t('auth.recaptchaError') || 'reCAPTCHA expired. Please re-verify.');
                },
            });
        }
    }, [t]);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setSuccessMessage('');
        setError('');

        if (password !== password2) {
            setError(t('auth.passwordMismatch') || 'Passwords do not match');
            return;
        }

        if (!recaptchaToken) {
            setError(t('auth.recaptchaError') || 'Please complete the reCAPTCHA.');
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/register`, { name, email, password, recaptchaToken });
            setSuccessMessage(t('auth.registerSuccess') || 'Registration successful! Please check your email for activation link.');
            setFormData({ name: '', email: '', password: '', password2: '', recaptchaToken: '' });
            if (window.grecaptcha) {
                window.grecaptcha.reset();
            }
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors && Array.isArray(errors)) {
                setError(errors.map(er => er.msg).join(', '));
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError(t('auth.registerError') || 'Registration failed. Please try again.');
            }
            console.error("Registration error:", err.response ? err.response : err);
            if (window.grecaptcha) {
                window.grecaptcha.reset();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-100 to-purple-200 px-4 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300 ease-in-out">
            <div className="w-full max-w-md mx-auto mt-10 p-8 bg-white dark:bg-gray-700 shadow-xl rounded-lg transition-colors duration-300 ease-in-out">
                <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
                    {t('auth.registerTitle') || 'Create Your Account'}
                </h1>
                {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm dark:bg-red-900/30 dark:text-red-300">{error}</p>}
                {successMessage && <p className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm dark:bg-green-900/30 dark:text-green-300">{successMessage}</p>}
                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('auth.nameLabel') || 'Full Name'}
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
                            {t('auth.emailLabel') || 'Email Address'}
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
                            {t('auth.passwordLabel') || 'Password'}
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
                            {t('auth.confirmPasswordLabel') || 'Confirm Password'}
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
                    <div className="flex flex-col items-center">
                        <div ref={recaptchaRef} className="g-recaptcha" data-sitekey="YOUR_RECAPTCHA_SITE_KEY_HERE"></div>
                        {error && error.includes(t('auth.recaptchaError')) && (
                            <p className="text-red-500 text-sm mt-2">{t('general.verifyHuman') || 'Please verify you are human.'}</p>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-700 dark:hover:bg-indigo-600 transition duration-150 ease-in-out"
                        >
                            {loading ? (t('general.submitting') || 'Registering...') : (t('auth.registerButton') || 'Register')}
                        </button>
                    </div>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    {t('auth.loginPrompt') || 'Already have an account?'}{' '}
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200 ease-in-out">
                        {t('auth.loginLink') || 'Login here'}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
