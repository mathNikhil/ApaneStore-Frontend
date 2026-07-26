import React, { useEffect, useRef } from 'react';
import { Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom';
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

// Reads :storeId from the URL and loads that exact store (or starts a fresh
// one if storeId === 'new') before rendering any step. This is what makes
// "Launch New Store" vs "Edit this store" actually distinct — the builder
// always knows which store it's working on from the URL, not from whichever
// store happened to load first.
const StoreBuilderGate = () => {
  const { storeId: urlStoreId } = useParams();
  const { loadStore, startNewStore, ready, storeId } = useStoreBuilder();
  const lastLoadedFor = useRef(null);

  useEffect(() => {
    if (lastLoadedFor.current === urlStoreId) return;
    lastLoadedFor.current = urlStoreId;

    if (urlStoreId === 'new') {
      startNewStore();
    } else if (urlStoreId) {
      loadStore(urlStoreId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlStoreId]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc]">
        <span className="material-symbols-outlined animate-spin text-3xl text-[#556067]">progress_activity</span>
      </div>
    );
  }

  return <Outlet />;
};

const StoreBuilderRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/store-builder/new/step/1" replace />} />
      <Route path="/:storeId" element={<StoreBuilderGate />}>
        <Route path="step/1" element={<Step1_BrandSetup />} />
        <Route path="step/2" element={<Step2_ProductConfig />} />
        <Route path="step/3" element={<Step3_CartConfig />} />
        <Route path="step/4" element={<Step4_PaymentConfig />} />
        <Route path="step/5" element={<Step5_AddressConfig />} />
        <Route path="step/6" element={<Step6_OrderTrackerConfig />} />
        <Route path="step/7" element={<Step7_ProfileConfig />} />
        <Route path="step/8" element={<Step8_ReturnPolicy />} />
        <Route path="preview" element={<FinalStorePreview />} />
        <Route path="*" element={<Navigate to="step/1" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/store-builder/new/step/1" replace />} />
    </Routes>
  );
};

export default StoreBuilderRouter;
