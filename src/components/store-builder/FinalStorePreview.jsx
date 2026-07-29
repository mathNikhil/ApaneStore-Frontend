import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStoreBuilder } from '../../Context/StoreBuilderContext';
import PreviewDeviceToggle from './Preview/PreviewDeviceToggle';
import StorefrontApp from './Preview/StorefrontApp';

const FinalStorePreview = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const storeId = searchParams.get('storeId');
    
    const { 
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
        saveStore 
    } = useStoreBuilder();

    // ✅ Build complete builderData object - THIS IS THE ONLY PLACE DATA IS MAPPED
    const getAllBuilderData = () => {
        return {
            brand: {
                brandName: brandData.brandName || '',
                tagline: brandData.tagline || '',
                logo: brandData.logoUrl || null,
                banner: brandData.bannerUrl || null,
                colors: brandData.brandColors || {
                    primary: '#25D366',
                    secondary: '#111B21',
                    tertiary: '#008069',
                    element: '#F0F2F5',
                    background: '#FFFFFF',
                    button: '#25D366',
                    buttonLabel: '#005523',
                    font: '#191C1E',
                },
                fonts: {
                    heading: brandData.headingFont || 'Inter',
                    body: brandData.bodyFont || 'Inter',
                },
                baseFontSize: brandData.baseFontSize || '16px',
            },
            products: {
                categories: productData.categories || [],
                enableImageZoom: productData.enableImageZoom || false,
                banner: {
                    image: productData.banner?.image || null,
                    tagline: productData.banner?.tagline || 'Fresh, Organic & Delivered',
                    subtitle: productData.banner?.subtitle || '100% Natural Stone-Ground Flour',
                    cta: productData.banner?.cta || 'Shop Now',
                    height: productData.banner?.height || 400,
                    bgColor: productData.banner?.bgColor || '#25D366',
                    showCta: productData.banner?.showCta !== undefined ? productData.banner.showCta : true,
                    showText: productData.banner?.showText !== undefined ? productData.banner.showText : true,
                    textAlignment: productData.banner?.textAlignment || 'center',
                    textColor: productData.banner?.textColor || '#FFFFFF',
                },
            },
            cart: cartData || {},
            payment: paymentData || {},
            address: addressData || {},
            order: orderData || {},
            profile: profileData || {},
            return: returnData || {},
            images: uploadedImages || {},
        };
    };

    const builderData = getAllBuilderData();

    const [device, setDevice] = useState('desktop');
    const [publishing, setPublishing] = useState(false);
    const [publishedInfo, setPublishedInfo] = useState(null);

    const deviceWidths = { desktop: '1200px', tablet: '768px', mobile: '400px' };
    const deviceHeights = { desktop: '820px', tablet: '900px', mobile: '812px' };

    const primaryColor = builderData?.brand?.colors?.primary || '#25D366';
    const secondaryColor = builderData?.brand?.colors?.secondary || '#556067';

    const handlePublish = async () => {
        if (!window.confirm('Ready to publish your store? This will make it live at its public URL.')) return;
        
        setPublishing(true);
        try {
            const saveResult = await saveStore();
            if (!saveResult.success) {
                alert('Failed to save store: ' + (saveResult.error || 'Please try again'));
                setPublishing(false);
                return;
            }

            const id = currentStoreId || storeId || saveResult.data?.id;
            if (!id) {
                alert('Store ID not found. Please save your store first.');
                setPublishing(false);
                return;
            }

            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
            
            const response = await fetch(`${API_URL}/api/stores/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    status: 'active',
                    published_at: new Date().toISOString()
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                const subdomain = result?.data?.subdomain || builderData?.brand?.brandName?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'my-store';
                setPublishedInfo({ subdomain });
            } else {
                alert('Failed to publish store: ' + (result.error || 'Please try again'));
            }
        } catch (e) {
            console.error('Failed to publish store:', e);
            alert('Publishing failed — check your connection and try again.');
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex flex-col">
            {/* Top Bar - Device Toggle & Actions */}
            <div className="bg-white border-b px-4 py-3 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/store-builder/step/8')}
                        className="text-[#556067] hover:bg-[#f2f4f7] p-2 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="font-semibold text-lg">Store Preview</h2>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <PreviewDeviceToggle device={device} onChange={setDevice} />

                    <button
                        onClick={handlePublish}
                        disabled={publishing}
                        className="px-4 py-2 rounded-lg font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                        style={{ backgroundColor: primaryColor }}
                    >
                        {publishing ? 'Publishing...' : 'Ready to Publish'}
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 rounded-lg font-medium border hover:bg-[#f2f4f7] transition-colors"
                        style={{ borderColor: secondaryColor, color: secondaryColor }}
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Store Content - Scaled to Device */}
            <div className="flex-1 overflow-y-auto bg-[#f2f4f7] p-4 flex justify-center">
                <StorefrontApp
                    builderData={builderData}
                    storeId={currentStoreId || storeId}
                    device={device}
                    className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-500"
                    style={{ 
                        width: '100%', 
                        maxWidth: deviceWidths[device] || '1200px', 
                        height: deviceHeights[device] || '820px' 
                    }}
                />
            </div>

            {/* Published success modal */}
            {publishedInfo && (
                <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
                        <span className="material-symbols-outlined text-5xl text-[#006d2f] block mb-3">check_circle</span>
                        <h3 className="text-xl font-bold text-[#191c1e] mb-2">Your store is live! 🎉</h3>
                        <p className="text-sm text-[#556067] mb-4">
                            Running locally for now — customers can visit at:
                        </p>
                        <div className="bg-[#f2f4f7] rounded-lg px-4 py-3 mb-6 break-all font-mono text-sm text-[#006d2f]">
                            {publishedInfo.subdomain}.apnaestore.com
                        </div>
                        <div className="flex flex-col gap-2">
                            <a
                                href={`http://localhost:3000/?store=${publishedInfo.subdomain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Visit Your Live Store
                            </a>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full py-3 rounded-xl font-semibold text-[#556067] hover:bg-[#eceef1] transition-colors"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinalStorePreview;