import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Minus, ShoppingCart, Heart, ShieldCheck, Truck, Award, Loader2, ImageOff, ArrowRight, AlertCircle, PlayCircle, Info, TriangleAlert } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../components/LanguageContext';
import { useWishlist } from '../context/WishlistContext'; 
import { useToast } from '../components/ToastNotification';

import { CATEGORY_ATTRIBUTES, CATEGORY_VARIATIONS_OPTIONS_DEFINITION } from '../constants/productConfig'; 

const CATEGORIES_WITH_EXCLUSIVE_VARIANT_MEDIA = ['clothes', 'shoes', 'electronics'];

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
    const [mainDisplayMedia, setMainDisplayMedia] = useState({ url: '', type: '' });
    const [manualMainDisplayMedia, setManualMainDisplayMedia] = useState(null); 
    
    const [selectedOptions, setSelectedOptions] = useState({});
    const [currentSelectedVariant, setCurrentSelectedVariant] = useState(null); 

    const { addToCart, isInCart, loadingCart } = useCart();
    const { toggleFavorite, isFavorite, loading: loadingWishlist } = useWishlist(); 

    const productName = product?.name?.[language] || product?.name?.en || product?.name?.ar || t('general.unnamedProduct');
    const productDescription = product?.description?.[language] || product?.description?.en || product?.description?.ar || t('advertisementAdmin.noDescription');
    const productCategory = product?.category || t('productCard.uncategorized');
    
    const formatPrice = useCallback((price) => {
        if (price === undefined || price === null) return t('general.priceNotAvailable');
        try {
            const currencyCode = t('general.currencyCode');
            return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(Number(price));
        } catch (e) {
            console.error("Error formatting currency in ProductDetails:", e);
            return `${t('general.currencySymbol')}${Number(price).toFixed(2)}`;
        }
    }, [language, t]);

    const fetchProductDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/products/${id}`);
            if (res.data) {
                setProduct(res.data);
                setQuantity(1); 
                setSelectedOptions({}); 
                setCurrentSelectedVariant(null); 
                setManualMainDisplayMedia(null); 

                let initialMedia = { url: '', type: '' };
                const hasVariantImages = res.data.variations?.some(v => v.image);
                const isExclusiveVariantCategory = res.data.category && CATEGORIES_WITH_EXCLUSIVE_VARIANT_MEDIA.includes(res.data.category);

                if (isExclusiveVariantCategory && hasVariantImages) {
                    initialMedia = { url: res.data.variations.find(v => v.image)?.image || '', type: 'image' };
                } else if (res.data.mainImage) {
                    initialMedia = { url: res.data.mainImage, type: 'image' };
                } else if (res.data.additionalImages && res.data.additionalImages.length > 0) {
                    initialMedia = { url: res.data.additionalImages[0], type: 'image' };
                } else if (res.data.videos && res.data.videos.length > 0) {
                    initialMedia = { url: res.data.videos[0], type: 'video' };
                }
                setMainDisplayMedia(initialMedia);
            } else {
                setError(t('productDetailsPage.productDataNotFound'));
            }
        } catch (err) {
            console.error('Error fetching product:', err.response ? err.response.data : err.message);
            if (err.response && err.response.status === 404) {
                setError(t('productDetailsPage.notFound'));
            } else {
                setError(t('productDetailsPage.failedToLoad'));
            }
        } finally {
            setLoading(false);
        }
    }, [id, API_BASE_URL, t]);

    useEffect(() => {
        fetchProductDetails();
    }, [fetchProductDetails]);

    const availableOptionNames = useMemo(() => {
        if (!product?.variations || product.variations.length === 0) return [];
        const names = new Set();
        product.variations.forEach(variant => {
            (variant.options || []).forEach(opt => names.add(opt.optionName));
            if (variant.optionName && variant.optionValue) {
                names.add(variant.optionName);
            }
        });
        const categoryOptions = CATEGORY_VARIATIONS_OPTIONS_DEFINITION[product.category] || [];
        return Array.from(names).sort((a, b) => {
            const indexA = categoryOptions.findIndex(o => o.name_en === a);
            const indexB = categoryOptions.findIndex(o => o.name_en === b);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    }, [product]);

    const getAvailableOptionValues = useCallback((targetOptionName) => {
        if (!product?.variations || product.variations.length === 0) return [];

        const values = new Set();
        product.variations.forEach(variant => {
            const isCompatibleWithSelections = Object.entries(selectedOptions).every(([name, value]) => {
                if (name === targetOptionName) return true;
                return (variant.optionName === name && variant.optionValue === value) ||
                       (variant.options && variant.options.some(opt => opt.optionName === name && opt.optionValue === value));
            });

            if (isCompatibleWithSelections) {
                (variant.options || []).forEach(opt => {
                    if (opt.optionName === targetOptionName) {
                        values.add(opt.optionValue);
                    }
                });
                if (variant.optionName === targetOptionName) {
                    values.add(variant.optionValue);
                }
            }
        });
        
        return Array.from(values).sort((a, b) => {
            const sizeOrder = CATEGORY_VARIATIONS_OPTIONS_DEFINITION[product.category]
                               ?.find(opt => opt.name_en === targetOptionName && opt.options)
                               ?.options;
            if (sizeOrder) {
                return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
            }
            return String(a).localeCompare(String(b), language);
        });
    }, [product, selectedOptions, language]);

    const handleOptionSelect = useCallback((optionName, optionValue) => {
        const isDeselecting = selectedOptions[optionName] === optionValue;

        let newSelectedOptions = { ...selectedOptions };

        if (isDeselecting) {
            delete newSelectedOptions[optionName];
        } else {
            newSelectedOptions[optionName] = optionValue;
        }

        const currentOptionNamesOrder = availableOptionNames;
        const currentOptionIndex = currentOptionNamesOrder.indexOf(optionName);
        for (let i = currentOptionIndex + 1; i < currentOptionNamesOrder.length; i++) {
            const subsequentOptionName = currentOptionNamesOrder[i];
            if (newSelectedOptions[subsequentOptionName]) {
                delete newSelectedOptions[subsequentOptionName];
            }
        }
        
        setSelectedOptions(newSelectedOptions);
        setManualMainDisplayMedia(null); 
    }, [selectedOptions, availableOptionNames]);


    useEffect(() => {
        if (!product) {
            setCurrentSelectedVariant(null);
            setMainDisplayMedia({ url: '', type: '' });
            setManualMainDisplayMedia(null); 
            return;
        }

        let tempSelectedVariant = null;
        let bestPartialMatchImageURL = null; 

        const allRequiredOptionsSelected = availableOptionNames.every(name => selectedOptions[name] !== undefined && selectedOptions[name] !== '');
        
        if (allRequiredOptionsSelected) {
            tempSelectedVariant = product.variations.find(variant => {
                const variantOptionsCount = (variant.options?.length || 0) + (variant.optionName ? 1 : 0);
                if (variantOptionsCount !== Object.keys(selectedOptions).length) {
                    return false;
                }
                return Object.entries(selectedOptions).every(([optionName, optionValue]) => {
                    return (variant.optionName === optionName && variant.optionValue === optionValue) ||
                           (variant.options && variant.options.some(opt => opt.optionName === optionName && opt.optionValue === optionValue));
                });
            });
        }

        if (!tempSelectedVariant && Object.keys(selectedOptions).length > 0) {
            const sortedVariantsByMatch = product.variations
                .filter(variant => variant.image) 
                .map(variant => {
                    let matchCount = 0;
                    Object.entries(selectedOptions).forEach(([selectedOptionName, selectedOptionValue]) => {
                        const hasMatchingOption = (variant.optionName === selectedOptionName && variant.optionValue === selectedOptionValue) ||
                                                 (variant.options && variant.options.some(opt => opt.optionName === selectedOptionName && opt.optionValue === selectedOptionValue));
                        if (hasMatchingOption) {
                            matchCount++;
                        }
                    });
                    if (matchCount > 0) {
                        return { variant, matchCount };
                    }
                    return null;
                })
                .filter(Boolean) 
                .sort((a, b) => b.matchCount - a.matchCount); 

            if (sortedVariantsByMatch.length > 0) {
                bestPartialMatchImageURL = sortedVariantsByMatch[0].variant.image;
            }
        }

        setCurrentSelectedVariant(tempSelectedVariant);

        let newMainDisplayMedia = { url: '', type: '' };
        const hasVariantImages = product.variations?.some(v => v.image);
        const isExclusiveVariantCategory = product.category && CATEGORIES_WITH_EXCLUSIVE_VARIANT_MEDIA.includes(product.category);

        if (tempSelectedVariant && tempSelectedVariant.image) {
            newMainDisplayMedia = { url: tempSelectedVariant.image, type: 'image' };
        } 
        else if (bestPartialMatchImageURL) {
            newMainDisplayMedia = { url: bestPartialMatchImageURL, type: 'image' };
        }
        else if (manualMainDisplayMedia) {
             newMainDisplayMedia = manualMainDisplayMedia;
        }
        else {
            if (isExclusiveVariantCategory && hasVariantImages) {
                newMainDisplayMedia = { url: product.variations.find(v => v.image)?.image || '', type: 'image' };
            } else if (product.mainImage) {
                newMainDisplayMedia = { url: product.mainImage, type: 'image' };
            } else if (product.additionalImages && product.additionalImages.length > 0) {
                newMainDisplayMedia = { url: product.additionalImages[0], type: 'image' };
            } else if (product.videos && product.videos.length > 0) {
                newMainDisplayMedia = { url: product.videos[0], type: 'video' };
            }
        }
        
        if (newMainDisplayMedia.url !== mainDisplayMedia.url || newMainDisplayMedia.type !== mainDisplayMedia.type) {
            setMainDisplayMedia(newMainDisplayMedia);
        }

        if ((tempSelectedVariant && tempSelectedVariant.image && manualMainDisplayMedia?.url !== tempSelectedVariant.image) || 
            (bestPartialMatchImageURL && manualMainDisplayMedia?.url !== bestPartialMatchImageURL)) {
            setManualMainDisplayMedia(null);
        }
        
    }, [selectedOptions, product, availableOptionNames, manualMainDisplayMedia, currentSelectedVariant]);


    const finalPrice = useMemo(() => {
        let price = product?.price || 0;
        if (currentSelectedVariant && currentSelectedVariant.priceAdjustment !== undefined && currentSelectedVariant.priceAdjustment !== null) {
            price += currentSelectedVariant.priceAdjustment;
        }
        return price;
    }, [product?.price, currentSelectedVariant]);


    const handleQuantityChange = useCallback((event) => {
        const value = event.target.value;
        setQuantity(value === '' ? '' : Math.max(1, parseInt(value, 10)));
    }, []);

    const incrementQuantity = useCallback(() => {
        setQuantity(prev => (typeof prev === 'number' ? prev + 1 : 1));
    }, []);

    const decrementQuantity = useCallback(() => {
        setQuantity(prev => (typeof prev === 'number' && prev > 1 ? prev - 1 : 1));
    }, []);

    const handleAddToCart = useCallback(() => {
        if (!isAuthenticated) {
            showToast(t('cart.loginRequired') || 'Please log in to add products to your cart.', 'info');
            navigate('/login');
            return;
        }
        if (!product) return;

        if (product.variations && product.variations.length > 0 && !currentSelectedVariant) {
            showToast(t('productDetailsPage.pleaseSelectAllOptions') || 'Please select all required options (e.g., Color, Size).', 'warning');
            return;
        }
        if (currentSelectedVariant && currentSelectedVariant.stock === 0) {
            showToast(t('productDetailsPage.outOfStock') || 'This product is currently out of stock.', 'error');
            return;
        }
        if (currentSelectedVariant && currentSelectedVariant.stock !== undefined && quantity > currentSelectedVariant.stock) {
            showToast(t('productDetailsPage.notEnoughStockSelectedQuantity', { quantity: currentSelectedVariant.stock }) || `Not enough stock. Available: ${currentSelectedVariant.stock}.`, 'error');
            return;
        }
        
        const quantityToAdd = typeof quantity === 'number' && quantity > 0 ? quantity : 1;
        
        addToCart(product, quantityToAdd, currentSelectedVariant ? currentSelectedVariant._id : null); 
        showToast(t('cart.productAdded') || `Added ${productName} to cart.`, 'success'); 
    }, [isAuthenticated, product, quantity, currentSelectedVariant, addToCart, navigate, t, showToast, productName]);

    const handleToggleFavorite = useCallback(() => {
        if (!isAuthenticated) {
            showToast(t('wishlist.loginRequired') || 'Please log in to manage your wishlist.', 'info');
            navigate('/login');
            return;
        }
        if (!product) return;
        const isCurrentlyFavorite = isFavorite(product._id);
        toggleFavorite(product);
        
        if (isCurrentlyFavorite) { 
            showToast(t('wishlist.removedFromWishlist') || `Removed ${productName} from wishlist.`, 'info');
        } else {
            showToast(t('wishlist.addedToWishlist') || `Added ${productName} to wishlist.`, 'success');
        }
    }, [isAuthenticated, product, toggleFavorite, navigate, t, showToast, isFavorite, productName]);

    const productIsFavorite = product ? isFavorite(product._id) : false;

    const handleMediaError = useCallback((e) => {
        e.target.onerror = null;
        e.target.src = '/images/placeholder-product-image.png'; 
        e.target.alt = t('general.mediaFailedToLoad');
        if (e.target.tagName === 'VIDEO') {
            const parent = e.target.parentNode;
            if (parent) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 text-xl bg-gray-100 dark:bg-gray-800 rounded-lg';
                errorDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-circle mb-2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg> ${t('general.videoFailedToLoad')}`;
                parent.replaceChild(errorDiv, e.target);
            }
        }
    }, [t]);

    const handleThumbnailClick = useCallback((mediaUrl, mediaType, isVariantImage = false, associatedColorValue = null) => {
        const newMedia = { url: mediaUrl, type: mediaType };
        setManualMainDisplayMedia(newMedia); 
        
        if (isVariantImage) {
            const categoryOptionDefs = CATEGORY_VARIATIONS_OPTIONS_DEFINITION[product?.category] || [];
            const colorOptionDef = categoryOptionDefs.find(opt => opt.name_en === "Color");

            if (colorOptionDef && associatedColorValue && associatedColorValue !== "N/A_Color") {
                setSelectedOptions({ "Color": associatedColorValue });
            } else {
                setSelectedOptions({});
            }
        } else {
            setSelectedOptions({});
        }
    }, [product, setSelectedOptions]);


    const renderMainMedia = useCallback(() => {
        if (!mainDisplayMedia.url) {
            return (
                <div className="w-full h-[300px] flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 text-lg bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <ImageOff size={56} className="mb-3 text-gray-300 dark:text-gray-600" />
                    {t('general.noMediaAvailable')}
                </div>
            );
        }

        if (mainDisplayMedia.type === 'image') {
            return (
                <img
                    src={`${API_BASE_URL}${mainDisplayMedia.url}`}
                    alt={productName}
                    className="w-full h-full object-contain transform group-hover:scale-103 transition-transform duration-300 ease-in-out"
                    onError={handleMediaError}
                />
            );
        } else if (mainDisplayMedia.type === 'video') {
            return (
                <video
                    src={`${API_BASE_URL}${mainDisplayMedia.url}`}
                    controls
                    className="w-full h-full object-contain transform group-hover:scale-103 transition-transform duration-300 ease-in-out bg-black"
                    onError={handleMediaError}
                />
            );
        }
        return null;
    }, [mainDisplayMedia, API_BASE_URL, productName, handleMediaError, t]);

    const displayQuantity = typeof quantity === 'number' && quantity > 0 ? quantity : '';
    
    const allMedia = useMemo(() => {
        const media = [];
        const existingMediaUrlsAndColors = new Set(); 
        
        const variantImagesGrouped = new Map(); 

        if (product?.variations) {
            product.variations.forEach(v => {
                if (v.image) { 
                    const colorOption = (v.options || []).find(opt => opt.optionName === "Color");
                    const colorValue = colorOption ? colorOption.optionValue : (v.optionName === "Color" ? v.optionValue : "N/A_Color");
                    
                    const groupingKey = `${v.image}_${colorValue}`;

                    if (!variantImagesGrouped.has(groupingKey)) {
                        variantImagesGrouped.set(groupingKey, {
                            url: v.image,
                            type: 'image',
                            isVariantImage: true,
                            variants: [], 
                            colorValue: colorValue
                        });
                    }
                    variantImagesGrouped.get(groupingKey).variants.push(v);
                }
            });
        }

        Array.from(variantImagesGrouped.values()).forEach(item => {
            const allOptionsForThisImage = new Set(); 
            const sizesForThisImage = new Set(); 

            item.variants.forEach(v => {
                (v.options || []).forEach(opt => {
                    if (opt.optionName === "Size") {
                        sizesForThisImage.add(opt.optionValue);
                    } else if (opt.optionName !== "Color") {
                        allOptionsForThisImage.add(`${opt.optionName}: ${opt.optionValue}`);
                    }
                });
                if (v.optionName === "Size") {
                    sizesForThisImage.add(v.optionValue);
                } else if (v.optionName && v.optionValue && v.optionName !== "Color") {
                    allOptionsForThisImage.add(`${v.optionName}: ${v.optionValue}`);
                }
            });

            let optionsSummary = [];
            if (item.colorValue && item.colorValue !== "N/A_Color") {
                optionsSummary.push(`${t('productDetailsPage.color') || 'Color'}: ${item.colorValue}`);
            }
            if (sizesForThisImage.size > 0) {
                const sortedSizes = Array.from(sizesForThisImage).sort((a,b) => {
                    const sizeDef = CATEGORY_VARIATIONS_OPTIONS_DEFINITION[product.category]
                                    ?.find(opt => opt.name_en === "Size" && opt.options)
                                    ?.options;
                    if (sizeDef) return sizeDef.indexOf(a) - sizeDef.indexOf(b);
                    return String(a).localeCompare(String(b), language);
                });
                optionsSummary.push(`${t('productDetailsPage.sizes') || 'Sizes'}: ${sortedSizes.join(', ')}`);
            }
            optionsSummary.push(...Array.from(allOptionsForThisImage).sort());
            const finalOptionsSummary = optionsSummary.join(', ');
            
            media.push({
                url: item.url,
                type: item.type,
                isVariantImage: item.isVariantImage,
                optionsSummary: finalOptionsSummary,
                colorValue: item.colorValue 
            });
            existingMediaUrlsAndColors.add(`${item.url}_${item.colorValue}`); 
        });

        const isExclusiveVariantCategory = product?.category && CATEGORIES_WITH_EXCLUSIVE_VARIANT_MEDIA.includes(product.category);

        if (!isExclusiveVariantCategory || media.length === 0) { 
            if (product?.mainImage && !existingMediaUrlsAndColors.has(`${product.mainImage}_N/A_Color`)) {
                media.push({ url: product.mainImage, type: 'image', isVariantImage: false });
                existingMediaUrlsAndColors.add(`${product.mainImage}_N/A_Color`);
            }
            if (product?.additionalImages) {
                product.additionalImages.forEach(img => {
                    if (!existingMediaUrlsAndColors.has(`${img}_N/A_Color`)) {
                        media.push({ url: img, type: 'image', isVariantImage: false });
                        existingMediaUrlsAndColors.add(`${img}_N/A_Color`);
                    }
                });
            }
            if (product?.videos) {
                product.videos.forEach(vid => {
                    if (!existingMediaUrlsAndColors.has(`${vid}_N/A_Color`)) {
                        media.push({ url: vid, type: 'video', isVariantImage: false });
                        existingMediaUrlsAndColors.add(`${vid}_N/A_Color`);
                    }
                });
            }
        }
        
        return media;
    }, [product, language, t]);


    const currentProductAttributesDef = useMemo(() => {
        return product?.category ? (CATEGORY_ATTRIBUTES[product.category] || CATEGORY_ATTRIBUTES.others) : [];
    }, [product?.category]);

    const isOptionValueAvailable = useCallback((optionName, optionValueToCheck) => {
        if (!product?.variations || product.variations.length === 0) return false;

        return product.variations.some(variant => {
            const hasTargetOption = (variant.optionName === optionName && variant.optionValue === optionValueToCheck) ||
                                    (variant.options && variant.options.some(opt => opt.optionName === optionName && opt.optionValue === optionValueToCheck));
            if (!hasTargetOption) return false;

            return Object.entries(selectedOptions).every(([name, value]) => {
                if (name === optionName) return true; 
                return (variant.optionName === name && variant.optionValue === value) ||
                       (variant.options && variant.options.some(opt => opt.optionName === name && opt.optionValue === value));
            });
        });
    }, [product, selectedOptions]);


    const renderVariantOptionControl = useCallback((optionName, availableValues, selectedValueForThisOption, optionDef, index) => {
        const localizedOptionName = language === 'ar' ? optionDef?.name_ar || optionName : optionName;
        
        const isGroupDisabled = index > 0 && availableOptionNames[index - 1] && !selectedOptions[availableOptionNames[index - 1]];
        
        if (isGroupDisabled && !selectedValueForThisOption) {
            return null; 
        }

        const filteredValues = availableValues.filter(value => isOptionValueAvailable(optionName, value));

        if (optionDef?.display_type === 'color') {
            return (
                <div key={optionName} className="mb-4 last:mb-0">
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        {localizedOptionName}:
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {filteredValues.map(value => (
                            <button
                                type="button"
                                key={value}
                                className={`w-10 h-10 rounded-full border-2 cursor-pointer flex items-center justify-center text-xs font-semibold
                                    transition-all duration-200 ease-in-out transform hover:scale-105
                                    ${selectedValueForThisOption === value
                                        ? 'ring-2 ring-offset-1 ring-sky-400 dark:ring-sky-500 border-white dark:border-gray-900 shadow-sm' 
                                        : 'border-gray-300 dark:border-gray-600'
                                    }
                                    ${isGroupDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                                style={{ backgroundColor: value.toLowerCase() }} 
                                onClick={() => !isGroupDisabled && handleOptionSelect(optionName, value)}
                                title={value}
                                disabled={isGroupDisabled}
                                aria-pressed={selectedValueForThisOption === value}
                            >
                                {selectedValueForThisOption === value && (
                                    <span className="text-white text-base drop-shadow-sm">✓</span> 
                                )}
                            </button>
                        ))}
                         {selectedValueForThisOption && (
                            <button
                                type="button"
                                onClick={() => handleOptionSelect(optionName, '')}
                                className="px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs font-medium shadow-sm"
                                title={t('productDetailsPage.clearSelection') || 'Clear selection'}
                            >
                                {t('general.clear') || 'Clear'}
                            </button>
                        )}
                    </div>
                </div>
            );
        } else if (optionDef?.display_type === 'chip' || optionDef?.display_type === 'radio') {
            return (
                <div key={optionName} className="mb-4 last:mb-0">
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        {localizedOptionName}:
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {filteredValues.map(value => (
                            <button
                                type="button"
                                key={value}
                                className={`px-4 py-1.5 rounded-full border text-sm font-medium
                                    transition-all duration-200 ease-in-out transform hover:scale-103 hover:shadow-sm
                                    ${selectedValueForThisOption === value
                                        ? 'bg-blue-500 dark:bg-blue-600 text-white border-blue-500 dark:border-blue-600 shadow-md ring-1 ring-blue-300 dark:ring-blue-500'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}
                                    ${isGroupDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                                onClick={() => !isGroupDisabled && handleOptionSelect(optionName, value)}
                                disabled={isGroupDisabled}
                                aria-pressed={selectedValueForThisOption === value}
                            >
                                {value}
                            </button>
                        ))}
                        {selectedValueForThisOption && (
                            <button
                                type="button"
                                onClick={() => handleOptionSelect(optionName, '')}
                                className="px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs font-medium shadow-sm"
                                title={t('productDetailsPage.clearSelection') || 'Clear selection'}
                            >
                                {t('general.clear') || 'Clear'}
                            </button>
                        )}
                    </div>
                </div>
            );
        } else { 
            return (
                <div key={optionName} className="mb-4 last:mb-0">
                    <label htmlFor={`variation-select-${optionName}`} className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5">
                        {localizedOptionName}:
                    </label>
                    <select
                        id={`variation-select-${optionName}`}
                        value={selectedValueForThisOption}
                        onChange={(e) => handleOptionSelect(optionName, e.target.value)}
                        className="w-full h-10 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-400 focus:border-blue-400 bg-gray-50 dark:bg-gray-700 dark:text-white text-sm transition-colors duration-200 appearance-none pr-8"
                        disabled={isGroupDisabled}
                    >
                        <option value="">
                            {filteredValues.length === 0 && !selectedValueForThisOption
                                ? t('productDetailsPage.noOptionsAvailable') 
                                : t('productDetailsPage.selectOption') 
                            }
                        </option>
                        {filteredValues.map(value => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                </div>
            );
        }
    }, [handleOptionSelect, selectedOptions, product, language, t, availableOptionNames, isOptionValueAvailable]); 


    const stockStatusMessage = useMemo(() => {
        if (!product) return null;

        if (product.variations && product.variations.length > 0 && !currentSelectedVariant) {
            const allOptionsSelected = availableOptionNames.every(name => selectedOptions[name] !== undefined && selectedOptions[name] !== '');
            
            if (allOptionsSelected) {
                return {
                    type: 'error',
                    message: t('productDetailsPage.variantNotFound') || 'This combination is not available. Please adjust your selections.',
                    icon: <AlertCircle size={16} />
                };
            } else {
                return {
                    type: 'info',
                    message: t('productDetailsPage.selectMoreOptions') || 'Please select all available options (e.g., Color, Size) to check availability.',
                    icon: <Info size={16} />
                };
            }
        }
        
        const effectiveStock = currentSelectedVariant ? currentSelectedVariant.stock : product.stock;
        
        if (effectiveStock === 0) {
            return {
                type: 'error',
                message: t('productDetailsPage.outOfStock') || 'This item is currently out of stock.',
                icon: <AlertCircle size={16} />
            };
        } else if (effectiveStock !== undefined && quantity > effectiveStock) {
            return {
                type: 'error',
                message: t('productDetailsPage.notEnoughStockSelectedQuantity', { quantity: effectiveStock }) || `Not enough stock. Available: ${effectiveStock}.`,
                icon: <AlertCircle size={16} />
            };
        } else if (effectiveStock !== undefined && effectiveStock <= 5 && effectiveStock > 0) {
            return {
                type: 'warning',
                message: t('productDetailsPage.lowStockAlert', { quantity: effectiveStock }) || `Only ${effectiveStock} items left in stock!`,
                icon: <TriangleAlert size={16} />
            };
        } else if (effectiveStock !== undefined && effectiveStock > 0) {
            return {
                type: 'success',
                message: t('productDetailsPage.inStock') || 'In Stock!',
                icon: <ShieldCheck size={16} />
            };
        }
        
        return null;
    }, [product, currentSelectedVariant, quantity, availableOptionNames, selectedOptions, t]);


    const isAddToCartDisabled = useMemo(() => {
        if (loadingCart) return true;
        if (!product) return true;

        if (product.variations && product.variations.length > 0) {
            if (!currentSelectedVariant) return true;
            if (currentSelectedVariant.stock === 0) return true;
            if (currentSelectedVariant.stock !== undefined && quantity > currentSelectedVariant.stock) return true;
        } else {
            if (product.stock === 0) return true;
            if (product.stock !== undefined && quantity > product.stock) return true;
        }

        return false;
    }, [loadingCart, product, currentSelectedVariant, quantity]);


    if (loading) {
        return (
            <section className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-16 px-4 transition-colors duration-500 ease-in-out">
                <div className="flex flex-col items-center justify-center text-xl font-semibold text-gray-700 dark:text-gray-300 p-10 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <Loader2 size={50} className="animate-spin text-blue-500 dark:text-blue-400 mb-4" />
                    <span className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('general.loading') || 'Loading product details...'}</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('general.pleaseWait') || 'Please wait a moment.'}</p>
                </div>
            </section>
        );
    }
    if (error) {
        return (
            <section className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-16 px-4 transition-colors duration-500 ease-in-out">
                <div className="text-center p-10 bg-red-50 dark:bg-red-900/15 rounded-xl shadow-md border border-red-200 dark:border-red-800 flex flex-col items-center justify-center gap-4">
                    <AlertCircle size={50} className="text-red-600 dark:text-red-400" />
                    <p className="font-semibold text-xl text-gray-800 dark:text-gray-200">{t('general.error') || 'Error'}:</p>
                    <p className="text-base text-gray-600 dark:text-gray-400">{error}</p>
                    <button
                        onClick={() => navigate('/shop')}
                        className="mt-4 py-2.5 px-6 flex items-center justify-center bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 transition-colors duration-300 text-base font-semibold transform hover:scale-103"
                    >
                        {t('productDetailsPage.backToShop') || 'Back to Shop'}
                        <ArrowRight size={18} className={`${language === 'ar' ? 'mr-2' : 'ml-2'} `} />
                    </button>
                </div>
            </section>
        );
    }

    if (!product) {
        return (
            <section className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-16 px-4 transition-colors duration-500 ease-in-out">
                <div className="text-center p-10 bg-gray-50 dark:bg-gray-800/40 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-4">
                    <Info size={50} className="text-blue-500 dark:text-blue-400" />
                    <p className="font-semibold text-xl text-gray-800 dark:text-gray-200">{t('productDetailsPage.productDataMissing') || 'Product data could not be loaded.'}</p>
                    <p className="text-base text-gray-600 dark:text-gray-400">{t('productDetailsPage.productUnavailable') || 'It might be temporarily unavailable or has been removed.'}</p>
                    <button
                        onClick={() => navigate('/shop')}
                        className="mt-4 py-2.5 px-6 flex items-center justify-center bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 transition-colors duration-300 text-base font-semibold transform hover:scale-103"
                    >
                        {t('productDetailsPage.backToShop') || 'Back to Shop'}
                        <ArrowRight size={18} className={`${language === 'ar' ? 'mr-2' : 'ml-2'}`} />
                    </button>
                </div>
            </section>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 md:px-6 lg:px-8 flex items-center justify-center transition-colors duration-500 ease-in-out font-sans">
            <div className="container mx-auto max-w-6xl bg-white dark:bg-gray-900 shadow-lg rounded-xl p-6 md:p-8 lg:p-10 transition-all duration-300 ease-in-out border border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    {/* Removed sticky and top-* classes from here */}
                    <div className="flex flex-col items-center self-start"> 
                        <div className="w-full max-w-md md:max-w-lg lg:max-w-full h-auto max-h-[400px] overflow-hidden rounded-xl shadow-md border border-gray-100 dark:border-gray-800 transform transition-all duration-300 ease-in-out group hover:shadow-lg">
                            {renderMainMedia()}
                        </div>
                        {allMedia.length > 0 && (
                            <div className="mt-6 w-full max-w-md md:max-w-lg lg:max-w-full">
                                <h3 className="sr-only">{t('productDetailsPage.productMedia')}</h3>
                                <div className="flex justify-center space-x-2 overflow-x-auto pb-2 custom-scrollbar" dir="ltr">
                                    {allMedia.map((media) => { 
                                        const isCurrentlyDisplayed = mainDisplayMedia.url === media.url && mainDisplayMedia.type === media.type;
                                        const isSelectedVariantThumbnail = currentSelectedVariant && media.url === currentSelectedVariant.image && media.isVariantImage;
                                        const isManualSelectionActive = manualMainDisplayMedia?.url === media.url && manualMainDisplayMedia?.type === media.type;
                                        
                                        return (
                                            <div
                                                key={`${media.url}_${media.colorValue || ''}`} 
                                                className={`relative flex-shrink-0 w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center cursor-pointer p-1
                                                    transform transition-all duration-200 ease-in-out hover:scale-103 hover:shadow-sm
                                                    ${isCurrentlyDisplayed || isSelectedVariantThumbnail || isManualSelectionActive
                                                        ? 'border-2 border-blue-400 dark:border-blue-500 shadow-sm ring-1 ring-offset-1 ring-offset-white dark:ring-offset-gray-900 ring-blue-200 dark:ring-blue-600'
                                                        : 'border border-gray-200 dark:border-gray-700 opacity-80 hover:opacity-100'
                                                    }
                                                `}
                                                onClick={() => handleThumbnailClick(media.url, media.type, media.isVariantImage, media.colorValue)}
                                                title={`${t('general.view')} ${media.type === 'image' ? (media.isVariantImage && media.optionsSummary ? media.optionsSummary : t('general.image')) : t('general.video')}`}
                                            >
                                                {media.type === 'image' ? (
                                                    <img
                                                        src={`${API_BASE_URL}${media.url}`}
                                                        alt={`${productName} - ${t('general.thumbnail')}`}
                                                        className="w-full h-full object-cover rounded-sm"
                                                        onError={handleMediaError}
                                                    />
                                                ) : (
                                                    <div className="relative w-full h-full flex items-center justify-center bg-black rounded-sm">
                                                        <video
                                                            src={`${API_BASE_URL}${media.url}`}
                                                            className="w-full h-full object-cover rounded-sm"
                                                            controls={false}
                                                            onError={handleMediaError}
                                                        />
                                                        <PlayCircle size={28} className="absolute text-white/80 group-hover:text-white transition-all drop-shadow-sm" />
                                                    </div>
                                                )}
                                                {media.isVariantImage && media.optionsSummary && (
                                                    <span className="absolute bottom-0.5 left-0.5 right-0.5 bg-black bg-opacity-60 text-white text-[0.45rem] px-0.5 py-0.5 rounded-sm overflow-hidden text-ellipsis whitespace-nowrap text-center font-medium">
                                                        {media.optionsSummary}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-6">
                        <div>
                            <p className="text-sm font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide mb-1.5">
                                {productCategory}
                            </p>
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-3">
                                {productName}
                            </h1>
                            <p className="text-2xl md:text-3xl font-bold text-green-500 dark:text-green-400 flex items-center gap-1.5">
                                {formatPrice(finalPrice)}
                            </p>
                            {currentSelectedVariant && currentSelectedVariant.priceAdjustment !== undefined && currentSelectedVariant.priceAdjustment !== 0 && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                    ({currentSelectedVariant.priceAdjustment > 0 ? '+' : ''}{formatPrice(currentSelectedVariant.priceAdjustment)} {t('productDetailsPage.variationPriceAdjustment') || 'adjustment for this option'})
                                </p>
                            )}
                        </div>

                        {product.attributes && Object.keys(product.attributes).length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl shadow-inner border border-gray-100 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                                    {t('productDetailsPage.specifications') || 'Specifications'}
                                </h3>
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                                    {currentProductAttributesDef.map(attrDef => {
                                        const attributeValue = product.attributes[attrDef.key];
                                        if (attributeValue !== undefined && attributeValue !== null && attributeValue !== '') {
                                            return (
                                                <div key={attrDef.key} className="flex flex-col">
                                                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{language === 'ar' ? attrDef.label_ar : attrDef.label_en}:</dt>
                                                    <dd className="mt-0.5 text-base font-semibold text-gray-700 dark:text-gray-300">{String(attributeValue)}</dd>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </dl>
                            </div>
                        )}

                        {product.variations && product.variations.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl shadow-inner border border-gray-100 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                                    {t('productDetailsPage.availableOptions') || 'Available Options'}
                                </h3>
                                {availableOptionNames.map((optionName, index) => {
                                    const availableValues = getAvailableOptionValues(optionName);
                                    const selectedValueForThisOption = selectedOptions[optionName] || '';
                                    const optionDef = CATEGORY_VARIATIONS_OPTIONS_DEFINITION[product.category]?.find(o => o.name_en === optionName);
                                    
                                    const shouldHideOptionGroup = (index > 0 && availableOptionNames[index - 1] && !selectedOptions[availableOptionNames[index - 1]]);

                                    if (shouldHideOptionGroup && !selectedValueForThisOption) {
                                        return null; 
                                    }

                                    return renderVariantOptionControl(optionName, availableValues, selectedValueForThisOption, optionDef, index);
                                })}
                            </div>
                        )}

                        <div className="flex flex-col gap-5 pt-5 pb-7 border-y border-gray-200 dark:border-gray-700">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2.5">
                                    {t('productDetailsPage.quantity')}
                                </h3>
                                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-full w-fit overflow-hidden shadow-sm">
                                    <button
                                        onClick={decrementQuantity}
                                        className="p-2.5 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-l-full"
                                        disabled={typeof quantity !== 'number' || quantity <= 1 || (currentSelectedVariant && currentSelectedVariant.stock === 0)}
                                        aria-label={t('general.decreaseQuantity')}
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <input
                                        type="number"
                                        value={displayQuantity}
                                        onChange={handleQuantityChange}
                                        onBlur={() => {
                                            if (typeof quantity !== 'number' || quantity < 1) {
                                                setQuantity(1);
                                            }
                                        }}
                                        className="w-16 text-center border-x border-gray-300 dark:border-gray-600 focus:ring-0 bg-transparent text-gray-800 dark:text-white text-lg font-bold [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0"
                                        min="1"
                                        step="1"
                                        aria-label={t('general.productQuantity')}
                                        disabled={currentSelectedVariant && currentSelectedVariant.stock === 0}
                                    />
                                    <button
                                        onClick={incrementQuantity}
                                        className="p-2.5 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 rounded-r-full"
                                        aria-label={t('general.increaseQuantity')}
                                        disabled={currentSelectedVariant && (currentSelectedVariant.stock === 0 || (currentSelectedVariant.stock !== undefined && quantity >= currentSelectedVariant.stock))}
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                            
                            {stockStatusMessage && (
                                <div className={`p-2 rounded-lg border flex items-center gap-2 text-sm font-semibold 
                                    ${stockStatusMessage.type === 'error' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300' :
                                      stockStatusMessage.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300' :
                                      stockStatusMessage.type === 'success' ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300' :
                                      'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                                    }`}
                                >
                                    {stockStatusMessage.icon}
                                    <span>{stockStatusMessage.message}</span>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4 mt-4">
                                <button
                                    className="flex-1 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-all duration-300 ease-in-out transform hover:scale-103 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700 text-base disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:-translate-y-0"
                                    onClick={handleAddToCart}
                                    disabled={isAddToCartDisabled} 
                                    aria-label={`${t('shopPage.addToCart')} (${typeof quantity === 'number' && quantity > 0 ? quantity : 1})`}
                                >
                                    {loadingCart ? (
                                        <Loader2 size={20} className="animate-spin mr-2" />
                                    ) : (
                                        <ShoppingCart size={20} className={`${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                                    )}
                                    {t('shopPage.addToCart')}
                                </button>
                                <button
                                    className={`p-2.5 rounded-xl shadow-sm transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${productIsFavorite ? 'focus:ring-rose-300 dark:focus:ring-rose-700' : 'focus:ring-gray-300 dark:focus:ring-gray-700'}
                                         ${productIsFavorite
                                            ? 'bg-rose-500 hover:bg-rose-600 text-white transform hover:scale-105'
                                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 transform hover:scale-103'
                                        }
                                    `}
                                    onClick={handleToggleFavorite}
                                    disabled={loadingWishlist}
                                    aria-label={productIsFavorite ? (t('shopPage.removeFromFavorites')) : (t('shopPage.addToFavorites'))}
                                    title={productIsFavorite ? (t('shopPage.removeFromFavorites')) : (t('shopPage.addToFavorites'))}
                                >
                                    {loadingWishlist ? (
                                        <Loader2 size={22} className="animate-spin" />
                                    ) : (
                                        <Heart size={22} fill={productIsFavorite ? 'currentColor' : 'none'} />
                                    )}
                                </button>
                            </div>
                            <div className="mt-5 flex items-center justify-end">
                                <button onClick={() => navigate('/shop')} className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors duration-200 font-semibold text-sm group">
                                    {t('productDetailsPage.continueShopping')}
                                    <ArrowRight size={16} className={`${language === 'ar' ? 'mr-1' : 'ml-1'} transform group-hover:translate-x-1 transition-transform duration-200`} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-gray-600 dark:text-gray-400">
                            <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transform hover:scale-103 transition-transform duration-200 ease-in-out">
                                <ShieldCheck size={40} className="text-green-500 mb-2.5" />
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{t('productDetailsPage.securePayment')}</span>
                            </div>
                            <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transform hover:scale-103 transition-transform duration-200 ease-in-out">
                                <Truck size={40} className="text-blue-500 mb-2.5" />
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{t('productDetailsPage.fastShipping')}</span>
                            </div>
                            <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transform hover:scale-103 transition-transform duration-200 ease-in-out">
                                <Award size={40} className="text-yellow-500 mb-2.5" />
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{t('productDetailsPage.qualityGuarantee')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-5 shadow-inner">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b-2 border-blue-400 dark:border-blue-500 pb-2 inline-block">
                        {t('productDetailsPage.productDescription')}
                    </h3>
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm prose dark:prose-invert max-w-none">
                        <p>{productDescription}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;