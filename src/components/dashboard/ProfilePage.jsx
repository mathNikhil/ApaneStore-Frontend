import { showSuccess, showError } from '../../utils/toast';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { tenantAPI } from '../../services/api';
import TopAppBar from '../Common/TopAppBar';
import BottomNav from '../Common/BottomNav';
import Card from '../Common/Card';

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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
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
                            <input
                                type="text"
                                name="business_type"
                                value={profile.business_type || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="e.g., Retail, Wholesale, Manufacturing"
                            />
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
                    <div className="text-sm text-gray-600 space-y-2">
                        <p>
                            Aapna eStore is a complete e-commerce platform that helps you build, manage, and grow your online store. 
                            With our intuitive store builder, you can create a professional online store without any coding knowledge.
                        </p>
                        <p>
                            From product management to order tracking, we provide all the tools you need to succeed in the digital marketplace.
                        </p>
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
                <div className="pt-4">
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