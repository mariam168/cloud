import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { useLanguage } from "../components/LanguageContext";
import { useLocation } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
const ShopPage = () => {
    const { t, language } = useLanguage();
    const location = useLocation();
    const [allProducts, setAllProducts] = useState([]);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [sortBy, setSortBy] = useState('popularity');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedSubCategory, setSelectedSubCategory] = useState('All Subcategories');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
    const [selectedBrand, setSelectedBrand] = useState('All Brands');
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [availableSubCategories, setAvailableSubCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const searchParams = new URLSearchParams(location.search);
    const categoryFromUrl = searchParams.get('category');
    const subCategoryFromUrl = searchParams.get('subCategory');
    useEffect(() => {
        const fetchProducts = async (searchTerm = '') => {
            setLoading(true);
            setError(null);
            try {
                const productsRes = await fetch(`http://localhost:5000/api/products${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`);
                if (!productsRes.ok) {
                    const errorText = await productsRes.text();
                    console.error('Failed to fetch products:', productsRes.status, errorText);
                    setError(t('shopPage.errorFetchingProducts') || 'Failed to load products.');
                    setAllProducts([]);
                    setDisplayedProducts([]);
                    return;
                }
                const productsData = await productsRes.json();
                setAllProducts(productsData);
                if (productsData.length > 0) {
                    const prices = productsData.map(p => p.price).filter(price => typeof price === 'number');
                    if (prices.length > 0) {
                        const minPrice = Math.min(...prices);
                        const maxPrice = Math.max(...prices);
                        setPriceRange({ min: minPrice, max: maxPrice });
                    } else {
                        setPriceRange({ min: 0, max: 0 });
                    }
                } else {
                    setPriceRange({ min: 0, max: 0 });
                }
                const uniqueBrands = ['All Brands', ...new Set(productsData.map(p => p.brand).filter(Boolean))];
                setBrands(uniqueBrands);

            } catch (err) {
                console.error('Error fetching products:', err);
                setError(t('shopPage.errorFetchingProducts') || 'Failed to load products.');
                setAllProducts([]);
                setDisplayedProducts([]);
            } finally {
                setLoading(false);
            }
        };
        const fetchCategories = async () => {
            try {
                const categoriesRes = await fetch('http://localhost:5000/api/categories');
                if (!categoriesRes.ok) {
                    console.error('Failed to fetch categories:', categoriesRes.status, await categoriesRes.text());
                } else {
                    const categoriesData = await categoriesRes.json();
                    setCategories([{ _id: 'All Categories', name: { en: 'All Categories', ar: 'جميع الفئات' } }, ...categoriesData]);
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };

        const searchTermFromUrl = searchParams.get('search');
        fetchProducts(searchTermFromUrl);
        fetchCategories();
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

    }, [location.search, t]);
    useEffect(() => {
        let filteredProductsByMainCategory = allProducts;
        if (selectedCategory !== 'All Categories') {
            filteredProductsByMainCategory = allProducts.filter(product => {
                const productCategoryName = typeof product.category === 'object'
                    ? (product.category?.[language] || product.category?.en || product.category?.ar)
                    : product.category;
                return productCategoryName === selectedCategory;
            });
        }
        const uniqueSubCategories = ['All Subcategories', ...new Set(
            filteredProductsByMainCategory
                .map(p => p.subCategory)
                .filter(Boolean)
        )];
        setAvailableSubCategories(uniqueSubCategories);
        if (!uniqueSubCategories.includes(selectedSubCategory)) {
            setSelectedSubCategory('All Subcategories');
        }

    }, [allProducts, selectedCategory, language]);
    useEffect(() => {
        let filtered = allProducts.filter(product => {
            const productCategoryName = typeof product.category === 'object'
                ? (product.category?.[language] || product.category?.en || product.category?.ar)
                : product.category;

            const matchesCategory = selectedCategory === 'All Categories' || productCategoryName === selectedCategory;

            const productSubCategoryName = product.subCategory || '';
            const matchesSubCategory = selectedSubCategory === 'All Subcategories' || productSubCategoryName === selectedSubCategory;

            const productPrice = typeof product?.price === 'number' ? product.price : -1;
            const matchesPrice = productPrice >= priceRange.min && productPrice <= priceRange.max;

            const productBrand = product?.brand || '';
            const matchesBrand = selectedBrand === 'All Brands' || productBrand === selectedBrand;

            return matchesCategory && matchesSubCategory && matchesPrice && matchesBrand;
        });

        const sorted = [...filtered].sort((a, b) => {
            if (sortBy === 'popularity') {
                return (b.reviews || 0) - (a.reviews || 0);
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
    }, [selectedCategory, selectedSubCategory, priceRange, selectedBrand, sortBy, allProducts, language]);
    const toggleFilterVisibility = () => {
        setIsFilterVisible(!isFilterVisible);
    };

    if (loading) {
        return (
            <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black py-20 px-4 md:px-8 lg:px-12">
                <div className="flex flex-col items-center justify-center text-xl font-semibold text-gray-700 dark:text-gray-300">
                    <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{t('general.loading') || 'Loading...'}</span>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black py-20 px-4 md:px-8 lg:px-12">
                <div className="text-center text-red-600 dark:text-red-400 text-lg p-6 bg-red-100 dark:bg-red-900/30 rounded-xl shadow-lg border border-red-200 dark:border-red-700">
                    <p className="font-bold mb-2">{t('general.error') || 'Error'}:</p>
                    <p>{error}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black py-16 px-4 transition-colors duration-500 ease-in-out md:px-8 lg:px-12">
            <div className="mx-auto max-w-screen-xl">
                <div className="md:hidden flex justify-between items-center mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <span className="text-xl font-bold text-gray-800 dark:text-white">{t('shopPage.filter') || 'Filter'}</span>
                    <button
                        onClick={toggleFilterVisibility}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 ease-in-out"
                    >
                        <Filter size={20} className="mr-2" />
                        {t('shopPage.showFilters') || 'Show Filters'}
                    </button>
                </div>
                <div className="flex flex-col md:flex-row gap-10 lg:gap-12">
                    <aside className={`
                        fixed inset-y-0 left-0 w-3/4 sm:w-1/2 md:w-1/4 bg-white dark:bg-gray-800 shadow-2xl p-6 z-50 transform transition-transform duration-300 ease-in-out
                        md:relative md:translate-x-0 md:shadow-none md:p-0 md:bg-transparent dark:md:bg-transparent md:border-none
                        ${isFilterVisible ? 'translate-x-0' : '-translate-x-full'}
                        md:h-fit md:sticky md:top-28 md:rounded-xl md:shadow-lg md:border md:border-gray-200 dark:md:border-gray-700
                    `}>
                        <div className="md:hidden flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('shopPage.filter') || 'Filter'}</h3>
                            <button
                                onClick={toggleFilterVisibility}
                                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                                {t('shopPage.filterByCategory') || 'Filter by Category'}
                            </h3>
                            <ul className="space-y-2">
                                {categories.map(category => (
                                    <li
                                        key={category._id}
                                        className={`cursor-pointer py-2 px-3 rounded-md transition-all duration-200 ease-in-out text-base
                                            ${selectedCategory === (category._id === 'All Categories' ? 'All Categories' : category.name.en)
                                                ? 'bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-blue-100 font-semibold'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'}
                                        `}
                                        onClick={() => {
                                            setSelectedCategory(category._id === 'All Categories' ? 'All Categories' : category.name.en);

                                            if (!window.matchMedia('(min-width: 768px)').matches) setIsFilterVisible(false);
                                        }}
                                    >
                                        {(category.name?.[language] || category.name?.en || category.name?.ar || category._id)}
                                        {` (${allProducts.filter(p => {
                                            const catName = typeof p.category === 'object' ? (p.category?.[language] || p.category?.en || p.category?.ar) : p.category;
                                            return category._id === 'All Categories' ? true : catName === category.name.en;
                                        }).length})`}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                                {t('shopPage.filterBySubCategory') || 'Filter by Sub-Category'}
                            </h3>
                            <ul className="space-y-2">
                                {availableSubCategories.map(subCategory => (
                                    <li
                                        key={subCategory}
                                        className={`cursor-pointer py-2 px-3 rounded-md transition-all duration-200 ease-in-out text-base
                                            ${selectedSubCategory === subCategory
                                                ? 'bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-blue-100 font-semibold'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'}
                                        `}
                                        onClick={() => { setSelectedSubCategory(subCategory); if (!window.matchMedia('(min-width: 768px)').matches) setIsFilterVisible(false); }}
                                    >
                                        {subCategory}
                                        {` (${allProducts.filter(p => {
                                            const productCategoryName = typeof p.category === 'object'
                                                ? (p.category?.[language] || p.category?.en || p.category?.ar)
                                                : p.category;
                                            return (selectedCategory === 'All Categories' || productCategoryName === selectedCategory) &&
                                                (subCategory === 'All Subcategories' || p.subCategory === subCategory);
                                        }).length})`}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                                {t('shopPage.priceRange') || 'Price Range'}
                            </h3>
                            <div className="flex items-center justify-between gap-4">
                                <input
                                    type="number"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm shadow-inner"
                                    min="0"
                                    max={priceRange.max}
                                />
                                <span className="text-gray-700 dark:text-gray-300 font-bold text-sm">-</span>
                                <input
                                    type="number"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm shadow-inner"
                                    min={priceRange.min}
                                />
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2 font-semibold">
                                <span>{t('shopPage.currencySymbol') || '$'}{priceRange.min.toFixed(2)}</span>
                                <span>{t('shopPage.currencySymbol') || '$'}{priceRange.max.toFixed(2)}</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                                {t('shopPage.filterByBrand') || 'Filter by Brand'}
                            </h3>
                            <div className="space-y-2">
                                {brands.map(brand => (
                                    <div key={brand} className="flex items-center">
                                        <input
                                            type="radio"
                                            id={`brand-${brand}`}
                                            name="brand"
                                            value={brand}
                                            checked={selectedBrand === brand}
                                            onChange={() => setSelectedBrand(brand)}
                                            className="form-radio text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 h-4 w-4 transition-colors duration-200"
                                        />
                                        <label htmlFor={`brand-${brand}`} className="ml-2 text-gray-700 dark:text-gray-300 cursor-pointer text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                                            {t(`brands.${brand}`) || brand}
                                            {` (${allProducts.filter(p => brand === 'All Brands' ? true : p.brand === brand).length})`}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                    {isFilterVisible && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                            onClick={toggleFilterVisibility}
                        ></div>
                    )}
                    <div className="w-full md:w-3/4">
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-8 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center mb-4 sm:mb-0">
                                <span className="text-gray-700 dark:text-gray-300 mr-3 text-base font-semibold">{t('shopPage.sortBy') || 'Sort by:'}</span>
                                <select
                                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm shadow-inner transition-colors duration-200"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="popularity">{t('shopPage.popularity') || 'Popularity'}</option>
                                    <option value="price-asc">{t('shopPage.priceLowToHigh') || 'Price: Low to High'}</option>
                                    <option value="price-desc">{t('shopPage.priceHighToLow') || 'Price: High to Low'}</option>
                                    <option value="name-asc">{t('shopPage.nameAZ') || 'Name (A-Z)'}</option>
                                </select>
                            </div>
                            <div className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                                {t('shopPage.showingItems') || 'Showing'}: <span className="font-semibold">{displayedProducts.length}</span> {t('shopPage.items') || 'items'}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                            {displayedProducts.length === 0 ? (
                                <div className="col-span-full text-center text-gray-600 dark:text-gray-400 py-16 text-xl font-semibold">
                                    {t('shopPage.noProductsFound') || 'No products found matching your criteria.'}
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
