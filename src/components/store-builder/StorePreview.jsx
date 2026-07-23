import React, { useState } from 'react';

const StorePreview = ({ 
  categories = [], 
  brandColors = {
    primary: '#25D366',
    secondary: '#111B21',
    tertiary: '#008069',
    element: '#F0F2F5',
    background: '#FFFFFF',
    button: '#25D366',
    buttonLabel: '#005523',
    font: '#191C1E',
  },
  brandName = 'Your Store',
  tagline = 'Your tagline here',
  logoPreview = null,
  // Hero Banner Props
  bannerImage = null,
  bannerTagline = 'Fresh, Organic & Delivered',
  bannerSubtitle = '100% Natural Stone-Ground Flour',
  bannerCta = 'Shop Now',
  bannerHeight = 400,
  bannerBgColor = '#25D366',
  showCta = true,
  showText = true,
  textAlignment = 'center',
  textColor = '#FFFFFF',
  onClose 
}) => {
  const [selectedVariations, setSelectedVariations] = useState({});
  const [selectedSizes, setSelectedSizes] = useState({});

  // Handle variation/size selection
  const handleVariationSelect = (productId, variationId, sizeId) => {
    setSelectedVariations(prev => ({ ...prev, [productId]: variationId }));
    setSelectedSizes(prev => ({ ...prev, [productId]: sizeId }));
  };

  // Get product display info
  const getProductDisplay = (product) => {
    if (!product.variations || product.variations.length === 0) {
      return { price: '0', originalPrice: '0', discount: 0 };
    }

    const variationId = selectedVariations[product.id] || product.variations[0]?.id;
    const variation = product.variations.find(v => v.id === variationId) || product.variations[0];
    
    if (!variation || !variation.sizes || variation.sizes.length === 0) {
      return { price: '0', originalPrice: '0', discount: 0 };
    }

    const sizeId = selectedSizes[product.id] || variation.sizes[0]?.id;
    const size = variation.sizes.find(s => s.id === sizeId) || variation.sizes[0];
    
    const price = parseFloat(size.price) || 0;
    const discount = product.discount || 0;
    const originalPrice = discount > 0 ? price / (1 - discount / 100) : price;
    
    return {
      price: price.toFixed(2),
      originalPrice: originalPrice.toFixed(2),
      discount: discount,
      variation: variation,
      size: size
    };
  };

  // Get alignment class
  const getAlignmentClass = () => {
    switch(textAlignment) {
      case 'left': return 'items-start text-left';
      case 'right': return 'items-end text-right';
      default: return 'items-center text-center';
    }
  };

  // Check if there are any products
  const hasProducts = categories.some(cat => cat.products && cat.products.length > 0);

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-[#e0e3e6] bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#f2f4f7] flex-shrink-0">
              {logoPreview ? (
                <img src={logoPreview} alt={brandName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: brandColors.primary }}>
                  <span className="material-symbols-outlined text-white text-xl">storefront</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold" style={{ color: brandColors.font }}>{brandName}</h3>
              <p className="text-xs" style={{ color: brandColors.secondary }}>{tagline}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#556067] hover:bg-[#eceef1] p-2 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: brandColors.background || '#FFFFFF' }}>
          
          {/* ============================================ */}
          {/* HERO BANNER */}
          {/* ============================================ */}
          <div 
            className="relative w-full overflow-hidden flex-shrink-0"
            style={{ 
              height: `${bannerHeight || 400}px`,
              backgroundColor: bannerBgColor || '#25D366',
              minHeight: '200px'
            }}
          >
            {bannerImage ? (
              // If banner image exists, show image with overlay
              <>
                <img 
                  src={bannerImage} 
                  alt="Store Banner" 
                  className="w-full h-full object-cover"
                />
                {/* Dark overlay for text readability */}
                <div className={`absolute inset-0 bg-black/30 flex flex-col justify-center p-6 ${getAlignmentClass()}`}>
                  {/* Tagline & Subtitle - Show/Hide based on toggle */}
                  {showText && (
                    <div className="max-w-2xl">
                      <h1 
                        className="text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-lg mb-2"
                        style={{ color: textColor || '#FFFFFF' }}
                      >
                        {bannerTagline || 'Fresh, Organic & Delivered'}
                      </h1>
                      <p 
                        className="text-lg md:text-xl drop-shadow-md"
                        style={{ color: textColor || '#FFFFFF', opacity: 0.9 }}
                      >
                        {bannerSubtitle || '100% Natural Stone-Ground Flour'}
                      </p>
                    </div>
                  )}
                  {/* CTA Button - Show/Hide based on toggle */}
                  {showCta && (
                    <button 
                      className="px-8 py-3 rounded-lg font-bold text-white shadow-lg hover:opacity-90 transition-opacity mt-4"
                      style={{ backgroundColor: brandColors.primary || '#25D366' }}
                    >
                      {bannerCta || 'Shop Now'}
                    </button>
                  )}
                </div>
              </>
            ) : (
              // If no banner image, show colored background with text
              <div className={`w-full h-full flex flex-col justify-center p-6 ${getAlignmentClass()}`}>
                {/* Tagline & Subtitle - Show/Hide based on toggle */}
                {showText && (
                  <div className="max-w-2xl">
                    <h1 
                      className="text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-lg mb-2"
                      style={{ color: textColor || '#FFFFFF' }}
                    >
                      {bannerTagline || 'Fresh, Organic & Delivered'}
                    </h1>
                    <p 
                      className="text-lg md:text-xl drop-shadow-md"
                      style={{ color: textColor || '#FFFFFF', opacity: 0.9 }}
                    >
                      {bannerSubtitle || '100% Natural Stone-Ground Flour'}
                    </p>
                  </div>
                )}
                {/* CTA Button - Show/Hide based on toggle */}
                {showCta && (
                  <button 
                    className="px-8 py-3 rounded-lg font-bold text-white shadow-lg hover:opacity-90 transition-opacity mt-4"
                    style={{ backgroundColor: brandColors.primary || '#25D366' }}
                  >
                    {bannerCta || 'Shop Now'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Store Content */}
          <div className="max-w-2xl mx-auto p-4">
            
            {/* Store Name */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold" style={{ color: brandColors.font || '#191C1E' }}>
                {brandName}
              </h1>
              <p style={{ color: brandColors.secondary || '#111B21' }}>{tagline}</p>
            </div>

            {/* Categories & Products */}
            {!hasProducts ? (
              <div className="text-center py-12" style={{ color: brandColors.secondary || '#556067' }}>
                <span className="material-symbols-outlined text-6xl block mb-4 opacity-30">storefront</span>
                <p>No products added yet. Add some products to see preview.</p>
              </div>
            ) : (
              categories.map((category) => (
                <div key={category.id} className="mb-8">
                  <h2 className="text-xl font-bold mb-4" style={{ color: brandColors.font || '#191C1E' }}>
                    {category.name}
                  </h2>
                  
                  {category.products.length === 0 ? (
                    <p className="text-sm opacity-60" style={{ color: brandColors.secondary || '#556067' }}>
                      No products in this category
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.products.map((product) => {
                        const display = getProductDisplay(product);
                        const variations = product.variations || [];
                        const currentVariation = selectedVariations[product.id] 
                          ? variations.find(v => v.id === selectedVariations[product.id]) 
                          : variations[0];
                        const currentSizes = currentVariation?.sizes || [];

                        return (
                          <div key={product.id} className="bg-white rounded-lg border border-[#e0e3e6] overflow-hidden hover:shadow-md transition-shadow">
                            {/* Product Image */}
                            <div className="h-40 bg-[#f7f9fc] flex items-center justify-center overflow-hidden">
                              {product.images && product.images.length > 0 ? (
                                <img 
                                  src={product.images[0].url} 
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="material-symbols-outlined text-4xl text-[#bbcbb9]">image</span>
                              )}
                            </div>

                            <div className="p-4">
                              <h4 className="font-semibold" style={{ color: brandColors.font || '#191C1E' }}>
                                {product.name}
                              </h4>
                              <p className="text-sm mt-1" style={{ color: brandColors.secondary || '#556067' }}>
                                {product.description || 'No description'}
                              </p>

                              {/* Price with Discount */}
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-xl font-bold" style={{ color: brandColors.primary || '#006d2f' }}>
                                  ₹{display.price}
                                </span>
                                {display.discount > 0 && (
                                  <>
                                    <span className="text-sm line-through opacity-60" style={{ color: brandColors.secondary || '#556067' }}>
                                      ₹{display.originalPrice}
                                    </span>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ 
                                      backgroundColor: `${brandColors.primary || '#25D366'}20`,
                                      color: brandColors.primary || '#006d2f'
                                    }}>
                                      {Math.round(display.discount)}% OFF
                                    </span>
                                  </>
                                )}
                              </div>

                              {/* Variations */}
                              {variations.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: brandColors.secondary || '#556067' }}>
                                    {variations[0]?.name || 'Options'}:
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {variations.map((v) => (
                                      <button
                                        key={v.id}
                                        onClick={() => handleVariationSelect(product.id, v.id, v.sizes[0]?.id)}
                                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                          selectedVariations[product.id] === v.id || (!selectedVariations[product.id] && v.id === variations[0]?.id)
                                            ? 'text-white'
                                            : 'border'
                                        }`}
                                        style={selectedVariations[product.id] === v.id || (!selectedVariations[product.id] && v.id === variations[0]?.id)
                                          ? { backgroundColor: brandColors.primary || '#25D366', color: brandColors.buttonLabel || '#005523' }
                                          : { borderColor: brandColors.secondary || '#556067', color: brandColors.secondary || '#556067' }
                                        }
                                      >
                                        {v.name}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Sizes */}
                              {currentSizes.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: brandColors.secondary || '#556067' }}>
                                    Size:
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {currentSizes.map((s) => (
                                      <button
                                        key={s.id}
                                        onClick={() => handleVariationSelect(product.id, currentVariation.id, s.id)}
                                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                          selectedSizes[product.id] === s.id || (!selectedSizes[product.id] && s.id === currentSizes[0]?.id)
                                            ? 'text-white'
                                            : 'border'
                                        }`}
                                        style={selectedSizes[product.id] === s.id || (!selectedSizes[product.id] && s.id === currentSizes[0]?.id)
                                          ? { backgroundColor: brandColors.primary || '#25D366', color: brandColors.buttonLabel || '#005523' }
                                          : { borderColor: brandColors.secondary || '#556067', color: brandColors.secondary || '#556067' }
                                        }
                                      >
                                        {s.size}{s.unit}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Bulk Pricing Info */}
                              {product.bulkPricing && (
                                <div className="mt-2 bg-[#25D366]/10 rounded-lg p-2 text-center">
                                  <p className="text-xs text-[#005523] font-medium">
                                    ✓ Same price for all sizes
                                  </p>
                                </div>
                              )}

                              {/* Add to Cart Button */}
                              <button 
                                className="w-full mt-3 py-2 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90"
                                style={{ backgroundColor: brandColors.button || '#25D366', color: brandColors.buttonLabel || '#005523' }}
                              >
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
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e0e3e6] bg-white flex justify-between items-center flex-shrink-0">
          <span className="text-xs" style={{ color: brandColors.secondary || '#556067' }}>
            {categories.reduce((acc, cat) => acc + (cat.products ? cat.products.length : 0), 0)} products
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: brandColors.button || '#25D366', color: brandColors.buttonLabel || '#005523' }}
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default StorePreview;