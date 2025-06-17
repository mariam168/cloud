// pages/Shop.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import ProductCard from '../components/ProductCard'; // assuming ProductCard is already styled and uses translation
import { useLanguage } from "../components/LanguageContext";
import { useLocation } from 'react-router-dom';
import { X, Loader2, AlertCircle, ChevronDown, SlidersHorizontal, RefreshCcw, Info } from 'lucide-react'; // تم إضافة أيقونة Info
import axios from 'axios'; 
// استيراد تعريفات الفئات والـ variations
import { CATEGORY_ATTRIBUTES_DEFINITION, CATEGORY_VARIATIONS_OPTIONS_DEFINITION } from '../constants/productConfig'; // تأكد من المسار الصحيح

const ShopPage = () => {
    const { t, language } = useLanguage();
    const location = useLocation();
    const [allProducts, setAllProducts] = useState([]);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [sortBy, setSortBy] = useState('popularity');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedSubCategory, setSelectedSubCategory] = useState('All Subcategories');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
    const [initialPriceRange, setInitialPriceRange] = useState({ min: 0, max: 0 }); // لحفظ النطاق الأولي لإعادة الضبط
    const [selectedBrand, setSelectedBrand] = useState('All Brands');
    const [selectedVariationFilter, setSelectedVariationFilter] = useState({}); // { optionName: "Value" }
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [availableSubCategories, setAvailableSubCategories] = useState([]);
    const [availableVariationOptions, setAvailableVariationOptions] = useState({}); // { optionName: ["Value1", "Value2"] }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFilterVisible, setIsFilterVisible] = useState(false); // لحالة فلتر الموبايل

    const searchParams = new URLSearchParams(location.search);
    const categoryFromUrl = searchParams.get('category');
    const subCategoryFromUrl = searchParams.get('subCategory');

    // جلب المنتجات والفئات عند تحميل الصفحة أو تغير معلمات البحث
    useEffect(() => {
        const fetchProductsAndCategories = async () => {
            setLoading(true);
            setError(null);
            try {
                const searchTerm = searchParams.get('search');
                const productsRes = await axios.get(`http://localhost:5000/api/products${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`);
                const productsData = productsRes.data;
                setAllProducts(productsData);

                // تحديد نطاق السعر الأولي من المنتجات
                if (productsData.length > 0) {
                    const prices = productsData.map(p => typeof p.price === 'number' ? p.price : 0).filter(price => price >= 0);
                    if (prices.length > 0) {
                        const minPrice = Math.floor(Math.min(...prices));
                        const maxPrice = Math.ceil(Math.max(...prices));
                        setPriceRange({ min: minPrice, max: maxPrice });
                        setInitialPriceRange({ min: minPrice, max: maxPrice }); 
                    } else {
                        setPriceRange({ min: 0, max: 0 });
                        setInitialPriceRange({ min: 0, max: 0 });
                    }
                } else {
                    setPriceRange({ min: 0, max: 0 });
                    setInitialPriceRange({ min: 0, max: 0 });
                }

                // جلب العلامات التجارية من `attributes.brand`
                const uniqueBrands = ['All Brands', ...new Set(
                    productsData
                        .map(p => p.attributes?.brand) // الوصول لـ attributes.brand
                        .filter(Boolean) 
                )];
                setBrands(uniqueBrands);

                // جلب كل الـ variations options المتاحة للفلترة (مثال: كل الألوان المتاحة، كل المقاسات المتاحة)
                const allVariationOptions = {};
                productsData.forEach(product => {
                    if (product.variations && Array.isArray(product.variations)) {
                        product.variations.forEach(variation => {
                            // جمع optionName و optionValue
                            if (variation.optionName && variation.optionValue) {
                                if (!allVariationOptions[variation.optionName]) {
                                    allVariationOptions[variation.optionName] = new Set();
                                }
                                allVariationOptions[variation.optionName].add(variation.optionValue);
                            }
                            // جمع variation.options (إذا كانت variations تحتوي على مصفوفة options)
                            if (variation.options && Array.isArray(variation.options)) {
                                variation.options.forEach(opt => {
                                    if (opt.optionName && opt.optionValue) {
                                        if (!allVariationOptions[opt.optionName]) {
                                            allVariationOptions[opt.optionName] = new Set();
                                        }
                                        allVariationOptions[opt.optionName].add(opt.optionValue);
                                    }
                                });
                            }
                        });
                    }
                });
                // تحويل الـ Sets إلى Arrays وتخزينها
                const finalVariationOptions = {};
                Object.keys(allVariationOptions).forEach(optionName => {
                    finalVariationOptions[optionName] = ['All', ...Array.from(allVariationOptions[optionName])];
                });
                setAvailableVariationOptions(finalVariationOptions);

                // جلب الفئات
                const categoriesRes = await axios.get('http://localhost:5000/api/categories');
                const categoriesData = categoriesRes.data;
                setCategories([{ _id: 'All Categories', name: { en: 'All Categories', ar: 'جميع الفئات' } }, ...categoriesData]);

                // ضبط الفئات والفئات الفرعية من الـ URL (للحفاظ على حالة الفلاتر)
                if (categoryFromUrl) {
                    setSelectedCategory(categoryFromUrl);
                } else {
                    setSelectedCategory('All Categories');
                }
                if (subCategoryFromUrl) {
                    setSelectedSubCategory(subCategoryFromUrl);
                } else {
                    setSelectedSubCategory('All Subcategories');
                }

            } catch (err) {
                console.error('Error in ShopPage data fetching:', err);
                setError(t('shopPage.errorFetchingProducts'));
                setAllProducts([]);
                setDisplayedProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProductsAndCategories();
    }, [location.search, t, categoryFromUrl, subCategoryFromUrl]);

    // تحديث الفئات الفرعية المتاحة بناءً على الفئة الرئيسية المختارة
    useEffect(() => {
        let filteredProductsByMainCategory = allProducts;
        if (selectedCategory !== 'All Categories') {
            const actualCategory = categories.find(cat =>
                cat._id === selectedCategory ||
                (cat.name && (cat.name.en === selectedCategory || cat.name.ar === selectedCategory))
            );
            if (actualCategory && actualCategory.name?.en) {
                filteredProductsByMainCategory = allProducts.filter(product => {
                    const productCategoryName = product.category; 
                    return productCategoryName === actualCategory.name.en;
                });
            } else if (selectedCategory === 'All Categories') {
                filteredProductsByMainCategory = allProducts;
            } else { // Fallback if category object not found, compare with raw string
                filteredProductsByMainCategory = allProducts.filter(product => product.category === selectedCategory);
            }
        }
        const uniqueSubCategories = ['All Subcategories', ...new Set(
            filteredProductsByMainCategory
                .map(p => p.subCategory)
                .filter(Boolean)
        )];
        setAvailableSubCategories(uniqueSubCategories);
        // إعادة ضبط الفئة الفرعية إذا كانت الفئة الرئيسية المختارة لا تحتوي عليها
        if (!uniqueSubCategories.includes(selectedSubCategory)) {
            setSelectedSubCategory('All Subcategories');
        }
    }, [allProducts, selectedCategory, categories, selectedSubCategory]);

    // تطبيق الفلاتر والفرز على المنتجات المعروضة
    useEffect(() => {
        let filtered = allProducts.filter(product => {
            // فلترة حسب الفئة الرئيسية
            const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;

            // فلترة حسب الفئة الفرعية
            const matchesSubCategory = selectedSubCategory === 'All Subcategories' || product.subCategory === selectedSubCategory;

            // فلترة حسب نطاق السعر
            const productPrice = typeof product?.price === 'number' ? product.price : -1;
            const matchesPrice = productPrice >= priceRange.min && productPrice <= priceRange.max;

            // فلترة حسب البراند (الآن من attributes.brand)
            const productBrand = product?.attributes?.brand || '';
            const matchesBrand = selectedBrand === 'All Brands' || productBrand === selectedBrand;

            // فلترة حسب الـ Variation Option المختارة
            const matchesVariationOption = Object.keys(selectedVariationFilter).every(optionName => {
                const selectedValue = selectedVariationFilter[optionName];
                if (selectedValue === 'All') {
                    return true; 
                }
                // ابحث داخل variations المنتج عن Variation يطابق optionName و selectedValue
                return product.variations && product.variations.some(v => 
                    (v.optionName === optionName && v.optionValue === selectedValue) || // للـ variations التي لها optionName و optionValue مباشرة
                    (v.options && v.options.some(opt => opt.optionName === optionName && opt.optionValue === selectedValue)) // للـ variations التي لها مصفوفة options
                );
            });


            return matchesCategory && matchesSubCategory && matchesPrice && matchesBrand && matchesVariationOption;
        });

        // الفرز
        const sorted = [...filtered].sort((a, b) => {
            if (sortBy === 'popularity') {
                // تحتاج إلى حقل "popularity" في بيانات المنتج لفرز فعّال
                return 0; 
            }
            if (sortBy === 'price-asc') {
                return (a.price || 0) - (b.price || 0);
            }
            if (sortBy === 'price-desc') {
                return (b.price || 0) - (a.price || 0);
            }
            if (sortBy === 'name-asc') {
                const nameA = (a.name?.[language] || a.name?.en || a.name?.ar || '').toLowerCase();
                const nameB = (b.name?.[language] || b.name?.en || b.name?.ar || '').toLowerCase();
                return nameA.localeCompare(nameB, language);
            }
            return 0;
        });
        setDisplayedProducts(sorted);
    }, [selectedCategory, selectedSubCategory, priceRange, selectedBrand, sortBy, allProducts, language, categories, selectedVariationFilter]);

    const toggleFilterVisibility = useCallback(() => {
        setIsFilterVisible(prev => !prev);
    }, []);

    const handleCategoryClick = useCallback((categoryId) => {
        // تأكد من أننا نستخدم اسم الفئة الإنجليزية للمقارنة والتخزين
        const categoryToSelect = categories.find(cat => cat._id === categoryId || (cat.name && cat.name.en === categoryId));
        setSelectedCategory(categoryToSelect ? categoryToSelect.name?.en : 'All Categories');
        // عند تغيير الفئة الرئيسية، امسح الفلاتر الفرعية والـ variation options
        setSelectedSubCategory('All Subcategories');
        setSelectedVariationFilter({});
        if (!window.matchMedia('(min-width: 768px)').matches) {
            setIsFilterVisible(false); // إخفاء الفلتر بعد الاختيار في الموبايل
        }
    }, [categories]);

    const handleSubCategoryClick = useCallback((subCategory) => {
        setSelectedSubCategory(subCategory);
        // عند تغيير الفئة الفرعية، امسح فلتر الـ variation options
        setSelectedVariationFilter({});
        if (!window.matchMedia('(min-width: 768px)').matches) {
            setIsFilterVisible(false); // إخفاء الفلتر بعد الاختيار في الموبايل
        }
    }, []);

    const handleBrandChange = useCallback((brand) => {
        setSelectedBrand(brand);
    }, []);

    // التعامل مع فلترة الـ Variation Options
    const handleVariationOptionChange = useCallback((optionName, value) => {
        setSelectedVariationFilter(prev => ({
            ...prev,
            [optionName]: value,
        }));
    }, []);

    const resetFilters = useCallback(() => {
        setSelectedCategory('All Categories');
        setSelectedSubCategory('All Subcategories');
        setPriceRange(initialPriceRange);
        setSelectedBrand('All Brands');
        setSelectedVariationFilter({}); 
        setSortBy('popularity');
        if (!window.matchMedia('(min-width: 768px)').matches) {
            setIsFilterVisible(false); 
        }
    }, [initialPriceRange]);

    // حالات التحميل والخطأ (تم تحسينها لتظهر كـ cards)
    if (loading) {
        return (
            <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black py-20 px-4 md:px-8 lg:px-12 transition-colors duration-500 ease-in-out">
                <div className="flex flex-col items-center justify-center text-xl font-semibold text-gray-700 dark:text-gray-300 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                    <Loader2 size={60} className="animate-spin text-blue-600 dark:text-blue-400 mb-6" />
                    <span className="text-2xl">{t('general.loading') || 'Loading products...'}</span>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black py-20 px-4 md:px-8 lg:px-12 transition-colors duration-500 ease-in-out">
                <div className="text-center text-red-700 dark:text-red-300 text-xl p-10 bg-red-50 dark:bg-red-900/30 rounded-2xl shadow-xl border border-red-200 dark:border-red-800 flex flex-col items-center justify-center gap-5">
                    <AlertCircle size={60} className="text-red-600 dark:text-red-400" />
                    <p className="font-semibold">{t('general.error') || 'Error'}:</p>
                    <p className="text-base">{error}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-950 dark:to-black py-16 px-4 transition-colors duration-500 ease-in-out md:px-8 lg:px-12">
            <div className="mx-auto max-w-screen-xl">
                {/* Mobile Filter Toggle */}
                <div className="md:hidden flex justify-between items-center mb-8 bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 animate-fade-in-down">
                    <span className="text-2xl font-extrabold text-gray-800 dark:text-white">{t('shopPage.filter')}</span>
                    <button
                        onClick={toggleFilterVisibility}
                        className="flex items-center px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow-md hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
                    >
                        <SlidersHorizontal size={20} className={`${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                        {t('shopPage.showFilters')}
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-10 lg:gap-12">
                    {/* Filter Sidebar */}
                    <aside className={`
                        fixed inset-y-0 ${language === 'ar' ? 'right-0' : 'left-0'} w-3/4 sm:w-1/2 md:w-1/4 bg-white dark:bg-gray-900 shadow-2xl p-6 z-50 transform transition-transform duration-300 ease-in-out ${language === 'ar' ? 'border-r' : 'border-l'} border-gray-200 dark:border-gray-700
                        md:relative md:translate-x-0 md:shadow-none md:p-0 md:bg-transparent dark:md:bg-transparent md:border-none
                        ${isFilterVisible ? (language === 'ar' ? 'translate-x-0' : 'translate-x-0') : (language === 'ar' ? 'translate-x-full' : '-translate-x-full')}
                        md:h-fit md:sticky md:top-28 md:rounded-2xl md:shadow-xl md:border md:border-gray-200 dark:md:border-gray-800
                        md:bg-gray-50 dark:md:bg-gray-800
                        md:z-30 // **التغيير الحاسم هنا: قم بخفض الـ z-index للفلتر في وضع الديسكتوب**
                    `}>
                        {/* Close button for mobile filter */}
                        <div className="md:hidden flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('shopPage.filter')}</h3>
                            <button
                                onClick={toggleFilterVisibility}
                                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Filter by Category */}
                        <div className="mb-8 p-5 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                                {t('shopPage.filterByCategory')}
                            </h3>
                            <ul className="space-y-3">
                                {categories.map(category => (
                                    <li
                                        key={category._id}
                                        className={`cursor-pointer py-2.5 px-4 rounded-lg transition-all duration-200 ease-in-out text-base flex justify-between items-center
                                            ${selectedCategory === (category.name?.en || category._id)
                                                ? 'bg-blue-600 dark:bg-blue-700 text-white font-bold shadow-md'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-blue-200'}
                                        `}
                                        onClick={() => handleCategoryClick(category._id)}
                                    >
                                        <span>{(category.name?.[language] || category.name?.en || category.name?.ar || category._id)}</span>
                                        <span className={`text-sm font-bold opacity-90 ${selectedCategory === (category.name?.en || category._id) ? 'text-blue-100 dark:text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {` (${allProducts.filter(p => {
                                                const productCategoryName = p.category; 
                                                const selectedCatForFilter = (category.name?.en || category._id);
                                                return selectedCatForFilter === 'All Categories' ? true : productCategoryName === selectedCatForFilter;
                                            }).length})`}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Filter by Sub-Category */}
                        <div className="mb-8 p-5 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                                {t('shopPage.filterBySubCategory')}
                            </h3>
                            <ul className="space-y-3">
                                {availableSubCategories.map(subCategory => (
                                    <li
                                        key={subCategory}
                                        className={`cursor-pointer py-2.5 px-4 rounded-lg transition-all duration-200 ease-in-out text-base flex justify-between items-center
                                            ${selectedSubCategory === subCategory
                                                ? 'bg-blue-600 dark:bg-blue-700 text-white font-bold shadow-md'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-blue-200'}
                                        `}
                                        onClick={() => handleSubCategoryClick(subCategory)}
                                    >
                                        <span>{subCategory === 'All Subcategories' ? t('shopPage.allSubcategories') : subCategory}</span>
                                        <span className={`text-sm font-bold opacity-90 ${selectedSubCategory === subCategory ? 'text-blue-100 dark:text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {` (${allProducts.filter(p => {
                                            const productCategoryName = p.category;
                                            const selectedCategoryNameForFilter = selectedCategory;

                                            return (selectedCategoryNameForFilter === 'All Categories' ? true : productCategoryName === selectedCategoryNameForFilter) &&
                                                (subCategory === 'All Subcategories' || p.subCategory === subCategory);
                                        }).length})`}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* جديد: فلترة حسب الـ Variation Options (مثل الألوان والمقاسات) */}
                        {Object.keys(availableVariationOptions).length > 0 && (
                            <div className="mb-8 p-5 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                                    {t('shopPage.filterByOption') || 'Filter by Option'}
                                </h3>
                                {Object.keys(availableVariationOptions).map(optionName => (
                                    <div key={optionName} className="mb-4 last:mb-0">
                                        <label htmlFor={`filter-option-${optionName}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {language === 'ar' ? 
                                                (CATEGORY_VARIATIONS_OPTIONS_DEFINITION[selectedCategory]?.find(opt => opt.name_en === optionName)?.name_ar || optionName) 
                                                : optionName}:
                                        </label>
                                        <select
                                            id={`filter-option-${optionName}`}
                                            value={selectedVariationFilter[optionName] || 'All'}
                                            onChange={(e) => handleVariationOptionChange(optionName, e.target.value)}
                                            className="w-full h-11 p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base transition-colors duration-200"
                                        >
                                            {availableVariationOptions[optionName].map(value => (
                                                <option key={value} value={value}>{value === 'All' ? t('shopPage.allOptions') : value}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Price Range Filter */}
                        <div className="mb-8 p-5 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                                {t('shopPage.priceRange')}
                            </h3>
                            <div className="flex items-center justify-between gap-4">
                                <input
                                    type="number"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange({ ...priceRange, min: Math.max(0, Number(e.target.value)) })}
                                    className="w-1/2 h-11 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base shadow-sm transition-colors duration-200"
                                    min="0"
                                    max={priceRange.max}
                                />
                                <span className="text-gray-700 dark:text-gray-300 font-bold text-lg">-</span>
                                <input
                                    type="number"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange({ ...priceRange, max: Math.max(priceRange.min, Number(e.target.value)) })}
                                    className="w-1/2 h-11 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base shadow-sm transition-colors duration-200"
                                    min={priceRange.min}
                                />
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-3 font-semibold">
                                <span>{t('general.currencySymbol')}{priceRange.min.toFixed(2)}</span>
                                <span>{t('general.currencySymbol')}{priceRange.max.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Filter by Brand */}
                        <div className="p-5 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                                {t('shopPage.filterByBrand')}
                            </h3>
                            <div className="space-y-3">
                                {brands.map(brand => (
                                    <label key={brand} className="flex items-center cursor-pointer py-1.5 group">
                                        <input
                                            type="radio"
                                            id={`brand-${brand}`}
                                            name="brand"
                                            value={brand}
                                            checked={selectedBrand === brand}
                                            onChange={() => handleBrandChange(brand)}
                                            className="form-radio h-5 w-5 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600 transition-colors duration-200 checked:bg-blue-600 checked:border-transparent"
                                        />
                                        <span htmlFor={`brand-${brand}`} className={`text-base group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200 ${language === 'ar' ? 'mr-3' : 'ml-3'} ${selectedBrand === brand ? 'text-blue-800 dark:text-blue-200 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {t(`brands.${brand}`) || brand}
                                            <span className={`text-sm font-bold opacity-80 ${selectedBrand === brand ? 'text-blue-100 dark:text-blue-200 ml-1' : 'text-gray-500 dark:text-gray-400 ml-1'}`}>
                                                {` (${allProducts.filter(p => brand === 'All Brands' ? true : (p.attributes?.brand === brand)).length})`}
                                            </span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Reset Filters Button - Moved to bottom */}
                        <div className="mt-8 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                            <button
                                onClick={resetFilters}
                                className="w-full py-3 flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-300 ease-in-out text-lg font-semibold transform hover:-translate-y-0.5"
                            >
                                <RefreshCcw size={20} className={`${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                                {t('shopPage.resetFilters')}
                            </button>
                        </div>
                    </aside>

                    {/* Overlay for mobile filter */}
                    {isFilterVisible && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden animate-fade-in"
                            onClick={toggleFilterVisibility}
                        ></div>
                    )}

                    {/* Main Content Area (Sorting and Product Grid) */}
                    <div className="w-full md:w-3/4">
                        {/* Sorting Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-5 mb-8 border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center mb-4 sm:mb-0">
                                <span className={`text-gray-700 dark:text-gray-300 text-lg font-semibold ${language === 'ar' ? 'ml-4' : 'mr-4'}`}>{t('shopPage.sortBy')}</span>
                                <div className="relative">
                                    <select
                                        className={`appearance-none h-11 px-5 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base shadow-sm transition-colors duration-200 cursor-pointer`}
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        style={{ paddingRight: language === 'ar' ? '1.5rem' : '2.5rem', paddingLeft: language === 'ar' ? '2.5rem' : '1.5rem' }} 
                                    >
                                        <option value="popularity">{t('shopPage.popularity')}</option>
                                        <option value="price-asc">{t('shopPage.priceLowToHigh')}</option>
                                        <option value="price-desc">{t('shopPage.priceHighToLow')}</option>
                                        <option value="name-asc">{t('shopPage.nameAZ')}</option>
                                    </select>
                                    <ChevronDown size={20} className={`absolute top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 pointer-events-none ${language === 'ar' ? 'left-3' : 'right-3'}`} />
                                </div>
                            </div>
                            <div className="text-gray-700 dark:text-gray-300 text-md font-medium">
                                {t('shopPage.showingItems')}: <span className="font-bold text-blue-600 dark:text-blue-400">{displayedProducts.length}</span> {t('shopPage.items')}
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 lg:gap-8">
                            {displayedProducts.length === 0 ? (
                                <div className="col-span-full text-center text-gray-700 dark:text-gray-300 py-16 text-2xl font-semibold p-6 bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-6 border border-gray-200 dark:border-gray-700">
                                    <Info size={60} className="text-blue-500 dark:text-blue-400" />
                                    <p>{t('shopPage.noProductsFound') || 'No products found matching your criteria.'}</p>
                                    <button
                                        onClick={resetFilters}
                                        className="mt-4 py-2.5 px-6 flex items-center justify-center bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-200 text-base font-semibold"
                                    >
                                        {t('shopPage.resetFilters') || 'Reset Filters'}
                                    </button>
                                </div>
                            ) : (
                                displayedProducts.map(product => (
                                    <ProductCard key={product._id} product={product} />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ShopPage;