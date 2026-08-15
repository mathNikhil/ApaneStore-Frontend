import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopAppBar from '../Common/TopAppBar';
import Button from '../Common/Button';
import BottomNav from '../Common/BottomNav';
import logo from '../../assets/images/Apnaestore-Logo.png';
import { storeAPI } from '../../services/api';

const DashboardReturnUser = ({ stores = [], subscriptions = {}, onStoreUpdate }) => {
    const navigate = useNavigate();
    const [updating, setUpdating] = useState(null);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [adminPasswords, setAdminPasswords] = useState({});
    const [passwordVisible, setPasswordVisible] = useState({});
    const [passwordLoading, setPasswordLoading] = useState({});

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

    // ✅ Get tenant name from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantName = user?.company_name || user?.full_name || user?.name || 'Tenant';

    // ✅ Get store config helper
    const getStoreConfig = (store) => {
        if (store.config && typeof store.config === 'object') {
            return store.config;
        }
        try {
            return JSON.parse(store.config || '{}');
        } catch {
            return {};
        }
    };

    // ✅ Helper to get store expiry info
    const getStoreExpiryInfo = (store) => {
        if (store.status !== 'draft') return null;
        
        const createdAt = new Date(store.created_at);
        const expiryDays = 120;
        const expiryDate = new Date(createdAt);
        expiryDate.setDate(expiryDate.getDate() + expiryDays);
        
        const now = new Date();
        const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
        
        return {
            daysRemaining,
            isExpired: daysRemaining <= 0,
            isWarning: daysRemaining <= 7 && daysRemaining > 0,
            expiryDate: expiryDate
        };
    };

    // ✅ Handle Publish/Unpublish status change
    const handleStatusChange = async (storeId, newStatus) => {
        try {
            setUpdating(storeId);
            setError(null);

            const token = localStorage.getItem('token');
            
            const response = await axios.put(
                `${API_URL}/api/stores/${storeId}`,
                { status: newStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data?.success) {
                if (onStoreUpdate) {
                    onStoreUpdate(storeId, newStatus);
                }
                
                const statusMessages = {
                    'active': 'Store published successfully! 🎉',
                    'draft': 'Store moved to draft',
                    'inactive': 'Store unpublished'
                };
                alert(statusMessages[newStatus] || 'Status updated successfully');
            }
        } catch (error) {
            console.error('❌ Status update error:', error);
            setError(error.response?.data?.error || 'Failed to update store status');
        } finally {
            setUpdating(null);
        }
    };

    // ✅ Delete Store with auto-refresh
    const handleDeleteStore = async (storeId, storeName) => {
        const confirmMessage = `⚠️ Are you sure you want to delete "${storeName}"?\n\nThis action cannot be undone. All products, images, and settings will be permanently removed.`;
        
        if (!window.confirm(confirmMessage)) return;

        setDeleting(storeId);
        try {
            const token = localStorage.getItem('token');
            
            const response = await axios.delete(
                `${API_URL}/api/stores/${storeId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data?.success) {
                // ✅ Call onStoreUpdate with null to trigger refresh
                if (onStoreUpdate) {
                    onStoreUpdate(storeId, null);
                }
                alert(response.data.message || 'Store deleted successfully');
                // ✅ No manual refresh needed - parent will refresh
            } else {
                alert(response.data?.error || 'Failed to delete store');
            }
        } catch (error) {
            console.error('❌ Delete store error:', error);
            alert(error.response?.data?.error || 'Failed to delete store');
        } finally {
            setDeleting(null);
        }
    };

    // ✅ Get status badge styling
    const getSubscriptionBadge = (store) => {
        const sub = subscriptions[store.id];
        if (!sub) return null;
        
        if (sub.displayStatus === 'grace') {
            return { 
                label: `🚨 Grace period: ${sub.graceDaysRemaining} days left to renew`,
                style: 'bg-red-100 text-red-700 border border-red-300'
            };
        } else if (sub.displayStatus === 'expiring_soon') {
            return {
                label: `🔴 ${sub.daysRemaining} days remaining — renew now!`,
                style: 'bg-orange-100 text-orange-700 border border-orange-300'
            };
        } else if (sub.displayStatus === 'expiring') {
            return {
                label: `⚠️ ${sub.daysRemaining} days remaining`,
                style: 'bg-yellow-100 text-yellow-700 border border-yellow-300'
            };
        } else {
            return {
                label: `✅ Active — expires ${sub.validUntilFormatted}`,
                style: 'bg-green-100 text-green-700 border border-green-300'
            };
        }
    };

    const getStatusBadge = (status) => {
        const statuses = {
            'published': {
                label: 'Published ✅',
                className: 'bg-green-100 text-green-700',
                icon: 'check_circle'
            },
            'active': {
                label: 'Published ✅',
                className: 'bg-green-100 text-green-700',
                icon: 'check_circle'
            },
            'draft': {
                label: 'Draft 📝',
                className: 'bg-yellow-100 text-yellow-700',
                icon: 'edit_note'
            },
            'inactive': {
                label: 'Unpublished ⛔',
                className: 'bg-gray-100 text-gray-600',
                icon: 'visibility_off'
            },
            'pending': {
                label: 'Pending ⏳',
                className: 'bg-blue-100 text-blue-700',
                icon: 'pending'
            }
        };
        return statuses[status] || statuses['draft'];
    };

    // ✅ Get status actions
    // ✅ Get status actions
    const getStatusActions = (store) => {
        const actions = [];
        
        if (store.status === 'draft') {
            actions.push({
                label: 'Publish',
                action: () => navigate(`/store-builder/publish/domain?storeId=${store.id}`),
                className: 'bg-[#25D366] text-[#005523] hover:brightness-105'
            });
        } else if (store.status === 'published' || store.status === 'active') {
            actions.push({
                label: 'Unpublish',
                action: async () => {
                    const sub = subscriptions[store.id];
                    const warningMsg = sub 
                        ? `⚠️ Unpublishing takes your store offline immediately.\n\nYou have ${sub.daysRemaining} days remaining (expires ${sub.validUntilFormatted}).\n\nRemaining subscription days are non-refundable and will not be credited.\n\nAre you sure you want to unpublish?`
                        : 'Unpublish your store? It will go offline immediately. Remaining subscription days are non-refundable.';
                    if (!window.confirm(warningMsg)) return;
                    try {
                        const token = localStorage.getItem('token');
                        const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com'}/api/stores/${store.id}/unpublish`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const result = await res.json();
                        if (result.success) {
                            alert('Store unpublished successfully.');
                            window.location.reload();
                        } else {
                            alert(result.error || 'Failed to unpublish store');
                        }
                    } catch (e) {
                        alert('Failed to unpublish store. Please try again.');
                    }
                },
                className: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            });
        } else if (store.status === 'inactive' || store.status === 'draft') {
            actions.push({
                label: 'Publish',
                action: () => navigate(`/store-builder/publish/domain?storeId=${store.id}`),
                className: 'bg-[#25D366] text-[#005523] hover:brightness-105'
            });
        }
        
        return actions;
    };

    // ✅ Navigate to Store Admin Panel (separate app)
    const STORE_ADMIN_URL = import.meta.env.VITE_STORE_ADMIN_URL || 'http://localhost:3006';

    // ✅ FIX: this used to open http://localhost:3001?storeId=<id> — port
    // 3001 is the Super Admin panel, not Store Admin (which runs on 3006),
    // and storeId alone doesn't match what Store Admin's login actually
    // expects (?store=<subdomain>, matching the Storefront's own pattern).
    const goToStoreAdmin = (subdomain) => {
        if (!subdomain) {
            alert('This store needs a subdomain before its admin panel can be opened.');
            return;
        }
        window.open(`${STORE_ADMIN_URL}/login?store=${subdomain}`, '_blank');
    };

    const handleTogglePassword = async (storeId) => {
        const isCurrentlyVisible = passwordVisible[storeId];
        if (isCurrentlyVisible) {
            setPasswordVisible(prev => ({ ...prev, [storeId]: false }));
            return;
        }
        if (adminPasswords[storeId]) {
            setPasswordVisible(prev => ({ ...prev, [storeId]: true }));
            return;
        }
        setPasswordLoading(prev => ({ ...prev, [storeId]: true }));
        try {
            const result = await storeAPI.getAdminPassword(storeId);
            if (result.success) {
                setAdminPasswords(prev => ({ ...prev, [storeId]: result.data.password }));
                setPasswordVisible(prev => ({ ...prev, [storeId]: true }));
            }
        } catch (err) {
            console.error('Failed to fetch admin password:', err);
        } finally {
            setPasswordLoading(prev => ({ ...prev, [storeId]: false }));
        }
    };

    const handleGeneratePassword = async (storeId) => {
        if (!window.confirm('Generate a new Store Admin password? The current password will stop working immediately — anyone using it (including any active session) will need the new one.')) {
            return;
        }
        setPasswordLoading(prev => ({ ...prev, [storeId]: true }));
        try {
            const result = await storeAPI.generateAdminPassword(storeId);
            if (result.success) {
                setAdminPasswords(prev => ({ ...prev, [storeId]: result.data.password }));
                setPasswordVisible(prev => ({ ...prev, [storeId]: true }));
            }
        } catch (err) {
            console.error('Failed to generate admin password:', err);
            alert('Failed to generate password. Please try again.');
        } finally {
            setPasswordLoading(prev => ({ ...prev, [storeId]: false }));
        }
    };

    const handleCopyPassword = (password) => {
        navigator.clipboard.writeText(password);
    };

    // ✅ Stats based on all stores
    const stats = {
        total: stores.length,
        active: stores.filter(s => s.status === 'published' || s.status === 'active').length,
        draft: stores.filter(s => s.status === 'draft').length,
        inactive: stores.filter(s => s.status === 'inactive').length,
    };

    console.log('🔄 DashboardReturnUser - All Stores:', stores.length);
    console.log('📊 Stats:', stats);

    return (
        <div className="min-h-screen bg-[#f7f9fc] pb-24 lg:pb-0">
            <TopAppBar title="eStore Manager" />

            <main className="max-w-7xl mx-auto px-4 py-6">
                {/* Aapna eStore Logo */}
                

                {/* Welcome Section */}
                <div className="mb-4">
                    <h1 className="text-3xl font-bold text-[#191c1e]">Welcome, {tenantName}</h1>
                    <p className="text-[#3c4a3d] mt-1">Manage and scale your digital business.</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        ❌ {error}
                    </div>
                )}

                {/* Stats Row - All Statuses */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-xl border border-[#bbcbb9] shadow-sm hover:shadow-md transition-shadow text-center">
                        <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-xs text-[#3c4a3d] font-semibold">Total</span>
                            <span className="material-symbols-outlined text-[#556067] opacity-50 text-base">inventory_2</span>
                        </div>
                        <div className="text-2xl font-bold text-[#191c1e]">{stats.total}</div>
                        <div className="text-[10px] text-[#3c4a3d] mt-1">All Stores</div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-[#bbcbb9] shadow-sm hover:shadow-md transition-shadow text-center">
                        <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-xs text-[#3c4a3d] font-semibold">Published</span>
                            <span className="material-symbols-outlined text-[#006d2f] opacity-50 text-base">check_circle</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                        <div className="text-[10px] text-[#3c4a3d] mt-1">Live Stores</div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-[#bbcbb9] shadow-sm hover:shadow-md transition-shadow text-center">
                        <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-xs text-[#3c4a3d] font-semibold">Draft</span>
                            <span className="material-symbols-outlined text-[#006b58] opacity-50 text-base">edit_note</span>
                        </div>
                        <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
                        <div className="text-[10px] text-[#3c4a3d] mt-1">In Progress</div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-[#bbcbb9] shadow-sm hover:shadow-md transition-shadow text-center">
                        <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-xs text-[#3c4a3d] font-semibold">Unpublished</span>
                            <span className="material-symbols-outlined text-[#556067] opacity-50 text-base">visibility_off</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
                        <div className="text-[10px] text-[#3c4a3d] mt-1">Hidden Stores</div>
                    </div>
                </div>

                {/* Launch Button */}
                <div className="mb-8">
                    <Button
                        onClick={() => navigate('/store-builder/step/1')}
                        icon="add"
                        size="lg"
                        className="bg-[#25D366] text-[#005523] hover:brightness-105 shadow-[0_4px_0_0_#005523] active:translate-y-[2px] active:shadow-[0_2px_0_0_#005523] px-8 py-4 text-lg font-bold"
                    >
                        Launch New eStore
                    </Button>
                </div>

                {/* Store Cards - All Stores */}
                {stores.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {stores.map((store) => {
                            const config = getStoreConfig(store);
                            const brand = config.brand || {};
                            const statusBadge = getStatusBadge(store.status);
                            const actions = getStatusActions(store);
                            const expiryInfo = getStoreExpiryInfo(store);
                            
                            const subBadge = getSubscriptionBadge(store);
                            const isExpiringSoon = subBadge && (subBadge.style.includes('orange') || subBadge.style.includes('red'));
                            return (
                                <div key={store.id} className={`bg-white rounded-2xl border shadow-sm p-6 hover:shadow-md transition-shadow ${isExpiringSoon ? 'border-orange-400' : 'border-[#bbcbb9]'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {brand.logoUrl ? (
                                                <img 
                                                    src={brand.logoUrl} 
                                                    alt={store.store_name} 
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-[#25D366]"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-[#25D366]/20 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-[#006d2f] text-2xl">storefront</span>
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-bold text-lg text-[#191c1e]">{store.store_name}</h3>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full mt-1 ${statusBadge.className}`}>
                                                    <span className="material-symbols-outlined text-xs">{statusBadge.icon}</span>
                                                    {statusBadge.label}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {store.created_at && new Date(store.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm text-[#3c4a3d]">{brand.tagline || 'No tagline set'}</p>
                                    <p className="text-xs text-[#6c7b6b] mt-1">
                                        🔗 {store.subdomain ? `${store.subdomain}.aapnaestore.com` : 'No domain set'}
                                    </p>
                                    {subBadge && (
                                        <div className={`mt-2 px-3 py-1.5 rounded-lg text-xs font-medium ${subBadge.style}`}>
                                            {subBadge.label}
                                        </div>
                                    )}
                                    
                                    {/* ✅ Expiry Indicator - Only for draft stores with note */}
                                    {store.status === 'draft' && expiryInfo && (
                                        <div className="mt-3 pt-3 border-t border-[#e0e3e6]">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className={`material-symbols-outlined text-sm ${
                                                        expiryInfo.isWarning ? 'text-red-500' : 'text-yellow-500'
                                                    }`}>
                                                        {expiryInfo.isWarning ? 'warning' : 'hourglass_empty'}
                                                    </span>
                                                    <span className={`text-xs ${
                                                        expiryInfo.isWarning ? 'text-red-600 font-semibold' : 'text-gray-500'
                                                    }`}>
                                                    
                                                        Auto delete in <span className="font-bold">{expiryInfo.daysRemaining}</span> days
                                                    </span>
                                                </div>
                                            </div>
                                           
                                        </div>
                                    )}
                                    
                                    {/* Row 1: Edit, Preview, Publish/Unpublish */}
                                    <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-[#eceef1]">
                                        <button 
                                            onClick={() => navigate(`/store-builder/step/1?storeId=${store.id}`)}
                                            className="px-4 py-2 bg-[#eceef1] text-[#006d2f] font-semibold text-sm rounded-xl hover:bg-[#d9e4ec] active:scale-[0.98] transition-all flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-base">edit</span>
                                            Edit Store
                                        </button>
                                        
                                        <button 
                                            onClick={() => store.status === 'published' ? window.open(`https://${store.subdomain}.aapnaestore.com`, '_blank') : navigate(`/store-builder/preview?storeId=${store.id}`)}
                                            className="px-4 py-2 bg-[#eceef1] text-[#006d2f] font-semibold text-sm rounded-xl hover:bg-[#d9e4ec] active:scale-[0.98] transition-all flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-base">visibility</span>
                                            Preview
                                        </button>
                                        
                                        {actions.map((action, idx) => (
                                            <button
                                                key={idx}
                                                onClick={action.action}
                                                disabled={updating === store.id}
                                                className={`px-4 py-2 font-semibold text-sm rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2 ${action.className}`}
                                            >
                                                {updating === store.id ? (
                                                    <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                                                ) : (
                                                    action.label
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Row 2: Store Admin Panel */}
                                    <div className="mt-3">
                                        <button 
                                            onClick={() => goToStoreAdmin(store.subdomain)}
                                            className="w-full px-4 py-2 bg-[#006d2f] text-white font-semibold text-sm rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-base">dashboard</span>
                                            Store Admin Panel
                                        </button>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-dashed border-[#e0e3e6]">
                                        <p className="text-xs font-semibold text-[#3c4a3d] mb-2 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">lock</span>
                                            Store Admin Access
                                        </p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {passwordVisible[store.id] && adminPasswords[store.id] ? (
                                                <>
                                                    <code className="px-3 py-1.5 bg-[#f2f4f7] rounded-lg text-sm font-mono text-[#191c1e] border border-[#e0e3e6]">
                                                        {adminPasswords[store.id]}
                                                    </code>
                                                    <button
                                                        onClick={() => handleCopyPassword(adminPasswords[store.id])}
                                                        className="px-3 py-1.5 text-xs font-semibold text-[#006d2f] hover:bg-[#eceef1] rounded-lg transition-colors flex items-center gap-1"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">content_copy</span>
                                                        Copy
                                                    </button>
                                                    <button
                                                        onClick={() => handleTogglePassword(store.id)}
                                                        className="px-3 py-1.5 text-xs font-semibold text-[#6c7b6b] hover:bg-[#eceef1] rounded-lg transition-colors"
                                                    >
                                                        Hide
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => handleTogglePassword(store.id)}
                                                    disabled={passwordLoading[store.id]}
                                                    className="px-3 py-1.5 text-xs font-semibold text-[#006d2f] hover:bg-[#eceef1] rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                                                >
                                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                                    {passwordLoading[store.id] ? 'Loading...' : 'Show Password'}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleGeneratePassword(store.id)}
                                                disabled={passwordLoading[store.id]}
                                                className="px-3 py-1.5 text-xs font-semibold text-[#556067] hover:bg-[#eceef1] rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined text-sm">refresh</span>
                                                Generate New
                                            </button>
                                        </div>
                                        <p className="text-xs text-[#6c7b6b] mt-2">
                                            Share this password with staff to let them manage this store's orders and customers. Only one person can be logged in at a time.
                                        </p>
                                    </div>

                                    {/* Bottom: Delete */}
                                    <div className="mt-4 pt-3 border-t border-[#eceef1]">
                                        <button
                                            onClick={() => handleDeleteStore(store.id, store.store_name)}
                                            disabled={deleting === store.id}
                                            className="w-full px-4 py-2 bg-red-100 text-red-700 font-semibold text-sm rounded-xl hover:bg-red-200 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {deleting === store.id ? (
                                                <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-base">delete</span>
                                                    Delete Store
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-[#bbcbb9]">
                        <span className="material-symbols-outlined text-6xl text-gray-300 block mb-4">storefront</span>
                        <h3 className="text-xl font-bold text-gray-600 mb-2">No Stores Yet</h3>
                        <p className="text-gray-400">Click "Launch New eStore" to create your first store</p>
                    </div>
                )}

                {/* Quick Actions 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-[#bbcbb9] shadow-sm p-6">
                        <h3 className="font-bold text-[#191c1e] mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#eceef1] transition-colors flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#006d2f]">inventory_2</span>
                                <span className="text-sm">Manage Inventory</span>
                            </button>
                            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#eceef1] transition-colors flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#006d2f]">add</span>
                                <span className="text-sm">Add New Product</span>
                            </button>
                            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#eceef1] transition-colors flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#006d2f]">shopping_cart</span>
                                <span className="text-sm">View Orders</span>
                            </button>
                            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#eceef1] transition-colors flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#006d2f]">analytics</span>
                                <span className="text-sm">View Reports</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-[#bbcbb9] shadow-sm p-6">
                        <h3 className="font-bold text-[#191c1e] mb-4">Store Status Guide</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                <span className="material-symbols-outlined text-green-600">check_circle</span>
                                <div>
                                    <p className="text-sm font-medium text-green-700">Published ✅</p>
                                    <p className="text-xs text-green-600">Store is live and visible to customers</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                                <span className="material-symbols-outlined text-yellow-600">edit_note</span>
                                <div>
                                    <p className="text-sm font-medium text-yellow-700">Draft 📝</p>
                                    <p className="text-xs text-yellow-600">Store is being built, not visible to customers</p>
                                    <p className="text-[10px] text-yellow-500 mt-0.5">⚠️ Drafts are automatically removed after 120 days</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <span className="material-symbols-outlined text-gray-600">visibility_off</span>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Unpublished ⛔</p>
                                    <p className="text-xs text-gray-600">Store was published but now hidden</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                */}
            </main>

            <BottomNav />
        </div>
    );
};

export default DashboardReturnUser;