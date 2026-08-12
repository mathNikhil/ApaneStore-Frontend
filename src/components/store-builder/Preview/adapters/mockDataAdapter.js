// Converts builder product format to component format

export const adaptProductForPreview = (builderProduct) => {
  // Calculate price display
  const getPriceDisplay = (product) => {
    if (!product.variations || product.variations.length === 0) {
      return { price: '0', originalPrice: '0', discount: 0 };
    }

    const firstVariation = product.variations[0];
    if (!firstVariation.sizes || firstVariation.sizes.length === 0) {
      return { price: '0', originalPrice: '0', discount: 0 };
    }

    const firstSize = firstVariation.sizes[0];
    const price = parseFloat(firstSize.price) || 0;
    const discount = product.discount || 0;
    const originalPrice = discount > 0 ? price / (1 - discount / 100) : price;

    return {
      price: price.toFixed(2),
      originalPrice: originalPrice.toFixed(2),
      discount: discount,
      variation: firstVariation,
      size: firstSize
    };
  };

  return {
    id: builderProduct.id,
    name: builderProduct.name,
    description: builderProduct.description || 'No description available',
    images: builderProduct.images || [],
    price: getPriceDisplay(builderProduct),
    variations: builderProduct.variations.map(v => ({
      id: v.id,
      name: v.name,
      sizes: v.sizes.map(s => ({
        id: s.id,
        label: `${s.size}${s.unit}`,
        size: s.size,
        unit: s.unit,
        price: s.price
      }))
    })),
    discount: builderProduct.discount || 0,
    bulkPricing: builderProduct.bulkPricing || false,
    isPreview: true
  };
};

export const adaptCategoryForPreview = (builderCategory) => {
  return {
    id: builderCategory.id,
    name: builderCategory.name,
    products: builderCategory.products.map(adaptProductForPreview)
  };
};PreviewDeviceToggle.jsx