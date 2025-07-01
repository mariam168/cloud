import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ProductCard from '../components/ProductCard'; 
import { useLanguage } from "../components/LanguageContext";
import { useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, RefreshCcw, Info, ChevronDown, Filter, X, LayoutGrid } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
const FilterAccordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 py-4 dark:border-zinc-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between group"
      >
        <p className="text-sm font-medium text-gray-700 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">{title}</p>
        <ChevronDown
          size={18}
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500' : 'text-gray-500 group-hover:text-indigo-500'} dark:text-zinc-400 dark:group-hover:text-indigo-400`}
        />
        </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] pt-4' : 'max-h-0'}`} >
        {children}
      </div>
    </div>
  );
};

const FilterSelect = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={onChange}
    className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-700 shadow-sm transition-all duration-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 hover:border-gray-300 dark:hover:border-zinc-600"
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

const ShopPage = () => {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [advertisements, setAdvertisements] = useState([]);
  const [sortBy, setSortBy] = useState('popularity');
  const [selectedCategory, setSelectedCategory] = useState('All'); 
  const [currentPrice, setCurrentPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const searchTermFromUrl = searchParams.get('search') || '';
      const productsUrl = `${API_BASE_URL}/api/products?search=${encodeURIComponent(searchTermFromUrl)}`;
      const productsPromise = axios.get(productsUrl, { headers: { 'Accept-Language': language } });
      const categoriesPromise = axios.get(`${API_BASE_URL}/api/categories`, { headers: { 'Accept-Language': language } });
      const advertisementsPromise = axios.get(`${API_BASE_URL}/api/advertisements?isActive=true`, { headers: { 'Accept-Language': language } });
      const [productsRes, categoriesRes, advertisementsRes] = await Promise.all([productsPromise, categoriesPromise, advertisementsPromise]);      
      const productsData = productsRes.data;
      const categoriesData = categoriesRes.data;
      setAllProducts(productsData);
      setAdvertisements(advertisementsRes.data);
      setCategories([{ _id: 'All', name: t('shopPage.allCategories') }, ...categoriesData]);
      if (Array.isArray(productsData) && productsData.length > 0) {
        const prices = productsData.map((p) => p.basePrice || 0).filter((price) => price > 0);
        const calculatedMaxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 1000;
        setMaxPrice(calculatedMaxPrice);
        setCurrentPrice(calculatedMaxPrice);
      } else {
         setMaxPrice(1000);
         setCurrentPrice(1000);
      }
    } catch (err) {
      console.error("Error fetching initial data:", err);
      setError(t('shopPage.errorFetchingProducts'));
    } finally {
      setLoading(false);
    }
  }, [t, language, searchParams]);
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);
  const displayedProducts = useMemo(() => {
    let enrichedProducts = allProducts.map((p) => {
      const associatedAd = advertisements.find((ad) => (ad.productRef?._id || ad.productRef) === p._id);
      const displayPrice = associatedAd ? associatedAd.discountedPrice : p.basePrice;
      const localizedProductName = p.name?.[language] || p.name?.en || '';
      return { ...p, advertisement: associatedAd || null, displayPrice, localizedProductName };
    });

    return enrichedProducts
      .filter((p) => selectedCategory === 'All' || p.category?._id === selectedCategory)
      .filter((p) => (p.displayPrice || 0) <= currentPrice)
      .sort((a, b) => {
        if (sortBy === 'price-asc') return (a.displayPrice || 0) - (b.displayPrice || 0);
        if (sortBy === 'price-desc') return (b.displayPrice || 0) - (a.displayPrice || 0);
        if (sortBy === 'name-asc') return a.localizedProductName.localeCompare(b.localizedProductName);
        const isAAdvertised = !!a.advertisement;
        const isBAdvertised = !!b.advertisement;
        if (isAAdvertised !== isBAdvertised) return isAAdvertised ? -1 : 1;
        return (b.soldCount || 0) - (a.soldCount || 0);
      });
  }, [allProducts, advertisements, selectedCategory, currentPrice, sortBy, language]);  
  const resetFilters = useCallback(() => {
    setSelectedCategory('All');
    const prices = allProducts.map((p) => p.basePrice || 0).filter((price) => price > 0);
    const calculatedMaxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 1000;
    setMaxPrice(calculatedMaxPrice);
    setCurrentPrice(calculatedMaxPrice);
    setSortBy('popularity');
  }, [allProducts]);

  const formatPriceForRange = (price) => {
    const locale = language === 'ar' ? 'ar-EG' : 'en-US';
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'EGP',
            minimumFractionDigits: 0, 
        }).format(Number(price));
    } catch (error) {
        return `${price} EGP`;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <Loader2 size={48} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-black p-4">
        <div className="text-center text-red-700 dark:text-red-400 p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-500/30 flex flex-col items-center gap-4">
          <AlertCircle size={40} />
          <p className="font-semibold text-xl">{t('general.error')}</p>
          <p className="text-base">{error}</p>
          <button
            onClick={fetchInitialData}
            className="mt-4 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-200"
          >
            <RefreshCcw size={16} />
            {t('general.retry')}
          </button>
        </div>
      </div>
    );
}
  return (
    <section className="w-full bg-gray-50 dark:bg-zinc-950 min-h-screen">
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl lg:text-6xl leading-tight">
            {t('shopPage.title')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-zinc-400 leading-relaxed">
            {t('shopPage.subtitle')}
          </p>
        </header>
        {categories.length > 1 && (
          <div className="mb-10 flex flex-nowrap overflow-x-auto justify-start sm:justify-center gap-4 sm:gap-6 pb-4 scrollbar-hide">
            {categories.map((cat) => {
                const displayName = typeof cat.name === 'object' 
                  ? (cat.name?.[language] || cat.name?.en) 
                  : cat.name;
                const imageUrl = cat.imageUrl;
                const isActive = selectedCategory === cat._id;
                return (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat._id)}
                    className={`
                      flex-shrink-0 flex flex-col items-center justify-center rounded-3xl p-4 sm:p-5
                      transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl
                      focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-700
                      ${isActive
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-lg'
                        : 'bg-white text-gray-800 hover:bg-indigo-50 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700'
                      }
                    `}
                  >
                    {imageUrl ? (
                      <img
                        src={`${API_BASE_URL}${imageUrl}`}
                        alt={displayName}
                        className={`
                          h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover border-3
                          ${isActive
                            ? 'border-white ring-2 ring-indigo-300 dark:ring-indigo-700'
                            : 'border-gray-300 dark:border-zinc-600'}
                          transition-transform hover:scale-105 duration-200
                        `}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <LayoutGrid size={24} className={`
                           mb-3 h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center rounded-full
                           ${isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300'}
                        `}/>
                    )}
                    <span className={`mt-3 text-sm sm:text-base font-semibold tracking-wide text-center ${!imageUrl ? 'mt-0' : ''}`}>{displayName}</span>
                  </button>
                );
            })}
          </div>
        )}
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="hidden lg:block lg:w-1/4">
            <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-zinc-800 mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('shopPage.filters')}</h2>
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-500 transition-colors duration-200">
                    <RefreshCcw size={16} />
                    {t('shopPage.resetFilters')}
                  </button>
                </div>
                <FilterAccordion title={t('shopPage.priceRange')} defaultOpen={true}>
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    value={currentPrice}
                    onChange={(e) => setCurrentPrice(Number(e.target.value))}
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700 accent-indigo-600 dark:accent-indigo-500"
                  />
                  <div className="mt-2 flex justify-between text-xs text-gray-600 dark:text-zinc-400 font-medium">
                    <span>{formatPriceForRange(0)}</span>
                    <span>{formatPriceForRange(currentPrice)}</span>
                  </div>
                </FilterAccordion>
              </div>
            </div>
          </aside>
          <main className="w-full lg:w-3/4">
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors duration-200 lg:hidden shadow-sm"
              >
                <Filter size={18} />
                {t('shopPage.filters')}
              </button>
              <p className="hidden sm:block text-base text-gray-600 dark:text-zinc-400 flex-grow">
                {t('shopPage.showingItems', { count: displayedProducts.length })}
              </p>
              <div className="w-full sm:w-auto flex-shrink-0">
                <FilterSelect
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  options={[
                    { value: 'popularity', label: t('shopPage.popularity') },
                    { value: 'price-asc', label: t('shopPage.priceLowToHigh') },
                    { value: 'price-desc', label: t('shopPage.priceHighToLow') },
                    { value: 'name-asc', label: t('shopPage.nameAZ') },
                  ]}
                />
              </div>
            </div>
            {displayedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedProducts.map((product) => (
                  <ProductCard key={product._id} product={product} advertisement={product.advertisement} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center h-full min-h-[400px] dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-inner">
                <Info size={56} className="mx-auto mb-6 text-gray-400 dark:text-zinc-500" />
                <p className="text-xl font-bold text-gray-800 dark:text-zinc-200 mb-2">{t('shopPage.noProductsFoundTitle')}</p>
                <p className="mt-1 text-base text-gray-600 dark:text-zinc-400 max-w-md">
                  {t('shopPage.noProductsFoundSubtitle')}
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-6 flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-200"
                >
                  <RefreshCcw size={18} />
                  {t('shopPage.resetFilters')}
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 lg:hidden ${isFilterOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)}></div>
        <div className={`fixed top-0 h-full w-4/5 max-w-sm bg-white dark:bg-zinc-900 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${language === 'ar' ? 'right-0' : 'left-0'} ${isFilterOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full' : '-translate-x-full')}`} >
          <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-zinc-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('shopPage.filters')}</h2>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors duration-200"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-grow overflow-y-auto p-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('shopPage.filters')}</h2>
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400"
                >
                  <RefreshCcw size={14} />
                  {t('shopPage.resetFilters')}
                </button>
              </div>
              
              <FilterAccordion title={t('shopPage.priceRange')} defaultOpen={true}>
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-gray-200 cursor-pointer dark:bg-zinc-700 accent-indigo-600"
                />
                <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-zinc-400">
                  <span>{formatPriceForRange(0)}</span>
                  <span>{formatPriceForRange(currentPrice)}</span>
                </div>
              </FilterAccordion>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopPage;