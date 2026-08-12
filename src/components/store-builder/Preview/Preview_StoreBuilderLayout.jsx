import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopAppBar from '../Common/TopAppBar';
import ProgressBar from '../Common/ProgressBar';
import { useStoreBuilder } from '../../Context/StoreBuilderContext';

const StoreBuilderLayout = ({
  children,
  currentStep = 1,
  totalSteps = 7,
  title = '',
  subtitle = '',
  onBack,
  onContinue,
  loading = false,
  showBack = true,
  backLabel = 'Back',
  continueLabel = 'Save & Continue',
  showCloseButton = true,
}) => {
  const navigate = useNavigate();
  const { storeId: urlStoreId } = useParams();
  const { syncStatus, saveNow, discardChanges, storeId } = useStoreBuilder();
  const [showExitModal, setShowExitModal] = useState(false);
  const [exiting, setExiting] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (currentStep > 1) {
      navigate(`/store-builder/${urlStoreId}/step/${currentStep - 1}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleContinue = async () => {
    if (onContinue) {
      onContinue();
      return;
    }
    // The button says "Save" — make that literally true, and use whatever
    // id comes back (new store gets a real id here for the first time).
    let id = urlStoreId;
    try {
      id = (await saveNow()) || storeId || urlStoreId;
    } catch (e) {
      // saveNow already surfaces syncStatus('error'); still let them continue
      id = storeId || urlStoreId;
    }
    if (currentStep < totalSteps) {
      navigate(`/store-builder/${id}/step/${currentStep + 1}`, { replace: urlStoreId === 'new' });
    } else {
      navigate(`/store-builder/${id}/preview`, { replace: urlStoreId === 'new' });
    }
  };

  const handleSaveAndClose = async () => {
    setExiting(true);
    try {
      await saveNow();
    } catch (e) {
      // still exit — their edits remain in local cache even if this save failed
    }
    navigate('/dashboard');
  };

  const handleCloseWithoutSaving = () => {
    discardChanges();
    navigate('/dashboard');
  };

  // Build actions for TopAppBar
  const actions = [
    { icon: 'help', label: 'Help', onClick: () => {} },
  ];

  return (
    <div className="min-h-screen bg-[#f7f9fc] pb-24">
      <TopAppBar
        title="Store Builder"
        showBack={false}
        actions={actions}
      />

      {/* Progress Bar + Close button, right where the tenant can always see it */}
      <div className="max-w-3xl mx-auto px-4 pt-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            {showCloseButton && (
              <button
                onClick={() => setShowExitModal(true)}
                className="flex items-center gap-1 text-xs font-semibold text-[#556067] hover:text-[#191c1e] px-2 py-1 rounded-lg hover:bg-[#eceef1] transition-colors"
              >
                <span className="material-symbols-outlined text-base">close</span>
                Close
              </button>
            )}
            <span className="text-xs text-secondary font-label-md">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {syncStatus === 'saving' && (
              <span className="text-xs text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                Saving...
              </span>
            )}
            {syncStatus === 'saved' && (
              <span className="text-xs text-[#006d2f] flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">cloud_done</span>
                Saved
              </span>
            )}
            {syncStatus === 'error' && (
              <span className="text-xs text-[#ba1a1a] flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">cloud_off</span>
                Save failed — check connection
              </span>
            )}
            <span className="text-xs text-secondary font-label-md">
              {Math.round(((currentStep - 1) / (totalSteps - 1)) * 100)}%
            </span>
          </div>
        </div>
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#191c1e]">{title}</h1>
          {subtitle && (
            <p className="text-[#3c4a3d] text-sm mt-1">{subtitle}</p>
          )}
        </div>

        {/* Content */}
        {children}

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-[#bbcbb9] shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
            {showBack ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-[#556067] px-4 py-2 hover:bg-[#eceef1] rounded-lg transition-colors active:scale-95"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
                <span className="font-label-md text-label-md font-semibold">{backLabel}</span>
              </button>
            ) : (
              <div />
            )}
            
            <div className="flex items-center gap-3">
              {currentStep === totalSteps ? (
                <button
                  onClick={handleContinue}
                  disabled={loading}
                  className="flex items-center gap-2 bg-[#25D366] text-[#005523] px-6 py-2.5 rounded-xl font-bold hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                  ) : (
                    <>
                      <span>Save &amp; Preview</span>
                      <span className="material-symbols-outlined text-xl">visibility</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleContinue}
                  disabled={loading}
                  className="flex items-center gap-2 bg-[#25D366] text-[#005523] px-6 py-2.5 rounded-xl font-bold hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                  ) : (
                    <>
                      <span>{continueLabel}</span>
                      <span className="material-symbols-outlined text-xl">arrow_forward</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Exit confirmation modal */}
      {showExitModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={() => !exiting && setShowExitModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#191c1e] mb-2">Leave the builder?</h3>
            <p className="text-sm text-[#556067] mb-6">
              You can save your progress and come back later, or discard changes made since your last save.
            </p>
            <div className="space-y-2">
              <button
                onClick={handleSaveAndClose}
                disabled={exiting}
                className="w-full py-3 rounded-xl font-bold bg-[#25D366] text-[#005523] hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {exiting ? 'Saving...' : 'Save & Close'}
              </button>
              <button
                onClick={handleCloseWithoutSaving}
                disabled={exiting}
                className="w-full py-3 rounded-xl font-semibold border-2 border-[#ba1a1a]/30 text-[#ba1a1a] hover:bg-[#ffdad6]/30 transition-colors disabled:opacity-60"
              >
                Close Without Saving
              </button>
              <button
                onClick={() => setShowExitModal(false)}
                disabled={exiting}
                className="w-full py-3 rounded-xl font-medium text-[#556067] hover:bg-[#eceef1] transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreBuilderLayout;
