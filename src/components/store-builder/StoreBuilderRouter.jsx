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
import FinalStorePreview from './FinalStorePreview';
import PublishFlowRouter from '../publish-flow/PublishFlowRouter';
import PublishQuickConfirm from '../publish-flow/PublishQuickConfirm';
import PublishDomainSelection from '../publish-flow/PublishDomainSelection';
import PublishHostingChoice from '../publish-flow/PublishHostingChoice';
import PublishHostingSuccess from '../publish-flow/PublishHostingSuccess';
import PublishOwnHostingConfig from '../publish-flow/PublishOwnHostingConfig';
import PublishDnsRequired from '../publish-flow/PublishDnsRequired';
import PublishDnsSuccess from '../publish-flow/PublishDnsSuccess';
import PublishPayment from '../publish-flow/PublishPayment';
import PublishCongratulations from '../publish-flow/PublishCongratulations';
import PublishAlreadyLive from '../publish-flow/PublishAlreadyLive';

const StoreBuilderRouter = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loadStore, startNewStore, currentStoreId, ready } = useStoreBuilder();
    
    const storeId = searchParams.get('storeId');

    useEffect(() => {
        console.log('🔍 StoreBuilderRouter - storeId from URL:', storeId);
        console.log('🔍 StoreBuilderRouter - currentStoreId in Context:', currentStoreId);

        if (storeId && storeId !== 'null' && storeId !== 'undefined') {
            if (storeId !== currentStoreId) {
                console.log('📡 Loading store:', storeId);
                loadStore(storeId);
            }
        } else {
            // CRITICAL FIX: Only start a new store if there is NO existing store running.
            if (!currentStoreId) {
                console.log('🆕 Starting new store');
                startNewStore();
            } else {
                console.log('⏸️ Keeping existing store loaded:', currentStoreId);
            }
        }
    }, [storeId, currentStoreId]);

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
            <Route path="/preview" element={<FinalStorePreview />} />
            <Route path="/publish/*" element={<PublishFlowRouter />}>
                <Route path="domain" element={<PublishDomainSelection />} />
                <Route path="hosting" element={<PublishHostingChoice />} />
                <Route path="hosting-success" element={<PublishHostingSuccess />} />
                <Route path="own-hosting" element={<PublishOwnHostingConfig />} />
                <Route path="dns" element={<PublishDnsRequired />} />
                <Route path="dns-success" element={<PublishDnsSuccess />} />
                <Route path="payment" element={<PublishPayment />} />
                <Route path="success" element={<PublishCongratulations />} />
                <Route path="already-live" element={<PublishAlreadyLive />} />
                <Route path="quick-confirm" element={<PublishQuickConfirm />} />
            </Route>
            <Route path="*" element={<Navigate to="/store-builder/step/1" replace />} />
        </Routes>
    );
};

export default StoreBuilderRouter;