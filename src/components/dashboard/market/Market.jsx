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
      }).then(r => r.json()).then(d => {
        window.history.replaceState({}, '', '/market');
        if (d.status === 'paid') {
          refetch(); // refresh subscription
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
    </div>
  );
}
