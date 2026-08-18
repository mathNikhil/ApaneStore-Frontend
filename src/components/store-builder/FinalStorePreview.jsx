import { showSuccess, showError } from '../../utils/toast';
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
        loadStore,
        saveStore 
    } = useStoreBuilder();

    // ✅ Build complete builderData object - THIS IS THE ONLY PLACE DATA IS MAPPED
    const getAllBuilderData = () => {
        console.log('🎯 getAllBuilderData - productData:', JSON.stringify({
            categoryImageShape: productData?.categoryImageShape,
            categoryImageSize: productData?.categoryImageSize,
            autoSlide: productData?.autoSlideProductImages
        }));
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
                categoryImageShape: productData.categoryImageShape || 'circle',
                categoryImageSize: productData.categoryImageSize || 'S',
                autoSlideProductImages: productData.autoSlideProductImages || false,
                banner: {
                    image: productData.banner?.image || null,
                    tagline: productData.banner?.tagline || '',
                    subtitle: productData.banner?.subtitle || '',
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

    const builderData = React.useMemo(() => getAllBuilderData(), [productData, brandData, cartData, paymentData, addressData, orderData, profileData, returnData, uploadedImages]);

    const [device, setDevice] = useState('desktop');
    const [publishing, setPublishing] = useState(false);
    const [publishedInfo, setPublishedInfo] = useState(null);

    const deviceWidths = { desktop: '1200px', tablet: '768px', mobile: '400px' };
    const deviceHeights = { desktop: '820px', tablet: '900px', mobile: '812px' };

    const primaryColor = builderData?.brand?.colors?.primary || '#25D366';
    const secondaryColor = builderData?.brand?.colors?.secondary || '#556067';
    const backgroundColor = builderData?.brand?.colors?.background || '#FFFFFF';

    const handlePublish = async () => {
        setPublishing(true);
        try {
            // ✅ Ready to Publish no longer publishes directly — it now
            // hands off to the domain/hosting/payment flow, which is the
            // only place stores.status actually becomes 'published' (only
            // after payment). This just makes sure the latest config is
            // saved before handing off.
            const saveResult = await saveStore();

            if (!saveResult.success) {
                showError('Failed to save store: ' + (saveResult.error || 'Please try again'));
                setPublishing(false);
                return;
            }

            const id = saveResult.data?.data?.id || currentStoreId || storeId;
            navigate(`/store-builder/publish/domain?storeId=${id}`);
        } catch (e) {
            console.error('Failed to save store before publishing:', e);
            showError('Something went wrong — check your connection and try again.');
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
                        onClick={() => {
                            const id = currentStoreId || storeId;
                            navigate(id ? `/store-builder/step/8?storeId=${id}` : '/store-builder/step/8');
                        }}
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
                    className="rounded-xl shadow-2xl overflow-hidden transition-all duration-500"
                    style={{ 
                        width: '100%', 
                        maxWidth: deviceWidths[device] || '1200px', 
                        height: deviceHeights[device] || '820px',
                        backgroundColor: backgroundColor
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
                            {publishedInfo.subdomain}.aapnaestore.com
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