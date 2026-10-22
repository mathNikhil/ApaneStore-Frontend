import { useState, useEffect, useRef } from 'react';
import { marketApi, DAILY_LIMIT } from './marketApi';

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
function CartAbandonedTab({ storeId, isConnected }) {
  const API_BASE = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';
  const getToken = () => localStorage.getItem('token') || '';

  const [config, setConfig]   = useState(null);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState('');

  // Local edit state
  const [enabled, setEnabled]         = useState(false);
  const [sendTime, setSendTime]       = useState('12:00');
  const [minCart, setMinCart]         = useState(0);
  const [reminders, setReminders]     = useState([
    { delay_hours: 24, message: 'Hi {name}! You left items worth ₹{total} in your cart. Complete your order here: {link}' }
  ]);

  const VARS = ['{name}', '{total}', '{items}', '{link}'];

  useEffect(() => {
    if (!storeId) return;
    const headers = { Authorization: `Bearer ${getToken()}` };
    Promise.all([
      fetch(`${API_BASE}/api/stores/${storeId}/cart/stats`, { headers }).then(r => r.json()).catch(() => null),
    ]).then(([s]) => {
      if (s?.config) {
        const c = s.config;
        setConfig(c);
        setEnabled(c.enabled || false);
        setSendTime(c.send_time || '12:00');
        setMinCart(c.min_cart_value || 0);
        setReminders(c.reminders?.length ? c.reminders : [
          { delay_hours: 24, message: 'Hi {name}! You left items worth ₹{total} in your cart. Complete your order here: {link}' }
        ]);
      }
      if (s?.stats) setStats(s.stats);
      setLoading(false);
    });
  }, [storeId]);

  const save = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      const body = { enabled, send_time: sendTime, min_cart_value: parseFloat(minCart) || 0, reminders };
      const res = await fetch(`${API_BASE}/api/stores/${storeId}/cart/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json().catch(()=>({}))).error || 'Save failed');
      setConfig(body);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const updateReminder = (idx, field, val) => {
    setReminders(prev => prev.map((r,i) => i===idx ? {...r, [field]: val} : r));
  };

  const addReminder = () => {
    if (reminders.length >= 3) return;
    const lastDelay = reminders[reminders.length-1]?.delay_hours || 24;
    setReminders(prev => [...prev, { delay_hours: lastDelay + 24, message: 'Hi {name}, just a reminder — your cart with ₹{total} worth of items is waiting: {link}' }]);
  };

  const removeReminder = (idx) => {
    if (reminders.length <= 1) return;
    setReminders(prev => prev.filter((_,i) => i!==idx));
  };

  const insertVar = (idx, v) => {
    const el = document.getElementById(`reminder-msg-${idx}`);
    if (!el) { updateReminder(idx, 'message', (reminders[idx].message||'') + v); return; }
    const start = el.selectionStart, end = el.selectionEnd;
    const cur = reminders[idx].message || '';
    updateReminder(idx, 'message', cur.slice(0,start) + v + cur.slice(end));
    setTimeout(() => { el.focus(); el.setSelectionRange(start+v.length, start+v.length); }, 0);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16 text-gray-400">
      <i className="ti ti-loader-2 animate-spin text-2xl mr-2" /> Loading…
    </div>
  );

  // ── Feature-off education screen ──────────────────────────────────────────
  if (!enabled) return (
    <div className="space-y-4">
      {/* Hero card */}
      <div className="bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] border border-[#bbf7d0] rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
            <i className="ti ti-shopping-cart text-[#006d2f] text-2xl" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-semibold text-gray-800">Abandoned Cart Recovery</h2>
              <span className="text-xs bg-[#25D366]/10 text-[#006d2f] px-2 py-0.5 rounded-full font-medium">Auto</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Automatically remind customers who added items to their cart but didn't complete their order — via WhatsApp, sent from your connected number.
            </p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <i className="ti ti-bulb text-amber-500" /> How it works
        </h3>
        <div className="space-y-3">
          {[
            { icon:'ti-clock', color:'text-blue-500', bg:'bg-blue-50', title:'Runs once daily at your chosen time', desc:'Every day at 12:00 PM (or whatever time you set), the system checks for customers with items still in cart.' },
            { icon:'ti-filter', color:'text-purple-500', bg:'bg-purple-50', title:'Only eligible carts are messaged', desc:'Set a minimum cart value (e.g. ₹200) so you only reach out when the order is worth recovering.' },
            { icon:'ti-send', color:'text-[#006d2f]', bg:'bg-[#25D366]/10', title:'Up to 3 reminder messages per customer', desc:'First reminder after 24 hrs, second after 48 hrs, third after 72 hrs. Each with a different message.' },
            { icon:'ti-shield-check', color:'text-orange-500', bg:'bg-orange-50', title:'Shares the 75/day WhatsApp limit', desc:'Cart recovery messages count toward your 75/day cap. If the limit is hit, remaining carts are automatically pushed to the next day — no manual action needed.' },
          ].map((step, i) => (
            <div key={i} className="flex gap-3">
              <div className={`w-8 h-8 rounded-lg ${step.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <i className={`ti ${step.icon} ${step.color} text-sm`} />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">{step.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Variable guide */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <i className="ti ti-code text-gray-400" /> Message variables
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            ['{name}', "Customer's first name"],
            ['{total}', 'Cart total in ₹'],
            ['{items}', 'Item names (first 3)'],
            ['{link}', 'Link to your store'],
          ].map(([v, d]) => (
            <div key={v} className="flex items-start gap-2 bg-gray-50 rounded-lg p-2.5">
              <code className="text-xs font-mono bg-white border border-gray-200 px-1.5 py-0.5 rounded text-[#006d2f] flex-shrink-0">{v}</code>
              <span className="text-xs text-gray-500">{d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* WA not connected warning */}
      {!isConnected && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 text-sm">
          <i className="ti ti-alert-circle text-amber-500" />
          <span className="text-amber-700 text-xs">WhatsApp must be connected before activating cart recovery. Go to Setup → Connect.</span>
        </div>
      )}

      {/* Activate button */}
      <button
        onClick={() => setEnabled(true)}
        className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
      >
        <i className="ti ti-toggle-right text-lg" /> Activate Cart Recovery
      </button>
    </div>
  );

  // ── Config screen (enabled) ───────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Recovered today', value: stats.sent_today ?? '—', icon: 'ti-send', color: 'text-[#006d2f]' },
            { label: 'Queued (overflow)', value: stats.queued ?? '—', icon: 'ti-clock', color: 'text-amber-600' },
            { label: 'Total recovered', value: stats.total_sent ?? '—', icon: 'ti-chart-bar', color: 'text-blue-600' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Toggle */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-gray-800">Cart Recovery</div>
          <div className="text-xs text-gray-400 mt-0.5">Automatically message customers with abandoned carts</div>
        </div>
        <button
          onClick={() => setEnabled(e => !e)}
          className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-[#25D366]' : 'bg-gray-200'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : ''}`} />
        </button>
      </div>

      {/* Send time */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <i className="ti ti-clock mr-1.5 text-gray-400" />Daily send time
        </label>
        <p className="text-xs text-gray-400 mb-3">Reminders go out once a day at this time (IST). If the daily limit is hit, extras are pushed to the next day.</p>
        <input type="time" value={sendTime} onChange={e => setSendTime(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]/30" />
      </div>

      {/* Min cart value */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <i className="ti ti-currency-rupee mr-1.5 text-gray-400" />Minimum cart value
        </label>
        <p className="text-xs text-gray-400 mb-3">Only remind customers whose cart total is at or above this amount. Set to 0 to message everyone.</p>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
          <input type="number" min="0" value={minCart} onChange={e => setMinCart(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]/30" />
        </div>
      </div>

      {/* Reminders */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">
            <i className="ti ti-messages mr-1.5 text-gray-400" />Reminder messages
          </label>
          {reminders.length < 3 && (
            <button onClick={addReminder}
              className="text-xs text-[#006d2f] flex items-center gap-1 hover:underline">
              <i className="ti ti-plus" /> Add reminder
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-4">Each reminder fires after the specified delay from when the customer last updated their cart (or from the previous reminder).</p>

        <div className="space-y-4">
          {reminders.map((r, idx) => (
            <div key={idx} className="border border-gray-100 rounded-xl p-3 bg-gray-50 relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-full w-5 h-5 flex items-center justify-center">{idx+1}</span>
                <span className="text-xs font-medium text-gray-700">Reminder {idx+1}</span>
                {reminders.length > 1 && (
                  <button onClick={() => removeReminder(idx)}
                    className="ml-auto text-red-400 hover:text-red-600 text-xs flex items-center gap-0.5">
                    <i className="ti ti-trash text-xs" />
                  </button>
                )}
              </div>

              <div className="mb-3">
                <label className="text-xs text-gray-500 mb-1 block">Send after (hours since cart updated)</label>
                <div className="flex items-center gap-2">
                  <input type="number" min="1" max="168" value={r.delay_hours}
                    onChange={e => updateReminder(idx, 'delay_hours', parseInt(e.target.value)||24)}
                    className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 bg-white" />
                  <span className="text-xs text-gray-400">hours</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{r.delay_hours >= 24 ? `${(r.delay_hours/24).toFixed(r.delay_hours%24===0?0:1)} day${r.delay_hours/24>1?'s':''}` : `${r.delay_hours}h`}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-gray-500">Message</label>
                  <div className="flex gap-1">
                    {VARS.map(v => (
                      <button key={v} onClick={() => insertVar(idx, v)}
                        className="text-xs font-mono bg-white border border-gray-200 px-1.5 py-0.5 rounded text-[#006d2f] hover:bg-[#25D366]/5 transition-colors">
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  id={`reminder-msg-${idx}`}
                  value={r.message}
                  onChange={e => updateReminder(idx, 'message', e.target.value)}
                  rows={3}
                  placeholder="Hi {name}, you left items worth ₹{total} in your cart…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 bg-white"
                />
                <div className="text-xs text-gray-300 text-right mt-0.5">{r.message?.length || 0} chars</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error / success */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <i className="ti ti-alert-circle" /> {error}
        </div>
      )}
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 flex items-center gap-2">
          <i className="ti ti-circle-check" /> Settings saved successfully
        </div>
      )}

      {/* Save + disable */}
      <div className="flex gap-3">
        <button onClick={save} disabled={saving}
          className="flex-1 bg-[#25D366] hover:bg-[#1ebe5d] disabled:bg-gray-200 text-white rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors">
          {saving ? <><i className="ti ti-loader-2 animate-spin" /> Saving…</> : <><i className="ti ti-device-floppy" /> Save settings</>}
        </button>
        <button onClick={() => { setEnabled(false); }}
          className="px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-colors">
          Disable
        </button>
      </div>

      {/* WA not connected */}
      {!isConnected && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 text-xs text-amber-700">
          <i className="ti ti-alert-circle text-amber-500" />
          WhatsApp is not connected. Cart recovery won't send until you reconnect.
        </div>
      )}
    </div>
  );
}
