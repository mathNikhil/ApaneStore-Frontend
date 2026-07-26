import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreBuilder } from '../../Context/StoreBuilderContext';
import StoreBuilderLayout from './StoreBuilderLayout';
import Card from '../Common/Card';
import Input from '../Common/Input';
import Toggle from '../Common/Toggle';

const Step2_ProductConfig = () => {
  const navigate = useNavigate();
  const { productData, setProductData } = useStoreBuilder();

  // Load from context on mount
  const [categories, setCategories] = useState(() => 
    productData.categories?.length > 0 ? productData.categories : [
      {
        id: 1,
        name: 'Flours & Grains',
        products: [
          {
            id: 1,
            name: 'Whole Wheat Flour',
            description: 'Premium quality stone-ground whole wheat flour',
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

  // Hero Banner State - Load from context
  const [bannerImage, setBannerImage] = useState(productData.banner?.image || null);
  const [bannerTagline, setBannerTagline] = useState(productData.banner?.tagline || 'Fresh, Organic & Delivered');
  const [bannerSubtitle, setBannerSubtitle] = useState(productData.banner?.subtitle || '100% Natural Stone-Ground Flour');
  const [bannerCta, setBannerCta] = useState(productData.banner?.cta || 'Shop Now');
  const [bannerHeight, setBannerHeight] = useState(productData.banner?.height || 400);
  const [bannerBgColor, setBannerBgColor] = useState(productData.banner?.bgColor || '#25D366');
  const [showCta, setShowCta] = useState(productData.banner?.showCta !== undefined ? productData.banner.showCta : true);
  const [showText, setShowText] = useState(productData.banner?.showText !== undefined ? productData.banner.showText : true);
  const [textAlignment, setTextAlignment] = useState(productData.banner?.textAlignment || 'center');
  const [textColor, setTextColor] = useState(productData.banner?.textColor || '#FFFFFF');

  // Store-wide setting — applies to every product/category at once, not per-item
  const [enableImageZoom, setEnableImageZoom] = useState(productData.enableImageZoom !== false);

  // UI State
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showQuickPreview, setShowQuickPreview] = useState(false);
  const fileInputRefs = useRef({});
  const variationImageInputRefs = useRef({});

  // Save to context whenever data changes
  useEffect(() => {
    setProductData({
      categories: categories,
      enableImageZoom: enableImageZoom,
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
  }, [categories, bannerImage, bannerTagline, bannerSubtitle, bannerCta, bannerHeight, bannerBgColor, showCta, showText, textAlignment, textColor, enableImageZoom]);

  const generateId = () => Date.now() + Math.random() * 1000;

  // Category functions
  const addCategory = () => {
    if (newCategoryName.trim()) {
      setCategories([{ id: generateId(), name: newCategoryName, products: [] }, ...categories]);
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  const deleteCategory = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(cat => cat.id !== categoryId));
    }
  };

  // Product functions - New product added at BOTTOM
  const addProduct = (categoryId) => {
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        const newProduct = {
          id: generateId(),
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

  // Variation functions - New variation added at TOP
  const addVariation = (categoryId, productId) => {
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          products: cat.products.map(p => {
            if (p.id === productId) {
              const newVariation = {
                id: generateId(),
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

  // Size functions
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

  // Product Image functions - Max 20 images
  const handleImageUpload = (categoryId, productId, e) => {
    const files = Array.from(e.target.files);
    const maxImages = 20;

    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          products: cat.products.map(p => {
            if (p.id === productId) {
              const currentImages = p.images || [];
              if (currentImages.length >= maxImages) { 
                alert(`Maximum ${maxImages} images allowed per product`); 
                return p; 
              }
              const remainingSlots = maxImages - currentImages.length;
              const newImages = files.slice(0, remainingSlots).map(file => ({ 
                id: generateId(), 
                url: URL.createObjectURL(file), 
                file 
              }));
              return { 
                ...p, 
                images: [...currentImages, ...newImages] 
              };
            }
            return p;
          })
        };
      }
      return cat;
    }));
    e.target.value = '';
  };

  const removeImage = (categoryId, productId, imageId) => {
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
  };

  // Variation Image function — single image per variant, replaces any existing one
  const handleVariationImageUpload = (categoryId, productId, variationId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
                      image: { id: generateId(), url: URL.createObjectURL(file), file }
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
    e.target.value = '';
  };

  const removeVariationImage = (categoryId, productId, variationId) => {
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

  // Quick Preview - Show FULL PAGE with all products
  const openQuickPreview = () => {
    const allProducts = categories.flatMap(cat => cat.products);
    if (allProducts.length === 0) {
      alert('Please add at least one product to preview');
      return;
    }
    setShowQuickPreview(true);
  };

  const closeQuickPreview = () => {
    setShowQuickPreview(false);
  };

  return (
    <StoreBuilderLayout currentStep={2} totalSteps={8} title="Product listing" subtitle="Step 2 of 8">
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
      {/* QUICK PREVIEW MODAL - FULL PAGE WITH ALL PRODUCTS */}
      {/* ============================================================ */}
      {showQuickPreview && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-[#e0e3e6] p-4 flex justify-between items-center z-10">
              <div>
                <h3 className="font-bold text-lg text-[#191c1e]">Quick Store Preview</h3>
                <p className="text-sm text-[#556067]">See how your store looks with current products</p>
              </div>
              <button
                onClick={closeQuickPreview}
                className="text-[#556067] hover:bg-[#eceef1] p-2 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Store Preview Content */}
            <div className="p-6 max-w-3xl mx-auto">
              {/* Hero Banner */}
              <div 
                className="relative w-full overflow-hidden rounded-xl mb-8"
                style={{ 
                  height: `${bannerHeight || 400}px`,
                  backgroundColor: bannerBgColor || '#25D366',
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
                            {bannerTagline || 'Fresh, Organic & Delivered'}
                          </h1>
                          <p className="text-lg md:text-xl text-white/90 drop-shadow-md" style={{ color: textColor || '#FFFFFF', opacity: 0.9 }}>
                            {bannerSubtitle || '100% Natural Stone-Ground Flour'}
                          </p>
                        </div>
                      )}
                      {showCta && (
                        <button className="px-8 py-3 rounded-lg font-bold text-white shadow-lg hover:opacity-90 transition-opacity mt-4" style={{ backgroundColor: '#25D366' }}>
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
                          {bannerTagline || 'Fresh, Organic & Delivered'}
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 drop-shadow-md" style={{ color: textColor || '#FFFFFF', opacity: 0.9 }}>
                          {bannerSubtitle || '100% Natural Stone-Ground Flour'}
                        </p>
                      </div>
                    )}
                    {showCta && (
                      <button className="px-8 py-3 rounded-lg font-bold text-white shadow-lg hover:opacity-90 transition-opacity mt-4" style={{ backgroundColor: '#25D366' }}>
                        {bannerCta || 'Shop Now'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Store Name */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-[#191c1e]">Your Store</h1>
                <p className="text-[#556067]">Preview your products</p>
              </div>

              {/* Categories & Products */}
              {categories.length === 0 ? (
                <div className="text-center py-12 text-[#556067]">
                  <span className="material-symbols-outlined text-6xl block mb-4 opacity-30">storefront</span>
                  <p>No categories added yet</p>
                </div>
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="mb-8">
                    <h2 className="text-xl font-bold mb-4 text-[#191c1e]">{category.name}</h2>
                    
                    {category.products.length === 0 ? (
                      <p className="text-sm text-[#556067]">No products in this category</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {category.products.map((product) => {
                          // Get first variation and size for display
                          const firstVariation = product.variations?.[0];
                          const firstSize = firstVariation?.sizes?.[0];
                          const price = firstSize?.price || '0';
                          const discount = product.discount || 0;
                          const originalPrice = discount > 0 ? parseFloat(price) / (1 - discount / 100) : price;

                          return (
                            <div key={product.id} className="bg-white rounded-lg border border-[#e0e3e6] overflow-hidden hover:shadow-md transition-shadow">
                              {/* Product Image */}
                              <div className="h-40 bg-[#f7f9fc] flex items-center justify-center overflow-hidden">
                                {product.images && product.images.length > 0 ? (
                                  <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="material-symbols-outlined text-4xl text-[#bbcbb9]">image</span>
                                )}
                              </div>

                              <div className="p-4">
                                <h4 className="font-semibold text-sm text-[#191c1e]">{product.name}</h4>
                                <p className="text-xs text-[#556067] mt-1 line-clamp-2">{product.description || 'No description'}</p>

                                {/* Price with Discount */}
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-lg font-bold text-[#006d2f]">₹{parseFloat(price).toFixed(2)}</span>
                                  {discount > 0 && (
                                    <>
                                      <span className="text-xs line-through text-[#556067]">₹{parseFloat(originalPrice).toFixed(2)}</span>
                                      <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-[#25D366]/20 text-[#006d2f]">{Math.round(discount)}% OFF</span>
                                    </>
                                  )}
                                </div>

                                {/* Variations count */}
                                {product.variations && product.variations.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs text-[#556067]">
                                      {product.variations.length} variation{product.variations.length > 1 ? 's' : ''}
                                    </p>
                                  </div>
                                )}

                                <button className="w-full mt-3 py-1.5 rounded-lg font-semibold text-sm bg-[#25D366] text-[#005523] hover:brightness-105 transition-all">
                                  Add to Cart
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

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-[#e0e3e6] p-4 flex justify-end">
              <button
                onClick={closeQuickPreview}
                className="px-6 py-2 rounded-lg font-semibold bg-[#25D366] text-[#005523] hover:brightness-105 transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* REST OF THE STEP 2 CONTENT - Categories, Products, Banner */}
      {/* ============================================================ */}

      {/* Store-wide Image Settings — applies to every product & category at once */}
      <Card className="mb-6">
        <h2 className="font-title-lg text-title-lg text-[#191c1e] mb-4">Image Settings</h2>
        <Toggle
          label="Allow customers to expand/zoom product images"
          description="When enabled, tapping a product image opens a bigger view with all variants, sizes and pricing — applies to every product across every category"
          checked={enableImageZoom}
          onChange={() => setEnableImageZoom(!enableImageZoom)}
        />
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

        {categories.map((category) => (
          <Card key={category.id} className="mb-4 bg-[#f2f4f7] border border-[#bbcbb9]/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <label className="font-label-md text-label-md text-[#3c4a3d] block uppercase tracking-wider text-xs mb-1">Category Name</label>
                <Input value={category.name} onChange={(e) => setCategories(categories.map(cat => cat.id === category.id ? { ...cat, name: e.target.value } : cat))} className="bg-white" />
              </div>
              <button onClick={() => deleteCategory(category.id)} className="mt-5 text-[#ba1a1a] hover:bg-[#ffdad6]/50 p-2 rounded-lg transition-colors">
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>

            <div className="space-y-3">
              {category.products.map((product) => (
                <Card key={product.id} className="bg-white border border-[#bbcbb9]/10">
                  <div className="flex items-start gap-4">
                    {/* Product Images - Max 20 */}
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
                            className="aspect-square rounded bg-[#f2f4f7] border-2 border-dashed border-[#bbcbb9] flex items-center justify-center text-[#556067] hover:text-[#006d2f] hover:border-[#006d2f] cursor-pointer transition-colors"
                            onClick={() => {
                              const input = document.getElementById(`image-upload-${product.id}`);
                              if (input) input.click();
                            }}
                          >
                            <span className="material-symbols-outlined text-base">add_a_photo</span>
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
                      <span className="text-[10px] text-[#bbcbb9] mt-1 block text-center">
                        {product.images?.length || 0}/20
                      </span>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <Input
                          value={product.name}
                          onChange={(e) => setCategories(categories.map(cat => cat.id === category.id ? { ...cat, products: cat.products.map(p => p.id === product.id ? { ...p, name: e.target.value } : p) } : cat))}
                          placeholder="Product Name"
                          className="flex-1"
                        />
                        <button
                          onClick={() => deleteProduct(category.id, product.id)}
                          className="text-[#ba1a1a] hover:bg-[#ffdad6]/50 p-1 rounded-lg transition-colors ml-2"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
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

                  {/* Variations */}
                  <div className="mt-3 pt-3 border-t border-[#bbcbb9]/10">
                    <div className="flex items-center justify-between">
                      <p className="font-label-md text-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">Variations (Max 10)</p>
                      <button
                        onClick={() => addVariation(category.id, product.id)}
                        className="text-[#006d2f] flex items-center gap-1 hover:bg-[#25D366]/10 px-2 py-1 rounded text-sm font-semibold"
                      >
                        <span className="material-symbols-outlined text-base">add_circle</span> Add Variation
                      </button>
                    </div>

                    {product.variations.map((variation) => (
                      <div key={variation.id} className="bg-[#f2f4f7] p-3 rounded-lg mt-2">
                        <div className="flex items-center gap-2">
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
                          <button
                            onClick={() => deleteVariation(category.id, product.id, variation.id)}
                            className="text-[#ba1a1a] hover:bg-[#ffdad6]/50 p-1 rounded-full"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>

                        {/* Variation Image — single thumbnail, shown with the variant name on preview */}
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
                              className="w-10 h-10 rounded bg-[#f2f4f7] border-2 border-dashed border-[#bbcbb9] flex items-center justify-center text-[#556067] hover:text-[#006d2f] hover:border-[#006d2f] cursor-pointer transition-colors"
                              onClick={() => {
                                const input = document.getElementById(`variation-image-${variation.id}`);
                                if (input) input.click();
                              }}
                            >
                              <span className="material-symbols-outlined text-sm">add_a_photo</span>
                            </div>
                          )}
                          <input
                            id={`variation-image-${variation.id}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleVariationImageUpload(category.id, product.id, variation.id, e)}
                            className="hidden"
                          />
                          <span className="text-[10px] text-[#bbcbb9]">
                            {variation.image ? 'Shown as thumbnail with variant name' : 'Optional — shows next to variant name'}
                          </span>
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
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
              <button
                onClick={() => addProduct(category.id)}
                className="w-full py-2 border-2 border-dashed border-[#bbcbb9] rounded-lg text-[#556067] hover:text-[#006d2f] hover:border-[#006d2f] transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-base">add_circle</span> Add Product
              </button>
            </div>
          </Card>
        ))}
      </Card>

      {/* Hero Banner Section */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[#006d2f]">image</span>
          <h2 className="font-label-md text-label-md text-[#556067] uppercase tracking-wider text-xs">Hero Banner Properties</h2>
        </div>

        {/* Banner Image Upload */}
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
                <span className="font-caption text-caption text-xs opacity-60">Recommended: 1200×400px</span>
              </div>
            )}
            <input
              id="banner-upload"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => setBannerImage(e.target.result);
                  reader.readAsDataURL(file);
                }
                e.target.value = '';
              }}
              className="hidden"
            />
          </div>
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