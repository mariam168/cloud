import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../components/LanguageContext';
const LoginPage = () => {
    const { t } = useLanguage();
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
            console.log(t('auth.loginSuccess') || 'Login successful!');
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors && Array.isArray(errors)) {
                setError(errors.map(er => er.msg).join(', '));
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data?.msg) {
                setError(err.response.data.msg);
            } else {
                setError(t('auth.loginError') || 'Login failed. Please check your credentials.');
            }
            console.error("Login error:", err.response ? err.response : err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-100 to-purple-200 px-4 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300 ease-in-out">
            <div className="w-full max-w-md bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-2xl transition-colors duration-300 ease-in-out">
                <h1 className="text-3xl font-bold text-center text-indigo-700 dark:text-indigo-400 mb-6 transition-colors duration-300 ease-in-out">
                    {t('auth.loginTitle') || 'Login to Your Account'}
                </h1>

                {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm dark:bg-red-900/30 dark:text-red-300">{error}</p>}

                <form onSubmit={onSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('auth.emailLabel') || 'Email'}
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:placeholder-gray-400 transition-colors duration-300 ease-in-out"
                            placeholder="example@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('auth.passwordLabel') || 'Password'}
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:placeholder-gray-400 transition-colors duration-300 ease-in-out"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="text-right">
                        <Link to="/forgotpassword" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200 ease-in-out">
                            {t('auth.forgotPassword') || 'Forgot Password?'}
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (t('general.submitting') || 'Logging in...') : (t('auth.loginButton') || 'Login')}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    {t('auth.registerPrompt') || 'Don’t have an account?'}{' '}
                    <Link to="/register" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors duration-200 ease-in-out">
                        {t('auth.registerLink') || 'Sign up here'}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;