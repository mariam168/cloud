// components/Admin/DiscountPage/EditDiscountModal.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../LanguageContext';

const EditDiscountModal = ({ discount, onClose, onDiscountUpdated, serverUrl }) => {
    const { t } = useLanguage();
    const [editedDiscount, setEditedDiscount] = useState({
        code: '', percentage: '', fixedAmount: '',
        minOrderAmount: '', maxDiscountAmount: '',
        startDate: '', endDate: '', isActive: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (discount) {
            setEditedDiscount({
                code: discount.code || '',
                percentage: discount.percentage ?? '',
                fixedAmount: discount.fixedAmount ?? '',
                minOrderAmount: discount.minOrderAmount ?? '',
                maxDiscountAmount: discount.maxDiscountAmount ?? '',
                startDate: discount.startDate ? new Date(discount.startDate).toISOString().split('T')[0] : '',
                endDate: discount.endDate ? new Date(discount.endDate).toISOString().split('T')[0] : '',
                isActive: discount.isActive,
            });
        }
    }, [discount]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        let newDiscount = {
            ...editedDiscount,
            [name]: type === 'checkbox' ? checked : value
        };

        if (name === 'percentage' && value) {
            newDiscount.fixedAmount = '';
        } else if (name === 'fixedAmount' && value) {
            newDiscount.percentage = '';
        }
        
        setEditedDiscount(newDiscount);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        
        if (!editedDiscount.code.trim()) return setErrorMessage(t('discountAdmin.codeRequired'));
        if (!editedDiscount.percentage && !editedDiscount.fixedAmount) return setErrorMessage(t('discountAdmin.amountRequired'));
        if (editedDiscount.percentage && editedDiscount.fixedAmount) return setErrorMessage(t('discountAdmin.amountExclusive'));
        if (!editedDiscount.startDate || !editedDiscount.endDate) return setErrorMessage(t('discountAdmin.datesRequired'));
        if (new Date(editedDiscount.startDate) > new Date(editedDiscount.endDate)) return setErrorMessage(t('discountAdmin.endDateError'));

        setIsSubmitting(true);
        try {
            const payload = { ...editedDiscount };
            if (payload.percentage === '') delete payload.percentage;
            if (payload.fixedAmount === '') delete payload.fixedAmount;
            if (payload.maxDiscountAmount === '') delete payload.maxDiscountAmount;

            await axios.put(`${serverUrl}/api/discounts/${discount._id}`, payload);
            
            alert(t('discountAdmin.updateSuccess'));
            onDiscountUpdated();
            onClose();
        } catch (err) {
            setErrorMessage(`${t('discountAdmin.updateError')} ${err.response?.data?.message || err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!discount) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-700 dark:text-white">{t('discountAdmin.editDiscountTitle')}</h2>
                {errorMessage && <p className="text-red-500 bg-red-100 p-3 rounded mb-4 text-sm">{errorMessage}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="edit-code">{t('discountAdmin.codeLabel')}</label>
                        <input type="text" id="edit-code" name="code" value={editedDiscount.code} onChange={handleChange} className="w-full p-3 border rounded-md" required />
                    </div>
                    <div>
                        <label htmlFor="edit-percentage">{t('discountAdmin.percentageLabel')}</label>
                        <input type="number" id="edit-percentage" name="percentage" value={editedDiscount.percentage} onChange={handleChange} className="w-full p-3 border rounded-md" min="0" max="100" step="0.01" disabled={!!editedDiscount.fixedAmount}/>
                    </div>
                    <div>
                        <label htmlFor="edit-fixedAmount">{t('discountAdmin.fixedAmountLabel')}</label>
                        <input type="number" id="edit-fixedAmount" name="fixedAmount" value={editedDiscount.fixedAmount} onChange={handleChange} className="w-full p-3 border rounded-md" min="0" step="0.01" disabled={!!editedDiscount.percentage}/>
                    </div>
                    <div>
                        <label htmlFor="edit-minOrderAmount">{t('discountAdmin.minOrderAmountLabel')}</label>
                        <input type="number" id="edit-minOrderAmount" name="minOrderAmount" value={editedDiscount.minOrderAmount} onChange={handleChange} className="w-full p-3 border rounded-md" min="0" step="0.01" />
                    </div>
                    <div>
                        <label htmlFor="edit-maxDiscountAmount">{t('discountAdmin.maxDiscountAmountLabel')}</label>
                        <input type="number" id="edit-maxDiscountAmount" name="maxDiscountAmount" value={editedDiscount.maxDiscountAmount} onChange={handleChange} className="w-full p-3 border rounded-md" min="0" step="0.01" />
                    </div>
                    <div>
                        <label htmlFor="edit-startDate">{t('discountAdmin.startDateLabel')}</label>
                        <input type="date" id="edit-startDate" name="startDate" value={editedDiscount.startDate} onChange={handleChange} className="w-full p-3 border rounded-md" required />
                    </div>
                    <div>
                        <label htmlFor="edit-endDate">{t('discountAdmin.endDateLabel')}</label>
                        <input type="date" id="edit-endDate" name="endDate" value={editedDiscount.endDate} onChange={handleChange} className="w-full p-3 border rounded-md" required />
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" id="edit-isActive" name="isActive" checked={editedDiscount.isActive} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded"/>
                        <label htmlFor="edit-isActive" className="ml-2 block text-sm">{t('discountAdmin.isActive')}</label>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 border rounded-md">{t('adminCategoryPage.cancelButton')}</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-gray-400">
                            {isSubmitting ? t('discountAdmin.updatingButton') : t('discountAdmin.updateButton')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDiscountModal;