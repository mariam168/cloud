const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
  name: {
    en: {
      type: String,
      required: [true, 'Category English name is required'],
      trim: true,
      minlength: [2, 'Category English name must be at least 2 characters long'],
      maxlength: [50, 'Category English name cannot exceed 50 characters']
    },
    ar: {
      type: String,
      required: [true, 'Category Arabic name is required'], 
      trim: true,
      minlength: [2, 'Category Arabic name must be at least 2 characters long'],
      maxlength: [50, 'Category Arabic name cannot exceed 50 characters']
    },
  },
  description: {
    en: {
      type: String,
      trim: true,
      maxlength: [200, 'Category English description cannot exceed 200 characters']
    },
    ar: {
      type: String,
      trim: true,
      maxlength: [200, 'Category Arabic description cannot exceed 200 characters']
    }
  }
}, {
  timestamps: true 
});

categorySchema.index({ 'name.en': 1 }, { unique: true });
categorySchema.index({ 'name.ar': 1 }, { unique: true });


const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
