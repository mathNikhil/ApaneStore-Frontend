import MarketPaywall from './MarketPaywall';
// src/components/market/MarketSetup.jsx
import { useState, useEffect, useRef } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';
const getToken = () => localStorage.getItem('token') || localStorage.getItem('authToken') || '';
const api = {
  get:    (url) => fetch(`${API_BASE_URL}${url}`, { headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' } }).then(r => r.json()),
  post:   (url, data) => fetch(`${API_BASE_URL}${url}`, { method: 'POST', headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  put:    (url, data) => fetch(`${API_BASE_URL}${url}`, { method: 'PUT',  headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  delete: (url) => fetch(`${API_BASE_URL}${url}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' } }).then(r => r.json()),
  patch:  (url, data) => fetch(`${API_BASE_URL}${url}`, { method: 'PATCH', headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' }, body: data ? JSON.stringify(data) : undefined }).then(r => r.json()),
};



const DAILY_LIMIT = 75;

export default function MarketSetup({ storeId, subscription, config, onRefresh, isSubscribed }) {
  const [mode, setMode]       = useState(config?.mode || 'personal');
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  if (false) { // TESTING
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
        <i className="ti ti-lock text-3xl block mb-2" />
        <div className="text-sm">Activate WhatsApp Market from the Dashboard tab first.</div>
      </div>
    );
  }

  const saveMode = async (newMode) => {
    setMode(newMode);
    await api.put(`/api/tenants/${storeId}/market/config`, { mode: newMode });
    onRefresh();
  };

  if (!isSubscribed) {
    return <MarketPaywall tenantId={storeId} onSubscribed={onRefresh} />;
  }

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="text-sm font-medium text-gray-800 mb-1">WhatsApp type</div>
          <div className="text-xs text-gray-400">Choose how you connect to WhatsApp</div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-gray-100">
          <button
            onClick={() => saveMode('personal')}
            className={`p-4 text-left transition-colors ${mode === 'personal' ? 'bg-green-50' : 'hover:bg-gray-50'}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${mode === 'personal' ? 'bg-green-100' : 'bg-gray-100'}`}>
              <i className={`ti ti-device-mobile text-base ${mode === 'personal' ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div className={`text-sm font-medium mb-0.5 ${mode === 'personal' ? 'text-green-700' : 'text-gray-700'}`}>Personal WhatsApp</div>
            <div className="text-xs text-gray-400">Scan QR · free · 75 msg/day</div>
            {mode === 'personal' && <span className="text-xs text-green-600 mt-1 block font-medium">✓ Active</span>}
          </button>
          <button
            onClick={() => saveMode('waba')}
            className={`p-4 text-left transition-colors ${mode === 'waba' ? 'bg-[#25D366]/10' : 'hover:bg-gray-50'}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${mode === 'waba' ? 'bg-[#25D366]/20' : 'bg-gray-100'}`}>
              <i className={`ti ti-building-store text-base ${mode === 'waba' ? 'text-[#006d2f]' : 'text-gray-400'}`} />
            </div>
            <div className={`text-sm font-medium mb-0.5 ${mode === 'waba' ? 'text-[#006d2f]' : 'text-gray-700'}`}>WhatsApp Business API</div>
            <div className="text-xs text-gray-400">WABA · unlimited · Meta approved</div>
            {mode === 'waba' && <span className="text-xs text-[#006d2f] mt-1 block font-medium">✓ Active</span>}
          </button>
        </div>
      </div>

      {/* Mode-specific section */}
      {mode === 'personal' ? (
        <PersonalSection storeId={storeId} config={config} onRefresh={onRefresh} />
      ) : (
        <WABASection storeId={storeId} config={config} onRefresh={onRefresh} />
      )}

      {/* Safety info — always shown */}
      <SafetySection mode={mode} />

      {/* Deactivate Plan — below How it works */}
      {isSubscribed && (
        <div className="mt-4">
          <p className="text-xs text-red-500 mb-3">
            Deactivating will disconnect WhatsApp, move scheduled messages to drafts and stop all sends. You will need to pay again to reactivate.
          </p>
          <DeactivateButton storeId={storeId} onRefresh={onRefresh} />
        </div>
      )}
    </div>
  );
}

// ── Personal QR section ───────────────────────────────────────────────────────
function PersonalSection({ storeId, config, onRefresh }) {
  const [qr, setQr]               = useState(null);
  const [connected, setConnected] = useState(false);
  // Check live connection status on mount
  useEffect(() => {
    if (!storeId) return;
    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';
    fetch(`${base}/api/tenants/${storeId}/market/connect/status`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(d => {
      if (d.connected) { setConnected(true); setPhone(d.phone); }
    }).catch(() => {});
  }, [storeId]);
  const [phone, setPhone]         = useState(config?.session_phone || null);
  const [loading, setLoading]     = useState(false);
  const [gap, setGap]             = useState(config?.gap_seconds || 2);
  const [timer, setTimer]         = useState(60);
  const timerRef = useRef();

  const startTimer = () => {
    clearInterval(timerRef.current);
    setTimer(60);
    timerRef.current = setInterval(() => setTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; }), 1000);
  };

  const fetchQR = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/api/tenants/${storeId}/market/connect/qr`);
      if (res.status === 'already_connected') { setConnected(true); return; }
      if (res.status === 'qr') { setQr(res.qr); startTimer(); }
      if (res.status === 'connected') { setConnected(true); setPhone(res.phone); onRefresh(); }
    } catch (e) { console.error('QR error:', e); } finally { setLoading(false); }
  };

  // Poll status after QR shown
  useEffect(() => {
    if (!qr) return;
    const poll = setInterval(async () => {
      try {
        const r = await api.get(`/api/tenants/${storeId}/market/connect/status`);
        if (r.connected) { setConnected(true); setPhone(r.phone); setQr(null); clearInterval(poll); onRefresh(); }
      } catch {}
    }, 3000);
    return () => clearInterval(poll);
  }, [qr]);

  const disconnect = async () => {
    await api.post(`/api/tenants/${storeId}/market/connect/disconnect`);
    setConnected(false); setPhone(null); setQr(null); onRefresh();
  };

  const saveGap = async (val) => {
    setGap(val);
    await api.put(`/api/tenants/${storeId}/market/config`, { gap_seconds: val });
  };

  return (
    <div className="space-y-3">
      {connected ? (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <i className="ti ti-check text-green-500 text-xl" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">WhatsApp connected</div>
              <div className="text-xs text-gray-400">{phone || 'Session active'}</div>
            </div>
            <button onClick={disconnect} className="ml-auto text-xs text-red-400 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50">
              <i className="ti ti-plug-x mr-1" />Disconnect
            </button>
          </div>
          <div className="border-t border-gray-100 pt-3">
            <label className="text-xs text-gray-400 block mb-2">Gap between messages</label>
            <div className="flex items-center gap-3">
              <input type="range" min={1} max={10} step={1} value={gap} onChange={e => saveGap(Number(e.target.value))} className="flex-1" />
              <span className="text-sm font-medium w-16">{gap}s gap</span>
              <span className="text-xs text-gray-400 w-20">~{Math.round(75 * gap / 60 * 10) / 10} min / 75</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-800 mb-3">Connect your WhatsApp</div>
          {/* Steps */}
          {[
            ['Open WhatsApp on your phone', 'Settings → Linked devices → Link a device'],
            ['Point camera at the QR code', 'The code refreshes every 60 seconds'],
            ['Done — session saved on server', 'You only scan once'],
          ].map(([title, desc], i) => (
            <div key={i} className="flex gap-3 mb-3">
              <div className="w-6 h-6 rounded-full bg-[#25D366]/10 text-[#006d2f] flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">{i + 1}</div>
              <div>
                <div className="text-sm font-medium text-gray-800">{title}</div>
                <div className="text-xs text-gray-400">{desc}</div>
              </div>
            </div>
          ))}

          {qr ? (
            <div className="text-center">
              <img src={qr} alt="WhatsApp QR" className="w-44 h-44 mx-auto rounded-xl border border-gray-200 mb-2" />
              <div className="text-xs text-gray-400 mb-3">QR expires in {timer}s</div>
              <button onClick={fetchQR} className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                <i className="ti ti-refresh mr-1" />Refresh QR
              </button>
            </div>
          ) : (
            <button onClick={fetchQR} disabled={loading}
              className="w-full bg-green-500 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-green-600 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <i className="ti ti-loader animate-spin" /> : <i className="ti ti-qrcode" />}
              {loading ? 'Generating QR…' : 'Generate QR code'}
            </button>
          )}
        </div>
      )}

    </div>
  );
}

// ── WABA credentials section ──────────────────────────────────────────────────
function WABASection({ storeId, config, onRefresh }) {
  const [form, setForm] = useState({
    waba_id:        config?.waba_id || '',
    phone_number_id: config?.phone_number_id || '',
    access_token:   '',
    display_name:   config?.display_name || '',
    template_name:  config?.template_name || '',
    template_lang:  config?.template_lang || 'en_IN',
    environment:    config?.environment || 'sandbox',
    webhook_token:  config?.webhook_token || '',
  });
  const [errors, setErrors]   = useState({});
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [showToken, setShowToken] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: null })); };

  const validate = () => {
    const e = {};
    if (!form.waba_id) e.waba_id = 'Required';
    if (!form.phone_number_id) e.phone_number_id = 'Required';
    if (!form.template_name) e.template_name = 'Required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const testConnection = async () => {
    setTesting(true); setTestResult(null);
    try {
      const res = await api.post(`/api/tenants/${storeId}/market/waba/test`, {
        phone_number_id: form.phone_number_id,
        access_token: form.access_token || config?.access_token,
      });
      setTestResult({ ok: true, msg: `Connected — ${res.data.display_phone}` });
    } catch (err) {
      setTestResult({ ok: false, msg: err.response?.data?.error || 'Connection failed' });
    } finally { setTesting(false); }
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await api.put(`/api/tenants/${storeId}/market/config`, { mode: 'waba', ...form });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
      onRefresh();
    } finally { setSaving(false); }
  };

  const Field = ({ id, label, required, hint, children }) => (
    <div className="mb-4">
      <label className="text-xs text-gray-500 block mb-1">
        {label} {required && <span className="text-xs bg-[#25D366]/10 text-[#006d2f] px-1.5 py-0.5 rounded ml-1">required</span>}
      </label>
      {children}
      {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
      {errors[id] && <div className="text-xs text-red-500 mt-1">{errors[id]}</div>}
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Meta credentials</div>

        <Field id="waba_id" label="WhatsApp Business Account ID (WABA ID)" required
          hint="Meta Business Manager → WhatsApp Accounts → Account ID">
          <input value={form.waba_id} onChange={e => set('waba_id', e.target.value)}
            placeholder="123456789012345"
            className={`w-full text-sm border rounded-lg px-3 py-2 outline-none ${errors.waba_id ? 'border-red-300' : 'border-gray-200 focus:border-blue-400'}`} />
        </Field>

        <Field id="phone_number_id" label="Phone Number ID" required
          hint="Meta Developer Console → WhatsApp → Getting Started → Phone number ID">
          <input value={form.phone_number_id} onChange={e => set('phone_number_id', e.target.value)}
            placeholder="987654321098765"
            className={`w-full text-sm border rounded-lg px-3 py-2 outline-none ${errors.phone_number_id ? 'border-red-300' : 'border-gray-200 focus:border-blue-400'}`} />
        </Field>

        <Field id="access_token" label="Permanent access token" required={!config?.access_token}
          hint="Meta Business Manager → System Users → Generate token. Leave blank to keep existing.">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden focus-within:border-blue-400">
            <input
              type={showToken ? 'text' : 'password'}
              value={form.access_token}
              onChange={e => set('access_token', e.target.value)}
              placeholder={config?.access_token ? '(saved — paste new to update)' : 'EAAxxxxxxxxxx…'}
              className="flex-1 text-sm px-3 py-2 outline-none bg-transparent"
            />
            <button onClick={() => setShowToken(v => !v)} className="px-3 text-gray-400 hover:text-gray-600">
              <i className={`ti ${showToken ? 'ti-eye-off' : 'ti-eye'} text-sm`} />
            </button>
          </div>
        </Field>

        <Field id="display_name" label="Display name (registered with Meta)"
          hint="What customers see as the sender — must match Meta's approved name exactly.">
          <input value={form.display_name} onChange={e => set('display_name', e.target.value)}
            placeholder="e.g. Fashion Hub Notifications"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400" />
        </Field>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Message template</div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 mb-4">
          <i className="ti ti-alert-triangle mr-1" />
          WABA requires pre-approved templates for outbound messages. You cannot send free-form text.
        </div>

        <Field id="template_name" label="Template name" required
          hint="Exact name from Meta's approved template list.">
          <input value={form.template_name} onChange={e => set('template_name', e.target.value)}
            placeholder="e.g. store_promo_image"
            className={`w-full text-sm border rounded-lg px-3 py-2 outline-none ${errors.template_name ? 'border-red-300' : 'border-gray-200 focus:border-blue-400'}`} />
        </Field>

        <Field id="template_lang" label="Template language">
          <select value={form.template_lang} onChange={e => set('template_lang', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none">
            <option value="en">en — English</option>
            <option value="en_IN">en_IN — English (India)</option>
            <option value="hi">hi — Hindi</option>
            <option value="mr">mr — Marathi</option>
            <option value="gu">gu — Gujarati</option>
            <option value="ta">ta — Tamil</option>
            <option value="te">te — Telugu</option>
          </select>
        </Field>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Environment</div>
        <Field id="environment" label="API environment">
          <select value={form.environment} onChange={e => set('environment', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none">
            <option value="sandbox">Sandbox — test only, no real messages sent</option>
            <option value="production">Production — sends real messages</option>
          </select>
        </Field>
        <Field id="webhook_token" label="Webhook verification token"
          hint="Optional — enables delivery receipts. Set the same value in Meta Developer Console → Webhooks.">
          <input value={form.webhook_token} onChange={e => set('webhook_token', e.target.value)}
            placeholder="e.g. my_secret_token_2026"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400" />
        </Field>
      </div>

      {testResult && (
        <div className={`rounded-xl border p-3 flex items-center gap-2 text-sm ${testResult.ok ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <i className={`ti ${testResult.ok ? 'ti-check' : 'ti-x'}`} />
          {testResult.msg}
        </div>
      )}

      <div className="flex gap-3 justify-end pb-4">
        <button onClick={testConnection} disabled={testing}
          className="text-sm border border-gray-300 rounded-xl px-4 py-2.5 hover:bg-gray-50 flex items-center gap-1.5 disabled:opacity-60">
          {testing ? <i className="ti ti-loader animate-spin" /> : <i className="ti ti-send" />}
          Test connection
        </button>
        <button onClick={save} disabled={saving}
          className="text-sm bg-[#25D366] text-white rounded-xl px-5 py-2.5 hover:bg-[#1db954] flex items-center gap-1.5 disabled:opacity-60">
          {saving ? <i className="ti ti-loader animate-spin" /> : saved ? <i className="ti ti-check" /> : <i className="ti ti-device-floppy" />}
          {saved ? 'Saved' : 'Save WABA settings'}
        </button>
      </div>
    </div>
  );
}

// ── Safety info section ───────────────────────────────────────────────────────
function DeactivateButton({ storeId, onRefresh }) {
  const [deactivating, setDeactivating] = useState(false);

  const handleDeactivate = async () => {
    if (!window.confirm('Your WhatsApp will disconnect and all scheduled messages will become drafts. Are you sure you want to deactivate your plan?')) return;
    setDeactivating(true);
    try {
      const token = localStorage.getItem('token');
      const base = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';
      await fetch(`${base}/api/tenants/${storeId}/market/deactivate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      onRefresh();
    } catch(e) {
      alert('Failed to deactivate: ' + e.message);
    } finally { setDeactivating(false); }
  };

  return (
    <button
      onClick={handleDeactivate}
      disabled={deactivating}
      className="w-full py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-60 transition-all">
      {deactivating ? 'Deactivating...' : '⚠ Deactivate Plan'}
    </button>
  );
}

function SafetySection({ mode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-4 text-left">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <i className="ti ti-shield-check text-green-500" /> How Personal WhatsApp Service Works: Safety & Limits
        </div>
        <i className={`ti ${open ? 'ti-chevron-up' : 'ti-chevron-down'} text-gray-400`} />
      </button>
      {open && (
        <div className="border-t border-gray-100 p-4 space-y-3 text-sm">

          {/* How it works — always shown */}
          <div className="bg-[#25D366]/10 border border-[#bbcbb9] rounded-xl p-4 mb-2">
            <div className="font-semibold text-[#005523] mb-3 flex items-center gap-2">
              <i className="ti ti-bulb text-base" /> How the system works
            </div>

            {/* Compose in advance */}
            <div className="mb-3">
              <div className="text-xs font-semibold text-[#006d2f] uppercase tracking-wider mb-2">📅 Compose messages in advance</div>
              <div className="bg-white rounded-lg p-3 text-xs text-gray-600 space-y-1 border border-[#bbcbb9]">
                <div>You can save up to <strong>10 messages</strong> in advance (based on your plan):</div>
                <div className="pl-2 space-y-0.5 text-gray-500">
                  <div>• Message 1 — Diwali invite → 75 contacts → 20 Oct 10:00 AM</div>
                  <div>• Message 2 — New arrival → 50 contacts → 25 Oct 9:00 AM</div>
                  <div>• Message 3 — Sale offer → 75 contacts → 1 Nov 10:00 AM</div>
                </div>
                <div className="text-green-700 font-medium">All saved. Nothing sends until the scheduled time.</div>
              </div>
            </div>

            {/* Auto sending */}
            <div className="mb-3">
              <div className="text-xs font-semibold text-[#006d2f] uppercase tracking-wider mb-2">🤖 Auto sending — you do nothing</div>
              <div className="bg-white rounded-lg p-3 text-xs text-gray-600 space-y-1 border border-[#bbcbb9]">
                <div><strong>20 Oct 10:00 AM</strong> — server sends Message 1 to 75 contacts automatically</div>
                <div className="text-amber-600">→ 75 messages sent today. Daily limit reached.</div>
                <div><strong>21 Oct midnight</strong> — limit resets to 0</div>
                <div className="text-green-700">→ Message 2 will go out on its scheduled date ✅</div>
              </div>
            </div>

            {/* Key rules table */}
            <div>
              <div className="text-xs font-semibold text-[#006d2f] uppercase tracking-wider mb-2">📋 Key rules</div>
              <div className="bg-white rounded-lg border border-[#bbcbb9] overflow-hidden text-xs">
                {[
                  ['Max saved messages', '10 at once (upgradeable)', 'green'],
                  ['Daily send limit', '75 messages per day', 'green'],
                  ['Daily limit resets', 'Every midnight automatically', 'green'],
                  ['Same message next day', '✅ Allowed', 'green'],
                  ['Same contacts next day', '✅ Allowed', 'green'],
                  ['Repeat weekly/monthly', '✅ Auto-reschedules after send', 'green'],
                  ['If limit hit mid-send', 'Remaining rescheduled to next day', 'amber'],
                ].map(([rule, value, color]) => (
                  <div key={rule} className="flex justify-between px-3 py-2 border-b border-gray-50 last:border-0">
                    <span className="text-gray-500">{rule}</span>
                    <span className={`font-medium ${color === 'green' ? 'text-green-700' : 'text-amber-600'}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Day example */}
            <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800">
              <div className="font-semibold mb-1">⚠️ Same-day example</div>
              <div className="space-y-0.5">
                <div>Message 1 → 50 contacts ✅ (50 of 75 used)</div>
                <div>Message 2 → 25 contacts ✅ (75 of 75 — limit reached)</div>
                <div>Message 3 → scheduled same day → ⏭️ auto-moved to next day</div>
              </div>
            </div>
          </div>

          {mode === 'personal' ? (
            <>
              <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-2">
                <div className="font-medium text-gray-700 mb-1">How the 75/day limit is counted</div>
                <div className="flex justify-between"><span className="text-gray-500">1 group of 25 people</span><span className="font-medium">= 25 messages</span></div>
                <div className="flex justify-between"><span className="text-gray-500">50 individual contacts</span><span className="font-medium">= 50 messages</span></div>
                <div className="flex justify-between bg-green-50 rounded p-1.5"><span className="text-green-700">Group of 25 + 50 people</span><span className="font-medium text-green-700">= 75 — at limit ✓</span></div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1.5">
                <div className="font-medium text-gray-700 mb-1">2-second gap — why it matters</div>
                <div className="flex justify-between"><span className="text-gray-500">75 messages × 2s</span><span>≈ 2.5 min total · looks human</span></div>
                <div className="flex justify-between"><span className="text-gray-500">No gap</span><span className="text-red-500">Bot detected — ban risk</span></div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-xs">
                <div className="font-medium text-gray-700 mb-2">Risk by volume</div>
                {[['Under 50/day','Very safe'],['50–75/day','Safe — our limit'],['75–150/day','Moderate risk'],['150+/day','High ban risk']].map(([v,r],i)=>(
                  <div key={i} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                    <span className="text-gray-500">{v}</span>
                    <span className={i < 2 ? 'text-green-600' : i === 2 ? 'text-amber-600' : 'text-red-500'}>{r}</span>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                <i className="ti ti-alert-triangle mr-1" />
                Biggest safety factor: send only to people who have your number saved. Known contacts = very low risk.
              </div>
            </>
          ) : (
            <div className="bg-[#25D366]/10 rounded-lg p-3 text-xs text-[#005523]">
              <i className="ti ti-info-circle mr-1" />
              WABA is Meta's official API — no daily limit, no ban risk. Ensure your template is approved before scheduling.
              Templates typically take 1–2 business days to get approved.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
