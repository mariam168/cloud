import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
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

    const fetchDiscounts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${SERVER_URL}/api/discounts`);
            setDiscounts(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching discounts:', err);
            setError((t('general.errorFetchingData') || 'Error fetching data: ') + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const handleDelete = async (discountId, discountCode) => {
        if (window.confirm(t('discountAdmin.confirmDelete', { discountCode }))) {
            try {
                await axios.delete(`${SERVER_URL}/api/discounts/${discountId}`);
                setDiscounts(prev => prev.filter(d => d._id !== discountId));
                alert(t('discountAdmin.deleteSuccess') || 'Discount deleted successfully!');
            } catch (err) {
                console.error('Error deleting discount:', err);
                alert((t('discountAdmin.errorDeletingDiscount') || 'An error occurred while deleting the discount.') + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleOpenEditModal = (discount) => {
        setEditingDiscount(discount);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingDiscount(null);
    };

    const handleDiscountUpdated = () => {
        fetchDiscounts();
        handleCloseEditModal();
    };

    const handleDiscountAdded = () => {
        fetchDiscounts();
        setShowAddModal(false);
    };

    if (loading) return <p className="text-center text-gray-600 dark:text-gray-300">{t('general.loading') || 'Loading...'}</p>;
    if (error) return <p className="text-center text-red-600 dark:text-red-400">{error}</p>;

    return (
        <div className="max-w-7xl mx-auto p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t('discountAdmin.discountListTitle') || 'Discount List'}</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200"
                >
                    <FaPlus /> {t('discountAdmin.addDiscountButton') || 'Add Discount'}
                </button>
            </div>
            {discounts.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center">{t('discountAdmin.noDiscounts') || 'No discounts to display currently.'}</p>
            ) : (
                <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
                    <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
                        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            <tr>
                                <th className="px-4 py-3">{t('discountAdmin.codeTable') || 'Code'}</th>
                                <th className="px-4 py-3">{t('discountAdmin.typeTable') || 'Type'}</th>
                                <th className="px-4 py-3">{t('discountAdmin.valueTable') || 'Value'}</th>
                                <th className="px-4 py-3">{t('discountAdmin.minOrderTable') || 'Min Order'}</th>
                                <th className="px-4 py-3">{t('discountAdmin.maxDiscountTable') || 'Max Discount'}</th>
                                <th className="px-4 py-3">{t('discountAdmin.startDateTable') || 'Start Date'}</th>
                                <th className="px-4 py-3">{t('discountAdmin.endDateTable') || 'End Date'}</th>
                                <th className="px-4 py-3">{t('discountAdmin.activeTable') || 'Active'}</th>
                                <th className="px-4 py-3 text-center">{t('discountAdmin.actionsTable') || 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {discounts.map(discount => (
                                <tr key={discount._id} className="border-t border-gray-200 dark:border-gray-700">
                                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                                        {discount.code}
                                    </td>
                                    <td className="px-4 py-3">
                                        {discount.percentage ? (
                                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs dark:bg-blue-900/30 dark:text-blue-300">
                                                {t('discountAdmin.percentageType') || 'Percentage'}
                                            </span>
                                        ) : (
                                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs dark:bg-purple-900/30 dark:text-purple-300">
                                                {t('discountAdmin.fixedAmountType') || 'Fixed Amount'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                        {discount.percentage ? `${discount.percentage}%` : `${t('shopPage.currencySymbol') || "$"}${discount.fixedAmount?.toFixed(2)}`}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                        {t('shopPage.currencySymbol') || "$"}{discount.minOrderAmount?.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                        {discount.maxDiscountAmount ? `${t('shopPage.currencySymbol') || "$"}${discount.maxDiscountAmount?.toFixed(2)}` : (t('general.none') || 'None')}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                        {new Date(discount.startDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                        {new Date(discount.endDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {discount.isActive ? (
                                            <span className="text-green-500">{t('general.yes') || 'Yes'}</span>
                                        ) : (
                                            <span className="text-red-500">{t('general.no') || 'No'}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => handleOpenEditModal(discount)}
                                            className="text-blue-600 hover:text-blue-800 mx-2 dark:text-blue-400 dark:hover:text-blue-600 transition-colors duration-200"
                                            title={t('adminCategoryPage.editCategory') || 'Edit'}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(discount._id, discount.code)}
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
            {showEditModal && editingDiscount && (
                <EditDiscountModal
                    discount={editingDiscount}
                    onClose={handleCloseEditModal}
                    onDiscountUpdated={handleDiscountUpdated}
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
                            &times;
                        </button>
                        <AddDiscountPage onDiscountAdded={handleDiscountAdded} serverUrl={SERVER_URL} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiscountList;