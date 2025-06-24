// components/Admin/DiscountPage/EditDiscountModal.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../LanguageContext';
import { FaSpinner, FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa'; // Added icons

const EditDiscountModal = ({ discount, onClose, onDiscountUpdated, serverUrl }) => {
    const { t } = useLanguage();
    const [editedDiscount, setEditedDiscount] = useState({
        code: '', percentage: '', fixedAmount: '',
        minOrderAmount: '', maxDiscountAmount: '',
        startDate: '', endDate: '', isActive: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState(''); // Renamed from errorMessage
    const [submitMessageType, setSubmitMessageType] = useState(''); // 'success' or 'error'

    useEffect(() => {
        if (discount) {
            setEditedDiscount({
                code: discount.code || '',
                percentage: discount.percentage ?? '', // Use ?? for null/undefined
                fixedAmount: discount.fixedAmount ?? '',
                minOrderAmount: discount.minOrderAmount ?? '',
                maxDiscountAmount: discount.maxDiscountAmount ?? '',
                startDate: discount.startDate ? new Date(discount.startDate).toISOString().split('T')[0] : '',
                endDate: discount.endDate ? new Date(discount.endDate).toISOString().split('T')[0] : '',
                isActive: discount.isActive,
            });
            // Clear any previous messages when a new discount is loaded
            setSubmitMessage('');
            setSubmitMessageType('');
        }
    }, [discount]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        let newDiscount = {
            ...editedDiscount,
            [name]: type === 'checkbox' ? checked : value
        };

        // Logic to clear the other field if one is being typed into
        if (name === 'percentage' && value) {
            newDiscount.fixedAmount = '';
        } else if (name === 'fixedAmount' && value) {
            newDiscount.percentage = '';
        }

        setEditedDiscount(newDiscount);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitMessage('');
        setSubmitMessageType('');

        // Client-side validation
        if (!editedDiscount.code.trim()) {
            setSubmitMessage(t('discountAdmin.codeRequired') || 'Discount code is required.');
            setSubmitMessageType('error');
            return;
        }
        if (!editedDiscount.percentage && !editedDiscount.fixedAmount) {
            setSubmitMessage(t('discountAdmin.amountRequired') || 'Either percentage or fixed amount is required.');
            setSubmitMessageType('error');
            return;
        }
        if (editedDiscount.percentage && editedDiscount.fixedAmount) {
            setSubmitMessage(t('discountAdmin.amountExclusive') || 'You cannot set both percentage and fixed amount.');
            setSubmitMessageType('error');
            return;
        }
        if (!editedDiscount.startDate || !editedDiscount.endDate) {
            setSubmitMessage(t('discountAdmin.datesRequired') || 'Start and End dates are required.');
            setSubmitMessageType('error');
            return;
        }
        if (new Date(editedDiscount.startDate) > new Date(editedDiscount.endDate)) {
            setSubmitMessage(t('discountAdmin.endDateError') || 'End date cannot be before start date.');
            setSubmitMessageType('error');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = { ...editedDiscount };
            // Ensure numbers are numbers and remove empty strings for optional fields
            payload.percentage = payload.percentage === "" ? undefined : parseFloat(payload.percentage);
            payload.fixedAmount = payload.fixedAmount === "" ? undefined : parseFloat(payload.fixedAmount);
            payload.minOrderAmount = payload.minOrderAmount === "" ? undefined : parseFloat(payload.minOrderAmount);
            payload.maxDiscountAmount = payload.maxDiscountAmount === "" ? undefined : parseFloat(payload.maxDiscountAmount);

            await axios.put(`${serverUrl}/api/discounts/${discount._id}`, payload);

            setSubmitMessage(t('discountAdmin.updateSuccess') || 'Discount updated successfully!');
            setSubmitMessageType('success');
            setTimeout(() => { // Give time for success message to be seen
                onDiscountUpdated();
                onClose();
            }, 1500); // Close after 1.5 seconds
        } catch (err) {
            console.error("Error updating discount:", err.response?.data);
            const errorMessage = err.response?.data?.message || err.message;
            setSubmitMessage(`${t('discountAdmin.updateError') || 'Error updating discount:'} ${errorMessage}`);
            setSubmitMessageType('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!discount) return null;

    const inputClasses = "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
    const checkboxClasses = "h-5 w-5 text-indigo-600 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:checked:bg-indigo-600";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-95 animate-scale-in relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 text-3xl font-bold transition-colors duration-200"
                    aria-label={t('general.close') || 'Close'}
                >
                    <FaTimes />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white border-b pb-3 border-gray-200 dark:border-gray-700">
                    {t('discountAdmin.editDiscountTitle') || 'Edit Discount Code'}
                </h2>

                {/* Submission Message */}
                {submitMessage && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
                        submitMessageType === 'success' ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" :
                        "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                    }`}>
                        {submitMessageType === 'success' ? <FaCheckCircle className="text-xl" /> : <FaExclamationCircle className="text-xl" />}
                        <p className="text-sm font-medium">{submitMessage}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Code */}
                    <div>
                        <label htmlFor="edit-code" className={labelClasses}>{t('discountAdmin.codeLabel')}</label>
                        <input
                            type="text"
                            id="edit-code"
                            name="code"
                            value={editedDiscount.code}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder={t('discountAdmin.codePlaceholder') || 'e.g., SUMMER20'}
                            required
                        />
                    </div>
                    {/* Percentage */}
                    <div>
                        <label htmlFor="edit-percentage" className={labelClasses}>{t('discountAdmin.percentageLabel')}</label>
                        <input
                            type="number"
                            id="edit-percentage"
                            name="percentage"
                            value={editedDiscount.percentage}
                            onChange={handleChange}
                            className={inputClasses}
                            min="0"
                            max="100"
                            step="0.01"
                            disabled={!!editedDiscount.fixedAmount}
                            placeholder="0-100%"
                        />
                    </div>
                    {/* Fixed Amount */}
                    <div>
                        <label htmlFor="edit-fixedAmount" className={labelClasses}>{t('discountAdmin.fixedAmountLabel')}</label>
                        <input
                            type="number"
                            id="edit-fixedAmount"
                            name="fixedAmount"
                            value={editedDiscount.fixedAmount}
                            onChange={handleChange}
                            className={inputClasses}
                            min="0"
                            step="0.01"
                            disabled={!!editedDiscount.percentage}
                            placeholder={t('discountAdmin.fixedAmountPlaceholder') || 'e.g., 25.00'}
                        />
                    </div>
                    {/* Minimum Order Amount */}
                    <div>
                        <label htmlFor="edit-minOrderAmount" className={labelClasses}>{t('discountAdmin.minOrderAmountLabel')}</label>
                        <input
                            type="number"
                            id="edit-minOrderAmount"
                            name="minOrderAmount"
                            value={editedDiscount.minOrderAmount}
                            onChange={handleChange}
                            className={inputClasses}
                            min="0"
                            step="0.01"
                            placeholder={t('discountAdmin.minOrderAmountPlaceholder') || 'Minimum order value (optional)'}
                        />
                    </div>
                    {/* Maximum Discount Amount */}
                    <div>
                        <label htmlFor="edit-maxDiscountAmount" className={labelClasses}>{t('discountAdmin.maxDiscountAmountLabel')}</label>
                        <input
                            type="number"
                            id="edit-maxDiscountAmount"
                            name="maxDiscountAmount"
                            value={editedDiscount.maxDiscountAmount}
                            onChange={handleChange}
                            className={inputClasses}
                            min="0"
                            step="0.01"
                            placeholder={t('discountAdmin.maxDiscountAmountPlaceholder') || 'Maximum discount value (optional)'}
                        />
                    </div>
                    {/* Start Date */}
                    <div>
                        <label htmlFor="edit-startDate" className={labelClasses}>{t('discountAdmin.startDateLabel')}</label>
                        <input
                            type="date"
                            id="edit-startDate"
                            name="startDate"
                            value={editedDiscount.startDate}
                            onChange={handleChange}
                            className={inputClasses}
                            required
                        />
                    </div>
                    {/* End Date */}
                    <div>
                        <label htmlFor="edit-endDate" className={labelClasses}>{t('discountAdmin.endDateLabel')}</label>
                        <input
                            type="date"
                            id="edit-endDate"
                            name="endDate"
                            value={editedDiscount.endDate}
                            onChange={handleChange}
                            className={inputClasses}
                            required
                        />
                    </div>
                    {/* Is Active Checkbox */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="edit-isActive"
                            name="isActive"
                            checked={editedDiscount.isActive}
                            onChange={handleChange}
                            className={checkboxClasses}
                        />
                        <label htmlFor="edit-isActive" className="ml-2 block text-base text-gray-900 dark:text-gray-300">
                            {t('discountAdmin.isActive') || 'Is Active'}
                        </label>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {t('general.cancel') || 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold transition-all duration-200"
                        >
                            {isSubmitting ? (
                                <>
                                    <FaSpinner className="animate-spin" /> {t('discountAdmin.updatingButton') || 'Updating...'}
                                </>
                            ) : (
                                <>
                                    <FaCheckCircle /> {t('discountAdmin.updateButton') || 'Update Discount'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDiscountModal;