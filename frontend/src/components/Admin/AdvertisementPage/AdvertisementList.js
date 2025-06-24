import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaPlus, FaSearch, FaInfoCircle, FaSpinner } from 'react-icons/fa';
import EditAdvertisementModal from './EditAdvertisementModal';
import AddAdvertisementPage from './AddAdvertisementPage';
import { useLanguage } from '../../LanguageContext'; // Assuming this path is correct

const AdvertisementList = () => {
    const { t, language } = useLanguage();
    const [advertisements, setAdvertisements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingAdvertisement, setEditingAdvertisement] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Ensure SERVER_URL is correctly defined, consider making it an environment variable
    const SERVER_URL = 'http://localhost:5000';

    const formatDate = (dateString) => {
        if (!dateString) return t('general.notApplicable') || 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(language, options);
    };

    const fetchAdvertisements = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${SERVER_URL}/api/advertisements`, {
                headers: { 'x-admin-request': 'true' }
            });
            setAdvertisements(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching advertisements:', err);
            setError((t('general.errorFetchingData') || 'Error fetching data: ') + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchAdvertisements();
    }, [fetchAdvertisements]);

    const handleDelete = async (advertisementId, advertisementTitles) => {
        const advertisementTitle = advertisementTitles?.[language] || advertisementTitles?.en || advertisementTitles?.ar || t('general.unnamedItem');
        if (window.confirm(t('advertisementAdmin.confirmDelete', { advertisementTitle }))) {
            try {
                await axios.delete(`${SERVER_URL}/api/advertisements/${advertisementId}`);
                setAdvertisements(prev => prev.filter(a => a._id !== advertisementId));
                alert(t('advertisementAdmin.deleteSuccess') || 'Advertisement deleted successfully!');
            } catch (err) {
                console.error('Error deleting advertisement:', err);
                alert((t('advertisementAdmin.errorDeletingAdvertisement') || 'An error occurred.') + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleActionSuccess = () => {
        fetchAdvertisements(); // Re-fetch to ensure the list is up-to-date
        setShowEditModal(false);
        setShowAddModal(false);
        setEditingAdvertisement(null);
    };

    // Filter advertisements based on search term
    const filteredAdvertisements = useMemo(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return advertisements.filter(ad => {
            const titleMatch = (ad.title?.en?.toLowerCase().includes(lowerCaseSearchTerm) ||
                                ad.title?.ar?.toLowerCase().includes(lowerCaseSearchTerm));
            const productMatch = ad.productRef && (
                ad.productRef.name?.en?.toLowerCase().includes(lowerCaseSearchTerm) ||
                ad.productRef.name?.ar?.toLowerCase().includes(lowerCaseSearchTerm)
            );
            return titleMatch || productMatch;
        });
    }, [advertisements, searchTerm]);


    return (
        <div className="max-w-7xl mx-auto p-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl my-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex-grow">
                    {t('advertisementAdmin.advertisementListTitle')}
                </h2>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder={t('general.search') || 'Search...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        />
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
                    </div>
                    {/* Add Advertisement Button */}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-full md:w-auto bg-green-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-700 transition duration-300 flex items-center justify-center gap-2 font-semibold"
                    >
                        <FaPlus /> {t('advertisementAdmin.addAdvertisementButton')}
                    </button>
                </div>
            </div>

            {/* Loading, Error, and Empty States */}
            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[300px] text-blue-600 dark:text-blue-400">
                    <FaSpinner className="animate-spin text-5xl mb-4" />
                    <p className="text-lg">{t('general.loading') || 'Loading advertisements...'}</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center min-h-[300px] text-red-600 dark:text-red-400 p-4">
                    <FaInfoCircle className="text-5xl mb-4" />
                    <p className="text-xl font-semibold mb-2">{t('general.errorOccurred') || 'Error Occurred!'}</p>
                    <p className="text-lg text-center">{error}</p>
                    <button
                        onClick={fetchAdvertisements}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                        {t('general.tryAgain') || 'Try Again'}
                    </button>
                </div>
            ) : filteredAdvertisements.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-500 dark:text-gray-400 p-4">
                    <FaInfoCircle className="text-5xl mb-4" />
                    <p className="text-xl font-semibold mb-2">
                        {searchTerm ? (t('general.noResultsFound') || 'No advertisements found for your search.') : (t('advertisementAdmin.noAdvertisements') || 'No advertisements added yet.')}
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-300 flex items-center justify-center gap-2 font-semibold"
                        >
                            <FaPlus /> {t('advertisementAdmin.addFirstAdvertisement') || 'Add First Advertisement'}
                        </button>
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto bg-gray-50 dark:bg-gray-800 shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
                        <thead className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 uppercase text-xs">
                            <tr>
                                <th scope="col" className="px-4 py-3 whitespace-nowrap">{t('advertisementAdmin.tableHeader.image') || 'Image'}</th>
                                <th scope="col" className="px-4 py-3 whitespace-nowrap">{t('advertisementAdmin.tableHeader.title') || 'Title'}</th>
                                <th scope="col" className="px-4 py-3 whitespace-nowrap">{t('advertisementAdmin.tableHeader.linkedProduct') || 'Linked Product'}</th>
                                <th scope="col" className="px-4 py-3 whitespace-nowrap">{t('advertisementAdmin.tableHeader.type') || 'Type'}</th>
                                <th scope="col" className="px-4 py-3 whitespace-nowrap">{t('advertisementAdmin.tableHeader.dates') || 'Dates'}</th>
                                <th scope="col" className="px-4 py-3 whitespace-nowrap">{t('advertisementAdmin.tableHeader.price') || 'Price'}</th>
                                <th scope="col" className="px-4 py-3 whitespace-nowrap">{t('advertisementAdmin.tableHeader.active') || 'Active'}</th>
                                <th scope="col" className="px-4 py-3 whitespace-nowrap">{t('advertisementAdmin.tableHeader.order') || 'Order'}</th>
                                <th scope="col" className="px-4 py-3 text-center whitespace-nowrap">{t('general.actions') || 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAdvertisements.map(ad => (
                                <tr key={ad._id} className="border-b last:border-b-0 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150">
                                    <td className="px-4 py-3">
                                        <img
                                            src={`${SERVER_URL}${ad.image}`}
                                            alt={ad.title?.[language] || ad.title?.en || t('general.unnamedItem')}
                                            className="w-16 h-16 object-cover rounded-md shadow-sm border border-gray-300 dark:border-gray-600"
                                        />
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                                        {ad.title?.[language] || ad.title?.en || t('general.unnamedItem')}
                                    </td>
                                    <td className="px-4 py-3">
                                        {ad.productRef ? (ad.productRef.name?.[language] || ad.productRef.name?.en || t('general.notApplicable')) : (t('general.notApplicable') || 'N/A')}
                                    </td>
                                    <td className="px-4 py-3 capitalize">{ad.type || (t('general.notApplicable') || 'N/A')}</td>
                                    <td className="px-4 py-3 text-xs">
                                        {formatDate(ad.startDate)} - <br/> {formatDate(ad.endDate)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {ad.discountedPrice ? (
                                            <>
                                                <span className="font-bold text-green-600 dark:text-green-400">{ad.discountedPrice} {ad.currency}</span>
                                                {ad.originalPrice && ad.originalPrice !== ad.discountedPrice && (
                                                    <span className="line-through text-gray-500 dark:text-gray-400 ml-2 text-xs">{ad.originalPrice} {ad.currency}</span>
                                                )}
                                            </>
                                        ) : ad.originalPrice ? (
                                            <span className="font-bold">{ad.originalPrice} {ad.currency}</span>
                                        ) : (t('general.notApplicable') || 'N/A')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ad.isActive ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                                            {ad.isActive ? (t('general.yes') || 'Yes') : (t('general.no') || 'No')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{ad.order ?? (t('general.notApplicable') || 'N/A')}</td>
                                    <td className="px-4 py-3 text-center whitespace-nowrap">
                                        <button
                                            onClick={() => { setEditingAdvertisement(ad); setShowEditModal(true); }}
                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-500 mx-2 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200"
                                            title={t('general.edit') || 'Edit'}
                                        >
                                            <FaEdit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ad._id, ad.title)}
                                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-500 mx-2 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-200"
                                            title={t('general.delete') || 'Delete'}
                                        >
                                            <FaTrashAlt size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Advertisement Modal */}
            {showEditModal && editingAdvertisement && (
                <EditAdvertisementModal advertisement={editingAdvertisement} onClose={() => setShowEditModal(false)} onAdvertisementUpdated={handleActionSuccess} serverUrl={SERVER_URL} />
            )}

            {/* Add Advertisement Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl relative w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-95 animate-scale-in">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 text-3xl font-bold transition-colors duration-200"
                            aria-label={t('general.close') || 'Close'}
                        >
                            &times;
                        </button>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b pb-3 border-gray-200 dark:border-gray-700">
                            {t('advertisementAdmin.addAdvertisementTitle') || 'Add New Advertisement'}
                        </h3>
                        <AddAdvertisementPage onAdvertisementAdded={handleActionSuccess} serverUrl={SERVER_URL} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvertisementList;