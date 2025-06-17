import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'; 
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../components/LanguageContext';
import { Loader2, CheckCircle, XCircle, Lock } from 'lucide-react'; 
const ResetPasswordPage = () => {
    const { t, language } = useLanguage(); 
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
    const [tokenStatus, setTokenStatus] = useState('loading'); 
    const [isDarkMode, setIsDarkMode] = useState(false); 
    const { password, password2 } = formData;
    useEffect(() => {
        const detectDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };
        detectDarkMode(); 
        const observer = new MutationObserver(detectDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []); 
    useEffect(() => {
        const validateResetToken = async () => {
            if (!token) {
                setTokenStatus('invalid');
                setError(t('auth.resetLinkMissing') || 'Reset link is missing or invalid.');
                return;
            }
            if (tokenStatus !== 'loading') {
                return;
            }
            try {
                await axios.get(`${API_BASE_URL}/api/auth/validate-reset-token/${token}`);
                setTokenStatus('valid');
                setError(''); 
            } catch (err) {
                setTokenStatus('invalid');
                const apiMessage = err.response?.data?.message || err.response?.data?.msg;
                const defaultError = t('auth.tokenExpiredOrInvalid') || 'This link is invalid or has expired.';
                setError(apiMessage || defaultError);
                console.error("Token validation error on reset password page:", err.response ? err.response.data : err.message);
            } finally {
            }
        };

        validateResetToken();
    }, [token, API_BASE_URL, t, tokenStatus]); 

    const onChange = useCallback(e => setFormData({ ...formData, [e.target.name]: e.target.value }), [formData]);

    const onSubmit = useCallback(async e => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (password.length < 6) { 
            setError(t('auth.passwordMinLength') || 'Password must be at least 6 characters long.');
            setLoading(false);
            return;
        }
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
            const apiMessage = err.response?.data?.message || err.response?.data?.msg;
            const defaultError = t('auth.passwordResetError') || 'Failed to reset password.';
            setError(apiMessage || defaultError);
            console.error("Reset password submission error:", err.response ? err.response.data : err.message);
        } finally {
            setLoading(false);
        }
    }, [password, password2, token, API_BASE_URL, navigate, t]);
    const inputPaddingClass = language === 'ar' ? 'pr-14 pl-4' : 'pl-14 pr-4';
    const textAlignmentClass = language === 'ar' ? 'text-right' : 'text-left';
    const cardBackgroundColor = useMemo(() => {
        return isDarkMode ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.85)';
    }, [isDarkMode]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 px-4 py-8 dark:from-gray-950 dark:to-gray-900 transition-colors duration-500 ease-in-out"
             dir={language === 'ar' ? 'rtl' : 'ltr'}> 
            <div className="w-full max-w-md mx-auto p-8 shadow-2xl rounded-3xl border border-gray-100 dark:border-gray-700 transition-all duration-500 ease-in-out transform hover:scale-[1.01] hover:shadow-3xl"
                 style={{ 
                     backdropFilter: 'blur(10px)', 
                     WebkitBackdropFilter: 'blur(10px)', 
                     backgroundColor: cardBackgroundColor 
                 }} 
            >
                <h1 className="text-4xl md:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-10 tracking-wider">
                    {t('auth.resetPasswordTitle') || 'Reset Your Password'}
                </h1>
                {error && (
                    <div className={`${textAlignmentClass} bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 p-4 rounded-xl mb-6 text-sm font-semibold flex items-center gap-3 border border-red-300 dark:border-red-600 animate-fade-in transition-all duration-300 shadow-md`}>
                        <XCircle size={22} className="flex-shrink-0" />
                        <span className="flex-grow">{error}</span>
                    </div>
                )}
                {message && (
                    <div className={`${textAlignmentClass} bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300 p-4 rounded-xl mb-6 text-sm font-semibold flex items-center gap-3 border border-green-300 dark:border-green-600 animate-fade-in transition-all duration-300 shadow-md`}>
                        <CheckCircle size={22} className="flex-shrink-0" />
                        <span className="flex-grow">{message}</span>
                    </div>
                )}
                {tokenStatus === 'loading' && (
                    <div className="flex flex-col items-center py-8">
                        <Loader2 className="animate-spin h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
                        <p className="text-lg text-gray-700 dark:text-gray-300">{t('auth.verifyingLink') || 'Verifying reset link...'}</p>
                    </div>
                )}
                {tokenStatus === 'invalid' && ( 
                    <div className="flex flex-col items-center py-8">
                        <XCircle className="h-20 w-20 text-red-500 mb-6" strokeWidth={1.5} /> 
                        <p className={`text-2xl md:text-3xl font-extrabold text-red-700 dark:text-red-400 mb-6 text-center ${textAlignmentClass}`}>{error}</p> 
                        <Link to="/forgotpassword" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-xl tracking-wide">
                            {t('auth.requestNewLink') || 'Request New Link'} 
                        </Link>
                    </div>
                )}
                {tokenStatus === 'valid' && (
                    <form onSubmit={onSubmit} className="space-y-6"> 
                        <div className="relative group">
                            <label htmlFor="password" className="sr-only">
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
                                className={`${inputPaddingClass} py-4 block w-full border border-gray-300 rounded-xl shadow-md text-base dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-400 group-focus-within:border-blue-500 group-focus-within:ring-blue-500 hover:border-gray-400`}
                                placeholder="••••••••"
                            />
                            <Lock size={22} className="absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400 pointer-events-none transition-colors duration-300 group-focus-within:text-blue-500" style={{ [language === 'ar' ? 'right' : 'left']: '16px' }} />
                        </div>
                        <div className="relative group">
                            <label htmlFor="password2" className="sr-only">
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
                                className={`${inputPaddingClass} py-4 block w-full border border-gray-300 rounded-xl shadow-md text-base dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-400 group-focus-within:border-blue-500 group-focus-within:ring-blue-500 hover:border-gray-400`}
                                placeholder="••••••••"
                            />
                            <Lock size={22} className="absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400 pointer-events-none transition-colors duration-300 group-focus-within:text-blue-500" style={{ [language === 'ar' ? 'right' : 'left']: '16px' }} />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center py-4 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed text-xl tracking-wide"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-6 w-6 text-white inline-block" style={{ [language === 'ar' ? 'marginLeft' : 'marginRight']: '0.75rem' }} />
                            ) : (
                                t('auth.resetPasswordButton') || 'Reset Password'
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;