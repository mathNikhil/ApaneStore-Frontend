import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreBuilder } from '../../Context/StoreBuilderContext';
import StoreBuilderLayout from './StoreBuilderLayout';
import Card from '../Common/Card';
import Toggle from '../Common/Toggle';

const Step8_ReturnPolicy = () => {
    const navigate = useNavigate();
    const { saveStore } = useStoreBuilder();
    const [saving, setSaving] = useState(false);

    const [settings, setSettings] = useState({
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

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSliderChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: parseInt(value) }));
    };

    const handleReasonToggle = (reasonId) => {
        setSettings(prev => {
            const newReasons = prev.allowedReasons.includes(reasonId)
                ? prev.allowedReasons.filter(r => r !== reasonId)
                : [...prev.allowedReasons, reasonId];
            return { ...prev, allowedReasons: newReasons };
        });
    };

    const handleClose = () => {
        console.log('Saving return policy data:', settings);
        navigate('/dashboard');
    };

    // ✅ ONLY THIS FUNCTION IS ADDED/CHANGED - Navigate to preview
    const handleSaveAndPreview = async () => {
        setSaving(true);
        try {
            const result = await saveStore();
            if (result.success) {
                // ✅ Navigate to preview page with storeId
                const storeId = result.data?.id || localStorage.getItem('currentStoreId');
                navigate(`/store-builder/preview?storeId=${storeId}`);
            } else {
                alert('Failed to save: ' + (result.error || 'Please try again'));
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const windowDays = [0, 7, 14, 21, 30, 45, 60];
    const feePercentages = [0, 5, 10, 15, 20, 25];

    const reasonOptions = [
        { id: 'wrong_size', label: 'Wrong Size' },
        { id: 'damaged', label: 'Damaged / Defective' },
        { id: 'not_as_described', label: 'Not as Described' },
        { id: 'changed_mind', label: 'Changed Mind' },
        { id: 'wrong_product', label: 'Wrong Product' },
        { id: 'other', label: 'Other' },
    ];

    return (
        <StoreBuilderLayout
            currentStep={8}
            totalSteps={8}
            title="Return Configuration"
            subtitle="Configure how customers can return products"
            onClose={handleClose}
            onContinue={handleSaveAndPreview}
            continueLabel="Save & Preview"
        >
            {/* Enable Returns */}
            <Card className="mb-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="font-semibold text-sm text-gray-800 mb-1">Enable Returns</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Allow customers to return products for refund or exchange.
                        </p>
                    </div>
                    <Toggle
                        checked={settings.isEnabled}
                        onChange={() => handleToggle('isEnabled')}
                        className="ml-4"
                    />
                </div>
                <div className="mt-3 p-3 bg-teal-50 rounded-lg border border-teal-200">
                    <p className="text-sm text-teal-700 font-medium italic flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal-600 text-base">lightbulb</span>
                        Most stores offer returns to build customer trust.
                    </p>
                </div>
            </Card>

            {/* Return Window */}
            <Card className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm text-gray-800">Return Window</h3>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-sm">
                        {settings.returnWindowDays} days
                    </span>
                </div>
                <div className="relative">
                    <input
                        type="range"
                        min="0"
                        max="6"
                        step="1"
                        value={windowDays.indexOf(settings.returnWindowDays)}
                        onChange={(e) => handleSliderChange('returnWindowDays', windowDays[parseInt(e.target.value)])}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />
                    <div className="flex justify-between mt-2">
                        {windowDays.map((days) => (
                            <span key={days} className="text-[10px] font-semibold text-gray-400">
                                {days}d
                            </span>
                        ))}
                    </div>
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500 font-medium italic flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400 text-base">info</span>
                        Most stores offer 7-30 days return window.
                    </p>
                </div>
            </Card>

            {/* Restocking Fee */}
            <Card className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm text-gray-800">Restocking Fee</h3>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-sm">
                        {settings.restockingFeePercent}%
                    </span>
                </div>
                <div className="relative">
                    <input
                        type="range"
                        min="0"
                        max="5"
                        step="1"
                        value={feePercentages.indexOf(settings.restockingFeePercent)}
                        onChange={(e) => handleSliderChange('restockingFeePercent', feePercentages[parseInt(e.target.value)])}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />
                    <div className="flex justify-between mt-2">
                        {feePercentages.map((fee) => (
                            <span key={fee} className="text-[10px] font-semibold text-gray-400">
                                {fee}%
                            </span>
                        ))}
                    </div>
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500 font-medium italic flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400 text-base">toll</span>
                        Deducted from refund amount.
                    </p>
                </div>
            </Card>

            {/* Return Shipping */}
            <Card className="mb-6">
                <h3 className="font-semibold text-sm text-gray-800 mb-4">Return Shipping Method</h3>
                <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                            type="radio"
                            name="returnShippingMethod"
                            value="customer-pays"
                            checked={settings.returnShippingMethod === 'customer-pays'}
                            onChange={(e) => setSettings(prev => ({ ...prev, returnShippingMethod: e.target.value }))}
                            className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <div>
                            <span className="font-medium text-sm text-gray-800">Customer Pays Shipping</span>
                            <p className="text-xs text-gray-500">Customer arranges and pays for return shipping</p>
                        </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                            type="radio"
                            name="returnShippingMethod"
                            value="prepaid-label"
                            checked={settings.returnShippingMethod === 'prepaid-label'}
                            onChange={(e) => setSettings(prev => ({ ...prev, returnShippingMethod: e.target.value }))}
                            className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <div>
                            <span className="font-medium text-sm text-gray-800">Prepaid Return Label</span>
                            <p className="text-xs text-gray-500">You provide a prepaid shipping label</p>
                            <span className="text-xs text-green-600 font-medium">Additional cost for you</span>
                        </div>
                    </label>
                </div>
            </Card>

            {/* Return Reasons */}
            <Card className="mb-6">
                <h3 className="font-semibold text-sm text-gray-800 mb-4">Return Reasons</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {reasonOptions.map((reason) => (
                        <label key={reason.id} className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.allowedReasons.includes(reason.id)}
                                onChange={() => handleReasonToggle(reason.id)}
                                className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700">{reason.label}</span>
                        </label>
                    ))}
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500 font-medium italic flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400 text-base">info</span>
                        Customers will select from these reasons when requesting a return.
                    </p>
                </div>
            </Card>

            {/* Additional Settings */}
            <Card>
                <h3 className="font-semibold text-sm text-gray-800 mb-4">Additional Settings</h3>
                <div className="space-y-4">
                    <Toggle
                        label="Require Photos for Return"
                        description="Customers must upload photos when requesting a return"
                        checked={settings.requirePhotos}
                        onChange={() => handleToggle('requirePhotos')}
                    />
                    <Toggle
                        label="Require Return Reason"
                        description="Customers must select a reason for return"
                        checked={settings.requireReason}
                        onChange={() => handleToggle('requireReason')}
                    />
                </div>
            </Card>
        </StoreBuilderLayout>
    );
};

export default Step8_ReturnPolicy;