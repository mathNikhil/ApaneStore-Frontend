import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopAppBar from '../common/TopAppBar';
import Button from '../common/Button';
import BottomNav from '../common/BottomNav';
import logo from '../../assets/images/Apnaestore-Logo.png';

const DashboardReturnUser = ({ stores = [], onStoreUpdate }) => {
    const navigate = useNavigate();
    const [updating, setUpdating] = useState(null);
    const [error, setError] = useState(null);

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

    // ✅ Get status badge styling
    const getStatusBadge = (status) => {
        const statuses = {
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
    const getStatusActions = (store) => {
        const actions = [];
        
        if (store.status === 'draft') {
            actions.push({
                label: 'Publish',
                action: () => handleStatusChange(store.id, 'active'),
                className: 'bg-[#25D366] text-[#005523] hover:brightness-105'
            });
        } else if (store.status === 'active') {
            actions.push({
                label: 'Unpublish',
                action: () => handleStatusChange(store.id, 'inactive'),
                className: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            });
        } else if (store.status === 'inactive') {
            actions.push({
                label: 'Publish Again',
                action: () => handleStatusChange(store.id, 'active'),
                className: 'bg-[#25D366] text-[#005523] hover:brightness-105'
            });
        }
        
        return actions;
    };

    // ✅ Navigate to Store Admin Panel
    const goToStoreAdmin = (storeId) => {
        navigate(`/store-admin/${storeId}/dashboard`);
    };

    // ✅ Stats based on all stores
    const stats = {
        total: stores.length,
        active: stores.filter(s => s.status === 'active').length,
        draft: stores.filter(s => s.status === 'draft').length,
        inactive: stores.filter(s => s.status === 'inactive').length,
    };

    console.log('🔄 DashboardReturnUser - All Stores:', stores.length);
    console.log('📊 Stats:', stats);

    return (
        <div className="min-h-screen bg-[#f7f9fc] pb-24 lg:pb-0">
            <TopAppBar title="eStore Manager" showProfile={true} />

            <main className="max-w-7xl mx-auto px-4 py-6">
                {/* ApnaEstore Logo */}
                <div className="flex items-center gap-4 mb-6">
                    <img 
                        src={logo} 
                        alt="ApnaEstore" 
                        className="h-14 w-auto"
                    />
                </div>

                {/* Welcome Section */}
                <div className="mb-4">
                    <h1 className="text-3xl font-bold text-[#191c1e]">Welcome, {tenantName}!</h1>
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
                            
                            return (
                                <div key={store.id} className="bg-white rounded-2xl border border-[#bbcbb9] shadow-sm p-6 hover:shadow-md transition-shadow">
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
                                        🔗 {store.subdomain ? `${store.subdomain}.apnaestore.com` : 'No domain set'}
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-[#eceef1]">
                                        {/* ✅ NEW: Store Admin Panel Button */}
                                        <button 
                                            onClick={() => goToStoreAdmin(store.id)}
                                            className="px-4 py-2 bg-[#006d2f] text-white font-semibold text-sm rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-base">dashboard</span>
                                            Store Admin Panel
                                        </button>
                                        
                                       <button 
    onClick={() => {
        console.log('📝 Editing store:', store.id);
        navigate(`/store-builder/step/1?storeId=${store.id}`);
    }}
    className="px-4 py-2 bg-[#eceef1] text-[#006d2f] font-semibold text-sm rounded-xl hover:bg-[#d9e4ec] active:scale-[0.98] transition-all flex items-center gap-2"
>
    <span className="material-symbols-outlined text-base">edit</span>
    Edit Store
</button>
                                        
                                        <button 
                                            onClick={() => window.open(`http://${store.subdomain}.apnaestore.com`, '_blank')}
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

                                    {/* ✅ Store Admin Panel Info */}
                                    <div className="mt-3 pt-3 border-t border-dashed border-[#e0e3e6]">
                                        <p className="text-xs text-[#6c7b6b] flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">info</span>
                                            Each store has its own admin panel to manage orders, customers, products, and deliveries
                                        </p>
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

                {/* Quick Actions */}
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
                            <div clasName="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
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
            </main>

            <BottomNav />
        </div>
    );
};

export default DashboardReturnUser;