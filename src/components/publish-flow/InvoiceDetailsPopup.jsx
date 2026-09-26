import React, { useState } from 'react';
import { tenantAPI } from '../../services/api';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
];

const InvoiceDetailsPopup = ({ onComplete }) => {
  const [form, setForm] = useState({ business_name: '', full_name: '', state: '', address: '', gst_number: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.business_name.trim()) e.business_name = 'Business name is required';
    if (!form.full_name.trim()) e.full_name = 'Full name is required';
    if (!form.state) e.state = 'State is required';
    if (!form.address.trim()) e.address = 'Billing address is required';
    if (form.gst_number && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gst_number.trim())) {
      e.gst_number = 'Invalid GSTIN format (e.g. 22AAAAA0000A1Z5)';
    }
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    setApiError('');
    try {
      const result = await tenantAPI.updateMe({
        business_name: form.business_name.trim(),
        full_name: form.full_name.trim(),
        state: form.state,
        address: form.address.trim(),
        gst_number: form.gst_number.trim() || null,
      });
      if (result.success) {
        onComplete();
      } else {
        setApiError(result.error || 'Failed to save. Please try again.');
      }
    } catch (err) {
      setApiError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(er => ({ ...er, [key]: '' }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#006d2f]/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[#006d2f]">receipt_long</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#191c1e]">Business Invoice Details</h2>
              <p className="text-xs text-[#556067]">Required for GST compliance</p>
            </div>
          </div>

          <div className="bg-[#fff8e1] rounded-xl p-3 mb-5 flex items-start gap-2">
            <span className="material-symbols-outlined text-amber-500 text-base mt-0.5">info</span>
            <p className="text-xs text-amber-800">These details will appear on all your invoices and can be updated later from your profile.</p>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#556067] uppercase tracking-wider mb-1">Registered Business Name <span className="text-red-500">*</span></label>
            <input type="text" placeholder="e.g. Momo House Pvt Ltd" value={form.business_name} onChange={e => set('business_name', e.target.value)}
              className={"w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#006d2f]/30 " + (errors.business_name ? 'border-red-400' : 'border-[#e0e3e6]')} />
            {errors.business_name && <p className="text-red-500 text-xs mt-1">{errors.business_name}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#556067] uppercase tracking-wider mb-1">Owner / Authorized Person Name <span className="text-red-500">*</span></label>
            <input type="text" placeholder="e.g. Nikhil Mathur" value={form.full_name} onChange={e => set('full_name', e.target.value)}
              className={"w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#006d2f]/30 " + (errors.full_name ? 'border-red-400' : 'border-[#e0e3e6]')} />
            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#556067] uppercase tracking-wider mb-1">State <span className="text-red-500">*</span></label>
            <select value={form.state} onChange={e => set('state', e.target.value)}
              className={"w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#006d2f]/30 bg-white " + (errors.state ? 'border-red-400' : 'border-[#e0e3e6]')}>
              <option value="">Select State</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#556067] uppercase tracking-wider mb-1">Billing Address <span className="text-red-500">*</span></label>
            <textarea rows={3} placeholder="Full registered address with city and pincode" value={form.address} onChange={e => set('address', e.target.value)}
              className={"w-full px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#006d2f]/30 " + (errors.address ? 'border-red-400' : 'border-[#e0e3e6]')} />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          <div className="mb-5">
            <label className="block text-xs font-semibold text-[#556067] uppercase tracking-wider mb-1">GSTIN <span className="text-[#8e9eab]">(Optional)</span></label>
            <input type="text" placeholder="e.g. 22AAAAA0000A1Z5" value={form.gst_number} onChange={e => set('gst_number', e.target.value.toUpperCase())}
              className={"w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#006d2f]/30 " + (errors.gst_number ? 'border-red-400' : 'border-[#e0e3e6]')} />
            {errors.gst_number && <p className="text-red-500 text-xs mt-1">{errors.gst_number}</p>}
          </div>

          {apiError && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4"><p className="text-red-600 text-sm">{apiError}</p></div>}

          <button onClick={handleSave} disabled={saving}
            className="w-full py-3 bg-[#006d2f] text-white font-semibold rounded-xl text-sm hover:bg-[#005a27] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {saving
              ? <><span className="material-symbols-outlined animate-spin text-base">progress_activity</span>Saving...</>
              : <><span className="material-symbols-outlined text-base">save</span>Save & Continue</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailsPopup;
