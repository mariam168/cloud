import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
    ar: {
        "general": {
            "loading": "جاري التحميل...", "error": "خطأ", "notApplicable": "لا ينطبق", "unnamedItem": "عنصر غير مسمى", "priceNotAvailable": "السعر غير متاح",
            "shopNow": "تسوق الآن", "currencySymbol": "ر.س", "off": "خصم", "noImage": "لا توجد صورة", "errorFetchingData": "فشل جلب البيانات. يرجى المحاولة لاحقاً.",
            "unnamedProduct": "منتج غير مسمى", "imageFailedToLoad": "فشل تحميل الصورة", "noImageAvailable": "لا توجد صورة متاحة",
            "currencyCode": "SAR", "description": "الوصف", "close": "إغلاق", "copyId": "نسخ المعرف",
            "yes": "نعم", "no": "لا", "back": "رجوع", "active": "نشط", "inactive": "غير نشط", "none": "لا شيء",
            "verifyHuman": "يرجى إثبات أنك لست روبوت.", "apiError": "خطأ في إعدادات الواجهة البرمجية (API).",
            "search":"ابحث","backToOrders":"العودة للطلبات","loadingData":"جاري تحميل البيانات...","expand":"توسيع",
            "loadingOrders":"جاري تحميل الطلبات...","clearSearch":"حذف البحث","noDataFound":"لا توجد بيانات",
            "cancel" :"الغاء","addCategory":"اضافة فئة","saving":"جاري الحفظ...","saveChanges":"حفظ التغييرات",
            "errorOccurred":"حدث خطاء. يرجى المحاولة لاحقاً.","retry":"اعادة المحاولة","actions":"العمليات",
            "edit":"تحرير","delete":"حذف","noResultsFound":"لم يتم العثور على نتائج.", "add": "إضافة",
    "edit": "تعديل",
    "delete": "حذف",
    "actions": "إجراءات","noDataForChart":"لا توجد بيانات للمخطط.",
      "days": "أيام",
    "hours": "ساعات",
    "minutes": "دقائق",
    "seconds": "ثواني",
    "off": "خصم",
    "subtotal": "المجموع الفرعي",
    "total": "المجموع الكلي",
        },
         "productDetailsPage": {
    "specialOffer": "عرض خاص",
    "offerEndsIn": "العرض ينتهي خلال",
    "offerPrice": "سعر العرض",
    "originalPrice": "كان",
    "price": "السعر",
     "selectFinalProduct": "الرجاء تحديد الخيار النهائي للمنتج"
  },
        "topBar": {
            "language": "English", "home": "الرئيسية", "shop": "المتجر", "aboutUs": "من نحن", "contactUs": "اتصل بنا",
            "dashboard": "لوحة التحكم", "logout": "تسجيل الخروج", "welcome": "أهلاً بك", "helloGuest": "أهلاً بالزائر"
        },
        "mainHeader": {
            "siteName": "متجري", "searchPlaceholder": "ابحث...", "myAccount": "حسابي", "login": "تسجيل الدخول",
            "myWishlist": "المفضلة", "myCart": "سلتي", "hotline": "الخط الساخن"
        },
        "features": {
            "freeShipping": "شحن مجاني", "freeShippingDesc": "شحن مجاني لجميع الطلبات فوق 100 ر.س",
            "support247": "دعم 24/7", "support247Desc": "احصل على المساعدة في أي وقت تحتاجه",
            "onlinePayment": "دفع آمن", "onlinePaymentDesc": "خيارات دفع آمنة عبر الإنترنت",
            "easyReturn": "إرجاع سهل", "easyReturnDesc": "إرجاع بدون متاعب خلال 30 يومًا"
        },
        "heroSection": {
            "bigSale": "عرض لفترة محدودة", "price": "السعر", "validFrom": "صالح من", "validUntil": "صالح حتى",
            "installment": "أقساط ميسرة", "weeklySale": "عروض الأسبوع", "allOffersTitle": "اكتشف كل العروض",
            "allOffersDesc": "استكشف جميع العروض والخصومات المتاحة.", "noDataAvailable": "لا توجد عروض متاحة حالياً.",
              "allOffersSubtitle": "اكتشف عروضاً مذهلة ووفّر الكثير على منتجاتك المفضلة."
        },
        "homepage": {
            "discountsTitle": "أكواد خصم حصرية", "copied": "تم النسخ!", "copyCode": "نسخ",
            "shopByCategory": "تسوق حسب الفئة", "loadingCategories": "جاري تحميل الفئات...", "categoryFetchError": "فشل جلب الفئات.",
            "noCategoriesFound": "لم يتم العثور على فئات.", "categoryImageAlt": "صورة الفئة", "unnamedCategory": "فئة غير مسماة",
            "trendingProductsTitle": "المنتجات الأكثر رواجاً", "trendingProductsDesc": "اكتشف منتجاتنا الأكثر شهرة هذا الأسبوع. مختارة بعناية للجودة والشعبية!",
            "noTrendingProductsFound": "لم يتم العثور على منتجات رائجة."
        },
        "wishlist": { "loginRequired": "يرجى تسجيل الدخول للإضافة إلى المفضلة." },
        "cart": {
            "loginRequired": "يرجى تسجيل الدخول لإضافة المنتجات إلى السلة.", "productAddedSuccess": "تمت اضافة المنتج لسلتك بنجاح.",
            "addError": "خطأ في إضافة المنتج للسلة.", "updateSuccess": "تم تحديث سلة التسوق.", "updateError": "خطأ في تحديث السلة.",
            "productRemovedSuccess": "تمت ازالة المنتج من سلتك.", "removeError": "خطأ في إزالة المنتج.",
        },
        "allOffersPage": {
            "title": "جميع العروض المتاحة", "noOffers": "لا توجد عروض متاحة في الوقت الحالي.", "noOffersTitle": "لا توجد عروض!",
            "productNotLinked": "هذا العرض لا يرتبط بمنتج محدد."
        },
        "advertisementDetails": {
            "notFound": "الإعلان غير موجود.", "noDetails": "لم يتم العثور على تفاصيل الإعلان.", "noDetailsTitle": "لا توجد تفاصيل إعلان!",
            "originalPrice": "السعر الأصلي", "currentPrice": "السعر الحالي", "validity": "فترة الصلاحية",
            "goToOffer": "انتقل إلى العرض", "typeSlide": "عرض الشريحة الرئيسية", "typeSideOffer": "عرض جانبي",
            "typeWeeklyOffer": "صفقة الأسبوع", "typeOther": "عرض خاص", "priceDetails": "تفاصيل السعر"
        },
        "aboutUsPage": {
            "title": "عن متجرنا", "commitment": "نلتزم بتقديم أحدث وأفضل المنتجات. سواء كنت تبحث عن هواتف ذكية متطورة، أو أجهزة لابتوب عالية الأداء، أو إكسسوارات فاخرة، فإننا نقدم مجموعة واسعة من المنتجات عالية الجودة بأسعار لا تضاهى.",
            "belief": "نؤمن بتقديم تجربة تسوق استثنائية من خلال ضمان التوصيل السريع، خيارات الدفع الآمنة، وخدمة عملاء ممتازة.",
            "explore": "اكتشف مجموعتنا وابقَ على اطلاع بأحدث الصيحات. رضاكم هو أولويتنا!", "imageAlt": "صورة تعبر عن فريق العمل"
        },
        "contactUsPage": {
            "title": "اتصل بنا", "description": "هل لديك أي أسئلة؟ لا تتردد في التواصل معنا. فريقنا متاح لمساعدتك.",
            "yourName": "اسمك", "yourSubject": "الموضوع", "yourEmail": "بريدك الإلكتروني", "yourPhone": "رقم هاتفك",
            "yourMessage": "رسالتك", "submitMessage": "إرسال الرسالة", "successMessage": "تم إرسال رسالتك بنجاح!",
            "errorMessage": "فشل في إرسال الرسالة.", "networkError": "حدث خطأ في الشبكة. يرجى المحاولة مرة أخرى."
        },
        "productCard": {
            "uncategorized": "غير مصنف", "removeFromFavorites": "إزالة من المفضلة", "addToFavorites": "إضافة إلى المفضلة",
            "viewDetails": "عرض التفاصيل","viewOffer": "عرض العرض"
        },
        "productDetails": {
            "quantity": "الكمية", "availability": "التوفر", "inStock": "متوفر", "outOfStock": "غير متوفر", "addToCart": "إضافة إلى السلة",
            "specifications": "المواصفات", "reviews": "المراجعات", "relatedProducts": "منتجات ذات صلة"
        },
        "shoppingCartPage": {
            "title": "سلة التسوق", "product": "المنتج", "price": "السعر", "quantity": "الكمية", "total": "الإجمالي", "subtotal": "المجموع الفرعي",
            "emptyCart": "سلة التسوق فارغة.", "continueShopping": "متابعة التسوق", "proceedToCheckout": "الذهاب للدفع",
                "shoppingCart": "سلة التسوق",
    "cartTotal": "إجمالي السلة",
    "proceedToCheckout": "متابعة إلى الدفع"
        },
        "checkoutPage": {
            "title": "إتمام الطلب", "billingDetails": "تفاصيل الفاتورة", "shippingAddress": "عنوان الشحن",
            "placeOrder": "تأكيد الطلب", "paymentMethod": "طريقة الدفع", "orderSummary": "ملخص الطلب",
             "checkoutTitle": "الدفع",
    "discountCode": "كود الخصم",
    "enterDiscountCodePlaceholder": "أدخل كود الخصم",
    "apply": "تطبيق",
    "enterAddressPlaceholder": "أدخل عنوانك",
    "enterCityPlaceholder": "أدخل مدينتك",
    "enterPostalCodePlaceholder": "أدخل الرمز البريدي",
    "enterCountryPlaceholder": "أدخل دولتك",
    "cashOnDelivery": "الدفع عند الإستلام"
        },
        "wishlistPage": {
    "wishlistTitle": "قائمة أمنياتي"
  },
        "auth": {
            "email": "البريد الإلكتروني", "password": "كلمة المرور", "rememberMe": "تذكرني", "forgotPassword": "هل نسيت كلمة المرور؟",
            "loginTitle": "تسجيل الدخول", "registerTitle": "إنشاء حساب جديد", "noAccount": "ليس لديك حساب؟", "signUp": "إنشاء حساب",
            "haveAccount": "لديك حساب بالفعل؟", "loginButton": "تسجيل الدخول", "registerButton": "إنشاء حساب",
            "nameLabel": "الاسم", "emailLabel": "البريد الإلكتروني", "passwordLabel": "كلمة المرور",
            "confirmPasswordLabel": "تأكيد كلمة المرور", "loginPrompt": "لديك حساب بالفعل؟", "loginLink": "تسجيل الدخول",
            "registerPrompt": "ليس لديك حساب؟", "registerLink": "إنشاء حساب", "loginNow": "العودة لتسجيل الدخول",
            "recaptchaExpired": "انتهت صلاحية reCAPTCHA. يرجى التحقق مرة أخرى.", "recaptchaRequired": "يرجى إكمال التحقق من reCAPTCHA.",
            "passwordMismatch": "كلمات المرور غير متطابقة.", "registerSuccessEmailSent": "تم التسجيل بنجاح! يرجى التحقق من بريدك الإلكتروني لتفعيل حسابك.",
            "registerError": "فشل التسجيل. يرجى المحاولة مرة أخرى.", "registrationCompleteTitle": "اكتمل التسجيل!", "goToLogin": "الذهاب لتسجيل الدخول",
            "loginWelcome": "أهلاً بك، {name}!", "loginError": "فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.",
            "loginSuccessTitle": "تم تسجيل الدخول بنجاح!", "forgotPasswordTitle": "نسيت كلمة المرور",
            "forgotPasswordInstructions": "أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة مرورك.",
            "sendResetLink": "إرسال رابط إعادة التعيين", "resetEmailSent": "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.",
            "resetEmailError": "فشل إرسال رابط إعادة التعيين.", "resetPasswordTitle": "إعادة تعيين كلمة المرور",
            "newPasswordLabel": "كلمة المرور الجديدة", "confirmNewPasswordLabel": "تأكيد كلمة المرور الجديدة",
            "resetPasswordButton": "إعادة تعيين كلمة المرور", "passwordMinLength": "يجب أن تكون كلمة المرور 6 أحرف على الأقل.",
            "passwordResetSuccess": "تمت إعادة تعيين كلمة المرور بنجاح.", "passwordResetError": "فشل في إعادة تعيين كلمة المرور.",
            "resetLinkMissing": "رابط إعادة التعيين مفقود أو غير صالح.", "tokenExpiredOrInvalid": "هذا الرابط غير صالح أو انتهت صلاحيته.",
            "verifyingLink": "جاري التحقق من رابط إعادة التعيين...", "requestNewLink": "طلب رابط جديد",
            "accountActivation": "تفعيل الحساب", "tokenMissing": "رمز التفعيل مفقود.", "activationSuccess": "تم تفعيل حسابك بنجاح!",
            "activationError": "فشل التفعيل. قد يكون الرابط غير صالح أو انتهت صلاحيته."
        },
        "userDashboard": {
            "myProfile": "ملفي الشخصي", "orderHistory": "سجل الطلبات", "editProfile": "تعديل الملف الشخصي",
            "changePassword": "تغيير كلمة المرور", "addressBook": "دفتر العناوين"
        },
        "shopPage": {
            "allCategories": "كل الفئات", "allSubcategories": "كل الفئات الفرعية", "allBrands": "كل العلامات التجارية", "all": "الكل",
            "errorFetchingProducts": "فشل في جلب المنتجات.",
            "filterByCategory": "التصنيف حسب الفئة", "filterBySubCategory": "التصنيف حسب الفئة الفرعية",
            "priceRange": "نطاق السعر", "filterByBrand": "التصنيف حسب العلامة التجارية", "resetFilters": "إعادة تعيين الفلاتر",
            "showingItems": "عرض", "items": "عناصر", "popularity": "الشهرة",
            "priceLowToHigh": "السعر: من الأقل للأعلى", "priceHighToLow": "السعر: من الأعلى للأقل",
            "nameAZ": "الاسم: من أ إلى ي", "noProductsFound": "لم يتم العثور على منتجات تطابق بحثك.",
             "currencySymbol": "جنيه"
        },
        "adminDashboardPage": {
            "footerText": "متجري. جميع الحقوق محفوظة.", "errorFetchingData": "خطأ في جلب بيانات لوحة التحكم: ",
            "noDataAvailableTitle": "لا توجد بيانات متاحة", "noDataAvailable": "لا توجد بيانات لعرضها في الوقت الحالي.",
            "dashboardTitle": "لوحة التحكم", "totalRevenue": "إجمالي الإيرادات", "totalOrders": "إجمالي الطلبات",
            "totalProducts": "إجمالي المنتجات", "totalUsers": "إجمالي المستخدمين",
            "salesOverviewChartTitle": "نظرة عامة على المبيعات", "revenueLabel": "الإيرادات", "orderCountLabel": "عدد الطلبات",
            "noSalesData": "لا توجد بيانات مبيعات لعرضها.", "topSellingProductsTitle": "المنتجات الأكثر مبيعًا",
            "quantitySoldLabel": "الكمية المباعة", "itemsSoldLabel": "قطع", "noTopProductsData": "لا توجد بيانات للمنتجات الأكثر مبيعًا.",
            "categoryDistributionChartTitle": "توزيع المنتجات حسب الفئة", "noCategoryData": "لا توجد بيانات للفئات.",
            "ordersByStatusTitle": "الطلبات حسب الحالة", "noOrderStatusData": "لا توجد بيانات لحالة الطلبات.",
            "userRegistrationTitle": "تسجيل المستخدمين الجدد", "usersRegisteredLabel": "المستخدمون المسجلون", "noUserRegistrationData": "لا توجد بيانات تسجيل مستخدمين.",
            "recentOrdersTitle": "أحدث الطلبات", "orderId": "معرف الطلب", "date": "التاريخ", "customer": "العميل",
            "total": "الإجمالي", "status": "الحالة", "noRecentOrders": "لا توجد طلبات حديثة.", "guestUser": "مستخدم زائر",
            "orderStatuses": { "pending": "قيد الانتظار", "processing": "قيد المعالجة", "shipped": "تم الشحن", "delivered": "تم التوصيل", "cancelled": "ملغي" },
            "productManagement": "إدارة المنتجات", "categoryManagement": "إدارة الفئات", "orderManagement": "إدارة الطلبات",
            "userManagement": "إدارة المستخدمين", "advertisementManagement": "إدارة الإعلانات", "discountManagement": "إدارة الخصومات",
            "welcomeMessage":"مرحبا بك في لوحة التحكم","orderStatuses.":"حالات الطلبات"
       
        },
        "adminCategoryPage": {
            "errorFetchingCategories": "خطأ في جلب الفئات.", "confirmDelete": "هل أنت متأكد من رغبتك في حذف الفئة \"{categoryName}\"؟",
            "manageCategories": "إدارة الفئات", "addCategoryButton": "إضافة فئة جديدة", "subCategoriesCount": "فئات فرعية",
            "editCategory": "تعديل", "deleteCategory": "حذف", "addCategoryModalTitle": "إضافة فئة جديدة",
            "categoryNameLabelEn": "اسم الفئة (إنجليزي)", "categoryNameLabelAr": "اسم الفئة (عربي)",
            "categoryImageLabel": "صورة الفئة", "subCategoriesTitle": "الفئات الفرعية",
            "cancelButton": "إلغاء", "savingChangesButton": "جاري حفظ التغييرات...", "saveChangesButton": "حفظ التغييرات",
            "noCategoriesFound": "لم يتم العثور على فئات.", "noDescription": "لا يوجد وصف", "updateSuccess": "تم تحديث الفئة بنجاح!",
            "errorUpdatingCategory": "حدث خطأ أثناء تحديث الفئة.", "categoryNamesRequired": "أسماء الفئات باللغتين مطلوبة.",
            "currentImage": "الصورة الحالية", "imageUploadHint": "اتركه فارغًا للحفاظ على الصورة الحالية.",
            "noCategoriesYet":"لا توجد فئات بعد","addFirstCategory":"اضافة الفئة الاولى"
        },
        "adminOrdersPage": {
            "errorFetchingOrdersToast": "فشل في جلب الطلبات.", "allOrders": "كل الطلبات", "user": "المستخدم", "date": "التاريخ",
            "total": "الإجمالي", "paid": "مدفوع", "delivered": "تم التوصيل", "details": "تفاصيل",
            "errorFetchingOrderDetails": "فشل جلب تفاصيل الطلب.", "paidSuccess": "تم تحديد الطلب كمدفوع بنجاح!", "paidError": "فشل تحديد الطلب كمدفوع.",
            "deliveredSuccess": "تم تحديد الطلب كموصل بنجاح!", "deliveredError": "فشل تحديد الطلب كموصل.",
            "orderNotFound": "الطلب غير موجود.", "orderDetails": "تفاصيل الطلب", "shippingAddress": "عنوان الشحن",
            "address": "العنوان", "status": "الحالة", "notDelivered": "لم يتم التوصيل", "deliveredAt": "تم التوصيل في",
            "markingDelivered": "جاري التحديد كموصل...", "markAsDelivered": "تحديد كموصل",
            "paymentMethod": "طريقة الدفع", "method": "الطريقة", "notPaid": "غير مدفوع", "paidAt": "تم الدفع في",
            "markingPaid": "جاري التحديد كمدفوع...", "markAsPaid": "تحديد كمدفوع",
            "orderItems": "عناصر الطلب", "customerInfo": "معلومات العميل", "name": "الاسم", "email": "البريد الإلكتروني",
            "orderSummary": "ملخص الطلب", "itemsPrice": "سعر المنتجات", "shippingPrice": "سعر الشحن",
            "taxPrice": "الضريبة", "totalPrice": "السعر الإجمالي", "dates": "التواريخ", "orderedAt": "تاريخ الطلب",
            "actions":"actions","viewDetails":"view details",
            "subtotal": "المجموع الفرعي",
    "importantDates": "تواريخ هامة","noOrdersFound":"لا يوجد طلبات","checkLater":"تحقق من جديد"
        },
        "advertisementAdmin": {
            "titleRequired": "عناوين الإعلان باللغة الإنجليزية والعربية مطلوبة.", "imageRequired": "صورة الإعلان مطلوبة.",
            "addSuccess": "تمت إضافة الإعلان بنجاح!", "addError": "خطأ في إضافة الإعلان: ",
            "titleEn": "العنوان (إنجليزي)", "titleAr": "العنوان (عربي)",
            "descriptionEn": "الوصف (إنجليزي)", "descriptionAr": "الوصف (عربي)",
            "linkLabel": "رابط URL", "typeLabel": "النوع",
            "typeSlide": "شريحة عرض", "typeSideOffer": "عرض جانبي", "typeWeeklyOffer": "عرض أسبوعي",
            "orderLabel": "الترتيب (للعرض)", "startDate": "تاريخ البدء", "endDate": "تاريخ الانتهاء",
            "originalPrice": "السعر الأصلي", "discountedPrice": "السعر المخفض", "currency": "العملة",
            "isActive": "نشط", "imageLabel": "صورة الإعلان", "submittingButton": "جاري الإضافة...",
            "addButton": "إضافة إعلان", "confirmDelete": "هل أنت متأكد من حذف الإعلان \"{advertisementTitle}\"؟",
            "deleteSuccess": "تم حذف الإعلان بنجاح!", "errorDeletingAdvertisement": "حدث خطأ أثناء حذف الإعلان.",
            "advertisementListTitle": "قائمة الإعلانات", "addAdvertisementButton": "إضافة إعلان",
            "noAdvertisements": "لا توجد إعلانات لعرضها حاليًا.", "imageTable": "صورة", "titleTable": "العنوان",
            "descriptionTable": "الوصف", "typeTable": "النوع", "activeTable": "نشط",
            "orderTable": "الترتيب", "actionsTable": "إجراءات", "noDescription": "لا يوجد وصف",
            "unknownType": "نوع غير معروف", "updateSuccess": "تم تحديث الإعلان بنجاح!",
            "updateError": "حدث خطأ أثناء تحديث الإعلان.", "editAdvertisementTitle": "تعديل الإعلان",
            "updatingButton": "جاري الحفظ...", "updateButton": "حفظ التغييرات",
            "imageOptional": "صورة (اختياري لتغيير الحالية)",
              "addAdvertisementTitle": "إضافة إعلان جديد",
    "titleEnPlaceholder": "مثال: تخفيضات الشتاء الكبرى",
    "titleArPlaceholder": "مثال: تخفيضات الشتاء الكبرى",
    "descriptionEnPlaceholder": "صف العرض الخاص بك...",
    "descriptionArPlaceholder": "صف العرض الخاص بك...",
    "linkToProduct": "ربط بمنتج",
    "noProductLinked": "— غير مربوط —",
    "linkPlaceholder": "مثال: /special-offers",
    "typeOther": "آخر", "imageLabel": "صورة الإعلان",
    "imageOptional": "صورة (اختياري لتغيير الحالية)",
    "selectedImage": "الصورة المختارة",
    "currentImage": "الصورة الحالية",
    "noNewImageSelected": "لم يتم اختيار صورة جديدة",
    "selectedImage": "الصورة المختارة",
            "tableHeader": {
                "image": "صورة",
                "title": "العنوان",
                "description": "الوصف",
                "type": "النوع",
                "active": "نشط",
                "order": "الترتيب"
            }
     
        },
        "discountAdmin": {
            "codeRequired": "كود الخصم مطلوب.", "amountRequired": "مطلوب إما نسبة مئوية أو مبلغ ثابت.",
            "amountExclusive": "لا يمكن تقديم نسبة مئوية ومبلغ ثابت معًا.", "datesRequired": "تاريخ البدء والانتهاء مطلوبان.",
            "addSuccess": "تمت إضافة الخصم بنجاح!", "addError": "خطأ في إضافة الخصم: ",
            "codeLabel": "كود الخصم", "percentageLabel": "النسبة المئوية (%)", "fixedAmountLabel": "المبلغ الثابت",
            "minOrderAmountLabel": "أقل مبلغ للطلب", "maxDiscountAmountLabel": "أقصى مبلغ للخصم (اختياري)",
            "startDateLabel": "تاريخ البدء", "endDateLabel": "تاريخ الانتهاء", "isActive": "نشط",
            "submittingButton": "جاري الإضافة...", "addButton": "إضافة خصم", "confirmDelete": "هل أنت متأكد من حذف كود الخصم \"{discountCode}\"؟",
            "deleteSuccess": "تم حذف الخصم بنجاح!", "errorDeletingDiscount": "حدث خطأ أثناء حذف الخصم.",
            "discountListTitle": "قائمة الخصومات", "addDiscountButton": "إضافة خصم", "noDiscounts": "لا توجد خصومات لعرضها حاليًا.",
            "codeTable": "الكود", "typeTable": "النوع", "valueTable": "القيمة", "minOrderTable": "أقل طلب",
            "maxDiscountTable": "أقصى خصم", "startDateTable": "تاريخ البدء", "endDateTable": "تاريخ الانتهاء",
            "activeTable": "نشط", "actionsTable": "إجراءات", "percentageType": "نسبة مئوية",
            "fixedAmountType": "مبلغ ثابت", "updateSuccess": "تم تحديث الخصم بنجاح!",
            "updateError": "حدث خطأ أثناء تحديث الخصم.", "editDiscountTitle": "تعديل الخصم",
            "updatingButton": "جاري الحفظ...", "updateButton": "حفظ التغييرات",
             "discountListTitle": "أكواد الخصم",
    "addDiscountButton": "إضافة خصم",
    "addDiscountTitle": "إضافة كود خصم جديد",
    "editDiscountTitle": "تعديل كود الخصم", "validity": "الصلاحية",  

    "codeLabel": "كود الخصم",
    "codePlaceholder": "مثال: SUMMER25",
    "percentageLabel": "نسبة مئوية (%)",
    "fixedAmountLabel": "مبلغ ثابت",
    "fixedAmountPlaceholder": "مثال: 50",
    "minOrderAmountLabel": "أقل قيمة للطلب",
    "minOrderAmountPlaceholder": "مثال: 200",
    "maxDiscountAmountLabel": "أقصى مبلغ للخصم (اختياري)",
    "maxDiscountAmountPlaceholder": "مثال: 100",
    "startDateLabel": "تاريخ البدء",
    "endDateLabel": "تاريخ الانتهاء",
    "isActive": "فعّال",

    "tableHeader": {
      "code": "الكود",
      "type": "النوع",
      "value": "القيمة",
      "minOrder": "أقل طلب",
      "usageLimit": "حد الاستخدام",
     "minOrder": "الحد الادنى للطلب",
      "usageLimit": "حد الاستخدام",
      "validity": "الصلاحية"
    },

    "percentageType": "نسبة مئوية",
    "fixedAmountType": "مبلغ ثابت",
    "noLimit": "غير محدود",
    "starts": "يبدأ",
    "ends": "ينتهي",

    "addSuccess": "تمت إضافة الخصم بنجاح!",
    "updateSuccess": "تم تحديث الخصم بنجاح!",
    "deleteSuccess": "تم حذف الخصم بنجاح!",
    "addError": "خطأ في إضافة الخصم:",
    "updateError": "خطأ في تحديث الخصم:",
    "errorDeletingDiscount": "خطأ في حذف الخصم:",
    "confirmDelete": "هل أنت متأكد من حذف الكود \"{{discountCode}}\"؟",
    
    "codeRequired": "كود الخصم مطلوب.",
    "amountRequired": "يجب توفير نسبة مئوية أو مبلغ ثابت.",
    "amountExclusive": "لا يمكن توفير نسبة مئوية ومبلغ ثابت معاً.",
    "datesRequired": "تاريخ البدء والانتهاء مطلوبان.",
    "endDateError": "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء.",

    "noDiscounts": "لم يتم العثور على أكواد خصم."
        },
        "productAdmin": {
            "addNewProduct": "إضافة منتج جديد", "confirmDelete": "هل أنت متأكد من حذف المنتج \"{productName}\"؟",
            "deleteSuccess": "تم حذف المنتج بنجاح!", "deleteError": "حدث خطأ أثناء حذف المنتج.",
            "addProductButton": "إضافة منتج", "noProducts": "لا توجد منتجات لعرضها.",
            "imageTable": "صورة", "nameTable": "الاسم", "categoryTable": "الفئة", "priceTable": "السعر",
            "actionsTable": "إجراءات", "uncategorized": "غير مصنف", "editProductTitle": "تعديل المنتج",
            "productList":"اداره المنتاجات","basicInfo":"المعلومات الاساسيه",".fixedAttributes":"الخصائص الثابته",
            "productVariations":"متغيرات المنتج","variationGroup":"مجموعة المتغيرات","optionsFor":"خيارات ل",
            "addOption":"اضافة خيار","addVariationGroup" :"اضافة مجموعة متغيرات","addAttribute":"اضافة خصائص",
            "tryDifferentSearch":"حاول بحث اخر"
        },
      
        "product":{
            "nameEn":"اسم (الانجليزي)","nameAr":"اسم (العربي)","descriptionEn":"وصف (الانجليزي)",
            "descriptionAr":"وصف (العربي)","basePrice":"السعر الاساسي","category":"الفئة","subCategory":"الفئة الفرعية",
            "mainImage":"الصورة الرئيسية","attrNameEn":"اسم الخاصية (الانجليزي)","attrNameAr":"اسم الخاصية (العربي)",
            "attrValueEn":"قيمة الخاصية (الانجليزي)","attrValueAr":"قيمة الخاصية (العربي)","varNameEn":"اسم المتغير (الانجليزي)",
            "varNameAr":"اسم المتغير (العربي)","optionNameEn":"اسم الخيار (الانجليزي)","optionNameAr":"اسم الخيار (العربي)",
      

        },
        "actions":{
            "edit":"تعديل","delete":"حذف","view":"عرض","cancel":"الغاء","saveProduct":"حفظ المنتج",
            "saving":"جاري الحفظ","saveChanges":"حفظ التغييرات"
        },
        "categoryList": {
            "searchPlaceholder": "ابحث بالاسم...","searchCategoriesLabel": "ابحث في الفئات",
            "tryDifferentSearch": "حاول بحث اخر","noSearchResults": "لا توجد نتايج للبحث."
        },
      
        "forms":{
            "select":"اختر","saveProduct":"حفظ المنتج","uploadImage":"تحميل صورة","dragOrClick":"اسحب او اضغط",
            "cancel":"الغاء","changeImage":"تغيير الصورة"
        },
     
       
        "categoryForm":{
            "addCategoryTitle":"اضافة فئة جديدة","categoryNameEnLabel":"اسم الفئة (الانجليزي)",
            "categoryNameArLabel":"اسم الفئة (العربي)","descriptionEnLabel":"وصف الفئة (الانجليزي)",
            "descriptionArLabel":"وصف الفئة (العربي)",
            "categoryImageLabel":"صورة الفئة","addCategoryTitle":"اضافة فئة جديدة","categoryNameEnLabel":"اسم الفئة (الانجليزي)",
            "categoryNameArLabel":"اسم الفئة (العربي)","descriptionEnLabel":"وصف الفئة (الانجليزي)",
            "descriptionArLabel":"وصف الفئة (العربي)","categoryImageLabel":"صورة الفئة","subCategoriesTitle":"الفئات الفرعية",
            "noSubcategoriesMessage":"لا توجد فئات فرعية","addSubCategoryButton":"اضافة فئة فرعية","removeImage":"حذف الصورة",
            "subCategory":"فئة فرعية","changeImage":"تغيير الصورة","removeSubCategory":"حذف فئة فرعية",
            "subCategoryNameEnPlaceholder":"اسم الفئة الفرعية (الانجليزي)","subCategoryNameArPlaceholder":"اسم الفئة الفرعية (العربي)",
            "subCategoryDescriptionEnPlaceholder":"وصف الفئة الفرعية (الانجليزي)","subCategoryDescriptionArPlaceholder":"وصف الفئة الفرعية (العربي)",
            "created":"تم الانشاء","successMessage":"تم انشاء الفئة بنجاح!","editCategoryTitle":"تعديل الفئة",
            "updated":"تم التحديث",

        },
        "adminProductsPage": {
            "productList" : "اداره المنتاجات",
            "manageProductsMessage" :"  اهلا بك في صفحه اداره المنتاجات",
            "title":"title",
        },
    },
    en: {
        "general": {
            "loading": "Loading...", "error": "Error", "notApplicable": "N/A", "unnamedItem": "Unnamed Item", "priceNotAvailable": "Price N/A",
            "shopNow": "Shop Now", "currencySymbol": "$", "off": "OFF", "noImage": "No Image", "errorFetchingData": "Failed to fetch data.",
            "unnamedProduct": "Unnamed Product", "imageFailedToLoad": "Image failed to load", "noImageAvailable": "No Image Available",
            "currencyCode": "USD", "description": "Description", "close": "Close", "copyId": "Copy ID",
            "yes": "Yes", "no": "No", "back": "Back", "active": "Active", "inactive": "Inactive", "none": "None",
            "verifyHuman": "Please verify that you are human.", "apiError": "API configuration error.",
            "search":"Search","backToOrders":"Back to Orders","loadingData":"Loading data...","expand":"Expand",
            "loadingOrders":"Loading orders...","clearSearch":"Clear Search","noDataFound":"No data found",
            "cancel" :"cancel","addCategory":"add category","saving":"saving","saveChanges":"save changes",
            "retry":"retry","errorOccurred":"An error occurred. Please try again later.","actions":"Actions",
            "edit":"edit","delete":"delete","noResultsFound":"No results found.","add": "Add",
    "edit": "Edit",
    "delete": "Delete",
    "actions": "Actions","noDataForChart":"No data for chart.",
      "days": "Days",
    "hours": "Hours",
    "minutes": "Minutes",
    "seconds": "Seconds",
    "off": "Off",
    "subtotal": "Subtotal",
    "total": "Total",

        },
        "topBar": {
            "language": "العربية", "home": "Home", "shop": "Shop", "aboutUs": "About Us", "contactUs": "Contact Us",
            "dashboard": "Dashboard", "logout": "Logout", "welcome": "Welcome", "helloGuest": "Hello, Guest"
        },
        "mainHeader": {
            "siteName": "My Store", "searchPlaceholder": "Search...", "myAccount": "My Account", "login": "Login",
            "myWishlist": "My Wishlist", "myCart": "My Cart", "hotline": "Hotline"
        },
        "features": {
            "freeShipping": "Free Shipping", "freeShippingDesc": "Free shipping on all orders over $100",
            "support247": "Support 24/7", "support247Desc": "Get help anytime you need it",
            "onlinePayment": "Online Payment", "onlinePaymentDesc": "Secure online payment options",
            "easyReturn": "Easy Return", "easyReturnDesc": "Hassle-free returns within 30 days"
        },
        "heroSection": {
            "bigSale": "Limited Time Offer", "price": "Price", "validFrom": "Valid From", "validUntil": "Valid Until",
            "installment": "Easy Installments", "weeklySale": "Weekly Deals", "allOffersTitle": "Discover All Offers",
            "allOffersDesc": "Explore all available promotions and discounts.", "noDataAvailable": "No exciting offers available right now.",
             "allOffersSubtitle": "Discover amazing deals and save big on your favorite products."
        },
        "homepage": {
            "discountsTitle": "Exclusive Discount Codes", "copied": "Copied!", "copyCode": "Copy",
            "shopByCategory": "Shop by Category", "loadingCategories": "Loading categories...", "categoryFetchError": "Failed to fetch categories.",
            "noCategoriesFound": "No categories found.", "categoryImageAlt": "Category Image", "unnamedCategory": "Unnamed Category",
            "trendingProductsTitle": "Trending Products", "trendingProductsDesc": "Discover our most popular products this week. Handpicked for quality and trending popularity!",
            "noTrendingProductsFound": "No trending products found."
        },
        "wishlist": { "loginRequired": "Please log in to manage your wishlist." },
        "cart": {
            "loginRequired": "Please log in to add items to your cart.", "productAddedSuccess": "Product added to cart successfully.",
            "addError": "Error adding product to cart.", "updateSuccess": "Cart updated successfully.", "updateError": "Error updating cart.",
            "productRemovedSuccess": "Product removed from cart.", "removeError": "Error removing item.",
        },
        "allOffersPage": {
            "title": "All Available Offers", "noOffers": "No offers are available at the moment.", "noOffersTitle": "No Offers Available!",
            "productNotLinked": "This offer is not linked to a specific product."
        },
        "advertisementDetails": {
            "notFound": "Advertisement not found.", "noDetails": "No advertisement details found.", "noDetailsTitle": "No Advertisement Details!",
            "originalPrice": "Original Price", "currentPrice": "Current Price", "validity": "Validity Period",
            "goToOffer": "Go To Offer", "typeSlide": "Main Carousel Offer", "typeSideOffer": "Side Offer",
            "typeWeeklyOffer": "Weekly Deal", "typeOther": "Special Offer", "priceDetails": "Price Details"
        },
        "aboutUsPage": {
            "title": "About Our Store",
            "commitment": "We are committed to bringing you the latest and greatest. Whether you’re looking for cutting-edge products, high-performance gear, or premium accessories, we offer a wide selection.",
            "belief": "We believe in providing an exceptional shopping experience by ensuring fast delivery, secure payment options and outstanding customer service.",
            "explore": "Explore our collection and stay ahead with the latest trends. Your satisfaction is our priority!", "imageAlt": "A picture representing our team and values"
        },
        "contactUsPage": {
            "title": "Contact Us", "description": "Have any questions or need assistance? Feel free to reach out. Our team is available to help.",
            "yourName": "Your Name", "yourSubject": "Subject", "yourEmail": "Your Email", "yourPhone": "Your Phone",
            "yourMessage": "Your Message", "submitMessage": "Submit Message", "successMessage": "Message submitted successfully! Thank you.",
            "errorMessage": "Failed to submit message.", "networkError": "A network error occurred. Please try again."
        },
        "productCard": {
            "uncategorized": "Uncategorized", "removeFromFavorites": "Remove from Favorites", "addToFavorites": "Add to Favorites",
            "viewDetails": "View Details","viewOffer": "View Offer"
        },
        "productDetails": {
            "quantity": "Quantity", "availability": "Availability", "inStock": "In Stock", "outOfStock": "Out of Stock", "addToCart": "Add to Cart",
            "specifications": "Specifications", "reviews": "Reviews", "relatedProducts": "Related Products"
        },
        "shoppingCartPage": {
            "title": "Shopping Cart", "product": "Product", "price": "Price", "quantity": "Quantity", "total": "Total", "subtotal": "Subtotal",
            "emptyCart": "Your cart is empty.", "continueShopping": "Continue Shopping", "proceedToCheckout": "Proceed to Checkout",
               "shoppingCart": "Shopping Cart",
    "cartTotal": "Cart Total",
    "proceedToCheckout": "Proceed to Checkout"
        },
        "checkoutPage": {
            "title": "Checkout", "billingDetails": "Billing Details", "shippingAddress": "Shipping Address",
            "placeOrder": "Place Order", "paymentMethod": "Payment Method", "orderSummary": "Order Summary",
            "checkoutTitle": "Checkout",
    "discountCode": "Discount Code",
    "enterDiscountCodePlaceholder": "Enter discount code",
    "apply": "Apply",
    "enterAddressPlaceholder": "Enter your address",
    "enterCityPlaceholder": "Enter your city",
    "enterPostalCodePlaceholder": "Enter postal code",
    "enterCountryPlaceholder": "Enter your country",
    "cashOnDelivery": "Cash on Delivery",
    "orderPlacedSuccessTitle": "Order Placed Successfully!",
    "orderPlacedSuccessMessage": "Your order has been placed successfully. You will receive an email with the order details.",
    "orderID": "Order ID",
    "continueShopping": "Continue Shopping",
    "continueShopping":"Continue Shopping"
        },
          "wishlistPage": {
    "wishlistTitle": "My Wishlist"
  },
        "auth": {
            "email": "Email Address", "password": "Password", "rememberMe": "Remember Me", "forgotPassword": "Forgot Password?",
            "loginTitle": "Login", "registerTitle": "Register", "noAccount": "Don't have an account?", "signUp": "Sign Up",
            "haveAccount": "Already have an account?", "loginButton": "Login", "registerButton": "Register",
            "nameLabel": "Name", "emailLabel": "Email Address", "passwordLabel": "Password", "confirmPasswordLabel": "Confirm Password",
            "loginPrompt": "Already have an account?", "loginLink": "Login", "registerPrompt": "Don't have an account?",
            "registerLink": "Sign Up", "loginNow": "Back to Login", "recaptchaExpired": "reCAPTCHA expired. Please re-verify.",
            "recaptchaRequired": "Please complete the reCAPTCHA verification.", "passwordMismatch": "Passwords do not match.",
            "registerSuccessEmailSent": "Registration successful! Please check your email to activate your account.",
            "registerError": "Registration failed. Please try again.", "registrationCompleteTitle": "Registration Complete!",
            "goToLogin": "Go to Login", "loginWelcome": "Welcome, {name}!", "loginError": "Login failed. Please try again.",
            "loginSuccessTitle": "Login Successful!", "forgotPasswordTitle": "Forgot Password",
            "forgotPasswordInstructions": "Enter your email and we'll send you a link to reset your password.",
            "sendResetLink": "Send Reset Link", "resetEmailSent": "Password reset link sent to your email. Please check your inbox.",
            "resetEmailError": "Failed to send reset link. Please try again.", "resetPasswordTitle": "Reset Your Password",
            "newPasswordLabel": "New Password", "confirmNewPasswordLabel": "Confirm New Password",
            "resetPasswordButton": "Reset Password", "passwordMinLength": "Password must be at least 6 characters long.",
            "passwordResetSuccess": "Password has been reset successfully.", "passwordResetError": "Failed to reset password.",
            "resetLinkMissing": "Reset link is missing or invalid.", "tokenExpiredOrInvalid": "This link is invalid or has expired.",
            "verifyingLink": "Verifying reset link...", "requestNewLink": "Request New Link",
            "accountActivation": "Account Activation", "tokenMissing": "Activation token is missing.",
            "activationSuccess": "Your account has been activated successfully!",
            "activationError": "Activation failed. The link may be invalid or expired."
        },
        "userDashboard": {
            "myProfile": "My Profile", "orderHistory": "Order History", "editProfile": "Edit Profile",
            "changePassword": "Change Password", "addressBook": "Address Book"
        },
        "shopPage": {
            "allCategories": "All Categories", "allSubcategories": "All Subcategories", "allBrands": "All Brands", "all": "All",
            "errorFetchingProducts": "Failed to fetch products.",
            "filterByCategory": "Filter by Category", "filterBySubCategory": "Filter by Sub-Category",
            "priceRange": "Price Range", "filterByBrand": "Filter by Brand", "resetFilters": "Reset Filters",
            "showingItems": "Showing", "items": "items", "popularity": "Popularity",
            "priceLowToHigh": "Price: Low to High", "priceHighToLow": "Price: High to Low",
            "nameAZ": "Name: A to Z", "noProductsFound": "No products found matching your criteria.",
            "currencySymbol": "eg"
        },
        "adminDashboardPage": {
            "footerText": "My Store. All rights reserved.", "errorFetchingData": "Error fetching dashboard data: ",
            "noDataAvailableTitle": "No Data Available", "noDataAvailable": "There is no data to display at the moment.",
            "dashboardTitle": "Dashboard", "totalRevenue": "Total Revenue", "totalOrders": "Total Orders",
            "totalProducts": "Total Products", "totalUsers": "Total Users",
            "salesOverviewChartTitle": "Sales Overview", "revenueLabel": "Revenue", "orderCountLabel": "Orders",
            "noSalesData": "No sales data to display.", "topSellingProductsTitle": "Top Selling Products",
            "quantitySoldLabel": "Quantity Sold", "itemsSoldLabel": "items", "noTopProductsData": "No top selling products data.",
            "categoryDistributionChartTitle": "Category Distribution", "noCategoryData": "No category data.",
            "ordersByStatusTitle": "Orders by Status", "noOrderStatusData": "No order status data.",
            "userRegistrationTitle": "User Registrations", "usersRegisteredLabel": "Users Registered", "noUserRegistrationData": "No user registration data.",
            "recentOrdersTitle": "Recent Orders", "orderId": "Order ID", "date": "Date", "customer": "Customer",
            "total": "Total", "status": "Status", "noRecentOrders": "No recent orders.", "guestUser": "Guest User",
            "orderStatuses": { "pending": "Pending", "processing": "Processing", "shipped": "Shipped", "delivered": "Delivered", "cancelled": "Cancelled" },
            "productManagement": "Product Management", "categoryManagement": "Category Management", "orderManagement": "Order Management",
            "userManagement": "User Management", "advertisementManagement": "Advertisement Mgmt", "discountManagement": "Discount Management",
            "welcomeMessage":"Welcome to the Admin Dashboard", "orderStatuses": {
      "pending": "Pending",
      "processing": "Processing",
      "shipped": "Shipped",
      "delivered": "Delivered",
      "cancelled": "Cancelled"
    }
        },
        "adminCategoryPage": {
            "errorFetchingCategories": "Error fetching categories.", "confirmDelete": "Are you sure you want to delete the category \"{categoryName}\"?",
            "manageCategories": "Manage Categories", "addCategoryButton": "Add New Category", "subCategoriesCount": "Sub-categories",
            "editCategory": "Edit", "deleteCategory": "Delete", "addCategoryModalTitle": "Add New Category",
            "categoryNameLabelEn": "Category Name (English)", "categoryNameLabelAr": "Category Name (Arabic)",
            "categoryImageLabel": "Category Image", "subCategoriesTitle": "Sub-Categories",
            "cancelButton": "Cancel", "savingChangesButton": "Saving Changes...", "saveChangesButton": "Save Changes",
            "noCategoriesFound": "No categories found.", "noDescription": "No description provided.", "updateSuccess": "Category updated successfully!",
            "errorUpdatingCategory": "An error occurred while updating the category.", "categoryNamesRequired": "Category names in both languages are required.",
            "currentImage": "Current Image", "imageUploadHint": "Leave blank to keep current image.",
            "noCategoriesYet":"No categories yet.","addFirstCategory":"Add your first category."
        },
        "adminOrdersPage": {
            "errorFetchingOrdersToast": "Failed to fetch orders.", "allOrders": "All Orders", "user": "User", "date": "Date",
            "total": "Total", "paid": "Paid", "delivered": "Delivered", "details": "Details",
            "errorFetchingOrderDetails": "Failed to fetch order details.", "paidSuccess": "Order marked as paid successfully!", "paidError": "Failed to mark order as paid.",
            "deliveredSuccess": "Order marked as delivered successfully!", "deliveredError": "Failed to mark order as delivered.",
            "orderNotFound": "Order not found.", "orderDetails": "Order Details", "shippingAddress": "Shipping Address",
            "address": "Address", "status": "Status", "notDelivered": "Not Delivered", "deliveredAt": "Delivered At",
            "markingDelivered": "Marking Delivered...", "markAsDelivered": "Mark As Delivered",
            "paymentMethod": "Payment Method", "method": "Method", "notPaid": "Not Paid", "paidAt": "Paid At",
            "markingPaid": "Marking Paid...", "markAsPaid": "Mark As Paid",
            "orderItems": "Order Items", "customerInfo": "Customer Information", "name": "Name", "email": "Email",
            "orderSummary": "Order Summary", "itemsPrice": "Items Price", "shippingPrice": "Shipping Price",
            "taxPrice": "Tax Price", "totalPrice": "Total Price", "dates": "Dates", "orderedAt": "Ordered At",
            "actions":"actions","viewDetails":"view details",
               "subtotal": "Subtotal",
    "importantDates": "Important Dates","noOrdersFound":"No orders found.","checkLater":"Check back later."
        },
        "advertisementAdmin": {
            "titleRequired": "Advertisement English and Arabic titles are required.", "imageRequired": "Advertisement image is required.",
            "addSuccess": "Advertisement added successfully!", "addError": "Error adding advertisement: ",
            "titleEn": "Title (English)", "titleAr": "Title (Arabic)",
            "descriptionEn": "Description (English)", "descriptionAr": "Description (Arabic)",
            "linkLabel": "Link URL", "typeLabel": "Type",
            "typeSlide": "Slide", "typeSideOffer": "Side Offer", "typeWeeklyOffer": "Weekly Offer",
            "orderLabel": "Order (for display)", "startDate": "Start Date", "endDate": "End Date",
            "originalPrice": "Original Price", "discountedPrice": "Discounted Price", "currency": "Currency",
            "isActive": "Is Active", "imageLabel": "Advertisement Image", "submittingButton": "Adding...",
            "addButton": "Add Advertisement", "confirmDelete": "Are you sure you want to delete the advertisement \"{advertisementTitle}\"?",
            "deleteSuccess": "Advertisement deleted successfully!", "errorDeletingAdvertisement": "An error occurred while deleting the advertisement.",
            "advertisementListTitle": "Advertisement List", "addAdvertisementButton": "Add Advertisement",
            "noAdvertisements": "No advertisements to display currently.", "imageTable": "Image", "titleTable": "Title",
            "descriptionTable": "Description", "typeTable": "Type", "activeTable": "Active",
            "orderTable": "Order", "actionsTable": "Actions", "noDescription": "No Description",
            "unknownType": "Unknown", "updateSuccess": "Advertisement updated successfully!",
            "updateError": "An error occurred while updating the advertisement.", "editAdvertisementTitle": "Edit Advertisement",
            "updatingButton": "Saving...", "updateButton": "Save Changes",
            "imageOptional": "Image (Optional to change current)",
              "addAdvertisementTitle": "Add New Advertisement",
    "titleEnPlaceholder": "e.g., Big Winter Sale",
    "titleArPlaceholder": "e.g., تخفيضات الشتاء الكبرى",
    "descriptionEnPlaceholder": "Describe your offer...",
    "descriptionArPlaceholder": "صف العرض الخاص بك...",
    "linkToProduct": "Link to a Product",
    "noProductLinked": "— Not Linked —",
    "linkPlaceholder": "e.g., /special-offers",
    "typeOther": "Other",
    "selectedImage": "Selected Image",
     "imageLabel": "Advertisement Image",
    "imageOptional": "Image (Optional to change current)",
    "selectedImage": "Selected Image",
    "currentImage": "Current Image",
    "noNewImageSelected": "No new image selected",
              
    "tableHeader": {
      "image": "Image",
      "title": "Title",
      "linkedProduct": "Linked Product",
      "type": "Type",
      "dates": "Validity Dates",
      "price": "Price",
      "active": "Active",
      "minOrder": "Min. Order",
      "usageLimit": "Usage Limit", 
      
      "order": "Order"
    }
        },
        "discountAdmin": {
            "codeRequired": "Discount code is required.", "amountRequired": "Either percentage or fixed amount is required.",
            "amountExclusive": "Cannot provide both percentage and fixed amount.", "datesRequired": "Start and End dates are required.",
            "addSuccess": "Discount added successfully!", "addError": "Error adding discount: ",
            "codeLabel": "Discount Code", "percentageLabel": "Percentage (%)", "fixedAmountLabel": "Fixed Amount",
            "minOrderAmountLabel": "Minimum Order Amount", "maxDiscountAmountLabel": "Maximum Discount Amount (Optional)",
            "startDateLabel": "Start Date", "endDateLabel": "End Date", "isActive": "Is Active",
            "submittingButton": "Adding...", "addButton": "Add Discount", "confirmDelete": "Are you sure you want to delete the discount code \"{discountCode}\"?",
            "deleteSuccess": "Discount deleted successfully!", "errorDeletingDiscount": "An error occurred while deleting the discount.",
            "discountListTitle": "Discount List", "addDiscountButton": "Add Discount", "noDiscounts": "No discounts to display currently.",
            "codeTable": "Code", "typeTable": "Type", "valueTable": "Value", "minOrderTable": "Min Order",
            "maxDiscountTable": "Max Discount", "startDateTable": "Start Date", "endDateTable": "End Date",
            "activeTable": "Active", "actionsTable": "Actions", "percentageType": "Percentage",
            "fixedAmountType": "Fixed Amount", "updateSuccess": "Discount updated successfully!",
            "updateError": "An error occurred while updating the discount.", "editDiscountTitle": "Edit Discount",
            "updatingButton": "Saving...", "updateButton": "Save Changes",
             "discountListTitle": "Discount Codes",
    "addDiscountButton": "Add Discount",
    "addDiscountTitle": "Add New Discount Code",
    "editDiscountTitle": "Edit Discount Code","validity": "Validity",
    
    "codeLabel": "Discount Code",
    "codePlaceholder": "e.g., SUMMER25",
    "percentageLabel": "Percentage (%)",
    "fixedAmountLabel": "Fixed Amount",
    "fixedAmountPlaceholder": "e.g., 50",
    "minOrderAmountLabel": "Minimum Order Amount",
    "minOrderAmountPlaceholder": "e.g., 200",
    "maxDiscountAmountLabel": "Maximum Discount (Optional)",
    "maxDiscountAmountPlaceholder": "e.g., 100",
    "startDateLabel": "Start Date",
    "endDateLabel": "End Date",
    "isActive": "Active",
    
    "tableHeader": {
      "code": "Code",
      "type": "Type",
      "value": "Value",
      "minOrder": "Min. Order",
      "usageLimit": "Usage Limit",
      "validity": "Validity"
    },

    "percentageType": "Percentage",
    "fixedAmountType": "Fixed Amount",
    "noLimit": "No Limit",
    "starts": "Starts",
    "ends": "Ends",
    
    "addSuccess": "Discount added successfully!",
    "updateSuccess": "Discount updated successfully!",
    "deleteSuccess": "Discount deleted successfully!",
    "addError": "Error adding discount:",
    "updateError": "Error updating discount:",
    "errorDeletingDiscount": "Error deleting discount:",
    "confirmDelete": "Are you sure you want to delete the code \"{{discountCode}}\"?",
    
    "codeRequired": "Discount code is required.",
    "amountRequired": "Either percentage or fixed amount must be provided.",
    "amountExclusive": "Cannot provide both percentage and fixed amount.",
    "datesRequired": "Start and End dates are required.",
    "endDateError": "End date must be after the start date.",
    
    "noDiscounts": "No discount codes found."
  
        },
        "productAdmin": {
            "addNewProduct": "Add New Product", "confirmDelete": "Are you sure you want to delete the product \"{productName}\"?",
            "deleteSuccess": "Product deleted successfully!", "deleteError": "An error occurred while deleting the product.",
            "addProductButton": "Add Product", "noProducts": "No products to display.",
            "imageTable": "Image", "nameTable": "Name", "categoryTable": "Category", "priceTable": "Price",
            "actionsTable": "Actions", "uncategorized": "Uncategorized", "editProductTitle": "Edit Product",
            "productList":"product list","basicInfo":"basic info","fixedAttributes":"fixed attributes",
            "productVariations":"product variations","variationGroup":"variation group","optionsFor":"options for",
             "addOption":"add option","addVariationGroup" :"add variation group","addAttribute":"add attribute",
             "tryDifferentSearch":"try different search"
        },
        "product":{
            "nameEn":"Name (English)","nameAr":"Name (Arabic)","descriptionEn":"Description (English)",
            "descriptionAr":"Description (Arabic)","basePrice":"Base Price","category":"Category","subCategory":"Sub-Category",
            "mainImage":"main image","attrNameEn":"Attribute Name (English)","attrNameAr":"Attribute Name (Arabic)",
            "attrValueEn":"Attribute Value (English)","attrValueAr":"Attribute Value (Arabic)","varNameEn":"Variation Name (English)",
            "varNameAr":"Variation Name (Arabic)","optionNameEn":"Option Name (English)","optionNameAr":"Option Name (Arabic)",

        },
        "actions":{
            "edit":"edit","delete":"delete","view":"view","cancel":"cancel","saveProduct":"save product",
            "saving":"saving","saveChanges":"save changes"
        },
        "categoryList": {
            "searchPlaceholder": "Search by name...","searchCategoriesLabel": "Search Categories",
            "tryDifferentSearch": "Try different search","noSearchResults": "No search results found."
        },
        "forms":{
             "select":"select","saveProduct":"save","uploadImage":"upload Image","dragOrClick":"drag Or Click",
             "cancel":"cancel" ,"changeImage":"change Image"
        },
    
        "categoryForm":{
            "addCategoryTitle":"Add Category","categoryNameEnLabel":"Category Name (English)",
            "categoryNameArLabel":"Category Name (Arabic)","descriptionEnLabel":"Description (English)",
            "descriptionArLabel":"Description (Arabic)",
            "categoryImageLabel":"Category Image","addCategoryTitle":"Add Category","categoryNameEnLabel":"Category Name (English)",
            "categoryNameArLabel":"Category Name (Arabic)","descriptionEnLabel":"Description (English)",
            "descriptionArLabel":"Description (Arabic)","categoryImageLabel":"Category Image","subCategoriesTitle":"Sub-Categories",
            "noSubcategoriesMessage":"No sub-categories","addSubCategoryButton":"Add Sub-Category","removeImage":"remove Image",
            "subCategory":"Sub-Category","changeImage":"change Image","removeSubCategory":"remove Sub-Category",
            "subCategoryNameEnPlaceholder":"Sub-Category Name (English)","subCategoryNameArPlaceholder":"Sub-Category Name (Arabic)",
            "subCategoryDescriptionEnPlaceholder":"Sub-Category Description (English)","subCategoryDescriptionArPlaceholder":"Sub-Category Description (Arabic)",
            "created":"created","successMessage":"Category created successfully!","editCategoryTitle":"Edit Category",
            "updated":"updated"
        },
       
         "adminProductsPage": {
            "productList" : "product list",
            "manageProductsMessage" :"  Welcome to product management page",
            "title":"title"
        },
         "productDetailsPage": {
    "specialOffer": "Special Offer",
    "offerEndsIn": "Offer ends in",
    "offerPrice": "Offer Price",
    "originalPrice": "Was",
    "price": "Price",
       "selectFinalProduct": "Please select the final product version",
  },
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');

    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }, [language]);
    
    const changeLanguage = () => {
        setLanguage(prev => (prev === 'en' ? 'ar' : 'en'));
    };

    const t = (key, options = {}) => {
        const keys = key.split('.');
        let translation = keys.reduce((acc, currentKey) => acc?.[currentKey], translations[language]);

        // Fallback to English if translation is missing in the current language
        if (typeof translation !== 'string' && typeof translation !== 'object') {
            translation = keys.reduce((acc, currentKey) => acc?.[currentKey], translations['en']);
        }

        // If after fallback it's still not a string, return the key itself
        if (typeof translation !== 'string') {
            console.warn(`Translation key '${key}' not found or is not a string. Returning the key.`);
            return key;
        }

        // Replace placeholders like {name}
        return Object.keys(options).reduce((str, optKey) => {
            return str.replace(`{${optKey}}`, options[optKey]);
        }, translation);
    };

    return (
        <LanguageContext.Provider value={{ language, t, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);