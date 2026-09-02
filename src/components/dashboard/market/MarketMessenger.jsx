// src/components/market/MarketMessenger.jsx
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

export default function MarketMessenger({ storeId, subscription, config, onGoSetup }) {
  const [tab, setTab]         = useState('compose');
  const [messages, setMessages] = useState([]);
  const [groups, setGroups]   = useState([]);
  const [contacts, setContacts] = useState([]);
  const [todayCount, setTodayCount] = useState(0);

  const isActive    = true; // TESTING
  const mode        = config?.mode || 'personal';
  const isConnected = config?.is_connected;

  useEffect(() => {
    if (!isActive) return;
    Promise.all([
      api.get(`/stores/${storeId}/market/messages`).catch(() => []),
      api.get(`/stores/${storeId}/market/groups`).catch(() => []),
      api.get(`/stores/${storeId}/market/contacts`).catch(() => []),
    ]).then(([m, g, c]) => {
      setMessages(Array.isArray(m) ? m : (m?.data || []));
      setGroups(Array.isArray(g) ? g : (g?.data || []));
      setContacts(Array.isArray(c) ? c : (c?.data || []));
    });
    if (mode === 'personal' && isConnected) {
      api.get(`/stores/${storeId}/market/connect/status`).then(r => setTodayCount(r.data.todayCount));
    }
  }, [storeId, isActive, mode, isConnected]);

  const refreshMessages = () =>
    api.get(`/stores/${storeId}/market/messages`).then(r => setMessages(r.data));

  if (!isActive) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
        <i className="ti ti-lock text-3xl block mb-2" />
        <div className="text-sm">Activate WhatsApp Market from the Dashboard tab.</div>
      </div>
    );
  }

  const subTabs = [
    { key: 'compose',   label: 'Compose',   icon: 'ti-pencil' },
    { key: 'scheduled', label: 'Scheduled', icon: 'ti-clock', count: messages.filter(m => m.status === 'scheduled').length },
    { key: 'contacts',  label: 'Contacts',  icon: 'ti-users' },
    { key: 'history',   label: 'History',   icon: 'ti-history' },
  ];

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex border-b border-gray-200 mb-4 -mx-4 px-4 bg-white">
        {subTabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs border-b-2 transition-colors whitespace-nowrap
              ${tab === t.key ? 'border-green-500 text-green-600 font-medium' : 'border-transparent text-gray-400'}`}
          >
            <i className={`ti ${t.icon}`} />
            {t.label}
            {t.count > 0 && (
              <span className="text-xs bg-blue-50 text-blue-600 px-1.5 rounded-full">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Not connected banner */}
      {!isConnected && tab !== 'contacts' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 mb-4 text-sm">
          <i className="ti ti-alert-circle text-amber-500" />
          <span className="text-amber-700">WhatsApp not connected.</span>
          <button onClick={onGoSetup} className="ml-auto text-amber-700 underline text-xs">Setup →</button>
        </div>
      )}

      {tab === 'compose' && (
        <ComposeTab
          storeId={storeId}
          mode={mode}
          groups={groups}
          contacts={contacts}
          todayCount={todayCount}
          isConnected={isConnected}
          onScheduled={() => { refreshMessages(); setTab('scheduled'); }}
          config={config}
        />
      )}
      {tab === 'scheduled' && (
        <ScheduledTab messages={messages.filter(m => ['scheduled','draft'].includes(m.status))} onRefresh={refreshMessages} storeId={storeId} />
      )}
      {tab === 'contacts' && (
        <ContactsTab storeId={storeId} groups={groups} contacts={contacts} setGroups={setGroups} setContacts={setContacts} />
      )}
      {tab === 'history' && (
        <HistoryTab messages={messages} />
      )}
    </div>
  );
}

// ── Compose ──────────────────────────────────────────────────────────────────
function ComposeTab({ storeId, mode, groups, contacts, todayCount, isConnected, onScheduled, config }) {
  const [selectedRecips, setSelectedRecips] = useState([]);
  const [photo, setPhoto]     = useState(null);      // { url, preview }
  const [caption, setCaption] = useState('');
  const [tplVars, setTplVars] = useState({});        // waba template vars
  const [sendDate, setSendDate] = useState('');
  const [sendTime, setSendTime] = useState('');
  const [repeat, setRepeat]   = useState('none');
  const [recipSearch, setRecipSearch] = useState('');
  const [showDrop, setShowDrop] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState({});
  const fileRef = useRef();

  const recipientCount = selectedRecips.reduce((sum, r) => sum + (r.count || 1), 0);
  const remaining      = DAILY_LIMIT - todayCount;

  const allOptions = [
    ...groups.map(g => ({ type: 'group', id: g.id, label: `${g.name}`, count: g.member_count || g.members?.length || 0 })),
    ...contacts.map(c => ({ type: 'contact', id: c.id, label: c.name, count: 1 })),
  ].filter(o =>
    !selectedRecips.find(r => r.type === o.type && r.id === o.id) &&
    o.label.toLowerCase().includes(recipSearch.toLowerCase())
  );

  const addRecip = (opt) => {
    setSelectedRecips(prev => [...prev, opt]);
    setRecipSearch('');
    setShowDrop(false);
    setErrors(e => ({ ...e, recips: null }));
  };

  const removeRecip = (i) => setSelectedRecips(prev => prev.filter((_, idx) => idx !== i));

  const handlePhoto = async (file) => {
    if (!file) return;
    setUploading(true);
    const preview = URL.createObjectURL(file);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const uploadRes = await fetch(`${API_BASE_URL}/api/stores/${storeId}/market/media/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      const res = await uploadRes.json();
      setPhoto({ url: res.url, preview });
      setErrors(e => ({ ...e, photo: null }));
    } catch {
      setErrors(e => ({ ...e, photo: 'Upload failed — try again.' }));
    } finally {
      setUploading(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!selectedRecips.length) e.recips = 'Add at least one recipient.';
    if (!photo?.url) e.photo = 'Upload a photo.';
    if (!sendDate || !sendTime) e.date = 'Set a send date and time.';
    if (sendDate && sendTime && new Date(`${sendDate}T${sendTime}`) <= new Date()) e.date = 'Date must be in the future.';
    if (mode === 'personal' && recipientCount > remaining) e.recips = `Only ${remaining} messages remaining today.`;
    setErrors(e);
    return !Object.keys(e).length;
  };

  const schedule = async (asDraft = false) => {
    if (!asDraft && !validate()) return;
    setSaving(true);
    try {
      const payload = {
        mode,
        recipients: selectedRecips.map(r => ({ type: r.type, id: r.id, label: r.label, count: r.count })),
        media_url:  photo?.url,
        caption:    mode === 'waba' ? JSON.stringify(tplVars) : caption,
        scheduled_at: sendDate && sendTime ? `${sendDate}T${sendTime}:00` : null,
        repeat_type: repeat,
      };
      const endpoint = asDraft ? '/market/messages/draft' : '/market/messages';
      await api.post(`/stores/${storeId}${endpoint}`, payload);
      onScheduled();
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      {/* Daily limit bar — personal only */}
      {mode === 'personal' && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-gray-500">Today's limit</span>
            <span className="text-xs font-medium">{todayCount} / {DAILY_LIMIT} sent</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
            <div
              className={`h-full rounded-full transition-all ${todayCount >= DAILY_LIMIT ? 'bg-red-400' : todayCount >= 60 ? 'bg-amber-400' : 'bg-green-400'}`}
              style={{ width: `${Math.min((todayCount / DAILY_LIMIT) * 100, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-400">
            {remaining} remaining · each group member counts as 1 message · 2s gap between sends
          </div>
          {recipientCount > 0 && (
            <div className={`text-xs mt-1.5 font-medium ${recipientCount > remaining ? 'text-red-500' : 'text-green-600'}`}>
              This message will send {recipientCount} message{recipientCount !== 1 ? 's' : ''} ·{' '}
              {recipientCount > remaining ? `${recipientCount - remaining} over today's limit` : `${remaining - recipientCount} remaining after send`}
            </div>
          )}
        </div>
      )}

      {/* Recipients */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <label className="text-xs text-gray-500 block mb-2">
          Recipients — groups or contacts
          {mode === 'personal' && <span className="text-gray-400"> (max {DAILY_LIMIT}/day total)</span>}
        </label>
        <div
          className="min-h-10 border border-gray-200 rounded-lg p-2 flex flex-wrap gap-1.5 cursor-text"
          onClick={() => setShowDrop(true)}
        >
          {selectedRecips.map((r, i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">
              <i className={`ti ${r.type === 'group' ? 'ti-users' : 'ti-user'} text-xs`} />
              {r.label} <span className="opacity-60">({r.count})</span>
              <button onClick={(e) => { e.stopPropagation(); removeRecip(i); }} className="ml-0.5 hover:text-red-500">×</button>
            </span>
          ))}
          <input
            value={recipSearch}
            onChange={e => { setRecipSearch(e.target.value); setShowDrop(true); }}
            onFocus={() => setShowDrop(true)}
            onBlur={() => setTimeout(() => setShowDrop(false), 180)}
            placeholder={selectedRecips.length ? '' : 'Search groups or contacts…'}
            className="flex-1 min-w-32 border-none outline-none text-sm bg-transparent"
          />
        </div>
        {showDrop && allOptions.length > 0 && (
          <div className="border border-gray-200 rounded-lg mt-1 bg-white overflow-hidden shadow-sm">
            {allOptions.slice(0, 8).map((o, i) => (
              <div
                key={i}
                onMouseDown={() => addRecip(o)}
                className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
              >
                <span className="flex items-center gap-2">
                  <i className={`ti ${o.type === 'group' ? 'ti-users text-blue-400' : 'ti-user text-gray-400'} text-sm`} />
                  {o.label}
                </span>
                <span className="text-xs text-gray-400">{o.count} contact{o.count !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        )}
        {errors.recips && <p className="text-xs text-red-500 mt-1">{errors.recips}</p>}
      </div>

      {/* Photo upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <label className="text-xs text-gray-500 block mb-2">Photo / image</label>
        <div className="flex items-center gap-3">
          <div
            className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center cursor-pointer overflow-hidden flex-shrink-0"
            onClick={() => fileRef.current.click()}
          >
            {photo?.preview
              ? <img src={photo.preview} className="w-full h-full object-cover" alt="Preview" />
              : uploading
                ? <i className="ti ti-loader text-gray-400 text-xl animate-spin" />
                : <i className="ti ti-photo text-gray-300 text-2xl" />
            }
          </div>
          <div>
            <button
              onClick={() => fileRef.current.click()}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 flex items-center gap-1.5"
            >
              <i className="ti ti-upload text-sm" /> Upload photo
            </button>
            <div className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · max 5MB</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handlePhoto(e.target.files[0])} />
        </div>
        {errors.photo && <p className="text-xs text-red-500 mt-1">{errors.photo}</p>}
      </div>

      {/* Caption — personal: free text | waba: template vars */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {mode === 'personal' ? (
          <>
            <label className="text-xs text-gray-500 block mb-2">Caption / message</label>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Write your message here…"
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg p-2.5 resize-none outline-none focus:border-green-400"
            />
          </>
        ) : (
          <>
            <label className="text-xs text-gray-500 block mb-1">Template variables</label>
            <div className="text-xs text-gray-400 mb-3">
              Template: <strong>{config?.template_name}</strong> — fill in the variables below
            </div>
            {['1', '2', '3'].map(k => (
              <div key={k} className="mb-2">
                <label className="text-xs text-gray-400 mb-1 block">Variable {`{{${k}}}`}</label>
                <input
                  type="text"
                  value={tplVars[k] || ''}
                  onChange={e => setTplVars(prev => ({ ...prev, [k]: e.target.value }))}
                  placeholder={k === '1' ? 'Customer name' : k === '2' ? 'Store name' : 'Message body'}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
                />
              </div>
            ))}
          </>
        )}
      </div>

      {/* Date + time */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <label className="text-xs text-gray-500 block mb-2">Schedule</label>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Send date</label>
            <input type="date" min={today} value={sendDate} onChange={e => setSendDate(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Send time</label>
            <input type="time" value={sendTime} onChange={e => setSendTime(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none" />
          </div>
        </div>
        {errors.date && <p className="text-xs text-red-500 mb-2">{errors.date}</p>}
        <div>
          <label className="text-xs text-gray-400 block mb-1">Repeat</label>
          <select value={repeat} onChange={e => setRepeat(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none">
            <option value="none">Send once — no repeat</option>
            <option value="weekly">Every week</option>
            <option value="monthly">Every month</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pb-4">
        <button
          onClick={() => schedule(true)}
          disabled={saving}
          className="text-sm border border-gray-300 rounded-xl px-4 py-2.5 hover:bg-gray-50 flex items-center gap-1.5 disabled:opacity-60"
        >
          <i className="ti ti-device-floppy" /> Save draft
        </button>
        <button
          onClick={() => schedule(false)}
          disabled={saving || !isConnected}
          className="text-sm bg-green-500 text-white rounded-xl px-5 py-2.5 hover:bg-green-600 flex items-center gap-1.5 disabled:opacity-60"
        >
          {saving ? <i className="ti ti-loader animate-spin" /> : <i className="ti ti-brand-whatsapp" />}
          Schedule message
        </button>
      </div>
    </div>
  );
}

// ── Scheduled list ────────────────────────────────────────────────────────────
function ScheduledTab({ messages, onRefresh, storeId }) {
  const deleteMsg = async (id) => {
    await api.delete(`/stores/${storeId}/market/messages/${id}`);
    onRefresh();
  };

  if (!messages.length) return (
    <div className="text-center py-12 text-gray-400">
      <i className="ti ti-clock text-3xl block mb-2" />
      <div className="text-sm">No scheduled messages yet.</div>
    </div>
  );

  return (
    <div className="space-y-3">
      {messages.map(m => <MessageCard key={m.id} m={m} onDelete={() => deleteMsg(m.id)} />)}
    </div>
  );
}

// ── History ───────────────────────────────────────────────────────────────────
function HistoryTab({ messages }) {
  const sent = messages.filter(m => ['sent','failed'].includes(m.status));
  if (!sent.length) return (
    <div className="text-center py-12 text-gray-400">
      <i className="ti ti-history text-3xl block mb-2" />
      <div className="text-sm">Sent messages will appear here.</div>
    </div>
  );
  return (
    <div className="space-y-3">
      {sent.map(m => <MessageCard key={m.id} m={m} />)}
    </div>
  );
}

// ── Contacts tab ──────────────────────────────────────────────────────────────
function ContactsTab({ storeId, groups, contacts, setGroups, setContacts }) {
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddGroup, setShowAddGroup]     = useState(false);
  const [newName, setNewName]   = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newGrp, setNewGrp]     = useState('');
  const [grpName, setGrpName]   = useState('');

  const saveContact = async () => {
    if (!newName || !newPhone) return;
    const res = await api.post(`/stores/${storeId}/market/contacts`, {
      name: newName, phone: newPhone, group_id: newGrp || null,
    });
    setContacts(prev => [...prev, res.data]);
    setNewName(''); setNewPhone(''); setNewGrp('');
    setShowAddContact(false);
  };

  const saveGroup = async () => {
    if (!grpName) return;
    const res = await api.post(`/stores/${storeId}/market/groups`, { name: grpName });
    setGroups(prev => [...prev, res.data]);
    setGrpName(''); setShowAddGroup(false);
  };

  const deleteContact = async (id) => {
    await api.delete(`/stores/${storeId}/market/contacts/${id}`);
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const deleteGroup = async (id) => {
    await api.delete(`/stores/${storeId}/market/groups/${id}`);
    setGroups(prev => prev.filter(g => g.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-end">
        <button onClick={() => setShowAddContact(v => !v)}
          className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 flex items-center gap-1">
          <i className="ti ti-user-plus" /> Add contact
        </button>
        <button onClick={() => setShowAddGroup(v => !v)}
          className="text-xs bg-blue-500 text-white rounded-lg px-3 py-1.5 hover:bg-blue-600 flex items-center gap-1">
          <i className="ti ti-users-plus" /> New group
        </button>
      </div>

      {showAddContact && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">New contact</div>
          <div className="grid grid-cols-2 gap-3">
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Full name"
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none" />
            <input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="919876543210"
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none" />
          </div>
          <select value={newGrp} onChange={e => setNewGrp(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none">
            <option value="">— No group —</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAddContact(false)} className="text-xs border border-gray-200 rounded-lg px-3 py-1.5">Cancel</button>
            <button onClick={saveContact} className="text-xs bg-green-500 text-white rounded-lg px-3 py-1.5">Save contact</button>
          </div>
        </div>
      )}

      {showAddGroup && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">New group</div>
          <input value={grpName} onChange={e => setGrpName(e.target.value)} placeholder="Group name e.g. Family, Diwali guests"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none" />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAddGroup(false)} className="text-xs border border-gray-200 rounded-lg px-3 py-1.5">Cancel</button>
            <button onClick={saveGroup} className="text-xs bg-blue-500 text-white rounded-lg px-3 py-1.5">Save group</button>
          </div>
        </div>
      )}

      {groups.map(g => (
        <div key={g.id} className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-sm font-medium text-gray-800"><i className="ti ti-users text-blue-400 mr-1" />{g.name}</span>
              <span className="text-xs text-gray-400 ml-2">{g.member_count || g.members?.length || 0} members</span>
            </div>
            <button onClick={() => deleteGroup(g.id)} className="text-xs text-red-400 hover:text-red-600">
              <i className="ti ti-trash" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(g.members || []).map(m => (
              <span key={m.id || m} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{m.name || m}</span>
            ))}
          </div>
        </div>
      ))}

      {contacts.filter(c => !c.group_id).length > 0 && (
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Individual contacts</div>
          {contacts.filter(c => !c.group_id).map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                {c.name[0]}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">{c.name}</div>
                <div className="text-xs text-gray-400">{c.phone}</div>
              </div>
              <button onClick={() => deleteContact(c.id)} className="text-xs text-red-400 hover:text-red-600">
                <i className="ti ti-trash" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Shared message card ───────────────────────────────────────────────────────
function MessageCard({ m, onDelete }) {
  const recips = m.recipients || [];
  const total  = recips.reduce((s, r) => s + (r.count || 1), 0);
  const dateStr = m.scheduled_at ? new Date(m.scheduled_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'No date';
  const statusColors = {
    scheduled: 'bg-blue-50 text-blue-700',
    sent:      'bg-green-50 text-green-700',
    failed:    'bg-red-50 text-red-700',
    draft:     'bg-gray-100 text-gray-500',
    sending:   'bg-amber-50 text-amber-700',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex gap-3">
        <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {m.media_url
            ? <img src={m.media_url} className="w-full h-full object-cover" alt="" />
            : <i className="ti ti-photo text-gray-300 text-xl" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-800 truncate">
              {recips.map(r => r.label).join(', ')}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${statusColors[m.status] || ''}`}>
              {m.status}
            </span>
          </div>
          <div className="text-xs text-gray-400 mb-1">
            <i className="ti ti-users text-xs mr-1" />{total} contact{total !== 1 ? 's' : ''}
            <span className="mx-1">·</span>
            <i className="ti ti-clock text-xs mr-1" />{dateStr}
            {m.repeat_type !== 'none' && <span className="ml-1">· repeats {m.repeat_type}</span>}
          </div>
          {m.caption && typeof m.caption === 'string' && !m.caption.startsWith('{') && (
            <div className="text-xs text-gray-500 truncate">{m.caption}</div>
          )}
        </div>
      </div>
      {onDelete && ['scheduled','draft'].includes(m.status) && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          <button onClick={onDelete} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
            <i className="ti ti-trash text-xs" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
