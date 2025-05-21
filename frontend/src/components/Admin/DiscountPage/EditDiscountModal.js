import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../LanguageContext';

const EditDiscountModal = ({ discount, onClose, onDiscountUpdated, serverUrl }) => {
    const { t } = useLanguage();
    const [editedDiscount, setEditedDiscount] = useState({
        code: '',
        percentage: '',
        fixedAmount: '',
        minOrderAmount: '',
        maxDiscountAmount: '',
        startDate: '',
        endDate: '',
        isActive: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (discount) {
            setEditedDiscount({
                code: discount.code || '',
                percentage: discount.percentage || '',
                fixedAmount: discount.fixedAmount || '',
                minOrderAmount: discount.minOrderAmount || '',
                maxDiscountAmount: discount.maxDiscountAmount || '',
                startDate: discount.startDate ? new Date(discount.startDate).toISOString().split('T')[0] : '',
                endDate: discount.endDate ? new Date(discount.endDate).toISOString().split('T')[0] : '',
                isActive: discount.isActive,
            });
        }
    }, [discount]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditedDiscount(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        if (!editedDiscount.code.trim()) {
            setErrorMessage(t('discountAdmin.codeRequired') || "Discount code is required.");
            setIsSubmitting(false);
            return;
        }

        if (!editedDiscount.percentage && !editedDiscount.fixedAmount) {
            setErrorMessage(t('discountAdmin.amountRequired') || "Either percentage or fixed amount is required.");
            setIsSubmitting(false);
            return;
        }

        if (editedDiscount.percentage && editedDiscount.fixedAmount) {
            setErrorMessage(t('discountAdmin.amountExclusive') || "Cannot provide both percentage and fixed amount.");
            setIsSubmitting(false);
            return;
        }

        if (!editedDiscount.startDate || !editedDiscount.endDate) {
            setErrorMessage(t('discountAdmin.datesRequired') || "Start and End dates are required.");
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = {
                ...editedDiscount,
                percentage: editedDiscount.percentage ? Number(editedDiscount.percentage) : undefined,
                fixedAmount: editedDiscount.fixedAmount ? Number(editedDiscount.fixedAmount) : undefined,
                minOrderAmount: editedDiscount.minOrderAmount ? Number(editedDiscount.minOrderAmount) : 0,
                maxDiscountAmount: editedDiscount.maxDiscountAmount ? Number(editedDiscount.maxDiscountAmount) : undefined,
                isActive: editedDiscount.isActive,
            };

            const response = await axios.put(`${serverUrl}/api/discounts/${discount._id}`, payload);
            onDiscountUpdated(response.data);
            alert(t('discountAdmin.updateSuccess') || "Discount updated successfully!");
            onClose();
        } catch (err) {
            console.error("Error updating discount:", err.response ? err.response.data : err.message);
            setErrorMessage(
                (t('discountAdmin.updateError') || "An error occurred while updating the discount.") +
                (err.response && err.response.data && typeof err.response.data === 'string'
                    ? err.response.data
                    : err.response?.data?.message || err.message)
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!discount) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto transition-colors duration-300">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-700 dark:text-white">{t('discountAdmin.editDiscountTitle') || 'Edit Discount'}</h2>
                {errorMessage && <p className="text-red-500 bg-red-100 p-3 rounded mb-4 text-sm dark:bg-red-900/30 dark:text-red-300">{errorMessage}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="edit-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('discountAdmin.codeLabel') || 'Discount Code'}</label>
                        <input
                            type="text"
                            id="edit-code"
                            name="code"
                            value={editedDiscount.code}
                            onChange={handleChange}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-percentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('discountAdmin.percentageLabel') || 'Percentage (%)'}</label>
                        <input
                            type="number"
                            id="edit-percentage"
                            name="percentage"
                            value={editedDiscount.percentage}
                            onChange={handleChange}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            min="0"
                            max="100"
                            step="any"
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-fixedAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('discountAdmin.fixedAmountLabel') || 'Fixed Amount'}</label>
                        <input
                            type="number"
                            id="edit-fixedAmount"
                            name="fixedAmount"
                            value={editedDiscount.fixedAmount}
                            onChange={handleChange}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            min="0"
                            step="any"
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-minOrderAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('discountAdmin.minOrderAmountLabel') || 'Minimum Order Amount'}</label>
                        <input
                            type="number"
                            id="edit-minOrderAmount"
                            name="minOrderAmount"
                            value={editedDiscount.minOrderAmount}
                            onChange={handleChange}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            min="0"
                            step="any"
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-maxDiscountAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('discountAdmin.maxDiscountAmountLabel') || 'Maximum Discount Amount (Optional)'}</label>
                        <input
                            type="number"
                            id="edit-maxDiscountAmount"
                            name="maxDiscountAmount"
                            value={editedDiscount.maxDiscountAmount}
                            onChange={handleChange}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            min="0"
                            step="any"
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('discountAdmin.startDateLabel') || 'Start Date'}</label>
                        <input
                            type="date"
                            id="edit-startDate"
                            name="startDate"
                            value={editedDiscount.startDate}
                            onChange={handleChange}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('discountAdmin.endDateLabel') || 'End Date'}</label>
                        <input
                            type="date"
                            id="edit-endDate"
                            name="endDate"
                            value={editedDiscount.endDate}
                            onChange={handleChange}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="edit-isActive"
                            name="isActive"
                            checked={editedDiscount.isActive}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor="edit-isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">{t('discountAdmin.isActive') || 'Is Active'}</label>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:cursor-not-allowed"
                        >
                            {t('adminCategoryPage.cancelButton') || 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-indigo-700 dark:hover:bg-indigo-600"
                        >
                            {isSubmitting ? (t('discountAdmin.updatingButton') || "Saving...") : (t('discountAdmin.updateButton') || "Save Changes")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDiscountModal;
