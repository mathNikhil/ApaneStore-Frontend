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
            // Cache per store so StoreCard can show connected state immediately
            const storeId = params.get('storeId');
            if (storeId) {
                try { localStorage.setItem(`gmail_connected_${storeId}`, email); } catch {}
            }
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                    {[
                        { label: 'Total', sub: 'All Stores', value: stats.total, icon: 'inventory_2', color: '#191c1e', iconColor: '#556067' },
                        { label: 'Published', sub: 'Live', value: stats.active, icon: 'check_circle', color: '#16a34a', iconColor: '#006d2f' },
                        { label: 'Draft', sub: 'In Progress', value: stats.draft, icon: 'edit_note', color: '#ca8a04', iconColor: '#006b58' },
                        { label: 'Unpublished', sub: 'Hidden', value: stats.inactive, icon: 'visibility_off', color: '#6b7280', iconColor: '#556067' },
                    ].map(card => (
                        <div key={card.label} className="bg-white p-3 rounded-xl border border-[#bbcbb9] shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] text-[#3c4a3d] font-semibold truncate mr-1">{card.label}</span>
                                <span className="material-symbols-outlined shrink-0 opacity-40 text-base" style={{ color: card.iconColor }}>{card.icon}</span>
                            </div>
                            <div className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</div>
                            <div className="text-[10px] text-[#9aab98] mt-0.5">{card.sub}</div>
                        </div>
                    ))}
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