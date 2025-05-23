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
    image: { type: String }, // Path to the uploaded image
    link: { type: String, default: '#' },
    type: {
        type: String,
        enum: ['slide', 'sideOffer', 'weeklyOffer', 'other'], // Ensure these match your frontend dropdown values
        default: 'slide'
    },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }, // For ordering slides
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Update `updatedAt` on save
advertisementSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Advertisement', advertisementSchema);