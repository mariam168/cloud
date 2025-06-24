import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Minus, ShoppingCart, Heart, Loader2, Award, Info, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../components/LanguageContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../components/ToastNotification';

const colorMap = {
    'black': '#000000', 'white': '#FFFFFF', 'red': '#FF0000', 'blue': '#0000FF',
    'green': '#008000', 'silver': '#C0C0C0', 'gold': '#FFD700', 'rose gold': '#B76E79',
    'navy blue': '#000080', 'charcoal gray': '#36454F', 'washed black': '#222222',
    'cream': '#FFFDD0', 'pine green': '#01796F', 'stone': '#877F7D'
};

const ProductDetails = () => {
    const { id } = useParams();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const { API_BASE_URL, isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [mainDisplayImage, setMainDisplayImage] = useState('');
    const [selectedOptions, setSelectedOptions] = useState({});
    const [selectedSku, setSelectedSku] = useState(null);
    const { addToCart, loadingCart } = useCart();
    const { toggleFavorite, isFavorite } = useWishlist();

    useEffect(() => {
        const fetchProductDetails = async () => {
            setLoading(true);
            setError(null);
            const axiosConfig = { headers: { 'accept-language': language } };
            try {
                const res = await axios.get(`${API_BASE_URL}/api/products/${id}`, axiosConfig);
                setProduct(res.data);
                setMainDisplayImage(res.data.mainImage || '');
            } catch (err) {
                console.error("Failed to load product details:", err);
                setError(t('productDetailsPage.failedToLoad'));
            } finally {
                setLoading(false);
            }
        };
        fetchProductDetails();
    }, [id, API_BASE_URL, t, language]);

    const variations = product?.variations || [];

    const handleOptionSelect = (variationId, option) => {
        const newSelectedOptions = { ...selectedOptions, [variationId]: option._id };
        setSelectedOptions(newSelectedOptions);
        if (option.image) setMainDisplayImage(option.image);
        if (option.skus && option.skus.length === 1) {
            setSelectedSku(option.skus[0]);
        } else {
            setSelectedSku(null);
        }
    };

    const isOptionSelected = (variationId, optionId) => selectedOptions[variationId] === optionId;

    const priceInfo = useMemo(() => {
        const basePrice = selectedSku?.price ?? product?.basePrice ?? 0;
        if (product?.advertisement && product.advertisement.discountedPrice != null) {
            const adOriginalPrice = product.advertisement.originalPrice ?? basePrice;
            const percentage = adOriginalPrice > 0 && adOriginalPrice > product.advertisement.discountedPrice
                ? Math.round(((adOriginalPrice - product.advertisement.discountedPrice) / adOriginalPrice) * 100)
                : 0;
            return { finalPrice: product.advertisement.discountedPrice, originalPrice: adOriginalPrice, discountPercentage: percentage };
        }
        return { finalPrice: basePrice, originalPrice: null, discountPercentage: 0 };
    }, [selectedSku, product]);
    
    const formatPrice = useCallback((price) => {
        if (price == null) return t('general.priceNotAvailable');
        const currencyCode = product?.advertisement?.currency || 'SAR';
        return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', { style: 'currency', currency: currencyCode }).format(Number(price));
    }, [language, t, product]);

    const handleAddToCart = useCallback(() => {
        if (!isAuthenticated) {
            showToast(t('cart.loginRequired'), 'info');
            navigate('/login');
            return;
        }

        const allVariationsSelected = variations.length === 0 || Object.keys(selectedOptions).length === variations.length;
        if (!allVariationsSelected) {
            showToast(t('productDetailsPage.selectAllOptions'), 'warning');
            return;
        }

        let skuToAdd = selectedSku;
        if (!skuToAdd && variations.length > 0) {
            const lastVariationId = variations[variations.length - 1]?._id;
            const lastSelectedOptionId = selectedOptions[lastVariationId];
            const lastSelectedOption = variations.flatMap(v => v.options).find(o => o._id === lastSelectedOptionId);
            if (lastSelectedOption?.skus?.length === 1) {
                skuToAdd = lastSelectedOption.skus[0];
            }
        }
        
        if (variations.length > 0 && !skuToAdd) {
            showToast(t('productDetailsPage.selectSku'), 'warning');
            return;
        }
        
        addToCart(product, quantity, skuToAdd?._id);
    }, [isAuthenticated, product, quantity, selectedSku, selectedOptions, variations, addToCart, navigate, t, showToast]);
    
    const isAddToCartDisabled = useMemo(() => {
        if (loadingCart) return true;
        if (variations.length === 0) return product?.stock === 0;

        const allVariationsSelected = Object.keys(selectedOptions).length === variations.length;
        if (!allVariationsSelected) return true;

        if (selectedSku) return selectedSku.stock === 0;

        const lastSelectedOptionId = selectedOptions[variations[variations.length - 1]?._id];
        const lastOption = variations.flatMap(v => v.options).find(o => o._id === lastSelectedOptionId);
        if (lastOption && lastOption.skus.length > 1) return true;
        if (lastOption && lastOption.skus.length === 1) return lastOption.skus[0].stock === 0;

        return false;
    }, [loadingCart, variations, selectedOptions, selectedSku, product]);

    const productIsFavorite = product ? isFavorite(product._id) : false;
    
    const allImages = useMemo(() => {
        if (!product) return [];
        const images = new Map();
        if (product.mainImage) images.set(product.mainImage, product.mainImage);
        product.variations?.forEach(v => v.options.forEach(o => {
            if (o.image && !images.has(o.image)) images.set(o.image, o.image);
        }));
        return Array.from(images.values());
    }, [product]);

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 size={48} className="animate-spin text-blue-500" /></div>;
    if (error) return <div className="p-4 m-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;
    if (!product) return <div className="text-center p-16">{t('productDetailsPage.notFound')}</div>;

    return (
        <div className="bg-white dark:bg-gray-900">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="lg:sticky lg:top-24 self-start">
                        <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden mb-4 border dark:border-gray-700 relative">
                            {priceInfo.discountPercentage > 0 && (
                                <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-lg font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                                    <Award size={20} />
                                    <span>{priceInfo.discountPercentage}% {t('general.off')}</span>
                                </div>
                            )}
                            <img src={`${API_BASE_URL}${mainDisplayImage}`} alt={product.name} className="w-full h-full object-contain transition-opacity duration-300 p-4" />
                        </div>
                         {allImages.length > 1 && (
                            <div className="flex justify-center space-x-2">
                                {allImages.map(imgUrl => (
                                    <div key={imgUrl} className={`flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md cursor-pointer border-2 transition-all ${mainDisplayImage === imgUrl ? 'border-blue-500' : 'border-transparent hover:border-gray-300'}`}
                                         onClick={() => setMainDisplayImage(imgUrl)}>
                                        <img src={`${API_BASE_URL}${imgUrl}`} alt="thumbnail" className="w-full h-full object-cover rounded-sm"/>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col space-y-8">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">{product.category?.name}</p>
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mt-2">{product.name}</h1>
                        </div>
                        <div className="flex items-baseline gap-4">
                            <p className="text-4xl font-bold text-gray-800 dark:text-white">{formatPrice(priceInfo.finalPrice)}</p>
                            {priceInfo.originalPrice && priceInfo.originalPrice !== priceInfo.finalPrice && (
                                <p className="text-2xl font-medium text-gray-400 dark:text-gray-500 line-through">{formatPrice(priceInfo.originalPrice)}</p>
                            )}
                        </div>
                        <div className="space-y-6">
                            {variations.map((variation) => (
                                <div key={variation._id}>
                                    <h3 className="font-semibold mb-3 text-lg text-gray-800 dark:text-gray-200">{variation.name}</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {variation.options.map((option) => {
                                            const colorName = option.name || '';
                                            const variationName = variation.name || '';
                                            return (
                                                <button 
                                                    key={option._id}
                                                    onClick={() => handleOptionSelect(variation._id, option)}
                                                    className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg transition-all duration-200 ${isOptionSelected(variation._id, option._id) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}
                                                >
                                                    {(variationName).toLowerCase() === 'color' && (
                                                        <span style={{ backgroundColor: colorMap[colorName.toLowerCase()] || '#ccc' }} className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-500"></span>
                                                    )}
                                                    <span className="font-semibold">{option.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {isOptionSelected(variation._id, selectedOptions[variation._id]) &&
                                     variation.options.find(o => o._id === selectedOptions[variation._id])?.skus.length > 1 && (
                                        <div className="mt-4 pl-2">
                                            <h4 className="text-md font-semibold text-gray-600 dark:text-gray-400 mb-2">{t('productDetailsPage.selectSkuForOption', { optionName: variation.options.find(o => o._id === selectedOptions[variation._id])?.name })}</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {variation.options.find(o => o._id === selectedOptions[variation._id]).skus.map(sku => (
                                                    <button
                                                        key={sku._id}
                                                        onClick={() => setSelectedSku(sku)}
                                                        className={`px-3 py-1.5 border rounded-md text-sm transition-colors ${selectedSku?._id === sku._id ? 'bg-gray-900 text-white border-gray-900 dark:bg-blue-500 dark:border-blue-500' : 'bg-white dark:bg-gray-800 dark:border-gray-600 hover:border-gray-400'}`}
                                                    >
                                                        {sku.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {variations.length > 0 && Object.keys(selectedOptions).length !== variations.length && (
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-lg flex items-center gap-2 text-sm">
                                <Info size={16}/>
                                <span>{t('productDetailsPage.selectAllOptions')}</span>
                            </div>
                        )}
                        <div className="pt-6 border-t dark:border-gray-700">
                             <div className="flex items-center gap-4">
                                <div className="flex items-center border dark:border-gray-600 rounded-lg p-1">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"><Minus size={16}/></button>
                                    <span className="px-5 font-bold text-lg w-12 text-center text-gray-800 dark:text-white">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"><Plus size={16}/></button>
                                </div>
                                <button onClick={handleAddToCart} disabled={isAddToCartDisabled} className="flex-1 bg-gray-900 text-white p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg transition-colors dark:bg-blue-600 dark:hover:bg-blue-700">
                                    {loadingCart ? <Loader2 className="animate-spin"/> : <ShoppingCart />}
                                    {t('productDetails.addToCart')}
                                </button>
                                <button onClick={() => toggleFavorite(product)} className={`p-3 border dark:border-gray-600 rounded-lg ${productIsFavorite ? 'bg-red-100 dark:bg-red-900/30 text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                    <Heart fill={productIsFavorite ? 'currentColor' : 'none'}/>
                                </button>
                            </div>
                            {selectedSku && selectedSku.stock !== undefined && (
                                <p className={`mt-3 text-sm font-semibold ${selectedSku.stock > 5 ? 'text-green-600' : (selectedSku.stock > 0 ? 'text-orange-600' : 'text-red-600')}`}>
                                    {selectedSku.stock > 0 ? `${selectedSku.stock} ${t('productDetails.inStock')}` : t('productDetails.outOfStock')}
                                </p>
                            )}
                        </div>
                        <div className="pt-6 border-t dark:border-gray-700">
                            <h3 className="font-bold mb-3 text-xl text-gray-800 dark:text-white">{t('productDetails.specifications')}</h3>
                            <dl className="space-y-3">
                                {(product.attributes || []).map(attr => (
                                    <div key={attr.key_en} className="grid grid-cols-3 gap-4 text-sm">
                                        <dt className="font-medium text-gray-500 dark:text-gray-400">{attr.key_en}</dt>
                                        <dd className="col-span-2 text-gray-800 dark:text-gray-300">{attr.value_en}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;