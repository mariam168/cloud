import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { useLanguage } from "../components/LanguageContext";
import { useLocation } from 'react-router-dom'; // Import useLocation

const ShopPage = () => {
    const { t, language } = useLanguage();
    const location = useLocation(); // Get location object
    const [allProducts, setAllProducts] = useState([]);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    // Removed searchTerm state, will read from URL
    const [sortBy, setSortBy] = useState('popularity');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
    const [selectedBrand, setSelectedBrand] = useState('All Brands');
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state for ShopPage
    const [error, setError] = useState(null); // Add error state for ShopPage


    // Effect to fetch initial data and react to URL search parameter changes
    useEffect(() => {
        const fetchProducts = async (searchTerm = '') => {
            setLoading(true);
            setError(null);
            try {
                const productsRes = await fetch(`http://localhost:5000/api/products${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`);
                if (!productsRes.ok) {
                    const errorText = await productsRes.text();
                    console.error('Failed to fetch products:', productsRes.status, errorText);
                    setError(t.shopPage?.errorFetchingProducts || 'Failed to load products.');
                    setAllProducts([]); // Clear products on error
                    setDisplayedProducts([]);
                    return;
                }
                const productsData = await productsRes.json();
                setAllProducts(productsData);
                 // Initially display all fetched products (or search results)
                setDisplayedProducts(productsData);


                // Update price range based on fetched products
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

                 // Update brands based on fetched products
                const uniqueBrands = ['All Brands', ...new Set(productsData.map(p => p.brand).filter(Boolean))];
                setBrands(uniqueBrands);


            } catch (err) {
                console.error('Error fetching products:', err);
                setError(t.shopPage?.errorFetchingProducts || 'Failed to load products.');
                setAllProducts([]);
                setDisplayedProducts([]);
            } finally {
                 setLoading(false);
            }
        };

        // Fetch categories only once on initial mount
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

        // Read search term from URL on mount and whenever location.search changes
        const searchParams = new URLSearchParams(location.search);
        const searchTermFromUrl = searchParams.get('search');

        fetchProducts(searchTermFromUrl);
        fetchCategories(); // Fetch categories on mount

    }, [location.search, t.shopPage?.errorFetchingProducts]); // Depend on location.search to re-run on search changes


    // Effect to handle filtering and sorting based on state changes (excluding search term)
    useEffect(() => {
        let filtered = allProducts.filter(product => {
            const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;
            const productPrice = typeof product?.price === 'number' ? product.price : -1;
            const matchesPrice = productPrice >= priceRange.min && productPrice <= priceRange.max;
            const productBrand = product?.brand || '';
            const matchesBrand = selectedBrand === 'All Brands' || productBrand === selectedBrand;
            return matchesCategory && matchesPrice && matchesBrand;
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
     // Depend on filtering/sorting states and allProducts (which is updated by the first effect)
    }, [selectedCategory, priceRange, selectedBrand, sortBy, allProducts, language]);

    if (loading) {
         return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-xl text-gray-700 dark:text-gray-300">
                 <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{t.general?.loading || 'Loading...'}</span>
            </div>
         );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-xl text-red-600 dark:text-red-400 p-4 text-center">
                {t.general?.error || 'Error'}: {error}
            </div>
        );
    }


    return (
        <section className="w-full bg-gray-50 py-8 px-4 transition-colors duration-300 dark:bg-gray-900 md:px-8 lg:px-12">
            <div className="mx-auto max-w-screen-xl">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        {/* Search input removed from here */}
                        <div className="mt-0"> {/* Adjusted margin */}
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                {t.shopPage?.filterByCategory || 'Filter by Category'}
                            </h3>
                            <ul>
                                {categories.map(category => (
                                    <li
                                        key={category._id}
                                        className={`cursor-pointer py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 ${selectedCategory === (category._id === 'All Categories' ? 'All Categories' : category.name.en) ? 'font-bold text-blue-600 dark:text-blue-400' : ''}`}
                                        onClick={() => setSelectedCategory(category._id === 'All Categories' ? 'All Categories' : category.name.en)}
                                    >
                                        {(category.name?.[language] || category.name?.en || category.name?.ar || category._id)}
                                         {/* Display count of products in this category from the *currently fetched* products */}
                                         {category._id !== 'All Categories' && (
                                             ` (${allProducts.filter(p => p.category === category.name.en).length})`
                                         )}
                                         {category._id === 'All Categories' && (
                                             ` (${allProducts.length})`
                                         )}

                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                {t.shopPage?.priceRange || 'Price Range'}
                            </h3>
                            <div className="flex items-center justify-between gap-4">
                                <input
                                    type="number"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                                    className="w-1/2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    min="0"
                                    max={priceRange.max}
                                />
                                <span className="text-gray-700 dark:text-gray-300">-</span>
                                <input
                                    type="number"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                                    className="w-1/2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    min={priceRange.min}
                                />
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                                <span>${priceRange.min.toFixed(2)}</span>
                                <span>${priceRange.max.toFixed(2)}</span>
                            </div>
                        </div>
                         <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                {t.shopPage?.filterByBrand || 'Filter by Brand'}
                            </h3>
                            {brands.map(brand => (
                                <div key={brand} className="flex items-center mb-2">
                                    <input
                                        type="radio"
                                        id={`brand-${brand}`}
                                        name="brand"
                                        value={brand}
                                        checked={selectedBrand === brand}
                                        onChange={() => setSelectedBrand(brand)}
                                        className="form-radio text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 h-4 w-4"
                                    />
                                    <label htmlFor={`brand-${brand}`} className="ml-2 text-gray-700 dark:text-gray-300 cursor-pointer">
                                         {t.brands?.[brand] || brand}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-full md:w-3/4">
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                            <div className="flex items-center mb-4 sm:mb-0">
                                <span className="text-gray-700 dark:text-gray-300 mr-2">{t.shopPage?.sortBy || 'Sort by:'}</span>
                                <select
                                    className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="popularity">{t.shopPage?.popularity || 'Popularity'}</option>
                                    <option value="price-asc">{t.shopPage?.priceLowToHigh || 'Price: Low to High'}</option>
                                    <option value="price-desc">{t.shopPage?.priceHighToLow || 'Price: High to Low'}</option>
                                    <option value="name-asc">{t.shopPage?.nameAZ || 'Name (A-Z)'}</option>
                                </select>
                            </div>
                            <div className="text-gray-700 dark:text-gray-300">
                                {t.shopPage?.showingItems || 'Showing'}: {displayedProducts.length} {t.shopPage?.items || 'items'}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {displayedProducts.length === 0 ? (
                                <div className="col-span-full text-center text-gray-600 dark:text-gray-400 py-12">
                                    {t.shopPage?.noProductsFound || 'No products found matching your criteria.'}
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
