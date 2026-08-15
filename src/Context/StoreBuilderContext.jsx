import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const StoreBuilderContext = createContext();

// ✅ Self-healing ID sanitizer. Some stores have products/categories/
// variations/sizes with corrupted IDs saved from before generateId() was
// fixed (e.g. 1785769510832.0525 — a fractional, out-of-range value that
// Postgres rejects for any integer column). Simply reloading the page can
// never fix an ID that's already persisted in the database — this runs on
// every load and quietly replaces any invalid ID with a clean one, so old
// corrupted data self-heals instead of needing to be manually found and
// deleted.
let _sanitizeIdCounter = 0;
const sanitizeId = (id) => {
    if (id !== undefined && id !== null) {
        const num = typeof id === 'number' ? id : parseFloat(id);
        if (!isNaN(num) && Number.isInteger(num)) return num;
    }
    _sanitizeIdCounter += 1;
    return Math.floor(Date.now()) + _sanitizeIdCounter;
};

const sanitizeCategories = (categories) => {
    return (categories || []).map((cat) => ({
        ...cat,
        id: sanitizeId(cat.id),
        products: (cat.products || []).map((prod) => ({
            ...prod,
            id: sanitizeId(prod.id),
            images: (prod.images || []).map((img) =>
                img && typeof img === 'object' ? { ...img, id: sanitizeId(img.id) } : img
            ),
            variations: (prod.variations || []).map((v) => ({
                ...v,
                id: sanitizeId(v.id),
                sizes: (v.sizes || []).map((s) => ({ ...s, id: sanitizeId(s.id) })),
            })),
        })),
    }));
};

export const useStoreBuilder = () => {
    const context = useContext(StoreBuilderContext);
    if (!context) {
        throw new Error('useStoreBuilder must be used within StoreBuilderProvider');
    }
    return context;
};

export const StoreBuilderProvider = ({ children }) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

    // Step 1: Brand Data
    const [brandData, setBrandData] = useState({
        brandName: '',
        tagline: '',
        logoUrl: null,
        bannerUrl: null,
        logoPublicId: null,
        bannerPublicId: null,
        brandColors: {
            primary: '#25D366',
            secondary: '#E0E3E6',
            background: '#FFFFFF',
            button: '#25D366',
            buttonLabel: '#005523',
            fontHeader: '#191C1E',
            fontBody: '#556067',
        },
        headingFont: 'Inter',
        bodyFont: 'Inter',
        baseFontSize: '16px',
    });

    // Step 2: Product Data
    const [productData, setProductData] = useState({
        categories: [],
        products: [],
    });

    // Step 3: Cart Data
    const [cartData, setCartData] = useState({
        freeDelivery: false,
        freeDeliveryThreshold: 0,
        deliveryCharge: 0,
        showProgressBar: true,
        showDeliveryMessage: true,
        enableGST: true,
        gstRate: 0,
        taxLabel: 'GST',
        showGSTBreakdownCart: true,
        showGSTBreakdownCheckout: true,
    });

    // Step 4: Payment Data
    const [paymentData, setPaymentData] = useState({
        codEnabled: false,
        upiEnabled: false,
        cardEnabled: false,
        netBankingEnabled: false,
        upiId: '',
        upiAppName: '',
        showQRCode: true,
        showUPIId: true,
        defaultPayment: 'cod',
    });

    // Step 5: Address Data
    const [addressData, setAddressData] = useState({
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
    });

    // Step 6: Order Data
    const [orderData, setOrderData] = useState({
        enableCancellation: true,
        cancellationWindow: 2,
        cancelOnlyConfirmed: true,
        showCancelReason: true,
        sendCancelEmail: true,
        showStatusTimeline: true,
        showEstimatedDelivery: true,
    });

    // Step 7: Profile Data
    const [profileData, setProfileData] = useState({
        officeNumber: '',
        supportTime: '',
        supportEmail: '',
        aboutUs: '',
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
    });

    // Step 8: Return Data
    const [returnData, setReturnData] = useState({
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
    });

    // Uploaded images tracking
    const [uploadedImages, setUploadedImages] = useState({
        logo: null,
        banner: null,
        products: {},
        categories: {},
    });

    // ✅ Store ID for saving
    const [currentStoreId, setCurrentStoreId] = useState(null);
    
    // ✅ NEW: Tenant ID for image uploads
    const [tenantId, setTenantId] = useState(null);

    // ✅ Current step in store builder
    const [currentStep, setCurrentStep] = useState(1);

    // ✅ Ready state
    const [ready, setReady] = useState(true);

    // ✅ These are the functions components will use
    const updateBrandData = (data) => {
        setBrandData(prev => ({ ...prev, ...data }));
    };

    const updateProductData = (data) => {
        setProductData(prev => ({ ...prev, ...data }));
    };

    const updateCartData = (data) => {
        setCartData(prev => ({ ...prev, ...data }));
    };

    const updatePaymentData = (data) => {
        setPaymentData(prev => ({ ...prev, ...data }));
    };

    const updateAddressData = (data) => {
        setAddressData(prev => ({ ...prev, ...data }));
    };

    const updateOrderData = (data) => {
        setOrderData(prev => ({ ...prev, ...data }));
    };

    const updateProfileData = (data) => {
        setProfileData(prev => ({ ...prev, ...data }));
    };

    const updateReturnData = (data) => {
        setReturnData(prev => ({ ...prev, ...data }));
    };

    const addProductImages = (productId, images) => {
        setUploadedImages(prev => ({
            ...prev,
            products: {
                ...prev.products,
                [productId]: [...(prev.products[productId] || []), ...images]
            }
        }));
    };

    const removeProductImage = (productId, imageToRemove) => {
        setUploadedImages(prev => ({
            ...prev,
            products: {
                ...prev.products,
                [productId]: (prev.products[productId] || []).filter(img => img.url !== imageToRemove.url)
            }
        }));
    };

    const getStoreImages = () => {
        return {
            logo: brandData.logoUrl,
            banner: brandData.bannerUrl,
            products: uploadedImages.products,
            categories: uploadedImages.categories,
        };
    };

    // ✅ START NEW STORE
    const startNewStore = () => {
        console.log('🆕 Starting new store');
        setCurrentStoreId(null);
        // ✅ FIX: tenantId comes from the logged-in user's session, not from
        // any store — it should be available immediately, even before a
        // store exists. Resetting it to null here meant a brand-new store
        // could never pass the "tenant ready" check on Step 1's Continue
        // button, since nothing else ever re-populated it for a new store.
        const userTenantId = getTenantIdFromUser();
        setTenantId(userTenantId || null);
        setCurrentStep(1);
        setReady(true);
        
        setBrandData({
            brandName: '',
            tagline: '',
            logoUrl: null,
            bannerUrl: null,
            logoPublicId: null,
            bannerPublicId: null,
            brandColors: {
                primary: '#25D366',
                secondary: '#E0E3E6',
                background: '#FFFFFF',
                button: '#25D366',
                buttonLabel: '#005523',
                fontHeader: '#191C1E',
                fontBody: '#556067',
            },
            headingFont: 'Inter',
            bodyFont: 'Inter',
            baseFontSize: '16px',
        });
        
        setProductData({
            categories: [],
            products: [],
        });
        
        setUploadedImages({
            logo: null,
            banner: null,
            products: {},
            categories: {},
        });
        
        return { success: true };
    };

    // ✅ GET TENANT ID FROM USER DATA
    const getTenantIdFromUser = () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            // ✅ FIX: user.id is the REAL tenant primary key (an integer,
            // matching what stores.tenant_id/store_images.tenant_id actually
            // expect). user.tenant_id is a separate, human-readable business
            // code (e.g. "TENANT_1785571312324") — a completely different
            // value that these integer columns correctly reject. This must
            // be checked first; the business-code fields below are only a
            // last-resort fallback for shapes that don't include a real id.
            const tenant = user.id || user.tenant_id || user.tenantId || user.current_tenant_id || user.default_tenant_id;
            if (tenant) {
                console.log('✅ Found tenant ID from user:', tenant);
                return tenant;
            }
            
            // Try to get from user's tenant list
            if (user.tenants && user.tenants.length > 0) {
                const firstTenant = user.tenants[0].id || user.tenants[0].tenant_id;
                console.log('✅ Found tenant ID from user tenants:', firstTenant);
                return firstTenant;
            }
            
            console.warn('⚠️ No tenant ID found in user data');
            return null;
        } catch (error) {
            console.error('❌ Error getting tenant ID:', error);
            return null;
        }
    };

    // ✅ SAVE STORE
    // extraFields lets a caller merge in fields not tracked by builder state
    // (e.g. { status: 'published', published_at: ... }) into this SAME save,
    // instead of making a separate, partial follow-up request — which is
    // exactly what was silently wiping out the rest of the config before.
    const saveStore = async (storeIdOverride = null, extraFields = {}) => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                console.error('❌ No token found');
                return { success: false, error: 'Not authenticated' };
            }

            if (!brandData.brandName || brandData.brandName.trim() === '') {
                return { success: false, error: 'Store name is required' };
            }

            // ✅ Use the explicitly passed ID if given (e.g. a caller that just
            // created the store moments ago in this same function and knows
            // the real ID, which the closure's currentStoreId won't reflect
            // yet), otherwise fall back to context state as before.
            const effectiveStoreId = storeIdOverride || currentStoreId;

            // ✅ Get tenant ID if not set
            let currentTenantId = tenantId;
            if (!currentTenantId) {
                currentTenantId = getTenantIdFromUser();
                if (currentTenantId) {
                    setTenantId(currentTenantId);
                }
            }

            const storeData = {
                storeName: brandData.brandName,
                tagline: brandData.tagline || '',
                logoUrl: brandData.logoUrl || null,
                bannerUrl: brandData.bannerUrl || null,
                brandColors: brandData.brandColors || {
                    primary: '#25D366',
                    secondary: '#E0E3E6',
                    background: '#FFFFFF',
                    button: '#25D366',
                    buttonLabel: '#005523',
                    fontHeader: '#191C1E',
                    fontBody: '#556067',
                },
                fonts: {
                    heading: brandData.headingFont || 'Inter',
                    body: brandData.bodyFont || 'Inter',
                },
                baseFontSize: brandData.baseFontSize || '16px',
                categories: productData.categories || [],
                productBanner: productData.banner || {},
                enableImageZoom: productData.enableImageZoom,
                cartSettings: cartData,
                paymentSettings: paymentData,
                addressSettings: addressData,
                orderSettings: orderData,
                profileSettings: profileData,
                returnSettings: returnData,
                images: uploadedImages || {},
                lastBuilderStep: currentStep,
                ...extraFields,
            };

            console.log('📝 Saving store data:', storeData);

            let response;
            
            if (effectiveStoreId) {
                console.log('🔄 Updating existing store:', effectiveStoreId);
                response = await axios.put(
                    `${API_URL}/api/stores/${effectiveStoreId}`,
                    storeData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        }
                    }
                );
            } else {
                console.log('🆕 Creating new store');
                response = await axios.post(
                    `${API_URL}/api/stores`,
                    storeData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        }
                    }
                );
                
                if (response.data?.data?.id) {
                    setCurrentStoreId(response.data.data.id);
                    console.log('✅ New store ID saved:', response.data.data.id);
                    
                    // ✅ Try to get tenant_id from response
                    if (response.data.data.tenant_id) {
                        setTenantId(response.data.data.tenant_id);
                        console.log('✅ Tenant ID from response:', response.data.data.tenant_id);
                    }
                    
                    // ✅ If still no tenant ID, try to get from user
                    if (!tenantId) {
                        const userTenantId = getTenantIdFromUser();
                        if (userTenantId) {
                            setTenantId(userTenantId);
                        }
                    }
                }
            }

            console.log('✅ Store saved successfully:', response.data);
            console.log('📌 Current Tenant ID:', tenantId);
            console.log('📌 Current Store ID:', currentStoreId);
            
            return { success: true, data: response.data };

        } catch (error) {
            console.error('❌ Save store error:', error);
            
            if (error.response?.status === 409) {
                return { 
                    success: false, 
                    error: 'This store name is already taken. Please choose a different name.' 
                };
            }
            
            return { 
                success: false, 
                error: error.response?.data?.error || error.message || 'Failed to save store' 
            };
        }
    };

    // ✅ LOAD STORE
    const loadStore = async (storeId) => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                console.error('❌ No token found');
                return { success: false, error: 'Not authenticated' };
            }

            console.log('📡 Loading store:', storeId);

            const response = await axios.get(
                `${API_URL}/api/stores/${storeId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );

            console.log('📡 Store response:', response.data);

            if (response.data?.data) {
                const store = response.data.data;
                const config = store.config || {};
                
                console.log('📡 Store config:', config);
                
                // ✅ Set store ID
                setCurrentStoreId(storeId);
                
                // ✅ FIXED: Check for both tenant_id and tenantId
                if (store.tenant_id || store.tenantId) {
                    const foundTenantId = store.tenant_id || store.tenantId;
                    setTenantId(foundTenantId);
                    console.log('✅ Tenant ID from store:', foundTenantId);
                } else {
                    // Try to get from user
                    const userTenantId = getTenantIdFromUser();
                    if (userTenantId) {
                        setTenantId(userTenantId);
                        console.log('✅ Tenant ID from user:', userTenantId);
                    }
                }
                
                // Populate Brand Data
                if (config.brand?.storeName) {
                    // ✅ Migrate old-shape saved brandColors (font/tertiary/element)
                    // to the new schema, same as Step1_BrandSetup.jsx's
                    // normalizeBrandColors — so stores saved before this color
                    // system change don't lose their saved header color or
                    // silently reset to defaults.
                    const savedColors = config.brand.brandColors || {};
                    const defaultColors = {
                        primary: '#25D366',
                        secondary: '#E0E3E6',
                        background: '#FFFFFF',
                        button: '#25D366',
                        buttonLabel: '#005523',
                        fontHeader: '#191C1E',
                        fontBody: '#556067',
                    };
                    setBrandData({
                        brandName: config.brand.storeName || '',
                        tagline: config.brand.tagline || '',
                        logoUrl: config.brand.logoUrl || null,
                        bannerUrl: config.brand.bannerUrl || null,
                        logoPublicId: null,
                        bannerPublicId: null,
                        brandColors: {
                            ...defaultColors,
                            ...savedColors,
                            fontHeader: savedColors.fontHeader || savedColors.font || defaultColors.fontHeader,
                        },
                        headingFont: config.brand.fonts?.heading || 'Inter',
                        bodyFont: config.brand.fonts?.body || 'Inter',
                        baseFontSize: config.brand.baseFontSize || '16px',
                    });
                }
                
                // Populate Product Data
                if (config.products?.categories) {
                    setProductData({ 
                        categories: sanitizeCategories(config.products.categories),
                        banner: config.products.banner || {},
                        enableImageZoom: config.products.enableImageZoom !== false,
                    });
                }
                
                // Populate Cart Data
                if (config.cart) {
                    setCartData(prev => ({ ...prev, ...config.cart }));
                }
                
                // Populate Payment Data
                if (config.payment) {
                    setPaymentData(prev => ({ ...prev, ...config.payment }));
                }
                
                // Populate Address Data
                if (config.address) {
                    setAddressData(prev => ({ ...prev, ...config.address }));
                }
                
                // Populate Order Data
                if (config.order) {
                    setOrderData(prev => ({ ...prev, ...config.order }));
                }
                
                // Populate Profile Data
                if (config.profile) {
                    setProfileData(prev => ({ ...prev, ...config.profile }));
                }
                
                // Populate Return Data
                if (config.return) {
                    setReturnData(prev => ({ ...prev, ...config.return }));
                }
                
                // Populate Images
                if (config.images) {
                    setUploadedImages(prev => ({ ...prev, ...config.images }));
                }
                
                // Set current step
                const lastStep = store.last_builder_step || 1;
                setCurrentStep(lastStep);
                setReady(true);
                
                console.log('✅ Store loaded successfully:', store);
                console.log('📌 Tenant ID:', tenantId);
                console.log('📌 Store ID:', storeId);
                console.log('📌 Last step:', lastStep);
                return { success: true, data: store };
            }

            return { success: false, error: 'Store not found' };

        } catch (error) {
            console.error('❌ Load store error:', error);
            setReady(true);
            return { 
                success: false, 
                error: error.response?.data?.error || error.message || 'Failed to load store' 
            };
        }
    };

    // ✅ NEW: Get current tenant ID (for components)
    const getCurrentTenantId = () => {
        return tenantId || getTenantIdFromUser();
    };

    // ✅ NEW: Check if store is ready for uploads
    const isStoreReadyForUploads = () => {
        return currentStoreId !== null && tenantId !== null;
    };

    // ✅ Value object
    const value = {
        // State
        brandData,
        productData,
        cartData,
        paymentData,
        addressData,
        orderData,
        profileData,
        returnData,
        uploadedImages,
        currentStoreId,
        tenantId,          // ✅ NEW: Expose tenantId
        currentStep,
        ready,
        // Setter functions
        setBrandData,
        setProductData,
        setCartData,
        setPaymentData,
        setAddressData,
        setOrderData,
        setProfileData,
        setReturnData,
        setCurrentStep,
        setTenantId,       // ✅ NEW: Allow setting tenantId
        // Update functions
        updateBrandData,
        updateProductData,
        updateCartData,
        updatePaymentData,
        updateAddressData,
        updateOrderData,
        updateProfileData,
        updateReturnData,
        // Image functions
        addProductImages,
        removeProductImage,
        getStoreImages,
        // Store operations
        saveStore,
        loadStore,
        startNewStore,
        setCurrentStoreId,
        // ✅ NEW: Helper functions
        getCurrentTenantId,
        isStoreReadyForUploads,
    };

    return (
        <StoreBuilderContext.Provider value={value}>
            {children}
        </StoreBuilderContext.Provider>
    );
};