import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Minus, ShoppingCart, Heart, Loader2, Award, Star, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../components/LanguageContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../components/ToastNotification';
const colorMap = {
    'black': '#111827', 'white': '#FFFFFF', 'red': '#EF4444', 'blue': '#3B82F6',
    'green': '#22C55E', 'silver': '#D1D5DB', 'gold': '#FBBF24', 'rose gold': '#F472B6',
    'navy blue': '#1E3A8A', 'charcoal gray': '#374151', 'washed black': '#222222',
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
        let currencyCode = advertisement?.currency || product?.currency || 'EGP';
        if (currencyCode === 'EG') {
            currencyCode = 'EGP';
        }
        
        const locale = language === 'ar' ? 'ar-EG' : 'en-US';
        try {
            return new Intl.NumberFormat(locale, { 
                style: 'currency', 
                currency: currencyCode 
            }).format(Number(price));
        } catch (error) {
            console.error("Price formatting error:", error);
            return `${price} ${currencyCode}`;
        }
    }, [language, t, advertisement, product]);
    const isAddToCartDisabled = useMemo(() => {
        if (loadingCart) return true;
        if (product?.variations?.length > 0) {
            const requiredVariations = product.variations.filter(v => v.options?.length > 0);
            const allPrimaryOptionsSelected = requiredVariations.every(v => selectedOptions[v._id]);
            if (!allPrimaryOptionsSelected) return true;

            const lastSelectedOption = requiredVariations.length > 0 ? 
                product.variations.flatMap(v => v.options).find(o => o._id === selectedOptions[requiredVariations[requiredVariations.length - 1]._id])
                : null;
            
            if (lastSelectedOption?.skus?.length > 0 && !selectedSku) return true;
        }
        return false;
    }, [loadingCart, product, selectedOptions, selectedSku]);

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
        (product.images || []).forEach(img => images.set(img, img));
        (product.variations || []).forEach(v => {
            (v.options || []).forEach(o => {
                if (o.image && !images.has(o.image)) images.set(o.image, o.image);
            });
        });
        return Array.from(images.values());
    }, [product]);

    if (loading) return <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-black"><Loader2 size={48} className="animate-spin text-indigo-500" /></div>;
    if (error) return <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-black p-4"><div className="text-center text-red-700 dark:text-red-400 p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-500/30 flex flex-col items-center gap-4"><p className="font-semibold text-xl">{error}</p></div></div>;
    if (!product) return null;
    
    const productName = language === 'ar' ? product.name?.ar : product.name?.en;
    const categoryName = language === 'ar' ? product.category?.name?.ar : product.category?.name?.en;
    const description = language === 'ar' ? product.description?.ar : product.description?.en;
    
    return (
        <div className={`bg-gray-50 dark:bg-black`}>
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                
                {isOfferProduct && (
                    <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/20">
                             <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                 <div className="text-center md:text-left">
                                     <h2 className="text-2xl font-bold flex items-center gap-3">
                                         <Award size={28} />
                                         {advertisement.title?.[language] || advertisement.title?.en || t('productDetailsPage.specialOffer')}
                                     </h2>
                                     <p className="mt-1 text-red-100 max-w-lg">{advertisement.description?.[language] || advertisement.description?.en}</p>
                                 </div>
                                 {timeLeft && (
                                     <div className="text-center shrink-0">
                                         <p className="text-xs uppercase font-semibold tracking-wider text-red-200 flex items-center justify-center gap-2"><Clock size={14}/>{t('productDetailsPage.offerEndsIn')}</p>
                                         <div className="flex gap-2 sm:gap-3 mt-1 font-mono text-2xl font-bold">
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
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                    <div className="lg:sticky lg:top-24 self-start">
                        <div className="relative w-full aspect-square bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-sm">
                            {priceInfo.discountPercentage > 0 && (
                                <div className="absolute top-4 left-4 z-10 flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white shadow-md">
                                    <Award size={16} />
                                    <span>{priceInfo.discountPercentage}% {t('general.off')}</span>
                                </div>
                            )}
                            <img src={`${API_BASE_URL}${mainDisplayImage}`} alt={productName} className="w-full h-full object-contain transition-opacity duration-300 p-8" />
                        </div>
                           {allImages.length > 1 && (
                               <div className="mt-4 grid grid-cols-5 gap-3">
                                   {allImages.map(imgUrl => (
                                       <button key={imgUrl} className={`flex-shrink-0 aspect-square bg-white dark:bg-zinc-900 rounded-lg cursor-pointer border-2 transition-all overflow-hidden ${mainDisplayImage === imgUrl ? 'border-indigo-500' : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300'}`}
                                            onClick={() => setMainDisplayImage(imgUrl)}>
                                           <img src={`${API_BASE_URL}${imgUrl}`} alt="thumbnail" className="w-full h-full object-cover"/>
                                       </button>
                                   ))}
                               </div>
                           )}
                    </div>
                    
                    <div className="flex flex-col space-y-8">
                        <div>
                            <div className="flex items-center justify-between">
                                <Link to={`/shop?category=${encodeURIComponent(categoryName)}`} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wider">{categoryName}</Link>
                                <button onClick={() => toggleFavorite(product)} className={`p-2 rounded-full transition-colors ${productIsFavorite ? 'bg-red-100 dark:bg-red-500/10 text-red-500' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}>
                                    <Heart size={22} fill={productIsFavorite ? 'currentColor' : 'none'}/>
                                </button>
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white mt-2">{productName}</h1>
                            <div className="mt-3 flex items-center gap-2">
                                <div className="flex items-center text-sm text-yellow-400">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < (product.averageRating || 0) ? "currentColor" : "none"} strokeWidth={1.5} className="text-yellow-400" />)}
                                </div>
                                <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">({product.averageRating?.toFixed(1) || '0.0'})</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {(product.variations || []).map((variation) => {
                                const currentSelectedOption = (variation.options || []).find(opt => opt._id === selectedOptions[variation._id]);
                                const variationName = language === 'ar' ? variation.name_ar : variation.name_en;

                                return (
                                <div key={variation._id}>
                                    <h3 className="mb-3 text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">{variationName}</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {(variation.options || []).map((option) => {
                                            const isSelected = selectedOptions[variation._id] === option._id;
                                            const optionName = language === 'ar' ? option.name_ar : option.name_en;
                                            const colorName = option.name_en?.toLowerCase() || '';
                                            return (
                                                <button key={option._id} onClick={() => handlePrimaryOptionSelect(variation._id, option)}
                                                    className={`flex min-w-[48px] items-center justify-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-all duration-200 ${isSelected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'border-gray-300 bg-white hover:border-gray-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500'}`}>
                                                    {variation.name_en?.toLowerCase() === 'color' && colorMap[colorName] && (<span style={{ backgroundColor: colorMap[colorName] }} className="h-5 w-5 rounded-full border border-black/10"></span>)}
                                                    <span>{optionName}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    
                                    {currentSelectedOption && currentSelectedOption.skus?.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-dashed dark:border-zinc-700">
                                                <h4 className="mb-3 text-sm font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">{t('productDetailsPage.selectFinalProduct')}</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {currentSelectedOption.skus.map(sku => {
                                                        const isSkuSelected = selectedSku?._id === sku._id;
                                                        const skuName = language === 'ar' ? sku.name_ar : sku.name_en;
                                                        return (<button key={sku._id} onClick={() => handleSkuSelect(sku)}
                                                                 className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${isSkuSelected ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-gray-300 bg-white hover:border-gray-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500'}`}
                                                             >{skuName}</button>)
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                </div>
                                )}
                            )}
                        </div>
                        
                        <div className="sticky bottom-0 lg:static bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm lg:bg-transparent lg:dark:bg-transparent lg:backdrop-blur-none p-4 -mx-4 lg:p-0 lg:mx-0 border-t border-gray-200 dark:border-zinc-800 lg:border-t-2 lg:pt-8">
                               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                   <div className="flex-shrink-0 text-center sm:text-left">
                                       {priceInfo.originalPrice && priceInfo.originalPrice > priceInfo.finalPrice && (
                                           <p className="text-sm text-gray-500 line-through dark:text-zinc-500">{formatPrice(priceInfo.originalPrice)}</p>
                                       )}
                                       <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatPrice(priceInfo.finalPrice)}</p>
                                   </div>
                                   <div className="flex items-center gap-3 w-full sm:w-auto">
                                       <div className="flex items-center rounded-lg border border-gray-200 dark:border-zinc-700">
                                           <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-l-md"><Minus size={16}/></button>
                                           <span className="px-4 font-bold text-lg text-gray-800 dark:text-white">{quantity}</span>
                                           <button onClick={() => setQuantity(q => q + 1)} className="p-3 text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-r-md"><Plus size={16}/></button>
                                       </div>
                                       <button onClick={handleAddToCart} disabled={isAddToCartDisabled} className="flex-1 rounded-lg bg-gray-900 px-6 py-3 text-base font-semibold text-white transition-colors duration-300 hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-indigo-600 dark:hover:bg-indigo-500 flex items-center justify-center gap-2">
                                           {loadingCart ? <Loader2 className="animate-spin"/> : <ShoppingCart size={20}/>}
                                           {t('productDetailsPage.addToCart')}
                                       </button>
                                   </div>
                               </div>
                               {selectedSku && selectedSku.stock !== undefined && (<p className={`mt-3 text-xs font-semibold text-center sm:text-left ${selectedSku.stock > 5 ? 'text-green-600' : (selectedSku.stock > 0 ? 'text-orange-500' : 'text-red-600')}`}>{selectedSku.stock > 0 ? t('productDetailsPage.inStock', { count: selectedSku.stock }) : t('productDetailsPage.outOfStock')}</p>)}
                        </div>

                        {(description || product.attributes?.length > 0) && (
                            <div className="space-y-8 pt-8 border-t border-gray-200 dark:border-zinc-800">
                               {description && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('productDetailsPage.description')}</h3>
                                        <div className="prose prose-sm max-w-none text-gray-600 dark:text-zinc-400 dark:prose-invert" dangerouslySetInnerHTML={{ __html: description }} />
                                    </div>
                               )}
                               {product.attributes?.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('productDetailsPage.specifications')}</h3>
                                        <dl className="space-y-4">
                                            {product.attributes.filter(attr => attr.key_en && attr.value_en).map((attr, index) => {
                                                const attrKey = language === 'ar' ? attr.key_ar : attr.key_en;
                                                const attrValue = language === 'ar' ? attr.value_ar : attr.value_en;
                                                return (
                                                    <div key={index} className="grid grid-cols-1 gap-1 sm:grid-cols-3 sm:gap-4">
                                                        <dt className="font-medium text-gray-500 dark:text-zinc-400">{attrKey}</dt>
                                                        <dd className="col-span-2 text-gray-700 dark:text-zinc-300">{attrValue}</dd>
                                                    </div>
                                                )
                                            })}
                                        </dl>
                                    </div>
                               )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;