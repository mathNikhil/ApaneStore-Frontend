import { showSuccess, showError } from '../../utils/toast';
import cashfreeLogo from '../../assets/images/Cashfee-Logo.png';
import razorpayLogo from '../../assets/images/razorpay.png';
import stripeLogo from '../../assets/images/Stripe-Logo.png';
import React, { useState, useEffect } from 'react';
import { useStoreBuilder } from '../../Context/StoreBuilderContext';
import { useSearchParams } from 'react-router-dom';
import StoreBuilderLayout from './StoreBuilderLayout';
import Card from '../Common/Card';
import Input from '../Common/Input';
import Toggle from '../Common/Toggle';

const Step4_PaymentConfig = () => {
  const { paymentData, setPaymentData, currentStoreId } = useStoreBuilder();
  const [searchParams] = useSearchParams();
  const effectiveStoreId = currentStoreId || searchParams.get('storeId') || new URLSearchParams(window.location.search).get('storeId') || localStorage.getItem('currentStoreId');

  const [settings, setSettings] = useState({
    upiEnabled: paymentData.upiEnabled !== undefined ? paymentData.upiEnabled : true,
    upiId: paymentData.upiId || '',
    upiAppName: paymentData.upiAppName || '',
    showQRCode: paymentData.showQRCode !== undefined ? paymentData.showQRCode : true,
    showUPIId: paymentData.showUPIId !== undefined ? paymentData.showUPIId : true,
    codEnabled: true,
    cardEnabled: false,
    netBankingEnabled: false,
    cashfreeEnabled: paymentData.cashfreeEnabled || false,
    stripeEnabled: false,
    defaultPayment: paymentData.defaultPayment || 'upi',
  });

  const [selectedProvider, setSelectedProvider] = useState('cashfree');
  const [gatewayMode, setGatewayMode] = useState('sandbox');
  const [gatewaySaving, setGatewaySaving] = useState(false);
  const [configuredGateways, setConfiguredGateways] = useState({});
  const [gatewayHints, setGatewayHints] = useState({});
  const [editingGateway, setEditingGateway] = useState(null);

  const [cashfreeAppId, setCashfreeAppId] = useState('');
  const [cashfreeSecretKey, setCashfreeSecretKey] = useState('');
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('');
  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState('');

  useEffect(() => {
    const storeId = effectiveStoreId;
    const token = localStorage.getItem('token');
    if (!storeId || !token) return;
    fetch(
      (import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com') +
        '/api/stores/' + storeId + '/payment-gateways',
      { headers: { Authorization: 'Bearer ' + token } }
    )
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const map = {};
          const hints = {};
          data.data.forEach(g => {
            if (g.has_api_key) {
              map[g.gateway_key] = true;
              hints[g.gateway_key] = { apiKeyHint: g.api_key_hint, secretKeyHint: g.secret_key_hint };
            }
          });
          setConfiguredGateways(map);
          setGatewayHints(hints);
        }
      })
      .catch(() => {});
  }, [effectiveStoreId]);

  const handleSaveGatewayKeys = async () => {
    const storeId = effectiveStoreId;
    const token = localStorage.getItem('token');
    const API = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';

    if (!storeId || storeId === 'null') {
      showError('Store not found. Please save your store first.'); return;
    }
    if (selectedProvider === 'cashfree' && (!cashfreeAppId || !cashfreeSecretKey)) {
      showError('Please enter both App ID and Secret Key'); return;
    }
    if (selectedProvider === 'razorpay' && (!razorpayKeyId || !razorpayKeySecret)) {
      showError('Please enter both Key ID and Key Secret'); return;
    }
    if (selectedProvider === 'stripe' && (!stripePublishableKey || !stripeSecretKey)) {
      showError('Please enter both Publishable Key and Secret Key'); return;
    }

    setGatewaySaving(true);
    try {
      let endpoint = '';
      let body = {};

      if (selectedProvider === 'cashfree') {
        endpoint = `/api/stores/${storeId}/payment-gateway/cashfree/keys`;
        body = { appId: cashfreeAppId, secretKey: cashfreeSecretKey, mode: gatewayMode };
      } else if (selectedProvider === 'razorpay') {
        endpoint = `/api/stores/${storeId}/payment-gateway/razorpay/keys`;
        body = { keyId: razorpayKeyId, keySecret: razorpayKeySecret, mode: gatewayMode };
      } else if (selectedProvider === 'stripe') {
        endpoint = `/api/stores/${storeId}/payment-gateway/stripe/keys`;
        body = { publishableKey: stripePublishableKey, secretKey: stripeSecretKey, webhookSecret: stripeWebhookSecret, mode: gatewayMode };
      }

      const res = await fetch(API + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        const name = selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1);
        showSuccess(`${name} configured successfully!`);
        setConfiguredGateways(prev => ({ ...prev, [selectedProvider]: true }));
        if (selectedProvider === 'cashfree') { setCashfreeAppId(''); setCashfreeSecretKey(''); }
        if (selectedProvider === 'razorpay') { setRazorpayKeyId(''); setRazorpayKeySecret(''); }
        if (selectedProvider === 'stripe') { setStripePublishableKey(''); setStripeSecretKey(''); setStripeWebhookSecret(''); }
      } else {
        showError(data.error || 'Failed to save keys');
      }
    } catch (e) {
      showError('Failed to save. Please try again.');
    } finally {
      setGatewaySaving(false);
    }
  };

  useEffect(() => {
    setPaymentData(settings);
  }, [settings]);

  const handleGatewaySelect = (selectedKey) => {
    setSettings(prev => ({
      ...prev,
      upiEnabled: selectedKey === 'upiEnabled',
      cashfreeEnabled: selectedKey === 'cashfreeEnabled',
      stripeEnabled: selectedKey === 'stripeEnabled',
      defaultPayment:
        selectedKey === 'upiEnabled' ? 'upi'
        : selectedKey === 'cashfreeEnabled' ? 'cashfree'
        : 'cod',
    }));
  };

  const handleToggle = (key) => {
    if (['upiEnabled', 'cashfreeEnabled', 'stripeEnabled'].includes(key)) {
      handleGatewaySelect(key);
    } else {
      setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const activePaymentMethods = [
    { id: 'cod', label: 'Cash on Delivery (COD)', description: 'Collect cash at the doorstep • No transaction fees • Always enabled', key: 'codEnabled', icon: 'payments', badge: 'Always ON', badgeColor: 'bg-green-100 text-green-800', active: true, alwaysOn: true, phase: 'Phase 1' },
    { id: 'upi', label: 'UPI QR Code (No Gateway)', description: '0% fee • No KYC • Customers scan QR code and pay directly • Manual verification required', key: 'upiEnabled', icon: 'qr_code_2', badge: 'Active', badgeColor: 'bg-green-100 text-green-800', active: true, phase: 'Phase 1' },
  ];

  const comingSoonPaymentMethods = [
    { id: 'cashfree', label: 'Payment Gateway', description: 'UPI • Credit/Debit Cards • NetBanking • Digital Wallets • International Payments', key: 'cashfreeEnabled', icon: 'payments', badge: (configuredGateways.cashfree || configuredGateways.razorpay || configuredGateways.stripe) ? 'Configured' : 'Setup Required', badgeColor: (configuredGateways.cashfree || configuredGateways.razorpay || configuredGateways.stripe) ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-600', active: true, phase: 'Phase 2', provider: 'Gateway' },
  ];

  const allPaymentMethods = [...activePaymentMethods, ...comingSoonPaymentMethods];
  const enabledMethods = allPaymentMethods.filter(m => settings[m.key]);
  const providerName = (key) => key.charAt(0).toUpperCase() + key.slice(1);
  const webhookUrl = `https://api.aapnaestore.com/api/webhooks/${selectedProvider}/payment/${effectiveStoreId || '[storeId]'}`;

  return (
    <StoreBuilderLayout currentStep={4} totalSteps={8} title="Payment Configuration" subtitle="Step 4 of 8">

      <Card className="mb-6 border-2 border-yellow-300 bg-yellow-50">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-yellow-600 text-2xl">gavel</span>
          <div>
            <h3 className="font-semibold text-yellow-800">🔒 Legal Disclaimer</h3>
            <p className="text-sm text-yellow-700 mt-1">Aapna eStore is a <strong>software platform</strong> that provides technology for you to build and manage your online store. We do <strong>not</strong> handle, store, or process any payments.</p>
            <p className="text-sm text-yellow-700 mt-1">All payments go directly from your customers to you. Aapna eStore does <strong>not</strong> charge any transaction fees.</p>
            <div className="mt-2 p-2 bg-yellow-100 rounded-lg">
              <p className="text-xs text-yellow-800"><span className="font-semibold">💡 Your Money, Your Control:</span> As a software provider, we never touch your money.</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[#006d2f]">payments</span>
          <h2 className="font-label-md text-label-md text-[#556067] uppercase tracking-wider text-xs">Payment Methods</h2>
        </div>
        <div className="space-y-3">
          {allPaymentMethods.map((method) => (
            <div key={method.id} className={`border rounded-lg p-4 ${method.active ? 'border-[#25D366] bg-white' : 'border-[#e0e3e6] bg-gray-50 opacity-75'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {method.id === 'cashfree' ? (
                    <img src={cashfreeLogo} alt="Gateway" className="w-6 h-6 object-contain" />
                  ) : (
                    <span className={`material-symbols-outlined text-2xl ${method.active ? 'text-[#006d2f]' : 'text-gray-400'}`}>{method.icon}</span>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${method.active ? 'text-[#191c1e]' : 'text-gray-500'}`}>{method.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${method.badgeColor}`}>{method.badge}</span>
                      {method.phase && <span className={`text-xs px-2 py-0.5 rounded-full ${method.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>{method.phase}</span>}
                    </div>
                    <p className={`text-sm ${method.active ? 'text-[#556067]' : 'text-gray-400'}`}>{method.description}</p>
                  </div>
                </div>
                <Toggle checked={settings[method.key]} onChange={() => handleToggle(method.key)} disabled={!method.active} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {settings.upiEnabled && (
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[#006d2f]">qr_code_2</span>
            <h2 className="font-label-md text-label-md text-[#556067] uppercase tracking-wider text-xs">UPI Configuration</h2>
          </div>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700"><span className="font-semibold">📌 No KYC Required</span><br />Just enter your registered UPI ID. Your customers will scan the QR code and pay directly to your bank account.</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-[#3c4a3d] text-xs uppercase tracking-wider">Your UPI ID <span className="text-red-500">*</span></label>
              <Input value={settings.upiId} onChange={(e) => setSettings(prev => ({ ...prev, upiId: e.target.value }))} placeholder="yourname@okhdfcbank" className="bg-surface-container" />
            </div>
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-[#3c4a3d] text-xs uppercase tracking-wider">UPI App Name</label>
              <Input value={settings.upiAppName} onChange={(e) => setSettings(prev => ({ ...prev, upiAppName: e.target.value }))} placeholder="GPay/PhonePe" className="bg-surface-container" />
            </div>
          </div>
          <div className="bg-[#d9e4ec]/30 rounded-lg p-4 mt-4 space-y-3">
            <Toggle label="Show QR Code on Payment Page" description="Customers can scan the QR code using any UPI app" checked={settings.showQRCode} onChange={() => handleToggle('showQRCode')} />
            <Toggle label="Show UPI ID on Payment Page" description="Display UPI ID text for manual payment" checked={settings.showUPIId} onChange={() => handleToggle('showUPIId')} />
          </div>
        </Card>
      )}

      {settings.cashfreeEnabled && (
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-[#006d2f]">payment</span>
            <h3 className="font-semibold text-[#191c1e] uppercase tracking-wider text-xs">PAYMENT GATEWAY CONFIGURATION</h3>
            {configuredGateways[selectedProvider] && (
              <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-semibold">✓ Configured</span>
            )}
          </div>

          <div className="mb-5">
            <p className="text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider mb-3">Payment Provider</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'cashfree', label: 'Cashfree', logo: cashfreeLogo },
                { key: 'razorpay', label: 'Razorpay', logo: razorpayLogo },
                { key: 'stripe',   label: 'Stripe',   logo: stripeLogo   },
              ].map(provider => (
                <button
                  key={provider.key}
                  onClick={() => setSelectedProvider(provider.key)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${selectedProvider === provider.key ? 'border-[#006d2f] bg-[#006d2f]/5' : 'border-[#e0e3e6] bg-white hover:border-[#bbcbb9]'}`}
                >
                  <img src={provider.logo} alt={provider.label} className="h-7 w-auto object-contain" />
                  <span className={`text-sm font-semibold ${selectedProvider === provider.key ? 'text-[#006d2f]' : 'text-[#556067]'}`}>{provider.label}</span>
                  {configuredGateways[provider.key] && <span className="text-xs text-green-600 font-medium">✓ Active</span>}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#556067] mt-2">Switching provider only requires updating credentials below</p>
          </div>

          <div className="mb-5">
            <p className="text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider mb-3">Environment</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setGatewayMode('sandbox')} className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all ${gatewayMode === 'sandbox' ? 'border-[#25D366] bg-[#25D366]/10 text-[#006d2f]' : 'border-[#e0e3e6] text-[#556067] hover:border-[#bbcbb9]'}`}>🧪 Sandbox</button>
              <button onClick={() => setGatewayMode('production')} className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all ${gatewayMode === 'production' ? 'border-[#006d2f] bg-[#006d2f]/10 text-[#006d2f]' : 'border-[#e0e3e6] text-[#556067] hover:border-[#bbcbb9]'}`}>🚀 Production</button>
            </div>
          </div>

          {selectedProvider === 'cashfree' && (
            <div className="space-y-4 mb-5">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800"><strong>Setup Required:</strong> Get your App ID and Secret Key from your <a href="https://merchant.cashfree.com" target="_blank" rel="noopener noreferrer" className="underline">Cashfree dashboard →</a></p>
              </div>
              {configuredGateways.cashfree && editingGateway !== 'cashfree' ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600 text-base">lock</span>
                    <span className="text-sm font-semibold text-green-800">Credentials Saved</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#556067]">App ID</span>
                      <span className="text-sm font-mono text-[#191c1e]">{gatewayHints.cashfree?.apiKeyHint}{'•'.repeat(24)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#556067]">Secret Key</span>
                      <span className="text-sm font-mono text-[#191c1e]">{gatewayHints.cashfree?.secretKeyHint}{'•'.repeat(24)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setEditingGateway('cashfree'); setCashfreeAppId(''); setCashfreeSecretKey(''); }}
                    className="w-full py-2 border-2 border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 transition-all"
                  >
                    🗑️ Delete & Enter New Credentials
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider">App ID *</label>
                    <input type="text" value={cashfreeAppId} onChange={e => setCashfreeAppId(e.target.value)} placeholder="Enter your Cashfree App ID" className="w-full mt-1 px-4 py-3 border border-[#bbcbb9] rounded-lg text-sm focus:outline-none focus:border-[#006d2f]" autoComplete="off" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider">Secret Key *</label>
                    <input type="password" value={cashfreeSecretKey} onChange={e => setCashfreeSecretKey(e.target.value)} placeholder="Enter your Cashfree Secret Key" className="w-full mt-1 px-4 py-3 border border-[#bbcbb9] rounded-lg text-sm focus:outline-none focus:border-[#006d2f]" autoComplete="off" />
                  </div>
                  {editingGateway === 'cashfree' && (
                    <button onClick={() => setEditingGateway(null)} className="text-xs text-[#556067] underline">Cancel — keep existing credentials</button>
                  )}
                </>
              )}
            </div>
          )}

          {selectedProvider === 'razorpay' && (
            <div className="space-y-4 mb-5">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800"><strong>Setup Required:</strong> Get your Key ID and Secret from your <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" className="underline">Razorpay dashboard →</a></p>
              </div>
              {configuredGateways.razorpay && editingGateway !== 'razorpay' ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600 text-base">lock</span>
                    <span className="text-sm font-semibold text-green-800">Credentials Saved</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#556067]">Key ID</span>
                      <span className="text-sm font-mono text-[#191c1e]">{gatewayHints.razorpay?.apiKeyHint}{'•'.repeat(24)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#556067]">Key Secret</span>
                      <span className="text-sm font-mono text-[#191c1e]">{gatewayHints.razorpay?.secretKeyHint}{'•'.repeat(24)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setEditingGateway('razorpay'); setRazorpayKeyId(''); setRazorpayKeySecret(''); }}
                    className="w-full py-2 border-2 border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 transition-all"
                  >
                    🗑️ Delete & Enter New Credentials
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider">Key ID *</label>
                    <input type="text" value={razorpayKeyId} onChange={e => setRazorpayKeyId(e.target.value)} placeholder="rzp_test_XXXXXXXXXX or rzp_live_XXXXXXXXXX" className="w-full mt-1 px-4 py-3 border border-[#bbcbb9] rounded-lg text-sm focus:outline-none focus:border-[#006d2f]" autoComplete="off" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider">Key Secret *</label>
                    <input type="password" value={razorpayKeySecret} onChange={e => setRazorpayKeySecret(e.target.value)} placeholder="Enter your Razorpay Key Secret" className="w-full mt-1 px-4 py-3 border border-[#bbcbb9] rounded-lg text-sm focus:outline-none focus:border-[#006d2f]" autoComplete="off" />
                  </div>
                  {editingGateway === 'razorpay' && (
                    <button onClick={() => setEditingGateway(null)} className="text-xs text-[#556067] underline">Cancel — keep existing credentials</button>
                  )}
                </>
              )}
            </div>
          )}

          {selectedProvider === 'stripe' && (
            <div className="space-y-4 mb-5">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800"><strong>Setup Required:</strong> Get your keys from your <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="underline">Stripe dashboard →</a></p>
              </div>
              {configuredGateways.stripe && editingGateway !== 'stripe' ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600 text-base">lock</span>
                    <span className="text-sm font-semibold text-green-800">Credentials Saved</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#556067]">Publishable Key</span>
                      <span className="text-sm font-mono text-[#191c1e]">{gatewayHints.stripe?.apiKeyHint}{'•'.repeat(24)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#556067]">Secret Key</span>
                      <span className="text-sm font-mono text-[#191c1e]">{gatewayHints.stripe?.secretKeyHint}{'•'.repeat(24)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setEditingGateway('stripe'); setStripePublishableKey(''); setStripeSecretKey(''); setStripeWebhookSecret(''); }}
                    className="w-full py-2 border-2 border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 transition-all"
                  >
                    🗑️ Delete & Enter New Credentials
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider">Publishable Key *</label>
                    <input type="text" value={stripePublishableKey} onChange={e => setStripePublishableKey(e.target.value)} placeholder="pk_test_XXXXXXXXXX or pk_live_XXXXXXXXXX" className="w-full mt-1 px-4 py-3 border border-[#bbcbb9] rounded-lg text-sm focus:outline-none focus:border-[#006d2f]" autoComplete="off" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider">Secret Key *</label>
                    <input type="password" value={stripeSecretKey} onChange={e => setStripeSecretKey(e.target.value)} placeholder="sk_test_XXXXXXXXXX or sk_live_XXXXXXXXXX" className="w-full mt-1 px-4 py-3 border border-[#bbcbb9] rounded-lg text-sm focus:outline-none focus:border-[#006d2f]" autoComplete="off" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider">Webhook Signing Secret</label>
                    <input type="password" value={stripeWebhookSecret} onChange={e => setStripeWebhookSecret(e.target.value)} placeholder="whsec_XXXXXXXXXX (optional but recommended)" className="w-full mt-1 px-4 py-3 border border-[#bbcbb9] rounded-lg text-sm focus:outline-none focus:border-[#006d2f]" autoComplete="off" />
                  </div>
                  {editingGateway === 'stripe' && (
                    <button onClick={() => setEditingGateway(null)} className="text-xs text-[#556067] underline">Cancel — keep existing credentials</button>
                  )}
                </>
              )}
            </div>
          )}

          <div className="mb-5">
            <label className="text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider">Webhook URL</label>
            <div className="flex gap-2 mt-1">
              <input type="text" readOnly value={webhookUrl} className="w-full px-4 py-3 border border-[#e0e3e6] rounded-lg text-sm bg-gray-50 text-[#556067] cursor-text" />
              <button onClick={() => { navigator.clipboard.writeText(webhookUrl); showSuccess('Webhook URL copied!'); }} className="px-3 py-2 border border-[#e0e3e6] rounded-lg text-[#556067] hover:bg-gray-100 transition-all flex-shrink-0" title="Copy">
                <span className="material-symbols-outlined text-sm">content_copy</span>
              </button>
            </div>
            <p className="text-xs text-[#556067] mt-1">Add this URL in your {providerName(selectedProvider)} dashboard under Webhooks</p>
          </div>

          <button onClick={handleSaveGatewayKeys} disabled={gatewaySaving} className="w-full py-3 bg-[#006d2f] text-white font-semibold rounded-xl hover:brightness-110 transition-all disabled:opacity-50">
            {gatewaySaving ? 'Saving...' : configuredGateways[selectedProvider] ? `Update ${providerName(selectedProvider)} Keys` : `Save & Activate ${providerName(selectedProvider)}`}
          </button>
        </Card>
      )}

      {settings.upiEnabled && (
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[#006d2f]">help</span>
            <h2 className="font-label-md text-label-md text-[#556067] uppercase tracking-wider text-xs">How It Works</h2>
          </div>
          <div className="space-y-3">
            {[
              { step: 1, title: 'Enter your UPI ID', desc: 'Add your registered UPI ID (e.g., name@okhdfcbank)' },
              { step: 2, title: 'QR Code Generated', desc: 'We generate a unique QR code linked to your UPI ID' },
              { step: 3, title: 'Customer Pays', desc: 'Customer scans the QR code and pays directly to your bank account' },
              { step: 4, title: 'Manual Verification', desc: 'You manually verify the payment in your store dashboard' },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#25D366]/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#006d2f]">{item.step}</div>
                <div>
                  <p className="font-medium text-sm text-[#191c1e]">{item.title}</p>
                  <p className="text-sm text-[#556067]">{item.desc}</p>
                </div>
              </div>
            ))}
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

      <div className="mt-6 p-4 border-t border-[#e0e3e6]">
        <p className="text-xs text-center text-[#556067]">🔒 <strong>Aapna eStore is a software provider only.</strong> We do not handle any money. All payments are processed directly between you and your customers via your chosen payment method.</p>
      </div>

    </StoreBuilderLayout>
  );
};

export default Step4_PaymentConfig;
