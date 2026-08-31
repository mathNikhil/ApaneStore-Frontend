import React, { useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';

const STEPS = {
  1: ['store_name', 'tagline'],
  2: ['banner_tagline', 'product_description'],
  7: ['about_us'],
};

const TYPE_CONFIG = {
  store_name: { label: 'Store Name', icon: 'storefront', desc: 'Creative names for your store' },
  tagline: { label: 'Tagline', icon: 'format_quote', desc: 'Catchy one-liners for your brand' },
  banner_tagline: { label: 'Banner Text', icon: 'image', desc: 'Bold text for your hero banner' },
  product_description: { label: 'Product Description', icon: 'inventory_2', desc: 'Compelling product copy' },
  about_us: { label: 'About Us', icon: 'info', desc: 'Your brand story' },
};

const CONTEXT_KEY = 'ai_tenant_context';

const AIAssistant = ({ currentStep, brandData }) => {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [typeIndex, setTypeIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);
  const [productName, setProductName] = useState('');
  const [extraContext, setExtraContext] = useState('');

  const [tenantContext, setTenantContext] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CONTEXT_KEY) || '{}'); } catch { return {}; }
  });
  const [editingContext, setEditingContext] = useState(false);
  const [tempBusinessType, setTempBusinessType] = useState('');
  const [tempTargetCustomer, setTempTargetCustomer] = useState('');

  const availableTypes = STEPS[currentStep] || [];
  const selectedType = availableTypes[typeIndex];
  const businessType = brandData?.businessType || brandData?.businessCategory || tenantContext.businessType || '';
  const businessName = brandData?.brandName || brandData?.storeName || tenantContext.businessName || '';

  const saveContext = () => {
    const ctx = { ...tenantContext, businessType: tempBusinessType, targetCustomer: tempTargetCustomer, businessName };
    setTenantContext(ctx);
    localStorage.setItem(CONTEXT_KEY, JSON.stringify(ctx));
    setEditingContext(false);
  };

  const generate = async () => {
    setLoading(true); setError(''); setResults([]);
    try {
      const res = await fetch(`${API}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          businessType: tenantContext.businessType || businessType,
          businessName: tenantContext.businessName || businessName,
          productName,
          targetCustomer: tenantContext.targetCustomer || '',
          extraContext: selectedType === 'about_us'
            ? [
                extraContext,
                tenantContext.storeName ? `Store name: ${tenantContext.storeName}` : '',
                tenantContext.tagline ? `Tagline: ${tenantContext.tagline}` : '',
                tenantContext.bannerTagline ? `Banner theme: ${tenantContext.bannerTagline}` : '',
                tenantContext.productTypes ? `Products: ${tenantContext.productTypes}` : '',
              ].filter(Boolean).join('. ')
            : extraContext,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(Array.isArray(data.data) ? data.data : [data.data.about]);
        // Save what was generated for cross-step context
        const updatedCtx = { ...tenantContext };
        if (selectedType === 'store_name' && data.data[0]) updatedCtx.storeName = data.data[0];
        if (selectedType === 'tagline' && data.data[0]) updatedCtx.tagline = data.data[0];
        if (selectedType === 'banner_tagline' && data.data[0]) updatedCtx.bannerTagline = data.data[0];
        if (selectedType === 'product_description') updatedCtx.productTypes = productName;
        setTenantContext(updatedCtx);
        localStorage.setItem(CONTEXT_KEY, JSON.stringify(updatedCtx));
      }
      else setError(data.error || 'Generation failed.');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  const goNext = () => { if (typeIndex < availableTypes.length - 1) { setTypeIndex(typeIndex + 1); setResults([]); setError(''); setProductName(''); setExtraContext(''); } };
  const goBack = () => { if (typeIndex > 0) { setTypeIndex(typeIndex - 1); setResults([]); setError(''); setProductName(''); setExtraContext(''); } };

  const openAssistant = () => { setOpen(true); setMinimized(false); };

  if (!availableTypes.length) return null;

  return (
    <>
      {/* FAB Button - shows when closed or minimized */}
      {(!open || minimized) && (
        <button onClick={openAssistant}
          className="fixed bottom-24 right-4 z-40 flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all font-semibold text-sm">
          <span className="text-lg">✨</span>
          {minimized ? 'Resume AI' : 'AI Advisor'}
          {minimized && results.length > 0 && <span className="bg-white text-[#006d2f] text-xs font-bold px-1.5 py-0.5 rounded-full">{results.length}</span>}
        </button>
      )}

      {/* Main Widget */}
      {open && !minimized && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#f2f4f7] flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <div>
                  <h2 className="font-bold text-[#191c1e] text-base">AI Writing Assistant</h2>
                  <p className="text-xs text-[#8e9eab]">Text generation • Image assistance coming soon</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setMinimized(true)} title="Minimize" className="text-[#8e9eab] hover:text-[#191c1e] transition-colors">
                  <span className="material-symbols-outlined">minimize</span>
                </button>
                <button onClick={() => { setOpen(false); setMinimized(false); }} className="text-[#8e9eab] hover:text-[#191c1e] transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Navigation bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#f8f9fb] border-b border-[#f2f4f7] flex-shrink-0">
              <button onClick={goBack} disabled={typeIndex === 0}
                className="flex items-center gap-1 text-xs font-semibold text-[#556067] disabled:opacity-30 hover:text-[#191c1e] transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Back
              </button>
              <div className="flex items-center gap-1">
                {availableTypes.map((_, i) => (
                  <button key={i} onClick={() => { setTypeIndex(i); setResults([]); setError(''); }}
                    className={`w-2 h-2 rounded-full transition-all ${i === typeIndex ? 'bg-[#006d2f] w-4' : 'bg-[#e0e3e6]'}`} />
                ))}
              </div>
              <button onClick={goNext} disabled={typeIndex === availableTypes.length - 1}
                className="flex items-center gap-1 text-xs font-semibold text-[#556067] disabled:opacity-30 hover:text-[#191c1e] transition-colors">
                Next <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-3">

              {/* Store profile */}
              {!editingContext ? (
                <div className="bg-[#f0faf4] rounded-xl p-3 text-xs text-[#556067]">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-[#006d2f]">📋 Your store profile:</p>
                    <button onClick={() => { setEditingContext(true); setTempBusinessType(tenantContext.businessType || businessType); setTempTargetCustomer(tenantContext.targetCustomer || ''); }}
                      className="text-[#006d2f] text-xs underline">Edit</button>
                  </div>
                  {businessName && <p>• Store: <strong>{businessName}</strong></p>}
                  {(tenantContext.businessType || businessType) ? (
                    <p>• Business: <strong>{tenantContext.businessType || businessType}</strong></p>
                  ) : (
                    <p className="text-orange-500">⚠️ <button onClick={() => setEditingContext(true)} className="underline">Add business type</button></p>
                  )}
                  {tenantContext.targetCustomer && <p>• Customers: <strong>{tenantContext.targetCustomer}</strong></p>}
                </div>
              ) : (
                <div className="bg-[#fff8e1] rounded-xl p-3 space-y-2 border border-[#ffe082]">
                  <p className="text-xs font-semibold text-[#856404]">✏️ Your business profile (used for all generations):</p>
                  <input value={tempBusinessType} onChange={e => setTempBusinessType(e.target.value)} placeholder="Business type e.g. shoe store, bakery"
                    className="w-full border border-[#e0e3e6] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006d2f]" />
                  <input value={tempTargetCustomer} onChange={e => setTempTargetCustomer(e.target.value)} placeholder="Target customers e.g. young women, college students"
                    className="w-full border border-[#e0e3e6] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006d2f]" />
                  <div className="flex gap-2">
                    <button onClick={saveContext} className="flex-1 py-2 bg-[#006d2f] text-white rounded-lg text-xs font-semibold">Save & Continue</button>
                    <button onClick={() => setEditingContext(false)} className="py-2 px-3 border border-[#e0e3e6] rounded-lg text-xs text-[#556067]">Cancel</button>
                  </div>
                </div>
              )}

              {/* Current type */}
              {!editingContext && selectedType && (
                <>
                  <div className="bg-[#f0faf4] rounded-xl px-3 py-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#006d2f] text-lg">{TYPE_CONFIG[selectedType].icon}</span>
                    <div>
                      <p className="font-semibold text-sm text-[#191c1e]">{TYPE_CONFIG[selectedType].label}</p>
                      <p className="text-xs text-[#8e9eab]">{TYPE_CONFIG[selectedType].desc}</p>
                    </div>
                  </div>

                  {selectedType === 'product_description' && (
                    <div>
                      <label className="text-xs font-semibold text-[#556067] uppercase tracking-wide block mb-1">Product Name *</label>
                      <input value={productName} onChange={e => setProductName(e.target.value)} placeholder="e.g. Nike Air Max, Handmade Bag"
                        className="w-full border border-[#e0e3e6] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#006d2f]" />
                    </div>
                  )}

                  {selectedType === 'banner_tagline' && (
                    <div>
                      <label className="text-xs font-semibold text-[#556067] uppercase tracking-wide block mb-1">Theme / Season (optional)</label>
                      <input value={extraContext} onChange={e => setExtraContext(e.target.value)}
                        placeholder="e.g. summer sale, new arrivals"
                        className="w-full border border-[#e0e3e6] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#006d2f]" />
                    </div>
                  )}

                  {selectedType === 'about_us' && (
                    <div className="space-y-2">
                      {(tenantContext.tagline || tenantContext.bannerTagline || tenantContext.productTypes) && (
                        <div className="bg-[#e8f5e9] rounded-xl p-3 text-xs text-[#556067]">
                          <p className="font-semibold text-[#006d2f] mb-1">🧠 Using your previous inputs:</p>
                          {tenantContext.tagline && <p>• Tagline: <strong>{tenantContext.tagline}</strong></p>}
                          {tenantContext.bannerTagline && <p>• Banner theme: <strong>{tenantContext.bannerTagline}</strong></p>}
                          {tenantContext.productTypes && <p>• Products: <strong>{tenantContext.productTypes}</strong></p>}
                        </div>
                      )}
                      <div>
                        <label className="text-xs font-semibold text-[#556067] uppercase tracking-wide block mb-1">Extra info (optional)</label>
                        <input value={extraContext} onChange={e => setExtraContext(e.target.value)}
                          placeholder="e.g. family business, est. 2020, award-winning"
                          className="w-full border border-[#e0e3e6] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#006d2f]" />
                      </div>
                    </div>
                  )}

                  {error && <p className="text-red-500 text-xs">{error}</p>}

                  <button onClick={generate} disabled={loading || (selectedType === 'product_description' && !productName)}
                    className="w-full py-3 bg-[#25D366] text-white rounded-xl font-semibold text-sm hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> Generating...</> : <><span className="text-lg">✨</span> Generate</>}
                  </button>

                  {results.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-[#556067] uppercase tracking-wide">✅ Tap to copy — then minimize & paste</p>
                        <button onClick={() => setMinimized(true)} className="text-xs text-[#006d2f] underline flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-sm">minimize</span> Minimize
                        </button>
                      </div>
                      {results.map((result, i) => (
                        <button key={i} onClick={() => copyToClipboard(result, i)}
                          className="w-full text-left px-4 py-3 rounded-xl border border-[#e0e3e6] hover:border-[#006d2f] hover:bg-[#f0faf4] transition-all text-sm text-[#191c1e] flex items-start justify-between gap-2 group">
                          <span className="flex-1">{result}</span>
                          <span className="material-symbols-outlined text-sm text-[#006d2f] flex-shrink-0 mt-0.5">{copied === i ? 'check_circle' : 'content_copy'}</span>
                        </button>
                      ))}
                      <button onClick={generate} disabled={loading} className="w-full py-2 border border-[#e0e3e6] rounded-xl text-sm text-[#556067] hover:border-[#006d2f] hover:text-[#006d2f] transition-all">
                        🔄 Generate different options
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Coming soon */}
              <div className="bg-[#f8f9fb] rounded-xl p-3 flex items-center gap-3 border border-dashed border-[#e0e3e6]">
                <span className="text-2xl">🖼️</span>
                <div>
                  <p className="text-xs font-semibold text-[#191c1e]">Image Generation — Coming Soon</p>
                  <p className="text-xs text-[#8e9eab]">Logo, banner & product images with AI</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
