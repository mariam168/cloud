const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // تأكد من استيراد crypto

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ],
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false, // لا تجلب كلمة المرور تلقائياً عند الاستعلام
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    isActivated: { 
        type: Boolean,
        default: false,
    },
    activationToken: String,
    activationTokenExpire: Date,
    resetPasswordToken: String, // لتخزين الـ hashed token لإعادة تعيين كلمة المرور
    resetPasswordExpire: Date,  // لتخزين تاريخ انتهاء صلاحية التوكن
    wishlist: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product' 
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// هاش كلمة المرور قبل الحفظ
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) { // فقط إذا تم تعديل حقل كلمة المرور
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// مطابقة كلمة المرور المدخلة بكلمة المرور المشفرة
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// توليد توكن إعادة تعيين كلمة المرور
UserSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex'); // توكن خام (Plain text)
    
    // تشفير التوكن وحفظه في الموديل
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // تعيين تاريخ انتهاء الصلاحية (10 دقائق)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; 

    return resetToken; // إرجاع التوكن الخام (سيتم إرساله في الإيميل)
};

// توليد توكن تفعيل الحساب
UserSchema.methods.getActivationToken = function () {
    const activationToken = crypto.randomBytes(20).toString('hex');
    this.activationToken = crypto
        .createHash('sha256')
        .update(activationToken)
        .digest('hex');
    this.activationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // صالح لمدة 24 ساعة
    return activationToken;
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);
module.exports = User;