import { useState, useEffect } from 'react';
import { generatePreviewStyles } from '../utils/previewStyles';

// Helper function to adapt product for preview
var adaptProductForPreview = function(builderProduct) {
  var getPriceDisplay = function(product) {
    if (!product.variations || product.variations.length === 0) {
      return { price: '0', originalPrice: '0', discount: 0 };
    }

    var firstVariation = product.variations[0];
    if (!firstVariation.sizes || firstVariation.sizes.length === 0) {
      return { price: '0', originalPrice: '0', discount: 0 };
    }

    var firstSize = firstVariation.sizes[0];
    var price = parseFloat(firstSize.price) || 0;
    var discount = product.discount || 0;
    var originalPrice = discount > 0 ? price / (1 - discount / 100) : price;

    return {
      price: price.toFixed(2),
      originalPrice: originalPrice.toFixed(2),
      discount: discount,
    };
  };

  return {
    id: builderProduct.id,
    name: builderProduct.name,
    description: builderProduct.description || 'No description available',
    images: builderProduct.images || [],
    price: getPriceDisplay(builderProduct),
    variations: (builderProduct.variations || []).map(function(v) {
      return {
        id: v.id,
        name: v.name,
        images: v.images || [],
        sizes: (v.sizes || []).map(function(s) {
          return {
            id: s.id,
            label: s.size + s.unit,
            size: s.size,
            unit: s.unit,
            price: s.price
          };
        })
      };
    }),
    discount: builderProduct.discount || 0,
    bulkPricing: builderProduct.bulkPricing || false,
    isPreview: true
  };
};

var adaptCategoryForPreview = function(builderCategory) {
  return {
    id: builderCategory.id,
    name: builderCategory.name,
    products: (builderCategory.products || []).map(adaptProductForPreview)
  };
};

// Mock orders
var getMockOrders = function(orderData) {
  return [
    {
      id: 'CKW-1703123456789',
      date: '2026-07-14',
      status: 'delivered',
      statusText: 'Delivered',
      items: [
        {
          name: 'Whole Wheat Flour',
          weight: '5kg',
          quantity: 2,
          price: 294,
          total: 588
        }
      ],
      total: 588,
      deliveryAddress: 'A-102, Green Valley Apartments, Sector 45, Gurgaon'
    },
    {
      id: 'CKW-1703123456790',
      date: '2026-07-13',
      status: 'out-for-delivery',
      statusText: 'Out for Delivery',
      estimatedDelivery: '12 mins',
      items: [
        {
          name: 'Multi-grain Mix',
          weight: '2kg',
          quantity: 3,
          price: 150,
          total: 450
        }
      ],
      total: 450,
      deliveryAddress: 'B-45, Lake View Homes, Sector 29, Gurgaon'
    },
    {
      id: 'CKW-1703123456791',
      date: '2026-07-12',
      status: 'pending',
      statusText: 'Pending',
      items: [
        {
          name: 'Organic Pearl Millet',
          weight: '1kg',
          quantity: 1,
          price: 210,
          total: 210
        },
        {
          name: 'Premium Sharbati Atta',
          weight: '5kg',
          quantity: 1,
          price: 345,
          total: 345
        }
      ],
      total: 555,
      deliveryAddress: 'C-78, Royal Palm Estate, Sector 56, Gurgaon'
    }
  ];
};

// Mock addresses
var getMockAddresses = function(addressData, profileData) {
  var name = profileData && profileData.name ? profileData.name : 'Amit Sharma';
  var mobile = '+91 98765 43210';
  
  return [
    {
      id: 1,
      label: 'Home',
      recipientName: name,
      recipientMobile: mobile,
      addressLine1: 'A-102, Green Valley Apartments',
      addressLine2: '',
      city: 'Gurgaon',
      state: 'Haryana',
      pincode: '122003',
      landmark: 'Near City Center',
      isDefault: true,
    },
    {
      id: 2,
      label: 'Office',
      recipientName: name,
      recipientMobile: mobile,
      addressLine1: 'B-45, Lake View Homes',
      addressLine2: 'Sector 29',
      city: 'Gurgaon',
      state: 'Haryana',
      pincode: '122002',
      landmark: '',
      isDefault: false,
    }
  ];
};

export var usePreviewData = function(builderData) {
  var [storeData, setStoreData] = useState({
    brand: {
      name: 'Organic Flour Co.',
      tagline: 'Fresh, Organic & Delivered to Your Doorstep',
      logo: null,
      colors: {
        primary: '#25D366',
        secondary: '#111B21',
        tertiary: '#008069',
        background: '#FFFFFF',
        button: '#25D366',
        buttonLabel: '#005523',
        font: '#191C1E',
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter',
      },
      baseFontSize: '16px',
    },
    products: [],
    categories: [],
    banner: {
      image: null,
      tagline: 'Fresh, Organic & Delivered',
      subtitle: '100% Natural Stone-Ground Flour',
      cta: 'Shop Now',
      height: 400,
      bgColor: '#25D366',
      showText: true,
      showCta: true,
      textAlignment: 'center',
      textColor: '#FFFFFF',
    },
    cart: {
      items: [],
      freeDelivery: true,
      freeDeliveryThreshold: 500,
      deliveryCharge: 40,
      showProgressBar: true,
      showDeliveryMessage: true,
      enableGST: true,
      gstRate: 5,
      taxLabel: 'GST',
      showGSTBreakdownCart: true,
      showGSTBreakdownCheckout: true,
    },
    payment: {
      codEnabled: true,
      upiEnabled: true,
      cardEnabled: false,
      netBankingEnabled: false,
      upiId: '8800244169@upi',
      upiAppName: 'GPay/PhonePe',
      showQRCode: true,
      showUPIId: true,
      defaultPayment: 'cod',
    },
    address: {
      maxAddresses: 3,
      allowDefaultAddress: true,
      showAddressLabels: true,
      allowAddressEditing: true,
      allowAddressDeletion: true,
      fields: {
        recipientName: true,
        recipientMobile: true,
        addressLine1: true,
        addressLine2: false,
        city: true,
        state: true,
        pincode: true,
        landmark: false,
      },
    },
    order: {
      enableCancellation: true,
      cancellationWindow: 2,
      cancelOnlyConfirmed: true,
      showCancelReason: true,
      sendCancelEmail: true,
      showStatusTimeline: true,
      showEstimatedDelivery: true,
    },
    orders: [],
    profile: {
      name: 'Amit Sharma',
      email: 'amit.sharma@premiumgrains.com',
      profileImage: null,
      officeNumber: '+91 8800244169',
      supportTime: '9:00 AM - 6:00 PM',
      supportEmail: 'support@chakki.com',
      aboutUs: 'We help small businesses create their own e-commerce stores easily.',
      socialLinks: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: '',
      },
      feedbackLinks: {
        facebookReviews: '',
        instagramFeedback: '',
      },
      addresses: [],
    },
    return: {
      isEnabled: true,
      returnWindowDays: 7,
      restockingFeePercent: 0,
      returnShippingMethod: 'customer-pays',
      requirePhotos: false,
      requireReason: true,
      allowedReasons: [
        'wrong_size',
        'damaged',
        'not_as_described',
        'changed_mind',
        'wrong_product',
      ],
      rules: [],
    }
  });

  // Full data mapping
  useEffect(function() {
    if (!builderData) {
      return;
    }

    setStoreData(function(prev) {
      // Create a deep copy of the previous state
      var updatedData = JSON.parse(JSON.stringify(prev));

      // ============================================
      // STEP 1: BRAND DATA
      // ============================================
      if (builderData.brandName) {
        updatedData.brand.name = builderData.brandName;
      }
      if (builderData.tagline) {
        updatedData.brand.tagline = builderData.tagline;
      }
      if (builderData.logo) {
        updatedData.brand.logo = builderData.logo;
      }
      if (builderData.brandColors) {
        if (builderData.brandColors.primary) {
          updatedData.brand.colors.primary = builderData.brandColors.primary;
        }
        if (builderData.brandColors.secondary) {
          updatedData.brand.colors.secondary = builderData.brandColors.secondary;
        }
        if (builderData.brandColors.tertiary) {
          updatedData.brand.colors.tertiary = builderData.brandColors.tertiary;
        }
        if (builderData.brandColors.background) {
          updatedData.brand.colors.background = builderData.brandColors.background;
        }
        if (builderData.brandColors.button) {
          updatedData.brand.colors.button = builderData.brandColors.button;
        }
        if (builderData.brandColors.buttonLabel) {
          updatedData.brand.colors.buttonLabel = builderData.brandColors.buttonLabel;
        }
        if (builderData.brandColors.font) {
          updatedData.brand.colors.font = builderData.brandColors.font;
        }
      }
      if (builderData.headingFont) {
        updatedData.brand.fonts.heading = builderData.headingFont;
      }
      if (builderData.bodyFont) {
        updatedData.brand.fonts.body = builderData.bodyFont;
      }
      if (builderData.baseFontSize) {
        updatedData.brand.baseFontSize = builderData.baseFontSize;
      }

      // ============================================
      // STEP 2: PRODUCT DATA
      // ============================================
      if (builderData.categories) {
        try {
          updatedData.categories = builderData.categories.map(adaptCategoryForPreview);
          var allProducts = [];
          for (var i = 0; i < builderData.categories.length; i++) {
            var cat = builderData.categories[i];
            if (cat.products) {
              for (var j = 0; j < cat.products.length; j++) {
                allProducts.push(adaptProductForPreview(cat.products[j]));
              }
            }
          }
          updatedData.products = allProducts;
        } catch (e) {
          console.error('Error adapting products:', e);
          updatedData.categories = [];
          updatedData.products = [];
        }
      }
      
      if (builderData.bannerImage) {
        updatedData.banner.image = builderData.bannerImage;
      }
      if (builderData.bannerTagline) {
        updatedData.banner.tagline = builderData.bannerTagline;
      }
      if (builderData.bannerSubtitle) {
        updatedData.banner.subtitle = builderData.bannerSubtitle;
      }
      if (builderData.bannerCta) {
        updatedData.banner.cta = builderData.bannerCta;
      }
      if (builderData.bannerHeight) {
        updatedData.banner.height = builderData.bannerHeight;
      }
      if (builderData.bannerBgColor) {
        updatedData.banner.bgColor = builderData.bannerBgColor;
      }
      if (builderData.showCta !== undefined) {
        updatedData.banner.showCta = builderData.showCta;
      }
      if (builderData.showText !== undefined) {
        updatedData.banner.showText = builderData.showText;
      }
      if (builderData.textAlignment) {
        updatedData.banner.textAlignment = builderData.textAlignment;
      }
      if (builderData.textColor) {
        updatedData.banner.textColor = builderData.textColor;
      }

      // ============================================
      // STEP 3: CART DATA
      // ============================================
      if (builderData.freeDelivery !== undefined) {
        updatedData.cart.freeDelivery = builderData.freeDelivery;
      }
      if (builderData.freeDeliveryThreshold) {
        updatedData.cart.freeDeliveryThreshold = builderData.freeDeliveryThreshold;
      }
      if (builderData.deliveryCharge) {
        updatedData.cart.deliveryCharge = builderData.deliveryCharge;
      }
      if (builderData.showProgressBar !== undefined) {
        updatedData.cart.showProgressBar = builderData.showProgressBar;
      }
      if (builderData.showDeliveryMessage !== undefined) {
        updatedData.cart.showDeliveryMessage = builderData.showDeliveryMessage;
      }
      if (builderData.enableGST !== undefined) {
        updatedData.cart.enableGST = builderData.enableGST;
      }
      if (builderData.gstRate) {
        updatedData.cart.gstRate = builderData.gstRate;
      }
      if (builderData.taxLabel) {
        updatedData.cart.taxLabel = builderData.taxLabel;
      }
      if (builderData.showGSTBreakdownCart !== undefined) {
        updatedData.cart.showGSTBreakdownCart = builderData.showGSTBreakdownCart;
      }
      if (builderData.showGSTBreakdownCheckout !== undefined) {
        updatedData.cart.showGSTBreakdownCheckout = builderData.showGSTBreakdownCheckout;
      }

      // ============================================
      // STEP 4: PAYMENT DATA
      // ============================================
      if (builderData.codEnabled !== undefined) {
        updatedData.payment.codEnabled = builderData.codEnabled;
      }
      if (builderData.upiEnabled !== undefined) {
        updatedData.payment.upiEnabled = builderData.upiEnabled;
      }
      if (builderData.cardEnabled !== undefined) {
        updatedData.payment.cardEnabled = builderData.cardEnabled;
      }
      if (builderData.netBankingEnabled !== undefined) {
        updatedData.payment.netBankingEnabled = builderData.netBankingEnabled;
      }
      if (builderData.upiId) {
        updatedData.payment.upiId = builderData.upiId;
      }
      if (builderData.upiAppName) {
        updatedData.payment.upiAppName = builderData.upiAppName;
      }
      if (builderData.showQRCode !== undefined) {
        updatedData.payment.showQRCode = builderData.showQRCode;
      }
      if (builderData.showUPIId !== undefined) {
        updatedData.payment.showUPIId = builderData.showUPIId;
      }
      if (builderData.defaultPayment) {
        updatedData.payment.defaultPayment = builderData.defaultPayment;
      }

      // ============================================
      // STEP 5: ADDRESS DATA
      // ============================================
      if (builderData.maxAddresses !== undefined) {
        updatedData.address.maxAddresses = builderData.maxAddresses;
      }
      if (builderData.allowDefaultAddress !== undefined) {
        updatedData.address.allowDefaultAddress = builderData.allowDefaultAddress;
      }
      if (builderData.showAddressLabels !== undefined) {
        updatedData.address.showAddressLabels = builderData.showAddressLabels;
      }
      if (builderData.allowAddressEditing !== undefined) {
        updatedData.address.allowAddressEditing = builderData.allowAddressEditing;
      }
      if (builderData.allowAddressDeletion !== undefined) {
        updatedData.address.allowAddressDeletion = builderData.allowAddressDeletion;
      }
      if (builderData.addressFields) {
        if (builderData.addressFields.recipientName !== undefined) {
          updatedData.address.fields.recipientName = builderData.addressFields.recipientName;
        }
        if (builderData.addressFields.recipientMobile !== undefined) {
          updatedData.address.fields.recipientMobile = builderData.addressFields.recipientMobile;
        }
        if (builderData.addressFields.addressLine1 !== undefined) {
          updatedData.address.fields.addressLine1 = builderData.addressFields.addressLine1;
        }
        if (builderData.addressFields.addressLine2 !== undefined) {
          updatedData.address.fields.addressLine2 = builderData.addressFields.addressLine2;
        }
        if (builderData.addressFields.city !== undefined) {
          updatedData.address.fields.city = builderData.addressFields.city;
        }
        if (builderData.addressFields.state !== undefined) {
          updatedData.address.fields.state = builderData.addressFields.state;
        }
        if (builderData.addressFields.pincode !== undefined) {
          updatedData.address.fields.pincode = builderData.addressFields.pincode;
        }
        if (builderData.addressFields.landmark !== undefined) {
          updatedData.address.fields.landmark = builderData.addressFields.landmark;
        }
      }

      // ============================================
      // STEP 6: ORDER TRACKER DATA
      // ============================================
      if (builderData.enableCancellation !== undefined) {
        updatedData.order.enableCancellation = builderData.enableCancellation;
      }
      if (builderData.cancellationWindow) {
        updatedData.order.cancellationWindow = builderData.cancellationWindow;
      }
      if (builderData.cancelOnlyConfirmed !== undefined) {
        updatedData.order.cancelOnlyConfirmed = builderData.cancelOnlyConfirmed;
      }
      if (builderData.showCancelReason !== undefined) {
        updatedData.order.showCancelReason = builderData.showCancelReason;
      }
      if (builderData.sendCancelEmail !== undefined) {
        updatedData.order.sendCancelEmail = builderData.sendCancelEmail;
      }
      if (builderData.showStatusTimeline !== undefined) {
        updatedData.order.showStatusTimeline = builderData.showStatusTimeline;
      }
      if (builderData.showEstimatedDelivery !== undefined) {
        updatedData.order.showEstimatedDelivery = builderData.showEstimatedDelivery;
      }

      // ============================================
      // STEP 7: PROFILE DATA
      // ============================================
      if (builderData.officeNumber) {
        updatedData.profile.officeNumber = builderData.officeNumber;
      }
      if (builderData.supportTime) {
        updatedData.profile.supportTime = builderData.supportTime;
      }
      if (builderData.supportEmail) {
        updatedData.profile.supportEmail = builderData.supportEmail;
      }
      if (builderData.aboutUs) {
        updatedData.profile.aboutUs = builderData.aboutUs;
      }
      if (builderData.socialLinks) {
        if (builderData.socialLinks.facebook !== undefined) {
          updatedData.profile.socialLinks.facebook = builderData.socialLinks.facebook;
        }
        if (builderData.socialLinks.instagram !== undefined) {
          updatedData.profile.socialLinks.instagram = builderData.socialLinks.instagram;
        }
        if (builderData.socialLinks.twitter !== undefined) {
          updatedData.profile.socialLinks.twitter = builderData.socialLinks.twitter;
        }
        if (builderData.socialLinks.youtube !== undefined) {
          updatedData.profile.socialLinks.youtube = builderData.socialLinks.youtube;
        }
      }
      if (builderData.feedbackLinks) {
        if (builderData.feedbackLinks.facebookReviews !== undefined) {
          updatedData.profile.feedbackLinks.facebookReviews = builderData.feedbackLinks.facebookReviews;
        }
        if (builderData.feedbackLinks.instagramFeedback !== undefined) {
          updatedData.profile.feedbackLinks.instagramFeedback = builderData.feedbackLinks.instagramFeedback;
        }
      }

      // ============================================
      // STEP 8: RETURN POLICY DATA
      // ============================================
      if (builderData.return) {
        if (builderData.return.isEnabled !== undefined) {
          updatedData.return.isEnabled = builderData.return.isEnabled;
        }
        if (builderData.return.returnWindowDays) {
          updatedData.return.returnWindowDays = builderData.return.returnWindowDays;
        }
        if (builderData.return.restockingFeePercent !== undefined) {
          updatedData.return.restockingFeePercent = builderData.return.restockingFeePercent;
        }
        if (builderData.return.returnShippingMethod) {
          updatedData.return.returnShippingMethod = builderData.return.returnShippingMethod;
        }
        if (builderData.return.requirePhotos !== undefined) {
          updatedData.return.requirePhotos = builderData.return.requirePhotos;
        }
        if (builderData.return.requireReason !== undefined) {
          updatedData.return.requireReason = builderData.return.requireReason;
        }
        if (builderData.return.allowedReasons) {
          updatedData.return.allowedReasons = builderData.return.allowedReasons;
        }
        if (builderData.return.rules) {
          updatedData.return.rules = builderData.return.rules;
        }
      }

      // Generate mock orders and addresses
      updatedData.orders = getMockOrders(updatedData.order);
      updatedData.profile.addresses = getMockAddresses(updatedData.address, updatedData.profile);

      return updatedData;
    });
  }, [builderData]);

  // Cart functions
  var addToCart = function(product, variationId, sizeId) {
    setStoreData(function(prev) {
      var existingItem = null;
      var existingIndex = -1;
      for (var i = 0; i < prev.cart.items.length; i++) {
        var item = prev.cart.items[i];
        if (item.productId === product.id && item.variationId === variationId && item.sizeId === sizeId) {
          existingItem = item;
          existingIndex = i;
          break;
        }
      }

      if (existingItem) {
        var updatedItems = prev.cart.items.map(function(item, idx) {
          if (idx === existingIndex) {
            return { 
              id: item.id, 
              productId: item.productId, 
              productName: item.productName, 
              variationName: item.variationName, 
              sizeLabel: item.sizeLabel, 
              size: item.size, 
              unit: item.unit, 
              price: item.price, 
              quantity: item.quantity + 1, 
              image: item.image, 
              discount: item.discount, 
              variationId: item.variationId, 
              sizeId: item.sizeId 
            };
          }
          return item;
        });
        var newState = JSON.parse(JSON.stringify(prev));
        newState.cart.items = updatedItems;
        return newState;
      }

      var variation = null;
      if (product.variations) {
        for (var v = 0; v < product.variations.length; v++) {
          if (product.variations[v].id === variationId) {
            variation = product.variations[v];
            break;
          }
        }
      }
      
      var size = null;
      if (variation && variation.sizes) {
        for (var s = 0; s < variation.sizes.length; s++) {
          if (variation.sizes[s].id === sizeId) {
            size = variation.sizes[s];
            break;
          }
        }
      }

      var newItem = {
        id: Date.now(),
        productId: product.id,
        productName: product.name,
        variationName: variation ? variation.name : 'Default',
        sizeLabel: size ? size.label : '',
        size: size ? size.size : '',
        unit: size ? size.unit : '',
        price: parseFloat(size ? size.price : 0) || 0,
        quantity: 1,
        image: product.images && product.images.length > 0 ? product.images[0].url : null,
        discount: product.discount || 0,
        variationId: variationId,
        sizeId: sizeId,
      };

      var newState = JSON.parse(JSON.stringify(prev));
      newState.cart.items.push(newItem);
      return newState;
    });
  };

  var removeFromCart = function(itemId) {
    setStoreData(function(prev) {
      var newState = JSON.parse(JSON.stringify(prev));
      newState.cart.items = newState.cart.items.filter(function(item) { 
        return item.id !== itemId; 
      });
      return newState;
    });
  };

  var updateQuantity = function(itemId, newQuantity) {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }

    setStoreData(function(prev) {
      var newState = JSON.parse(JSON.stringify(prev));
      for (var i = 0; i < newState.cart.items.length; i++) {
        if (newState.cart.items[i].id === itemId) {
          newState.cart.items[i].quantity = newQuantity;
          break;
        }
      }
      return newState;
    });
  };

  var getCartTotal = function() {
    var items = storeData.cart.items;
    var subtotal = 0;
    for (var i = 0; i < items.length; i++) {
      subtotal = subtotal + (items[i].price * items[i].quantity);
    }
    var gst = storeData.cart.enableGST ? subtotal * (storeData.cart.gstRate / 100) : 0;
    var delivery = storeData.cart.freeDelivery && subtotal >= storeData.cart.freeDeliveryThreshold ? 0 : storeData.cart.deliveryCharge;
    return {
      subtotal: subtotal.toFixed(2),
      gst: gst.toFixed(2),
      delivery: delivery.toFixed(2),
      total: (subtotal + gst + delivery).toFixed(2)
    };
  };

  var getCartItemCount = function() {
    var count = 0;
    for (var i = 0; i < storeData.cart.items.length; i++) {
      count = count + storeData.cart.items[i].quantity;
    }
    return count;
  };

  var previewStyles = generatePreviewStyles(storeData.brand);

  return {
    storeData: storeData,
    previewStyles: previewStyles,
    addToCart: addToCart,
    removeFromCart: removeFromCart,
    updateQuantity: updateQuantity,
    getCartTotal: getCartTotal,
    getCartItemCount: getCartItemCount,
    setStoreData: setStoreData
  };
};