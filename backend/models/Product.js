// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        en: {
            type: String,
            required: true,
            trim: true
        },
        ar: {
            type: String,
            required: true,
            trim: true
        },
    },
    // السعر الأساسي للمنتج (بدون أي تعديلات من الـ variations)
    price: { 
        type: Number,
        required: true,
        min: 0
    },
    description: {
        en: {
            type: String,
            trim: true
        },
        ar: {
            type: String,
            trim: true
        },
    },
    mainImage: { 
        type: String, 
    },
    additionalImages: [{ 
        type: String, 
    }],
    videos: [{ 
        type: String, 
    }],
    category: {
        type: String,
        trim: true
    },
    subCategory: { 
        type: String,
        default: '', 
        trim: true
    },
    attributes: { 
        type: mongoose.Schema.Types.Mixed, 
        default: {},
    },
    // **تغيير جوهري هنا: 'variations' أصبحت قائمة بالنسخ (Variants) القابلة للشراء**
    variations: [{ // تم إزالة _id: false هنا، Mongoose سيقوم بتوليد _id لكل variant تلقائياً
        // كل عنصر هنا يمثل "نسخة" (Variant) فريدة من المنتج (مثال: تي شيرت أحمر مقاس M)
        
        // مجموعة الخيارات التي تحدد هذه النسخة (مثال: [{optionName: "Color", optionValue: "Red"}, {optionName: "Size", optionValue: "M"}])
        options: [{ 
            _id: false, // لا نريد ObjectId للخيار الفردي داخل الـ options
            optionName: { type: String, required: true }, // اسم الخيار (مثال: "Color", "Size")
            optionValue: { type: String, required: true }, // قيمة الخيار (مثال: "Red", "Large")
        }],
        image: { type: String }, // صورة خاصة بهذه النسخة (مثال: صورة للتي شيرت الأحمر)
        priceAdjustment: { type: Number, default: 0 }, // تعديل السعر لهذه النسخة (يمكن أن يكون موجب أو سالب)
        stock: { type: Number, default: 0, min: 0 }, // مخزون خاص بهذه النسخة (مهم جداً)
        sku: { type: String, trim: true, unique: true, sparse: true } // رمز تعريف خاص بهذه النسخة (اختياري، يفضل أن يكون فريداً)
    }],
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;