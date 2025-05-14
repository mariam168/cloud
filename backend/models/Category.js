const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true, 
    unique: [true, 'Category name must be unique'], 
    minlength: [2, 'Category name must be at least 2 characters long'],
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Category description cannot exceed 200 characters']
  }
}, {
  timestamps: true 
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;