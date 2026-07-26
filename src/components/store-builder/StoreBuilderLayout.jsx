import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../common/TopAppBar';
import ProgressBar from '../common/ProgressBar';

const StoreBuilderLayout = ({
  children,
  currentStep = 1,
  totalSteps = 8,
  title = '',
  subtitle = '',
  onBack,
  onContinue,
  loading = false,
  showBack = true,
  backLabel = 'Back',
  continueLabel = 'Save & Continue',
  showCloseButton = false,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (currentStep > 1) {
      navigate(`/store-builder/step/${currentStep - 1}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else if (currentStep < totalSteps) {
      navigate(`/store-builder/step/${currentStep + 1}`);
    } else {
      // Last step - go to preview
      navigate('/store-builder/preview');
    }
  };

  const actions = [];
  
  if (showCloseButton) {
    actions.push({
      icon: 'close',
      label: 'Close & Save',
      onClick: onClose,
    });
  }
  
  actions.push({
    icon: 'help',
    label: 'Help',
    onClick: function() {},
  });

  return (
    <div className="min-h-screen bg-[#f7f9fc] pb-24">
      <TopAppBar
        title="Store Builder"
        showBack={false}
        showProfile={false}
        actions={actions}
      />

      <div className="max-w-3xl mx-auto px-4 pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-secondary font-label-md">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-xs text-secondary font-label-md">
            {Math.round(((currentStep - 1) / (totalSteps - 1)) * 100)}%
          </span>
        </div>
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#191c1e]">{title}</h1>
          {subtitle && (
            <p className="text-[#3c4a3d] text-sm mt-1">{subtitle}</p>
          )}
        </div>

        {children}

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
              {currentStep === 8 ? (
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
              ) : currentStep === 7 ? (
                <button
                  onClick={handleContinue}
                  disabled={loading}
                  className="flex items-center gap-2 bg-[#25D366] text-[#005523] px-6 py-2.5 rounded-xl font-bold hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                  ) : (
                    <>
                      <span>Save &amp; Continue</span>
                      <span className="material-symbols-outlined text-xl">arrow_forward</span>
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
    </div>
  );
};

export default StoreBuilderLayout;