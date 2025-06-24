// components/Admin/DiscountPage/AddDiscountPage.js
import React, { useState } from "react";
import axios from "axios";
import { useLanguage } from '../../LanguageContext';
import { FaSpinner, FaCheckCircle, FaExclamationCircle, FaPlus } from 'react-icons/fa'; // Added icons

const AddDiscountPage = ({ onDiscountAdded, serverUrl = 'http://localhost:5000' }) => {
    const { t } = useLanguage();
    const [discount, setDiscount] = useState({
        code: "", percentage: "", fixedAmount: "",
        minOrderAmount: "", maxDiscountAmount: "",
        startDate: "", endDate: "", isActive: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState("");
    const [submitMessageType, setSubmitMessageType] = useState(""); // 'success' or 'error'

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        let newDiscount = {
            ...discount,
            [name]: type === 'checkbox' ? checked : value,
        };

        // Clear the other field when one is being entered
        if (name === 'percentage' && value) {
            newDiscount.fixedAmount = '';
        } else if (name === 'fixedAmount' && value) {
            newDiscount.percentage = '';
        }

        setDiscount(newDiscount);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitMessage("");
        setSubmitMessageType("");

        // Basic client-side validation
        if (!discount.code.trim()) {
            setSubmitMessage(t('discountAdmin.codeRequired') || 'Discount code is required.');
            setSubmitMessageType('error');
            return;
        }
        if (!discount.percentage && !discount.fixedAmount) {
            setSubmitMessage(t('discountAdmin.amountRequired') || 'Either percentage or fixed amount is required.');
            setSubmitMessageType('error');
            return;
        }
        if (discount.percentage && discount.fixedAmount) {
            setSubmitMessage(t('discountAdmin.amountExclusive') || 'You cannot set both percentage and fixed amount.');
            setSubmitMessageType('error');
            return;
        }
        if (!discount.startDate || !discount.endDate) {
            setSubmitMessage(t('discountAdmin.datesRequired') || 'Start and End dates are required.');
            setSubmitMessageType('error');
            return;
        }
        if (new Date(discount.startDate) > new Date(discount.endDate)) {
            setSubmitMessage(t('discountAdmin.endDateError') || 'End date cannot be before start date.');
            setSubmitMessageType('error');
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = { ...discount };
            // Ensure numbers are numbers and remove empty strings for optional fields
            payload.percentage = payload.percentage === "" ? undefined : parseFloat(payload.percentage);
            payload.fixedAmount = payload.fixedAmount === "" ? undefined : parseFloat(payload.fixedAmount);
            payload.minOrderAmount = payload.minOrderAmount === "" ? undefined : parseFloat(payload.minOrderAmount);
            payload.maxDiscountAmount = payload.maxDiscountAmount === "" ? undefined : parseFloat(payload.maxDiscountAmount);

            await axios.post(`${serverUrl}/api/discounts`, payload);

            setSubmitMessage(t('discountAdmin.addSuccess') || 'Discount added successfully!');
            setSubmitMessageType('success');
            
            // Reset form fields
            setDiscount({
                code: "", percentage: "", fixedAmount: "", minOrderAmount: "",
                maxDiscountAmount: "", startDate: "", endDate: "", isActive: true,
            });

            // Trigger parent callback
            if (onDiscountAdded) onDiscountAdded();
        } catch (error) {
            console.error("Error adding discount:", error.response?.data);
            const errorMessage = error.response?.data?.message || error.message;
            setSubmitMessage(`${t('discountAdmin.addError') || 'Error adding discount:'} ${errorMessage}`);
            setSubmitMessageType('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
    const checkboxClasses = "h-5 w-5 text-indigo-600 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:checked:bg-indigo-600";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Submission Message */}
            {submitMessage && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                    submitMessageType === 'success' ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" :
                    "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                }`}>
                    {submitMessageType === 'success' ? <FaCheckCircle className="text-xl" /> : <FaExclamationCircle className="text-xl" />}
                    <p className="text-sm font-medium">{submitMessage}</p>
                </div>
            )}

            {/* Code */}
            <div>
                <label htmlFor="code" className={labelClasses}>{t('discountAdmin.codeLabel')}</label>
                <input
                    type="text"
                    id="code"
                    name="code"
                    value={discount.code}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder={t('discountAdmin.codePlaceholder') || 'e.g., BLACKFRIDAY20'}
                    required
                />
            </div>

            {/* Percentage */}
            <div>
                <label htmlFor="percentage" className={labelClasses}>{t('discountAdmin.percentageLabel')}</label>
                <input
                    type="number"
                    id="percentage"
                    name="percentage"
                    value={discount.percentage}
                    onChange={handleChange}
                    className={inputClasses}
                    min="0"
                    max="100"
                    step="0.01"
                    disabled={!!discount.fixedAmount}
                    placeholder="0-100%"
                />
            </div>

            {/* Fixed Amount */}
            <div>
                <label htmlFor="fixedAmount" className={labelClasses}>{t('discountAdmin.fixedAmountLabel')}</label>
                <input
                    type="number"
                    id="fixedAmount"
                    name="fixedAmount"
                    value={discount.fixedAmount}
                    onChange={handleChange}
                    className={inputClasses}
                    min="0"
                    step="0.01"
                    disabled={!!discount.percentage}
                    placeholder={t('discountAdmin.fixedAmountPlaceholder') || 'e.g., 50.00'}
                />
            </div>

            {/* Minimum Order Amount */}
            <div>
                <label htmlFor="minOrderAmount" className={labelClasses}>{t('discountAdmin.minOrderAmountLabel')}</label>
                <input
                    type="number"
                    id="minOrderAmount"
                    name="minOrderAmount"
                    value={discount.minOrderAmount}
                    onChange={handleChange}
                    className={inputClasses}
                    min="0"
                    step="0.01"
                    placeholder={t('discountAdmin.minOrderAmountPlaceholder') || 'Minimum order value for discount (optional)'}
                />
            </div>

            {/* Maximum Discount Amount */}
            <div>
                <label htmlFor="maxDiscountAmount" className={labelClasses}>{t('discountAdmin.maxDiscountAmountLabel')}</label>
                <input
                    type="number"
                    id="maxDiscountAmount"
                    name="maxDiscountAmount"
                    value={discount.maxDiscountAmount}
                    onChange={handleChange}
                    className={inputClasses}
                    min="0"
                    step="0.01"
                    placeholder={t('discountAdmin.maxDiscountAmountPlaceholder') || 'Maximum discount value applied (optional)'}
                />
            </div>

            {/* Start Date */}
            <div>
                <label htmlFor="startDate" className={labelClasses}>{t('discountAdmin.startDateLabel')}</label>
                <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={discount.startDate}
                    onChange={handleChange}
                    className={inputClasses}
                    required
                />
            </div>

            {/* End Date */}
            <div>
                <label htmlFor="endDate" className={labelClasses}>{t('discountAdmin.endDateLabel')}</label>
                <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={discount.endDate}
                    onChange={handleChange}
                    className={inputClasses}
                    required
                />
            </div>

            {/* Is Active Checkbox */}
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={discount.isActive}
                    onChange={handleChange}
                    className={checkboxClasses}
                />
                <label htmlFor="isActive" className="ml-2 block text-base text-gray-900 dark:text-gray-300">
                    {t('discountAdmin.isActive') || 'Is Active'}
                </label>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold transition-all duration-200"
            >
                {isSubmitting ? (
                    <>
                        <FaSpinner className="animate-spin" /> {t('discountAdmin.submittingButton') || 'Submitting...'}
                    </>
                ) : (
                    <>
                        <FaPlus /> {t('discountAdmin.addButton') || 'Add Discount'}
                    </>
                )}
            </button>
        </form>
    );
};

export default AddDiscountPage;