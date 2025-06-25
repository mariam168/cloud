import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Minus, ShoppingCart, Heart, Loader2, Award, Tag, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../components/LanguageContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../components/ToastNotification';

const colorMap = {
    'black': '#000000', 'white': '#FFFFFF', 'red': '#FF0000', 'blue': '#0000FF',
    'green': '#008000', 'silver': '#C0C0C0', 'gold': '#FFD700', 'rose gold': '#B76E79',
    'navy blue': '#000080', 'charcoal gray': '#36454F', 'washed black': '#222222',
    'cream': '#FFFDD0', 'pine green': '#01796F', 'stone': '#877F7D', 'space gray': '#5f5f5f'
};

const ProductDetails = () => {
    const { id } = useParams();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const { API_BASE_URL, isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const [product, setProduct] = useState(null);
    const [advertisement, setAdvertisement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [mainDisplayImage, setMainDisplayImage] = useState('');
    const [selectedOptions, setSelectedOptions] = useState({});
    const [selectedSku, setSelectedSku] = useState(null);
    const { addToCart, loadingCart } = useCart();
    const { toggleFavorite, isFavorite } = useWishlist();
    const [timeLeft, setTimeLeft] = useState(null);

    const isOfferProduct = useMemo(() => !!advertisement, [advertisement]);

    useEffect(() => {
        const fetchProductDetails = async () => {
            setLoading(true);
            setError(null);
            setSelectedOptions({});
            setSelectedSku(null);
            const axiosConfig = { headers: { 'accept-language': language } };
            try {
                const res = await axios.get(`${API_BASE_URL}/api/products/${id}`, axiosConfig);
                const productData = res.data;
                setProduct(productData);
                if (productData.advertisement) {
                    setAdvertisement(productData.advertisement);
                } else {
                    setAdvertisement(null);
                }
                setMainDisplayImage(productData.mainImage || '');
            } catch (err) {
                console.error("Failed to load product details:", err);
                setError(t('productDetailsPage.failedToLoad'));
            } finally {
                setLoading(false);
            }
        };
        fetchProductDetails();
    }, [id, API_BASE_URL, t, language]);

    useEffect(() => {
        if (!isOfferProduct || !advertisement.endDate) {
            setTimeLeft(null);
            return;
        }
        const intervalId = setInterval(() => {
            const now = new Date();
            const endDate = new Date(advertisement.endDate);
            const difference = endDate - now;
            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);
                setTimeLeft({ days, hours, minutes, seconds });
            } else {
                setTimeLeft(null);
                clearInterval(intervalId);
            }
        }, 1000);
        return () => clearInterval(intervalId);
    }, [isOfferProduct, advertisement]);

    const handlePrimaryOptionSelect = (variationId, option) => {
        setSelectedOptions(prev => ({
            ...prev,
            [variationId]: option._id
        }));
        setSelectedSku(null);

        if (option.image) {
            setMainDisplayImage(option.image);
        }
    };
    
    const handleSkuSelect = (sku) => {
        setSelectedSku(sku);
    };

    const priceInfo = useMemo(() => {
        const basePrice = selectedSku?.price ?? product?.basePrice ?? 0;
        if (isOfferProduct && advertisement.discountedPrice != null) {
            const adOriginalPrice = advertisement.originalPrice ?? basePrice;
            const percentage = adOriginalPrice > 0 ? Math.round(((adOriginalPrice - advertisement.discountedPrice) / adOriginalPrice) * 100) : 0;
            return { finalPrice: advertisement.discountedPrice, originalPrice: adOriginalPrice, discountPercentage: percentage };
        }
        return { finalPrice: basePrice, originalPrice: null, discountPercentage: 0 };
    }, [selectedSku, product, advertisement, isOfferProduct]);
    
    const formatPrice = useCallback((price) => {
        if (price == null) return t('general.priceNotAvailable');
        const currencyCode = advertisement?.currency || product?.currency || 'SAR';
        return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', { style: 'currency', currency: currencyCode }).format(Number(price));
    }, [language, t, advertisement, product]);

    const isAddToCartDisabled = useMemo(() => {
        if (loadingCart) return true;
        
        if (product?.variations?.length > 0) {
            return !selectedSku;
        }
        
        return false;
    }, [loadingCart, product, selectedSku]);

    const handleAddToCart = useCallback(() => {
        if (!isAuthenticated) {
            showToast(t('cart.loginRequired'), 'info');
            navigate('/login');
            return;
        }
        if (isAddToCartDisabled) {
             showToast(t('productDetailsPage.selectAllOptions'), 'warning');
             return;
        }
        addToCart(product, quantity, selectedSku?._id);
    }, [isAuthenticated, product, quantity, selectedSku, addToCart, navigate, t, showToast, isAddToCartDisabled]);
    
    const productIsFavorite = product ? isFavorite(product._id) : false;
    
    const allImages = useMemo(() => {
        if (!product) return [];
        const images = new Map();
        if (product.mainImage) images.set(product.mainImage, product.mainImage);
        (product.variations || []).forEach(v => {
            (v.options || []).forEach(o => {
                if (o.image && !images.has(o.image)) images.set(o.image, o.image);
            });
        });
        return Array.from(images.values());
    }, [product]);

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 size={48} className="animate-spin text-blue-500" /></div>;
    if (error) return <div className="p-4 m-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;
    if (!product) return <div className="text-center p-16">{t('productDetailsPage.notFound')}</div>;
    
    const productName = language === 'ar' ? product.name?.ar : product.name?.en;
    const categoryName = language === 'ar' ? product.category?.name?.ar : product.category?.name?.en;

    return (
        <div className={`transition-colors duration-500 ${isOfferProduct ? 'bg-gradient-to-br from-white via-red-50 to-amber-50 dark:from-gray-900 dark:via-red-900/10 dark:to-amber-900/10' : 'bg-white dark:bg-gray-900'}`}>
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">

                {isOfferProduct && (
                    <div className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-2xl shadow-red-500/30">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-center md:text-left">
                                <h2 className="text-3xl font-extrabold flex items-center gap-3">
                                    <Award size={32} />
                                    {advertisement.title?.[language] || advertisement.title?.en || t('productDetailsPage.specialOffer')}
                                </h2>
                                <p className="mt-2 text-red-100 max-w-lg">{advertisement.description?.[language] || advertisement.description?.en}</p>
                            </div>
                            {timeLeft && (
                                <div className="text-center shrink-0">
                                    <p className="text-sm uppercase font-semibold tracking-wider text-red-200 flex items-center justify-center gap-2"><Clock size={14}/>{t('productDetailsPage.offerEndsIn')}</p>
                                    <div className="flex gap-3 md:gap-4 mt-2 font-mono text-3xl font-bold">
                                        <div>{String(timeLeft.days).padStart(2, '0')} <span className="text-xs block font-normal opacity-80">{t('general.days')}</span></div>:
                                        <div>{String(timeLeft.hours).padStart(2, '0')} <span className="text-xs block font-normal opacity-80">{t('general.hours')}</span></div>:
                                        <div>{String(timeLeft.minutes).padStart(2, '0')} <span className="text-xs block font-normal opacity-80">{t('general.minutes')}</span></div>:
                                        <div>{String(timeLeft.seconds).padStart(2, '0')} <span className="text-xs block font-normal opacity-80">{t('general.seconds')}</span></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="lg:sticky lg:top-24 self-start">
                        <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden mb-4 border dark:border-gray-700 relative">
                            {priceInfo.discountPercentage > 0 && (
                                <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-lg font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                                    <Tag size={20} />
                                    <span>{priceInfo.discountPercentage}% {t('general.off')}</span>
                                </div>
                            )}
                            <img src={`${API_BASE_URL}${mainDisplayImage}`} alt={productName} className="w-full h-full object-contain transition-opacity duration-300 p-4" />
                        </div>
                         {allImages.length > 1 && (
                            <div className="flex justify-center space-x-2">
                                {allImages.map(imgUrl => (
                                    <div key={imgUrl} className={`flex-shrink-0 w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-md cursor-pointer border-2 transition-all ${mainDisplayImage === imgUrl ? 'border-blue-500' : 'border-transparent hover:border-gray-300'}`}
                                         onClick={() => setMainDisplayImage(imgUrl)}>
                                        <img src={`${API_BASE_URL}${imgUrl}`} alt="thumbnail" className="w-full h-full object-cover rounded-sm"/>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col space-y-8">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">{categoryName}</p>
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mt-2">{productName}</h1>
                        </div>
                        
                        <div className={`flex items-center gap-4 p-4 rounded-lg ${isOfferProduct ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'} border`}>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{isOfferProduct ? t('productDetailsPage.offerPrice') : t('productDetailsPage.price')}</p>
                                <p className="text-5xl font-bold text-gray-800 dark:text-white">{formatPrice(priceInfo.finalPrice)}</p>
                            </div>
                            {priceInfo.originalPrice && priceInfo.originalPrice > priceInfo.finalPrice && (
                                <div className="pl-4 border-l dark:border-gray-600">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('productDetailsPage.originalPrice')}</p>
                                    <p className="text-2xl font-medium text-gray-400 dark:text-gray-500 line-through">{formatPrice(priceInfo.originalPrice)}</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            {(product.variations || []).map((variation) => {
                                const currentSelectedOption = (variation.options || []).find(opt => opt._id === selectedOptions[variation._id]);
                                const variationName = language === 'ar' ? variation.name_ar : variation.name_en;

                                return (
                                <div key={variation._id}>
                                    <h3 className="font-semibold mb-3 text-lg text-gray-800 dark:text-gray-200">{variationName}</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {(variation.options || []).map((option) => {
                                            const isSelected = selectedOptions[variation._id] === option._id;
                                            const colorName = option.name_en?.toLowerCase() || '';
                                            const optionName = language === 'ar' ? option.name_ar : option.name_en;
                                            return (
                                                <button 
                                                    key={option._id}
                                                    onClick={() => handlePrimaryOptionSelect(variation._id, option)}
                                                    className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg transition-all duration-200 ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}
                                                >
                                                    {variation.name_en?.toLowerCase() === 'color' && colorMap[colorName] && (
                                                        <span style={{ backgroundColor: colorMap[colorName] }} className="w-6 h-6 rounded-full border border-gray-400/50"></span>
                                                    )}
                                                    <span className="font-semibold">{optionName}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    
                                    {currentSelectedOption && currentSelectedOption.skus && currentSelectedOption.skus.length > 0 && (
                                         <div className="mt-4 pt-4 border-t border-dashed dark:border-gray-700">
                                            <h4 className="font-semibold mb-3 text-md text-gray-700 dark:text-gray-300">{t('productDetailsPage.selectFinalProduct')}</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {currentSelectedOption.skus.map(sku => {
                                                    const isSkuSelected = selectedSku?._id === sku._id;
                                                    const skuName = language === 'ar' ? sku.name_ar : sku.name_en;
                                                    return (
                                                        <button
                                                            key={sku._id}
                                                            onClick={() => handleSkuSelect(sku)}
                                                            className={`px-4 py-2 border rounded-lg text-sm transition-colors ${isSkuSelected ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'bg-white dark:bg-gray-800 dark:border-gray-600 hover:border-gray-400'}`}
                                                        >
                                                            {skuName}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                )})}
                        </div>
                        
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
                                {(product.attributes || [])
                                    .filter(attr => attr && attr.key_en)
                                    .map((attr, index) => {
                                        const attrKey = language === 'ar' ? attr.key_ar : attr.key_en;
                                        const attrValue = language === 'ar' ? attr.value_ar : attr.value_en;
                                        return (
                                            <div key={attr.key_en + index} className="grid grid-cols-3 gap-4 text-sm">
                                                <dt className="font-medium text-gray-500 dark:text-gray-400">{attrKey}</dt>
                                                <dd className="col-span-2 text-gray-800 dark:text-gray-300">{attrValue}</dd>
                                            </div>
                                        )
                                    })}
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;