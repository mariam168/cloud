import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
    ar: {
        "general": {
            "loading": "جاري التحميل...", "error": "خطأ", "notApplicable": "لا ينطبق", "unnamedItem": "عنصر غير مسمى",
            "priceNotAvailable": "السعر غير متاح", "shopNow": "تسوق الآن", "currencySymbol": "ر.س", "off": "خصم",
            "noImage": "لا توجد صورة", "errorFetchingData": "فشل جلب البيانات. يرجى المحاولة لاحقاً.",
            "resetting": "جاري إعادة التعيين...", "unnamedProduct": "منتج غير مسمى", "imageFailedToLoad": "فشل تحميل الصورة",
            "noImageAvailable": "لا توجد صورة متاحة", "currencyCode": "SAR", "viewImage": "عرض الصورة", "thumbnail": "صورة مصغرة",
            "decreaseQuantity": "تقليل الكمية", "increaseQuantity": "زيادة الكمية", "productQuantity": "كمية المنتج",
            "subtotal": "المجموع الفرعي", "total": "الإجمالي", "inCartShort": "في السلة", "addToCartShort": "أضف",
            "removeFromWishlist": "إزالة من المفضلة", "addToWishlist": "أضف للمفضلة", "description": "الوصف",
            "submitting": "جاري الإرسال...", "verifyHuman": "الرجاء التحقق أنك لست روبوتاً.", "sending": "جاري الإرسال...",
            "apiError": "عنوان API غير معرف.", "view": "عرض", "pleaseWait": "يرجى الانتظار", "image": "صورة", "clear": "حذف",
            "close": "إغلاق", "copyId": "نسخ المعرف",
        },
        "heroSection": {
            "bigSale": "عرض لفترة محدودة", "price": "السعر", "validFrom": "صالح من", "validUntil": "صالح حتى",
            "installment": "أقساط ميسرة", "weeklySale": "عروض فلاش أسبوعية!", "weeklyDesc": "اكتشف توفيرات لا تصدق على منتجاتك المفضلة! احصل على خصم يصل إلى",
            "thisWeek": "لهذا الأسبوع لفترة محدودة.", "allOffersTitle": "اكتشف كل العروض!", "allOffersDesc": "استكشف جميع العروض الترويجية والخصومات المتاحة في مكان واحد.",
            "noDataAvailable": "لا توجد عروض مثيرة متاحة حالياً."
        },
        "homepage": {
            "discountsTitle": "أكواد خصم حصرية", "discountCode": "كودك", "copied": "تم النسخ!", "shopByCategory": "تسوق حسب الفئة",
            "loadingCategories": "جاري تحميل الفئات...", "categoryFetchError": "فشل جلب الفئات. يرجى المحاولة لاحقاً.",
            "noCategoriesFound": "لم يتم العثور على أي فئات.", "categoryImageAlt": "صورة الفئة", "unnamedCategory": "فئة غير مسماة",
            "trendingProductsTitle": "المنتجات الأكثر رواجًا", "trendingProductsDesc": "اكتشف منتجاتنا الأكثر شعبية هذا الأسبوع.",
            "noTrendingProductsFound": "لم يتم العثور على منتجات رائجة.", "off": "خصم", "copyCode": "نسخ الكود",
        },
        "productCard": {
            "uncategorized": "غير مصنف", "viewProduct": "عرض المنتج", "addToCart": "أضف للسلة", "inCart": "في السلة",
            "addToFavorites": "أضف للمفضلة", "removeFromFavorites": "في المفضلة", "viewProductError": "لا يمكن عرض تفاصيل المنتج: بيانات المنتج مفقودة.",
            "addToFavoritesError": "لا يمكن إضافة المنتج للمفضلة: بيانات المنتج غير مكتملة.", "addToCartError": "لا يمكن إضافة المنتج للسلة: بيانات المنتج غير مكتملة.",
            "specialOffer": "عرض خاص", "viewDetails": "عرض التفاصيل", "variationsAvailable": "المتغيرات المتاحة",
        },
        "shopPage": {
            "filter": "تصفية", "showFilters": "إظهار المرشحات", "filterByCategory": "تصفية حسب الفئة",
            "filterBySubCategory": "تصفية حسب الفئة الفرعية", "priceRange": "نطاق السعر", "filterByBrand": "تصفية حسب العلامة التجارية",
            "sortBy": "فرز حسب:", "popularity": "الشعبية", "priceLowToHigh": "السعر: من الأقل للأعلى",
            "priceHighToLow": "السعر: من الأعلى للأقل", "nameAZ": "الاسم (أ-ي)", "showingItems": "عرض", "items": "عنصر",
            "noProductsFound": "لم يتم العثور على منتجات مطابقة لمعاييرك.", "errorFetchingProducts": "فشل تحميل المنتجات. يرجى التحقق من اتصالك أو المحاولة مرة أخرى.",
            "resetFilters": "إعادة تعيين الفلاتر", "allSubcategories": "جميع الفئات الفرعية", "addToCart": "اضافة للسلة",
            "currencyCode": "ريال سعودي", "addToFavorites": "اضافة للمفضلة", "filterByOption": "تصفية حسب الخيار",
            "allOptions": "جميع الخيارات", "removeFromFavorites": "حذف من المفضلة",
        },
        "adminDashboardPage": {
            "dashboardTitle": "لوحة التحكم", "productManagement": "إدارة المنتجات", "categoryManagement": "إدارة الفئات",
            "orderManagement": "إدارة الطلبات", "userManagement": "إدارة المستخدمين", "advertisementManagement": "إدارة الإعلانات",
            "discountManagement": "إدارة الخصومات", "settings": "الإعدادات", "analytics": "التحليلات",
            "errorFetchingData": "فشل جلب بيانات لوحة التحكم.", "noDataAvailable": "لا توجد بيانات متاحة لعرض لوحة التحكم.",
            "noDataAvailableTitle": "لا توجد بيانات!", "totalRevenue": "إجمالي الإيرادات", "totalOrders": "إجمالي الطلبات",
            "totalProducts": "إجمالي المنتجات", "totalUsers": "إجمالي المستخدمين", "salesOverviewChartTitle": "نظرة عامة على المبيعات",
            "revenueLabel": "الإيرادات", "orderCountLabel": "عدد الطلبات", "noSalesData": "لا توجد بيانات مبيعات متاحة.",
            "topSellingProductsTitle": "أكثر المنتجات مبيعاً", "quantitySoldLabel": "الكمية المباعة", "itemsSoldLabel": "عناصر مباعة",
            "noTopProductsData": "لا توجد بيانات عن المنتجات الأكثر مبيعاً.", "categoryDistributionChartTitle": "توزيع الفئات",
            "items": "عناصر", "noCategoryData": "لا توجد بيانات للفئات متاحة.", "ordersByStatusTitle": "الطلبات حسب الحالة",
            "noOrderStatusData": "لا توجد بيانات لحالة الطلبات متاحة.", "userRegistrationTitle": "تسجيل المستخدمين بمرور الوقت",
            "usersRegisteredLabel": "المستخدمون المسجلون", "noUserRegistrationData": "لا توجد بيانات لتسجيل المستخدمين متاحة.",
            "recentOrdersTitle": "الطلبات الأخيرة", "orderId": "معرف الطلب", "date": "التاريخ", "customer": "العميل",
            "total": "الإجمالي", "status": "الحالة", "guestUser": "زائر", "noRecentOrders": "لا توجد طلبات حديثة متاحة.",
            "orderStatuses": { "pending": "معلق", "processing": "قيد المعالجة", "shipped": "تم الشحن", "delivered": "تم التسليم", "cancelled": "ملغى", "paid_(not_delivered)": "مدفوع (لم يتم التوصيل)", "pending_payment": "بانتظار الدفع" },
            "footerText": "لوحة تحكم تكنو إكسبرس. جميع الحقوق محفوظة."
        },
        "adminProductsPage": {
            "title": "إدارة المنتجات", "addNewProduct": "إضافة منتج جديد", "productList": "قائمة المنتجات",
            "footerText": "لوحة تحكم تكنو إكسبرس. جميع الحقوق محفوظة."
        },
        "productAdmin": {
            "productNameEn": "اسم المنتج (الإنجليزية)", "productNameAr": "اسم المنتج (العربية)", "descriptionEn": "الوصف (الإنجليزية)", "descriptionAr": "الوصف (العربية)",
            "priceLabel": "السعر الأساسي", "categoryLabel": "الفئة الرئيسية", "subCategoryLabel": "الفئة الفرعية (اختياري)",
            "nameAndPriceRequired": "اسم المنتج (الإنجليزية والعربية) والسعر مطلوبان.", "addSuccess": "تم إضافة المنتج بنجاح!", "addError": "خطأ في إضافة المنتج",
            "submittingButton": "جاري الإضافة...", "addButton": "إضافة منتج", "imageTable": "صورة", "nameTable": "الاسم", "categoryTable": "الفئة",
            "priceTable": "السعر", "actionsTable": "إجراءات", "addProductButton": "إضافة منتج", "addNewProduct": "إضافة منتج جديد",
            "editProductTitle": "تعديل المنتج", "confirmDelete": "هل أنت متأكد أنك تريد حذف المنتج \"{productName}\"؟ لا يمكن التراجع عن هذا الإجراء.",
            "deleteSuccess": "تم حذف المنتج بنجاح!", "updateButton": "حفظ التغييرات", "updatingButton": "جاري الحفظ...", "cancelButton": "إلغاء",
            "imageOptional": "صورة (اختياري)", "specificAttributes": "خصائص الفئة", "productVariants": "متغيرات المنتج", "variant": "متغير",
            "variantOptions": "خيارات المتغير", "addOption": "إضافة خيار", "priceAdjustment": "تعديل السعر", "stock": "المخزون", "sku": "SKU (اختياري)",
            "addVariant": "إضافة متغير", "mainImageLabel": "الصورة الرئيسية", "additionalImagesLabel": "صور إضافية", "videosLabel": "فيديوهات",
            "selectOptionType": "اختر نوع الخيار", "selectCategory": "اختر فئة", "selectSubCategory": "اختر فئة فرعية",
            "optionValuePlaceholder": "قيمة الخيار", "removeImage": "إزالة الصورة", "videoPreview": "معاينة الفيديو", "selectedFile": "الملف المحدد",
            "noProducts": "لا توجد منتجات لعرضها.", "uncategorized": "غير مصنف", "allVariantOptionsRequired": "يجب أن يكون لجميع خيارات المتغيرات اسم وقيمة.",
            "variantOptionsRequired": "يجب أن يحتوي كل متغير على خيار واحد على الأقل.", "variantStockRequired": "مخزون المتغير مطلوب ويجب ألا يكون سالبًا.", "updateError": "حدث خطأ أثناء تحديث المنتج.",
        },
        "adminCategoryPage": {
            "manageCategories": "إدارة الفئات", "addCategoryButton": "إضافة فئة", "categoryName": "اسم الفئة", "subCategoriesCount": "عدد الفئات الفرعية",
            "actions": "إجراءات", "editCategory": "تعديل الفئة", "deleteCategory": "حذف الفئة", "confirmDelete": "هل أنت متأكد أنك تريد حذف الفئة \"{categoryName}\"؟ سيؤدي هذا إلى حذف جميع الفئات الفرعية المرتبطة بها.",
            "errorFetchingCategories": "فشل في تحميل الفئات.", "noCategoriesFound": "لم يتم العثور على فئات.", "noDescription": "لا يوجد وصف متاح.",
            "addCategoryModalTitle": "إضافة فئة جديدة", "categoryNameLabelEn": "اسم الفئة (الإنجليزية)", "categoryNameLabelAr": "اسم الفئة (العربية)",
            "categoryImageLabel": "صورة الفئة", "subCategoriesTitle": "الفئات الفرعية",
        }
    },
    en: {
        "general": {
            "loading": "Loading...", "error": "Error", "notApplicable": "N/A", "unnamedItem": "Unnamed Item", "priceNotAvailable": "Price N/A",
            "shopNow": "Shop Now", "currencySymbol": "$", "off": "OFF", "noImage": "No Image", "errorFetchingData": "Failed to fetch data. Please try again later.",
            "resetting": "Resetting...", "unnamedProduct": "Unnamed Product", "imageFailedToLoad": "Image failed to load", "noImageAvailable": "No Image Available",
            "currencyCode": "USD", "viewImage": "View Image", "thumbnail": "Thumbnail", "decreaseQuantity": "Decrease Quantity", "increaseQuantity": "Increase Quantity",
            "productQuantity": "Product Quantity", "subtotal": "Subtotal", "total": "Total", "inCartShort": "In Cart", "addToCartShort": "Add",
            "removeFromWishlist": "Remove from Wishlist", "addToWishlist": "Add to Wishlist", "description": "Description", "submitting": "Submitting...",
            "verifyHuman": "Please verify you are human.", "sending": "Sending...", "apiError": "API URL is not defined.", "view": "View", "pleaseWait": "Please wait...",
            "image": "image", "clear": "clear", "close": "Close", "copyId": "Copy ID",
        },
        "heroSection": {
            "bigSale": "Limited Time Offer", "price": "Price", "validFrom": "Valid From", "validUntil": "Valid Until",
            "installment": "Easy Installments", "weeklySale": "Weekly Flash Deals!", "weeklyDesc": "Unlock incredible savings on your favorite products! Get up to",
            "thisWeek": "for a limited time.", "allOffersTitle": "Discover All Offers!", "allOffersDesc": "Explore all available promotions and discounts in one place.",
            "noDataAvailable": "No exciting offers available right now."
        },
        "homepage": {
            "discountsTitle": "Exclusive Discount Codes", "discountCode": "Your Code", "copied": "Copied!", "shopByCategory": "Shop by Category",
            "loadingCategories": "Loading categories...", "categoryFetchError": "Failed to fetch categories. Please try again later.", "noCategoriesFound": "No categories found.",
            "categoryImageAlt": "Category Image", "unnamedCategory": "Unnamed Category", "trendingProductsTitle": "Trending Products",
            "trendingProductsDesc": "Discover our most popular products this week.", "noTrendingProductsFound": "No trending products found.",
            "off": "OFF", "copyCode": "Copy Code",
        },
        "productCard": {
            "uncategorized": "Uncategorized", "viewProduct": "View Product", "addToCart": "Add to Cart", "inCart": "In Cart",
            "addToFavorites": "Add to Favorites", "removeFromFavorites": "In Favorites", "viewProductError": "Cannot view product details: Product data is missing.",
            "addToFavoritesError": "Cannot add product to favorites: Product data is incomplete.", "addToCartError": "Cannot add product to cart: Product data is incomplete.",
            "specialOffer": "Special Offer", "viewDetails": "View Details", "variationsAvailable": "Variations Available", "variantUnavailable": "Variant Unavailable",
        },
        "features": {
            "freeShipping": "Free Shipping", "freeShippingDesc": "Free shipping on all orders over $100", "support247": "Support 24/7",
            "support247Desc": "Get help anytime you need it", "onlinePayment": "Online Payment", "onlinePaymentDesc": "Secure online payment options",
            "easyReturn": "Easy Return", "easyReturnDesc": "Hassle-free returns within 30 days"
        },
        "mainHeader": {
            "siteName": "TechXpress", "searchPlaceholder": "Search for products...", "hotline": "Hotline", "myWishlist": "My Wishlist",
            "myCart": "My Cart", "myProfile": "My Profile", "myAccount": "My Account", "loginRegister": "Login / Register", "login": "Login"
        },
        "topBar": {
            "languageArabic": "Arabic", "languageEnglish": "English", "home": "Home", "shop": "Shop", "aboutUs": "About Us",
            "contactUs": "Contact Us", "dashboard": "Dashboard", "helloUser": "Hello", "helloGuest": "Hello Guest",
            "logout": "Logout", "signIn": "Sign In", "register": "Register", "lightMode": "Light Mode", "darkMode": "Dark Mode"
        },
        "shopPage": {
            "filter": "Filter", "showFilters": "Show Filters", "filterByCategory": "Filter by Category", "filterBySubCategory": "Filter by Sub-Category",
            "priceRange": "Price Range", "filterByBrand": "Filter by Brand", "sortBy": "Sort by:", "popularity": "Popularity",
            "priceLowToHigh": "Price: Low to High", "priceHighToLow": "Price: High to Low", "nameAZ": "Name (A-Z)", "showingItems": "Showing",
            "items": "items", "noProductsFound": "No products found matching your criteria.", "errorFetchingProducts": "Failed to load products. Please check your connection or try again.",
            "currencySymbol": "$", "addToCart": "Add to Cart", "currencyCode": "SAR", "resetFilters": "Reset Filters", "allSubcategories": "All Subcategories",
            "addToFavorites": "Add to Favorites", "filterByOption": "Filter by Option", "allOptions": "All Options", "removeFromFavorites": "Remove from Favorites",
        },
        "brands": {
            "All Brands": "All Brands", "Nike": "Nike", "Urban Threads": "Urban Threads", "Dash Athletics": "Dash Athletics", "TechGen": "TechGen",
        },
        "wishlistPage": {
            "loadingWishlist": "Loading wishlist...", "pleaseLogin": "Please log in to view your wishlist.",
            "emptyWishlist": "Your wishlist is currently empty. Start adding your favorite items!", "wishlistTitle": "My Wishlist",
            "loginRequiredTitle": "Access Denied", "emptyWishlistTitle": "Your Wishlist is Empty!"
        },
        "auth": {
            "resetPasswordTitle": "Reset Password", "tokenExpired": "Reset link is missing or invalid.", "tokenExpiredOrInvalid": "This link is invalid or has expired.",
            "passwordMismatch": "Passwords do not match.", "passwordResetSuccess": "Password has been reset successfully. You will be redirected to the login page.",
            "passwordResetError": "Failed to reset password.", "newPasswordLabel": "New Password", "confirmNewPasswordLabel": "Confirm New Password",
            "requestNewLink": "Request New Link", "resetPasswordButton": "Reset Password", "verifyingLink": "Verifying reset link...",
            "passwordMinLength": "Password must be at least 6 characters long.", "registerTitle": "Create Your Account", "nameLabel": "Full Name",
            "emailLabel": "Email Address", "passwordLabel": "Password", "confirmPasswordLabel": "Confirm Password", "recaptchaError": "reCAPTCHA error.",
            "recaptchaExpired": "reCAPTCHA expired. Please re-verify.", "recaptchaRequired": "Please complete the reCAPTCHA.",
            "registerSuccess": "Registration successful! Please check your email for activation link.", "registerError": "Registration failed. Please try again.",
            "registerButton": "Register", "loginPrompt": "Already have an account?", "loginLink": "Login here",
            "loginTitle": "Login to Your Account", "loginSuccess": "Login successful!", "loginError": "Login failed. Please check your credentials.",
            "forgotPassword": "Forgot Password?", "registerPrompt": "Don’t have an account?", "registerLink": "Sign up here",
            "forgotPasswordTitle": "Forgot Password", "forgotPasswordInstructions": "Enter your email address and we'll send you a link to reset your password.",
            "resetEmailSent": "Password reset link sent to your email.", "resetEmailError": "Failed to send password reset email.",
            "sendResetLink": "Send Reset Link", "loginNow": "Back to Login", "accountActivation": "Account Activation",
            "activationSuccess": "Your account has been activated successfully!", "activationError": "Account activation failed. The link is invalid or has expired.",
            "tokenMissing": "Activation token is missing or invalid.", "registerSuccessEmailSent": "Registration successful! Please check your email for activation link.",
            "registrationCompleteTitle": "Registration Complete", "goToLogin": "Go to Login", "loginButton": "Login", "loginWelcome": "Welcome Back",
            "loginSuccessTitle": "Login Successful",
        },
        "productDetailsPage": {
            "productDataNotFound": "Product data not found.", "notFound": "Product not found.", "failedToLoad": "Failed to load product. Please check your connection or try again.",
            "productDataMissing": "Product data is missing.", "quantity": "Quantity", "securePayment": "Secure Payment", "fastShipping": "Fast Shipping",
            "qualityGuarantee": "Quality Guarantee", "productDescription": "Product Description", "productImages": "Product Images",
            "continueShopping": "Continue Shopping", "specifications": "Specifications", "availableOptions": "Available Options", "selectOption": "Select Option",
            "productMedia": "Product Media", "selectMoreOptions": "Select more options", "sizes": "sizes", "color": "color",
            "clearSelection": "clear selection", "outOfStock": "Out of stock", "variantNotFound": "variant not found",
        },
        "cart": {
            "loginRequired": "Please log in to add products to your cart.", "productAdded": "Product added to cart.", "productAddedSuccess": "Product added to cart successfully.",
            "updateSuccess": "Cart updated successfully.", "productRemovedSuccess": "Product removed from cart successfully.",
        },
        "wishlist": {
            "loginRequired": "Please log in to add to favorites."
        },
        "cartPage": {
            "shoppingCart": "Shopping Cart", "cartEmpty": "Your cart is empty!", "cartEmptyDesc": "Looks like you haven't added anything to your cart yet.",
            "continueShopping": "Continue Shopping", "removeItem": "Remove Item", "cartTotal": "Cart Total", "proceedToCheckout": "Proceed to Checkout",
            "cartEmptyCheckout": "Your cart is empty. Add items before checking out.", "stockStatus": "Stock Status", "inStock": "In Stock",
        },
        "checkoutPage": {
            "checkoutTitle": "Checkout", "orderSummary": "Order Summary", "discountCode": "Discount Code", "enterDiscountCodePlaceholder": "Enter discount code",
            "apply": "Apply", "remove": "Remove", "invalidOrExpiredDiscount": "Invalid or expired discount code.", "minOrderNotMet": "Discount requires a minimum order of {amount}.",
            "discountAppliedSuccessfully": "Discount applied successfully!", "discountRemoved": "Discount removed.", "shippingAndPayment": "Shipping & Payment",
            "shippingAddress": "Shipping Address", "enterAddressPlaceholder": "Enter Address", "enterCityPlaceholder": "Enter City", "enterPostalCodePlaceholder": "Enter Postal Code",
            "enterCountryPlaceholder": "Enter Country", "paymentMethod": "Payment Method", "cashOnDelivery": "Cash on Delivery", "placeOrder": "Place Order",
            "placingOrder": "Placing Order...", "orderPlacedSuccessTitle": "Order Placed Successfully!", "orderPlacedSuccessMessage": "Thank you for your purchase. You will be redirected to the home page shortly.",
            "redirecting": "Redirecting...", "pleaseLoginToCheckout": "Please log in to checkout.", "shippingPaymentRequired": "Please provide shipping address and payment method.",
            "discountInvalidOrder": "The applied discount is no longer valid due to cart changes. Please review your order.",
            "discountInvalidated": "Applied discount became invalid.", "orderPlacementFailed": "Order placement failed.", "orderPlacementError": "Error placing order"
        },
        "contactUsPage": {
            "title": "Contact Us", "description": "Have any questions or need assistance? Feel free to reach out to us. Our team is available to help you with any inquiries regarding our services and support.",
            "yourName": "Your Name", "yourSubject": "Your Subject", "yourEmail": "Your Email", "yourPhone": "Your Phone", "yourMessage": "Your Message",
            "submitMessage": "Submit Message", "successMessage": "Message submitted successfully! Thank you.", "errorMessage": "Failed to submit message. Please try again.",
            "apiError": "API URL is not defined. Please ensure REACT_APP_API_URL is set in your frontend .env file and restart the development server.",
            "networkError": "An error occurred during submission. Please check your network connection or server logs."
        },
        "aboutUsPage": {
            "title": "TechXpress - Your Go-To Electronics Store",
            "commitment": "At TechXpress, we are committed to bringing you the latest and greatest in electronics. Whether you’re looking for cutting-edge smartphones, high-performance laptops, or premium accessories, we offer a wide selection of top-quality products at unbeatable prices.",
            "belief": "We believe in providing an exceptional shopping experience by ensuring fast delivery, secure payment options and outstanding customer service. Our goal is to make tech shopping simple, reliable, and enjoyable for everyone.",
            "explore": "Explore our collection and stay ahead with the latest technology trends. Your satisfaction is our priority!",
            "imageAlt": "Handshake representing partnership and trust"
        },
        "allOffersPage": {
            "title": "All Available Offers", "noOffers": "No offers are available at the moment.", "noOffersTitle": "No Offers Available!",
            "productNotLinked": "This offer is not linked to a specific product."
        },
        "advertisementDetails": {
            "notFound": "Advertisement not found.", "noDetails": "No advertisement details found.", "noDetailsTitle": "No Advertisement Details!",
            "originalPrice": "Original Price", "currentPrice": "Current Price", "validity": "Validity Period", "goToOffer": "Go To Offer",
            "typeSlide": "Main Carousel Offer", "typeSideOffer": "Side Offer", "typeWeeklyOffer": "Weekly Deal", "typeOther": "Special Offer",
            "priceDetails": "Price Details"
        },
        "adminDashboardPage": {
            "dashboardTitle": "Dashboard", "productManagement": "Products", "categoryManagement": "Categories", "orderManagement": "Orders",
            "userManagement": "Users", "advertisementManagement": "Advertisements", "discountManagement": "Discounts", "settings": "Settings",
            "analytics": "Analytics", "errorFetchingData": "Failed to fetch dashboard data.", "noDataAvailable": "No data available to display dashboard.",
            "noDataAvailableTitle": "No Data Available!", "totalRevenue": "Total Revenue", "totalOrders": "Total Orders",
            "totalProducts": "Total Products", "totalUsers": "Total Users", "salesOverviewChartTitle": "Sales Overview",
            "revenueLabel": "Revenue", "orderCountLabel": "Order Count", "noSalesData": "No sales data available.",
            "topSellingProductsTitle": "Top Selling Products", "quantitySoldLabel": "Quantity Sold", "itemsSoldLabel": "items sold",
            "noTopProductsData": "No top selling products data available.", "categoryDistributionChartTitle": "Category Distribution",
            "items": "items", "noCategoryData": "No category data available.", "ordersByStatusTitle": "Orders by Status",
            "noOrderStatusData": "No order status data available.", "userRegistrationTitle": "User Registration Over Time",
            "usersRegisteredLabel": "Users Registered", "noUserRegistrationData": "No user registration data available.",
            "recentOrdersTitle": "Recent Orders", "orderId": "Order ID", "date": "Date", "customer": "Customer",
            "total": "Total", "status": "Status", "guestUser": "Guest User", "noRecentOrders": "No recent orders available.",
            "orderStatuses": { "pending": "Pending", "processing": "Processing", "shipped": "Shipped", "delivered": "Delivered", "cancelled": "Cancelled", "paid_(not_delivered)": "Paid (Not Delivered)", "pending_payment": "Pending Payment" },
            "footerText": "TechXpress Admin. All rights reserved."
        },
        "adminProductsPage": {
            "title": "Product Management", "addNewProduct": "Add New Product", "productList": "Product List",
            "footerText": "TechXpress Admin. All rights reserved."
        },
        "productAdmin": {
            "productNameEn": "Product Name (English)", "productNameAr": "Product Name (Arabic)", "descriptionEn": "Description (English)", "descriptionAr": "Description (Arabic)",
            "priceLabel": "Base Price", "categoryLabel": "Main Category", "subCategoryLabel": "Sub-Category (Optional)",
            "nameAndPriceRequired": "Product English/Arabic names and a valid price are required.", "addSuccess": "Product added successfully!", "addError": "Error adding product",
            "submittingButton": "Adding...", "addButton": "Add Product", "imageTable": "Image", "nameTable": "Name", "categoryTable": "Category",
            "priceTable": "Price", "actionsTable": "Actions", "addProductButton": "Add Product", "addNewProduct": "Add New Product",
            "editProductTitle": "Edit Product", "confirmDelete": "Are you sure you want to delete \"{productName}\"? This action cannot be undone.",
            "deleteSuccess": "Product deleted successfully!", "updateButton": "Save Changes", "updatingButton": "Saving...", "cancelButton": "Cancel",
            "imageOptional": "Image (Optional)", "specificAttributes": "Category Attributes", "productVariants": "Product Variants", "variant": "Variant",
            "variantOptions": "Variant Options", "addOption": "Add Option", "priceAdjustment": "Price Adjustment", "stock": "Stock", "sku": "SKU (Optional)",
            "addVariant": "Add Variant", "mainImageLabel": "Main Image", "additionalImagesLabel": "Additional Images", "videosLabel": "Videos",
            "selectOptionType": "Select Option Type", "selectCategory": "Select a Category", "selectSubCategory": "Select a Sub-Category",
            "optionValuePlaceholder": "Option Value", "removeImage": "Remove Image", "videoPreview": "Video Preview", "selectedFile": "Selected file",
            "noProducts": "No products to display.", "uncategorized": "Uncategorized", "allVariantOptionsRequired": "All variant options must have a name and value.",
            "variantOptionsRequired": "Each variant must have at least one option.", "variantStockRequired": "Variant stock is required and must be non-negative.", "updateError": "An error occurred while updating the product.",
        },
        "adminCategoryPage": {
            "manageCategories": "Manage Categories", "addCategoryButton": "Add Category", "categoryName": "Category Name", "subCategoriesCount": "Sub-Categories",
            "actions": "Actions", "editCategory": "Edit Category", "deleteCategory": "Delete Category", "confirmDelete": "Are you sure you want to delete \"{categoryName}\"? This will also delete all its sub-categories.",
            "errorFetchingCategories": "Failed to load categories.", "noCategoriesFound": "No categories found.", "noDescription": "No description available.",
            "addCategoryModalTitle": "Add New Category", "categoryNameLabelEn": "Category Name (English)", "categoryNameLabelAr": "Category Name (Arabic)",
            "categoryImageLabel": "Category Image", "subCategoriesTitle": "Sub-Categories",
        },
        "adminOrdersPage": {
            "allOrders": "All Orders", "orderID": "Order ID", "user": "User", "date": "Date", "total": "Total", "paid": "Paid",
            "delivered": "Delivered", "yes": "Yes", "no": "No", "details": "Details", "orderDetails": "Order Details",
            "shippingAddress": "Shipping Address", "paymentMethod": "Payment Method", "address": "Address", "status": "Status",
            "method": "Method", "orderItems": "Order Items", "customerInfo": "Customer Info", "name": "Name", "email": "Email",
            "orderSummary": "Order Summary", "itemsPrice": "Items Price", "shippingPrice": "Shipping Price", "taxPrice": "Tax Price",
            "totalPrice": "Total Price", "dates": "Dates", "orderedAt": "Ordered At", "deliveredAt": "Delivered At",
            "noOrderData": "No order data available.", "paidAt": "Paid At",
        },
        "advertisementAdmin": {
            "advertisementListTitle": "All Advertisements", "addAdvertisementButton": "Add Advertisement", "imageTable": "Image", "titleTable": "Title",
            "descriptionTable": "Description", "typeTable": "Type", "startDate": "Start Date", "endDate": "End Date", "originalPrice": "Original Price",
            "discountedPrice": "Discount Price", "currency": "Currency", "activeTable": "Active", "orderTable": "Order", "actionsTable": "Actions",
            "titleEn": "Title (English)", "titleAr": "Title (Arabic)", "descriptionEn": "Description (English)", "descriptionAr": "Description (Arabic)",
            "linkLabel": "Link", "typeLabel": "Type", "orderLabel": "Order", "isActive": "Active", "imageLabel": "Image", "addButton": "Add",
            "editAdvertisementTitle": "Edit Advertisement", "imageOptional": "Image (Optional)", "updateButton": "Update Advertisement",
            "confirmDelete": "Are you sure you want to delete this advertisement? This action cannot be undone.",
        },
        "discountAdmin": {
            "discountListTitle": "All Discounts", "codeTable": "Code", "typeTable": "Type", "valueTable": "Value", "minOrderTable": "Min Order",
            "maxDiscountTable": "Max Discount", "startDateTable": "Start Date", "endDateTable": "End Date", "activeTable": "Active",
            "actionsTable": "Actions", "addDiscountButton": "Add Discount", "codeLabel": "Code",
        }
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        const savedLanguage = localStorage.getItem('appLanguage');
        return savedLanguage || 'en';
    });

    useEffect(() => {
        localStorage.setItem('appLanguage', language);
        document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    }, [language]);

    const toggleLanguage = () => {
        setLanguage(prevLanguage => (prevLanguage === 'en' ? 'ar' : 'en'));
    };

    const changeLanguage = (newLanguage) => {
        if (translations[newLanguage]) {
            setLanguage(newLanguage);
        } else {
            console.warn(`Language "${newLanguage}" is not supported.`);
        }
    };

    const t = (key, options = {}) => {
        const keys = key.split('.');
        let currentTranslation = translations[language];
        for (let i = 0; i < keys.length; i++) {
            if (currentTranslation && typeof currentTranslation === 'object' && keys[i] in currentTranslation) {
                currentTranslation = currentTranslation[keys[i]];
            } else {
                let englishTranslation = translations['en'];
                for (let j = 0; j < keys.length; j++) {
                    if (englishTranslation && typeof englishTranslation === 'object' && keys[j] in englishTranslation) {
                        englishTranslation = englishTranslation[keys[j]];
                    } else {
                        return key;
                    }
                }
                currentTranslation = englishTranslation;
                break;
            }
        }

        if (typeof currentTranslation === 'string') {
            return Object.keys(options).reduce((acc, key) => {
                const regex = new RegExp(`{${key}}`, 'g');
                return acc.replace(regex, options[key]);
            }, currentTranslation);
        }

        return currentTranslation;
    };

    return (
        <LanguageContext.Provider value={{ language, t, toggleLanguage, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};