const express = require('express');
const router = express.Router();
const Discount = require('../models/Discount');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/active', async (req, res) => {
    try {
        const currentDate = new Date();
        const activeDiscounts = await Discount.find({
            isActive: true,
            startDate: { $lte: currentDate }, 
            endDate: { $gte: currentDate }   
        }).sort({ endDate: 1 }); 
        res.status(200).json(activeDiscounts);
    } catch (error) {
        console.error('Error fetching active discounts:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

router.get('/', protect, admin, async (req, res) => {
    try {
        const discounts = await Discount.find({});
        res.status(200).json(discounts);
    } catch (error) {
        console.error('Error fetching discounts:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

router.get('/:id', protect, admin, async (req, res) => {
    try {
        const discount = await Discount.findById(req.params.id);
        if (!discount) {
            return res.status(404).json({ message: 'Discount not found' });
        }
        res.status(200).json(discount);
    } catch (error) {
        console.error('Error fetching discount by ID:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.post('/', protect, admin, async (req, res) => {
    try {
        const { code, percentage, fixedAmount, minOrderAmount, maxDiscountAmount, startDate, endDate, isActive } = req.body;

        const newDiscount = new Discount({
            code,
            percentage: percentage ? Number(percentage) : undefined,
            fixedAmount: fixedAmount ? Number(fixedAmount) : undefined,
            minOrderAmount: Number(minOrderAmount),
            maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            isActive: Boolean(isActive) // تم التعديل هنا
        });

        await newDiscount.save();
        res.status(201).json(newDiscount);
    } catch (error) {
        console.error('Error creating discount:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Discount code already exists.' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

router.put('/:id', protect, admin, async (req, res) => {
    try {
        const discountId = req.params.id;
        const { code, percentage, fixedAmount, minOrderAmount, maxDiscountAmount, startDate, endDate, isActive } = req.body;

        const updatedData = {
            code,
            percentage: percentage ? Number(percentage) : undefined,
            fixedAmount: fixedAmount ? Number(fixedAmount) : undefined,
            minOrderAmount: Number(minOrderAmount),
            maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            isActive: Boolean(isActive) // تم التعديل هنا
        };

        const updatedDiscount = await Discount.findByIdAndUpdate(discountId, updatedData, { new: true, runValidators: true });

        if (!updatedDiscount) {
            return res.status(404).json({ message: 'Discount not found' });
        }

        res.status(200).json(updatedDiscount);
    } catch (error) {
        console.error('Error updating discount:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Discount code already exists.' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const discountId = req.params.id;
        const deletedDiscount = await Discount.findByIdAndDelete(discountId);

        if (!deletedDiscount) {
            return res.status(404).json({ message: 'Discount not found' });
        }

        res.status(200).json({ message: 'Discount deleted successfully' });
    } catch (error) {
        console.error('Error deleting discount:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

module.exports = router;