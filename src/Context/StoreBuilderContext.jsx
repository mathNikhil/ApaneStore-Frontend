import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const StoreBuilderContext = createContext();

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
            secondary: '#111B21',
            tertiary: '#008069',
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
    });

    // Step 4: Payment Data
    const [paymentData, setPaymentData] = useState({
        codEnabled: true,
        upiEnabled: true,
        cardEnabled: false,
        netBankingEnabled: false,
        upiId: '8800244169@upi',
        upiAppName: 'GPay/PhonePe',
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

    // Store ID for saving
    const [currentStoreId, setCurrentStoreId] = useState(null);

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
                secondary: '#111B21',
                tertiary: '#008069',
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

    // ✅ SAVE STORE
    const saveStore = async () => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                console.error('❌ No token found');
                return { success: false, error: 'Not authenticated' };
            }

            if (!brandData.brandName || brandData.brandName.trim() === '') {
                return { success: false, error: 'Store name is required' };
            }

            const storeData = {
                storeName: brandData.brandName,
                tagline: brandData.tagline || '',
                logoUrl: brandData.logoUrl || null,
                bannerUrl: brandData.bannerUrl || null,
                brandColors: brandData.brandColors || {
                    primary: '#25D366',
                    secondary: '#111B21',
                    tertiary: '#008069',
                },
                fonts: {
                    heading: brandData.headingFont || 'Inter',
                    body: brandData.bodyFont || 'Inter',
                },
                baseFontSize: brandData.baseFontSize || '16px',
                categories: productData.categories || [],
                cartSettings: cartData,
                paymentSettings: paymentData,
                addressSettings: addressData,
                orderSettings: orderData,
                profileSettings: profileData,
                returnSettings: returnData,
                images: uploadedImages || {},
                lastBuilderStep: currentStep,
            };

            console.log('📝 Saving store data:', storeData);

            let response;
            
            if (currentStoreId) {
                console.log('🔄 Updating existing store:', currentStoreId);
                response = await axios.put(
                    `${API_URL}/api/stores/${currentStoreId}`,
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
                }
            }

            console.log('✅ Store saved successfully:', response.data);
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
                
                // Populate Brand Data
                if (config.brand?.storeName) {
                    setBrandData({
                        brandName: config.brand.storeName || '',
                        tagline: config.brand.tagline || '',
                        logoUrl: config.brand.logoUrl || null,
                        bannerUrl: config.brand.bannerUrl || null,
                        logoPublicId: null,
                        bannerPublicId: null,
                        brandColors: config.brand.brandColors || {
                            primary: '#25D366',
                            secondary: '#111B21',
                            tertiary: '#008069',
                        },
                        headingFont: config.brand.fonts?.heading || 'Inter',
                        bodyFont: config.brand.fonts?.body || 'Inter',
                        baseFontSize: config.brand.baseFontSize || '16px',
                    });
                }
                
                // Populate Product Data
                if (config.products?.categories) {
                    setProductData({ 
                        categories: config.products.categories || [],
                        products: []
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
                setCurrentStoreId(storeId);
                setReady(true);
                
                console.log('✅ Store loaded successfully:', store);
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

    // ✅ Value object - ONLY ONE DECLARATION
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
    };

    return (
        <StoreBuilderContext.Provider value={value}>
            {children}
        </StoreBuilderContext.Provider>
    );
};