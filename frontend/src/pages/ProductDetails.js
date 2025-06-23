import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Minus, ShoppingCart, Heart, Loader2, Award, Star } from 'lucide-react';
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
    const [advertisement, setAdvertisement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [mainDisplayImage, setMainDisplayImage] = useState('');
    const [activeOption, setActiveOption] = useState(null);
    const [selectedSku, setSelectedSku] = useState(null);
    const { addToCart, loadingCart } = useCart();
    const { toggleFavorite, isFavorite } = useWishlist();

    useEffect(() => {
        const fetchProductAndAdDetails = async () => {
            setLoading(true);
            try {
                const productPromise = axios.get(`${API_BASE_URL}/api/products/${id}`);
                const adPromise = axios.get(`${API_BASE_URL}/api/advertisements?productRef=${id}&isActive=true`);
                
                const [productRes, adRes] = await Promise.all([productPromise, adPromise]);

                const productData = productRes.data;
                setProduct(productData);

                if (adRes.data && adRes.data.length > 0) {
                    setAdvertisement(adRes.data[0]);
                }

                const firstOptionImage = productData.variations?.[0]?.options?.find(o => o.image)?.image;
                setMainDisplayImage(firstOptionImage || productData.mainImage || '');

            } catch (err) {
                console.error("Failed to load product details:", err);
                setError(t('productDetailsPage.failedToLoad'));
            } finally {
                setLoading(false);
            }
        };
        fetchProductAndAdDetails();
    }, [id, API_BASE_URL, t]);

    const isAdvertised = !!advertisement;
    const variations = useMemo(() => product?.variations || [], [product]);

    const handleOptionSelect = (option) => {
        if (activeOption?._id === option._id) {
            setActiveOption(null);
            setSelectedSku(null);
            const firstOptionImage = product.variations?.[0]?.options?.find(o => o.image)?.image;
            setMainDisplayImage(firstOptionImage || product.mainImage || '');
        } else {
            setActiveOption(option);
            setSelectedSku(null); 
            if (option.image) {
                setMainDisplayImage(option.image);
            }
        }
    };
    
    const handleSkuSelect = (sku) => {
        if (selectedSku?._id === sku._id) {
            setSelectedSku(null);
        } else {
            setSelectedSku(sku);
        }
    };
    
    const handleThumbnailClick = (imageUrl) => {
        setMainDisplayImage(imageUrl);
        let foundOption = null;
        for (const variation of variations) {
            foundOption = variation.options.find(o => o.image === imageUrl);
            if (foundOption) break;
        }
        if (foundOption) {
            handleOptionSelect(foundOption);
        } else {
            setActiveOption(null);
            setSelectedSku(null);
        }
    };

    const { finalPrice, originalPrice, discountPercentage } = useMemo(() => {
        const basePrice = selectedSku?.price ?? product?.basePrice ?? 0;
        
        if (isAdvertised && advertisement.discountedPrice != null) {
            const adOriginalPrice = advertisement.originalPrice ?? basePrice;
            let percentage = 0;
            if (adOriginalPrice > 0 && adOriginalPrice > advertisement.discountedPrice) {
                percentage = Math.round(((adOriginalPrice - advertisement.discountedPrice) / adOriginalPrice) * 100);
            }
            return { 
                finalPrice: advertisement.discountedPrice, 
                originalPrice: adOriginalPrice, 
                discountPercentage: percentage 
            };
        }
        
        return { finalPrice: basePrice, originalPrice: null, discountPercentage: 0 };
    }, [selectedSku, product, advertisement, isAdvertised]);

    const formatPrice = useCallback((price) => {
        if (price === undefined || price === null) return t('general.priceNotAvailable');
        const currencyCode = advertisement?.currency || t('general.currencyCode') || 'USD';
        return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
            style: 'currency', currency: currencyCode
        }).format(Number(price));
    }, [language, t, advertisement]);

    const handleAddToCart = useCallback(() => {
        if (!isAuthenticated) { showToast(t('cart.loginRequired'), 'info'); navigate('/login'); return; }
        if (variations.length > 0 && !selectedSku) { showToast(t('productDetailsPage.selectVariant'), 'warning'); return; }
        const variantId = variations.length > 0 ? selectedSku?._id : null;
        addToCart(product, quantity, variantId);
    }, [isAuthenticated, product, quantity, selectedSku, addToCart, navigate, t, showToast, variations]);

    const isAddToCartDisabled = loadingCart || (variations.length > 0 && !selectedSku) || selectedSku?.stock === 0;
    const productIsFavorite = product ? isFavorite(product._id) : false;

    const allImages = useMemo(() => {
        if (!product) return [];
        const images = new Map();
        if(product.mainImage) images.set(product.mainImage, product.mainImage);
        product.variations?.forEach(v => v.options.forEach(o => {
            if (o.image && !images.has(o.image)) {
                images.set(o.image, o.image);
            }
        }));
        return Array.from(images.values());
    }, [product]);

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 size={48} className="animate-spin text-blue-500" /></div>;
    if (error) return <div className="p-4 m-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;
    if (!product) return <div>{t('productDetailsPage.notFound')}</div>;

    return (
        <div className="bg-white dark:bg-gray-900">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="lg:sticky lg:top-24 self-start">
                        <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden mb-4 border dark:border-gray-700 relative">
                            {discountPercentage > 0 && (
                                <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-lg font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                                    <Award size={20} />
                                    <span>{discountPercentage}% {t('general.off')}</span>
                                </div>
                            )}
                            <img src={`${API_BASE_URL}${mainDisplayImage || product.mainImage}`} alt={product.name} className="w-full h-full object-contain transition-opacity duration-300 p-4" />
                        </div>
                         {allImages.length > 1 && (
                            <div className="flex justify-center space-x-2">
                                {allImages.map(imgUrl => (
                                    <div 
                                        key={imgUrl} 
                                        className={`flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md cursor-pointer border-2 transition-all ${mainDisplayImage === imgUrl ? 'border-blue-500' : 'border-transparent hover:border-gray-300'}`}
                                        onClick={() => handleThumbnailClick(imgUrl)}
                                    >
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
                            <p className="text-4xl font-bold text-gray-800 dark:text-white">{formatPrice(finalPrice)}</p>
                            {originalPrice && (
                                <p className="text-2xl font-medium text-gray-400 dark:text-gray-500 line-through">{formatPrice(originalPrice)}</p>
                            )}
                        </div>
                        
                        <div className="space-y-6">
                            {variations.map((variation) => (
                                <div key={variation._id}>
                                    <h3 className="font-semibold mb-3 text-lg text-gray-800 dark:text-gray-200">{variation.name}</h3>
                                    <div className="space-y-4">
                                        {variation.options.map((option) => (
                                            <div key={option._id}>
                                                <div 
                                                    className="flex items-center gap-3 cursor-pointer"
                                                    onClick={() => handleOptionSelect(option)}
                                                >
                                                    {variation.name && typeof variation.name === 'string' && variation.name.toLowerCase() === 'color' && (
                                                        <span style={{ backgroundColor: colorMap[option.name?.toLowerCase()] || '#ccc' }} className={`w-8 h-8 block rounded-full border-2 ${activeOption?._id === option._id ? 'ring-2 ring-offset-2 ring-blue-500 border-white' : 'border-gray-200'}`}></span>
                                                    )}
                                                    <h4 className={`text-md font-medium ${activeOption?._id === option._id ? 'text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}>{option.name}</h4>
                                                </div>
                                                
                                                {activeOption?._id === option._id && (
                                                     <div className="flex flex-wrap gap-2 mt-3 pl-10">
                                                        {option.skus.map((sku) => {
                                                            const isSelected = selectedSku?._id === sku._id;
                                                            return (
                                                                <button 
                                                                    key={sku._id}
                                                                    onClick={(e) => { e.stopPropagation(); handleSkuSelect(sku); }}
                                                                    className={`px-4 py-2 border rounded-lg transition-colors text-sm font-semibold ${isSelected ? 'bg-gray-900 text-white border-gray-900' : 'bg-white dark:bg-gray-800 dark:border-gray-600 hover:border-gray-400'}`}
                                                                >
                                                                    {sku.name}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
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