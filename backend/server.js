require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const Product = require('./models/Product');
const Category = require('./models/Category');
const wishlistRoutes = require('./routes/wishlistRoutes');
const authRoutes = require('./routes/auth');
const { protect, admin } = require('./middleware/authMiddleware');
const app = express();
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)){
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/productsDB';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected to:', MONGO_URI))
  .catch((error) => console.error('MongoDB connection error:', error));
app.use('/api/auth', authRoutes);
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});
app.get('/api/products', async (req, res) => {
  const search = req.query.search || '';
  const products = await Product.find({
    name: { $regex: search, $options: 'i' }
  });
  res.json(products);
});
app.post('/api/product', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }
    if (!name || !price) {
      return res.status(400).json({ message: 'Product name and price are required' });
    }
    const newProduct = new Product({ name, price, description, image: imagePath, category });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error saving product:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
app.put('/api/product/:id', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, price, description, category } = req.body;
    let updatedData = { name, price: Number(price), description, category };

    const productToUpdate = await Product.findById(productId);
    if (!productToUpdate) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.file) {
      if (productToUpdate.image && productToUpdate.image !== "") {
        const oldImagePath = path.join(__dirname, productToUpdate.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlink(oldImagePath, err => {
            if (err) console.error("Error deleting old image during update:", err);
          });
        }
      }
      updatedData.image = `/uploads/${req.file.filename}`;
    }

    if (!name || name.trim() === "" || price === undefined || price === null || Number(price) < 0) {
      return res.status(400).json({ message: "Product name and a valid price are required." });
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, updatedData, { new: true, runValidators: true });
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found after update attempt' });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});
app.use('/api/wishlist', wishlistRoutes); 
app.delete('/api/product/:id', protect, admin, async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.image && product.image !== "") {
      const imagePath = path.join(__dirname, product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) console.error("Failed to delete product image during delete:", err);
        });
      }
    }
    await Product.findByIdAndDelete(productId);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});
app.post('/api/categories', protect, admin, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: 'Category name is required.' });
    }
    const newCategory = new Category({ name, description });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.code === 11000) { return res.status(400).json({ message: 'Category name already exists.' }); }
    if (error.name === 'ValidationError') { return res.status(400).json({ message: error.message });}
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});
app.put('/api/categories/:id', protect, admin, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name, description } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: 'Category name is required.' });
    }
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { name, description },
      { new: true, runValidators: true }
    );
    if (!updatedCategory) { return res.status(404).json({ message: 'Category not found' }); }
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.code === 11000) { return res.status(400).json({ message: 'Category name already exists.' }); }
    if (error.name === 'ValidationError') { return res.status(400).json({ message: error.message });}
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});
app.delete('/api/categories/:id', protect, admin, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    if (!deletedCategory) { return res.status(404).json({ message: 'Category not found' }); }
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).send('Something broke!');
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
