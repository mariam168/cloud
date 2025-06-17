const mongoose = require('mongoose');

const discountSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    percentage: {
        type: Number,
        min: 0,
        max: 100
    },
    fixedAmount: {
        type: Number,
        min: 0
    },
    minOrderAmount: {
        type: Number,
        min: 0,
        default: 0
    },
    maxDiscountAmount: {
        type: Number,
        min: 0
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

discountSchema.pre('save', function (next) {
    if ((this.percentage && this.fixedAmount) || (!this.percentage && !this.fixedAmount)) {
        return next(new Error('Either percentage or fixedAmount must be provided, but not both.'));
    }
    if (this.percentage !== undefined && (this.percentage < 0 || this.percentage > 100)) {
        return next(new Error('Percentage must be between 0 and 100.'));
    }
    if (this.fixedAmount !== undefined && this.fixedAmount < 0) {
        return next(new Error('Fixed amount cannot be negative.'));
    }
    next();
});

const Discount = mongoose.model('Discount', discountSchema);

module.exports = Discount;