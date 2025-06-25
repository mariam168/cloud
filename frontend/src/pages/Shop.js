import { useState, useEffect, useCallback } from 'react';
import ProductCard from '../components/ProductCard';
import { useLanguage } from "../components/LanguageContext";
import { useLocation } from 'react-router-dom';
import { Loader2, AlertCircle, SlidersHorizontal, RefreshCcw, Info } from 'lucide-react';
import axios from 'axios';

const ShopPage = () => {
    const { t } = useLanguage();
    const location = useLocation();
    const [allProducts, setAllProducts] = useState([]);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [advertisements, setAdvertisements] = useState([]);
    
    const [sortBy, setSortBy] = useState('popularity');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedSubCategory, setSelectedSubCategory] = useState('All Subcategories');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
    const [currentPrice, setCurrentPrice] = useState(1000);
    const [initialMaxPrice, setInitialMaxPrice] = useState(1000);
    const [selectedBrand, setSelectedBrand] = useState('All Brands');
    
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [availableSubCategories, setAvailableSubCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const searchParams = new URLSearchParams(location.search);
    const categoryFromUrl = searchParams.get('category');
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

    const processProductsData = useCallback((productsData) => {
        if (!Array.isArray(productsData) || productsData.length === 0) return;
        const prices = productsData.map(p => p.basePrice || 0).filter(price => price > 0);
        if (prices.length > 0) {
            const maxPrice = Math.ceil(Math.max(...prices));
            setPriceRange({ min: 0, max: maxPrice });
            setCurrentPrice(maxPrice);
            setInitialMaxPrice(maxPrice);
        }
        const uniqueBrands = ['All Brands', ...new Set(productsData.flatMap(p => p.attributes?.brand).filter(Boolean))];
        setBrands(uniqueBrands);
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setError(null);
            try {
                const searchTerm = searchParams.get('search');
                const productsPromise = axios.get(`${API_BASE_URL}/api/products${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`);
                const categoriesPromise = axios.get(`${API_BASE_URL}/api/categories`);
                const advertisementsPromise = axios.get(`${API_BASE_URL}/api/advertisements?isActive=true`);

                const [productsRes, categoriesRes, advertisementsRes] = await Promise.all([
                    productsPromise,
                    categoriesPromise,
                    advertisementsPromise,
                ]);

                setAllProducts(productsRes.data);
                processProductsData(productsRes.data);
                setAdvertisements(advertisementsRes.data);

                setCategories([{ _id: 'All Categories', name: t('shopPage.allCategories') }, ...categoriesRes.data]);

                if (categoryFromUrl) {
                    const categoryToSelect = categoriesRes.data.find(c => c.name === categoryFromUrl);
                    setSelectedCategory(categoryToSelect?._id || 'All Categories');
                }

            } catch (err) {
                setError(t('shopPage.errorFetchingProducts'));
                console.error("Error fetching initial data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [location.search, t, categoryFromUrl, API_BASE_URL, processProductsData]);
    
    useEffect(() => {
        let filtered = [...allProducts];
        if (selectedCategory !== 'All Categories') {
            filtered = filtered.filter(p => p.category?._id === selectedCategory);
        }
        
        const subCategories = ['All Subcategories', ...new Set(filtered.map(p => p.subCategoryName).filter(Boolean))];
        setAvailableSubCategories(subCategories);

        if (!subCategories.includes(selectedSubCategory)) {
            setSelectedSubCategory('All Subcategories');
        }
    }, [allProducts, selectedCategory, selectedSubCategory]);

    const filterAndSortProducts = useCallback(() => {
        let enrichedProducts = allProducts.map(p => {
            const associatedAd = advertisements.find(ad => (ad.productRef?._id || ad.productRef) === p._id);
            return {
                ...p,
                advertisement: associatedAd || null
            };
        });

        let filtered = enrichedProducts;

        if (selectedCategory !== 'All Categories') {
            filtered = filtered.filter(p => p.category?._id === selectedCategory);
        }
        if (selectedSubCategory !== 'All Subcategories') {
            filtered = filtered.filter(p => p.subCategoryName === selectedSubCategory);
        }
        if (selectedBrand !== 'All Brands') {
             filtered = filtered.filter(p => (p.attributes || []).some(attr => attr.key_en === 'brand' && attr.value_en === selectedBrand));
        }
        
        filtered = filtered.filter(p => (p.basePrice || 0) <= currentPrice);
        
        filtered.sort((a, b) => {
            const isAAdvertised = !!a.advertisement;
            const isBAdvertised = !!b.advertisement;

            if (isAAdvertised && !isBAdvertised) return -1;
            if (!isAAdvertised && isBAdvertised) return 1;

            if (sortBy === 'price-asc') return (a.basePrice || 0) - (b.basePrice || 0);
            if (sortBy === 'price-desc') return (b.basePrice || 0) - (a.basePrice || 0);
            if (sortBy === 'name-asc') {
                const nameA = a.name || '';
                const nameB = b.name || '';
                return nameA.localeCompare(nameB);
            }
            
            return 0;
        });

        setDisplayedProducts(filtered);
    }, [allProducts, advertisements, selectedCategory, selectedSubCategory, selectedBrand, currentPrice, sortBy]);

    useEffect(() => {
        filterAndSortProducts();
    }, [filterAndSortProducts]);

    const resetFilters = useCallback(() => {
        setSelectedCategory('All Categories');
        setSelectedSubCategory('All Subcategories');
        setCurrentPrice(initialMaxPrice);
        setSelectedBrand('All Brands');
        setSortBy('popularity');
    }, [initialMaxPrice]);

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 size={48} className="animate-spin text-blue-500" /></div>;
    if (error) return <div className="p-4 m-4 bg-red-100 text-red-700 rounded-lg"><AlertCircle className="inline mr-2" />{error}</div>;

    return (
        <section className="w-full bg-gray-50 dark:bg-gray-900 py-12 px-4 md:px-8">
            <div className="mx-auto max-w-screen-xl">
                <div className="flex flex-col md:flex-row gap-8">
                    <aside className="w-full md:w-1/4 lg:w-1/5">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-6">
                           <div>
                                <h3 className="font-bold mb-2 text-gray-800 dark:text-gray-200">{t('shopPage.filterByCategory')}</h3>
                                <ul className="space-y-1">
                                    {categories.map(cat => (
                                        <li 
                                            key={cat._id} 
                                            onClick={() => setSelectedCategory(cat._id)} 
                                            className={`cursor-pointer p-2 rounded text-gray-700 dark:text-gray-300 ${selectedCategory === cat._id ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                        >
                                            {cat.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold mb-2 text-gray-800 dark:text-gray-200">{t('shopPage.filterBySubCategory')}</h3>
                                <select onChange={e => setSelectedSubCategory(e.target.value)} value={selectedSubCategory} className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600">
                                    {availableSubCategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                </select>
                            </div>
                            <div>
                                <h3 className="font-bold mb-2 text-gray-800 dark:text-gray-200">{t('shopPage.priceRange')}</h3>
                                <input type="range" min={priceRange.min} max={priceRange.max} value={currentPrice} onChange={e => setCurrentPrice(Number(e.target.value))} className="w-full" />
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400"><span>{priceRange.min}</span><span>{currentPrice}</span></div>
                            </div>
                            <div>
                                <h3 className="font-bold mb-2 text-gray-800 dark:text-gray-200">{t('shopPage.filterByBrand')}</h3>
                                <select onChange={e => setSelectedBrand(e.target.value)} value={selectedBrand} className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600">
                                    {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                                </select>
                            </div>
                            <button onClick={resetFilters} className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600"><RefreshCcw size={16} className="inline mr-2"/>{t('shopPage.resetFilters')}</button>
                        </div>
                    </aside>

                    <main className="w-full md:w-3/4 lg:w-4/5">
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-gray-600 dark:text-gray-400">{t('shopPage.showingItems')} {displayedProducts.length} {t('shopPage.items')}</p>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600">
                                <option value="popularity">{t('shopPage.popularity')}</option>
                                <option value="price-asc">{t('shopPage.priceLowToHigh')}</option>
                                <option value="price-desc">{t('shopPage.priceHighToLow')}</option>
                                <option value="name-asc">{t('shopPage.nameAZ')}</option>
                            </select>
                        </div>
                        {displayedProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {displayedProducts.map(product => (
                                    <ProductCard 
                                        key={product._id} 
                                        product={product} 
                                        advertisement={product.advertisement}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-500">
                                <Info size={48} className="mx-auto mb-4" />
                                <p>{t('shopPage.noProductsFound')}</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </section>
    );
};

export default ShopPage;