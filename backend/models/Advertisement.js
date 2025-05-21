const mongoose = require('mongoose');

const advertisementSchema = mongoose.Schema({
    title: {
        en: { type: String, required: true },
        ar: { type: String, required: true }
    },
    description: {
        en: { type: String },
        ar: { type: String }
    },
    image: {
        type: String, 
        required: true
    },
    link: {
        type: String, 
        default: '#'
    },
    type: {
        type: String, 
        required: true,
        enum: ['slide', 'sideOffer', 'weeklyOffer'], 
        default: 'slide'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number, 
        default: 0
    }
}, {
    timestamps: true
});

const Advertisement = mongoose.model('Advertisement', advertisementSchema);

module.exports = Advertisement;
