import { showSuccess, showError } from '../../utils/toast';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { tenantAPI } from '../../services/api';
import TopAppBar from '../Common/TopAppBar';
import BottomNav from '../Common/BottomNav';
import Card from '../Common/Card';

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

const ProfilePage = () => {
    const { token, user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [profile, setProfile] = useState({
        company_name: '',
        email: '',
        phone: '',
        business_type: '',
        subscription_tier: 'trial',
        store_count: 0
    });

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await tenantAPI.getMe();
            
            if (response.success) {
                setProfile(response.data);
            }
        } catch (err) {
            console.error('❌ Profile fetch error:', err);
            setError(err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchProfile();
        } else {
            showError('No authentication token found. Please login again.');
            setLoading(false);
        }
    }, [token]);

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);
            
            const dataToSave = {
                company_name: profile.company_name,
                email: profile.email,
                phone: profile.phone,
                business_type: profile.business_type
            };
            
            const response = await tenantAPI.updateMe(dataToSave);
            
            if (response.success) {
                setSuccess('Profile updated successfully!');
                setProfile(response.data);
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(response.message || 'Failed to save changes');
            }
        } catch (err) {
            console.error('❌ Save error:', err);
            setError(err.message || 'Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to logout?')) {
            await logout();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                <span className="ml-2 text-gray-500">Loading...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f7f9fc] pb-24 lg:pb-0">
            <TopAppBar title="Profile" />
            
            <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
                {success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                        ✅ {success}
                    </div>
                )}
                

                {/* Business Profile Card */}
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="font-bold text-lg text-gray-800">Business Profile</h2>
                            <p className="text-sm text-gray-500">Manage your business information</p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={fetchProfile}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Refresh
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 bg-[#25D366] text-[#005523] font-bold rounded-lg hover:brightness-105 transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="company_name"
                                value={profile.company_name || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Enter business name"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profile.email || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    placeholder="Enter email"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={profile.phone || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    disabled
                                />
                                <p className="text-xs text-gray-400 mt-1">This is your login number and can't be changed here</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                            <div className="relative">
                                <select
                                    name="business_type"
                                    value={profile.business_type || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white"
                                >
                                    <option value="">Select business type</option>
                                    {BUSINESS_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.icon} {type.label}
                                        </option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                            <div>
                                <label className="block text-sm text-gray-500">Plan</label>
                                <p className="font-semibold capitalize">{profile.subscription_tier || 'Trial'}</p>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500">Stores</label>
                                <p className="font-semibold">{profile.store_count || 0}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* About Us Card */}
                <Card>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-[#006d2f]">info</span>
                        <h3 className="font-bold text-gray-800">About Aapna eStore</h3>
                    </div>
                    <div className="text-sm text-gray-600 space-y-4 overflow-y-auto" style={{ maxHeight: '220px' }}>
                        <p>
                            AapnaEstore is a white-label e-commerce SaaS platform that empowers anyone to create their own branded online store — without writing a single line of code. Whether you're a kirana store owner, a home baker, a fashion boutique, or a service provider, AapnaEstore gives you everything you need to sell online in minutes.
                        </p>
                        <div>
                            <p className="font-semibold text-gray-800 mb-1">Our Mission</p>
                            <p>To make e-commerce accessible to every small business in India — regardless of technical knowledge, budget, or background.</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800 mb-1">Your Responsibilities</p>
                            <ul className="space-y-1 list-disc pl-4">
                                <li>You are solely responsible for all products, descriptions, images and pricing in your store.</li>
                                <li>Ensure all products comply with applicable Indian laws and regulations.</li>
                                <li>You are responsible for handling customer queries, disputes and order fulfillment.</li>
                                <li>Provide accurate business and contact information at all times.</li>
                                <li>You may not sell counterfeit, illegal, or prohibited goods or services.</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800 mb-1">Platform Policy</p>
                            <ul className="space-y-1 list-disc pl-4">
                                <li>AapnaEstore provides technology platform only. We do not hold inventory on behalf of any tenant.</li>
                                <li>We reserve the right to suspend any store that violates our terms of service.</li>
                                <li>Subscription fees, once paid, are non-refundable unless explicitly stated otherwise.</li>
                                <li>AapnaEstore is not liable for any loss of business or revenue arising from platform downtime.</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800 mb-1">Refund Policy</p>
                            <ul className="space-y-1 list-disc pl-4">
                                <li>All new tenants get a free trial. No payment required during trial.</li>
                                <li>Paid subscription fees are non-refundable after payment is processed.</li>
                                <li>Refunds may be considered for duplicate payment or proven technical failure. Contact support within 7 days.</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800 mb-1">Privacy</p>
                            <ul className="space-y-1 list-disc pl-4">
                                <li>We collect your mobile number, email and business information to provide the service.</li>
                                <li>We do not sell your data to third parties.</li>
                                <li>Your store data, products and customer information remain yours.</li>
                            </ul>
                        </div>
                    </div>
                </Card>

                {/* Support Details Card */}
                <Card>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-[#006d2f]">support_agent</span>
                        <h3 className="font-bold text-gray-800">Support Details</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-gray-400 text-base">email</span>
                            <div>
                                <p className="text-gray-500 text-xs">Email</p>
                                <p className="font-medium text-gray-800">support@aapnaestore.com</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-gray-400 text-base">phone</span>
                            <div>
                                <p className="text-gray-500 text-xs">Phone</p>
                                <p className="font-medium text-gray-800">+91 8800244169</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-gray-400 text-base">schedule</span>
                            <div>
                                <p className="text-gray-500 text-xs">Working Hours</p>
                                <p className="font-medium text-gray-800">9:00 AM - 6:00 PM (Mon-Sat)</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Logout Button */}
                <div className="pt-2">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 text-red-600 font-semibold rounded-xl transition-all active:scale-[0.98]"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        Logout
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4">
                        App Version 1.0.0 • Aapna eStore Pro
                    </p>
                </div>
            </main>

            <BottomNav />
        </div>
    );
};

export default ProfilePage;