import { useState, useEffect, useCallback } from 'react';
import ProductCard from '../components/ProductCard';
import { useLanguage } from "../components/LanguageContext";
import { useLocation } from 'react-router-dom';
import { X, Loader2, AlertCircle, SlidersHorizontal, RefreshCcw, Info } from 'lucide-react';
import axios from 'axios';

const ShopPage = () => {
    const { t } = useLanguage();
    const location = useLocation();
    const [allProducts, setAllProducts] = useState([]);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [sortBy, setSortBy] = useState('popularity');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedSubCategory, setSelectedSubCategory] = useState('All Subcategories');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
    const [currentPrice, setCurrentPrice] = useState(1000);
    const [initialMaxPrice, setInitialMaxPrice] = useState(1000);
    const [selectedBrand, setSelectedBrand] = useState('All Brands');
    const [selectedOptions, setSelectedOptions] = useState({});
    
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [availableSubCategories, setAvailableSubCategories] = useState([]);
    const [availableOptionGroups, setAvailableOptionGroups] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFilterVisible, setIsFilterVisible] = useState(false);

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

        const uniqueBrands = ['All Brands', ...new Set(productsData.map(p => p.attributes?.brand).filter(Boolean))];
        setBrands(uniqueBrands);

        const allOptionGroups = {};
        productsData.forEach(product => {
            product.optionGroups?.forEach(group => {
                const groupName = group.name;
                if (!allOptionGroups[groupName]) {
                    allOptionGroups[groupName] = { name: groupName, values: new Set() };
                }
                group.values.forEach(val => allOptionGroups[groupName].values.add(val.value));
            });
        });

        const finalOptionGroups = Object.values(allOptionGroups).map(group => ({
            ...group,
            values: ['All', ...Array.from(group.values)]
        }));
        setAvailableOptionGroups(finalOptionGroups);
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setError(null);
            try {
                const searchTerm = searchParams.get('search');
                const productsPromise = axios.get(`${API_BASE_URL}/api/products${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`);
                const categoriesPromise = axios.get(`${API_BASE_URL}/api/categories`);
                
                const [productsRes, categoriesRes] = await Promise.all([productsPromise, categoriesPromise]);

                setAllProducts(productsRes.data);
                processProductsData(productsRes.data);
                
                setCategories([{ _id: 'All Categories', name: t('shopPage.allCategories', 'All Categories') }, ...categoriesRes.data]);

                if (categoryFromUrl) {
                    const categoryToSelect = categoriesRes.data.find(c => c.name === categoryFromUrl);
                    setSelectedCategory(categoryToSelect?._id || 'All Categories');
                }

            } catch (err) {
                setError(t('shopPage.errorFetchingProducts'));
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [location.search, t, categoryFromUrl, API_BASE_URL, processProductsData]);
    
    useEffect(() => {
        let filteredProducts = allProducts;
        if (selectedCategory !== 'All Categories') {
            filteredProducts = allProducts.filter(p => p.category?._id === selectedCategory);
        }
        
        const subCategories = ['All Subcategories', ...new Set(filteredProducts.map(p => p.subCategoryName).filter(Boolean))];
        setAvailableSubCategories(subCategories);

        if (!subCategories.includes(selectedSubCategory)) {
            setSelectedSubCategory('All Subcategories');
        }

    }, [allProducts, selectedCategory, selectedSubCategory]);

    const filterAndSortProducts = useCallback(() => {
        let filtered = [...allProducts];

        if (selectedCategory !== 'All Categories') {
            filtered = filtered.filter(p => p.category?._id === selectedCategory);
        }
        if (selectedSubCategory !== 'All Subcategories') {
            filtered = filtered.filter(p => p.subCategoryName === selectedSubCategory);
        }
        if (selectedBrand !== 'All Brands') {
            filtered = filtered.filter(p => p.attributes?.brand === selectedBrand);
        }
        
        filtered = filtered.filter(p => (p.basePrice || 0) <= currentPrice);
        
        Object.entries(selectedOptions).forEach(([groupName, value]) => {
            if (value && value !== 'All') {
                filtered = filtered.filter(p => 
                    p.variants.some(variant => 
                        variant.optionRefs.some(ref => {
                            const group = p.optionGroups.find(g => g._id.toString() === ref.group_id.toString());
                            const val = group?.values.find(v => v._id.toString() === ref.value_id.toString());
                            return group?.name === groupName && val?.value === value;
                        })
                    )
                );
            }
        });

        const sorted = [...filtered].sort((a, b) => {
            if (sortBy === 'price-asc') return (a.basePrice || 0) - (b.basePrice || 0);
            if (sortBy === 'price-desc') return (b.basePrice || 0) - (a.basePrice || 0);
            if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
            return 0;
        });

        setDisplayedProducts(sorted);
    }, [allProducts, selectedCategory, selectedSubCategory, selectedBrand, currentPrice, selectedOptions, sortBy]);

    useEffect(() => {
        filterAndSortProducts();
    }, [filterAndSortProducts]);

    const resetFilters = useCallback(() => {
        setSelectedCategory('All Categories');
        setSelectedSubCategory('All Subcategories');
        setCurrentPrice(initialMaxPrice);
        setSelectedBrand('All Brands');
        setSelectedOptions({});
        setSortBy('popularity');
    }, [initialMaxPrice]);

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 size={48} className="animate-spin text-blue-500" /></div>;
    if (error) return <div className="p-4 m-4 bg-red-100 text-red-700 rounded-lg"><AlertCircle className="inline mr-2" />{error}</div>;

    return (
        <section className="w-full bg-gray-50 py-12 px-4 md:px-8">
            <div className="mx-auto max-w-screen-xl">
                <div className="flex flex-col md:flex-row gap-8">
                    <aside className="w-full md:w-1/4 lg:w-1/5">
                        <div className="p-4 bg-white rounded-lg shadow-md space-y-6">
                            <div>
                                <h3 className="font-bold mb-2">{t('shopPage.filterByCategory')}</h3>
                                <ul className="space-y-1">
                                    {categories.map(cat => <li key={cat._id} onClick={() => setSelectedCategory(cat._id)} className={`cursor-pointer p-2 rounded ${selectedCategory === cat._id ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}>{cat.name}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold mb-2">{t('shopPage.filterBySubCategory')}</h3>
                                <select onChange={e => setSelectedSubCategory(e.target.value)} value={selectedSubCategory} className="w-full p-2 border rounded">
                                    {availableSubCategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                </select>
                            </div>
                            <div>
                                <h3 className="font-bold mb-2">{t('shopPage.priceRange')}</h3>
                                <input type="range" min={priceRange.min} max={priceRange.max} value={currentPrice} onChange={e => setCurrentPrice(Number(e.target.value))} className="w-full" />
                                <div className="flex justify-between text-sm"><span>{priceRange.min}</span><span>{currentPrice}</span></div>
                            </div>
                            <div>
                                <h3 className="font-bold mb-2">{t('shopPage.filterByBrand')}</h3>
                                <select onChange={e => setSelectedBrand(e.target.value)} value={selectedBrand} className="w-full p-2 border rounded">
                                    {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                                </select>
                            </div>
                            {availableOptionGroups.map(group => (
                                <div key={group.name}>
                                    <h3 className="font-bold mb-2">{group.name}</h3>
                                    <select onChange={e => setSelectedOptions(prev => ({...prev, [group.name]: e.target.value}))} value={selectedOptions[group.name] || 'All'} className="w-full p-2 border rounded">
                                        {group.values.map(val => <option key={val} value={val}>{val}</option>)}
                                    </select>
                                </div>
                            ))}
                            <button onClick={resetFilters} className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600"><RefreshCcw size={16} className="inline mr-2"/>{t('shopPage.resetFilters')}</button>
                        </div>
                    </aside>

                    <main className="w-full md:w-3/4 lg:w-4/5">
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-gray-600">{t('shopPage.showingItems')} {displayedProducts.length} {t('shopPage.items')}</p>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="p-2 border rounded">
                                <option value="popularity">{t('shopPage.popularity')}</option>
                                <option value="price-asc">{t('shopPage.priceLowToHigh')}</option>
                                <option value="price-desc">{t('shopPage.priceHighToLow')}</option>
                                <option value="name-asc">{t('shopPage.nameAZ')}</option>
                            </select>
                        </div>
                        {displayedProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {displayedProducts.map(product => <ProductCard key={product._id} product={product} />)}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-500"><Info size={48} className="mx-auto mb-4" /><p>{t('shopPage.noProductsFound')}</p></div>
                        )}
                    </main>
                </div>
            </div>
        </section>
    );
};

export default ShopPage;