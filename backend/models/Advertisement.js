const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema({
    title: {
        en: { type: String, required: true, trim: true, maxlength: 100 },
        ar: { type: String, required: true, trim: true, maxlength: 100 }
    },
    description: {
        en: { type: String, trim: true, maxlength: 500 },
        ar: { type: String, trim: true, maxlength: 500 }
    },
    image: { type: String, default: '' }, 
    link: { type: String, default: '#' },
    type: {
        type: String,
        enum: ['slide', 'sideOffer', 'weeklyOffer', 'other'],
        default: 'slide'
    },
    productRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null 
    },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0, min: 0 },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    originalPrice: { type: Number, default: null, min: 0 }, 
    discountedPrice: { type: Number, default: null, min: 0 },
    currency: { type: String, default: 'SAR', trim: true, maxlength: 10 },
}, {
    timestamps: true 
});
advertisementSchema.pre('save', function (next) {
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
        return next(new Error('End date must be after start date.'));
    }
    if (this.originalPrice !== null && this.discountedPrice !== null && this.discountedPrice > this.originalPrice) {
        return next(new Error('Discounted price cannot be higher than original price.'));
    }
    next();
});
advertisementSchema.pre('findOneAndUpdate', function (next) {
    this.options.runValidators = true;
    next();
});

module.exports = mongoose.model('Advertisement', advertisementSchema);