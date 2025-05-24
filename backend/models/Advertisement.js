const mongoose = require('mongoose');
const advertisementSchema = new mongoose.Schema({
    title: {
        en: { type: String, required: true },
        ar: { type: String, required: true }
    },
    description: {
        en: { type: String },
        ar: { type: String }
    },
    image: { type: String }, 
    link: { type: String, default: '#' },
    type: {
        type: String,
        enum: ['slide', 'sideOffer', 'weeklyOffer', 'other'], 
        default: 'slide'
    },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }, 
    startDate: { type: Date, default: null }, 
    endDate: { type: Date, default: null }, 
    originalPrice: { type: Number, default: null }, 
    discountedPrice: { type: Number, default: null }, 
    currency: { type: String, default: 'SAR' }, 

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
advertisementSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Advertisement', advertisementSchema);