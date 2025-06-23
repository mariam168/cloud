// components/Admin/DiscountPage/DiscountList.js
import React, { useState, useEffect, useCallback } from 'react';
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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const fetchDiscounts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${SERVER_URL}/api/discounts`);
            setDiscounts(response.data);
            setError(null);
        } catch (err) {
            setError((t('general.errorFetchingData') || 'Error fetching data: ') + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchDiscounts();
    }, [fetchDiscounts]);

    const handleDelete = async (discountId, discountCode) => {
        if (window.confirm(t('discountAdmin.confirmDelete', { discountCode }))) {
            try {
                await axios.delete(`${SERVER_URL}/api/discounts/${discountId}`);
                setDiscounts(prev => prev.filter(d => d._id !== discountId));
                alert(t('discountAdmin.deleteSuccess'));
            } catch (err) {
                alert(`${t('discountAdmin.errorDeletingDiscount')} ${err.response?.data?.message || err.message}`);
            }
        }
    };
    
    const handleActionSuccess = () => {
        fetchDiscounts();
        setShowEditModal(false);
        setShowAddModal(false);
        setEditingDiscount(null);
    };

    if (loading) return <p className="text-center">{t('general.loading')}</p>;
    if (error) return <p className="text-center text-red-600">{error}</p>;

    return (
        <div className="max-w-7xl mx-auto p-4 bg-gray-100 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">{t('discountAdmin.discountListTitle')}</h2>
                <button onClick={() => setShowAddModal(true)} className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700">
                    <FaPlus /> {t('discountAdmin.addDiscountButton')}
                </button>
            </div>
            {discounts.length === 0 ? (
                <p className="text-center">{t('discountAdmin.noDiscounts')}</p>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3">{t('discountAdmin.codeTable')}</th>
                                <th className="px-4 py-3">{t('discountAdmin.typeTable')}</th>
                                <th className="px-4 py-3">{t('discountAdmin.valueTable')}</th>
                                <th className="px-4 py-3">{t('discountAdmin.minOrderTable')}</th>
                                <th className="px-4 py-3">{t('discountAdmin.validityTable')}</th>
                                <th className="px-4 py-3">{t('discountAdmin.activeTable')}</th>
                                <th className="px-4 py-3 text-center">{t('discountAdmin.actionsTable')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {discounts.map(d => (
                                <tr key={d._id} className="border-t">
                                    <td className="px-4 py-3 font-semibold">{d.code}</td>
                                    <td className="px-4 py-3">{d.percentage ? t('discountAdmin.percentageType') : t('discountAdmin.fixedAmountType')}</td>
                                    <td className="px-4 py-3">{d.percentage ? `${d.percentage}%` : `${d.fixedAmount?.toFixed(2)} ${t('shopPage.currencySymbol')}`}</td>
                                    <td className="px-4 py-3">{d.minOrderAmount?.toFixed(2)} {t('shopPage.currencySymbol')}</td>
                                    <td className="px-4 py-3">{formatDate(d.startDate)} - {formatDate(d.endDate)}</td>
                                    <td className="px-4 py-3 text-center">{d.isActive ? <span className="text-green-500">✔</span> : <span className="text-red-500">✖</span>}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => { setEditingDiscount(d); setShowEditModal(true); }} className="text-blue-600 mx-2"><FaEdit /></button>
                                        <button onClick={() => handleDelete(d._id, d.code)} className="text-red-600 mx-2"><FaTrashAlt /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {showEditModal && editingDiscount && (
                <EditDiscountModal discount={editingDiscount} onClose={() => setShowEditModal(false)} onDiscountUpdated={handleActionSuccess} serverUrl={SERVER_URL} />
            )}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-xl max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-2 right-4 text-xl font-bold">×</button>
                        <AddDiscountPage onDiscountAdded={handleActionSuccess} serverUrl={SERVER_URL} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiscountList;