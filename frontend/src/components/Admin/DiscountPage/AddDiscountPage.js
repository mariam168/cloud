// components/Admin/DiscountPage/AddDiscountPage.js
import React, { useState } from "react";
import axios from "axios";
import { useLanguage } from '../../LanguageContext';

const AddDiscountPage = ({ onDiscountAdded, serverUrl = 'http://localhost:5000' }) => {
    const { t } = useLanguage();
    const [discount, setDiscount] = useState({
        code: "", percentage: "", fixedAmount: "",
        minOrderAmount: "", maxDiscountAmount: "",
        startDate: "", endDate: "", isActive: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        let newDiscount = {
            ...discount,
            [name]: type === 'checkbox' ? checked : value,
        };
        
        // ✅ تحسين: تفريغ الحقل الآخر عند الإدخال في أحدهما
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

        if (!discount.code.trim()) return setSubmitMessage(t('discountAdmin.codeRequired'));
        if (!discount.percentage && !discount.fixedAmount) return setSubmitMessage(t('discountAdmin.amountRequired'));
        if (discount.percentage && discount.fixedAmount) return setSubmitMessage(t('discountAdmin.amountExclusive'));
        if (!discount.startDate || !discount.endDate) return setSubmitMessage(t('discountAdmin.datesRequired'));
        if (new Date(discount.startDate) > new Date(discount.endDate)) return setSubmitMessage(t('discountAdmin.endDateError'));
        
        setIsSubmitting(true);

        try {
            const payload = { ...discount };
            // إزالة الحقول الفارغة لضمان عدم إرسالها كـ ""
            if (payload.percentage === '') delete payload.percentage;
            if (payload.fixedAmount === '') delete payload.fixedAmount;
            if (payload.maxDiscountAmount === '') delete payload.maxDiscountAmount;

            await axios.post(`${serverUrl}/api/discounts`, payload);

            setSubmitMessage(t('discountAdmin.addSuccess'));
            setDiscount({
                code: "", percentage: "", fixedAmount: "", minOrderAmount: "",
                maxDiscountAmount: "", startDate: "", endDate: "", isActive: true,
            });

            if (onDiscountAdded) onDiscountAdded();
        } catch (error) {
            setSubmitMessage(`${t('discountAdmin.addError')} ${error.response?.data?.message || error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 dark:bg-gray-800 p-6 rounded-lg shadow-md">
            {submitMessage && (
                <p className={`text-center mb-4 p-2 rounded ${submitMessage.includes("successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {submitMessage}
                </p>
            )}
            <div>
                <label htmlFor="code">{t('discountAdmin.codeLabel')}</label>
                <input type="text" id="code" name="code" value={discount.code} onChange={handleChange} className="w-full p-3 border rounded-md" required />
            </div>
            <div>
                <label htmlFor="percentage">{t('discountAdmin.percentageLabel')}</label>
                <input type="number" id="percentage" name="percentage" value={discount.percentage} onChange={handleChange} className="w-full p-3 border rounded-md" min="0" max="100" step="0.01" disabled={!!discount.fixedAmount} />
            </div>
            <div>
                <label htmlFor="fixedAmount">{t('discountAdmin.fixedAmountLabel')}</label>
                <input type="number" id="fixedAmount" name="fixedAmount" value={discount.fixedAmount} onChange={handleChange} className="w-full p-3 border rounded-md" min="0" step="0.01" disabled={!!discount.percentage} />
            </div>
            <div>
                <label htmlFor="minOrderAmount">{t('discountAdmin.minOrderAmountLabel')}</label>
                <input type="number" id="minOrderAmount" name="minOrderAmount" value={discount.minOrderAmount} onChange={handleChange} className="w-full p-3 border rounded-md" min="0" step="0.01" />
            </div>
            <div>
                <label htmlFor="maxDiscountAmount">{t('discountAdmin.maxDiscountAmountLabel')}</label>
                <input type="number" id="maxDiscountAmount" name="maxDiscountAmount" value={discount.maxDiscountAmount} onChange={handleChange} className="w-full p-3 border rounded-md" min="0" step="0.01" />
            </div>
            <div>
                <label htmlFor="startDate">{t('discountAdmin.startDateLabel')}</label>
                <input type="date" id="startDate" name="startDate" value={discount.startDate} onChange={handleChange} className="w-full p-3 border rounded-md" required />
            </div>
            <div>
                <label htmlFor="endDate">{t('discountAdmin.endDateLabel')}</label>
                <input type="date" id="endDate" name="endDate" value={discount.endDate} onChange={handleChange} className="w-full p-3 border rounded-md" required />
            </div>
            <div className="flex items-center">
                <input type="checkbox" id="isActive" name="isActive" checked={discount.isActive} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded"/>
                <label htmlFor="isActive" className="ml-2 block text-sm">{t('discountAdmin.isActive')}</label>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400">
                {isSubmitting ? t('discountAdmin.submittingButton') : t('discountAdmin.addButton')}
            </button>
        </form>
    );
};

export default AddDiscountPage;