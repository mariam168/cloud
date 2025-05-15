// backend/server.js
require('dotenv').config(); // في بداية الملف لقراءة المتغيرات من .env

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');

// استيراد الموديلات
const Product = require('./models/Product');
const Category = require('./models/Category');
// User model سيتم استخدامه داخل authRoutes و authMiddleware

// استيراد المسارات (Routes)
const authRoutes = require('./routes/auth');
// يمكنك فصل مسارات المنتجات والفئات إلى ملفات خاصة بها أيضاً إذا أردت
// const productRoutes = require('./routes/products');
// const categoryRoutes = require('./routes/categories');

// استيراد الـ Middleware
const { protect, admin } = require('./middleware/authMiddleware');

const app = express();

// Middlewares أساسية
app.use(cors()); // يجب أن يكون من أوائل الـ middlewares
app.use(express.json()); // لتحليل أجسام الطلبات من نوع JSON
app.use(express.urlencoded({ extended: true })); // لتحليل الأجسام المشفرة بواسطة URL

// إعداد Multer لتخزين الملفات (كما كان)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)){ // إنشاء مجلد uploads إذا لم يكن موجوداً
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// تقديم الملفات الثابتة (الصور المرفوعة) من مجلد 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// الاتصال بـ MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/productsDB';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected to:', MONGO_URI))
  .catch((error) => console.error('MongoDB connection error:', error));

// === تركيب المسارات (Mount Routers) ===
app.use('/api/auth', authRoutes);
// app.use('/api/products', productRoutes); // إذا فصلت المسارات
// app.use('/api/categories', categoryRoutes); // إذا فصلت المسارات


// === نقاط نهاية API للمنتجات (Products) ===
// GET /api/products (جلب جميع المنتجات - عام)
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// POST /api/product (إنشاء منتج - محمي للمدير فقط)
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
    // const newProduct = new Product({ name, price, description, image: imagePath, category, createdBy: req.user.id }); // إضافة createdBy
    const newProduct = new Product({ name, price, description, image: imagePath, category });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error saving product:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// PUT /api/product/:id (تعديل منتج - محمي للمدير فقط)
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

// DELETE /api/product/:id (حذف منتج - محمي للمدير فقط)
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


// === نقاط نهاية API للفئات (Categories) ===
// GET /api/categories (جلب جميع الفئات - عام)
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// POST /api/categories (إنشاء فئة - محمي للمدير فقط)
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

// PUT /api/categories/:id (تعديل فئة - محمي للمدير فقط)
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

// DELETE /api/categories/:id (حذف فئة - محمي للمدير فقط)
app.delete('/api/categories/:id', protect, admin, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    if (!deletedCategory) { return res.status(404).json({ message: 'Category not found' }); }
    // ملاحظة: إذا أردت حذف المنتجات المرتبطة بهذه الفئة، أو تغيير فئتها، ستحتاج لإضافة منطق هنا.
    // مثال: await Product.updateMany({ category: deletedCategory.name }, { $set: { category: 'Uncategorized' } });
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// معالج خطأ عام (اختياري لكن جيد)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).send('Something broke!');
});


// بدء تشغيل الخادم
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
// const express = require('express');
// const mongoose = require('mongoose');
// const path = require('path');
// const multer = require('multer');
// const cors = require('cors');
// const fs = require('fs'); 
// const Product = require('./models/Product');
// const Category = require('./models/Category');
// const authRoutes = require('./routes/auth');
// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//   }
// });
// const upload = multer({ storage: storage });
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/productsDB';
// mongoose.connect(MONGO_URI)
//   .then(() => console.log('MongoDB connected'))
//   .catch((error) => console.error('MongoDB connection error:', error));
// app.post('/api/product', upload.single('image'), async (req, res) => {
//   try {
//     const { name, price, description, category } = req.body;
//     let imagePath = '';
//     if (req.file) {
//       imagePath = `/uploads/${req.file.filename}`;
//     }
//     if (!name || !price) {
//       return res.status(400).send('Product name and price are required');
//     }
//     const newProduct = new Product({ name, price, description, image: imagePath, category });
//     await newProduct.save();
//     res.status(201).json(newProduct);
//   } catch (error) {
//     console.error('Error saving product:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });
// app.get('/api/products', async (req, res) => {
//   try {
//     const products = await Product.find();
//     res.status(200).json(products);
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });
// app.delete('/api/product/:id', async (req, res) => {
//   try {
//     const productId = req.params.id;
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }
//     if (product.image) {
//       const imagePath = path.join(__dirname, product.image); 
//       if (fs.existsSync(imagePath)) {
//         fs.unlink(imagePath, (err) => {
//           if (err) {
//             console.error("Failed to delete product image:", err);
//           }
//         });
//       }
//     }

//     await Product.findByIdAndDelete(productId);
//     res.status(200).json({ message: 'Product deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting product:', error);
//     res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// });
// app.put('/api/product/:id', upload.single('image'), async (req, res) => {
//   try {
//     const productId = req.params.id;
//     const { name, price, description, category } = req.body;
//     let updatedData = { name, price, description, category };

//     const productToUpdate = await Product.findById(productId);
//     if (!productToUpdate) {
//         return res.status(404).json({ message: "Product not found" });
//     }

//     if (req.file) {
//       if (productToUpdate.image) {
//         const oldImagePath = path.join(__dirname, productToUpdate.image);
//         if (fs.existsSync(oldImagePath)) {
//             fs.unlink(oldImagePath, err => {
//                 if(err) console.error("Error deleting old image:", err);
//             });
//         }
//       }
//       updatedData.image = `/uploads/${req.file.filename}`;
//     } else {
//  }
//     if (!name || name.trim() === "" || price === undefined || price === null || price < 0) {
//         return res.status(400).json({ message: "Product name and a valid price are required." });
//     }
//     updatedData.price = Number(price); 


//     const updatedProduct = await Product.findByIdAndUpdate(
//       productId,
//       updatedData,
//       { new: true }
//     );

//     if (!updatedProduct) {
//       return res.status(404).json({ message: 'Product not found after update attempt' });
//     }

//     res.status(200).json(updatedProduct);
//   } catch (error) {
//     console.error('Error updating product:', error);
//     res.status(500).json({ message: 'Internal Server Error', error: error.message, details: error });
//   }
// });
// app.post('/api/categories', async (req, res) => {
//   try {
//     const { name, description } = req.body;
//     if (!name || name.trim() === "") {
//       return res.status(400).json({ message: 'Category name is required.' });
//     }

//     const newCategory = new Category({ name, description });
//     await newCategory.save();
//     res.status(201).json(newCategory);
//   } catch (error) {
//     console.error('Error creating category:', error);
//     if (error.code === 11000) { 
//         return res.status(400).json({ message: 'Category name already exists.' });
//     }
//     if (error.name === 'ValidationError') {
//         return res.status(400).json({ message: error.message });
//     }
//     res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// });

// app.get('/api/categories', async (req, res) => {
//   try {
//     const categories = await Category.find().sort({ name: 1 });
//     res.status(200).json(categories);
//   } catch (error) {
//     console.error('Error fetching categories:', error);
//     res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// });
// app.put('/api/categories/:id', async (req, res) => {
//   try {
//     const categoryId = req.params.id;
//     const { name, description } = req.body;

//     if (!name || name.trim() === "") {
//       return res.status(400).json({ message: 'Category name is required.' });
//     }

//     const updatedCategory = await Category.findByIdAndUpdate(
//       categoryId,
//       { name, description },
//       { new: true, runValidators: true } 
//     );

//     if (!updatedCategory) {
//       return res.status(404).json({ message: 'Category not found' });
//     }
//     res.status(200).json(updatedCategory);
//   } catch (error) {
//     console.error('Error updating category:', error);
//     if (error.code === 11000) {
//         return res.status(400).json({ message: 'Category name already exists.' });
//     }
//     if (error.name === 'ValidationError') {
//         return res.status(400).json({ message: error.message });
//     }
//     res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// });
// app.delete('/api/categories/:id', async (req, res) => {
//   try {
//     const categoryId = req.params.id;
//     const deletedCategory = await Category.findByIdAndDelete(categoryId);
//     if (!deletedCategory) {
//       return res.status(404).json({ message: 'Category not found' });
//     }
//     res.status(200).json({ message: 'Category deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting category:', error);
//     res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// });
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });



