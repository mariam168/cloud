import React, { useState } from 'react';
import { useLanguage } from "../components/LanguageContext"; 
const ContactUs = () => {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <section className="w-full bg-white dark:bg-gray-900 py-12 px-4 md:px-8 lg:px-12 transition-colors duration-300">
      <div className="max-w-screen-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            {t.contactUsTitle || 'Contact Us'}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-gray-700 dark:text-gray-300">
            {t.contactUsDescription || 'Have any questions or need assistance? Feel free to reach out to us. Our team is available to help you with any inquiries regarding our services and support.'}
          </p>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg shadow-xl">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="sr-only">{t.yourName || 'Your Name'}</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder={t.yourName || 'Your Name'}
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="subject" className="sr-only">{t.yourSubject || 'Your Subject'}</label>
              <input
                type="text"
                id="subject"
                name="subject"
                placeholder={t.yourSubject || 'Your Subject'}
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">{t.yourEmail || 'Your Email'}</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder={t.yourEmail || 'Your Email'}
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="phone" className="sr-only">{t.yourPhone || 'Your Phone'}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder={t.yourPhone || 'Your Phone'}
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="message" className="sr-only">{t.yourMessage || 'Your Message'}</label>
              <textarea
                id="message"
                name="message"
                rows="6"
                placeholder={t.yourMessage || 'Your Message'}
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
            <div className="md:col-span-2 flex justify-center md:justify-start">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                {t.submitMessage || 'Submit Message'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
