// src/pages/Market.jsx
// Drop into ApaneStore-Frontend/src/pages/
// Add route in App.jsx: <Route path="/market" element={<Market />} />
// Add tab in bottom nav alongside Dashboard and Profile

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MarketDashboard  from '../components/market/MarketDashboard';
import MarketMessenger  from '../components/market/MarketMessenger';
import MarketSetup      from '../components/market/MarketSetup';
import useMarketStore   from '../hooks/useMarketStore';

export default function Market() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { subscription, config, loading, refetch } = useMarketStore();
  const navigate = useNavigate();

  // Get storeId from auth context — adjust to match your existing auth pattern
  const storeId = localStorage.getItem('storeId') || sessionStorage.getItem('storeId');

  if (!storeId) {
    navigate('/dashboard');
    return null;
  }

  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: 'ti-chart-bar' },
    { key: 'messenger', label: 'Messenger',  icon: 'ti-brand-whatsapp' },
    { key: 'setup',     label: 'Setup',      icon: 'ti-settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-4 pt-4 pb-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <i className="ti ti-brand-whatsapp text-green-500 text-xl" />
            <span className="font-medium text-gray-900">WhatsApp Market</span>
            {subscription?.is_active ? (
              <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">Active</span>
            ) : (
              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">Premium</span>
            )}
          </div>
          {config?.is_connected && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              Connected
            </div>
          )}
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-0 -mb-px">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-colors whitespace-nowrap
                ${activeTab === t.key
                  ? 'border-green-500 text-green-600 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <i className={`ti ${t.icon} text-base`} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <i className="ti ti-loader text-3xl animate-spin block mb-2" />
            Loading...
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <MarketDashboard
                storeId={storeId}
                subscription={subscription}
                config={config}
                onActivate={() => { refetch(); setActiveTab('setup'); }}
                onGoSetup={() => setActiveTab('setup')}
                onGoMessenger={() => setActiveTab('messenger')}
              />
            )}
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
    </div>
  );
}
