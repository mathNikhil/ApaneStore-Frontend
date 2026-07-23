import React, { useState, useEffect } from 'react';
import { useStoreBuilder } from '../../Context/StoreBuilderContext';
import StoreBuilderLayout from './StoreBuilderLayout';
import Card from '../Common/Card';
import Input from '../Common/Input';
import Toggle from '../Common/Toggle';
import Slider from '../Common/Slider';

const Step3_CartConfig = () => {
  const { cartData, setCartData } = useStoreBuilder();

  const [settings, setSettings] = useState({
    freeDelivery: cartData.freeDelivery !== undefined ? cartData.freeDelivery : true,
    freeDeliveryThreshold: cartData.freeDeliveryThreshold || 500,
    deliveryCharge: cartData.deliveryCharge || 40,
    showProgressBar: cartData.showProgressBar !== undefined ? cartData.showProgressBar : true,
    showDeliveryMessage: cartData.showDeliveryMessage !== undefined ? cartData.showDeliveryMessage : true,
    enableGST: cartData.enableGST !== undefined ? cartData.enableGST : true,
    gstRate: cartData.gstRate || 5,
    taxLabel: cartData.taxLabel || 'GST',
    showGSTBreakdownCart: cartData.showGSTBreakdownCart !== undefined ? cartData.showGSTBreakdownCart : true,
    showGSTBreakdownCheckout: cartData.showGSTBreakdownCheckout !== undefined ? cartData.showGSTBreakdownCheckout : true,
  });

  // Save to context on every change
  useEffect(() => {
    console.log('Saving Step 3 data:', settings); // Debug log
    setCartData(settings);
  }, [settings]);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSliderChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: parseInt(value) }));
  };

  return (
    <StoreBuilderLayout currentStep={3} totalSteps={7} title="Cart Configuration" subtitle="Step 3 of 7">
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[#006d2f] filled">local_shipping</span>
          <h2 className="font-label-md text-label-md text-[#556067] uppercase tracking-wider text-xs">Delivery Settings</h2>
        </div>

        <Toggle label="Enable Free Delivery" checked={settings.freeDelivery} onChange={() => handleToggle('freeDelivery')} className="mb-4" />
        <Slider label="Free Delivery Threshold" value={settings.freeDeliveryThreshold} onChange={(e) => handleSliderChange('freeDeliveryThreshold', e.target.value)} valueLabel={`₹${settings.freeDeliveryThreshold}`} min={0} max={2000} unit="₹" className="mb-4" />
        <Toggle label="Show Progress Bar on Cart Page" description="Encourages customers to add more items for free delivery" checked={settings.showProgressBar} onChange={() => handleToggle('showProgressBar')} className="mb-3" />
        <Toggle label="Show Delivery Message on Product Page" description='Display text like "Free delivery above ₹500" near buy button' checked={settings.showDeliveryMessage} onChange={() => handleToggle('showDeliveryMessage')} className="mb-3" />

        <div className="space-y-1">
          <label className="font-label-md text-[#3c4a3d] ml-1 text-xs uppercase tracking-wider">Delivery Charge (when not free)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-[#191c1e] font-semibold">₹</span>
            </div>
            <Input type="text" value={settings.deliveryCharge} onChange={(e) => setSettings(prev => ({ ...prev, deliveryCharge: Number(e.target.value.replace(/[^0-9.]/g, '')) || 0 }))} className="pl-8" />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[#006d2f] filled">receipt_long</span>
          <h2 className="font-label-md text-label-md text-[#556067] uppercase tracking-wider text-xs">Tax Settings</h2>
        </div>

        <Toggle label="Enable GST" checked={settings.enableGST} onChange={() => handleToggle('enableGST')} className="mb-4" />
        <Slider label="GST Rate (%)" value={settings.gstRate} onChange={(e) => handleSliderChange('gstRate', e.target.value)} valueLabel={`${settings.gstRate}%`} min={0} max={28} unit="%" className="mb-4" />

        <div className="space-y-1 mb-4">
          <label className="font-label-md text-[#3c4a3d] ml-1 text-xs uppercase tracking-wider">Tax Label</label>
          <Input type="text" value={settings.taxLabel} onChange={(e) => setSettings(prev => ({ ...prev, taxLabel: e.target.value }))} />
        </div>

        <Toggle label="Show GST Breakdown on Cart Page" checked={settings.showGSTBreakdownCart} onChange={() => handleToggle('showGSTBreakdownCart')} className="mb-3" />
        <Toggle label="Show GST Breakdown on Checkout Page" checked={settings.showGSTBreakdownCheckout} onChange={() => handleToggle('showGSTBreakdownCheckout')} />
      </Card>
    </StoreBuilderLayout>
  );
};

export default Step3_CartConfig;