import React, { useState } from "react";
import axios from "axios";
import { useLanguage } from '../../LanguageContext';

const AddDiscountPage = ({ onDiscountAdded, serverUrl = 'http://localhost:5000' }) => {
    const { t } = useLanguage();
    const [discount, setDiscount] = useState({
        code: "",
        percentage: "",
        fixedAmount: "",
        minOrderAmount: "",
        maxDiscountAmount: "",
        startDate: "",
        endDate: "",
        isActive: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setDiscount((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitMessage("");

        if (!discount.code.trim()) {
            setSubmitMessage(t('discountAdmin.codeRequired') || "Discount code is required.");
            return;
        }

        if (!discount.percentage && !discount.fixedAmount) {
            setSubmitMessage(t('discountAdmin.amountRequired') || "Either percentage or fixed amount is required.");
            return;
        }

        if (discount.percentage && discount.fixedAmount) {
            setSubmitMessage(t('discountAdmin.amountExclusive') || "Cannot provide both percentage and fixed amount.");
            return;
        }

        if (!discount.startDate || !discount.endDate) {
            setSubmitMessage(t('discountAdmin.datesRequired') || "Start and End dates are required.");
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                ...discount,
                percentage: discount.percentage ? Number(discount.percentage) : undefined,
                fixedAmount: discount.fixedAmount ? Number(discount.fixedAmount) : undefined,
                minOrderAmount: discount.minOrderAmount ? Number(discount.minOrderAmount) : 0,
                maxDiscountAmount: discount.maxDiscountAmount ? Number(discount.maxDiscountAmount) : undefined,
                isActive: discount.isActive,
            };

            await axios.post(`${serverUrl}/api/discounts`, payload);

            setSubmitMessage(t('discountAdmin.addSuccess') || "Discount added successfully!");
            setDiscount({
                code: "", percentage: "", fixedAmount: "", minOrderAmount: "",
                maxDiscountAmount: "", startDate: "", endDate: "", isActive: true,
            });

            if (onDiscountAdded) {
                onDiscountAdded();
            }

        } catch (error) {
            console.error("Error adding discount:", error.response ? error.response.data : error.message);
            setSubmitMessage(
                (t('discountAdmin.addError') || "Error adding discount: ") +
                (error.response && error.response.data && typeof error.response.data === 'string'
                    ? error.response.data
                    : error.response?.data?.message || error.message)
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 dark:bg-gray-800 p-6 rounded-lg shadow-md">
            {submitMessage && (
                <p className={`text-center mb-4 p-2 rounded ${submitMessage.includes(t('discountAdmin.addSuccess') || "successfully") ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"}`}>
                    {submitMessage}
                </p>
            )}
            <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('discountAdmin.codeLabel') || 'Discount Code'}</label>
                <input
                    type="text"
                    id="code"
                    name="code"
                    value={discount.code}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                />
            </div>
            <div>
                <label htmlFor="percentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('discountAdmin.percentageLabel') || 'Percentage (%)'}</label>
                <input
                    type="number"
                    id="percentage"
                    name="percentage"
                    value={discount.percentage}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="0"
                    max="100"
                    step="any"
                />
            </div>
            <div>
                <label htmlFor="fixedAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('discountAdmin.fixedAmountLabel') || 'Fixed Amount'}</label>
                <input
                    type="number"
                    id="fixedAmount"
                    name="fixedAmount"
                    value={discount.fixedAmount}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="0"
                    step="any"
                />
            </div>
            <div>
                <label htmlFor="minOrderAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('discountAdmin.minOrderAmountLabel') || 'Minimum Order Amount'}</label>
                <input
                    type="number"
                    id="minOrderAmount"
                    name="minOrderAmount"
                    value={discount.minOrderAmount}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="0"
                    step="any"
                />
            </div>
            <div>
                <label htmlFor="maxDiscountAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('discountAdmin.maxDiscountAmountLabel') || 'Maximum Discount Amount (Optional)'}</label>
                <input
                    type="number"
                    id="maxDiscountAmount"
                    name="maxDiscountAmount"
                    value={discount.maxDiscountAmount}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="0"
                    step="any"
                />
            </div>
            <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('discountAdmin.startDateLabel') || 'Start Date'}</label>
                <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={discount.startDate}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                />
            </div>
            <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('discountAdmin.endDateLabel') || 'End Date'}</label>
                <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={discount.endDate}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                />
            </div>
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={discount.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">{t('discountAdmin.isActive') || 'Is Active'}</label>
            </div>
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150 ease-in-out dark:bg-indigo-700 dark:hover:bg-indigo-600"
            >
                {isSubmitting ? (t('discountAdmin.submittingButton') || "Adding...") : (t('discountAdmin.addButton') || "Add Discount")}
            </button>
        </form>
    );
};

export default AddDiscountPage;