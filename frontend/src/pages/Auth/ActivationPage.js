import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../components/LanguageContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
const ActivationPage = () => {
    const { t } = useLanguage();
    const { token } = useParams();
    const { API_BASE_URL } = useAuth();
    const [status, setStatus] = useState('loading'); 
    const [message, setMessage] = useState('');
    useEffect(() => {
        const activateAccount = async () => {
            if (!token) {
                setStatus('error');
                setMessage(t('auth.tokenMissing'));
                return;
            }
            if (!API_BASE_URL) {
                setStatus('error');
                setMessage(t('general.apiError')); 
                return;
            }
            try {
                const res = await axios.get(`${API_BASE_URL}/api/auth/activate/${token}`);
                setStatus('success');
                setMessage(t('auth.activationSuccess') || res.data.message);
            } catch (err) {
                setStatus('error');
                const errorMessage = err.response?.data?.message || (t('auth.activationError'));
                setMessage(errorMessage);
                console.error("Account activation error:", err.response ? err.response.data : err.message);
            }
        };

        activateAccount(); 
    }, [token, API_BASE_URL, t]);
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300 ease-in-out">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-center transition-colors duration-300 ease-in-out">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-8">
                    {t('auth.accountActivation')}
                </h1>
                {status === 'loading' && (
                    <div className="flex flex-col items-center py-6">
                        <Loader2 className="animate-spin h-16 w-16 text-blue-600 dark:text-blue-400 mb-4" />
                        <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">{t('general.loading')}</p>
                    </div>
                )}
                {status === 'success' && (
                    <div className="flex flex-col items-center py-6">
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                        <p className="text-lg text-green-700 dark:text-green-300 font-semibold mb-6">{message}</p>
                        <Link to="/login" className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 ease-in-out font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                            {t('auth.loginNow')}
                        </Link>
                    </div>
                )}
                {status === 'error' && (
                    <div className="flex flex-col items-center py-6">
                        <XCircle className="h-16 w-16 text-red-500 mb-4" />
                        <p className="text-lg text-red-700 dark:text-red-300 font-semibold mb-6">{message}</p>
                        <Link to="/register" className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 ease-in-out font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                            {t('auth.registerLink')}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
export default ActivationPage;