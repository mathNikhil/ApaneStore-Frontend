import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { storeAPI } from '../services/api';

const StoreBuilderContext = createContext();

export const useStoreBuilder = () => {
  const context = useContext(StoreBuilderContext);
  if (!context) {
    throw new Error('useStoreBuilder must be used within StoreBuilderProvider');
  }
  return context;
};

// Default shape for each step — pulled out to module scope so both the
// initial state AND "start a new store" / "discard changes" can reuse the
// exact same defaults without duplicating them in three places.
const DEFAULT_BRAND_DATA = {
  brandName: 'Organic Flour Co.',
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
  fonts: { heading: 'Inter', body: 'Inter' },
  baseFontSize: '16px',
};

const DEFAULT_PRODUCT_DATA = {
  categories: [],
  enableImageZoom: true,
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
};

const DEFAULT_CART_DATA = {
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
};

const DEFAULT_PAYMENT_DATA = {
  codEnabled: true,
  upiEnabled: true,
  cardEnabled: false,
  netBankingEnabled: false,
  upiId: '',
  upiAppName: 'GPay/PhonePe',
  showQRCode: true,
  showUPIId: true,
  defaultPayment: 'cod',
};

const DEFAULT_ADDRESS_DATA = {
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
};

const DEFAULT_ORDER_DATA = {
  enableCancellation: true,
  cancellationWindow: 2,
  cancelOnlyConfirmed: true,
  showCancelReason: true,
  sendCancelEmail: true,
  showStatusTimeline: true,
  showEstimatedDelivery: true,
};

const DEFAULT_PROFILE_DATA = {
  officeNumber: '+91 8800244169',
  supportTime: '9:00 AM - 6:00 PM',
  supportEmail: 'support@chakki.com',
  aboutUs: 'We help small businesses create their own e-commerce stores easily.',
  socialLinks: { facebook: '', instagram: '', twitter: '', youtube: '' },
  feedbackLinks: { facebookReviews: '', instagramFeedback: '' },
};

export const StoreBuilderProvider = ({ children }) => {
  // Helper functions for localStorage
  // NOTE: these keys are NOT store-scoped. With multi-store support, they act
  // as a "last edited" quick-resume cache — real source of truth is always
  // the backend once storeId is known (loadStore() below overwrites this on
  // every store switch, so cross-store leakage is at most a brief flash).
  const loadFromStorage = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(`apnaestore_builder_${key}`);
      if (saved) return JSON.parse(saved);
      return defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const saveToStorage = (key, data) => {
    try {
      localStorage.setItem(`apnaestore_builder_${key}`, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  };

  const [brandData, setBrandData] = useState(() => loadFromStorage('brandData', DEFAULT_BRAND_DATA));
  useEffect(() => { saveToStorage('brandData', brandData); }, [brandData]);

  const [productData, setProductData] = useState(() => loadFromStorage('productData', DEFAULT_PRODUCT_DATA));
  useEffect(() => { saveToStorage('productData', productData); }, [productData]);

  const [cartData, setCartData] = useState(() => loadFromStorage('cartData', DEFAULT_CART_DATA));
  useEffect(() => { saveToStorage('cartData', cartData); }, [cartData]);

  const [paymentData, setPaymentData] = useState(() => loadFromStorage('paymentData', DEFAULT_PAYMENT_DATA));
  useEffect(() => { saveToStorage('paymentData', paymentData); }, [paymentData]);

  const [addressData, setAddressData] = useState(() => loadFromStorage('addressData', DEFAULT_ADDRESS_DATA));
  useEffect(() => { saveToStorage('addressData', addressData); }, [addressData]);

  const [orderData, setOrderData] = useState(() => loadFromStorage('orderData', DEFAULT_ORDER_DATA));
  useEffect(() => { saveToStorage('orderData', orderData); }, [orderData]);

  const [profileData, setProfileData] = useState(() => loadFromStorage('profileData', DEFAULT_PROFILE_DATA));
  useEffect(() => { saveToStorage('profileData', profileData); }, [profileData]);

  // ============================================
  // BACKEND SYNC — multi-store aware
  // The URL (via the store-builder route wrapper) is the single source of
  // truth for WHICH store is being edited. This context exposes loadStore /
  // startNewStore / saveNow / discardChanges; the route-level component
  // decides which to call based on the :storeId URL param.
  // ============================================
  const [storeId, setStoreId] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | loading | saving | saved | error
  const [ready, setReady] = useState(false); // true once loadStore/startNewStore has run for the current URL
  const skipNextSave = useRef(true); // don't autosave right after we just loaded/reset
  const lastSavedSnapshot = useRef(null); // last known-good backend state, for "discard changes"
  const saveTimerRef = useRef(null);

  const slugify = (text) =>
    (text || 'my-store')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 40) || 'my-store';

  const buildConfig = () => ({
    brand: brandData,
    products: productData,
    cart: cartData,
    payment: paymentData,
    address: addressData,
    order: orderData,
    profile: profileData,
  });

  const applyConfig = (config = {}) => {
    setBrandData(config.brand || DEFAULT_BRAND_DATA);
    setProductData(config.products || DEFAULT_PRODUCT_DATA);
    setCartData(config.cart || DEFAULT_CART_DATA);
    setPaymentData(config.payment || DEFAULT_PAYMENT_DATA);
    setAddressData(config.address || DEFAULT_ADDRESS_DATA);
    setOrderData(config.order || DEFAULT_ORDER_DATA);
    setProfileData(config.profile || DEFAULT_PROFILE_DATA);
  };

  // Load a specific, existing store by id — used when the URL has a real storeId.
  const loadStore = async (id) => {
    setReady(false);
    setSyncStatus('loading');
    skipNextSave.current = true;
    try {
      const result = await storeAPI.getById(id);
      const store = result?.data;
      const config = store?.config || {};
      applyConfig(config);
      setStoreId(id);
      lastSavedSnapshot.current = config;
      setSyncStatus('idle');
    } catch (e) {
      console.error('Failed to load store from backend:', e);
      setSyncStatus('error');
    } finally {
      setTimeout(() => { skipNextSave.current = false; setReady(true); }, 0);
    }
  };

  // Reset to a blank slate — used when the URL says "new" (Launch New Store).
  // Nothing is created in the backend until the first save.
  const startNewStore = () => {
    setReady(false);
    skipNextSave.current = true;
    setStoreId(null);
    lastSavedSnapshot.current = null;
    applyConfig({});
    setSyncStatus('idle');
    setTimeout(() => { skipNextSave.current = false; setReady(true); }, 0);
  };

  // Immediate save, bypassing the debounce — used by "Save & Close" and by
  // Ready-to-Publish. Returns the storeId (existing or newly created).
  const saveNow = async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSyncStatus('saving');
    const config = buildConfig();
    try {
      let id = storeId;
      if (id) {
        await storeAPI.update(id, { storeName: brandData.brandName, config });
      } else {
        const subdomain = `${slugify(brandData.brandName)}-${Math.floor(Math.random() * 9000 + 1000)}`;
        const result = await storeAPI.create({
          storeName: brandData.brandName || 'My Store',
          subdomain,
          config,
        });
        id = result?.data?.id;
        if (id) setStoreId(id);
      }
      lastSavedSnapshot.current = config;
      setSyncStatus('saved');
      return id;
    } catch (e) {
      console.error('Failed to save store to backend:', e);
      setSyncStatus('error');
      throw e;
    }
  };

  // Revert to the last known-saved state — used by "Close Without Saving".
  const discardChanges = () => {
    skipNextSave.current = true;
    if (lastSavedSnapshot.current) {
      applyConfig(lastSavedSnapshot.current);
    } else {
      applyConfig({});
    }
    setTimeout(() => { skipNextSave.current = false; }, 0);
  };

  // Debounced autosave: any change to builder data pushes to the backend a
  // beat after the tenant stops typing/clicking.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !ready || skipNextSave.current) return;

    setSyncStatus('saving');
    saveTimerRef.current = setTimeout(async () => {
      try {
        await saveNow();
      } catch (e) {
        // saveNow already sets syncStatus('error') and logs
      }
    }, 1200);

    return () => clearTimeout(saveTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandData, productData, cartData, paymentData, addressData, orderData, profileData, ready]);

  // ============================================
  // COMBINED DATA FOR PREVIEW
  // ============================================
  const getAllBuilderData = () => buildConfig();

  // Clear all data (dev/testing helper — does not touch the backend)
  const clearAllData = () => {
    const keys = ['brandData', 'productData', 'cartData', 'paymentData', 'addressData', 'orderData', 'profileData'];
    keys.forEach(key => localStorage.removeItem(`apnaestore_builder_${key}`));
    skipNextSave.current = true;
    setTimeout(() => { skipNextSave.current = false; }, 0);
    applyConfig({});
  };

  return (
    <StoreBuilderContext.Provider
      value={{
        brandData, setBrandData,
        productData, setProductData,
        cartData, setCartData,
        paymentData, setPaymentData,
        addressData, setAddressData,
        orderData, setOrderData,
        profileData, setProfileData,
        getAllBuilderData,
        clearAllData,
        storeId,
        syncStatus,
        ready,
        loadStore,
        startNewStore,
        saveNow,
        discardChanges,
      }}
    >
      {children}
    </StoreBuilderContext.Provider>
  );
};
