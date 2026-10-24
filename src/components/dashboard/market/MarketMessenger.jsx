import { useState, useEffect, useRef } from 'react';
import { marketApi, DAILY_LIMIT } from './marketApi';
import { showSuccess, showError } from '../../../utils/toast';

export default function MarketMessenger({ storeId, subscription, config, onGoSetup, isSubscribed, onGoSetupTab }) {
  const [tab, setTab]               = useState('compose');
  const [messages, setMessages]     = useState([]);
  const [groups, setGroups]         = useState([]);
  const [contacts, setContacts]     = useState([]);
  const [todayCount, setTodayCount] = useState(0);
  const [editingMessage, setEditingMessage] = useState(null);
  const isActive    = true;
  const mode        = config?.mode || 'personal';
  const [isConnected, setIsConnected] = useState(false);
  useEffect(() => {
    if (!storeId) return;
    const checkStatus = () => marketApi.getStatus(storeId).then(r => setIsConnected(r.connected || false)).catch(() => {});
    checkStatus();
    const interval = setInterval(checkStatus, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, [storeId]);

  useEffect(() => {
    if (!storeId) return;
    Promise.all([
      marketApi.getMessages(storeId).catch(() => []),
      marketApi.getGroups(storeId).catch(() => []),
      marketApi.getContacts(storeId).catch(() => []),
    ]).then(([m, g, c]) => {
      setMessages(Array.isArray(m) ? m : []);
      setGroups(Array.isArray(g) ? g : []);
      setContacts(Array.isArray(c) ? c : []);
    });
    if (mode === 'personal') {
      marketApi.getStatus(storeId).then(r => setTodayCount(r.todayCount || 0)).catch(() => {});
    }
  }, [storeId]);

  const refreshAll = async () => {
    const [m, g, c] = await Promise.all([
      marketApi.getMessages(storeId).catch(() => []),
      marketApi.getGroups(storeId).catch(() => []),
      marketApi.getContacts(storeId).catch(() => []),
    ]);
    setMessages(Array.isArray(m) ? m : []);
    setGroups(Array.isArray(g) ? g : []);
    setContacts(Array.isArray(c) ? c : []);
  };

  const subTabs = [
    { key: 'compose',        label: 'Compose',        icon: 'ti-pencil' },
    { key: 'scheduled',      label: 'Scheduled',      icon: 'ti-clock',   count: messages.filter(m => m.status === 'scheduled').length },
    { key: 'contacts',       label: 'Contacts',       icon: 'ti-users' },
    { key: 'cart-abandoned', label: 'Cart Recovery',  icon: 'ti-shopping-cart' },
    { key: 'history',        label: 'History',        icon: 'ti-history' },
  ];

  return (
    <div>
      <div className="flex border-b border-gray-200 mb-4 -mx-4 px-4 bg-white">
        {subTabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs border-b-2 transition-colors whitespace-nowrap
              ${tab === t.key ? 'border-green-500 text-green-600 font-medium' : 'border-transparent text-gray-400'}`}>
            <i className={`ti ${t.icon}`} />
            {t.label}
            {t.count > 0 && <span className="text-xs bg-[#25D366]/10 text-[#006d2f] px-1.5 rounded-full">{t.count}</span>}
          </button>
        ))}
      </div>

      {!isConnected && tab !== 'contacts' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 mb-4 text-sm">
          <i className="ti ti-alert-circle text-amber-500" />
          <span className="text-amber-700">WhatsApp not connected.</span>
          <button onClick={onGoSetup} className="ml-auto text-amber-700 underline text-xs">Setup →</button>
        </div>
      )}

      {tab === 'compose' && (
        <ComposeTab storeId={storeId} mode={mode} groups={groups} contacts={contacts}
          todayCount={todayCount} isConnected={isConnected} config={config}
          editingMessage={editingMessage} onEditDone={() => setEditingMessage(null)}
          onScheduled={() => { refreshAll(); setTab('scheduled'); }}
          isSubscribed={isSubscribed} onGoSetup={onGoSetup} />
      )}
      {tab === 'scheduled' && (
        <ScheduledTab
          messages={messages.filter(m => ['scheduled','draft'].includes(m.status))}
          storeId={storeId} onRefresh={refreshAll}
          subscription={subscription}
          onEdit={(msg) => { setEditingMessage(msg); setTab('compose'); }} />
      )}
      {tab === 'contacts' && (
        <ContactsTab storeId={storeId} groups={groups} contacts={contacts}
          setGroups={setGroups} setContacts={setContacts} onRefresh={refreshAll} />
      )}
      {tab === 'cart-abandoned' && (
        <CartAbandonedTab storeId={storeId} isConnected={isConnected} />
      )}
      {tab === 'history' && (
        <HistoryTab messages={messages.filter(m => ['sent','failed'].includes(m.status))} />
      )}
    </div>
  );
}

// ── ComposeTab ────────────────────────────────────────────────────────────────
function ComposeTab({ storeId, mode, groups, contacts, todayCount, isConnected, config, editingMessage, onEditDone, onScheduled, isSubscribed, onGoSetup }) {
  const [selectedRecips, setSelectedRecips] = useState([]);
  const [photo, setPhoto]     = useState(null);
  const [caption, setCaption] = useState('');
  const [tplVars, setTplVars] = useState({});
  const [sendDate, setSendDate] = useState('');
  const [sendTime, setSendTime] = useState('');
  const [repeat, setRepeat]   = useState('none');
  const [recipSearch, setRecipSearch] = useState('');
  const [showDrop, setShowDrop] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState({});
  const [subPicker, setSubPicker] = useState(null);
  const fileRef = useRef();

  // Pre-fill when editing
  useEffect(() => {
    if (!editingMessage) return;
    setCaption(editingMessage.caption || '');
    setPhoto(editingMessage.media_url ? { url: editingMessage.media_url, preview: editingMessage.media_url } : null);
    if (editingMessage.scheduled_at) {
      // Convert UTC to local time for display
      const localDate = new Date(editingMessage.scheduled_at);
      const pad = n => String(n).padStart(2,'0');
      setSendDate(`${localDate.getFullYear()}-${pad(localDate.getMonth()+1)}-${pad(localDate.getDate())}`);
      setSendTime(`${pad(localDate.getHours())}:${pad(localDate.getMinutes())}`);
    } else {
      setSendDate(''); setSendTime('');
    }
    setRepeat(editingMessage.repeat_type || 'none');
    setSelectedRecips(editingMessage.recipients || []);
  }, [editingMessage]);

  const countTotal = (recips) => recips.reduce((sum, r) => {
    if (r.type === 'group') {
      const g = groups.find(x => x.id === r.id);
      return sum + (g?.member_count || g?.members?.length || 0);
    }
    return sum + 1;
  }, 0);

  const remaining = DAILY_LIMIT - todayCount;
  const recipientCount = countTotal(selectedRecips);

  const allOptions = [
    ...groups.map(g => ({ type:'group', id:g.id, label:g.name, count: g.member_count || g.members?.length || 0 })),
    ...contacts.filter(c => !(Array.isArray(c.groups) && c.groups.length > 0)).map(c => ({ type:'contact', id:c.id, label:c.name, count:1 })),
  ].filter(o => !selectedRecips.find(r => r.type===o.type && r.id===o.id) &&
    o.label.toLowerCase().includes(recipSearch.toLowerCase()));

  const addRecip = (opt) => {
    const newRecips = [...selectedRecips, opt];
    const total = countTotal(newRecips);
    // Allow large groups — they will be auto-batched at schedule time
    if (total > DAILY_LIMIT) {
      const batches = Math.ceil(total / DAILY_LIMIT);
      setErrors(e => ({ ...e, recips: null }));
      // Show info but don't block
    }
    setSelectedRecips(newRecips);
    setRecipSearch(''); setShowDrop(false);
    setErrors(e => ({ ...e, recips: null }));
  };

  const removeRecip = (i) => setSelectedRecips(prev => prev.filter((_,idx) => idx !== i));

  const handlePhoto = async (file) => {
    if (!file) return;
    setUploading(true);
    const preview = URL.createObjectURL(file);
    try {
      const res = await marketApi.uploadPhoto(storeId, file);
      setPhoto({ url: res.url, preview });
      setErrors(e => ({ ...e, photo: null }));
    } catch {
      setErrors(e => ({ ...e, photo: 'Upload failed — try again.' }));
    } finally { setUploading(false); }
  };

  const validate = () => {
    const e = {};
    if (!selectedRecips.length) e.recips = 'Add at least one recipient.';
    if (!photo?.url) e.photo = 'Upload a photo.';
    if (!sendDate || !sendTime) e.date = 'Set a send date and time.';
    if (sendDate && sendTime) {
      const scheduled = new Date(`${sendDate}T${sendTime}`);
      const now = new Date();
      if (scheduled <= now) e.date = `Pick a future time. Now: ${now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
    }
    // Note: >75 contacts handled by auto-batch at schedule time
    setErrors(e);
    return !Object.keys(e).length;
  };

  const save = async (asDraft) => {
    if (!asDraft && !validate()) return;
    setSaving(true);
    try {
      const payload = {
        mode,
        recipients: selectedRecips.map(r => ({ type:r.type, id:r.id, label:r.label, count:r.count })),
        media_url:  photo?.url,
        caption:    mode === 'waba' ? JSON.stringify(tplVars) : caption,
        scheduled_at: sendDate && sendTime ? new Date(`${sendDate}T${sendTime}`).toISOString() : null,
        repeat_type: repeat,
        gap_seconds: config?.gap_seconds || 2,
      };

      if (editingMessage?.id) {
        await marketApi.updateMessage(storeId, editingMessage.id, payload);
        onEditDone && onEditDone();
      } else if (asDraft) {
        await marketApi.saveDraft(storeId, payload);
      } else {
        // Check if total contacts > 75 — auto-split into batches
        const totalCount = selectedRecips.reduce((s, r) => s + (r.count || 1), 0);
        if (totalCount > 75) {
          const batches = Math.ceil(totalCount / 75);
          const confirmed = window.confirm(
            `This message has ${totalCount} contacts.

` +
            `We'll create ${batches} scheduled messages of up to 75 contacts each.
` +
            `This will use ${batches} quota.

` +
            `Confirm?`
          );
          if (!confirmed) { setSaving(false); return; }

          const base = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';
          const token = localStorage.getItem('token');
          const res = await fetch(`${base}/api/tenants/${storeId}/market/messages/batch`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }).then(r => r.json());

          if (!res.success) throw new Error(res.error || 'Batch failed');
        } else {
          await marketApi.createMessage(storeId, payload);
        }
      }
      onScheduled();
    } catch (err) {
      setErrors(e => ({ ...e, form: err.message }));
    } finally { setSaving(false); }
  };

  // Use local date for min date restriction
  const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
    .toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      {/* Daily limit bar */}
      {mode === 'personal' && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-gray-500">Today's limit</span>
            <span className="text-xs font-medium">{todayCount} / {DAILY_LIMIT} sent</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
            <div className={`h-full rounded-full transition-all ${todayCount>=DAILY_LIMIT?'bg-red-400':todayCount>=60?'bg-amber-400':'bg-green-400'}`}
              style={{ width:`${Math.min((todayCount/DAILY_LIMIT)*100,100)}%` }} />
          </div>
          <div className="text-xs text-gray-400">{remaining} remaining · each group member = 1 message · 2s gap between sends</div>
          {recipientCount > 0 && (
            <div className={`text-xs mt-1.5 font-medium ${recipientCount > 75 ? 'text-blue-600' : 'text-green-600'}`}>
              {recipientCount > 75
                ? `${recipientCount} contacts → ${Math.ceil(recipientCount/75)} batches of 75 · Uses ${Math.ceil(recipientCount/75)} quota`
                : `${recipientCount} contact${recipientCount!==1?'s':''} · ${remaining-recipientCount} daily remaining after send`
              }
            </div>
          )}
        </div>
      )}

      {/* Recipients */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <label className="text-xs text-gray-500 block mb-2">
          Recipients — groups or contacts <span className="text-gray-400">(max {DAILY_LIMIT}/day total)</span>
        </label>
        <div className="min-h-10 border border-gray-200 rounded-lg p-2 flex flex-wrap gap-1.5 cursor-text"
          onClick={() => setShowDrop(true)}>
          {selectedRecips.map((r,i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-[#25D366]/10 text-[#006d2f] text-xs px-2.5 py-1 rounded-full">
              <span className="material-symbols-outlined text-xs" style={{fontSize:'13px'}}>
                {r.type==='group' ? 'group' : 'person'}
              </span>
              {r.label} <span className="opacity-60">({r.count})</span>
              <button onClick={e=>{e.stopPropagation();removeRecip(i)}} className="ml-0.5 hover:text-red-500">×</button>
            </span>
          ))}
          <input value={recipSearch} onChange={e=>{setRecipSearch(e.target.value);setShowDrop(true);}}
            onFocus={()=>setShowDrop(true)} onBlur={()=>setTimeout(()=>setShowDrop(false),180)}
            placeholder={selectedRecips.length?'':'Search groups or contacts…'}
            className="flex-1 min-w-32 border-none outline-none text-sm bg-transparent" />
        </div>
        {showDrop && allOptions.length > 0 && (
          <div className="border border-gray-200 rounded-lg mt-1 bg-white overflow-hidden shadow-sm">
            {allOptions.map((o,i) => {
              const wouldExceed = countTotal([...selectedRecips, o]) > DAILY_LIMIT;
              const isLargeGroup = o.type === 'group' && o.count > DAILY_LIMIT;
              const groupMembers = o.type === 'group'
                ? contacts.filter(c => c.groups?.some(cg => cg.id === o.id))
                : [];
              return (
                <div key={i}>
                  {/* Group or ungrouped contact row */}
                  <div onMouseDown={()=>addRecip(o)}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer text-sm
                      ${wouldExceed && !isLargeGroup ? 'opacity-40 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50'}
                      ${o.type==='group' ? 'bg-[#25D366]/10 border-b border-[#bbcbb9]' : ''}`}>
                    <span className="flex items-center gap-2">
                      <span className={`material-symbols-outlined ${o.type==='group'?'text-[#006d2f]':'text-gray-400'}`} style={{fontSize:'16px'}}>
                        {o.type==='group' ? 'group' : 'person'}
                      </span>
                      <span className={o.type==='group' ? 'font-medium text-[#005523]' : 'text-gray-700'}>{o.label}</span>
                      {isLargeGroup && <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">Auto-batch</span>}
                    </span>
                    <span className={`text-xs ${wouldExceed && !isLargeGroup ? 'text-red-500' : 'text-gray-400'}`}>
                      {o.count} contact{o.count!==1?'s':''}
                      {wouldExceed && !isLargeGroup ? ' ⚠️' : ''}
                    </span>
                  </div>
                  {/* Sub-contacts under group */}
                  {o.type === 'group' && groupMembers.length > 0 && (
                    <div className="bg-white">
                      {groupMembers.slice(0, 5).map(c => (
                        <div key={c.id} className="flex items-center gap-2 px-6 py-1.5 text-xs text-gray-500 border-b border-gray-50">
                          <span className="material-symbols-outlined text-gray-300" style={{fontSize:'12px'}}>person</span>
                          <span>{c.name}</span>
                          <span className="text-gray-300 ml-auto">{c.phone}</span>
                        </div>
                      ))}
                      {groupMembers.length > 5 && (
                        <div className="px-6 py-1 text-xs text-gray-400 border-b border-gray-50">
                          +{groupMembers.length - 5} more contacts
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {errors.recips && <p className="text-xs text-red-500 mt-1">{errors.recips}</p>}

        {/* Sub-picker for large groups */}
        {subPicker && (
          <div className="mt-2 border border-[#bbcbb9] rounded-xl bg-[#25D366]/10 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-[#005523]">
                "{subPicker.group.label}" has {subPicker.members.length} contacts — select up to {DAILY_LIMIT - countTotal(selectedRecips)}
              </div>
              <button onClick={() => setSubPicker(null)} className="text-xs text-gray-400">✕</button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 mb-2">
              {subPicker.members.map(c => {
                const selected = subPicker.selected.find(s => s.id === c.id);
                const remaining = DAILY_LIMIT - countTotal(selectedRecips) - subPicker.selected.length;
                return (
                  <label key={c.id} className="flex items-center gap-2 px-2 py-1.5 bg-white rounded-lg cursor-pointer hover:bg-[#25D366]/10">
                    <input type="checkbox" checked={!!selected}
                      disabled={!selected && remaining <= 0}
                      onChange={e => {
                        if (e.target.checked) {
                          setSubPicker(p => ({...p, selected: [...p.selected, c]}));
                        } else {
                          setSubPicker(p => ({...p, selected: p.selected.filter(s => s.id !== c.id)}));
                        }
                      }} />
                    <span className="text-sm text-gray-800 flex-1">{c.name}</span>
                    <span className="text-xs text-gray-400">{c.phone}</span>
                  </label>
                );
              })}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#006d2f]">{subPicker.selected.length} selected</span>
              <button onClick={addSubPickerContacts} disabled={subPicker.selected.length === 0}
                className="text-xs bg-[#25D366] text-white px-3 py-1.5 rounded-lg disabled:opacity-50">
                Add {subPicker.selected.length} contacts
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Photo */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <label className="text-xs text-gray-500 block mb-2">Photo / image</label>
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center cursor-pointer overflow-hidden flex-shrink-0"
            onClick={()=>fileRef.current.click()}>
            {photo?.preview ? <img src={photo.preview} className="w-full h-full object-cover" alt="Preview" />
              : uploading ? <i className="ti ti-loader text-gray-400 text-xl animate-spin" />
              : <i className="ti ti-photo text-gray-300 text-2xl" />}
          </div>
          <div>
            <button onClick={()=>fileRef.current.click()}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 flex items-center gap-1.5">
              <i className="ti ti-upload text-sm" /> Upload photo
            </button>
            <div className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · max 3MB</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e=>handlePhoto(e.target.files[0])} />
        </div>
        {errors.photo && <p className="text-xs text-red-500 mt-1">{errors.photo}</p>}
      </div>

      {/* Caption */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {mode === 'personal' ? (
          <>
            <label className="text-xs text-gray-500 block mb-2">Caption / message</label>
            <textarea value={caption} onChange={e=>setCaption(e.target.value)}
              placeholder="Write your message here…" rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg p-2.5 resize-none outline-none focus:border-green-400" />
          </>
        ) : (
          <>
            <label className="text-xs text-gray-500 block mb-1">Template variables</label>
            <div className="text-xs text-gray-400 mb-3">Template: <strong>{config?.template_name}</strong></div>
            {['1','2','3'].map(k => (
              <div key={k} className="mb-2">
                <label className="text-xs text-gray-400 mb-1 block">Variable {`{{${k}}}`}</label>
                <input type="text" value={tplVars[k]||''} onChange={e=>setTplVars(p=>({...p,[k]:e.target.value}))}
                  placeholder={k==='1'?'Customer name':k==='2'?'Store name':'Message body'}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none" />
              </div>
            ))}
          </>
        )}
      </div>

      {/* Schedule */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <label className="text-xs text-gray-500 block mb-2">Schedule</label>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Send date</label>
            <input type="date" value={sendDate} onChange={e=>setSendDate(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Send time</label>
            <input type="time" value={sendTime} onChange={e=>setSendTime(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none" />
          </div>
        </div>
        {errors.date && <p className="text-xs text-red-500 mb-2">{errors.date}</p>}
        <div>
          <label className="text-xs text-gray-400 block mb-1">Repeat</label>
          <select value={repeat} onChange={e=>setRepeat(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none">
            <option value="none">Send once — no repeat</option>
            <option value="weekly">Every week</option>
            <option value="monthly">Every month</option>
          </select>
        </div>
      </div>

      {errors.form && <p className="text-xs text-red-500 px-1">{errors.form}</p>}

      <div className="flex gap-3 justify-end pb-4">
        <button onClick={()=>save(true)} disabled={saving}
          className="text-sm border border-gray-300 rounded-xl px-4 py-2.5 hover:bg-gray-50 flex items-center gap-1.5 disabled:opacity-60">
          <i className="ti ti-device-floppy" /> {editingMessage ? 'Update draft' : 'Save draft'}
        </button>
        {isSubscribed ? (
          <button onClick={()=>save(false)} disabled={saving||!isConnected}
            className="text-sm bg-[#25D366] text-white rounded-xl px-5 py-2.5 hover:bg-[#1db954] flex items-center gap-1.5 disabled:opacity-60">
            {saving ? <i className="ti ti-loader animate-spin" /> : <i className="ti ti-brand-whatsapp" />}
            {editingMessage ? 'Update & schedule' : 'Schedule message'}
          </button>
        ) : (
          <button onClick={() => { console.log('Activate clicked, onGoSetup:', typeof onGoSetup); if (onGoSetup) onGoSetup(); }}
            className="text-sm bg-[#25D366] text-white rounded-xl px-5 py-2.5 hover:bg-[#1db954] flex items-center gap-1.5">
            <i className="ti ti-lock" /> Activate to schedule
          </button>
        )}
      </div>
    </div>
  );
}

// ── ScheduledTab ──────────────────────────────────────────────────────────────
function ScheduledTab({ messages, storeId, onRefresh, onEdit, subscription }) {
  const quotaUsed = subscription?.quota_used || 0;
  const quotaLimit = subscription?.max_scheduled || 0;
  const quotaPct = quotaLimit > 0 ? Math.min((quotaUsed / quotaLimit) * 100, 100) : 0;
  const quotaColor = quotaPct >= 80 ? 'bg-red-400' : quotaPct >= 50 ? 'bg-amber-400' : 'bg-green-400';
  const deleteMsg = async (id) => {
    await marketApi.deleteMessage(storeId, id).catch(() => {});
    onRefresh();
  };
  if (!messages.length) return (
    <div className="text-center py-12 text-gray-400">
      <i className="ti ti-clock text-3xl block mb-2" />
      <div className="text-sm">No scheduled messages yet.</div>
      <div className="text-xs mt-1">Compose a message and save as draft.</div>
    </div>
  );
  return (
    <div className="space-y-3">
      {/* Quota bar */}
      {quotaLimit > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Schedule quota</span>
            <span className="text-xs text-gray-500">{quotaUsed} / {quotaLimit} used</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${quotaColor}`}
              style={{ width: `${quotaPct}%` }} />
          </div>
          {quotaPct >= 80 && quotaUsed < quotaLimit && (
            <p className="text-xs text-red-500 mt-1">Only {quotaLimit - quotaUsed} send{quotaLimit - quotaUsed !== 1 ? 's' : ''} remaining</p>
          )}
          {subscription?.expires_at && (
            <p className="text-xs text-gray-400 mt-1">
              Expires {new Date(subscription.expires_at).toLocaleDateString(navigator.language || 'en-IN', {day:'numeric', month:'short', year:'numeric'})}
              {subscription.days_remaining > 0 ? ` · ${subscription.days_remaining} days left` : ' · Expired'}
            </p>
          )}
        </div>
      )}

      {messages.map(m => (
        <MessageCard key={m.id} m={m}
          onDelete={() => deleteMsg(m.id)}
          onEdit={() => onEdit && onEdit(m)} />
      ))}
    </div>
  );
}

// ── HistoryTab ────────────────────────────────────────────────────────────────
function HistoryTab({ messages }) {
  if (!messages.length) return (
    <div className="text-center py-12 text-gray-400">
      <i className="ti ti-history text-3xl block mb-2" />
      <div className="text-sm">Sent messages will appear here.</div>
    </div>
  );
  return (
    <div className="space-y-3">
      {messages.map(m => <MessageCard key={m.id} m={m} />)}
    </div>
  );
}

// ── ContactsTab ───────────────────────────────────────────────────────────────
function ContactsTab({ storeId, groups, contacts, setGroups, setContacts, onRefresh }) {
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddGroup, setShowAddGroup]     = useState(false);
  const [newName, setNewName]   = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newGrpId, setNewGrpId] = useState('');
  const [grpName, setGrpName]   = useState('');
  const [csvGroupId, setCsvGroupId] = useState('');
  const [csvImporting, setCsvImporting] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [editGroup, setEditGroup]     = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };
  const SortIcon = ({ col }) => sortBy === col
    ? <span className="ml-1 text-[#006d2f]">{sortDir === 'asc' ? '↑' : '↓'}</span>
    : <span className="ml-1 text-gray-300">↕</span>;
  const [selectedContacts, setSelectedContacts] = useState([]);

  const toggleSelect = (id) => setSelectedContacts(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );
  const toggleSelectAll = () => setSelectedContacts(prev =>
    prev.length === contacts.length ? [] : contacts.map(c => c.id)
  );
  const bulkDelete = async () => {
    if (!selectedContacts.length) return;
    if (!window.confirm(`Delete ${selectedContacts.length} contact(s)?`)) return;
    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';
    for (const id of selectedContacts) {
      await fetch(`${base}/api/tenants/${storeId}/market/contacts/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    setSelectedContacts([]);
    await onRefresh();
  };

  const saveContact = async () => {
    if (!newName || !newPhone) return;
    const payload = { name: newName, phone: newPhone };
    if (newGrpId) payload.group_ids = [parseInt(newGrpId)];
    const res = await marketApi.createContact(storeId, payload).catch(() => null);
    if (res?.id) {
      await onRefresh();
      setNewName(''); setNewPhone(''); setNewGrpId('');
      setShowAddContact(false);
    }
  };

  const saveGroup = async () => {
    if (!grpName) return;
    const res = await marketApi.createGroup(storeId, { name: grpName }).catch(() => null);
    if (res?.id) {
      setGroups(prev => [...prev, { ...res, members: [], member_count: 0 }]);
      setGrpName(''); setShowAddGroup(false);
    }
  };

  const updateContact = async () => {
    if (!editContact?.name || !editContact?.phone) return;
    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';
    await fetch(`${base}/api/tenants/${storeId}/market/contacts/${editContact.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editContact.name,
        phone: editContact.phone,
        group_ids: editContact.group_ids || [],
      }),
    }).catch(() => {});
    await onRefresh();
    setEditContact(null);
  };

  const updateGroup = async () => {
    if (!editGroup?.name) return;
    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';
    await fetch(`${base}/api/tenants/${storeId}/market/groups/${editGroup.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editGroup.name }),
    }).catch(() => {});
    await onRefresh();
    setEditGroup(null);
  };

  const handleCSVImport = async (file) => {
    if (!file) return;
    setCsvImporting(true);
    const text = await file.text();
    const lines = text.split('\n').filter(l => l.trim());
    let imported = 0; let skipped = 0;
    const start = lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('phone') ? 1 : 0;
    for (let i = start; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length < 2) continue;
      const name = parts[0]?.trim().replace(/"/g, '');
      let phone = parts[1]?.trim().replace(/[^0-9]/g, '');
      if (!name || !phone || phone.length < 8) continue;
      if (phone.length === 10) phone = '91' + phone;
      const payload = { name, phone };
      if (csvGroupId) payload.group_ids = [parseInt(csvGroupId)];
      try {
        const res = await marketApi.createContact(storeId, payload);
        if (res?.id) imported++; else skipped++;
      } catch { skipped++; }
    }
    await onRefresh();
    setCsvImporting(false);
    alert(`✅ Imported ${imported} contacts.${skipped > 0 ? ` ${skipped} skipped (duplicates/invalid).` : ''}`);
  };

  return (
    <div className="space-y-4">

      {/* ── STEP 1: Groups ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Step 1 — Create a group first
          </div>
          <button onClick={() => setShowAddGroup(v => !v)}
            className="text-xs bg-[#25D366] text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-[#1db954]">
            <i className="ti ti-plus" /> New group
          </button>
        </div>
        {showAddGroup && (
          <div className="flex gap-2 mb-2">
            <input value={grpName} onChange={e=>setGrpName(e.target.value)}
              placeholder="Group name" onKeyDown={e=>e.key==='Enter'&&saveGroup()}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 flex-1 outline-none" />
            <button onClick={saveGroup} className="text-xs bg-[#25D366] text-white px-3 py-1.5 rounded-lg">Save</button>
            <button onClick={()=>setShowAddGroup(false)} className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg">Cancel</button>
          </div>
        )}
        {groups.length === 0 ? (
          <div className="text-xs text-gray-400 text-center py-3">No groups yet. Create one to organise your contacts.</div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {groups.map(g => {
              const count = contacts.filter(c => c.groups?.some(cg => cg.id === g.id)).length;
              return (
                <div key={g.id} className="flex-shrink-0 bg-[#25D366]/5 border border-[#bbcbb9] rounded-xl px-3 py-2 min-w-[80px]">
                  {editGroup?.id === g.id ? (
                    <div className="flex gap-1">
                      <input value={editGroup.name} onChange={e=>setEditGroup(p=>({...p,name:e.target.value}))}
                        className="text-xs border border-gray-300 rounded px-1 py-0.5 w-20 outline-none" />
                      <button onClick={updateGroup} className="text-xs text-green-600">✓</button>
                      <button onClick={() => setEditGroup(null)} className="text-xs text-gray-400">×</button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs font-semibold text-[#005523] truncate">{g.name}</div>
                      <div className="text-xl font-bold text-[#006d2f] mt-0.5">{count}</div>
                      <div className="text-xs text-gray-400">contacts</div>
                      <div className="flex gap-1 mt-1.5">
                        <button onClick={() => setEditGroup({id:g.id, name:g.name})}
                          className="text-xs text-[#25D366] hover:text-[#006d2f] p-0.5">
                          <i className="ti ti-edit text-xs" />
                        </button>
                        <button onClick={() => marketApi.deleteGroup(storeId, g.id).then(onRefresh)}
                          className="text-xs text-red-400 hover:text-red-600 p-0.5 ml-auto">
                          <i className="ti ti-trash text-xs" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── STEP 2: Import CSV ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Step 2 — Import contacts via CSV
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={csvGroupId} onChange={e => setCsvGroupId(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none flex-1 min-w-32 bg-white">
            <option value="">— Select group * —</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <label className={`text-xs rounded-lg px-3 py-1.5 flex items-center gap-1 cursor-pointer whitespace-nowrap
            ${csvImporting||!csvGroupId ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#25D366] text-white hover:bg-[#1db954]'}`}>
            <i className="ti ti-file-upload" /> {csvImporting ? 'Importing...' : 'Import CSV'}
            <input type="file" accept=".csv" className="hidden" disabled={csvImporting || !csvGroupId}
              onChange={e => {
                if (!csvGroupId) { alert('Please select a group first.'); return; }
                if(e.target.files[0]) handleCSVImport(e.target.files[0]);
                e.target.value='';
              }} />
          </label>
          <a href="data:text/csv;charset=utf-8,Name%2CPhone%0APriya%20Sharma%2C919876543210"
            download="contacts_template.csv"
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 flex items-center gap-1 whitespace-nowrap">
            <i className="ti ti-download" /> Template
          </a>
        </div>
        {!csvGroupId && groups.length > 0 && (
          <p className="text-xs text-amber-600 mt-1.5">⚠ Select a group above to enable CSV import</p>
        )}
        {groups.length === 0 && (
          <p className="text-xs text-red-500 mt-1.5">⚠ Create a group first before importing contacts</p>
        )}
      </div>



      {/* All contacts table */}
      {/* Add contact form — appears below button when clicked */}
      {showAddContact && (
        <div className="bg-white rounded-xl border border-[#25D366] p-4 space-y-3">
          <div className="text-xs font-semibold text-[#006d2f] uppercase tracking-wider">Add new contact</div>
          <div className="grid grid-cols-2 gap-3">
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Full name"
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none" />
            <input value={newPhone} onChange={e=>setNewPhone(e.target.value)} placeholder="919876543210"
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none" />
          </div>
          <select value={newGrpId} onChange={e=>setNewGrpId(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none">
            <option value="">— Select group —</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <div className="flex gap-2 justify-end">
            <button onClick={()=>setShowAddContact(false)}
              className="text-xs border border-gray-200 rounded-lg px-4 py-2">Cancel</button>
            <button onClick={saveContact}
              className="text-xs bg-[#25D366] text-white rounded-lg px-4 py-2 hover:bg-[#1db954]">
              Save contact
            </button>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Step 3 — All contacts ({contacts.length})
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAddContact(v => !v)}
              className="text-xs bg-[#25D366] text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-[#1db954]">
              <i className="ti ti-user-plus" /> Add contact
            </button>
            
          </div>
        </div>
        {contacts.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs bg-white rounded-xl border border-gray-200">
            No contacts yet. Add manually or import CSV.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {selectedContacts.length > 0 && (
              <div className="flex items-center justify-between px-3 py-2 bg-red-50 border-b border-red-100">
                <span className="text-xs text-red-600 font-medium">{selectedContacts.length} selected</span>
                <button onClick={bulkDelete}
                  className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 flex items-center gap-1">
                  <i className="ti ti-trash" /> Delete selected
                </button>
              </div>
            )}
            <div className="grid grid-cols-12 gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <div className="col-span-1">
                <input type="checkbox"
                  checked={selectedContacts.length === contacts.length && contacts.length > 0}
                  onChange={toggleSelectAll}
                  className="w-3.5 h-3.5 accent-[#25D366] cursor-pointer" />
              </div>
              <div className="col-span-2 cursor-pointer select-none flex items-center" onClick={()=>handleSort('name')}>Name<SortIcon col="name"/></div>
              <div className="col-span-3 cursor-pointer select-none flex items-center" onClick={()=>handleSort('phone')}>Phone<SortIcon col="phone"/></div>
              <div className="col-span-2 cursor-pointer select-none flex items-center" onClick={()=>handleSort('group')}>Group<SortIcon col="group"/></div>
              <div className="col-span-2 cursor-pointer select-none flex items-center" onClick={()=>handleSort('store')}>Store<SortIcon col="store"/></div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            <div className="divide-y divide-gray-50">
              {[...contacts].sort((a,b) => {
                let cmp = 0;
                if (sortBy==='name') cmp = (a.name||'').localeCompare(b.name||'');
                else if (sortBy==='phone') cmp = (a.phone||'').localeCompare(b.phone||'');
                else if (sortBy==='group') cmp = ((a.groups?.[0]?.name||'zzz').localeCompare(b.groups?.[0]?.name||'zzz'));
                else if (sortBy==='store') cmp = ((a.store_name||'zzz').localeCompare(b.store_name||'zzz'));
                return sortDir === 'asc' ? cmp : -cmp;
              }).map(c => (
                <div key={c.id}>
                  {editContact?.id === c.id ? (
                    <div className="px-3 py-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input value={editContact.name} onChange={e=>setEditContact(p=>({...p,name:e.target.value}))}
                          className="text-xs border border-gray-300 rounded px-2 py-1.5 outline-none" placeholder="Name"/>
                        <input value={editContact.phone} onChange={e=>setEditContact(p=>({...p,phone:e.target.value}))}
                          className="text-xs border border-gray-300 rounded px-2 py-1.5 outline-none" placeholder="Phone"/>
                      </div>
                      <select value={editContact.group_ids?.[0]||''} onChange={e=>setEditContact(p=>({...p,group_ids:e.target.value?[parseInt(e.target.value)]:[]}))}
                        className="text-xs border border-gray-300 rounded px-2 py-1.5 outline-none w-full">
                        <option value="">— No group —</option>
                        {groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                      <div className="flex gap-2">
                        <button onClick={updateContact} className="text-xs bg-green-500 text-white px-3 py-1.5 rounded flex-1">Save</button>
                        <button onClick={()=>setEditContact(null)} className="text-xs border border-gray-200 px-3 py-1.5 rounded">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-12 gap-1 px-3 py-2.5 items-center hover:bg-gray-50">
                      <div className="col-span-1">
                        <input type="checkbox"
                          checked={selectedContacts.includes(c.id)}
                          onChange={() => toggleSelect(c.id)}
                          className="w-3.5 h-3.5 accent-[#25D366] cursor-pointer" />
                      </div>
                      <div className="col-span-2 text-sm font-medium text-gray-800 truncate">{c.name}</div>
                      <div className="col-span-3 text-xs text-gray-400 truncate">{c.phone}</div>
                      <div className="col-span-2">
                        {c.groups?.length > 0 ? (
                          <span className="text-xs bg-[#25D366]/10 text-[#006d2f] px-1.5 py-0.5 rounded-full truncate inline-block max-w-full">
                            {c.groups[0].name}
                          </span>
                        ) : <span className="text-xs text-gray-300">—</span>}
                      </div>
                      <div className="col-span-2">
                        {c.store_name ? (
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full truncate block">
                            {c.store_name}
                          </span>
                        ) : <span className="text-xs text-gray-300">—</span>}
                      </div>
                      <div className="col-span-2 flex gap-1 justify-end">
                        <button onClick={()=>setEditContact({id:c.id,name:c.name,phone:c.phone,group_ids:(c.groups||[]).map(g=>g.id)})}
                          className="text-xs bg-[#25D366]/10 text-[#006d2f] border border-[#bbcbb9] rounded px-1.5 py-1 hover:bg-[#25D366]/20 flex-shrink-0">
                          Edit
                        </button>
                        <button onClick={()=>marketApi.deleteContact(storeId,c.id).then(onRefresh)}
                          className="text-xs bg-red-50 text-red-500 border border-red-200 rounded px-1.5 py-1 hover:bg-red-100 flex-shrink-0">
                          Del
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {contacts.length === 0 && groups.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <i className="ti ti-users text-3xl block mb-2" />
          <div className="text-sm">No contacts yet.</div>
          <div className="text-xs mt-1">Add manually or import from CSV.</div>
        </div>
      )}
    </div>
  );
}

// ── MessageCard ───────────────────────────────────────────────────────────────
function MessageCard({ m, onDelete = null, onEdit = null }) {
  const recips = m.recipients || [];
  const total  = recips.reduce((s,r) => s+(r.count||1), 0);
  const dateStr = m.scheduled_at
    ? new Date(m.scheduled_at).toLocaleString(navigator.language || 'en-IN', {
        dateStyle: 'medium', timeStyle: 'short'
        // Uses browser's local timezone automatically
      })
    : 'No date';
  const statusColors = {
    scheduled:'bg-[#25D366]/10 text-[#006d2f]', sent:'bg-green-50 text-green-700',
    failed:'bg-red-50 text-red-700', draft:'bg-gray-100 text-gray-500', sending:'bg-amber-50 text-amber-700'
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex gap-3">
        <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {m.media_url ? <img src={m.media_url} className="w-full h-full object-cover" alt="" />
            : <i className="ti ti-photo text-gray-300 text-xl" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-800 truncate">
              {recips.map(r=>r.label).join(', ') || 'No recipients'}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${statusColors[m.status]||''}`}>
              {m.status}
            </span>
          </div>
          <div className="text-xs text-gray-400 mb-1">
            <i className="ti ti-users text-xs mr-1" />{total} contact{total!==1?'s':''}
            <span className="mx-1">·</span>
            <i className="ti ti-clock text-xs mr-1" />{dateStr}
            {m.repeat_type !== 'none' && <span className="ml-1">· repeats {m.repeat_type}</span>}
          </div>
          {m.caption && typeof m.caption==='string' && !m.caption.startsWith('{') && (
            <div className="text-xs text-gray-500 truncate">{m.caption}</div>
          )}
        </div>
      </div>
      {['scheduled','draft'].includes(m.status) && (onEdit||onDelete) && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          {onEdit && (
            <button onClick={onEdit} className="text-xs text-[#006d2f] hover:text-[#006d2f] flex items-center gap-1 mr-auto">
              <i className="ti ti-edit text-xs" /> Edit
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
              <i className="ti ti-trash text-xs" /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}



// ── CartAbandonedTab ──────────────────────────────────────────────────────────
function CartAbandonedTab({ storeId: tenantId, isConnected }) {
  const API_BASE = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';
  const getToken = () => localStorage.getItem('token') || '';

  // Store selection
  const [stores, setStores]                     = useState([]);
  const [selectedStoreId, setSelectedStoreId]   = useState(null);
  const [storeEnabledMap, setStoreEnabledMap]   = useState({});   // { storeId: bool }
  const [togglingStoreId, setTogglingStoreId]   = useState(null); // which row is saving
  const [stats, setStats]                       = useState(null);
  const [loading, setLoading]                   = useState(true);
  const [saving, setSaving]                     = useState(false);
  const [activeReminderIdx, setActiveReminderIdx] = useState(0);

  // Config state
  const [enabled, setEnabled]     = useState(false);
  const [sendTime, setSendTime]   = useState('12:00');
  const [minCart, setMinCart]     = useState(0);
  const [reminders, setReminders] = useState([
    { delay_hours: 24, message: 'Hi {name}! 🛍️\n\nIt\'s been a day since you added items to your cart.\n\n{items}\n\nWorth ₹{total} — and still waiting for you.\n\nComplete your order whenever you\'re ready:\n{link}' }
  ]);

  const DELAY_OPTIONS = [
    { hours: 0.083, label: '5 min 🧪' },
    { hours: 6,  label: '6 hrs' },
    { hours: 12, label: '12 hrs' },
    { hours: 24, label: '1 day' },
    { hours: 48, label: '2 days' },
    { hours: 72, label: '3 days' },
  ];

  const SAMPLE = { name: 'Priya', total: '1,240', items: 'Kurti, Dupatta, +1 more', link: 'fashionhouse.aapnaestore.com' };

  const previewMessage = (template) =>
    (template || '')
      .replace(/{name}/gi, SAMPLE.name)
      .replace(/{total}/gi, `₹${SAMPLE.total}`)
      .replace(/{items}/gi, SAMPLE.items)
      .replace(/{link}/gi, SAMPLE.link);

  // Load stores on mount + fetch enabled state for each
  useEffect(() => {
    const headers = { Authorization: `Bearer ${getToken()}` };
    fetch(`${API_BASE}/api/stores`, { headers })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.data || data.stores || []);
        const valid = list.filter(s => s.id);
        setStores(valid);
        if (valid.length === 1) {
          setSelectedStoreId(valid[0].id);
        } else {
          setLoading(false);
          // Fetch enabled state for all stores in parallel
          Promise.all(
            valid.map(s =>
              fetch(`${API_BASE}/api/stores/${s.id}/cart/stats`, { headers })
                .then(r => r.json())
                .then(d => ({ id: s.id, enabled: d?.config?.enabled || false }))
                .catch(() => ({ id: s.id, enabled: false }))
            )
          ).then(results => {
            const map = {};
            results.forEach(r => { map[r.id] = r.enabled; });
            setStoreEnabledMap(map);
          });
        }
      })
      .catch(() => setLoading(false));
  }, []);

  // Load config + stats when store selected
  useEffect(() => {
    if (!selectedStoreId) return;
    setLoading(true);
    const headers = { Authorization: `Bearer ${getToken()}` };
    fetch(`${API_BASE}/api/stores/${selectedStoreId}/cart/stats`, { headers })
      .then(r => r.json())
      .then(data => {
        if (data?.config) {
          const c = data.config;
          setEnabled(c.enabled || false);
          setStoreEnabledMap(m => ({ ...m, [selectedStoreId]: c.enabled || false }));
          setSendTime(c.send_time || '12:00');
          setMinCart(c.min_cart_value ?? 0);
          setReminders(c.reminders?.length ? c.reminders : [
            { delay_hours: 24, message: 'Hi {name}! 🛍️\n\nIt\'s been a day since you added items to your cart.\n\n{items}\n\nWorth ₹{total} — and still waiting for you.\n\nComplete your order whenever you\'re ready:\n{link}' }
          ]);
        }
        if (data?.stats) setStats(data.stats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedStoreId]);

  // Toggle enabled for a store directly from the store list
  const toggleStoreEnabled = async (e, storeId, currentVal) => {
    e.stopPropagation();
    setTogglingStoreId(storeId);
    const newVal = !currentVal;
    try {
      // We need the full config to do a proper save — fetch it first
      const headers = { Authorization: `Bearer ${getToken()}` };
      const d = await fetch(`${API_BASE}/api/stores/${storeId}/cart/stats`, { headers }).then(r => r.json());
      const c = d?.config || {};
      const body = {
        enabled: newVal,
        send_time: c.send_time || '12:00',
        min_cart_value: c.min_cart_value ?? 0,
        reminders: c.reminders?.length ? c.reminders : [
          { delay_hours: 24, message: 'Hi {name}! You left ₹{total} worth of items in your cart.\n\n{items} — still waiting for you 🛍️\n\nComplete your order: {link}' }
        ],
      };
      const res = await fetch(`${API_BASE}/api/stores/${storeId}/cart/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Save failed');
      setStoreEnabledMap(m => ({ ...m, [storeId]: newVal }));
      if (storeId === selectedStoreId) setEnabled(newVal);
      showSuccess(newVal ? 'Cart recovery enabled' : 'Cart recovery disabled');
      // Navigate into config when enabling
      if (newVal) setSelectedStoreId(storeId);
    } catch (err) {
      showError(err.message);
    } finally {
      setTogglingStoreId(null);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const body = { enabled, send_time: sendTime, min_cart_value: parseFloat(minCart) || 0, reminders };
      const res = await fetch(`${API_BASE}/api/stores/${selectedStoreId}/cart/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Save failed');
      setStoreEnabledMap(m => ({ ...m, [selectedStoreId]: enabled }));
      showSuccess('Settings saved');
    } catch (e) { showError(e.message); }
    finally { setSaving(false); }
  };

  const updateReminder = (idx, field, val) =>
    setReminders(prev => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r));

  const addReminder = () => {
    const newIdx = reminders.length;
    setReminders(prev => [...prev, {
      delay_hours: prev[prev.length - 1]?.delay_hours + 24 || 48,
      message: 'Hi {name}, still thinking? Your cart has ₹{total} worth of items waiting: {link}'
    }]);
    setActiveReminderIdx(newIdx);
  };

  const removeReminder = (idx) => {
    if (reminders.length <= 1) return;
    setReminders(prev => prev.filter((_, i) => i !== idx));
    setActiveReminderIdx(Math.max(0, idx - 1));
  };

  const insertVar = (idx, v) => {
    const el = document.getElementById(`reminder-msg-${idx}`);
    if (!el) { updateReminder(idx, 'message', (reminders[idx].message || '') + v); return; }
    const start = el.selectionStart, end = el.selectionEnd;
    const cur = reminders[idx].message || '';
    updateReminder(idx, 'message', cur.slice(0, start) + v + cur.slice(end));
    setTimeout(() => { el.focus(); el.setSelectionRange(start + v.length, start + v.length); }, 0);
  };

  // ── WA message bubble component ──────────────────────────────────────────
  const WaBubble = ({ text }) => (
    <div className="bg-[#ECE5DD] rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center">
          <i className="ti ti-brand-whatsapp text-white text-sm" />
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-700">Your Store</div>
          <div className="text-xs text-gray-400">via WhatsApp</div>
        </div>
      </div>
      <div className="bg-white rounded-xl rounded-tl-sm p-3 shadow-sm max-w-xs">
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">{text || '…'}</p>
        <div className="flex justify-end mt-1">
          <span className="text-xs text-gray-400">12:00 PM ✓✓</span>
        </div>
      </div>
    </div>
  );

  // ── Store picker ──────────────────────────────────────────────────────────
  if (!loading && !selectedStoreId && stores.length > 1) return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
        <i className="ti ti-building-store text-gray-400" /> Select a store
      </h3>
      <p className="text-xs text-gray-400 mb-4">Cart recovery is configured per store.</p>
      <div className="space-y-2">
        {stores.map(s => {
          const isOn = !!storeEnabledMap[s.id];
          const isToggling = togglingStoreId === s.id;
          return (
            <div key={s.id}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer
                ${isOn ? 'border-[#25D366]/40 bg-[#f0fdf4]' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              onClick={() => setSelectedStoreId(s.id)}>
              <div className="w-9 h-9 rounded-lg bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                {s.logo_url ? <img src={s.logo_url} className="w-full h-full object-cover rounded-lg" alt="" />
                  : <i className="ti ti-building-store text-[#006d2f]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">{s.store_name || s.name}</div>
                <div className="text-xs text-gray-400">{s.subdomain ? `${s.subdomain}.aapnaestore.com` : `Store #${s.id}`}</div>
              </div>
              {/* Toggle */}
              <button
                onClick={e => toggleStoreEnabled(e, s.id, isOn)}
                disabled={isToggling}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 focus:outline-none
                  ${isOn ? 'bg-[#25D366]' : 'bg-gray-200'} ${isToggling ? 'opacity-50' : ''}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                  ${isOn ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
              <i className="ti ti-chevron-right text-gray-300" />
            </div>
          );
        })}
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center py-16 text-gray-400">
      <i className="ti ti-loader-2 animate-spin text-2xl mr-2" /> Loading…
    </div>
  );

  if (!selectedStoreId && stores.length === 0) return (
    <div className="text-center py-12 text-gray-400 text-sm">No stores found. Create a store first.</div>
  );

  const selectedStore = stores.find(s => s.id === selectedStoreId);
  const storeSwitcher = stores.length > 1 && (
    <button onClick={() => { setSelectedStoreId(null); setStats(null); setEnabled(false); }}
      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 mb-3 transition-colors">
      <i className="ti ti-arrow-left text-xs" />
      <span className="font-medium">{selectedStore?.store_name}</span>
      <span className="text-gray-300">· change</span>
    </button>
  );

  // ── Config screen (always shown — toggle at top) ─────────────────────────
  const activeReminder = reminders[activeReminderIdx] || reminders[0];

  return (
    <div className="space-y-4">
      {storeSwitcher}

      {/* Stats — only when enabled and data exists */}
      {stats && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Sent today', value: stats.sent_today ?? 0, color: 'text-[#006d2f]' },
            { label: 'Queued', value: stats.queued ?? 0, color: 'text-amber-600' },
            { label: 'Total sent', value: stats.total_sent ?? 0, color: 'text-blue-600' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#25D366]/15">
          <i className="ti ti-shopping-cart text-base text-[#006d2f]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">Cart Recovery</span>
            <span className="text-xs bg-[#25D366]/15 text-[#006d2f] px-2 py-0.5 rounded-full font-medium">Active</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Auto WhatsApp reminders for abandoned carts</p>
        </div>
      </div>

      {!isConnected && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
          <i className="ti ti-alert-circle text-amber-500 flex-shrink-0" />
          <span className="text-xs text-amber-700">WhatsApp not connected — reminders won't send until you reconnect.</span>
        </div>
      )}

      {/* ── Config sections ── */}
      {<>

      {/* ── Section 1+2: Frequency + Min cart value — single row ── */}
      <div className="grid grid-cols-2 gap-3">

        {/* Send after */}
        <div className="bg-white border border-gray-200 rounded-2xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <i className="ti ti-clock text-gray-400 text-sm" />
            <span className="text-xs font-semibold text-gray-700">Send after</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {DELAY_OPTIONS.map(opt => {
              const active = reminders.some(r => Math.abs(parseFloat(r.delay_hours) - opt.hours) < 0.001);
              return (
                <button key={opt.hours}
                  onClick={() => {
                    if (active) {
                      // remove — keep at least 1
                      if (reminders.length === 1) return;
                      const idx = reminders.findIndex(r => Math.abs(parseFloat(r.delay_hours) - opt.hours) < 0.001);
                      setReminders(r => r.filter((_, i) => i !== idx));
                      setActiveReminderIdx(0);
                    } else {
                      // add with a message tailored to the delay
                      const msgs = {
                        6:  'Hi {name}! 👋\n\nYou left something behind — ₹{total} worth of items are still in your cart:\n\n{items}\n\nHappen to get distracted? No worries, your cart is saved.\n\n👉 Complete your order: {link}',
                        12: 'Hi {name}! ⏰\n\nJust a heads up — the items you picked are still available:\n\n{items}\n\nTotal: ₹{total}\n\nPopular items sell out fast. Secure yours now:\n{link}',
                        24: 'Hi {name}! 🛍️\n\nIt\'s been a day since you added items to your cart.\n\n{items}\n\nWorth ₹{total} — and still waiting for you.\n\nComplete your order whenever you\'re ready:\n{link}',
                        48: 'Hi {name}! 💛\n\nWe noticed you haven\'t completed your order yet.\n\n{items}\n\nTotal: ₹{total}\n\nIf you had any questions or concerns, reply here — we\'re happy to help.\n\nOr go ahead and order: {link}',
                        72: 'Hi {name}! 🔔 Last reminder\n\nYour cart has been saved for 3 days:\n\n{items}\n\nTotal: ₹{total}\n\nWe\'ll clear it soon to make space. Order now if you still want these:\n{link}',
                      };
                      const newR = {
                        delay_hours: opt.hours,
                        message: msgs[opt.hours] || msgs[24],
                      };
                      setReminders(r => {
                        const updated = [...r, newR].sort((a, b) => a.delay_hours - b.delay_hours);
                        setActiveReminderIdx(updated.findIndex(x => Math.abs(parseFloat(x.delay_hours) - opt.hours) < 0.001));
                        return updated;
                      });
                    }
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all
                    ${active
                      ? 'bg-[#25D366] text-white border-[#25D366]'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-[#25D366] hover:text-[#006d2f]'}`}>
                  {active ? <i className="ti ti-x text-[10px]" /> : <i className="ti ti-plus text-[10px]" />}
                  {opt.label}
                </button>
              );
            })}
          </div>
          <div className="text-xs text-gray-400 mb-1">Daily time (IST)</div>
          <input type="time" value={sendTime} onChange={e => setSendTime(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#25D366]/30" />
        </div>

        {/* Min cart value */}
        <div className="bg-white border border-gray-200 rounded-2xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <i className="ti ti-currency-rupee text-gray-400 text-sm" />
            <span className="text-xs font-semibold text-gray-700">Min cart value</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {[0, 100, 200, 500, 1000].map(v => (
              <button key={v}
                onClick={() => setMinCart(v)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all
                  ${parseFloat(minCart) === v
                    ? 'bg-[#25D366] text-white border-[#25D366]'
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-[#25D366] hover:text-[#006d2f]'}`}>
                {v === 0 ? 'All' : `₹${v}+`}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-400 mb-1">Custom amount</div>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
            <input type="number" min="0" value={minCart} onChange={e => setMinCart(e.target.value)}
              placeholder="0"
              className="w-full border border-gray-200 rounded-lg pl-5 pr-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#25D366]/30" />
          </div>
        </div>

      </div>

      {/* ── Section 3: Message templates ── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-800">Message Templates</div>
              <div className="text-xs text-gray-400 mt-0.5">Customise what each reminder says</div>
            </div>
          </div>
        </div>

        {/* Reminder category tabs — styled like email template tabs */}
        <div className="flex gap-2 px-4 pt-3 pb-0 overflow-x-auto">
          {reminders.map((r, idx) => {
            const delayLabel = r.delay_hours < 1
              ? `${Math.round(r.delay_hours * 60)}min`
              : r.delay_hours >= 24
                ? `${r.delay_hours / 24} day${r.delay_hours > 24 ? 's' : ''}`
                : `${r.delay_hours}hrs`;
            const label = idx === 0 ? `🛒 After ${delayLabel}` : idx === 1 ? `⏰ After ${delayLabel}` : `🔔 After ${delayLabel}`;
            return (
              <button key={idx} onClick={() => setActiveReminderIdx(idx)}
                className={`flex-shrink-0 px-3 py-2 rounded-t-lg text-xs font-medium border-b-2 transition-all whitespace-nowrap
                  ${activeReminderIdx === idx
                    ? 'bg-[#25D366]/8 text-[#006d2f] border-[#25D366]'
                    : 'text-gray-400 border-transparent hover:text-gray-600 hover:border-gray-200'}`}>
                {label}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100">

          {/* Timing chips for this reminder */}
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {activeReminderIdx === 0 ? 'Send after cart abandoned for' : `Send after reminder ${activeReminderIdx} by`}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {DELAY_OPTIONS.map(opt => (
                <button key={opt.hours}
                  onClick={() => updateReminder(activeReminderIdx, 'delay_hours', opt.hours)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                    ${activeReminder.delay_hours === opt.hours
                      ? 'bg-[#25D366] text-white border-[#25D366]'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#25D366] hover:text-[#006d2f]'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message + Preview side by side */}
          <div className="grid grid-cols-2 gap-3">

            {/* Left: editor */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">MESSAGE</div>
              <textarea
                id={`reminder-msg-${activeReminderIdx}`}
                value={activeReminder.message}
                onChange={e => updateReminder(activeReminderIdx, 'message', e.target.value)}
                rows={7}
                placeholder="Write your WhatsApp message here…"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 leading-relaxed"
              />
              <div className="text-xs text-gray-300 text-right">{activeReminder.message?.length || 0} chars</div>
              <div className="text-xs text-gray-400">Click to insert:</div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { v: '{name}',  label: '{{name}}' },
                  { v: '{total}', label: '{{total}}' },
                  { v: '{items}', label: '{{items}}' },
                  { v: '{link}',  label: '{{link}}' },
                ].map(({ v, label }) => (
                  <button key={v} onClick={() => insertVar(activeReminderIdx, v)}
                    className="text-xs font-mono bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded-lg hover:border-[#25D366] hover:text-[#006d2f] hover:bg-[#25D366]/5 transition-all">
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: live preview */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">PREVIEW</div>
              <WaBubble text={previewMessage(activeReminder.message)} />
            </div>

          </div>

        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving}
          className="bg-[#25D366] hover:bg-[#1ebe5d] disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl px-5 py-2 text-sm font-semibold flex items-center gap-2 transition-colors">
          {saving ? <><i className="ti ti-loader-2 animate-spin" /> Saving…</> : <><i className="ti ti-device-floppy" /> Save</>}
        </button>
      </div>

      </>}
    </div>
  );
}
