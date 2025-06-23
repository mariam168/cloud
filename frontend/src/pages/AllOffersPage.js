import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLanguage } from '../components/LanguageContext';
import { Loader2, Info } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext'; 

const AllOffersPage = () => {
    const { t } = useLanguage();
    const { API_BASE_URL } = useAuth();

    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAllOffers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${API_BASE_URL}/api/advertisements?isActive=true`);
            
            const offersWithProducts = response.data.filter(offer => offer.productRef);
            
            setOffers(offersWithProducts.sort((a, b) => (a.order || 0) - (b.order || 0) || new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            console.error("Error fetching all offers:", err.response?.data?.message || err.message);
            setError(t('general.errorFetchingData'));
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, t]);

    useEffect(() => {
        fetchAllOffers();
    }, [fetchAllOffers]);

    if (loading) {
        return (
            <section className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center text-gray-700 dark:text-gray-300">
                    <Loader2 size={64} className="text-blue-500 animate-spin mb-4" />
                    <span className="text-2xl">{t('general.loading')}</span>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <Info size={64} className="mx-auto mb-6 text-red-500" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('general.error')}</h2>
                    <p className="text-lg text-red-600 dark:text-red-300">{error}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full bg-gray-50 dark:bg-gray-900 py-16 px-4 md:px-8">
            <div className="container mx-auto max-w-7xl">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-12 text-center">
                    {t('allOffersPage.title')}
                </h1>

                {offers.length === 0 ? (
                    <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                        <Info size={64} className="mx-auto mb-6 text-blue-500" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('allOffersPage.noOffersTitle')}</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400">{t('allOffersPage.noOffers')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"> 
                        {offers.map(offer => (
                            <ProductCard
                                key={offer._id}
                                product={offer.productRef}
                                advertisement={offer}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default AllOffersPage;