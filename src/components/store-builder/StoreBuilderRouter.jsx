import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { useStoreBuilder } from '../../Context/StoreBuilderContext';
import Step1_BrandSetup from './Step1_BrandSetup';
import Step2_ProductConfig from './Step2_ProductConfig';
import Step3_CartConfig from './Step3_CartConfig';
import Step4_PaymentConfig from './Step4_PaymentConfig';
import Step5_AddressConfig from './Step5_AddressConfig';
import Step6_OrderTrackerConfig from './Step6_OrderTrackerConfig';
import Step7_ProfileConfig from './Step7_ProfileConfig';
import Step8_ReturnPolicy from './Step8_ReturnPolicy';
// ✅ Import the preview component (already exists)
import FinalStorePreview from './FinalStorePreview';

const StoreBuilderRouter = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loadStore, startNewStore, currentStoreId, ready } = useStoreBuilder();
    
    const storeId = searchParams.get('storeId');

    useEffect(() => {
        console.log('🔍 StoreBuilderRouter - storeId from URL:', storeId);

        if (storeId && storeId !== 'null' && storeId !== 'undefined') {
            if (storeId !== currentStoreId) {
                console.log('📡 Loading store:', storeId);
                loadStore(storeId);
            }
        } else {
            console.log('🆕 Starting new store');
            startNewStore();
        }
    }, [storeId]);

    if (!ready) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc]">
                <span className="material-symbols-outlined animate-spin text-3xl text-[#556067]">progress_activity</span>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<Navigate to="/store-builder/step/1" replace />} />
            <Route path="/step/1" element={<Step1_BrandSetup />} />
            <Route path="/step/2" element={<Step2_ProductConfig />} />
            <Route path="/step/3" element={<Step3_CartConfig />} />
            <Route path="/step/4" element={<Step4_PaymentConfig />} />
            <Route path="/step/5" element={<Step5_AddressConfig />} />
            <Route path="/step/6" element={<Step6_OrderTrackerConfig />} />
            <Route path="/step/7" element={<Step7_ProfileConfig />} />
            <Route path="/step/8" element={<Step8_ReturnPolicy />} />
            {/* ✅ Preview route - already exists, just ensuring it's here */}
            <Route path="/preview" element={<FinalStorePreview />} />
            <Route path="*" element={<Navigate to="/store-builder/step/1" replace />} />
        </Routes>
    );
};

export default StoreBuilderRouter;