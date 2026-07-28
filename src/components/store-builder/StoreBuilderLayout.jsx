import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreBuilder } from '../../context/StoreBuilderContext';
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
    showCloseButton = true,
    closeLabel = 'Save & Close',
}) => {
    const navigate = useNavigate();
    const { saveStore } = useStoreBuilder();
    const [saving, setSaving] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (currentStep > 1) {
            navigate(`/store-builder/step/${currentStep - 1}`);
        } else {
            navigate('/dashboard');
        }
    };

    const handleContinue = async () => {
        if (onContinue) {
            onContinue();
        } else if (currentStep < totalSteps) {
            setSaving(true);
            const result = await saveStore();
            setSaving(false);
            
            if (result.success) {
                navigate(`/store-builder/step/${currentStep + 1}`);
            } else {
                alert('Failed to save: ' + (result.error || 'Please try again'));
            }
        } else {
            setSaving(true);
            const result = await saveStore();
            setSaving(false);
            
            if (result.success) {
                navigate('/store-builder/preview');
            } else {
                alert('Failed to save: ' + (result.error || 'Please try again'));
            }
        }
    };

    const handleClose = async () => {
        setSaving(true);
        const result = await saveStore();
        setSaving(false);
        
        if (result.success) {
            navigate('/dashboard');
        } else {
            alert('Failed to save: ' + (result.error || 'Please try again'));
        }
    };

    // ❌ REMOVED: TopAppBar actions (close button removed from header)
    const actions = [
        {
            icon: 'help',
            label: 'Help',
            onClick: () => {
                alert(
                    'Store Builder Help:\n\n' +
                    '1. Fill in each step\n' +
                    '2. Click Save & Continue to proceed\n' +
                    '3. Click Save & Close to save progress and exit\n' +
                    '4. You can return later to continue'
                );
            },
        },
    ];

    return (
        <div className="min-h-screen bg-[#f7f9fc] pb-24">
            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Save & Close?</h3>
                        <p className="text-gray-600 text-sm mb-6">
                            Your progress will be saved. Are you sure you want to close the store builder?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClose}
                                disabled={saving}
                                className="px-4 py-2 bg-[#25D366] text-[#005523] rounded-lg font-bold hover:brightness-105 transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Yes, Save & Close'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <TopAppBar
                title="Store Builder"
                showBack={false}
                showProfile={false}
                actions={actions}
            />

            {/* Progress Bar */}
            <div className="max-w-3xl mx-auto px-4 pt-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500 font-medium">
                        Step {currentStep} of {totalSteps}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                        {Math.round(((currentStep - 1) / (totalSteps - 1)) * 100)}%
                    </span>
                </div>
                <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
            </div>

            <main className="max-w-3xl mx-auto px-4 py-6">
                {/* Header - NO close button here anymore */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-[#191c1e]">{title}</h1>
                    {subtitle && (
                        <p className="text-[#3c4a3d] text-sm mt-1">{subtitle}</p>
                    )}
                </div>

                {/* Content */}
                {children}

                {/* Bottom Navigation - Keep close button only here */}
                <div className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-[#bbcbb9] shadow-sm">
                    <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
                        {showBack ? (
                            <button
                                onClick={handleBack}
                                disabled={saving}
                                className="flex items-center gap-1 text-[#556067] px-4 py-2 hover:bg-[#eceef1] rounded-lg transition-colors active:scale-95 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-xl">chevron_left</span>
                                <span className="font-medium text-sm">{backLabel}</span>
                            </button>
                        ) : (
                            <div />
                        )}

                        <div className="flex items-center gap-3">
                            {showCloseButton && (
                                <button
                                    onClick={() => setShowConfirmDialog(true)}
                                    disabled={saving}
                                    className="flex items-center gap-1 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {saving ? (
                                        <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-base">close</span>
                                    )}
                                    {saving ? 'Saving...' : 'Save & Close'}
                                </button>
                            )}

                            <button
                                onClick={handleContinue}
                                disabled={saving || loading}
                                className="flex items-center gap-2 bg-[#25D366] text-[#005523] px-6 py-2.5 rounded-xl font-bold hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {saving ? (
                                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                                ) : (
                                    <>
                                        <span>{saving ? 'Saving...' : continueLabel}</span>
                                        {currentStep < totalSteps && (
                                            <span className="material-symbols-outlined text-xl">arrow_forward</span>
                                        )}
                                        {currentStep === totalSteps && (
                                            <span className="material-symbols-outlined text-xl">visibility</span>
                                        )}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StoreBuilderLayout;