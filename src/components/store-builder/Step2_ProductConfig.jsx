import { showSuccess, showError } from '../../utils/toast';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreBuilder } from '../../Context/StoreBuilderContext';
import StoreBuilderLayout from './StoreBuilderLayout';
import Card from '../Common/Card';
import Input from '../Common/Input';
import Toggle from '../Common/Toggle';
import imageService from '../../services/imageService';

// ✅ Image Guideline Component
const ImageGuidelineBadge = ({ size, format, maxSize, ratio }) => (
  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
    <span className="flex items-center gap-0.5">
      <span className="material-symbols-outlined text-sm">crop</span>
      <span className="font-medium">{size}</span>
    </span>
    <span className="text-gray-300">|</span>
    <span className="flex items-center gap-0.5">
      <span className="material-symbols-outlined text-sm">description</span>
      <span>{format}</span>
    </span>
    <span className="text-gray-300">|</span>
    <span className="flex items-center gap-0.5">
      <span className="material-symbols-outlined text-sm">sd_storage</span>
      <span>{maxSize}</span>
    </span>
    <span className="text-gray-300">|</span>
    <span className="flex items-center gap-0.5">
      <span className="material-symbols-outlined text-sm">aspect_ratio</span>
      <span>{ratio}</span>
    </span>
  </div>
);

// ✅ Error Display Component
const ImageError = ({ error }) => {
  if (!error) return null;
  return (
    <div className="mt-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200 flex items-start gap-1">
      <span className="material-symbols-outlined text-sm">error</span>
      <span>{error}</span>
    </div>
  );
};

const Step2_ProductConfig = () => {
  const navigate = useNavigate();
  // ✅ FIX: Destructure `currentStoreId` instead of `storeId`!
  const { productData, setProductData, currentStoreId, tenantId, brandData } = useStoreBuilder();
  
  // ✅ Track upload status per product/variation
  const [uploadingStates, setUploadingStates] = useState({});
  const [errorStates, setErrorStates] = useState({});

  // Load from context on mount
  const [categories, setCategories] = useState(() => 
    productData.categories?.length > 0 ? productData.categories : [
      {
        id: 1,
        name: '',
        products: [
          {
            id: 1,
            name: '',
            description: '',
            images: [],
            bulkPricing: false,
            discount: 20,
            variations: [
              { 
                id: 1, 
                name: 'Organic', 
                image: null,
                sizes: [{ id: 1, size: '5', unit: 'kg', price: '450' }] 
              }
            ]
          }
        ]
      }
    ]
  );

  // Hero Banner State
  const [bannerImage, setBannerImage] = useState(productData.banner?.image || null);
  const [bannerTagline, setBannerTagline] = useState(productData.banner?.tagline || '');
  const [bannerSubtitle, setBannerSubtitle] = useState(productData.banner?.subtitle || '');
  const [bannerCta, setBannerCta] = useState(productData.banner?.cta || 'Shop Now');
  const [addToCartLabel, setAddToCartLabel] = useState(productData.addToCartLabel || 'Add to Cart');
  const [bannerHeight, setBannerHeight] = useState(productData.banner?.height || 400);
  const [bannerBgColor, setBannerBgColor] = useState(productData.banner?.bgColor || '#25D366');
  const [showCta, setShowCta] = useState(productData.banner?.showCta !== undefined ? productData.banner.showCta : true);
  const [showText, setShowText] = useState(productData.banner?.showText !== undefined ? productData.banner.showText : true);
  const [textAlignment, setTextAlignment] = useState(productData.banner?.textAlignment || 'center');
  const [textColor, setTextColor] = useState(productData.banner?.textColor || '#FFFFFF');

  const [enableImageZoom, setEnableImageZoom] = useState(productData.enableImageZoom !== false);
  const [categoryImageShape, setCategoryImageShape] = useState(productData.categoryImageShape || 'circle');
  const [categoryImageSize, setCategoryImageSize] = useState(productData.categoryImageSize || 'S');
  const [autoSlideProductImages, setAutoSlideProductImages] = useState(productData.autoSlideProductImages || false);

  // ✅ FIX: Re-hydrate product/banner state once loadStore() actually finishes.
  // categories/banner fields above are only captured once at mount, but loadStore()
  // is async and often hasn't resolved yet when this component first mounts — so
  // editing an existing store's products showed the blank/default sample data.
  // currentStoreId only changes once loadStore's response has landed, so syncing
  // on it here (instead of on productData) picks up the real data without looping
  // against the "Save to context" effect further below.
  useEffect(() => {
    if (currentStoreId && productData.categories?.length > 0) {
      setCategories(productData.categories);
    }
    if (currentStoreId && productData.banner) {
      setBannerImage(productData.banner.image || null);
      setBannerTagline(productData.banner.tagline || '');
      setBannerSubtitle(productData.banner.subtitle || '');
      setBannerCta(productData.banner.cta || 'Shop Now');
      setAddToCartLabel(productData.addToCartLabel || 'Add to Cart');
      setBannerHeight(productData.banner.height || 400);
      setBannerBgColor(productData.banner.bgColor || '#25D366');
      setShowCta(productData.banner.showCta !== undefined ? productData.banner.showCta : true);
      setShowText(productData.banner.showText !== undefined ? productData.banner.showText : true);
      setTextAlignment(productData.banner.textAlignment || 'center');
      setTextColor(productData.banner.textColor || '#FFFFFF');
    }
    if (currentStoreId && productData.enableImageZoom !== undefined) {
      setEnableImageZoom(productData.enableImageZoom !== false);
    }
    if (currentStoreId && productData.categoryImageShape) {
      setCategoryImageShape(productData.categoryImageShape);
    }
    if (currentStoreId && productData.categoryImageSize) {
      setCategoryImageSize(productData.categoryImageSize);
    }
    if (currentStoreId && productData.autoSlideProductImages !== undefined) {
      setAutoSlideProductImages(productData.autoSlideProductImages || false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStoreId]);

  // UI State
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showQuickPreview, setShowQuickPreview] = useState(false);

  // ✅ Collapse/expand state — categories/products/variations default
  // collapsed so a tenant with a large, already-configured store can
  // navigate without scrolling through everything at once. Newly-added
  // items auto-expand (see addCategory/addProduct/addVariation below) so
  // they can be filled in immediately without an extra click.
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [expandedProducts, setExpandedProducts] = useState(new Set());
  const [expandedVariations, setExpandedVariations] = useState(new Set());

  const toggleExpanded = (setFn, id) => {
    setFn(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ✅ Drag-and-drop product reordering within a category — native HTML5
  // drag events, no extra library needed. Reordering the array is all
  // that's required for the new order to show correctly on the storefront
  // and preview too, since both already render products in array order.
  const [draggedProduct, setDraggedProduct] = useState(null); // { categoryId, productId }
  const [dragOverProductId, setDragOverProductId] = useState(null);

  const reorderProducts = (categoryId, fromProductId, toProductId) => {
    if (fromProductId === toProductId) return;
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat;
      const products = [...cat.products];
      const fromIndex = products.findIndex(p => p.id === fromProductId);
      const toIndex = products.findIndex(p => p.id === toProductId);
      if (fromIndex === -1 || toIndex === -1) return cat;
      const [moved] = products.splice(fromIndex, 1);
      products.splice(toIndex, 0, moved);
      return { ...cat, products };
    }));
  };

  const handleProductDragStart = (categoryId, productId) => (e) => {
    setDraggedProduct({ categoryId, productId });
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleProductDragOver = (productId) => (e) => {
    e.preventDefault();
    if (dragOverProductId !== productId) setDragOverProductId(productId);
  };
  const handleProductDrop = (categoryId, productId) => (e) => {
    e.preventDefault();
    if (draggedProduct && draggedProduct.categoryId === categoryId) {
      reorderProducts(categoryId, draggedProduct.productId, productId);
    }
    setDraggedProduct(null);
    setDragOverProductId(null);
  };
  const handleProductDragEnd = () => {
    setDraggedProduct(null);
    setDragOverProductId(null);
  };

  // ✅ Generate unique error key for each upload
  const getErrorKey = (categoryId, productId, type, variationId = null) => {
    return `${categoryId}-${productId}-${type}${variationId ? `-${variationId}` : ''}`;
  };

  // ✅ Set error for specific element
  const setElementError = (key, error) => {
    setErrorStates(prev => ({ ...prev, [key]: error }));
  };

  // ✅ Clear error for specific element
  const clearElementError = (key) => {
    setErrorStates(prev => ({ ...prev, [key]: null }));
  };

  // ✅ Set uploading state
  const setElementUploading = (key, isUploading) => {
    setUploadingStates(prev => ({ ...prev, [key]: isUploading }));
  };

  // ✅ FIX: Category image upload was a pure visual placeholder before —
  // no file input, no click handler, nothing wired up at all. This matches
  // the exact working pattern already used for product/variation images.
  const handleCategoryImageUpload = async (categoryId, file) => {
    if (!currentStoreId || !tenantId) {
      setElementError(`category-image-${categoryId}`, 'Store ID or Tenant ID missing. Please save the store first');
      return;
    }
    const errorKey = `category-image-${categoryId}`;
    clearElementError(errorKey);
    setElementUploading(errorKey, true);
    try {
      const response = await imageService.uploadImage(currentStoreId, tenantId, 'CATEGORY', file, categoryId);
      if (!response.success) {
        setElementError(errorKey, response.error || 'Upload failed');
        return;
      }
      setCategories(prev => prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, image: { id: response.data.id || generateId(), url: response.data.url } }
          : cat
      ));
    } catch (err) {
      setElementError(errorKey, err.message || 'Upload failed');
    } finally {
      setElementUploading(errorKey, false);
    }
  };

  const removeCategoryImage = (categoryId) => {
    setCategories(prev => prev.map(cat => cat.id === categoryId ? { ...cat, image: null } : cat));
  };

  // ✅ FIXED: Handle product image upload with API and proper error handling
  const handleProductImageUpload = async (categoryId, productId, files, errorKey) => {
    // ✅ FIX: Use `currentStoreId` instead of `storeId`
    if (!currentStoreId || !tenantId) {
      setElementError(errorKey, 'Store ID or Tenant ID missing. Please save the store first');
      return;
    }

    clearElementError(errorKey);
    setElementUploading(errorKey, true);

    try {
      // Upload main image (first file)
      const mainFile = files[0];
      if (mainFile) {
        const response = await imageService.uploadImage(
          currentStoreId, // ✅ Changed from storeId
          tenantId,
          'PRODUCT_MAIN',
          mainFile,
          productId
        );
        
        if (!response.success) {
          setElementError(errorKey, `Main image: ${response.error || 'Upload failed'}`);
          setElementUploading(errorKey, false);
          return;
        }

        // Add to local state
        const newImage = {
          id: response.data.id || generateId(),
          url: response.data.url,
          uploaded: true
        };

        setCategories(prevCategories => prevCategories.map(cat => {
          if (cat.id === categoryId) {
            return {
              ...cat,
              products: cat.products.map(p => {
                if (p.id === productId) {
                  return {
                    ...p,
                    images: [newImage, ...(p.images || [])]
                  };
                }
                return p;
              })
            };
          }
          return cat;
        }));
      }

      // Upload gallery images (remaining files)
      const galleryFiles = files.slice(1);
      if (galleryFiles.length > 0) {
        const response = await imageService.uploadGalleryImages(
          currentStoreId, // ✅ Changed from storeId
          tenantId,
          'PRODUCT_GALLERY',
          galleryFiles,
          productId
        );

        if (!response.success) {
          setElementError(errorKey, `Gallery: ${response.error || 'Upload failed'}`);
          setElementUploading(errorKey, false);
          return;
        }

        // Add gallery images to local state
        const galleryImages = response.data?.uploaded?.map(img => ({
          id: img.id || generateId(),
          url: img.url,
          uploaded: true
        })) || [];

        setCategories(prevCategories => prevCategories.map(cat => {
          if (cat.id === categoryId) {
            return {
              ...cat,
              products: cat.products.map(p => {
                if (p.id === productId) {
                  return {
                    ...p,
                    images: [...(p.images || []), ...galleryImages]
                  };
                }
                return p;
              })
            };
          }
          return cat;
        }));
      }

      clearElementError(errorKey);

    } catch (error) {
      setElementError(errorKey, error.response?.data?.error || error.message || 'Failed to upload images. Please try again.');
    } finally {
      setElementUploading(errorKey, false);
    }
  };

  // Save to context
  useEffect(() => {
    setProductData({
      categories: categories,
      enableImageZoom: enableImageZoom,
      categoryImageShape: categoryImageShape,
      categoryImageSize: categoryImageSize,
      autoSlideProductImages: autoSlideProductImages,
      addToCartLabel: addToCartLabel,
      banner: {
        image: bannerImage,
        tagline: bannerTagline,
        subtitle: bannerSubtitle,
        cta: bannerCta,
        height: bannerHeight,
        bgColor: bannerBgColor,
        showCta: showCta,
        showText: showText,
        textAlignment: textAlignment,
        textColor: textColor,
      }
    });
  }, [categories, bannerImage, bannerTagline, bannerSubtitle, bannerCta, bannerHeight, bannerBgColor, showCta, showText, textAlignment, textColor, enableImageZoom, categoryImageShape, categoryImageSize, autoSlideProductImages, addToCartLabel]);

  const generateId = () => Math.floor(Date.now() + Math.random() * 1000);

  // Category functions
  const addCategory = () => {
    if (newCategoryName.trim()) {
      const newId = generateId();
      setCategories([{ id: newId, name: newCategoryName, image: null, products: [] }, ...categories]);
      setExpandedCategories(prev => new Set(prev).add(newId));
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  const deleteCategory = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(cat => cat.id !== categoryId));
    }
  };

  const addProduct = (categoryId) => {
    const newId = generateId();
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        const newProduct = {
          id: newId,
          name: 'New Product',
          description: '',
          images: [],
          bulkPricing: false,
          discount: 0,
          variations: []
        };
        return {
          ...cat,
          products: [...cat.products, newProduct]
        };
      }
      return cat;
    }));
    setExpandedProducts(prev => new Set(prev).add(newId));
  };

  const deleteProduct = (categoryId, productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setCategories(categories.map(cat => {
        if (cat.id === categoryId) {
          return { ...cat, products: cat.products.filter(p => p.id !== productId) };
        }
        return cat;
      }));
    }
  };

  const addVariation = (categoryId, productId) => {
    const newId = generateId();
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          products: cat.products.map(p => {
            if (p.id === productId) {
              const newVariation = {
                id: newId,
                name: 'New Variation',
                image: null,
                sizes: [{ id: generateId(), size: '', unit: 'kg', price: '' }]
              };
              return {
                ...p,
                variations: [newVariation, ...p.variations]
              };
            }
            return p;
          })
        };
      }
      return cat;
    }));
    setExpandedVariations(prev => new Set(prev).add(newId));
  };

  const deleteVariation = (categoryId, productId, variationId) => {
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          products: cat.products.map(p => {
            if (p.id === productId) {
              return { ...p, variations: p.variations.filter(v => v.id !== variationId) };
            }
            return p;
          })
        };
      }
      return cat;
    }));
  };

  const addSize = (categoryId, productId, variationId) => {
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          products: cat.products.map(p => {
            if (p.id === productId) {
              return {
                ...p,
                variations: p.variations.map(v => {
                  if (v.id === variationId) {
                    const newSize = { id: generateId(), size: '', unit: 'kg', price: '' };
                    return {
                      ...v,
                      sizes: [...v.sizes, newSize]
                    };
                  }
                  return v;
                })
              };
            }
            return p;
          })
        };
      }
      return cat;
    }));
  };

  const deleteSize = (categoryId, productId, variationId, sizeId) => {
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          products: cat.products.map(p => {
            if (p.id === productId) {
              return {
                ...p,
                variations: p.variations.map(v => {
                  if (v.id === variationId) {
                    return { ...v, sizes: v.sizes.filter(s => s.id !== sizeId) };
                  }
                  return v;
                })
              };
            }
            return p;
          })
        };
      }
      return cat;
    }));
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // ✅ UPDATED: Handle image upload with error display
  const handleImageUpload = async (categoryId, productId, e) => {
    const files = Array.from(e.target.files);
    const maxImages = 20;
    e.target.value = '';

    const currentProduct = categories
      .find(c => c.id === categoryId)?.products
      .find(p => p.id === productId);
    const currentImages = currentProduct?.images || [];
    
    if (currentImages.length >= maxImages) {
      const errorKey = getErrorKey(categoryId, productId, 'product');
      setElementError(errorKey, `Maximum ${maxImages} images allowed per product`);
      return;
    }
    
    const remainingSlots = maxImages - currentImages.length;
    const filesToProcess = files.slice(0, remainingSlots);
    
    const errorKey = getErrorKey(categoryId, productId, 'product');
    await handleProductImageUpload(categoryId, productId, filesToProcess, errorKey);
  };

  const removeImage = (categoryId, productId, imageId) => {
    const imageToRemove = categories
      .find(c => c.id === categoryId)?.products
      .find(p => p.id === productId)?.images
      .find(img => img.id === imageId);

    // ✅ FIX: Use `currentStoreId` instead of `storeId`
    if (imageToRemove?.uploaded && currentStoreId) {
      imageService.deleteImage(imageId).catch(console.error);
    }

    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          products: cat.products.map(p => {
            if (p.id === productId) {
              return { ...p, images: p.images.filter(img => img.id !== imageId) };
            }
            return p;
          })
        };
      }
      return cat;
    }));

    // Clear any errors for this product
    const errorKey = getErrorKey(categoryId, productId, 'product');
    clearElementError(errorKey);
  };

  // ✅ FIXED: Variation Image upload with error display
  const handleVariationImageUpload = async (categoryId, productId, variationId, e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const errorKey = getErrorKey(categoryId, productId, 'variant', variationId);
    clearElementError(errorKey);

    // ✅ FIX: Use `currentStoreId` instead of `storeId`
    if (!currentStoreId || !tenantId) {
      setElementError(errorKey, 'Store ID or Tenant ID missing. Please save the store first.');
      return;
    }

    setElementUploading(errorKey, true);

    try {
      const response = await imageService.uploadImage(
        currentStoreId, // ✅ Changed from storeId
        tenantId,
        'VARIANT',
        file,
        variationId
      );

      if (!response.success) {
        setElementError(errorKey, response.error || 'Variant image upload failed');
        setElementUploading(errorKey, false);
        return;
      }

      const dataUrl = await readFileAsDataURL(file);
      const newImage = {
        id: response.data.id || generateId(),
        url: response.data.url || dataUrl,
        uploaded: true
      };

      setCategories(prevCategories => prevCategories.map(cat => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            products: cat.products.map(p => {
              if (p.id === productId) {
                return {
                  ...p,
                  variations: p.variations.map(v => {
                    if (v.id === variationId) {
                      return {
                        ...v,
                        image: newImage
                      };
                    }
                    return v;
                  })
                };
              }
              return p;
            })
          };
        }
        return cat;
      }));

      clearElementError(errorKey);

    } catch (error) {
      setElementError(errorKey, error.response?.data?.error || error.message || 'Failed to upload variant image');
    } finally {
      setElementUploading(errorKey, false);
    }
  };

  const removeVariationImage = (categoryId, productId, variationId) => {
    const variation = categories
      .find(c => c.id === categoryId)?.products
      .find(p => p.id === productId)?.variations
      .find(v => v.id === variationId);

    // ✅ FIX: Use `currentStoreId` instead of `storeId`
    if (variation?.image?.uploaded && currentStoreId) {
      imageService.deleteImage(variation.image.id).catch(console.error);
    }

    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          products: cat.products.map(p => {
            if (p.id === productId) {
              return {
                ...p,
                variations: p.variations.map(v => {
                  if (v.id === variationId) {
                    return {
                      ...v,
                      image: null
                    };
                  }
                  return v;
                })
              };
            }
            return p;
          })
        };
      }
      return cat;
    }));

    // Clear any errors for this variation
    const errorKey = getErrorKey(categoryId, productId, 'variant', variationId);
    clearElementError(errorKey);
  };

  // Pricing functions
  const toggleBulkPricing = (categoryId, productId) => {
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          products: cat.products.map(p => {
            if (p.id === productId) {
              const newBulkPricing = !p.bulkPricing;
              if (newBulkPricing) {
                const firstPrice = p.variations[0]?.sizes[0]?.price || '';
                return {
                  ...p,
                  bulkPricing: newBulkPricing,
                  variations: p.variations.map(v => ({
                    ...v,
                    sizes: v.sizes.map(s => ({ ...s, price: firstPrice }))
                  }))
                };
              }
              return { ...p, bulkPricing: newBulkPricing };
            }
            return p;
          })
        };
      }
      return cat;
    }));
  };

  const updatePrice = (categoryId, productId, variationId, sizeId, value) => {
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          products: cat.products.map(p => {
            if (p.id === productId) {
              if (p.bulkPricing) {
                return {
                  ...p,
                  variations: p.variations.map(v => ({
                    ...v,
                    sizes: v.sizes.map(s => ({ ...s, price: value }))
                  }))
                };
              }
              return {
                ...p,
                variations: p.variations.map(v => {
                  if (v.id === variationId) {
                    return { ...v, sizes: v.sizes.map(s => s.id === sizeId ? { ...s, price: value } : s) };
                  }
                  return v;
                })
              };
            }
            return p;
          })
        };
      }
      return cat;
    }));
  };

  const updateDiscount = (categoryId, productId, value) => {
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          products: cat.products.map(p => {
            if (p.id === productId) {
              return { ...p, discount: Math.min(100, Math.max(0, parseInt(value) || 0)) };
            }
            return p;
          })
        };
      }
      return cat;
    }));
  };

  const openQuickPreview = () => {
    const allProducts = categories.flatMap(cat => cat.products);
    if (allProducts.length === 0) {
      showError('Please add at least one product to preview');
      return;
    }
    setShowQuickPreview(true);
  };

  const closeQuickPreview = () => {
    setShowQuickPreview(false);
  };

  return (
    <StoreBuilderLayout 
      currentStep={2} 
      totalSteps={8} 
      title="Product Listing" 
      subtitle="Step 2 of 8"
    >
      {/* Quick Preview Button */}
      <div className="mb-6">
        <button
          onClick={openQuickPreview}
          className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-[#005523] px-4 py-3 rounded-full hover:brightness-105 active:scale-[0.98] transition-all font-bold text-lg shadow-sm"
        >
          <span className="material-symbols-outlined text-2xl">visibility</span>
          Quick Preview
        </button>
      </div>

      {/* ============================================================ */}
      {/* QUICK PREVIEW MODAL */}
      {/* ============================================================ */}
      {showQuickPreview && (() => {
        // ✅ Normalize brand colors the same way Step 1 does, so this modal
        // reflects whatever's actually set there instead of a fixed green.
        const previewColors = {
          primary: brandData.brandColors?.primary || '#25D366',
          secondary: brandData.brandColors?.secondary || '#E0E3E6',
          background: brandData.brandColors?.background || '#FFFFFF',
          button: brandData.brandColors?.button || '#25D366',
          buttonLabel: brandData.brandColors?.buttonLabel || '#005523',
          fontHeader: brandData.brandColors?.fontHeader || brandData.brandColors?.font || '#191c1e',
          fontBody: brandData.brandColors?.fontBody || '#556067',
        };

        return (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
          <div className="rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto" style={{ backgroundColor: previewColors.background }}>
            <div className="sticky top-0 border-b border-[#e0e3e6] p-4 flex justify-between items-center z-10" style={{ backgroundColor: previewColors.background }}>
              <div>
                <h3 className="font-bold text-lg" style={{ color: previewColors.fontHeader }}>Quick Store Preview</h3>
                <p className="text-sm" style={{ color: previewColors.fontBody }}>See how your store looks with current products</p>
              </div>
              <button
                onClick={closeQuickPreview}
                className="hover:bg-[#eceef1] p-2 rounded-lg transition-colors"
                style={{ color: previewColors.fontBody }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 max-w-3xl mx-auto">
              {/* Hero Banner */}
              <div 
                className="relative w-full overflow-hidden rounded-xl mb-8"
                style={{ 
                  height: `${bannerHeight || 400}px`,
                  backgroundColor: bannerBgColor || previewColors.primary,
                  minHeight: '200px'
                }}
              >
                {bannerImage ? (
                  <>
                    <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 bg-black/30 flex flex-col justify-center p-6 ${textAlignment === 'left' ? 'items-start text-left' : textAlignment === 'right' ? 'items-end text-right' : 'items-center text-center'}`}>
                      {showText && (
                        <div className="max-w-2xl">
                          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-2" style={{ color: textColor || '#FFFFFF' }}>
                            {bannerTagline || 'Your store tagline'}
                          </h1>
                          <p className="text-lg md:text-xl text-white/90 drop-shadow-md" style={{ color: textColor || '#FFFFFF', opacity: 0.9 }}>
                            {bannerSubtitle || 'Your store subtitle'}
                          </p>
                        </div>
                      )}
                      {showCta && (
                        <button className="px-8 py-3 rounded-lg font-bold shadow-lg hover:opacity-90 transition-opacity mt-4" style={{ backgroundColor: previewColors.button, color: previewColors.buttonLabel }}>
                          {bannerCta || 'Shop Now'}
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className={`w-full h-full flex flex-col justify-center p-6 ${textAlignment === 'left' ? 'items-start text-left' : textAlignment === 'right' ? 'items-end text-right' : 'items-center text-center'}`}>
                    {showText && (
                      <div className="max-w-2xl">
                        <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-2" style={{ color: textColor || '#FFFFFF' }}>
                          {bannerTagline || 'Your store tagline'}
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 drop-shadow-md" style={{ color: textColor || '#FFFFFF', opacity: 0.9 }}>
                          {bannerSubtitle || 'Your store subtitle'}
                        </p>
                      </div>
                    )}
                    {showCta && (
                      <button className="px-8 py-3 rounded-lg font-bold shadow-lg hover:opacity-90 transition-opacity mt-4" style={{ backgroundColor: previewColors.button, color: previewColors.buttonLabel }}>
                        {bannerCta || 'Shop Now'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold" style={{ color: previewColors.fontHeader }}>Your Store</h1>
                <p style={{ color: previewColors.fontBody }}>Preview your products</p>
              </div>

              {categories.length === 0 ? (
                <div className="text-center py-12" style={{ color: previewColors.fontBody }}>
                  <span className="material-symbols-outlined text-6xl block mb-4 opacity-30">storefront</span>
                  <p>No categories added yet</p>
                </div>
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="mb-8">
                    <h2 className="text-xl font-bold mb-4" style={{ color: previewColors.fontHeader }}>{category.name}</h2>
                    {category.products.length === 0 ? (
                      <p className="text-sm" style={{ color: previewColors.fontBody }}>No products in this category</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {category.products.map((product) => {
                          const firstVariation = product.variations?.[0];
                          const firstSize = firstVariation?.sizes?.[0];
                          const price = firstSize?.price || '0';
                          const discount = product.discount || 0;
                          const originalPrice = discount > 0 ? parseFloat(price) / (1 - discount / 100) : price;

                          return (
                            <div key={product.id} className="rounded-lg border border-[#e0e3e6] overflow-hidden hover:shadow-md transition-shadow" style={{ backgroundColor: previewColors.background }}>
                              <div className="h-40 bg-[#f7f9fc] flex items-center justify-center overflow-hidden">
                                {product.images && product.images.length > 0 ? (
                                  <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="material-symbols-outlined text-4xl text-[#bbcbb9]">image</span>
                                )}
                              </div>
                              <div className="p-4">
                                <h4 className="font-semibold text-sm" style={{ color: previewColors.fontHeader }}>{product.name}</h4>
                                <p className="text-xs mt-1 line-clamp-2" style={{ color: previewColors.fontBody }}>{product.description || 'No description'}</p>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-lg font-bold" style={{ color: previewColors.primary }}>₹{parseFloat(price).toFixed(2)}</span>
                                  {discount > 0 && (
                                    <>
                                      <span className="text-xs line-through" style={{ color: previewColors.fontBody }}>₹{parseFloat(originalPrice).toFixed(2)}</span>
                                      <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${previewColors.primary}33`, color: previewColors.primary }}>{Math.round(discount)}% OFF</span>
                                    </>
                                  )}
                                </div>
                                {product.variations && product.variations.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs" style={{ color: previewColors.fontBody }}>
                                      {product.variations.length} variation{product.variations.length > 1 ? 's' : ''}
                                    </p>
                                  </div>
                                )}
                                <button className="w-full mt-3 py-1.5 rounded-lg font-semibold text-sm hover:brightness-105 transition-all" style={{ backgroundColor: previewColors.button, color: previewColors.buttonLabel }}>
                                  {addToCartLabel || 'Add to Cart'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="sticky bottom-0 border-t border-[#e0e3e6] p-4 flex justify-end" style={{ backgroundColor: previewColors.background }}>
              <button
                onClick={closeQuickPreview}
                className="px-6 py-2 rounded-lg font-semibold hover:brightness-105 transition-all"
                style={{ backgroundColor: previewColors.button, color: previewColors.buttonLabel }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Store-wide Settings - Two column layout */}
      <Card className="mb-6">
        <div className="flex gap-4">

          {/* LEFT: Image Settings */}
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-[#191c1e] mb-3">Image Settings</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setEnableImageZoom(!enableImageZoom)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${enableImageZoom ? 'border-[#006d2f] bg-[#f0faf4]' : 'border-[#e0e3e6]'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="material-symbols-outlined text-sm text-[#006d2f]">zoom_in</span>
                  <div className={`w-7 h-3.5 rounded-full transition-colors flex items-center px-0.5 ${enableImageZoom ? 'bg-[#006d2f]' : 'bg-[#e0e3e6]'}`}>
                    <div className={`w-2.5 h-2.5 bg-white rounded-full transition-transform ${enableImageZoom ? 'translate-x-3' : 'translate-x-0'}`} />
                  </div>
                </div>
                <p className="text-xs font-semibold text-[#191c1e]">Image Zoom</p>
                <p className="text-[10px] text-[#556067]">Tap to expand</p>
              </button>

              <button
                onClick={() => setAutoSlideProductImages(!autoSlideProductImages)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${autoSlideProductImages ? 'border-[#006d2f] bg-[#f0faf4]' : 'border-[#e0e3e6]'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="material-symbols-outlined text-sm text-[#006d2f]">slideshow</span>
                  <div className={`w-7 h-3.5 rounded-full transition-colors flex items-center px-0.5 ${autoSlideProductImages ? 'bg-[#006d2f]' : 'bg-[#e0e3e6]'}`}>
                    <div className={`w-2.5 h-2.5 bg-white rounded-full transition-transform ${autoSlideProductImages ? 'translate-x-3' : 'translate-x-0'}`} />
                  </div>
                </div>
                <p className="text-xs font-semibold text-[#191c1e]">Auto-slide</p>
                <p className="text-[10px] text-[#556067]">Slide product images</p>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px bg-[#e0e3e6]" />

          {/* RIGHT: Category Display */}
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-[#191c1e] mb-3">Category Display</h3>

            <p className="text-xs text-[#556067] mb-1.5">Shape</p>
            <div className="flex gap-2 mb-3">
              {['circle', 'square'].map(shape => (
                <button
                  key={shape}
                  onClick={() => setCategoryImageShape(shape)}
                  className={`flex-1 py-2 rounded-lg border-2 text-xs font-semibold transition-all flex flex-col items-center gap-1 ${categoryImageShape === shape ? 'border-[#006d2f] bg-[#f0faf4] text-[#006d2f]' : 'border-[#e0e3e6] text-[#556067]'}`}
                >
                  <div className={`w-4 h-4 bg-[#006d2f] opacity-60 ${shape === 'circle' ? 'rounded-full' : 'rounded-sm'}`} />
                  <span className="capitalize">{shape}</span>
                </button>
              ))}
            </div>

            <p className="text-xs text-[#556067] mb-1.5">Size</p>
            <div className="flex gap-1">
              {[
                { value: 'S', sub: '4/row' },
                { value: 'M', sub: '3/row' },
                { value: 'L', sub: '2/row' },
              ].map(size => (
                <button
                  key={size.value}
                  onClick={() => setCategoryImageSize(size.value)}
                  className={`flex-1 py-2 rounded-lg border-2 transition-all flex flex-col items-center gap-0.5 ${categoryImageSize === size.value ? 'border-[#006d2f] bg-[#f0faf4] text-[#006d2f]' : 'border-[#e0e3e6] text-[#556067]'}`}
                >
                  <span className="text-sm font-bold">{size.value}</span>
                  <span className="text-[10px]">{size.sub}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </Card>

      {/* Product CTA Label */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[#006d2f]">shopping_cart</span>
          <h2 className="font-label-md text-label-md text-[#556067] uppercase tracking-wider text-xs">Product CTA Button</h2>
        </div>
        <div className="space-y-1">
          <label className="font-label-md text-label-md text-[#3c4a3d] text-xs uppercase tracking-wider">Button Label</label>
          <Input
            value={addToCartLabel}
            onChange={(e) => setAddToCartLabel(e.target.value)}
            placeholder="Add to Cart"
            className="bg-surface-container"
          />
          <p className="text-xs text-[#8e9eab] italic">This text appears on the product card button. Default: "Add to Cart"</p>
        </div>
        <div className="mt-3 flex gap-2 flex-wrap">
          {['Add to Cart', 'Buy Now', 'Order Now', 'Shop Now', 'Get It'].map(label => (
            <button
              key={label}
              onClick={() => setAddToCartLabel(label)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${addToCartLabel === label ? 'border-[#006d2f] bg-[#006d2f]/10 text-[#006d2f]' : 'border-[#e0e3e6] text-[#556067] hover:border-[#006d2f]'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </Card>

      {/* Categories Section */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-title-lg text-title-lg text-[#191c1e]">Categories & Products</h2>
          <button onClick={() => setShowAddCategory(true)} className="flex items-center gap-1 bg-[#25D366] text-[#005523] px-4 py-2 rounded-full font-bold text-sm hover:brightness-105 active:scale-[0.98] transition-all">
            <span className="material-symbols-outlined text-base">add</span> Add Category
          </button>
        </div>

        {showAddCategory && (
          <div className="mb-4 flex gap-2">
            <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Category name" className="flex-1" onKeyPress={(e) => e.key === 'Enter' && addCategory()} />
            <button onClick={addCategory} className="px-4 py-2 bg-[#006d2f] text-white rounded-lg font-semibold hover:brightness-105 active:scale-[0.98] transition-all">Add</button>
            <button onClick={() => setShowAddCategory(false)} className="px-4 py-2 bg-[#eceef1] text-[#556067] rounded-lg hover:bg-[#d9e4ec] transition-all">Cancel</button>
          </div>
        )}

        {categories.map((category) => {
          const isCategoryExpanded = expandedCategories.has(category.id);
          const categoryImgErrorKey = `category-image-${category.id}`;
          const categoryImgError = errorStates[categoryImgErrorKey];
          const isCategoryImgUploading = uploadingStates[categoryImgErrorKey];

          return (
          <Card key={category.id} className="mb-4 bg-[#f2f4f7] border border-[#bbcbb9]/20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleExpanded(setExpandedCategories, category.id)}
                className="text-[#556067] hover:text-[#006d2f] p-1 rounded-lg transition-colors"
                title={isCategoryExpanded ? 'Collapse' : 'Expand'}
              >
                <span className="material-symbols-outlined">
                  {isCategoryExpanded ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* Category image thumbnail — always visible so a collapsed
                  category is still identifiable at a glance */}
              <div className="w-10 h-10 rounded-lg bg-white border border-[#bbcbb9] overflow-hidden flex-shrink-0 flex items-center justify-center">
                {category.image?.url ? (
                  <img src={category.image.url} alt={category.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-[#bbcbb9] text-lg">category</span>
                )}
              </div>

              {isCategoryExpanded ? (
                <div className="flex-1">
                  <label className="font-label-md text-label-md text-[#3c4a3d] block uppercase tracking-wider text-xs mb-1">Category Name</label>
                  <Input value={category.name} onChange={(e) => setCategories(categories.map(cat => cat.id === category.id ? { ...cat, name: e.target.value } : cat))} className="bg-white" />
                </div>
              ) : (
                <div className="flex-1 flex items-center gap-2">
                  <span className="font-semibold text-[#191c1e]">{category.name || 'Untitled Category'}</span>
                  <span className="text-xs text-[#8e9eab]">({category.products.length} product{category.products.length === 1 ? '' : 's'})</span>
                </div>
              )}

              <button onClick={() => deleteCategory(category.id)} className="text-[#ba1a1a] hover:bg-[#ffdad6]/50 p-2 rounded-lg transition-colors">
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>

            {isCategoryExpanded && (
              <>
                {/* ✅ Category Image Upload — was a pure visual placeholder
                    before with no click handler or file input at all */}
                <div className="mt-3 mb-3">
                  <label className="font-label-md text-label-md text-[#3c4a3d] block uppercase tracking-wider text-xs mb-1">Category Image</label>
                  <div className="flex items-center gap-3">
                    {category.image?.url ? (
                      <div className="relative w-16 h-16 rounded-lg bg-white border border-[#bbcbb9] overflow-hidden group">
                        <img src={category.image.url} alt={category.name} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeCategoryImage(category.id)}
                          className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl hover:bg-black/70 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                      </div>
                    ) : (
                      <div
                        className="w-16 h-16 rounded-lg bg-[#f2f4f7] border-2 border-dashed border-[#bbcbb9] flex items-center justify-center text-[#556067] hover:text-[#006d2f] hover:border-[#006d2f] cursor-pointer transition-colors"
                        onClick={() => {
                          const input = document.getElementById(`category-image-${category.id}`);
                          if (input) input.click();
                        }}
                      >
                        {isCategoryImgUploading ? (
                          <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined">add_a_photo</span>
                        )}
                      </div>
                    )}
                    <input
                      id={`category-image-${category.id}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCategoryImageUpload(category.id, file);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                    <div>
                      <p className="text-xs font-medium text-gray-600">Upload Category Image</p>
                      <ImageGuidelineBadge size="400×400px" format="JPG/PNG" maxSize="1MB" ratio="1:1" />
                      {categoryImgError && (
                        <div className="mt-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200 flex items-start gap-1">
                          <span className="material-symbols-outlined text-sm">error</span>
                          <span>{categoryImgError}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {category.products.map((product) => {
                    const errorKey = getErrorKey(category.id, product.id, 'product');
                    const productError = errorStates[errorKey];
                    const isUploading = uploadingStates[errorKey];
                    const isProductExpanded = expandedProducts.has(product.id);
                    const isDragOver = dragOverProductId === product.id && draggedProduct?.categoryId === category.id && draggedProduct?.productId !== product.id;
                    const thumbnail = product.images?.[0]?.url;

                    return (
                      <Card
                        key={product.id}
                        className={`bg-white border transition-all ${isDragOver ? 'border-[#006d2f] border-2' : 'border-[#bbcbb9]/10'}`}
                        onDragOver={handleProductDragOver(product.id)}
                        onDrop={handleProductDrop(category.id, product.id)}
                      >
                        {/* Row header — drag handle + collapse toggle + thumbnail + name, always visible */}
                        <div className="flex items-center gap-2">
                          <span
                            draggable
                            onDragStart={handleProductDragStart(category.id, product.id)}
                            onDragEnd={handleProductDragEnd}
                            className="material-symbols-outlined text-[#bbcbb9] hover:text-[#556067] cursor-grab active:cursor-grabbing"
                            title="Drag to reorder"
                          >
                            drag_indicator
                          </span>
                          <button
                            onClick={() => toggleExpanded(setExpandedProducts, product.id)}
                            className="text-[#556067] hover:text-[#006d2f] p-1 rounded-lg transition-colors"
                            title={isProductExpanded ? 'Collapse' : 'Expand'}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {isProductExpanded ? 'expand_less' : 'expand_more'}
                            </span>
                          </button>

                          {!isProductExpanded && (
                            <div className="w-8 h-8 rounded bg-[#f2f4f7] border border-[#bbcbb9] overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {thumbnail ? (
                                <img src={thumbnail} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="material-symbols-outlined text-[#bbcbb9] text-sm">inventory_2</span>
                              )}
                            </div>
                          )}

                          {isProductExpanded ? (
                            <Input
                              value={product.name}
                              onChange={(e) => setCategories(categories.map(cat => cat.id === category.id ? { ...cat, products: cat.products.map(p => p.id === product.id ? { ...p, name: e.target.value } : p) } : cat))}
                              placeholder="Product Name"
                              className="flex-1"
                            />
                          ) : (
                            <span className="flex-1 font-medium text-[#191c1e] text-sm">{product.name || 'Untitled Product'}</span>
                          )}

                          <button
                            onClick={() => deleteProduct(category.id, product.id)}
                            className="text-[#ba1a1a] hover:bg-[#ffdad6]/50 p-1 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>

                        {isProductExpanded && (
                          <div className="flex items-start gap-4 mt-3">
                            {/* Product Images */}
                            <div className="flex-shrink-0">
                              <div className="grid grid-cols-3 gap-1 w-24">
                                {product.images && product.images.map((img) => (
                                  <div key={img.id} className="relative aspect-square rounded bg-[#f2f4f7] border border-[#bbcbb9] overflow-hidden group">
                                    <img src={img.url} alt="Product" className="w-full h-full object-cover" />
                                    <button
                                      onClick={() => removeImage(category.id, product.id, img.id)}
                                      className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl hover:bg-black/70 transition-colors"
                                    >
                                      <span className="material-symbols-outlined text-xs">close</span>
                                    </button>
                                  </div>
                                ))}
                                {product.images && product.images.length < 20 && (
                                  <div
                                    className="aspect-square rounded bg-[#f2f4f7] border-2 border-dashed border-[#bbcbb9] flex items-center justify-center text-[#556067] hover:text-[#006d2f] hover:border-[#006d2f] cursor-pointer transition-colors relative"
                                    onClick={() => {
                                      const input = document.getElementById(`image-upload-${product.id}`);
                                      if (input) input.click();
                                    }}
                                  >
                                    {isUploading ? (
                                      <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                                    ) : (
                                      <span className="material-symbols-outlined text-base">add_a_photo</span>
                                    )}
                                  </div>
                                )}
                                <input
                                  id={`image-upload-${product.id}`}
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => handleImageUpload(category.id, product.id, e)}
                                  className="hidden"
                                />
                              </div>
                              <div className="mt-1">
                                <p className="text-[10px] text-gray-400">
                                  {product.images?.length || 0}/20 • Recommended: 800×800px • Max 2MB • JPG/PNG
                                </p>
                              </div>
                              {productError && (
                                <div className="mt-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200 flex items-start gap-1">
                                  <span className="material-symbols-outlined text-sm">error</span>
                                  <span>{productError}</span>
                                </div>
                              )}
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 space-y-2">
                              <div>
                                <label className="font-label-md text-label-md text-[#3c4a3d] block uppercase tracking-wider text-xs">Product Description</label>
                                <textarea
                                  value={product.description}
                                  onChange={(e) => setCategories(categories.map(cat => cat.id === category.id ? { ...cat, products: cat.products.map(p => p.id === product.id ? { ...p, description: e.target.value } : p) } : cat))}
                                  className="w-full px-3 py-2 bg-[#f2f4f7] rounded-lg border border-[#bbcbb9] font-body-md text-body-md outline-none focus:ring-2 focus:ring-[#25D366] focus:border-[#006d2f] min-h-[60px]"
                                  placeholder="Enter product description..."
                                />
                              </div>
                              <div className="flex flex-wrap items-center gap-4">
                                <Toggle label="Apply same price to all sizes" checked={product.bulkPricing || false} onChange={() => toggleBulkPricing(category.id, product.id)} />
                                <div className="flex items-center gap-2">
                                  <label className="font-label-md text-label-md text-[#3c4a3d] text-xs whitespace-nowrap">Discount %</label>
                                  <Input type="number" value={product.discount || 0} onChange={(e) => updateDiscount(category.id, product.id, e.target.value)} className="w-16 bg-[#f2f4f7] text-center" min="0" max="100" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Variations */}
                        {isProductExpanded && (
                        <div className="mt-3 pt-3 border-t border-[#bbcbb9]/10">
                          <div className="flex items-center justify-between">
                            <p className="font-label-md text-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">Variations (Max 10)</p>
                            <button
                              onClick={() => addVariation(category.id, product.id)}
                              className="text-[#006d2f] flex items-center gap-1 hover:bg-[#25D366]/10 px-2 py-1 rounded text-sm font-semibold"
                            >
                              <span className="material-symbols-outlined text-base">add_circle</span> Add Variation/Color/Design
                            </button>
                          </div>

                          {product.variations.map((variation) => {
                            const variantErrorKey = getErrorKey(category.id, product.id, 'variant', variation.id);
                            const variantError = errorStates[variantErrorKey];
                            const isVariantUploading = uploadingStates[variantErrorKey];
                            const isVariationExpanded = expandedVariations.has(variation.id);

                            return (
                              <div key={variation.id} className="bg-[#f2f4f7] p-3 rounded-lg mt-2">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => toggleExpanded(setExpandedVariations, variation.id)}
                                    className="text-[#556067] hover:text-[#006d2f] p-0.5 rounded transition-colors"
                                    title={isVariationExpanded ? 'Collapse' : 'Expand'}
                                  >
                                    <span className="material-symbols-outlined text-base">
                                      {isVariationExpanded ? 'expand_less' : 'expand_more'}
                                    </span>
                                  </button>
                                  <Input
                                    placeholder="Variation Name (e.g. Organic)"
                                    value={variation.name}
                                    onChange={(e) => setCategories(categories.map(cat => {
                                      if (cat.id === category.id) {
                                        return {
                                          ...cat,
                                          products: cat.products.map(p => {
                                            if (p.id === product.id) {
                                              return {
                                                ...p,
                                                variations: p.variations.map(v => {
                                                  if (v.id === variation.id) {
                                                    return { ...v, name: e.target.value };
                                                  }
                                                  return v;
                                                })
                                              };
                                            }
                                            return p;
                                          })
                                        };
                                      }
                                      return cat;
                                    }))}
                                    className="flex-1"
                                  />
                                  {!isVariationExpanded && variation.sizes?.length > 0 && (
                                    <span className="text-xs text-[#8e9eab] whitespace-nowrap">
                                      {variation.sizes.length} size{variation.sizes.length === 1 ? '' : 's'}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => deleteVariation(category.id, product.id, variation.id)}
                                    className="text-[#ba1a1a] hover:bg-[#ffdad6]/50 p-1 rounded-full"
                                  >
                                    <span className="material-symbols-outlined text-base">delete</span>
                                  </button>
                                </div>

                                {isVariationExpanded && (
                                <>
                                {/* Variation Image */}
                                <div className="mt-2 flex items-center gap-2">
                                  {variation.image ? (
                                    <div className="relative w-10 h-10 rounded bg-[#f2f4f7] border border-[#bbcbb9] overflow-hidden group">
                                      <img src={variation.image.url} alt="Variation" className="w-full h-full object-cover" />
                                      <button
                                        onClick={() => removeVariationImage(category.id, product.id, variation.id)}
                                        className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl hover:bg-black/70 transition-colors"
                                      >
                                        <span className="material-symbols-outlined text-[10px]">close</span>
                                      </button>
                                    </div>
                                  ) : (
                                    <div
                                      className="w-10 h-10 rounded bg-[#f2f4f7] border-2 border-dashed border-[#bbcbb9] flex items-center justify-center text-[#556067] hover:text-[#006d2f] hover:border-[#006d2f] cursor-pointer transition-colors relative"
                                      onClick={() => {
                                        const input = document.getElementById(`variation-image-${variation.id}`);
                                        if (input) input.click();
                                      }}
                                    >
                                      {isVariantUploading ? (
                                        <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                      ) : (
                                        <span className="material-symbols-outlined text-sm">add_a_photo</span>
                                      )}
                                    </div>
                                  )}
                                  <input
                                    id={`variation-image-${variation.id}`}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleVariationImageUpload(category.id, product.id, variation.id, e)}
                                    className="hidden"
                                  />
                                  <div>
                                    <p className="text-xs text-gray-500">Variant Image</p>
                                    <p className="text-[10px] text-gray-400">100×100px • 30KB • 1:1</p>
                                    {variantError && (
                                      <div className="mt-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 flex items-start gap-0.5">
                                        <span className="material-symbols-outlined text-sm">error</span>
                                        <span>{variantError}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Sizes */}
                                <div className="mt-2 pl-4">
                                  <div className="grid grid-cols-12 gap-2 items-center text-xs text-[#556067] uppercase font-semibold mb-1">
                                    <div className="col-span-3">Size</div>
                                    <div className="col-span-3">Unit</div>
                                    <div className="col-span-5">Price</div>
                                    <div className="col-span-1"></div>
                                  </div>

                                  {variation.sizes.map((size) => {
                                    const isBulkPricing = product.bulkPricing || false;
                                    const firstPrice = variation.sizes[0]?.price || '';
                                    const displayPrice = isBulkPricing ? firstPrice : size.price;

                                    return (
                                      <div key={size.id} className="grid grid-cols-12 gap-2 items-center mb-1">
                                        <Input
                                          className="col-span-3"
                                          value={size.size}
                                          placeholder="e.g. 5"
                                          onChange={(e) => setCategories(categories.map(cat => {
                                            if (cat.id === category.id) {
                                              return {
                                                ...cat,
                                                products: cat.products.map(p => {
                                                  if (p.id === product.id) {
                                                    return {
                                                      ...p,
                                                      variations: p.variations.map(v => {
                                                        if (v.id === variation.id) {
                                                          return {
                                                            ...v,
                                                            sizes: v.sizes.map(s => {
                                                              if (s.id === size.id) {
                                                                return { ...s, size: e.target.value };
                                                              }
                                                              return s;
                                                            })
                                                          };
                                                        }
                                                        return v;
                                                      })
                                                    };
                                                  }
                                                  return p;
                                                })
                                              };
                                            }
                                            return cat;
                                          }))}
                                        />
                                        <Input
                                          className="col-span-3"
                                          value={size.unit}
                                          placeholder="kg"
                                          onChange={(e) => setCategories(categories.map(cat => {
                                            if (cat.id === category.id) {
                                              return {
                                                ...cat,
                                                products: cat.products.map(p => {
                                                  if (p.id === product.id) {
                                                    return {
                                                      ...p,
                                                      variations: p.variations.map(v => {
                                                        if (v.id === variation.id) {
                                                          return {
                                                            ...v,
                                                            sizes: v.sizes.map(s => {
                                                              if (s.id === size.id) {
                                                                return { ...s, unit: e.target.value };
                                                              }
                                                              return s;
                                                            })
                                                          };
                                                        }
                                                        return v;
                                                      })
                                                    };
                                                  }
                                                  return p;
                                                })
                                              };
                                            }
                                            return cat;
                                          }))}
                                        />
                                        <div className="col-span-5 flex items-center gap-1 bg-white px-2 py-1 rounded border border-[#bbcbb9]">
                                          <span className="text-xs text-[#556067]">₹</span>
                                          <Input
                                            value={displayPrice}
                                            placeholder={isBulkPricing ? 'Auto-filled' : '0'}
                                            disabled={isBulkPricing}
                                            className={`border-none bg-transparent p-0 w-full ${isBulkPricing ? 'opacity-60 cursor-not-allowed' : ''}`}
                                            onChange={(e) => {
                                              if (!isBulkPricing) {
                                                updatePrice(category.id, product.id, variation.id, size.id, e.target.value);
                                              }
                                            }}
                                          />
                                        </div>
                                        <button
                                          onClick={() => deleteSize(category.id, product.id, variation.id, size.id)}
                                          className="col-span-1 text-[#ba1a1a] hover:bg-[#ffdad6]/50 p-1 rounded-full"
                                          disabled={isBulkPricing && variation.sizes.length === 1}
                                        >
                                          <span className="material-symbols-outlined text-base">delete</span>
                                        </button>
                                      </div>
                                    );
                                  })}

                                  <button
                                    onClick={() => addSize(category.id, product.id, variation.id)}
                                    className="flex items-center gap-1 text-[#006d2f] hover:bg-[#25D366]/10 px-3 py-1 rounded-lg mt-1 text-sm font-semibold"
                                  >
                                    <span className="material-symbols-outlined text-base">add</span> Add Size
                                  </button>
                                </div>
                                </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        )}
                      </Card>
                    );
                  })}
                  <button
                    onClick={() => addProduct(category.id)}
                    className="w-full py-2 border-2 border-dashed border-[#bbcbb9] rounded-lg text-[#556067] hover:text-[#006d2f] hover:border-[#006d2f] transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-base">add_circle</span> Add Product
                  </button>
                </div>
              </>
            )}
          </Card>
          );
        })}
      </Card>

      {/* Hero Banner Section */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[#006d2f]">image</span>
          <h2 className="font-label-md text-label-md text-[#556067] uppercase tracking-wider text-xs">Hero Banner Properties</h2>
        </div>

        <div className="space-y-3 mb-4">
          <label className="font-label-md text-label-md text-[#3c4a3d] block uppercase tracking-wider text-xs">Banner Image</label>
          <div 
            className="relative h-32 w-full rounded-lg bg-[#f2f4f7] border-2 border-dashed border-[#bbcbb9] overflow-hidden group cursor-pointer hover:border-[#006d2f] transition-colors"
            onClick={() => {
              const input = document.getElementById('banner-upload');
              if (input) input.click();
            }}
          >
            {bannerImage ? (
              <>
                <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">Change Banner</span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#556067] group-hover:text-[#006d2f] transition-colors">
                <span className="material-symbols-outlined text-3xl mb-1">upload_file</span>
                <span className="font-caption text-caption text-xs">Upload banner image</span>
                <div className="flex gap-3 mt-1 text-[10px] text-gray-400">
                  <span>📐 1200×375px</span>
                  <span>📄 PNG/JPG</span>
                  <span>📦 300KB</span>
                  <span>📐 16:5</span>
                </div>
              </div>
            )}
            <input
              id="banner-upload"
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;

                // ✅ FIX: This used to read the file into a base64 data URI
                // client-side (FileReader.readAsDataURL) and store that
                // directly — completely bypassing the server upload that
                // every other image field (logo, product, gallery, variant,
                // category) correctly goes through. That's why it wasn't
                // behaving like the others: it was never actually uploaded
                // or given a real, persistent server URL. Now uses the same
                // imageService upload path as everything else, via the
                // existing HERO image type endpoint.
                if (!currentStoreId || !tenantId) {
                  setElementError('banner', 'Store ID or Tenant ID missing. Please save the store first');
                  return;
                }

                clearElementError('banner');
                setElementUploading('banner', true);
                try {
                  const response = await imageService.uploadImage(currentStoreId, tenantId, 'HERO', file);
                  if (response.success) {
                    setBannerImage(response.data.url);
                  } else {
                    setElementError('banner', response.error || 'Banner upload failed');
                  }
                } catch (error) {
                  setElementError('banner', error.response?.data?.error || error.message || 'Failed to upload banner image');
                } finally {
                  setElementUploading('banner', false);
                }
              }}
              className="hidden"
            />
          </div>
          {uploadingStates['banner'] && (
            <p className="text-xs text-[#556067]">Uploading banner image...</p>
          )}
          {errorStates['banner'] && (
            <p className="text-xs text-red-600">{errorStates['banner']}</p>
          )}
          <ImageGuidelineBadge size="1200×375px" format="PNG/JPG" maxSize="300KB" ratio="16:5" />
        </div>

        <div className="space-y-3">
          <div>
            <label className="font-label-md text-label-md text-[#3c4a3d] block uppercase tracking-wider text-xs mb-1">Tagline</label>
            <Input value={bannerTagline} onChange={(e) => setBannerTagline(e.target.value)} placeholder="e.g. Fresh, Organic & Delivered" className="bg-white border border-[#bbcbb9] rounded-lg" />
          </div>
          <div>
            <label className="font-label-md text-label-md text-[#3c4a3d] block uppercase tracking-wider text-xs mb-1">Subtitle</label>
            <Input value={bannerSubtitle} onChange={(e) => setBannerSubtitle(e.target.value)} placeholder="e.g. 100% Natural Stone-Ground Flour" className="bg-white border border-[#bbcbb9] rounded-lg" />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[#e0e3e6]">
            <span className="font-body-md text-[#191c1e] font-medium">Show Tagline & Subtitle</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={showText} onChange={() => setShowText(!showText)} className="sr-only peer" />
              <div className={`w-11 h-6 rounded-full transition-all duration-200 ease-in-out ${showText ? 'bg-[#006d2f]' : 'bg-[#e0e3e6]'} peer-focus:ring-2 peer-focus:ring-[#25D366]/50 relative`}>
                <div className={`absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-all duration-200 ease-in-out border border-gray-300 ${showText ? 'translate-x-5' : 'translate-x-0'} shadow-sm`} />
              </div>
            </label>
          </div>

          <div>
            <label className="font-label-md text-label-md text-[#3c4a3d] block uppercase tracking-wider text-xs mb-1">Text Alignment</label>
            <div className="flex gap-2">
              {['left', 'center', 'right'].map((align) => (
                <button key={align} onClick={() => setTextAlignment(align)} className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all flex items-center justify-center gap-1 ${textAlignment === align ? 'border-[#006d2f] bg-[#25D366]/10 text-[#006d2f]' : 'border-[#bbcbb9] hover:border-[#006d2f]'}`}>
                  <span className="material-symbols-outlined text-base">{`format_align_${align}`}</span> {align.charAt(0).toUpperCase() + align.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-label-md text-label-md text-[#3c4a3d] block uppercase tracking-wider text-xs mb-1">Text Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-10 h-10 rounded-lg border-2 border-[#bbcbb9] cursor-pointer hover:scale-105 transition-transform p-0"
                style={{ 
                  backgroundColor: textColor,
                  WebkitAppearance: 'none',
                  border: 'none',
                  outline: 'none',
                }}
              />
              <style>{`
                input[type="color"]::-webkit-color-swatch-wrapper {
                  padding: 0;
                }
                input[type="color"]::-webkit-color-swatch {
                  border: 2px solid white;
                  border-radius: 8px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                input[type="color"]::-moz-color-swatch {
                  border: 2px solid white;
                  border-radius: 8px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
              `}</style>
              <code className="text-sm bg-[#f2f4f7] px-3 py-1 rounded-lg text-[#3c4a3d]">{textColor}</code>
            </div>
          </div>

          <div>
            <label className="font-label-md text-label-md text-[#3c4a3d] block uppercase tracking-wider text-xs mb-1">CTA Text</label>
            <Input value={bannerCta} onChange={(e) => setBannerCta(e.target.value)} placeholder="e.g. Shop Now" className="bg-white border border-[#bbcbb9] rounded-lg" />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[#e0e3e6]">
            <span className="font-body-md text-[#191c1e] font-medium">Show CTA Button</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={showCta} onChange={() => setShowCta(!showCta)} className="sr-only peer" />
              <div className={`w-11 h-6 rounded-full transition-all duration-200 ease-in-out ${showCta ? 'bg-[#006d2f]' : 'bg-[#e0e3e6]'} peer-focus:ring-2 peer-focus:ring-[#25D366]/50 relative`}>
                <div className={`absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-all duration-200 ease-in-out border border-gray-300 ${showCta ? 'translate-x-5' : 'translate-x-0'} shadow-sm`} />
              </div>
            </label>
          </div>

          <div>
            <label className="font-label-md text-label-md text-[#3c4a3d] block uppercase tracking-wider text-xs mb-1">Height</label>
            <div className="flex items-center gap-4">
              <input type="range" min="200" max="800" value={bannerHeight} onChange={(e) => setBannerHeight(parseInt(e.target.value))} className="flex-1 h-1.5 bg-[#e0e3e6] rounded-lg appearance-none cursor-pointer accent-[#006d2f]" />
              <span className="text-sm font-semibold text-[#006d2f] min-w-[50px] text-right">{bannerHeight}px</span>
            </div>
          </div>

          <div>
            <label className="font-label-md text-label-md text-[#3c4a3d] block uppercase tracking-wider text-xs mb-1">Background Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={bannerBgColor}
                onChange={(e) => setBannerBgColor(e.target.value)}
                className="w-10 h-10 rounded-lg border-2 border-[#bbcbb9] cursor-pointer hover:scale-105 transition-transform p-0"
                style={{ 
                  backgroundColor: bannerBgColor,
                  WebkitAppearance: 'none',
                  border: 'none',
                  outline: 'none',
                }}
              />
              <style>{`
                input[type="color"]::-webkit-color-swatch-wrapper {
                  padding: 0;
                }
                input[type="color"]::-webkit-color-swatch {
                  border: 2px solid white;
                  border-radius: 8px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                input[type="color"]::-moz-color-swatch {
                  border: 2px solid white;
                  border-radius: 8px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
              `}</style>
              <code className="text-sm bg-[#f2f4f7] px-3 py-1 rounded-lg text-[#3c4a3d]">{bannerBgColor}</code>
            </div>
          </div>
        </div>
      </Card>
    </StoreBuilderLayout>
  );
};

export default Step2_ProductConfig;