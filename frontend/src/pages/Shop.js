import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';
import { useLanguage } from "../components/LanguageContext"; 
const ShopPage = () => {
    const { t, language } = useLanguage();
    const [allProducts, setAllProducts] = useState([]); 
    const [displayedProducts, setDisplayedProducts] = useState([]); 
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('popularity');
    const [selectedCategory, setSelectedCategory] = useState('All Categories'); 
    const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
    const [selectedBrand, setSelectedBrand] = useState('All Brands');
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]); 
    useEffect(() => {
        const fetchShopData = async () => {
            try {
                const productsRes = await fetch('http://localhost:5000/api/products');
                if (!productsRes.ok) {
                    console.error('Failed to fetch products:', productsRes.status, await productsRes.text());               
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
                const categoriesRes = await fetch('http://localhost:5000/api/categories');
                 if (!categoriesRes.ok) {
                     console.error('Failed to fetch categories:', categoriesRes.status, await categoriesRes.text());                
                 } else {
                     const categoriesData = await categoriesRes.json();
                     setCategories([{ _id: 'All Categories', name: { en: 'All Categories', ar: 'جميع الفئات' } }, ...categoriesData]);
                 }
                const storedSearchResults = localStorage.getItem('searchResults');
                const storedSearchTerm = localStorage.getItem('searchTermQuery');
                if (storedSearchResults && storedSearchTerm) {
                    const results = JSON.parse(storedSearchResults);
                    setDisplayedProducts(results); 
                    setSearchTerm(storedSearchTerm); 
                    localStorage.removeItem('searchResults');
                    localStorage.removeItem('searchTermQuery');
                } else {
                     setDisplayedProducts(productsData);
                }


            } catch (err) {
                console.error('Error fetching shop data:', err);
            }
        };

        fetchShopData();

    }, []);
    useEffect(() => {
        let filtered = allProducts.filter(product => {
            const productNameEn = product?.name?.en?.toLowerCase() || '';
            const productNameAr = product?.name?.ar?.toLowerCase() || '';
            const matchesSearch = productNameEn.includes(searchTerm.toLowerCase()) || productNameAr.includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;
            const productPrice = typeof product?.price === 'number' ? product.price : -1;
            const matchesPrice = productPrice >= priceRange.min && productPrice <= priceRange.max;
            const productBrand = product?.brand || '';
            const matchesBrand = selectedBrand === 'All Brands' || productBrand === selectedBrand;
            return matchesSearch && matchesCategory && matchesPrice && matchesBrand;
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
    }, [searchTerm, selectedCategory, priceRange, selectedBrand, sortBy, allProducts, language]);
    return (
        <section className="w-full bg-gray-50 py-8 px-4 transition-colors duration-300 dark:bg-gray-900 md:px-8 lg:px-12">
            <div className="mx-auto max-w-screen-xl">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                {t.shopPage?.searchProduct || 'Search Product'}
                            </h3>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={t.shopPage?.searchHere || 'Search here...'}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            </div>
                        </div>
                        <div className="mt-8">
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
