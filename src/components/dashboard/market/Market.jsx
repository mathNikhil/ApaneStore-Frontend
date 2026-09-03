import { useState } from 'react';
import TopAppBar from '../../Common/TopAppBar';
import BottomNav from '../../Common/BottomNav';
import MarketDashboard from './MarketDashboard';
import MarketMessenger from './MarketMessenger';
import MarketSetup     from './MarketSetup';
import useMarketStore  from './useMarketStore';

export default function Market() {
  const [activeTab, setActiveTab] = useState('messenger');
  const { subscription, config, storeId, loading, refetch } = useMarketStore();

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
                onGoSetup={() => setActiveTab('setup')}
              />
            )}
            {activeTab === 'setup' && (
              <MarketSetup
                storeId={storeId}
                subscription={subscription}
                config={config}
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
