
import { createContext, useContext, useState } from 'react';
const translations = {
  en: {
    currency: '£ EGP',
    language: 'English',
    home: 'Home',
    shop: 'Shop',
    aboutUs: 'About Us',
    contactUs: 'Contact Us',
    helloGuest: 'Hello Guest',
    signIn: 'Sign In',
    register: 'Register',
    hotline: 'Hotline:',
    searchPlaceholder: 'Search for products...',
    navHome: 'Home',
    navShop: 'Shop',
    navAbout: 'About',
    navContact: 'Contact',
    followUs: 'Follow Us:',
    dashboard : 'Dashboard',
    dark : 'Dark',
    light : 'Light',

    bigSale: "big sale",
    heroTitle: "Get the best deal on security cameras",
    heroDesc: "Protect your home and work with high-quality surveillance cameras. Night vision, motion detection, and distance monitoring.",
    comboOffer: "Price for the full offer",
    shopNow: "Shop Now",
    installment: "Installments are available",
    weeklySale: "Weekly Sales",
    weeklyDesc: "Enjoy discounts up to",
    View :"View",
    addToCart :"Add To Cart",
    addToFavorites :"Add To Favorites",
    reviews :"Reviews",
      trendingProducts: "trendingProducts",
  trendingDesc: "see the latest trending products. Best offers available now.",
 
  freeShipping: "freeShipping",
  freeShippingDesc: "on orders over ٤٬٧٥٢ جنيه",
  support247: "support247",
  support247Desc: "support directly over chat and phone at any time",
  onlinePayment: "online Payment",
  onlinePaymentDesc: " secure and easy transactions",
  easyReturn: "easy Return",
  easyReturnDesc: "shop without worry",
  
  "All Categories": "All Categories",
  "Watch": "Watch",
  "Speaker": "Speaker",
  "Camera": "Camera",
  "Phone": "Phone",
  "Headphone": "Headphone",
  "Laptop": "Laptop",
  "TV": "TV",
  "All Brands": "All Brands",
  "Search Product": "Search Product",
  "Search here...": "Search here...",
  "Price Range": "Price Range",
  "Filter by Brand": "Filter by Brand",
  "Sort by:": "Sort by:",
  "Popularity": "Popularity",
  "Price: Low to High": "Price: Low to High",
  "Price: High to Low": "Price: High to Low",
  "Name (A-Z)": "Name (A-Z)",
  "Showing": "Showing",
  "items": "items",
  "No products found matching your criteria.": "No products found matching your criteria."


  
  },
  ar: {
    currency: 'ج.م EGP',
    language: 'العربية',
    home: 'الرئيسية',
    shop: 'تسوق',
    aboutUs: 'من نحن',
    contactUs: 'اتصل بنا',
    dashboard : 'لوحة التحكم',
    helloGuest: 'أهلاً بك',
    signIn: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    hotline: 'الخط الساخن:',
    searchPlaceholder: 'ابحث عن منتج...',
    navHome: 'الرئيسية',
    navShop: 'تسوق',
    navAbout: 'عن المتجر',
    navContact: 'تواصل معنا',
    followUs: 'تابعنا:',
    dark : 'الظلام',
    light : 'الضوء',
    bigSale: "عرض تخفيض كبير",
  heroTitle: "احصل على أفضل صفقة لكاميرات المراقبة",
  heroDesc: "قم بحماية منزلك وعملك بكاميرا مراقبة عالية الجودة. رؤية ليلية، كشف حركة، ومراقبة عن بُعد لأمان مطلق.",
  comboOffer: "السعر للعرض الكامل",
  shopNow: "تسوق الآن",
  installment: "تتوفر أقساط ميسّرة",
  weeklySale: "تخفيضات الأسبوع",
  weeklyDesc: "استمتع بخصومات تصل إلى",
  off: "خصم",
  thisWeek: "على جميع منتجات المتجر هذا الأسبوع. لا تفوّت الفرصة!",
   view: "عرض",
  addToCart: "أضف إلى السلة",
  addToFavorites: "أضف إلى المفضلة",
  reviews: "مراجعة",
   trendingProducts: "المنتجات الرائجة",
  trendingDesc: "اطّلع على أحدث المنتجات الرائجة. أفضل العروض متاحة الآن.",
   freeShipping: "شحن مجاني",
  freeShippingDesc: "على الطلبات التي تزيد عن ٤٬٧٥٢ جنيه",
  support247: "دعم ٢٤/٧",
  support247Desc: "دعم مباشر عبر الدردشة والهاتف في أي وقت",
  onlinePayment: "الدفع أونلاين",
  onlinePaymentDesc: "عمليات آمنة وسهلة",
  easyReturn: "إرجاع سهل",
  easyReturnDesc: "تسوق بدون قلق",
  
  aboutUsTitle: "تك إكسبريس - وجهتك الأولى للإلكترونيات",
  aboutUsCommitment: "في تك إكسبريس، نلتزم بتقديم أحدث وأفضل المنتجات الإلكترونية. سواء كنت تبحث عن هواتف ذكية متطورة أو أجهزة لابتوب قوية أو إكسسوارات عالية الجودة، نوفر لك كل ذلك بأسعار لا تُنافس.",
  aboutUsBelief: "نؤمن بتوفير تجربة تسوق استثنائية من خلال التوصيل السريع، وطرق الدفع الآمنة، وخدمة العملاء الممتازة. هدفنا هو جعل تجربة التسوق الإلكتروني بسيطة وموثوقة وممتعة للجميع.",
  aboutUsExplore: "استكشف مجموعتنا وابقَ على اطلاع بأحدث اتجاهات التكنولوجيا. رضاك هو أولويتنا!",
   contactUsTitle: "اتصل بنا",
  contactUsDescription: "هل لديك أسئلة أو تحتاج إلى مساعدة؟ لا تتردد في التواصل معنا. فريقنا متاح لمساعدتك في أي استفسار يتعلق بخدماتنا.",
  yourName: "اسمك",
  yourSubject: "الموضوع",
  yourEmail: "بريدك الإلكتروني",
  yourPhone: "رقم هاتفك",
  yourMessage: "رسالتك",
  submitMessage: "إرسال الرسالة",

  "All Categories": "جميع الفئات",
  "Watch": "ساعة",
  "Speaker": "متحركات",
  "Camera": "كاميرا",
  "Phone": "هاتف",
  "Headphone": "سماعات",
  "Laptop": "لابتوب",
  "TV": "تلفزيون",
  "All Brands": "جميع الماركات",
  "Search Product": "بحث عن منتج",
  "Search here...": "ابحث هنا...",
  "Price Range": "نطاق السعر",
  "Filter by Brand": "تصفية حسب الماركة",
  "Sort by:": "ترتيب حسب:",
  "Popularity": "الشعبية",
  "Price: Low to High": "السعر من الاقل الى الاعلى",
  "Price: High to Low": "السعر من الاعلى الى الاقل",
  "Name (A-Z)": "اسم (A-Z)",
  "Showing": "عرض",
  "items": "عناصر",
  "No products found matching your criteria.": "لم يتم العثور على منتجات مطابقة للمعايير الخاصة بك.",
  
  loading: "جار التحميل...",
  productNotFound: "المنتج غير موجود",
  specifications: "المواصفات",
  quantity: "الكمية",
  addToCart: "أضف إلى السلة",
  toWishlist: "إلى المفضلة",
  egp: "جنيه"



  }
};

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');
  const toggleLanguage = () => setLang(prev => (prev === 'en' ? 'ar' : 'en'));

  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, dir, t }}>
      <div dir={dir} className={lang === 'ar' ? 'font-arabic' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};
