import { showSuccess, showError } from '../../utils/toast';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../Common/TopAppBar';
import Button from '../Common/Button';
import BottomNav from '../Common/BottomNav';
import StoreCard from './StoreCard';

const DashboardReturnUser = ({ stores = [], subscriptions = {}, onStoreUpdate }) => {
    const navigate = useNavigate();

    // Handle Gmail OAuth return
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const gmail = params.get('gmail');
        const email = params.get('email');
        if (gmail === 'connected' && email) {
            showSuccess(`Gmail connected: ${email}`);
            window.history.replaceState({}, '', '/dashboard');
        } else if (gmail === 'error') {
            showError('Gmail connection failed. Please try again.');
            window.history.replaceState({}, '', '/dashboard');
        }
    }, []);

    // ✅ Get tenant name from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantName = user?.company_name || user?.full_name || user?.name || 'Tenant';

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
                        onClick={() => navigate('/store-builder/step/1?new=true')}
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
                        {stores.map((store) => (
                            <StoreCard
                                key={store.id}
                                store={store}
                                subscriptions={subscriptions}
                                onStoreUpdate={onStoreUpdate}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-[#bbcbb9]">
                        <span className="material-symbols-outlined text-6xl text-gray-300 block mb-4">storefront</span>
                        <h3 className="text-xl font-bold text-gray-600 mb-2">No Stores Yet</h3>
                        <p className="text-gray-400">Click "Launch New eStore" to create your first store</p>
                    </div>
                )}

            </main>
            <BottomNav />

        </div>
    );
};

export default DashboardReturnUser;