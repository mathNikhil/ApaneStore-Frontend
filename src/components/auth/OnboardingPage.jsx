import React, { useState } from 'react';
import logo from '../../assets/images/Apnaestore-Logo.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { tenantAPI } from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';

const BUSINESS_TYPES = [
  { value: 'grocery_kirana', label: 'Grocery & Kirana', icon: '🛒' },
  { value: 'fashion_clothing', label: 'Fashion & Clothing', icon: '👗' },
  { value: 'food_restaurant', label: 'Food & Restaurant', icon: '🍔' },
  { value: 'bakery_sweets', label: 'Bakery & Sweets', icon: '🍰' },
  { value: 'electronics_gadgets', label: 'Electronics & Gadgets', icon: '📱' },
  { value: 'beauty_cosmetics', label: 'Beauty & Cosmetics', icon: '💄' },
  { value: 'health_pharmacy', label: 'Health & Pharmacy', icon: '💊' },
  { value: 'home_furniture', label: 'Home & Furniture', icon: '🏠' },
  { value: 'jewellery', label: 'Jewellery', icon: '💍' },
  { value: 'books_stationery', label: 'Books & Stationery', icon: '📚' },
  { value: 'organic_natural', label: 'Organic & Natural', icon: '🌿' },
  { value: 'sports_fitness', label: 'Sports & Fitness', icon: '🏋️' },
  { value: 'toys_kids', label: 'Toys & Kids', icon: '🧸' },
  { value: 'gifts_handicrafts', label: 'Gifts & Handicrafts', icon: '🎁' },
  { value: 'pet_supplies', label: 'Pet Supplies', icon: '🐾' },
  { value: 'automotive', label: 'Automotive', icon: '🚗' },
  { value: 'services', label: 'Services', icon: '🔧' },
  { value: 'other', label: 'Other', icon: '📦' },
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ company_name: '', email: '', business_type: '' });
  const [errors, setErrors] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.company_name.trim()) e.company_name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.business_type) e.business_type = 'Please select your business type';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const response = await tenantAPI.updateMe({
        company_name: form.company_name,
        email: form.email,
        business_type: form.business_type,
      });
      if (response.success) {
        const updatedUser = { ...user, ...response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        if (setUser) setUser(updatedUser);
        showSuccess(`Welcome, ${form.company_name}! 🎉`);
        navigate('/dashboard');
      } else {
        showError(response.error || 'Failed to save. Please try again.');
      }
    } catch (err) {
      showError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] flex flex-col items-center justify-center px-4">
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e0e3e6] p-8 w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Apna eStore" className="h-12" />
        </div>

        <h2 className="text-2xl font-bold text-[#191C1E] text-center mb-1">Welcome! 👋</h2>
        <p className="text-sm text-[#556067] text-center mb-6">Tell us about your business to get started</p>

        <div className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-[#191C1E] mb-1.5">Full Name</label>
            <input
              type="text"
              value={form.company_name}
              onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))}
              placeholder="e.g. Raj Sharma"
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent transition-all ${errors.company_name ? 'border-red-400' : 'border-[#e0e3e6]'}`}
            />
            {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#191C1E] mb-1.5">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="e.g. raj@gmail.com"
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent transition-all ${errors.email ? 'border-red-400' : 'border-[#e0e3e6]'}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Business Type Dropdown */}
          <div className="relative">
            <label className="block text-sm font-medium text-[#191C1E] mb-1.5">Business Type</label>
            <button
              type="button"
              onClick={() => setDropdownOpen(p => !p)}
              className={`w-full border rounded-xl px-4 py-3 text-sm text-left flex items-center justify-between transition-all focus:outline-none ${errors.business_type ? 'border-red-400' : dropdownOpen ? 'border-[#25D366] ring-2 ring-[#25D366]/20' : 'border-[#e0e3e6]'}`}
            >
              {form.business_type ? (
                <span className="flex items-center gap-2">
                  <span>{BUSINESS_TYPES.find(t => t.value === form.business_type)?.icon}</span>
                  <span className="text-[#191C1E]">{BUSINESS_TYPES.find(t => t.value === form.business_type)?.label}</span>
                </span>
              ) : (
                <span className="text-[#9ca3af]">Select your business type</span>
              )}
              <span className="material-symbols-outlined text-[#556067]" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>expand_more</span>
            </button>
            {dropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-[#e0e3e6] rounded-xl shadow-lg overflow-hidden" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                {BUSINESS_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => { setForm(p => ({ ...p, business_type: type.value })); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#f0faf4] transition-colors text-left"
                    style={{ background: form.business_type === type.value ? '#f0faf4' : undefined, borderLeft: form.business_type === type.value ? '3px solid #25D366' : '3px solid transparent' }}
                  >
                    <span className="text-lg">{type.icon}</span>
                    <span className={form.business_type === type.value ? 'text-[#006d2f] font-medium' : 'text-[#191C1E]'}>{type.label}</span>
                  </button>
                ))}
              </div>
            )}
            {errors.business_type && <p className="text-red-500 text-xs mt-1">{errors.business_type}</p>}
          </div>

        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full mt-6 py-3.5 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#1da851] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? 'Setting up...' : 'Continue to Dashboard'}
          {!saving && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
        </button>

      </div>
    </div>
  );
};

export default OnboardingPage;
