import React, { useState } from 'react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
  'Dadra & Nagar Haveli', 'Daman & Diu', 'Lakshadweep', 'Andaman & Nicobar Islands'
];

const API_URL = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';

const InvoiceModal = ({ subscription, onClose, onSuccess }) => {
  const [gstStatus, setGstStatus] = useState('not_applicable'); // 'has_gstin' | 'not_applicable'
  const [form, setForm] = useState({
    tenant_business_name: '',
    tenant_gstin: '',
    tenant_address: '',
    tenant_state: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.tenant_business_name.trim()) {
      setError('Please enter your business name'); return;
    }
    if (!form.tenant_address.trim()) {
      setError('Please enter your business address'); return;
    }
    if (!form.tenant_state) {
      setError('Please select your state'); return;
    }
    if (gstStatus === 'has_gstin' && !form.tenant_gstin.trim()) {
      setError('Please enter your GSTIN'); return;
    }

    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      // Step 1: Generate/save invoice details
      const genRes = await fetch(`${API_URL}/api/invoices/${subscription.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          tenant_business_name: form.tenant_business_name,
          tenant_gstin: gstStatus === 'has_gstin' ? form.tenant_gstin : null,
          tenant_address: form.tenant_address,
          tenant_state: form.tenant_state,
        }),
      });
      const genData = await genRes.json();
      if (!genData.success) {
        setError(genData.error || 'Failed to generate invoice'); return;
      }

      // Step 2: Download PDF
      const dlRes = await fetch(`${API_URL}/api/invoices/${subscription.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!dlRes.ok) {
        setError('Failed to download invoice'); return;
      }

      const blob = await dlRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${genData.data.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      onSuccess?.();
      onClose();
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e0e3e6]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#006d2f]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#006d2f] text-base">receipt_long</span>
            </div>
            <div>
              <h2 className="font-bold text-[#191c1e] text-sm">Download Invoice</h2>
              <p className="text-xs text-[#556067]">Fill in your details for GST invoice</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f2f4f7]">
            <span className="material-symbols-outlined text-[#556067] text-base">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* Subscription info */}
          <div className="p-3 bg-[#f2f4f7] rounded-xl text-xs text-[#556067] space-y-1">
            <p><span className="font-medium text-[#191c1e]">Store:</span> {subscription.store_name}</p>
            <p><span className="font-medium text-[#191c1e]">Plan:</span> {subscription.plan_name || subscription.plan_key}</p>
            <p><span className="font-medium text-[#191c1e]">Amount:</span> ₹{parseFloat(subscription.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            <p><span className="font-medium text-[#191c1e]">Paid on:</span> {subscription.paid_at ? new Date(subscription.paid_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}</p>
          </div>

          {/* Business name */}
          <div>
            <label className="block text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider mb-1">
              Business / Full Name *
            </label>
            <input
              type="text"
              name="tenant_business_name"
              value={form.tenant_business_name}
              onChange={handleChange}
              placeholder="Your business name or full name"
              className="w-full px-4 py-2.5 border border-[#bbcbb9] rounded-lg text-sm focus:outline-none focus:border-[#006d2f]"
            />
          </div>

          {/* GST Status */}
          <div>
            <label className="block text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider mb-2">
              GST Registration *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setGstStatus('has_gstin')}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  gstStatus === 'has_gstin'
                    ? 'border-[#006d2f] bg-[#006d2f]/5 text-[#006d2f]'
                    : 'border-[#e0e3e6] text-[#556067]'
                }`}
              >
                I have GSTIN
              </button>
              <button
                onClick={() => setGstStatus('not_applicable')}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  gstStatus === 'not_applicable'
                    ? 'border-[#006d2f] bg-[#006d2f]/5 text-[#006d2f]'
                    : 'border-[#e0e3e6] text-[#556067]'
                }`}
              >
                Not Applicable
              </button>
            </div>
            {gstStatus === 'not_applicable' && (
              <p className="text-xs text-[#556067] mt-1">
                ✓ Exempt if annual turnover is below ₹20 Lakhs
              </p>
            )}
          </div>

          {/* GSTIN input */}
          {gstStatus === 'has_gstin' && (
            <div>
              <label className="block text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider mb-1">
                GSTIN *
              </label>
              <input
                type="text"
                name="tenant_gstin"
                value={form.tenant_gstin}
                onChange={handleChange}
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
                className="w-full px-4 py-2.5 border border-[#bbcbb9] rounded-lg text-sm focus:outline-none focus:border-[#006d2f] uppercase"
              />
            </div>
          )}

          {/* Business Address */}
          <div>
            <label className="block text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider mb-1">
              Business Address *
            </label>
            <textarea
              name="tenant_address"
              value={form.tenant_address}
              onChange={handleChange}
              placeholder="Enter your complete business address"
              rows={3}
              className="w-full px-4 py-2.5 border border-[#bbcbb9] rounded-lg text-sm focus:outline-none focus:border-[#006d2f] resize-none"
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider mb-1">
              State *
            </label>
            <div className="relative">
              <select
                name="tenant_state"
                value={form.tenant_state}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-[#bbcbb9] rounded-lg text-sm focus:outline-none focus:border-[#006d2f] appearance-none bg-white"
              >
                <option value="">Select your state</option>
                {INDIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#556067] text-base">expand_more</span>
            </div>
            {form.tenant_state && (
              <p className="text-xs text-[#556067] mt-1">
                {form.tenant_state === 'Delhi'
                  ? '→ CGST 9% + SGST 9% will apply (same state as seller)'
                  : '→ IGST 18% will apply (inter-state transaction)'}
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-[#e0e3e6] rounded-xl text-sm font-medium text-[#556067] hover:bg-[#f2f4f7] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 py-2.5 bg-[#006d2f] text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                  Generating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">download</span>
                  Download Invoice
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-[#556067] text-center">
            Your details are saved for future invoice downloads
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
