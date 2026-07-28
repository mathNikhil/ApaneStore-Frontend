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

    // ✅ SAVE STORE - This is the function that saves the store to the database
    const saveStore = async () => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                console.error('❌ No token found');
                return { success: false, error: 'Not authenticated' };
            }

            // ✅ Validate store name
            if (!brandData.brandName || brandData.brandName.trim() === '') {
                return { success: false, error: 'Store name is required' };
            }

            // ✅ Build store data from all context states
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
            };

            console.log('📝 Saving store data:', storeData);

            let response;
            
            if (currentStoreId) {
                // ✅ Update existing store
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
                // ✅ Create new store
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
                
                // ✅ Save the new store ID
                if (response.data?.data?.id) {
                    setCurrentStoreId(response.data.data.id);
                    console.log('✅ New store ID saved:', response.data.data.id);
                }
            }

            console.log('✅ Store saved successfully:', response.data);
            return { success: true, data: response.data };

        } catch (error) {
            console.error('❌ Save store error:', error);
            
            // ✅ Handle specific error cases
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

    // ✅ GET STORE - Load existing store data
    const loadStore = async (storeId) => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                console.error('❌ No token found');
                return { success: false, error: 'Not authenticated' };
            }

            const response = await axios.get(
                `${API_URL}/api/stores/${storeId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );

            if (response.data?.data) {
                const store = response.data.data;
                const config = store.config || {};
                
                // ✅ Populate all context states from the saved store
                if (config.brand?.storeName) updateBrandData({ brandName: config.brand.storeName });
                if (config.brand?.tagline) updateBrandData({ tagline: config.brand.tagline });
                if (config.brand?.logoUrl) updateBrandData({ logoUrl: config.brand.logoUrl });
                if (config.brand?.bannerUrl) updateBrandData({ bannerUrl: config.brand.bannerUrl });
                if (config.brand?.brandColors) updateBrandData({ brandColors: config.brand.brandColors });
                if (config.brand?.fonts) {
                    updateBrandData({ 
                        headingFont: config.brand.fonts.heading || 'Inter',
                        bodyFont: config.brand.fonts.body || 'Inter',
                    });
                }
                if (config.brand?.baseFontSize) updateBrandData({ baseFontSize: config.brand.baseFontSize });
                
                if (config.products?.categories) updateProductData({ categories: config.products.categories });
                if (config.cart) updateCartData(config.cart);
                if (config.payment) updatePaymentData(config.payment);
                if (config.address) updateAddressData(config.address);
                if (config.order) updateOrderData(config.order);
                if (config.profile) updateProfileData(config.profile);
                if (config.return) updateReturnData(config.return);
                
                setCurrentStoreId(storeId);
                console.log('✅ Store loaded successfully:', store);
                return { success: true, data: store };
            }

            return { success: false, error: 'Store not found' };

        } catch (error) {
            console.error('❌ Load store error:', error);
            return { 
                success: false, 
                error: error.response?.data?.error || error.message || 'Failed to load store' 
            };
        }
    };

    // ✅ Value object to provide to components
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
        // Setter functions for components that need direct access
        setBrandData,
        setProductData,
        setCartData,
        setPaymentData,
        setAddressData,
        setOrderData,
        setProfileData,
        setReturnData,
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
        setCurrentStoreId,
    };

    return (
        <StoreBuilderContext.Provider value={value}>
            {children}
        </StoreBuilderContext.Provider>
    );
};