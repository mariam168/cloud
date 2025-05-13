
import React, { useState, useEffect } from 'react'; 
import ProductCard from '../components/ProductCard'; 
import { Search } from 'lucide-react'; 
import { useLanguage } from "../components/LanguageContext"; 

const ShopPage = () => {
  const { t } = useLanguage(); 

  const [products, setProducts] = useState([
    { id: 1, image: 'https://via.placeholder.com/300x200?text=Watch', category: 'Watch', name: 'Xiaomi Mi Band 5', brand: 'Xiaomi', rating: 5, reviews: 50, price: 9552.00 },
    { id: 2, image: 'https://via.placeholder.com/300x200?text=Speaker', category: 'Speaker', name: 'Big Power Sound Speaker', brand: 'Big Power', rating: 5, reviews: 50, price: 13200.00 },
    { id: 3, image: 'https://via.placeholder.com/300x200?text=Camera', category: 'Camera', name: 'WiFi Security Camera', brand: 'HomeTech', rating: 5, reviews: 50, price: 19152.00 },
    { id: 4, image: 'https://via.placeholder.com/300x200?text=Phone', category: 'Phone', name: 'Smartphone X', brand: 'Apple', rating: 4.5, reviews: 30, price: 15000.00 },
    { id: 5, image: 'https://via.placeholder.com/300x200?text=Headphone', category: 'Headphone', name: 'Wireless Headphones', brand: 'Sony', rating: 4, reviews: 25, price: 2500.00 },
    { id: 6, image: 'https://via.placeholder.com/300x200?text=Laptop', category: 'Laptop', name: 'Gaming Laptop Pro', brand: 'Dell', rating: 5, reviews: 40, price: 35000.00 },
    { id: 7, image: 'https://via.placeholder.com/300x200?text=TV', category: 'TV', name: 'Smart TV 55 Inch', brand: 'Samsung', rating: 4.8, reviews: 60, price: 18000.00 },
    { id: 8, image: 'https://via.placeholder.com/300x200?text=Phone', category: 'Phone', name: 'iPhone 6x Plus', brand: 'Apple', rating: 5, reviews: 50, price: 19200.00 },
    { id: 9, image: 'https://via.placeholder.com/300x200?text=Headphone', category: 'Headphone', name: 'Wireless Headphones', brand: 'Bose', rating: 5, reviews: 50, price: 16800.00 },
    { id: 10, image: 'https://via.placeholder.com/300x200?text=Speaker', category: 'Speaker', name: 'Mini Bluetooth Speaker', brand: 'MiniSound', rating: 4, reviews: 240, price: 3360.00 },
    { id: 11, image: 'https://via.placeholder.com/300x200?text=TV', category: 'TV', name: '65" 4K TV', brand: 'Samsung', rating: 4.5, reviews: 100, price: 25000.00 },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popularity'); 
  const [selectedCategory, setSelectedCategory] = useState('All Categories'); 
  const [priceRange, setPriceRange] = useState({ min: 10, max: 10000 }); 
  const [selectedBrand, setSelectedBrand] = useState('All Brands');

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
  const brands = ['All Brands', ...new Set(products.map(p => p.brand))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
    const matchesBrand = selectedBrand === 'All Brands' || product.brand === selectedBrand;
    return matchesSearch && matchesCategory && matchesPrice && matchesBrand;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'popularity') return b.reviews - a.reviews;
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    return 0;
  });

  useEffect(() => {
    if (products.length > 0) {
      const minPrice = Math.min(...products.map(p => p.price));
      const maxPrice = Math.max(...products.map(p => p.price));
      setPriceRange({ min: minPrice, max: maxPrice });
    }
  }, [products]); 

  return (
    <section className="w-full bg-gray-50 py-8 px-4 transition-colors duration-300 dark:bg-gray-900 md:px-8 lg:px-12">
      <div className="mx-auto max-w-screen-xl">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
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
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t.allCategories || 'All Categories'}
              </h3>
              <ul>
                {categories.map(category => (
                  <li
                    key={category}
                    className={`cursor-pointer py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 ${selectedCategory === category ? 'font-bold text-blue-600 dark:text-blue-400' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {t[category] || category} ({products.filter(p => category === 'All Categories' || p.category === category).length})
                  </li>
                ))}
              </ul>
            </div>
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
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t.filterByBrand || 'Filter by Brand'}
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
                    {t[brand] || brand}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full md:w-3/4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.length === 0 ? (
                <div className="col-span-full text-center text-gray-600 dark:text-gray-400 py-12">
                  {t.noProductsFound || 'No products found matching your criteria.'}
                </div>
              ) : (
                sortedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
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
