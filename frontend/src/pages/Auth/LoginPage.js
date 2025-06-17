import React, { useState, useEffect, useCallback, useMemo } from 'react'; 
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../components/LanguageContext';
import { Mail, Lock, Loader2, CheckCircle, XCircle } from 'lucide-react'; 
const LoginPage = () => {
    const { t, language } = useLanguage(); 
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState(''); 
    const [loading, setLoading] = useState(false);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false); 
    const [isDarkMode, setIsDarkMode] = useState(false); 
    const navigate = useNavigate();
    const { login, API_BASE_URL } = useAuth();
    const { email, password } = formData;
    useEffect(() => {
        const detectDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };
        detectDarkMode(); 
        const observer = new MutationObserver(detectDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []); 
    const onChange = useCallback(e => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
    }, []); 

    const onSubmit = useCallback(async e => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage(''); 
        setShowWelcomeModal(false); 

        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
            
            login(res.data.user, res.data.token);

            setSuccessMessage(t('auth.loginWelcome', { name: res.data.user.name }) || `Welcome, ${res.data.user.name}!`); 
            
            setShowWelcomeModal(true); 
            
            setTimeout(() => {
                navigate('/'); 
            }, 2000); 

        } catch (err) {
            const apiErrors = err.response?.data?.errors; 
            const apiMessage = err.response?.data?.message; 
            const apiMsg = err.response?.data?.msg; 

            if (apiErrors && Array.isArray(apiErrors)) {
                setError(apiErrors.map(er => er.msg).join(', '));
            } else if (apiMessage) {
                setError(apiMessage);
            } else if (apiMsg) { 
                setError(apiMsg);
            } else {
                setError(t('auth.loginError') || 'Login failed. Please try again.');
            }
            console.error("Login error:", err.response ? err.response.data : err.message);
        } finally {
            setLoading(false);
        }
    }, [email, password, login, navigate, API_BASE_URL, t]); 
    const inputPaddingClass = language === 'ar' ? 'pr-14 pl-4' : 'pl-14 pr-4';
    const textAlignmentClass = language === 'ar' ? 'text-right' : 'text-left';
    const cardBackgroundColor = useMemo(() => {
        return isDarkMode ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.85)';
    }, [isDarkMode]);


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 px-4 py-8 dark:from-gray-950 dark:to-gray-900 transition-colors duration-500 ease-in-out" // Dark mode background adjusted
             dir={language === 'ar' ? 'rtl' : 'ltr'}> 
            <div className="w-full max-w-md mx-auto p-8 shadow-2xl rounded-3xl border border-gray-100 dark:border-gray-700 transition-all duration-500 ease-in-out transform hover:scale-[1.01] hover:shadow-3xl"
                 style={{ 
                     backdropFilter: 'blur(10px)', 
                     WebkitBackdropFilter: 'blur(10px)', 
                     backgroundColor: cardBackgroundColor 
                 }} 
            >
                <h1 className="text-4xl md:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-10 tracking-wider">
                    {t('auth.loginTitle')}
                </h1>
                {error && (
                    <div className={`${textAlignmentClass} bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 p-4 rounded-xl mb-6 text-sm font-semibold flex items-center gap-3 border border-red-300 dark:border-red-600 animate-fade-in transition-all duration-300 shadow-md`}>
                        <XCircle size={22} className="flex-shrink-0" />
                        <span className="flex-grow">{error}</span>
                    </div>
                )}
                {successMessage && (
                    <div className={`${textAlignmentClass} bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300 p-4 rounded-xl mb-6 text-sm font-semibold flex items-center gap-3 border border-green-300 dark:border-green-600 animate-fade-in transition-all duration-300 shadow-md`}>
                        <CheckCircle size={22} className="flex-shrink-0" />
                        <span className="flex-grow">{successMessage}</span>
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="relative group">
                        <label htmlFor="email" className="sr-only">
                            {t('auth.emailLabel')}
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            placeholder={t('auth.emailLabel')}
                            required
                            className={`${inputPaddingClass} py-4 block w-full border border-gray-300 rounded-xl shadow-md text-base dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-400 group-focus-within:border-blue-500 group-focus-within:ring-blue-500 hover:border-gray-400`}
                        />
                        <Mail size={22} className="absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400 pointer-events-none transition-colors duration-300 group-focus-within:text-blue-500" style={{ [language === 'ar' ? 'right' : 'left']: '16px' }} />
                    </div>
                    <div className="relative group">
                        <label htmlFor="password" className="sr-only">
                            {t('auth.passwordLabel')}
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            placeholder={t('auth.passwordLabel')}
                            required
                            className={`${inputPaddingClass} py-4 block w-full border border-gray-300 rounded-xl shadow-md text-base dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-400 group-focus-within:border-blue-500 group-focus-within:ring-blue-500 hover:border-gray-400`}
                        />
                        <Lock size={22} className="absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400 pointer-events-none transition-colors duration-300 group-focus-within:text-blue-500" style={{ [language === 'ar' ? 'right' : 'left']: '16px' }} />
                    </div>
                    <div className={textAlignmentClass}> 
                        <Link to="/forgotpassword" className="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 ease-in-out">
                            {t('auth.forgotPassword')}
                        </Link>
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center py-4 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed text-xl tracking-wide"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-6 w-6 text-white inline-block" style={{ [language === 'ar' ? 'marginLeft' : 'marginRight']: '0.75rem' }} /> 
                            ) : (
                                t('auth.loginButton')
                            )}
                        </button>
                    </div>
                </form>
                <p className={`mt-8 text-center text-base text-gray-600 dark:text-gray-300 ${textAlignmentClass}`}>
                    {t('auth.registerPrompt')}{' '}
                    <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 ease-in-out">
                        {t('auth.registerLink')}
                    </Link>
                </p>
            </div>
            {showWelcomeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-3xl max-w-sm text-center transform scale-100 opacity-100 transition-all duration-300 border border-gray-100 dark:border-gray-700" dir={language === 'ar' ? 'rtl' : 'ltr'}
                         style={{ 
                             backdropFilter: 'blur(10px)', 
                             WebkitBackdropFilter: 'blur(10px)', 
                             backgroundColor: cardBackgroundColor 
                         }}
                    >
                        <CheckCircle className="text-green-500 mx-auto mb-6" size={64} strokeWidth={1.5} />
                        <h3 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 tracking-wide"> 
                            {t('auth.loginSuccessTitle') || 'Login Successful!'} 
                        </h3>
                        <p className="text-lg text-gray-700 dark:text-gray-200 mb-8 leading-relaxed"> 
                            {successMessage}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginPage;