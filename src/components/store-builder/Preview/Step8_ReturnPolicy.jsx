import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStoreBuilder } from '../../Context/StoreBuilderContext';
import StoreBuilderLayout from './StoreBuilderLayout';
import Card from '../Common/Card';
import Toggle from '../Common/Toggle';

const Step8_ReturnPolicy = () => {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const { returnData, setReturnData } = useStoreBuilder();

  const [settings, setSettings] = useState({
    isEnabled: returnData.isEnabled !== undefined ? returnData.isEnabled : true,
    returnWindowDays: returnData.returnWindowDays || 7,
    restockingFeePercent: returnData.restockingFeePercent || 0,
    returnShippingMethod: returnData.returnShippingMethod || 'customer-pays',
    requirePhotos: returnData.requirePhotos !== undefined ? returnData.requirePhotos : false,
    requireReason: returnData.requireReason !== undefined ? returnData.requireReason : true,
    allowedReasons: returnData.allowedReasons || [
      'wrong_size',
      'damaged',
      'not_as_described',
      'changed_mind',
      'wrong_product',
    ],
    rules: returnData.rules || [],
  });

  useEffect(() => {
    setReturnData(settings);
  }, [settings]);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleReasonToggle = (reasonId) => {
    setSettings(prev => {
      const newReasons = prev.allowedReasons.includes(reasonId)
        ? prev.allowedReasons.filter(r => r !== reasonId)
        : [...prev.allowedReasons, reasonId];
      return { ...prev, allowedReasons: newReasons };
    });
  };

  const handleSliderChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: parseInt(value) }));
  };

  const windowDays = [0, 7, 14, 21, 30, 45, 60];
  const feePercentages = [0, 5, 10, 15, 20, 25];

  const getWindowIndex = (days) => {
    for (var i = 0; i < windowDays.length; i++) {
      if (windowDays[i] === days) return i;
    }
    return 1;
  };

  const getFeeIndex = (fee) => {
    for (var i = 0; i < feePercentages.length; i++) {
      if (feePercentages[i] === fee) return i;
    }
    return 0;
  };

  const reasonOptions = [
    { id: 'wrong_size', label: 'Wrong Size' },
    { id: 'damaged', label: 'Damaged / Defective' },
    { id: 'not_as_described', label: 'Not as Described' },
    { id: 'changed_mind', label: 'Changed Mind' },
    { id: 'wrong_product', label: 'Wrong Product' },
    { id: 'other', label: 'Other' },
  ];

  const handleSaveAndPreview = () => {
    navigate(`/store-builder/${storeId}/preview`);
  };

  return (
    <StoreBuilderLayout
      currentStep={8}
      totalSteps={8}
      title="Return Configuration"
      subtitle="Configure how customers can return products"
      backLabel="Back to Profile"
      continueLabel="Save & Preview"
      onContinue={handleSaveAndPreview}
    >
      {/* Enable Returns */}
      <Card className="mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-[#191c1e] mb-1">Enable Returns</h3>
            <p className="text-sm text-[#556067] leading-relaxed">
              Allow customers to return products for refund or exchange.
            </p>
          </div>
          <Toggle
            checked={settings.isEnabled}
            onChange={() => handleToggle('isEnabled')}
            className="ml-4"
          />
        </div>
        <div className="mt-3 p-3 bg-[#67c9af]/10 rounded-lg border border-[#67c9af]/30">
          <p className="text-sm text-[#005343] font-medium italic flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006b58] text-base">lightbulb</span>
            Most stores offer returns to build customer trust.
          </p>
        </div>
      </Card>

      {/* Return Window */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-[#191c1e]">Return Window</h3>
          <span className="bg-[#25D366]/20 text-[#005523] px-3 py-1 rounded-full font-bold text-sm">
            {settings.returnWindowDays} days
          </span>
        </div>

        <div className="relative">
          <input
            type="range"
            min="0"
            max="6"
            step="1"
            value={getWindowIndex(settings.returnWindowDays)}
            onChange={(e) => handleSliderChange('returnWindowDays', windowDays[parseInt(e.target.value)])}
            className="w-full h-1.5 bg-[#e0e3e6] rounded-lg appearance-none cursor-pointer accent-[#006d2f]"
          />
          <div className="flex justify-between mt-2">
            {windowDays.map((days) => (
              <span key={days} className="text-[10px] font-semibold text-[#556067]">
                {days}d
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3 p-3 bg-[#d9e4ec]/20 rounded-lg border border-[#d9e4ec]/50">
          <p className="text-sm text-[#5b666d] font-medium italic flex items-center gap-2">
            <span className="material-symbols-outlined text-[#556067] text-base">info</span>
            Most stores offer 7-30 days return window.
          </p>
        </div>
      </Card>

      {/* Restocking Fee */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-[#191c1e]">Restocking Fee</h3>
          <span className="bg-[#25D366]/20 text-[#005523] px-3 py-1 rounded-full font-bold text-sm">
            {settings.restockingFeePercent}%
          </span>
        </div>

        <div className="relative">
          <input
            type="range"
            min="0"
            max="5"
            step="1"
            value={getFeeIndex(settings.restockingFeePercent)}
            onChange={(e) => handleSliderChange('restockingFeePercent', feePercentages[parseInt(e.target.value)])}
            className="w-full h-1.5 bg-[#e0e3e6] rounded-lg appearance-none cursor-pointer accent-[#006d2f]"
          />
          <div className="flex justify-between mt-2">
            {feePercentages.map((fee) => (
              <span key={fee} className="text-[10px] font-semibold text-[#556067]">
                {fee}%
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3 p-3 bg-[#d9e4ec]/20 rounded-lg border border-[#d9e4ec]/50">
          <p className="text-sm text-[#5b666d] font-medium italic flex items-center gap-2">
            <span className="material-symbols-outlined text-[#556067] text-base">toll</span>
            Deducted from refund amount.
          </p>
        </div>
      </Card>

      {/* Return Shipping Method */}
      <Card className="mb-6">
        <h3 className="font-semibold text-sm text-[#191c1e] mb-4">Return Shipping Method</h3>

        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-[#f2f4f7] transition-colors">
            <input
              type="radio"
              name="returnShippingMethod"
              value="customer-pays"
              checked={settings.returnShippingMethod === 'customer-pays'}
              onChange={(e) => handleChange('returnShippingMethod', e.target.value)}
              className="w-4 h-4 text-[#006d2f]"
            />
            <div>
              <span className="font-medium text-sm text-[#191c1e]">Customer Pays Shipping</span>
              <p className="text-xs text-[#556067]">Customer arranges and pays for return shipping</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-[#f2f4f7] transition-colors">
            <input
              type="radio"
              name="returnShippingMethod"
              value="prepaid-label"
              checked={settings.returnShippingMethod === 'prepaid-label'}
              onChange={(e) => handleChange('returnShippingMethod', e.target.value)}
              className="w-4 h-4 text-[#006d2f]"
            />
            <div>
              <span className="font-medium text-sm text-[#191c1e]">Prepaid Return Label</span>
              <p className="text-xs text-[#556067]">You provide a prepaid shipping label</p>
              <span className="text-xs text-[#006d2f] font-medium">Additional cost for you</span>
            </div>
          </label>
        </div>
      </Card>

      {/* Return Reasons */}
      <Card className="mb-6">
        <h3 className="font-semibold text-sm text-[#191c1e] mb-4">Return Reasons</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {reasonOptions.map((reason) => (
            <label key={reason.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowedReasons.includes(reason.id)}
                onChange={() => handleReasonToggle(reason.id)}
                className="w-4 h-4 text-[#006d2f] rounded border-[#bbcbb9] focus:ring-[#25D366]"
              />
              <span className="text-sm text-[#191c1e]">{reason.label}</span>
            </label>
          ))}
        </div>
        <div className="mt-3 p-3 bg-[#d9e4ec]/20 rounded-lg border border-[#d9e4ec]/50">
          <p className="text-sm text-[#5b666d] font-medium italic flex items-center gap-2">
            <span className="material-symbols-outlined text-[#556067] text-base">info</span>
            Customers will select from these reasons when requesting a return.
          </p>
        </div>
      </Card>

      {/* Additional Settings */}
      <Card>
        <h3 className="font-semibold text-sm text-[#191c1e] mb-4">Additional Settings</h3>

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