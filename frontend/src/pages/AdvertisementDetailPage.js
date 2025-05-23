// src/pages/AdvertisementDetailPage.jsx (or wherever you keep your pages)
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../components/LanguageContext'; // Adjust path as needed

const AdvertisementDetailPage = ({ serverUrl = 'http://localhost:5000' }) => {
    const { id } = useParams(); // Get the ID from the URL parameter
    const { t, language } = useLanguage();
    const [advertisement, setAdvertisement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAdvertisement = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${serverUrl}/api/advertisements/${id}`);
                setAdvertisement(response.data);
            } catch (err) {
                console.error('Error fetching advertisement details:', err);
                setError(t('general.errorFetchingData') || 'Failed to load advertisement details.');
            } finally {
                setLoading(false);
            }
        };
        fetchAdvertisement();
    }, [id, serverUrl, t]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-gray-300">
                {t('general.loading') || 'Loading advertisement...'}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                {t('general.error') || 'Error'}: {error}
            </div>
        );
    }

    if (!advertisement) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-gray-300">
                {t('advertisementDetail.notFound') || 'Advertisement not found.'}
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8 bg-white dark:bg-slate-800 shadow-lg rounded-lg my-12 transition-colors duration-500">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-teal-300 mb-6 text-center">
                {advertisement.title?.[language] || advertisement.title?.en || t('general.unnamedItem')}
            </h1>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {advertisement.image && (
                    <div className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 flex justify-center items-center">
                        <img
                            src={`${serverUrl}${advertisement.image}`}
                            alt={advertisement.title?.[language] || advertisement.title?.en}
                            className="max-w-full h-auto rounded-lg shadow-md object-contain"
                        />
                    </div>
                )}
                <div className="flex-1 text-center md:text-left">
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                        {advertisement.description?.[language] || advertisement.description?.en || t('advertisementAdmin.noDescription')}
                    </p>
                    {advertisement.link && advertisement.link !== '#' && (
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                                {t('advertisementDetail.learnMore') || 'Learn More:'}
                            </h3>
                            <a
                                href={advertisement.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
                            >
                                {t('advertisementDetail.visitLink') || 'Visit Offer Link'}
                            </a>
                        </div>
                    )}
                    <p className="text-md text-gray-600 dark:text-gray-400">
                        <strong>{t('advertisementDetail.type') || 'Type'}:</strong> {advertisement.type}
                    </p>
                    <p className="text-md text-gray-600 dark:text-gray-400">
                        <strong>{t('advertisementDetail.active') || 'Active'}:</strong> {advertisement.isActive ? (t('general.yes') || 'Yes') : (t('general.no') || 'No')}
                    </p>
                    {advertisement.order !== undefined && (
                           <p className="text-md text-gray-600 dark:text-gray-400">
                               <strong>{t('advertisementDetail.order') || 'Order'}:</strong> {advertisement.order}
                           </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdvertisementDetailPage;