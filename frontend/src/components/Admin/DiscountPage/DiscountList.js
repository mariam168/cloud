// components/Admin/DiscountPage/DiscountList.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaPlus, FaSpinner, FaCircle } from 'react-icons/fa'; // Added FaCircle for active status
import EditDiscountModal from './EditDiscountModal';
import AddDiscountPage from './AddDiscountPage';
import { useLanguage } from '../../LanguageContext';

const DiscountList = () => {
    const { t, language } = useLanguage();
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingDiscount, setEditingDiscount] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const SERVER_URL = 'http://localhost:5000';

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', options);
    };

    const fetchDiscounts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${SERVER_URL}/api/discounts`);
            setDiscounts(response.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch discounts:", err);
            setError((t('general.errorFetchingData') || 'Error fetching data: ') + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchDiscounts();
    }, [fetchDiscounts]);

    const handleDelete = async (discountId, discountCode) => {
        if (window.confirm(t('discountAdmin.confirmDelete', { discountCode }) || `Are you sure you want to delete discount code "${discountCode}"?`)) {
            try {
                await axios.delete(`${SERVER_URL}/api/discounts/${discountId}`);
                setDiscounts(prev => prev.filter(d => d._id !== discountId));
                alert(t('discountAdmin.deleteSuccess') || 'Discount deleted successfully!');
            } catch (err) {
                console.error("Error deleting discount:", err);
                alert(`${t('discountAdmin.errorDeletingDiscount') || 'Error deleting discount:'} ${err.response?.data?.message || err.message}`);
            }
        }
    };

    const handleActionSuccess = () => {
        fetchDiscounts(); // Re-fetch discounts after add/edit
        setShowEditModal(false);
        setShowAddModal(false);
        setEditingDiscount(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48 text-gray-700 dark:text-gray-300">
                <FaSpinner className="animate-spin text-4xl mr-3" />
                <p className="text-xl">{t('general.loading') || 'Loading...'}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-6 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg shadow-md max-w-md mx-auto my-8">
                <p className="font-semibold text-lg mb-2">{t('general.error') || 'Error'}</p>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900 rounded-lg shadow-xl min-h-[70vh]">
            {/* Header and Add Button */}
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                    {t('discountAdmin.discountListTitle') || 'Discount Codes'}
                </h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200 text-lg font-medium"
                >
                    <FaPlus className="text-xl" />
                    <span className="hidden sm:inline">{t('discountAdmin.addDiscountButton') || 'Add New Discount'}</span>
                    <span className="sm:hidden">{t('general.add') || 'Add'}</span>
                </button>
            </div>

            {/* Discount List */}
            {discounts.length === 0 ? (
                <div className="text-center py-10 text-gray-600 dark:text-gray-400">
                    <p className="text-lg">{t('discountAdmin.noDiscounts') || 'No discount codes found.'}</p>
                    <p className="mt-2">{t('discountAdmin.addFirstDiscount') || 'Click "Add New Discount" to create one.'}</p>
                </div>
            ) : (
                <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {t('discountAdmin.codeTable') || 'Code'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {t('discountAdmin.typeTable') || 'Type'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {t('discountAdmin.valueTable') || 'Value'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {t('discountAdmin.minOrderTable') || 'Min Order'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {t('discountAdmin.usageLimitTable') || 'Usage Limit'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {t('discountAdmin.validityTable') || 'Validity'}
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {t('discountAdmin.activeTable') || 'Active'}
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {t('discountAdmin.actionsTable') || 'Actions'}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {discounts.map(d => (
                                <tr key={d._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-white">
                                        {d.code}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                                        {d.percentage ? t('discountAdmin.percentageType') : t('discountAdmin.fixedAmountType')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                                        {d.percentage ? `${d.percentage}%` : `${d.fixedAmount?.toFixed(2)} ${t('shopPage.currencySymbol') || 'SAR'}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                                        {d.minOrderAmount ? `${d.minOrderAmount.toFixed(2)} ${t('shopPage.currencySymbol') || 'SAR'}` : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                                        {d.usageLimit ? `${d.usageCount || 0} / ${d.usageLimit}` : t('discountAdmin.noLimit') || 'No Limit'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                                        <div className="flex flex-col">
                                            <span>{t('discountAdmin.starts')}: {formatDate(d.startDate)}</span>
                                            <span>{t('discountAdmin.ends')}: {formatDate(d.endDate)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {d.isActive ? (
                                            <FaCircle className="text-green-500 text-sm inline-block" title={t('general.active') || 'Active'} />
                                        ) : (
                                            <FaCircle className="text-red-500 text-sm inline-block" title={t('general.inactive') || 'Inactive'} />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-lg">
                                        <button
                                            onClick={() => { setEditingDiscount(d); setShowEditModal(true); }}
                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mx-2 transition-colors duration-150"
                                            title={t('general.edit') || 'Edit'}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(d._id, d.code)}
                                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 mx-2 transition-colors duration-150"
                                            title={t('general.delete') || 'Delete'}
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

            {/* Edit Discount Modal */}
            {showEditModal && editingDiscount && (
                <EditDiscountModal
                    discount={editingDiscount}
                    onClose={() => setShowEditModal(false)}
                    onDiscountUpdated={handleActionSuccess}
                    serverUrl={SERVER_URL}
                />
            )}

            {/* Add Discount Modal (re-styled for consistency) */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-50 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl relative w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-95 animate-scale-in">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 text-3xl font-bold transition-colors duration-200"
                            aria-label={t('general.close') || 'Close'}
                        >
                            &times; {/* Using simple 'x' for close button */}
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white border-b pb-3 border-gray-200 dark:border-gray-700">
                            {t('discountAdmin.addDiscountTitle') || 'Add New Discount Code'}
                        </h2>
                        <AddDiscountPage onDiscountAdded={handleActionSuccess} serverUrl={SERVER_URL} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiscountList;