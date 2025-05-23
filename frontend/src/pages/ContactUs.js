import React, { useState } from 'react';
import { useLanguage } from "../components/LanguageContext"; // Adjust path if needed

const ContactUs = () => {
    const { t, language } = useLanguage(); // Get language from context to set dir

    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        email: '',
        phone: '',
        message: '',
    });

    const [submissionMessage, setSubmissionMessage] = useState(null); // State for message
    const [isLoading, setIsLoading] = useState(false); // State for loading indicator

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionMessage(null); // Clear previous messages
        setIsLoading(true); // Set loading to true

        // Log the API URL to console for debugging
        const apiUrl = process.env.REACT_APP_API_URL;
        console.log('API URL from .env (ContactUs.jsx):', apiUrl);

        if (!apiUrl) {
            setSubmissionMessage({
                type: 'error',
                text: 'API URL is not defined. Please ensure REACT_APP_API_URL is set in your frontend .env file and restart the development server.'
            });
            setIsLoading(false);
            return; // Stop execution if API URL is missing
        }

        const endpoint = `${apiUrl}/api/contact`;
        console.log('Full API Endpoint (ContactUs.jsx):', endpoint);


        try {
            // Make the actual API call to your backend
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSubmissionMessage({ type: 'success', text: t('contactUsPage.successMessage') || 'Message submitted successfully!' });
                setFormData({
                    name: '',
                    subject: '',
                    email: '',
                    phone: '',
                    message: '',
                });
            } else {
                // Attempt to parse JSON error, fallback to text if not JSON
                const contentType = response.headers.get("content-type");
                let errorText = 'Failed to submit message.';
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errorData = await response.json();
                    errorText = errorData.message || errorText;
                } else {
                    errorText = await response.text(); // Read as text if not JSON
                }

                setSubmissionMessage({ type: 'error', text: errorText || t('contactUsPage.errorMessage') || 'Failed to submit message.' });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmissionMessage({ type: 'error', text: t('contactUsPage.errorMessage') || 'An error occurred during submission. Please check your network connection or server logs.' });
        } finally {
            setIsLoading(false); // Set loading to false regardless of success or failure
        }
    };

    return (
        <section className="w-full bg-white dark:bg-gray-900 py-12 px-4 md:px-8 lg:px-12 transition-colors duration-300">
            <div className="max-w-screen-md mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                        {t('contactUsPage.title') || 'Contact Us'}
                    </h2>
                    <p className="mt-3 text-base sm:text-lg text-gray-700 dark:text-gray-300">
                        {t('contactUsPage.description') || 'Have any questions or need assistance? Feel free to reach out to us. Our team is available to help you with any inquiries regarding our services and support.'}
                    </p>
                </div>

                <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg shadow-xl">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        <div>
                            <label htmlFor="name" className="sr-only">{t('contactUsPage.yourName') || 'Your Name'}</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder={t('contactUsPage.yourName') || 'Your Name'}
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="subject" className="sr-only">{t('contactUsPage.yourSubject') || 'Your Subject'}</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                placeholder={t('contactUsPage.yourSubject') || 'Your Subject'}
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="sr-only">{t('contactUsPage.yourEmail') || 'Your Email'}</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder={t('contactUsPage.yourEmail') || 'Your Email'}
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="sr-only">{t('contactUsPage.yourPhone') || 'Your Phone'}</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                placeholder={t('contactUsPage.yourPhone') || 'Your Phone'}
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="message" className="sr-only">{t('contactUsPage.yourMessage') || 'Your Message'}</label>
                            <textarea
                                id="message"
                                name="message"
                                rows="6"
                                placeholder={t('contactUsPage.yourMessage') || 'Your Message'}
                                value={formData.message}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            ></textarea>
                        </div>
                        {submissionMessage && (
                            <div className={`md:col-span-2 p-3 rounded-md text-center ${
                                submissionMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {submissionMessage.text}
                            </div>
                        )}
                        <div className="md:col-span-2 flex justify-center md:justify-start">
                            <button
                                type="submit"
                                disabled={isLoading} // Disable button while loading
                                className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5 text-white inline-block mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    t('contactUsPage.submitMessage') || 'Submit Message'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ContactUs;