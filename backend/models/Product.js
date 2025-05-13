const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  image: { // سيخزن مسار أو URL للصورة
    type: String,
  },
  category: {
    type: String,
  },
  // يمكنك إضافة timestamps إذا أردت حقلي createdAt و updatedAt
  // timestamps: true
});

const Product = mongoose.model('Product', productSchema); // Mongoose سينشئ/يستخدم collection باسم 'products'

module.exports = Product;