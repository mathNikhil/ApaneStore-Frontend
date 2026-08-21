import React, { useState, useEffect } from 'react';
import { showSuccess, showError } from '../../../utils/toast';
import { useAuth } from '../../../Context/AuthContext';
import { tenantAPI } from '../../../services/api';

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

const ProfileSection = () => {
  const { token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [profile, setProfile] = useState({
    company_name: '', email: '', phone: '', business_type: '',
    subscription_tier: 'trial', store_count: 0
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await tenantAPI.getMe();
      if (response.success) setProfile(response.data);
    } catch (err) {
      showError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProfile();
    else setLoading(false);
  }, [token]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await tenantAPI.updateMe({
        company_name: profile.company_name,
        email: profile.email,
        business_type: profile.business_type,
      });
      if (response.success) {
        setProfile(response.data);
        showSuccess('Profile updated successfully!');
        setSuccess('Profile updated!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        showError(response.message || 'Failed to save');
      }
    } catch (err) {
      showError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) await logout();
  };

  if (loading) return (
    <div className="p-6 flex items-center gap-2 text-[#556067]">
      <span className="material-symbols-outlined animate-spin">progress_activity</span>
      Loading...
    </div>
  );

  const businessType = BUSINESS_TYPES.find(t => t.value === profile.business_type);

  return (
    <div className="p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-[#f2f4f7] rounded-xl">
        <div className="w-14 h-14 rounded-full bg-[#006d2f]/15 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[#006d2f] text-3xl">person</span>
        </div>
        <div>
          <h2 className="font-bold text-lg text-[#191c1e]">{profile.company_name || 'Your Business'}</h2>
          <p className="text-sm text-[#556067]">+91 {profile.phone}</p>
          {businessType && <p className="text-xs text-[#556067]">{businessType.icon} {businessType.label}</p>}
        </div>
        <div className="ml-auto text-right">
          <span className="text-xs bg-[#006d2f]/10 text-[#006d2f] px-2 py-1 rounded-full font-semibold capitalize">
            {profile.subscription_tier || 'Trial'}
          </span>
          <p className="text-xs text-[#556067] mt-1">{profile.store_count || 0} store{profile.store_count !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">✅ {success}</div>
      )}

      {/* Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider mb-1">Full Name</label>
          <input
            type="text"
            value={profile.company_name || ''}
            onChange={e => setProfile(prev => ({ ...prev, company_name: e.target.value }))}
            className="w-full px-4 py-2.5 border border-[#bbcbb9] rounded-lg text-sm focus:outline-none focus:border-[#006d2f]"
            placeholder="Enter your full name"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider mb-1">Email</label>
            <input
              type="email"
              value={profile.email || ''}
              onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-2.5 border border-[#bbcbb9] rounded-lg text-sm focus:outline-none focus:border-[#006d2f]"
              placeholder="Enter email"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider mb-1">Phone</label>
            <input
              type="text"
              value={profile.phone || ''}
              disabled
              className="w-full px-4 py-2.5 border border-[#e0e3e6] rounded-lg text-sm bg-[#f2f4f7] text-[#556067] cursor-not-allowed"
            />
            <p className="text-xs text-[#556067] mt-1">Login number — cannot be changed</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider mb-1">Business Type</label>
          <div className="relative">
            <select
              value={profile.business_type || ''}
              onChange={e => setProfile(prev => ({ ...prev, business_type: e.target.value }))}
              className="w-full px-4 py-2.5 border border-[#bbcbb9] rounded-lg text-sm focus:outline-none focus:border-[#006d2f] appearance-none bg-white"
            >
              <option value="">Select business type</option>
              {BUSINESS_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#556067] pointer-events-none text-base">expand_more</span>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={fetchProfile}
          className="px-4 py-2.5 bg-[#f2f4f7] text-[#556067] rounded-lg text-sm font-medium hover:bg-[#e0e3e6] transition-colors"
        >
          Refresh
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-2.5 bg-[#006d2f] text-white font-semibold rounded-lg text-sm hover:brightness-110 transition-all disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Support */}
      <div className="border border-[#e0e3e6] rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-sm text-[#191c1e] mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#006d2f] text-base">support_agent</span>
          Support
        </h3>
        <div className="space-y-2">
          {[
            { icon: 'email', label: 'Email', value: 'nikhil.mathur1215@gmail.com' },
            { icon: 'phone', label: 'Phone', value: '+91 9818410640' },
            { icon: 'schedule', label: 'Hours', value: '9:00 AM – 6:00 PM (Mon–Sat)' },
            { icon: 'business', label: 'Business', value: 'Nikhil Mathur HUF' },
            { icon: 'verified', label: 'Udyam', value: 'UDYAM-DL-06-0221356' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 text-sm">
              <span className="material-symbols-outlined text-[#556067] text-base">{item.icon}</span>
              <span className="text-[#556067] w-16 flex-shrink-0">{item.label}</span>
              <span className="text-[#191c1e] font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 text-red-600 font-semibold rounded-xl transition-all"
      >
        <span className="material-symbols-outlined">logout</span>
        Logout
      </button>

      <p className="text-center text-xs text-[#556067] mt-4">App Version 1.0.0 · AapnaEstore</p>
    </div>
  );
};

export default ProfileSection;
