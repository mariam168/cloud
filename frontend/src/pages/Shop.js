import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import { useLanguage } from "../components/LanguageContext";
import { useLocation, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, RefreshCcw, Info, ChevronDown } from 'lucide-react';
import axios from 'axios';

// Accordion component for filters
const FilterAccordion = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-200 py-4 dark:border-zinc-800">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="flex w-full items-center justify-between"
            >
                <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">{title}</p>
                <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] pt-4' : 'max-h-0'}`}>
                {children}
            </div>
        </div>
    );
};

// SubCategory List Item with Image on Hover
const SubCategoryItem = ({ subCategory, isSelected, onClick, serverUrl }) => (
    <li className="group relative">
        <button 
            onClick={onClick}
            className={`w-full text-left rounded-md p-2 text-sm font-medium transition-colors ${isSelected ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-gray-600 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'}`}
        >
            {subCategory.name}
        </button>
        {/* Image preview on hover */}
        {subCategory.imageUrl && (
            <div className="pointer-events-none absolute left-full top-1/2 z-20 ml-4 -translate-y-1/2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="h-28 w-28 overflow-hidden rounded-lg border bg-white shadow-xl dark:border-zinc-700">
                    <img 
                        src={`${serverUrl}${subCategory.imageUrl}`} 
                        alt={subCategory.name}
                        className="h-full w-full object-cover"
                    />
                </div>
            </div>
        )}
    </li>
);

// Custom Select component
const FilterSelect = ({ value, onChange, options }) => (
    <select 
        value={value} 
        onChange={onChange} 
        className="w-full cursor-pointer rounded-lg border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-700 shadow-sm transition-colors duration-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
    >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
);

const ShopPage = () => {
    // ... (All state and hooks remain the same)
    const { t, language } = useLanguage();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [allProducts, setAllProducts] = useState([]);
    const [advertisements, setAdvertisements] = useState([]);
    const [sortBy, setSortBy] = useState('popularity');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedSubCategory, setSelectedSubCategory] = useState('All');
    const [selectedBrand, setSelectedBrand] = useState('All');
    const [currentPrice, setCurrentPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(1000);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

    useEffect(() => {
        // ... (fetchInitialData remains the same)
        const fetchInitialData = async () => {
            setLoading(true);
            setError(null);
            try {
                const searchTermFromUrl = searchParams.get('search');
                const categoryFromUrl = searchParams.get('category');
                
                const productsPromise = axios.get(`${API_BASE_URL}/api/products${searchTermFromUrl ? `?search=${encodeURIComponent(searchTermFromUrl)}` : ''}`, { headers: { 'Accept-Language': language } });
                const categoriesPromise = axios.get(`${API_BASE_URL}/api/categories?populate=subCategories`, { headers: { 'Accept-Language': language } });
                const advertisementsPromise = axios.get(`${API_BASE_URL}/api/advertisements?isActive=true`, { headers: { 'Accept-Language': language } });

                const [productsRes, categoriesRes, advertisementsRes] = await Promise.all([
                    productsPromise,
                    categoriesPromise,
                    advertisementsPromise,
                ]);
                
                const productsData = productsRes.data;
                const categoriesData = categoriesRes.data;

                setAllProducts(productsData);
                setAdvertisements(advertisementsRes.data);
                
                setCategories([{ _id: 'All', name: t('shopPage.allCategories') }, ...categoriesData]);

                if (categoryFromUrl) {
                    const categoryToSelect = categoriesData.find(c => c.name === categoryFromUrl);
                    if (categoryToSelect) {
                        setSelectedCategory(categoryToSelect._id);
                    }
                }
                
                if (Array.isArray(productsData) && productsData.length > 0) {
                    const prices = productsData.map(p => p.basePrice || 0).filter(price => price > 0);
                    const calculatedMaxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 1000;
                    setMaxPrice(calculatedMaxPrice);
                    setCurrentPrice(calculatedMaxPrice);
                    
                    const uniqueBrands = ['All', ...new Set(productsData.map(p => p.brand?.name).filter(Boolean))];
                    setBrands(uniqueBrands);
                }

            } catch (err) {
                setError(t('shopPage.errorFetchingProducts'));
                console.error("Error fetching initial data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [location.search, t, language, API_BASE_URL]);

    useEffect(() => {
        if (selectedCategory === 'All') {
            setSubCategories([]);
        } else {
            const currentCategory = categories.find(c => c._id === selectedCategory);
            // Add "All" option to the beginning of the subcategories list
            const subs = currentCategory?.subCategories || [];
            setSubCategories([{_id: 'All', name: t('shopPage.allSubCategories')}, ...subs]);
        }
        setSelectedSubCategory('All');
    }, [selectedCategory, categories, t]);

    const displayedProducts = useMemo(() => {
        // ... (Filtering logic remains the same)
        let enrichedProducts = allProducts.map(p => {
            const associatedAd = advertisements.find(ad => (ad.productRef?._id || ad.productRef) === p._id);
            const displayPrice = associatedAd ? associatedAd.discountedPrice : p.basePrice;
            return { ...p, advertisement: associatedAd || null, displayPrice };
        });

        let filtered = enrichedProducts
            .filter(p => selectedCategory === 'All' || p.category?._id === selectedCategory)
            .filter(p => selectedSubCategory === 'All' || p.subCategory?._id === selectedSubCategory)
            .filter(p => selectedBrand === 'All' || p.brand?.name === selectedBrand)
            .filter(p => (p.displayPrice || 0) <= currentPrice);
        
        filtered.sort((a, b) => {
            if (sortBy === 'price-asc') return (a.displayPrice || 0) - (b.displayPrice || 0);
            if (sortBy === 'price-desc') return (b.displayPrice || 0) - (a.displayPrice || 0);
            if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
            const isAAdvertised = !!a.advertisement;
            const isBAdvertised = !!b.advertisement;
            if (isAAdvertised !== isBAdvertised) return isAAdvertised ? -1 : 1;
            return (b.soldCount || 0) - (a.soldCount || 0);
        });

        return filtered;
    }, [allProducts, advertisements, selectedCategory, selectedSubCategory, selectedBrand, currentPrice, sortBy]);

    const resetFilters = useCallback(() => {
        setSelectedCategory('All');
        setSelectedSubCategory('All');
        setSelectedBrand('All');
        setCurrentPrice(maxPrice);
        setSortBy('popularity');
    }, [maxPrice]);
    
    // ... (Loading and Error states remain the same)
    if (loading) return <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-black"><Loader2 size={48} className="animate-spin text-indigo-500" /></div>;
    if (error) return <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-black p-4"><div className="text-center text-red-700 dark:text-red-400 p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-500/30 flex flex-col items-center gap-4"><AlertCircle size={40} /><p className="font-semibold text-xl">{t('general.error')}</p><p className="text-base">{error}</p></div></div>;
    
    return (
        <section className="w-full bg-gray-100 dark:bg-black">
            <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                <header className="text-center mb-12">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">{t('shopPage.title')}</h1>
                    <p className="mx-auto mt-4 max-w-xl text-gray-600 dark:text-zinc-400">{t('shopPage.subtitle')}</p>
                </header>

                <div className="flex flex-col gap-8 lg:flex-row">
                    <aside className="w-full lg:w-1/4">
                        <div className="sticky top-24 space-y-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex items-center justify-between pb-4">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('shopPage.filters')}</h2>
                                <button onClick={resetFilters} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors">
                                    <RefreshCcw size={14} />{t('shopPage.resetFilters')}
                                </button>
                            </div>
                            
                            <FilterAccordion title={t('shopPage.filterByCategory')} defaultOpen={true}>
                                <ul className="space-y-1">
                                    {categories.map(cat => (
                                        <li key={cat._id}><button onClick={() => setSelectedCategory(cat._id)} className={`w-full text-left rounded-md p-2 text-sm font-medium transition-colors ${selectedCategory === cat._id ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-gray-600 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'}`}>{cat.name}</button></li>
                                    ))}
                                </ul>
                            </FilterAccordion>

                            {/* New SubCategory filter with image on hover */}
                            {subCategories.length > 1 && (
                                <FilterAccordion title={t('shopPage.filterBySubCategory')} defaultOpen={true}>
                                    <ul className="space-y-1">
                                        {subCategories.map(sub => (
                                            <SubCategoryItem 
                                                key={sub._id}
                                                subCategory={sub}
                                                isSelected={selectedSubCategory === sub._id}
                                                onClick={() => setSelectedSubCategory(sub._id)}
                                                serverUrl={API_BASE_URL}
                                            />
                                        ))}
                                    </ul>
                                </FilterAccordion>
                            )}
                            
                            <FilterAccordion title={t('shopPage.priceRange')}>
                                <input type="range" min={0} max={maxPrice} value={currentPrice} onChange={e => setCurrentPrice(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700 accent-indigo-600" />
                                <div className="flex justify-between text-xs text-gray-500 dark:text-zinc-400 mt-2"><span>{0}</span><span>{currentPrice}</span></div>
                            </FilterAccordion>
                            
                            <FilterAccordion title={t('shopPage.filterByBrand')}>
                                <FilterSelect value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} options={brands.map(b => ({ value: b, label: b === 'All' ? t('shopPage.allBrands') : b }))} />
                            </FilterAccordion>
                        </div>
                    </aside>

                    <main className="w-full lg:w-3/4">
                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-sm text-gray-600 dark:text-zinc-400">{t('shopPage.showingItems', { count: displayedProducts.length })}</p>
                            <div className="w-48"><FilterSelect value={sortBy} onChange={e => setSortBy(e.target.value)} options={[{ value: 'popularity', label: t('shopPage.popularity') }, { value: 'price-asc', label: t('shopPage.priceLowToHigh') }, { value: 'price-desc', label: t('shopPage.priceHighToLow') }, { value: 'name-asc', label: t('shopPage.nameAZ') }]} /></div>
                        </div>

                        {displayedProducts.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                                {displayedProducts.map(product => <ProductCard key={product._id} product={product} advertisement={product.advertisement} />)}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-zinc-700 p-12 text-center h-full min-h-[400px]">
                                <Info size={48} className="mx-auto mb-4 text-gray-400 dark:text-zinc-500" />
                                <p className="text-lg font-semibold text-gray-700 dark:text-zinc-300">{t('shopPage.noProductsFoundTitle')}</p>
                                <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">{t('shopPage.noProductsFoundSubtitle')}</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </section>
    );
};

export default ShopPage;