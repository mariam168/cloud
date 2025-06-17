import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../components/LanguageContext';
import { Loader2, Mail, CheckCircle, XCircle, Shield } from 'lucide-react'; 
const ForgotPasswordPage = () => {
    const { t, language } = useLanguage(); 
    const [email, setEmail] = useState('');
    const [recaptchaToken, setRecaptchaToken] = useState('');
    const [message, setMessage] = useState(''); //
    const [error, setError] = useState('');     
    const [loading, setLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { API_BASE_URL } = useAuth();
    const recaptchaRef = useRef(null);
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
        if (window.grecaptcha && recaptchaRef.current && !recaptchaRef.current.dataset.rendered) {
            window.grecaptcha.render(recaptchaRef.current, {
                sitekey: '6LdxtkMrAAAAACZQKQO1Zsg8sfYTUiv-EejfKkSZ', 
                callback: (token) => {
                    setRecaptchaToken(token);
                    setError('');
                },
                'expired-callback': () => {
                    setRecaptchaToken('');
                    setError(t('auth.recaptchaExpired') || 'reCAPTCHA expired. Please re-verify.');
                    if (window.grecaptcha) window.grecaptcha.reset(); 
                },
                theme: language === 'ar' ? 'dark' : 'light', 
                size: 'normal'
            });
            recaptchaRef.current.dataset.rendered = 'true';
        }
    }, [language, t]); 
    const onSubmit = useCallback(async e => {
        e.preventDefault();
        setLoading(true);
        setMessage(''); 
        setError(''); 

        if (!recaptchaToken) {
            setError(t('auth.recaptchaRequired') || 'Please complete the reCAPTCHA verification.');
            setLoading(false);
            if (window.grecaptcha) window.grecaptcha.reset(); 
            return;
        }
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/forgotpassword`, { email, recaptchaToken });
            setMessage(t('auth.resetEmailSent') || 'Password reset link sent to your email. Please check your inbox.');
            setEmail(''); 
            if (window.grecaptcha) {
                window.grecaptcha.reset(); 
            }
        } catch (err) {
            const apiMessage = err.response?.data?.message || err.response?.data?.msg; 
            const defaultError = t('auth.resetEmailError') || 'Failed to send reset link. Please try again.';
            
            setError(apiMessage || defaultError);
            console.error("Forgot password error:", err.response ? err.response.data : err.message);
            
            if (window.grecaptcha) {
                window.grecaptcha.reset();
            }
        } finally {
            setLoading(false);
        }
    }, [email, recaptchaToken, API_BASE_URL, t]);
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
                <h1 className="text-4xl md:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-6 tracking-wider"> {/* Adjusted mb-6 */}
                    {t('auth.forgotPasswordTitle')}
                </h1>
                <p className={`text-center text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed ${textAlignmentClass}`}> {/* Text color updated for dark mode */}
                    {t('auth.forgotPasswordInstructions')}
                </p>
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
                            onChange={e => setEmail(e.target.value)}
                            required
                            className={`${inputPaddingClass} py-4 block w-full border border-gray-300 rounded-xl shadow-md text-base dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-400 group-focus-within:border-blue-500 group-focus-within:ring-blue-500 hover:border-gray-400`}
                            placeholder={t('auth.emailLabel')}
                        />
                        <Mail size={22} className="absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400 pointer-events-none transition-colors duration-300 group-focus-within:text-blue-500" style={{ [language === 'ar' ? 'right' : 'left']: '16px' }} />
                    </div>
                    <div className="flex flex-col items-center pt-2">
                        <div ref={recaptchaRef} className="g-recaptcha" data-sitekey="6LdxtkMrAAAAACZQKQO1Zsg8sfYTUiv-EejfKkSZ"></div>
                        {error && (error.includes(t('auth.recaptchaExpired')) || error.includes(t('auth.recaptchaRequired'))) && (
                            <p className="text-red-600 dark:text-red-400 text-sm mt-3 flex items-center gap-2 font-medium">
                                <Shield size={18} className="flex-shrink-0" /> {t('general.verifyHuman') || 'Please verify that you are human.'}
                            </p>
                        )}
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
                                t('auth.sendResetLink')
                            )}
                        </button>
                    </div>
                </form>
                <p className={`mt-8 text-center text-base text-gray-600 dark:text-gray-300 ${textAlignmentClass}`}> {/* Text color updated for dark mode */}
                    <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 ease-in-out">
                        {t('auth.loginNow')}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;