// backend/server.js
// ... (الكود الموجود سابقاً مثل express, mongoose, path, multer, cors, Product, app, middlewares, multer config, static files, MongoDB connection) ...
// تأكد أن هذا الكود موجود وصحيح

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs'); 
const Product = require('./models/Product');
const Category = require('./models/Category');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
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
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.error('MongoDB connection error:', error));
app.post('/api/product', upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }
    if (!name || !price) {
      return res.status(400).send('Product name and price are required');
    }
    const newProduct = new Product({ name, price, description, image: imagePath, category });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error saving product:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.delete('/api/product/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.image) {
      const imagePath = path.join(__dirname, product.image); 
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error("Failed to delete product image:", err);
          }
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
app.put('/api/product/:id', upload.single('image'), async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, price, description, category } = req.body;
    let updatedData = { name, price, description, category };

    const productToUpdate = await Product.findById(productId);
    if (!productToUpdate) {
        return res.status(404).json({ message: "Product not found" });
    }

    if (req.file) {
      if (productToUpdate.image) {
        const oldImagePath = path.join(__dirname, productToUpdate.image);
        if (fs.existsSync(oldImagePath)) {
            fs.unlink(oldImagePath, err => {
                if(err) console.error("Error deleting old image:", err);
            });
        }
      }
      updatedData.image = `/uploads/${req.file.filename}`;
    } else {
 }
    if (!name || name.trim() === "" || price === undefined || price === null || price < 0) {
        return res.status(400).json({ message: "Product name and a valid price are required." });
    }
    updatedData.price = Number(price); 


    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updatedData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found after update attempt' });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message, details: error });
  }
});
app.post('/api/categories', async (req, res) => {
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
    if (error.code === 11000) { // خطأ الاسم الفريد (unique)
        return res.status(400).json({ message: 'Category name already exists.' });
    }
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// GET /api/categories - جلب جميع الفئات
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }); // ترتيب حسب الاسم
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// PUT /api/categories/:id - تحديث فئة موجودة
app.put('/api/categories/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name, description } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { name, description },
      { new: true, runValidators: true } // new: true لإرجاع المستند المحدث, runValidators لتطبيق التحقق من صحة السكيما
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.code === 11000) {
        return res.status(400).json({ message: 'Category name already exists.' });
    }
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// DELETE /api/categories/:id - حذف فئة
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    // ملاحظة: هنا لا نحذف المنتجات المرتبطة بهذه الفئة تلقائياً
    // إذا أردت ذلك، ستحتاج إلى منطق إضافي (مثلاً، إما منع الحذف إذا كانت هناك منتجات، أو تحديث المنتجات)
    // هذا يعتمد على قواعد العمل لديك. الآن سنحذف الفئة فقط.

    const deletedCategory = await Category.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



