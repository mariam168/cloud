import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Edit, Trash, Plus, Search, Info, Loader2, X } from 'lucide-react';
import EditAdvertisementModal from './EditAdvertisementModal';
import AddAdvertisementPage from './AddAdvertisementPage';
import { useLanguage } from '../../LanguageContext';

const AdvertisementList = () => {
    const { t, language } = useLanguage();
    const [advertisements, setAdvertisements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingAdvertisement, setEditingAdvertisement] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const SERVER_URL = 'http://localhost:5000';

    const formatDate = (dateString) => {
        if (!dateString) return t('general.notApplicable');
        return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-GB', {
            year: 'numeric', month: 'short', day: 'numeric'
        }).format(new Date(dateString));
    };

    const fetchAdvertisements = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${SERVER_URL}/api/advertisements`, {
                headers: { 'Accept-Language': language, 'x-admin-request': 'true' }
            });
            setAdvertisements(response.data);
            setError(null);
        } catch (err) {
            setError(t('general.errorFetchingData'));
        } finally {
            setLoading(false);
        }
    }, [SERVER_URL, language, t]);

    useEffect(() => {
        fetchAdvertisements();
    }, [fetchAdvertisements]);

    const handleDelete = async (advertisementId, advertisementTitles) => {
        const advertisementTitle = advertisementTitles?.[language] || advertisementTitles?.en || t('general.unnamedItem');
        if (window.confirm(t('advertisementAdmin.confirmDelete', { advertisementTitle }))) {
            try {
                await axios.delete(`${SERVER_URL}/api/advertisements/${advertisementId}`);
                setAdvertisements(prev => prev.filter(a => a._id !== advertisementId));
                alert(t('advertisementAdmin.deleteSuccess'));
            } catch (err) {
                alert(err.response?.data?.message || t('advertisementAdmin.errorDeletingAdvertisement'));
            }
        }
    };

    const handleActionSuccess = () => {
        fetchAdvertisements();
        setShowEditModal(false);
        setShowAddModal(false);
        setEditingAdvertisement(null);
    };

    const filteredAdvertisements = useMemo(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return advertisements.filter(ad => {
            const titleMatch = ad.title?.en?.toLowerCase().includes(lowerCaseSearchTerm) ||
                                ad.title?.ar?.toLowerCase().includes(lowerCaseSearchTerm);
            const productMatch = ad.productRef && (
                ad.productRef.name?.en?.toLowerCase().includes(lowerCaseSearchTerm) ||
                ad.productRef.name?.ar?.toLowerCase().includes(lowerCaseSearchTerm)
            );
            return titleMatch || productMatch;
        });
    }, [advertisements, searchTerm]);

    if (loading) {
        return (
            <div className="flex min-h-[80vh] w-full items-center justify-center">
                <Loader2 size={48} className="animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[80vh] w-full items-center justify-center p-4">
                <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800">
                    <Info size={48} className="mx-auto mb-5 text-red-500" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('general.error')}</h2>
                    <p className="text-base text-red-600 dark:text-red-400">{error}</p>
                    <button onClick={fetchAdvertisements} className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
                        {t('general.tryAgain')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-zinc-800">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t('advertisementAdmin.advertisementListTitle')}
                </h1>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-60">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-zinc-500" />
                        <input
                            type="text"
                            placeholder={t('general.search')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border-gray-200 bg-gray-50 p-2.5 pl-9 text-sm text-gray-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                        />
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 dark:bg-white dark:text-black dark:hover:bg-indigo-500"
                    >
                        <Plus size={16} />
                        {t('advertisementAdmin.addAdvertisementButton')}
                    </button>
                </div>
            </header>

            {filteredAdvertisements.length === 0 ? (
                <div className="text-center py-16">
                    <Info size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                        {searchTerm ? t('general.noResultsFound') : t('advertisementAdmin.noAdvertisements')}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
                        {searchTerm ? t('general.tryDifferentKeywords') : t('advertisementAdmin.getStartedByAdding')}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-zinc-800/50">
                            <tr>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-left">{t('advertisementAdmin.tableHeader.image')}</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-left">{t('advertisementAdmin.tableHeader.title')}</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-left">{t('advertisementAdmin.tableHeader.linkedProduct')}</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-left">{t('advertisementAdmin.tableHeader.type')}</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-left">{t('advertisementAdmin.tableHeader.dates')}</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-left">{t('advertisementAdmin.tableHeader.price')}</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-center">{t('advertisementAdmin.tableHeader.active')}</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-center">{t('advertisementAdmin.tableHeader.order')}</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-center">{t('general.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {filteredAdvertisements.map(ad => (
                                <tr key={ad._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <img src={`${SERVER_URL}${ad.image}`} alt={ad.title?.[language]} className="h-12 w-12 rounded-md object-cover" />
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-800 dark:text-white">{ad.title?.[language] || ad.title?.en}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-zinc-400">{ad.productRef?.name?.[language] || ad.productRef?.name?.en || t('general.notApplicable')}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-zinc-400 capitalize">{ad.type || t('general.notApplicable')}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-zinc-400">{formatDate(ad.startDate)} - {formatDate(ad.endDate)}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-zinc-400">
                                        {ad.discountedPrice != null ? (
                                            <>
                                                <span className="font-semibold text-green-600">{ad.discountedPrice} {ad.currency}</span>
                                                {ad.originalPrice != null && <span className="ml-2 text-xs line-through">{ad.originalPrice} {ad.currency}</span>}
                                            </>
                                        ) : (t('general.notApplicable'))}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-center">
                                        <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ad.isActive ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
                                            {ad.isActive ? t('general.yes') : t('general.no')}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-zinc-400 text-center">{ad.order ?? t('general.notApplicable')}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-center">
                                        <div className="inline-flex items-center rounded-md -space-x-px bg-gray-100 dark:bg-zinc-800 text-xs">
                                            <button onClick={() => { setEditingAdvertisement(ad); setShowEditModal(true); }} className="inline-block rounded-l-md p-2 text-gray-600 hover:bg-gray-200 hover:text-indigo-600 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-indigo-400 focus:relative">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(ad._id, ad.title)} className="inline-block rounded-r-md p-2 text-gray-600 hover:bg-gray-200 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-red-400 focus:relative">
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {showEditModal && editingAdvertisement && (
                <EditAdvertisementModal advertisement={editingAdvertisement} onClose={() => setShowEditModal(false)} onAdvertisementUpdated={handleActionSuccess} serverUrl={SERVER_URL} />
            )}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg relative w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-zinc-800">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:text-zinc-500 dark:hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            {t('advertisementAdmin.addAdvertisementTitle')}
                        </h3>
                        <AddAdvertisementPage onAdvertisementAdded={handleActionSuccess} serverUrl={SERVER_URL} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvertisementList;