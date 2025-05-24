import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
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
    const SERVER_URL = 'http://localhost:5000'; 
    const formatDate = (dateString) => {
        if (!dateString) return t('general.notApplicable') || 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(language, options);
    };
    const fetchAdvertisements = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${SERVER_URL}/api/advertisements`);
            setAdvertisements(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching advertisements:', err);
            setError((t('general.errorFetchingData') || 'Error fetching data: ') + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchAdvertisements();
    }, []);
    const handleDelete = async (advertisementId, advertisementTitles) => {
        const advertisementTitle = advertisementTitles?.[language] || advertisementTitles?.en || advertisementTitles?.ar || t('general.unnamedItem');
        if (window.confirm(t('advertisementAdmin.confirmDelete', { advertisementTitle }))) {
            try {
                await axios.delete(`${SERVER_URL}/api/advertisements/${advertisementId}`);
                setAdvertisements(prev => prev.filter(a => a._id !== advertisementId));
                alert(t('advertisementAdmin.deleteSuccess') || 'Advertisement deleted successfully!');
            } catch (err) {
                console.error('Error deleting advertisement:', err);
                alert((t('advertisementAdmin.errorDeletingAdvertisement') || 'An error occurred while deleting the advertisement.') + (err.response?.data?.message || err.message));
            }
        }
    };
    const handleOpenEditModal = (advertisement) => {
        setEditingAdvertisement(advertisement);
        setShowEditModal(true);
    };
    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingAdvertisement(null);
    };
    const handleAdvertisementUpdated = () => {
        fetchAdvertisements();
        handleCloseEditModal();
    };

    const handleAdvertisementAdded = () => {
        fetchAdvertisements();
        setShowAddModal(false);
    };
    if (loading) return <p className="text-center text-gray-600 dark:text-gray-300">{t('general.loading') || 'Loading...'}</p>;
    if (error) return <p className="text-center text-red-600 dark:text-red-400">{error}</p>;
    return (
        <div className="max-w-7xl mx-auto p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t('advertisementAdmin.advertisementListTitle') || 'Advertisement List'}</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200"
                >
                    <FaPlus /> {t('advertisementAdmin.addAdvertisementButton') || 'Add Advertisement'}
                </button>
            </div>
            {advertisements.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center">{t('advertisementAdmin.noAdvertisements') || 'No advertisements to display currently.'}</p>
            ) : (
                <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
                    <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
                        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            <tr>
                                <th className="px-4 py-3">{t('advertisementAdmin.imageTable') || 'Image'}</th>
                                <th className="px-4 py-3">{t('advertisementAdmin.titleTable') || 'Title'}</th>
                                <th className="px-4 py-3">{t('advertisementAdmin.descriptionTable') || 'Description'}</th>
                                <th className="px-4 py-3">{t('advertisementAdmin.typeTable') || 'Type'}</th>
                                <th className="px-4 py-3">{t('advertisementAdmin.startDate') || 'Start Date'}</th>
                                <th className="px-4 py-3">{t('advertisementAdmin.endDate') || 'End Date'}</th>
                                <th className="px-4 py-3">{t('advertisementAdmin.originalPrice') || 'Original Price'}</th>
                                <th className="px-4 py-3">{t('advertisementAdmin.discountedPrice') || 'Discounted Price'}</th>
                                <th className="px-4 py-3">{t('advertisementAdmin.currency') || 'Currency'}</th>
                                <th className="px-4 py-3">{t('advertisementAdmin.activeTable') || 'Active'}</th>
                                <th className="px-4 py-3">{t('advertisementAdmin.orderTable') || 'Order'}</th>
                                <th className="px-4 py-3 text-center">{t('advertisementAdmin.actionsTable') || 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {advertisements.map(advertisement => (
                                <tr key={advertisement._id} className="border-t border-gray-200 dark:border-gray-700">
                                    <td className="px-4 py-3">
                                        <img
                                            src={advertisement.image ? `${SERVER_URL}${advertisement.image}` : ''} 
                                            alt={advertisement.title?.[language] || advertisement.title?.en || advertisement.title?.ar || t('general.unnamedItem')}
                                            className="w-16 h-16 object-cover rounded border border-gray-200 dark:border-gray-600"
                                        />
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                                        {advertisement.title?.[language] || advertisement.title?.en || advertisement.title?.ar || t('general.unnamedItem')}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                        {advertisement.description?.[language] || advertisement.description?.en || advertisement.description?.ar || (t('advertisementAdmin.noDescription') || 'No Description')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs dark:bg-blue-900/30 dark:text-blue-300">
                                            {advertisement.type || (t('advertisementAdmin.unknownType') || 'Unknown')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{formatDate(advertisement.startDate)}</td>
                                    <td className="px-4 py-3">{formatDate(advertisement.endDate)}</td>
                                    <td className="px-4 py-3">
                                        {advertisement.originalPrice !== null ? advertisement.originalPrice : (t('general.notApplicable') || 'N/A')}
                                    </td>
                                    <td className="px-4 py-3">
                                        {advertisement.discountedPrice !== null ? advertisement.discountedPrice : (t('general.notApplicable') || 'N/A')}
                                    </td>
                                    <td className="px-4 py-3">
                                        {advertisement.currency || (t('general.notApplicable') || 'N/A')}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {advertisement.isActive ? (
                                            <span className="text-green-500">{t('general.yes') || 'Yes'}</span>
                                        ) : (
                                            <span className="text-red-500">{t('general.no') || 'No'}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {advertisement.order}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => handleOpenEditModal(advertisement)}
                                            className="text-blue-600 hover:text-blue-800 mx-2 dark:text-blue-400 dark:hover:text-blue-600 transition-colors duration-200"
                                            title={t('adminCategoryPage.editCategory') || 'Edit'}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(advertisement._id, advertisement.title)}
                                            className="text-red-600 hover:text-red-800 mx-2 dark:text-red-400 dark:hover:text-red-600 transition-colors duration-200"
                                            title={t('adminCategoryPage.deleteCategory') || 'Delete'}
                                        >
                                            <FaTrashAlt />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {showEditModal && editingAdvertisement && (
                <EditAdvertisementModal
                    advertisement={editingAdvertisement}
                    onClose={handleCloseEditModal}
                    onAdvertisementUpdated={handleAdvertisementUpdated}
                    serverUrl={SERVER_URL}
                />
            )}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg relative w-full max-w-xl max-h-[90vh] overflow-y-auto transition-colors duration-300">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-2 right-4 text-xl font-bold text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
                        >
                            ×
                        </button>
                        <AddAdvertisementPage onAdvertisementAdded={handleAdvertisementAdded} serverUrl={SERVER_URL} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvertisementList;