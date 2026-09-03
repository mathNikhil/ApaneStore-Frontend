// src/components/market/MarketDashboard.jsx
import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';
const getToken = () => localStorage.getItem('token') || localStorage.getItem('authToken') || '';
const api = {
  get:    (url) => fetch(`${API_BASE_URL}${url}`, { headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' } }).then(r => r.json()),
  post:   (url, data) => fetch(`${API_BASE_URL}${url}`, { method: 'POST', headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  put:    (url, data) => fetch(`${API_BASE_URL}${url}`, { method: 'PUT',  headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  delete: (url) => fetch(`${API_BASE_URL}${url}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' } }).then(r => r.json()),
  patch:  (url, data) => fetch(`${API_BASE_URL}${url}`, { method: 'PATCH', headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' }, body: data ? JSON.stringify(data) : undefined }).then(r => r.json()),
};



export default function MarketDashboard({ storeId, subscription, config, onActivate, onGoSetup, onGoMessenger }) {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(false);

  const isActive = true; // TESTING — restore to: subscription?.is_active

  useEffect(() => {
    if (!isActive) return;
    api.get(`/api/tenants/${storeId}/market/messages`).then(res => {
      const msgs = res.data;
      setStats({
        total:     msgs.length,
        scheduled: msgs.filter(m => m.status === 'scheduled').length,
        sent:      msgs.filter(m => m.status === 'sent').length,
        failed:    msgs.filter(m => m.status === 'failed').length,
      });
    });
  }, [storeId, isActive]);

  // ── Premium gate ────────────────────────────────────────────────────────────
  if (!isActive) {
    return (
      <div className="bg-white rounded-xl border border-purple-200 p-6 text-center">
        <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs px-3 py-1 rounded-full mb-4">
          <i className="ti ti-crown text-sm" />
          Premium add-on
        </div>
        <h2 className="text-xl font-medium text-gray-900 mb-2">WhatsApp Market</h2>
        <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
          Schedule photo messages to your customers directly from WhatsApp.
          Personal account up to 75 messages/day, or connect your WABA for unlimited.
        </p>

        <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto mb-6 text-left">
          {[
            'Schedule in advance',
            'Photo + caption',
            'Groups and contacts',
            'Repeat monthly',
            '75 msgs / day (personal)',
            'WABA — unlimited',
          ].map(f => (
            <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
              <i className="ti ti-check text-green-500" />
              {f}
            </div>
          ))}
        </div>

        <div className="mb-1 text-2xl font-medium text-gray-900">
          ₹199 <span className="text-sm font-normal text-gray-400">/ month</span>
        </div>
        <div className="text-xs text-gray-400 mb-5">Added to your AapnaEstore plan</div>

        <ActivateButton storeId={storeId} onActivate={onActivate} />
      </div>
    );
  }

  // ── Active dashboard ────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Connection status banner */}
      {!config?.is_connected && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <i className="ti ti-alert-circle text-amber-500 text-xl flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-medium text-amber-800">WhatsApp not connected</div>
            <div className="text-xs text-amber-600">Scan the QR code in Setup to start sending messages.</div>
          </div>
          <button
            onClick={onGoSetup}
            className="text-xs bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors"
          >
            Go to setup
          </button>
        </div>
      )}

      {/* Mode badge */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          config?.mode === 'waba' ? 'bg-[#25D366]/10' : 'bg-green-50'
        }`}>
          <i className={`ti text-xl ${config?.mode === 'waba' ? 'ti-building-store text-[#006d2f]' : 'ti-device-mobile text-green-500'}`} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">
            {config?.mode === 'waba' ? 'WhatsApp Business API (WABA)' : 'Personal WhatsApp'}
          </div>
          <div className="text-xs text-gray-400">
            {config?.mode === 'waba'
              ? `Template: ${config?.template_name || 'not set'} · ${config?.environment}`
              : `Limit: 75 messages/day · ${config?.gap_seconds || 2}s gap between sends`}
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          config?.is_connected
            ? 'bg-green-50 text-green-700'
            : 'bg-gray-100 text-gray-500'
        }`}>
          {config?.is_connected ? 'Connected' : 'Not connected'}
        </span>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Scheduled',  value: stats.scheduled, color: 'text-[#006d2f]',  bg: 'bg-[#25D366]/10',  icon: 'ti-clock' },
            { label: 'Sent',       value: stats.sent,      color: 'text-green-600', bg: 'bg-green-50', icon: 'ti-check' },
            { label: 'Failed',     value: stats.failed,    color: 'text-red-600',   bg: 'bg-red-50',   icon: 'ti-x' },
            { label: 'Total',      value: stats.total,     color: 'text-gray-600',  bg: 'bg-gray-100', icon: 'ti-messages' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center mb-2`}>
                <i className={`ti ${s.icon} ${s.color} text-base`} />
              </div>
              <div className={`text-2xl font-medium ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onGoMessenger}
          className="bg-green-500 text-white rounded-xl p-4 text-left hover:bg-green-600 transition-colors"
        >
          <i className="ti ti-pencil text-xl block mb-2" />
          <div className="text-sm font-medium">Compose message</div>
          <div className="text-xs text-green-100">Schedule a new photo message</div>
        </button>
        <button
          onClick={onGoSetup}
          className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:bg-gray-50 transition-colors"
        >
          <i className="ti ti-settings text-xl block mb-2 text-gray-600" />
          <div className="text-sm font-medium text-gray-800">Setup and limits</div>
          <div className="text-xs text-gray-400">Connection, safety, WABA config</div>
        </button>
      </div>

      {/* Personal limit info */}
      {config?.mode === 'personal' && config?.is_connected && (
        <PersonalLimitBar storeId={storeId} />
      )}
    </div>
  );
}

function PersonalLimitBar({ storeId }) {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    api.get(`/api/tenants/${storeId}/market/connect/status`).then(r => setStatus(r.data));
  }, [storeId]);
  if (!status) return null;
  const pct = Math.min(Math.round((status.todayCount / status.dailyLimit) * 100), 100);
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">Today's messages</span>
        <span className="text-sm font-medium">{status.todayCount} / {status.dailyLimit}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
        <div
          className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-red-400' : pct >= 75 ? 'bg-amber-400' : 'bg-green-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-xs text-gray-400">{status.remaining} remaining today · resets at midnight</div>
    </div>
  );
}

function ActivateButton({ storeId, onActivate }) {
  const [loading, setLoading] = useState(false);
  const activate = async () => {
    setLoading(true);
    try {
      await api.post(`/api/tenants/${storeId}/market/subscription/activate`);
      onActivate();
    } finally {
      setLoading(false);
    }
  };
  return (
    <button
      onClick={activate}
      disabled={loading}
      className="bg-green-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-60 inline-flex items-center gap-2"
    >
      {loading ? <i className="ti ti-loader animate-spin" /> : <i className="ti ti-crown" />}
      Activate WhatsApp Market
    </button>
  );
}
