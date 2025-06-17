import React, { useState, useCallback } from 'react'; // Removed useEffect if not used directly
import { useLanguage } from "../components/LanguageContext"; 
import { User, Mail, Phone, MessageSquare, Send, Tag, Loader2, CheckCircle, XCircle } from 'lucide-react'; // Added icons

const ContactUs = () => {
    const { t, language } = useLanguage(); 
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        email: '',
        phone: '',
        message: '',
    });
    const [submissionMessage, setSubmissionMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setSubmissionMessage(null); 
        setIsLoading(true); 
        const apiUrl = process.env.REACT_APP_API_URL;
        // console.log('API URL from .env (ContactUs.jsx):', apiUrl); // Keep for debugging, remove in production

        if (!apiUrl) {
            setSubmissionMessage({
                type: 'error',
                text: t('contactUsPage.apiError') || 'API URL is not defined. Please ensure REACT_APP_API_URL is set in your frontend .env file and restart the development server.'
            });
            setIsLoading(false);
            return; 
        }

        const endpoint = `${apiUrl}/api/contact`;
        // console.log('Full API Endpoint (ContactUs.jsx):', endpoint); // Keep for debugging, remove in production

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSubmissionMessage({ type: 'success', text: t('contactUsPage.successMessage') });
                setFormData({
                    name: '',
                    subject: '',
                    email: '',
                    phone: '',
                    message: '',
                });
            } else {
                const contentType = response.headers.get("content-type");
                let errorText = t('contactUsPage.errorMessage');
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errorData = await response.json();
                    errorText = errorData.message || errorText;
                } else {
                    errorText = await response.text(); 
                }

                setSubmissionMessage({ type: 'error', text: errorText });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmissionMessage({ type: 'error', text: t('contactUsPage.networkError') });
        } finally {
            setIsLoading(false); 
        }
    }, [formData, t]);

    return (
        <section className="w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-16 px-4 md:px-8 lg:px-12 transition-colors duration-300">
            <div className="max-w-screen-lg mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 border border-gray-200 dark:border-gray-700">
                <div className="text-center mb-10">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
                        {t('contactUsPage.title')}
                    </h2>
                    <p className="max-w-prose mx-auto text-lg text-gray-600 dark:text-gray-300">
                        {t('contactUsPage.description')}
                    </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl shadow-inner border border-gray-100 dark:border-gray-600">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {/* Input Fields */}
                        <div className="relative">
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder={t('contactUsPage.yourName')}
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg transition-all duration-200 shadow-sm"
                            />
                            <User size={24} className="absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 pointer-events-none" style={{ [language === 'ar' ? 'right' : 'left']: '12px' }} />
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                placeholder={t('contactUsPage.yourSubject')}
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg transition-all duration-200 shadow-sm"
                            />
                            <Tag size={24} className="absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 pointer-events-none" style={{ [language === 'ar' ? 'right' : 'left']: '12px' }} />
                        </div>
                        <div className="relative">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder={t('contactUsPage.yourEmail')}
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg transition-all duration-200 shadow-sm"
                            />
                            <Mail size={24} className="absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 pointer-events-none" style={{ [language === 'ar' ? 'right' : 'left']: '12px' }} />
                        </div>
                        <div className="relative">
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                placeholder={t('contactUsPage.yourPhone')}
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg transition-all duration-200 shadow-sm"
                            />
                            <Phone size={24} className="absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 pointer-events-none" style={{ [language === 'ar' ? 'right' : 'left']: '12px' }} />
                        </div>
                        <div className="md:col-span-2 relative">
                            <textarea
                                id="message"
                                name="message"
                                rows="7"
                                placeholder={t('contactUsPage.yourMessage')}
                                value={formData.message}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg transition-all duration-200 shadow-sm"
                            ></textarea>
                            <MessageSquare size={24} className="absolute top-4 text-gray-400 dark:text-gray-300 pointer-events-none" style={{ [language === 'ar' ? 'right' : 'left']: '12px' }} />
                        </div>

                        {/* Submission Message */}
                        {submissionMessage && (
                            <div className={`md:col-span-2 p-4 rounded-lg text-center font-medium flex items-center justify-center gap-3 transition-all duration-300 ease-in-out ${
                                submissionMessage.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
                            }`}>
                                {submissionMessage.type === 'success' ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                {submissionMessage.text}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="md:col-span-2 flex justify-center">
                            <button
                                type="submit"
                                disabled={isLoading} 
                                className={`flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
                                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin h-6 w-6 text-white inline-block mr-3" />
                                ) : (
                                    <Send size={24} className={`${language === 'ar' ? 'ml-3' : 'mr-3'}`} />
                                )}
                                {t('contactUsPage.submitMessage')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ContactUs;