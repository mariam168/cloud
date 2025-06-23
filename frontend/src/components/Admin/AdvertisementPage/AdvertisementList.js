// components/Admin/AdvertisementPage/AdvertisementList.js
import React, { useState, useEffect, useCallback } from 'react';
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

    const fetchAdvertisements = useCallback(async () => {
        try {
            setLoading(true);
            // ✅ مصحح: إضافة هيدر لضمان أن بيانات productRef المضمنة تأتي كاملة اللغات
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
    }, [t, language]); // Added dependencies

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
        fetchAdvertisements();
        setShowEditModal(false);
        setShowAddModal(false);
        setEditingAdvertisement(null);
    };

    if (loading) return <p className="text-center text-gray-600 dark:text-gray-300">{t('general.loading') || 'Loading...'}</p>;
    if (error) return <p className="text-center text-red-600 dark:text-red-400">{error}</p>;

    return (
        <div className="max-w-7xl mx-auto p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t('advertisementAdmin.advertisementListTitle')}</h2>
                <button onClick={() => setShowAddModal(true)} className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700">
                    <FaPlus /> {t('advertisementAdmin.addAdvertisementButton')}
                </button>
            </div>
            
            {/* Table and Modals remain largely the same, but with corrected prop passing */}
            <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
                <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
                     {/* ... table head ... */}
                     <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        <tr>
                            <th className="px-4 py-3">Image</th>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Linked Product</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Dates</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Active</th>
                            <th className="px-4 py-3">Order</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {advertisements.map(ad => (
                            <tr key={ad._id} className="border-t border-gray-200 dark:border-gray-700">
                                <td className="px-4 py-3"><img src={`${SERVER_URL}${ad.image}`} alt={ad.title.en} className="w-16 h-16 object-cover rounded"/></td>
                                <td className="px-4 py-3 font-semibold">{ad.title?.[language] || ad.title.en}</td>
                                <td className="px-4 py-3">{ad.productRef ? (ad.productRef.name?.[language] || ad.productRef.name.en) : 'N/A'}</td>
                                <td className="px-4 py-3">{ad.type}</td>
                                <td className="px-4 py-3">{formatDate(ad.startDate)} - {formatDate(ad.endDate)}</td>
                                <td className="px-4 py-3">{ad.discountedPrice ?? ad.originalPrice ?? 'N/A'} {ad.currency}</td>
                                <td className="px-4 py-3">{ad.isActive ? 'Yes' : 'No'}</td>
                                <td className="px-4 py-3">{ad.order}</td>
                                <td className="px-4 py-3 text-center">
                                    <button onClick={() => { setEditingAdvertisement(ad); setShowEditModal(true); }} className="text-blue-600 mx-2"><FaEdit /></button>
                                    <button onClick={() => handleDelete(ad._id, ad.title)} className="text-red-600 mx-2"><FaTrashAlt /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showEditModal && editingAdvertisement && (
                <EditAdvertisementModal advertisement={editingAdvertisement} onClose={() => setShowEditModal(false)} onAdvertisementUpdated={handleActionSuccess} serverUrl={SERVER_URL} />
            )}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg relative w-full max-w-xl max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-2 right-4 text-xl font-bold">×</button>
                        <AddAdvertisementPage onAdvertisementAdded={handleActionSuccess} serverUrl={SERVER_URL} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvertisementList;