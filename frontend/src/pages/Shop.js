import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';
import { useLanguage } from "../components/LanguageContext";

const ShopPage = () => {
    const { t } = useLanguage();

    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('popularity');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
    const [selectedBrand, setSelectedBrand] = useState('All Brands');

    // Static categories list - consider fetching this from backend if dynamic
    const categories = [
        'All Categories',
        'Watch',
        'Speaker',
        'Camera',
        'Phone',
        'Headphone',
        'Laptop',
        'TV',
    ];

    // Fetch products on component mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/products');
                if (!res.ok) {
                    console.error('Failed to fetch products:', res.status, await res.text());
                    // Handle error, maybe show a message to the user
                    return;
                }
                const data = await res.json();
                setProducts(data);

                // Set initial price range after loading, handle case with no products
                if (data.length > 0) {
                    const prices = data.map(p => p.price).filter(price => typeof price === 'number'); // Filter out non-numeric prices
                    if (prices.length > 0) {
                         const minPrice = Math.min(...prices);
                         const maxPrice = Math.max(...prices);
                         setPriceRange({ min: minPrice, max: maxPrice });
                    } else {
                         setPriceRange({ min: 0, max: 0 }); // Default if no valid prices
                    }
                } else {
                    setPriceRange({ min: 0, max: 0 }); // Default if no products
                }

            } catch (err) {
                console.error('Error fetching products:', err);
                // Handle fetch error
            }
        };

        fetchProducts();
    }, []); // Empty dependency array means this runs once on mount

    // Derive brands from products - ensure product.brand exists
    const brands = ['All Brands', ...new Set(products.map(p => p.brand).filter(Boolean))]; // Filter out undefined/null brands

    // Filter products based on state
    const filteredProducts = products.filter(product => {
        // Ensure product and product.name are valid before calling toLowerCase
        const productName = product?.name?.toLowerCase() || '';
        const matchesSearch = productName.includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;

        // Ensure product.price is a number before comparison
        const productPrice = typeof product?.price === 'number' ? product.price : -1; // Use -1 or handle appropriately if price is missing/invalid
        const matchesPrice = productPrice >= priceRange.min && productPrice <= priceRange.max;

         // Ensure product.brand is valid
        const productBrand = product?.brand || '';
        const matchesBrand = selectedBrand === 'All Brands' || productBrand === selectedBrand;


        return matchesSearch && matchesCategory && matchesPrice && matchesBrand;
    });

    // Sort filtered products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'popularity') {
            // Assuming 'reviews' exists and is a number, otherwise handle missing data
            return (b.reviews || 0) - (a.reviews || 0);
        }
        if (sortBy === 'price-asc') {
             // Ensure prices are numbers for comparison
            return (a.price || 0) - (b.price || 0);
        }
        if (sortBy === 'price-desc') {
             // Ensure prices are numbers for comparison
            return (b.price || 0) - (a.price || 0);
        }
        if (sortBy === 'name-asc') {
             // Ensure names are strings for comparison
            const nameA = a.name || '';
            const nameB = b.name || '';
            return nameA.localeCompare(nameB);
        }
        // Default sort (e.g., by creation date if available, or no sort)
        // If no default sort is desired for other sortBy values, return 0
        return 0;
    });

    return (
        <section className="w-full bg-gray-50 py-8 px-4 transition-colors duration-300 dark:bg-gray-900 md:px-8 lg:px-12">
            <div className="mx-auto max-w-screen-xl">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <div className="w-full md:w-1/4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        {/* Search Input */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                {t.searchProduct || 'Search Product'}
                            </h3>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={t.searchHere || 'Search here...'}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            </div>
                        </div>

                        {/* Categories Filter */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                {t.allCategories || 'All Categories'}
                            </h3>
                            <ul>
                                {categories.map(category => (
                                    <li
                                        key={category} // Added key prop here
                                        className={`cursor-pointer py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 ${selectedCategory === category ? 'font-bold text-blue-600 dark:text-blue-400' : ''}`}
                                        onClick={() => setSelectedCategory(category)}
                                    >
                                        {t[category] || category} ({products.filter(p => category === 'All Categories' || p.category === category).length})
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Price Range Filter */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                {t.priceRange || 'Price Range'}
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
                                <span>${priceRange.min}</span>
                                <span>${priceRange.max}</span>
                            </div>
                        </div>

                        {/* Brand Filter */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                {t.filterByBrand || 'Filter by Brand'}
                            </h3>
                            {brands.map(brand => (
                                <div key={brand} className="flex items-center mb-2"> {/* Added key prop here */}
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
                                        {t[brand] || brand}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product List Area */}
                    <div className="w-full md:w-3/4">
                        {/* Sort and Info Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                            <div className="flex items-center mb-4 sm:mb-0">
                                <span className="text-gray-700 dark:text-gray-300 mr-2">{t.sortBy || 'Sort by:'}</span>
                                <select
                                    className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="popularity">{t.popularity || 'Popularity'}</option>
                                    <option value="price-asc">{t.priceLowToHigh || 'Price: Low to High'}</option>
                                    <option value="price-desc">{t.priceHighToLow || 'Price: High to Low'}</option>
                                    <option value="name-asc">{t.nameAZ || 'Name (A-Z)'}</option>
                                </select>
                            </div>
                            <div className="text-gray-700 dark:text-gray-300">
                                {t.showingItems || 'Showing'}: {sortedProducts.length} {t.items || 'items'}
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Conditional rendering for no products found */}
                            {sortedProducts.length === 0 ? (
                                <div className="col-span-full text-center text-gray-600 dark:text-gray-400 py-12">
                                    {t.noProductsFound || 'No products found matching your criteria.'}
                                </div>
                            ) : (
                                // Map over sorted products to render ProductCard, ADDING the key prop
                                sortedProducts.map(product => (
                                    <ProductCard key={product._id} product={product} /> // <-- Key prop added here
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
