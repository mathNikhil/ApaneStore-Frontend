import React, { useState, useEffect } from 'react';
import { useStoreBuilder } from '../../Context/StoreBuilderContext';
import StoreBuilderLayout from './StoreBuilderLayout';
import Card from '../Common/Card';
import Input from '../Common/Input';
import Toggle from '../Common/Toggle';

const Step4_PaymentConfig = () => {
  const { paymentData, setPaymentData } = useStoreBuilder();

  const [settings, setSettings] = useState({
    codEnabled: paymentData.codEnabled !== undefined ? paymentData.codEnabled : true,
    upiEnabled: paymentData.upiEnabled !== undefined ? paymentData.upiEnabled : true,
    cardEnabled: paymentData.cardEnabled !== undefined ? paymentData.cardEnabled : false,
    netBankingEnabled: paymentData.netBankingEnabled !== undefined ? paymentData.netBankingEnabled : false,
    upiId: paymentData.upiId || '',
    upiAppName: paymentData.upiAppName || 'GPay/PhonePe',
    showQRCode: paymentData.showQRCode !== undefined ? paymentData.showQRCode : true,
    showUPIId: paymentData.showUPIId !== undefined ? paymentData.showUPIId : true,
    defaultPayment: paymentData.defaultPayment || 'cod',
  });

  // Save to context on every change
  useEffect(() => {
    console.log('Saving Step 4 data:', settings); // Debug log
    setPaymentData(settings);
  }, [settings]);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const paymentMethods = [
    { id: 'cod', label: 'Cash on Delivery (COD)', description: 'Collect cash at the doorstep', key: 'codEnabled' },
    { id: 'upi', label: 'UPI / GPay / PhonePe', description: 'Instant digital transfers', key: 'upiEnabled' },
    { id: 'card', label: 'Credit/Debit Card', description: 'Visa, Master, Rupay', key: 'cardEnabled' },
    { id: 'netbanking', label: 'Net Banking', description: 'Direct bank portal login', key: 'netBankingEnabled' },
  ];

  const enabledMethods = paymentMethods.filter(m => settings[m.key]);

  return (
    <StoreBuilderLayout currentStep={4} totalSteps={7} title="Payment Configuration" subtitle="Step 4 of 7">
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[#006d2f]">payments</span>
          <h2 className="font-label-md text-label-md text-[#556067] uppercase tracking-wider text-xs">Payment Methods</h2>
        </div>
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <Toggle key={method.id} label={method.label} description={method.description} checked={settings[method.key]} onChange={() => handleToggle(method.key)} className="border-b border-[#e0e3e6] pb-3 last:border-0 last:pb-0" />
          ))}
        </div>
      </Card>

      {settings.upiEnabled && (
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[#006d2f]">qr_code_2</span>
            <h2 className="font-label-md text-label-md text-[#556067] uppercase tracking-wider text-xs">UPI Configuration</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-[#3c4a3d] text-xs uppercase tracking-wider">UPI ID</label>
              <Input value={settings.upiId} onChange={(e) => setSettings(prev => ({ ...prev, upiId: e.target.value }))} placeholder="yourname@okhdfcbank" className="bg-surface-container" />
              <p className="text-xs text-[#556067]">Use your real, registered UPI ID (e.g. name@okhdfcbank, @ybl, @paytm) — this is what generates the payment QR code, so a placeholder ID will be rejected as invalid by customers' UPI apps.</p>
            </div>
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-[#3c4a3d] text-xs uppercase tracking-wider">UPI App Name</label>
              <Input value={settings.upiAppName} onChange={(e) => setSettings(prev => ({ ...prev, upiAppName: e.target.value }))} placeholder="GPay/PhonePe" className="bg-surface-container" />
            </div>
          </div>
          <div className="bg-[#d9e4ec]/30 rounded-lg p-4 space-y-3">
            <Toggle label="Show QR Code on Payment Page" checked={settings.showQRCode} onChange={() => handleToggle('showQRCode')} />
            <Toggle label="Show UPI ID on Payment Page" checked={settings.showUPIId} onChange={() => handleToggle('showUPIId')} />
          </div>
        </Card>
      )}

      <Card>
        <div className="space-y-2">
          <label className="font-label-md text-label-md text-[#3c4a3d] text-xs uppercase tracking-wider">Default Payment Method</label>
          <div className="relative">
            <select value={settings.defaultPayment} onChange={(e) => setSettings(prev => ({ ...prev, defaultPayment: e.target.value }))} className="w-full appearance-none bg-surface-container border border-[#bbcbb9] rounded-lg px-4 py-3 font-body-md text-body-md text-[#191c1e] focus:border-[#006d2f] focus:ring-1 focus:ring-[#006d2f] outline-none transition-all cursor-pointer">
              {enabledMethods.map((method) => <option key={method.id} value={method.id}>{method.label}</option>)}
              {enabledMethods.length === 0 && <option value="">No payment methods enabled</option>}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#3c4a3d]">expand_more</span>
          </div>
          <p className="font-caption text-caption text-[#3c4a3d] italic text-xs">This will be pre-selected for your customers during checkout.</p>
        </div>
      </Card>
    </StoreBuilderLayout>
  );
};

export default Step4_PaymentConfig;