import { useState, useEffect } from 'react';
import TopAppBar from '../../Common/TopAppBar';
import BottomNav from '../../Common/BottomNav';
import MarketDashboard from './MarketDashboard';
import MarketMessenger from './MarketMessenger';
import MarketSetup     from './MarketSetup';
import MarketPaywall   from './MarketPaywall';
import useMarketStore  from './useMarketStore';

export default function Market() {
  const [activeTab, setActiveTab] = useState('messenger');
  const [showInvoicePopup, setShowInvoicePopup] = useState(false);
  const [invoiceFields, setInvoiceFields] = useState({ business_name: '', gstin: '', state: '', address: '' });
  const [invoiceSaving, setInvoiceSaving] = useState(false);
  const [invoiceSaved, setInvoiceSaved] = useState(false);
  const { subscription, config, storeId, loading, refetch } = useMarketStore();

  // Check payment status on return from Cashfree
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order_id');
    if (!orderId) return;
    // Poll until storeId is available
    const interval = setInterval(() => {
      if (!storeId) return;
      clearInterval(interval);
      const token = localStorage.getItem('token');
      const base = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';
      fetch(`${base}/api/tenants/${storeId}/market/subscription/status?order_id=${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json()).then(async d => {
        window.history.replaceState({}, '', '/market');
        if (d.status === 'paid') {
          refetch();
          const token2 = localStorage.getItem('token');
          try {
            const tr = await fetch(`${base}/api/tenants/me/invoice-details`, { headers: { Authorization: `Bearer ${token2}` } }).then(r => r.json());
            if (tr?.success && tr.data) {
              setInvoiceFields({ business_name: tr.data.business_name || tr.data.company_name || '', gstin: tr.data.gstin || '', state: tr.data.state || '', address: tr.data.address || '' });
            }
          } catch(e) {}
          setShowInvoicePopup(true);
        }
      }).catch(() => {
        window.history.replaceState({}, '', '/market');
      });
    }, 300);
    return () => clearInterval(interval);
  }, [storeId]);

  // Test tenants — bypass payment
  const TEST_PHONES = ['5555555555', '6666666666', '7777777777'];
  const [isSubscribed, setIsSubscribed] = useState(false);
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const isTest = TEST_PHONES.includes(user.phone || user.mobile || '');
      setIsSubscribed(isTest || subscription?.is_active === true);
    } catch { setIsSubscribed(subscription?.is_active === true); }
  }, [subscription]);

  const handleSaveInvoiceDetails = async () => {
    setInvoiceSaving(true);
    try {
      const token = localStorage.getItem('token');
      const base = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';
      await fetch(`${base}/api/tenants/me/invoice-details`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceFields)
      });
      setInvoiceSaved(true);
      setTimeout(() => { setShowInvoicePopup(false); setInvoiceSaved(false); }, 1200);
    } catch(e) { alert('Save failed'); }
    setInvoiceSaving(false);
  };

  const isActive = true; // TODO: restore → subscription?.is_active

  const tabs = [
    { key: 'messenger', label: 'Messenger', icon: 'campaign' },
    { key: 'setup',     label: 'Setup',     icon: 'settings' },
  ];

  return (
    <div className="min-h-screen bg-[#f7f9fc] flex flex-col">
      {/* Top app bar — same as Dashboard and Profile */}
      <TopAppBar title="" />

      {/* Market sub-header */}
      <div className="bg-white border-b border-[#bbcbb9] px-4 pt-3 pb-0 sticky top-[57px] z-40">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-[#25D366]">chat</span>
          <span className="font-semibold text-[#1a1a2e] text-base">WhatsApp Market</span>
          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full ml-1">
            {isActive ? 'Active' : 'Premium'}
          </span>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-0 -mb-px">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-colors whitespace-nowrap
                ${activeTab === t.key
                  ? 'border-[#25D366] text-[#006d2f] font-semibold'
                  : 'border-transparent text-[#556067] hover:text-[#1a1a2e]'}`}
            >
              <span className="material-symbols-outlined text-base">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 pb-24">
        {loading || !storeId ? (
          <div className="text-center py-16 text-gray-400">
            <span className="material-symbols-outlined text-4xl block mb-2">hourglass_empty</span>
            {!storeId && !loading ? 'No store found. Please create a store first.' : 'Loading...'}
          </div>
        ) : (
          <>
            {activeTab === 'messenger' && (
              <MarketMessenger
                storeId={storeId}
                subscription={subscription}
                config={config}
                isSubscribed={isSubscribed}
                onGoSetup={() => setActiveTab('setup')}
              />
            )}
            {activeTab === 'setup' && (
              <MarketSetup
                storeId={storeId}
                subscription={subscription}
                config={config}
                isSubscribed={isSubscribed}
                onRefresh={refetch}
              />
            )}
          </>
        )}
      </div>

      {/* Bottom nav — same as Dashboard and Profile */}
      <BottomNav />
    {showInvoicePopup && (
      <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
        <div style={{ background:'#fff', borderRadius:20, padding:28, width:'100%', maxWidth:440, boxShadow:'0 8px 32px rgba(0,0,0,0.2)' }}>
          <div style={{ textAlign:'center', marginBottom:20 }}>
            <div style={{ fontSize:36, marginBottom:8 }}>🎉</div>
            <h2 style={{ fontSize:20, fontWeight:800, color:'#191c1e', marginBottom:4 }}>Invoice Details</h2>
            <p style={{ fontSize:13, color:'#556067' }}>Enter your invoice details for GST compliance. These will be used for all your AapnaEstore invoices.</p>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:12, fontWeight:700, color:'#556067', textTransform:'uppercase', display:'block', marginBottom:4 }}>Business Name *</label>
            <input value={invoiceFields.business_name} onChange={e => setInvoiceFields(p => ({...p, business_name: e.target.value}))} placeholder="Registered business name" style={{ width:'100%', padding:'10px 14px', border:'1px solid #e0e3e6', borderRadius:8, fontSize:14, boxSizing:'border-box' }} />
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:12, fontWeight:700, color:'#556067', textTransform:'uppercase', display:'block', marginBottom:4 }}>GSTIN (optional)</label>
            <input value={invoiceFields.gstin} onChange={e => setInvoiceFields(p => ({...p, gstin: e.target.value.toUpperCase()}))} placeholder="e.g. 22AAAAA0000A1Z5" maxLength={15} style={{ width:'100%', padding:'10px 14px', border:'1px solid #e0e3e6', borderRadius:8, fontSize:14, boxSizing:'border-box' }} />
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:12, fontWeight:700, color:'#556067', textTransform:'uppercase', display:'block', marginBottom:4 }}>State *</label>
            <select value={invoiceFields.state} onChange={e => setInvoiceFields(p => ({...p, state: e.target.value}))} style={{ width:'100%', padding:'10px 14px', border:'1px solid #e0e3e6', borderRadius:8, fontSize:14, boxSizing:'border-box' }}>
              <option value="">Select State</option>
              <option value="Delhi">Delhi</option><option value="Maharashtra">Maharashtra</option>
              <option value="Karnataka">Karnataka</option><option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Gujarat">Gujarat</option><option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Rajasthan">Rajasthan</option><option value="West Bengal">West Bengal</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option><option value="Telangana">Telangana</option>
              <option value="Kerala">Kerala</option><option value="Punjab">Punjab</option>
              <option value="Haryana">Haryana</option><option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Bihar">Bihar</option><option value="Odisha">Odisha</option>
              <option value="Assam">Assam</option><option value="Jharkhand">Jharkhand</option>
              <option value="Chhattisgarh">Chhattisgarh</option><option value="Goa">Goa</option>
              <option value="Himachal Pradesh">Himachal Pradesh</option><option value="Uttarakhand">Uttarakhand</option>
              <option value="Puducherry">Puducherry</option><option value="Chandigarh">Chandigarh</option>
            </select>
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:12, fontWeight:700, color:'#556067', textTransform:'uppercase', display:'block', marginBottom:4 }}>Billing Address</label>
            <textarea value={invoiceFields.address} onChange={e => setInvoiceFields(p => ({...p, address: e.target.value}))} placeholder="Full billing address" style={{ width:'100%', padding:'10px 14px', border:'1px solid #e0e3e6', borderRadius:8, fontSize:14, boxSizing:'border-box', height:70, resize:'vertical' }} />
          </div>
          <div style={{ display:'flex' }}>
            <button onClick={handleSaveInvoiceDetails} disabled={!invoiceFields.business_name || !invoiceFields.state || invoiceSaving} style={{ flex:1, padding:10, border:'none', borderRadius:8, background:'#25D366', color:'#fff', cursor:'pointer', fontSize:14, fontWeight:700 }}>
              {invoiceSaved ? '✅ Saved!' : invoiceSaving ? 'Saving...' : 'Save Details'}
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
