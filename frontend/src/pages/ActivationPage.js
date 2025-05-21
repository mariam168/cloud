import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../components/LanguageContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
const ActivationPage = () => {
    const { t } = useLanguage();
    const { token } = useParams();
    const { API_BASE_URL } = useAuth();
    const [status, setStatus] = useState('loading'); 
    const [message, setMessage] = useState('');
    useEffect(() => {
        const activateAccount = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/auth/activate/${token}`);
                setStatus('success');
                setMessage(t('auth.activationSuccess') || res.data.message);
            } catch (err) {
                setStatus('error');
                const errorMessage = err.response?.data?.message || (t('auth.activationError') || 'Failed to activate account.');
                setMessage(errorMessage);
                console.error("Account activation error:", err.response ? err.response.data : err.message);
            }
        };

        if (token && API_BASE_URL) {
            activateAccount();
        } else {
            setStatus('error');
            setMessage(t('auth.tokenExpired') || 'Activation link is missing or invalid.');
        }
    }, [token, API_BASE_URL, t]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-indigo-200 px-4 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300 ease-in-out">
            <div className="w-full max-w-md bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-2xl text-center transition-colors duration-300 ease-in-out">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
                    {t('auth.accountActivation') || 'Account Activation'}
                </h1>
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="animate-spin h-12 w-12 text-indigo-600 mb-4" />
                        <p className="text-lg text-gray-700 dark:text-gray-300">{t('general.loading') || 'Activating your account...'}</p>
                    </div>
                )}
                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                        <p className="text-lg text-green-700 dark:text-green-300 font-semibold mb-4">{message}</p>
                        <Link to="/login" className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                            {t('auth.loginNow') || 'Login Now'}
                        </Link>
                    </div>
                )}
                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <XCircle className="h-12 w-12 text-red-500 mb-4" />
                        <p className="text-lg text-red-700 dark:text-red-300 font-semibold mb-4">{message}</p>
                        <Link to="/register" className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                            {t('auth.registerLink') || 'Register Again'}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivationPage;
