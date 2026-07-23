import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../Common/TopAppBar';
import BottomNav from '../Common/BottomNav';
import StoreCard from './StoreCard';
import { useAuth } from '../../Context/AuthContext';

const DashboardReturnUser = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        published: 0,
        draft: 0,
    });

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5002/api/stores', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (result.success) {
                setStores(result.data);
                const published = result.data.filter(s => s.status === 'published').length;
                const draft = result.data.filter(s => s.status === 'draft').length;
                setStats({
                    total: result.data.length,
                    published: published,
                    draft: draft,
                });
            }
        } catch (error) {
            console.error('Error fetching stores:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLaunchNewStore = () => {
        navigate('/store-builder/new/step/1');
    };

    return (
        <div className="min-h-screen bg-[#f7f9fc] pb-24">
            <TopAppBar title="eStore Manager" showProfile={true} />

            <main className="max-w-7xl mx-auto px-4 py-6">
                {/* Welcome Section */}
                <div className="mb-4">
                    <h1 className="text-3xl font-bold text-[#191c1e]">
                        Welcome, {user?.company_name || 'there'} 👋
                    </h1>
                    <p className="text-[#3c4a3d] mt-1">
                        Manage and scale your digital business.
                    </p>
                </div>

                {/* Launch Button - FIXED */}
                <div className="mb-8">
                    <button 
                        onClick={handleLaunchNewStore} 
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#25D366] text-[#005523] font-bold text-lg rounded-xl hover:brightness-105 active:scale-[0.98] transition-all"
                    >
                        <span className="material-symbols-outlined text-xl">add</span>
                        Launch New eStore
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-xl border border-[#bbcbb9] shadow-sm hover:shadow-md transition-shadow text-center">
                        <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-xs text-[#3c4a3d] font-semibold">Total</span>
                            <span className="material-symbols-outlined text-[#556067] opacity-50 text-base">inventory_2</span>
                        </div>
                        <div className="text-2xl font-bold text-[#191c1e]">{stats.total}</div>
                        <div className="text-[10px] text-[#3c4a3d] mt-1">Stores</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-[#bbcbb9] shadow-sm hover:shadow-md transition-shadow text-center">
                        <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-xs text-[#3c4a3d] font-semibold">Published</span>
                            <span className="material-symbols-outlined text-[#006d2f] opacity-50 text-base">bolt</span>
                        </div>
                        <div className="text-2xl font-bold text-[#191c1e]">{stats.published}</div>
                        <div className="text-[10px] text-[#3c4a3d] mt-1">Live</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-[#bbcbb9] shadow-sm hover:shadow-md transition-shadow text-center">
                        <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-xs text-[#3c4a3d] font-semibold">Draft</span>
                            <span className="material-symbols-outlined text-[#006b58] opacity-50 text-base">edit_note</span>
                        </div>
                        <div className="text-2xl font-bold text-[#191c1e]">{stats.draft}</div>
                        <div className="text-[10px] text-[#3c4a3d] mt-1">Draft</div>
                    </div>
                </div>

                {/* Stores List */}
                <h2 className="text-xl font-bold text-[#191c1e] mb-4">Your eStores</h2>

                {loading ? (
                    <div className="text-center py-8 text-[#8e9eab]">Loading stores...</div>
                ) : stores.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-[#bbcbb9] p-12 text-center">
                        <div className="w-16 h-16 bg-[#25D366]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-[#006d2f] text-4xl">add_business</span>
                        </div>
                        <h3 className="text-xl font-bold text-[#191c1e] mb-2">No Stores Yet</h3>
                        <p className="text-[#3c4a3d] mb-4">Create your first store to get started.</p>
                        <button 
                            onClick={handleLaunchNewStore} 
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#25D366] text-[#005523] font-bold rounded-xl hover:brightness-105 active:scale-[0.98] transition-all"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Create Store
                        </button>
                    </div>
                ) : (
                    <div>
                        {stores.map(store => (
                            <StoreCard key={store.id} store={store} />
                        ))}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="bg-white rounded-2xl border border-[#bbcbb9] shadow-sm p-6">
                        <h3 className="font-bold text-[#191c1e] mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#eceef1] transition-colors flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#006d2f]">inventory_2</span>
                                <span className="text-sm font-medium">Manage Inventory</span>
                            </button>
                            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#eceef1] transition-colors flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#006d2f]">add</span>
                                <span className="text-sm font-medium">Add New Product</span>
                            </button>
                            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#eceef1] transition-colors flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#006d2f]">analytics</span>
                                <span className="text-sm font-medium">View Reports</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-[#bbcbb9] shadow-sm p-6">
                        <h3 className="font-bold text-[#191c1e] mb-4">Recent Orders</h3>
                        <div className="text-center py-6 text-[#8e9eab]">
                            <span className="material-symbols-outlined text-4xl block mb-2">shopping_cart</span>
                            <p>No recent orders</p>
                            <p className="text-sm">Orders will appear here once customers purchase.</p>
                        </div>
                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
};

export default DashboardReturnUser;
