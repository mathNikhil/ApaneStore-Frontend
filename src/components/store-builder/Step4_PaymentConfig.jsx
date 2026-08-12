import React, { useState, useEffect } from 'react';
import { useStoreBuilder } from '../../Context/StoreBuilderContext';
import StoreBuilderLayout from './StoreBuilderLayout';
import Card from '../Common/Card';
import Input from '../Common/Input';
import Toggle from '../Common/Toggle';

const Step4_PaymentConfig = () => {
  const { paymentData, setPaymentData } = useStoreBuilder();

  // ============================================
  // PHASE 1: UPI QR CODE + COD ACTIVE
  // Third-party gateways (Cashfree/Stripe) will be added in Phase 2
  // ============================================

  const [settings, setSettings] = useState({
    // Phase 1: UPI QR Code (No Gateway) - ACTIVE
    upiEnabled: paymentData.upiEnabled !== undefined ? paymentData.upiEnabled : true,
    upiId: paymentData.upiId || '',
    upiAppName: paymentData.upiAppName || 'GPay/PhonePe',
    showQRCode: paymentData.showQRCode !== undefined ? paymentData.showQRCode : true,
    showUPIId: paymentData.showUPIId !== undefined ? paymentData.showUPIId : true,
    
    // Phase 1: COD - ACTIVE
    codEnabled: paymentData.codEnabled !== undefined ? paymentData.codEnabled : true,
    
    // Phase 2: Coming soon (disabled)
    cardEnabled: false,
    netBankingEnabled: false,
    cashfreeEnabled: false,
    stripeEnabled: false,
    defaultPayment: paymentData.defaultPayment || 'upi',
  });

  // Save to context on every change
  useEffect(() => {
    console.log('Saving Step 4 data (Phase 1 - UPI QR + COD):', settings);
    setPaymentData(settings);
  }, [settings]);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ============================================
  // PAYMENT METHODS CONFIGURATION
  // ============================================
  
  // Phase 1: UPI and COD are active
  const activePaymentMethods = [
    { 
      id: 'upi', 
      label: 'UPI QR Code (No Gateway)', 
      description: '0% fee • No KYC • Customers scan QR code and pay directly • Manual verification required', 
      key: 'upiEnabled',
      icon: 'qr_code_2',
      badge: 'Active',
      badgeColor: 'bg-green-100 text-green-800',
      active: true,
      phase: 'Phase 1',
    },
    { 
      id: 'cod', 
      label: 'Cash on Delivery (COD)', 
      description: 'Collect cash at the doorstep • No transaction fees', 
      key: 'codEnabled',
      icon: 'payments',
      badge: 'Active',
      badgeColor: 'bg-green-100 text-green-800',
      active: true,
      phase: 'Phase 1',
    },
  ];

  // Phase 2: Coming soon (shown as disabled preview)
  const comingSoonPaymentMethods = [
    { 
      id: 'cashfree', 
      label: 'Cashfree (Indian Tenants)', 
      description: 'UPI • Credit/Debit Cards • NetBanking • Digital Wallets (1.6-2.99% fee)', 
      key: 'cashfreeEnabled',
      icon: 'payments',
      badge: 'Coming Soon',
      badgeColor: 'bg-blue-100 text-blue-600',
      active: false,
      phase: 'Phase 2',
      provider: 'Cashfree',
    },
    { 
      id: 'stripe', 
      label: 'Stripe Connect (International Tenants)', 
      description: 'Credit/Debit Cards • Digital Wallets • Local Payment Methods (2.9% + $0.30 fee)', 
      key: 'stripeEnabled',
      icon: 'credit_card',
      badge: 'Coming Soon',
      badgeColor: 'bg-purple-100 text-purple-600',
      active: false,
      phase: 'Phase 2',
      provider: 'Stripe',
    },
    { 
      id: 'card', 
      label: 'Credit / Debit Card', 
      description: 'Visa, Mastercard, RuPay', 
      key: 'cardEnabled',
      icon: 'credit_card',
      badge: 'Coming Soon',
      badgeColor: 'bg-gray-100 text-gray-500',
      active: false,
      phase: 'Phase 2',
    },
    { 
      id: 'netbanking', 
      label: 'Net Banking', 
      description: 'Direct bank portal login', 
      key: 'netBankingEnabled',
      icon: 'account_balance',
      badge: 'Coming Soon',
      badgeColor: 'bg-gray-100 text-gray-500',
      active: false,
      phase: 'Phase 2',
    },
  ];

  const allPaymentMethods = [...activePaymentMethods, ...comingSoonPaymentMethods];
  const enabledMethods = allPaymentMethods.filter(m => settings[m.key]);

  return (
    <StoreBuilderLayout currentStep={4} totalSteps={8} title="Payment Configuration" subtitle="Step 4 of 8">
      
      {/* ============================================ */}
      {/* 🔒 LEGAL DISCLAIMER - TOP SECTION */}
      {/* ============================================ */}
      <Card className="mb-6 border-2 border-yellow-300 bg-yellow-50">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-yellow-600 text-2xl">gavel</span>
          <div>
            <h3 className="font-semibold text-yellow-800">🔒 Legal Disclaimer</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Aapna eStore is a <strong>software platform</strong> that provides technology for you to build and manage your online store. 
              We do <strong>not</strong> handle, store, or process any payments.
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              All payments go directly from your customers to you. 
              Aapna eStore does <strong>not</strong> charge any transaction fees.
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              For any payment-related issues, disputes, or chargebacks, please contact your bank or payment provider directly.
            </p>
            <div className="mt-2 p-2 bg-yellow-100 rounded-lg">
              <p className="text-xs text-yellow-800">
                <span className="font-semibold">💡 Your Money, Your Control:</span> 
                As a software provider, we never touch your money. 
                You are in complete control of your payments and customer relationships.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ============================================ */}
      {/* PAYMENT METHODS SECTION */}
      {/* ============================================ */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[#006d2f]">payments</span>
          <h2 className="font-label-md text-label-md text-[#556067] uppercase tracking-wider text-xs">Payment Methods</h2>
        </div>

        <div className="space-y-3">
          {allPaymentMethods.map((method) => (
            <div 
              key={method.id} 
              className={`border rounded-lg p-4 ${method.active ? 'border-[#25D366] bg-white' : 'border-[#e0e3e6] bg-gray-50 opacity-75'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-2xl ${method.active ? 'text-[#006d2f]' : 'text-gray-400'}`}>
                    {method.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${method.active ? 'text-[#191c1e]' : 'text-gray-500'}`}>
                        {method.label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${method.badgeColor}`}>
                        {method.badge}
                      </span>
                      {method.phase && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${method.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {method.phase}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${method.active ? 'text-[#556067]' : 'text-gray-400'}`}>
                      {method.description}
                    </p>
                    {!method.active && method.provider && (
                      <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">construction</span>
                        {method.provider} integration — coming in Phase 2
                      </p>
                    )}
                    {!method.active && !method.provider && (
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">construction</span>
                        Available in Phase 2
                      </p>
                    )}
                  </div>
                </div>
                <Toggle 
                  checked={settings[method.key]} 
                  onChange={() => handleToggle(method.key)} 
                  disabled={!method.active}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ============================================ */}
      {/* UPI CONFIGURATION */}
      {/* ============================================ */}
      {settings.upiEnabled && (
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[#006d2f]">qr_code_2</span>
            <h2 className="font-label-md text-label-md text-[#556067] uppercase tracking-wider text-xs">UPI Configuration</h2>
          </div>
          
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">📌 No KYC Required</span><br />
              Just enter your registered UPI ID. Your customers will scan the QR code 
              and pay directly to your bank account. <strong>No transaction fees, no waiting period.</strong>
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-[#3c4a3d] text-xs uppercase tracking-wider">
                Your UPI ID <span className="text-red-500">*</span>
              </label>
              <Input 
                value={settings.upiId} 
                onChange={(e) => setSettings(prev => ({ ...prev, upiId: e.target.value }))} 
                placeholder="yourname@okhdfcbank" 
                className="bg-surface-container" 
              />
              <p className="text-xs text-[#556067]">
                Enter your real, registered UPI ID (e.g., name@okhdfcbank, @ybl, @paytm). 
                This is what generates the payment QR code. <strong>Your customers will pay to this UPI ID directly.</strong>
              </p>
            </div>

            <div className="space-y-1">
              <label className="font-label-md text-label-md text-[#3c4a3d] text-xs uppercase tracking-wider">
                UPI App Name
              </label>
              <Input 
                value={settings.upiAppName} 
                onChange={(e) => setSettings(prev => ({ ...prev, upiAppName: e.target.value }))} 
                placeholder="GPay/PhonePe" 
                className="bg-surface-container" 
              />
              <p className="text-xs text-[#556067]">
                This helps your customers know which UPI app to use.
              </p>
            </div>
          </div>

          <div className="bg-[#d9e4ec]/30 rounded-lg p-4 mt-4 space-y-3">
            <Toggle 
              label="Show QR Code on Payment Page" 
              description="Customers can scan the QR code using any UPI app" 
              checked={settings.showQRCode} 
              onChange={() => handleToggle('showQRCode')} 
            />
            <Toggle 
              label="Show UPI ID on Payment Page" 
              description="Display UPI ID text for manual payment" 
              checked={settings.showUPIId} 
              onChange={() => handleToggle('showUPIId')} 
            />
          </div>
        </Card>
      )}

      {/* ============================================ */}
      {/* HOW IT WORKS */}
      {/* ============================================ */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[#006d2f]">help</span>
          <h2 className="font-label-md text-label-md text-[#556067] uppercase tracking-wider text-xs">How It Works</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#25D366]/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#006d2f]">1</div>
            <div>
              <p className="font-medium text-sm text-[#191c1e]">Enter your UPI ID</p>
              <p className="text-sm text-[#556067]">Add your registered UPI ID (e.g., name@okhdfcbank)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#25D366]/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#006d2f]">2</div>
            <div>
              <p className="font-medium text-sm text-[#191c1e]">QR Code Generated</p>
              <p className="text-sm text-[#556067]">We generate a unique QR code linked to your UPI ID</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#25D366]/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#006d2f]">3</div>
            <div>
              <p className="font-medium text-sm text-[#191c1e]">Customer Pays</p>
              <p className="text-sm text-[#556067]">Customer scans the QR code and pays directly to your bank account</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#25D366]/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#006d2f]">4</div>
            <div>
              <p className="font-medium text-sm text-[#191c1e]">Manual Verification</p>
              <p className="text-sm text-[#556067]">You manually verify the payment in your store dashboard</p>
            </div>
          </div>
        </div>
      </Card>

      {/* ============================================ */}
      {/* PHASE 2 ROADMAP */}
      {/* ============================================ */}
      <Card className="mb-6 border border-dashed border-[#bbcbb9] bg-[#f2f4f7]">
        <div className="text-center py-4">
          <span className="material-symbols-outlined text-[#556067] text-3xl mb-2 block">construction</span>
          <h4 className="font-semibold text-[#556067]">🚀 Phase 2 Roadmap</h4>
          <p className="text-sm text-[#556067] max-w-md mx-auto">
            We are actively working on integrating more payment options:
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-3">
            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
              <span className="material-symbols-outlined text-blue-500 text-sm">payments</span>
              <span className="text-sm font-medium text-gray-700">Cashfree</span>
              <span className="text-xs text-gray-400">(Indian tenants)</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
              <span className="material-symbols-outlined text-purple-500 text-sm">credit_card</span>
              <span className="text-sm font-medium text-gray-700">Stripe Connect</span>
              <span className="text-xs text-gray-400">(International tenants)</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
              <span className="material-symbols-outlined text-gray-500 text-sm">payments</span>
              <span className="text-sm font-medium text-gray-700">Cards</span>
              <span className="text-xs text-gray-400">+ NetBanking</span>
            </div>
          </div>
        </div>
      </Card>

      {/* ============================================ */}
      {/* DEFAULT PAYMENT */}
      {/* ============================================ */}
      <Card>
        <div className="space-y-2">
          <label className="font-label-md text-label-md text-[#3c4a3d] text-xs uppercase tracking-wider">Default Payment Method</label>
          <div className="relative">
            <select 
              value={settings.defaultPayment} 
              onChange={(e) => setSettings(prev => ({ ...prev, defaultPayment: e.target.value }))} 
              className="w-full appearance-none bg-surface-container border border-[#bbcbb9] rounded-lg px-4 py-3 font-body-md text-body-md text-[#191c1e] focus:border-[#006d2f] focus:ring-1 focus:ring-[#006d2f] outline-none transition-all cursor-pointer"
            >
              {enabledMethods.map((method) => <option key={method.id} value={method.id}>{method.label}</option>)}
              {enabledMethods.length === 0 && <option value="">No payment methods enabled</option>}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#3c4a3d]">expand_more</span>
          </div>
          <p className="font-caption text-caption text-[#3c4a3d] italic text-xs">This will be pre-selected for your customers during checkout.</p>
        </div>
      </Card>

      {/* ============================================ */}
      {/* 🔒 FINAL LEGAL DISCLAIMER - BOTTOM SECTION */}
      {/* ============================================ */}
      <div className="mt-6 p-4 border-t border-[#e0e3e6]">
        <p className="text-xs text-center text-[#556067]">
          🔒 <strong>Aapna eStore is a software provider only.</strong> We do not handle any money. 
          All payments are processed directly between you and your customers via your chosen payment method. 
          Aapna eStore does not charge any transaction fees.
        </p>
        <p className="text-xs text-center text-[#556067] mt-1">
          For payment disputes or chargebacks, please contact your bank or payment provider directly.
        </p>
      </div>
    </StoreBuilderLayout>
  );
};

export default Step4_PaymentConfig;