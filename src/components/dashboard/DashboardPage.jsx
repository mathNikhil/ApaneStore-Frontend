import { showSuccess, showError } from '../../utils/toast';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DashboardFirstTime from './DashboardFirstTime';
import DashboardReturnUser from './DashboardReturnUser';

const DashboardPage = () => {
    const [hasStores, setHasStores] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stores, setStores] = useState([]);
    const [subscriptions, setSubscriptions] = useState({});
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

    // ✅ Wrap fetch in useCallback so it can be called from child
    const fetchStores = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('token');
            
            if (!token) {
                setHasStores(false);
                setLoading(false);
                return;
            }

            const response = await axios.get(`${API_URL}/api/stores`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data?.success && response.data?.data) {
                const storeList = response.data.data;
                // Fetch subscription status for published stores
                const subs = {};
                for (const store of storeList) {
                    if (store.status === 'published' || store.status === 'active') {
                        try {
                            const subRes = await axios.get(`${API_URL}/api/stores/${store.id}/subscription-status`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (subRes.data?.success && subRes.data?.data) {
                                subs[store.id] = subRes.data.data;
                            }
                        } catch (e) {
                            console.error('Failed to fetch subscription for store', store.id);
                        }
                    }
                }
                setSubscriptions(subs);
                setStores(storeList);
                setHasStores(storeList.length > 0);
            } else {
                setHasStores(false);
            }
        } catch (error) {
            console.error('❌ Error checking stores:', error);
            setError(error.response?.data?.error || error.message);
            setHasStores(false);
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchStores();
    }, [fetchStores]);

    // ✅ Pass fetchStores to child so it can refresh after delete
    const handleStoreUpdate = (storeId, newStatus) => {
        if (newStatus === null) {
            // Store was deleted - refresh the list
            fetchStores();
        } else {
            // Store status was updated
            setStores(prevStores => 
                prevStores.map(store => 
                    store.id === storeId 
                        ? { ...store, status: newStatus }
                        : store
                )
            );
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

    if (error) {
        return (
            <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center p-4">
                <div className="bg-white rounded-xl p-6 max-w-md w-full text-center border border-red-200">
                    <span className="material-symbols-outlined text-4xl text-red-500 block mb-4">error</span>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Error Loading Dashboard</h3>
                    <p className="text-gray-600 text-sm">{error}</p>
                    <button 
                        onClick={fetchStores}
                        className="mt-4 px-4 py-2 bg-[#25D366] text-[#005523] rounded-lg font-semibold hover:brightness-105"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const isImpersonated = localStorage.getItem('isImpersonated') === 'true';
    const impersonationBanner = isImpersonated ? (
        <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
            background: '#dc2626', color: '#fff', 
            padding: '8px 16px', textAlign: 'center',
            fontSize: 13, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
        }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>admin_panel_settings</span>
            ⚠️ Super Admin Mode — You are managing this tenant's dashboard
            <button 
                onClick={() => { localStorage.clear(); window.location.href = '/'; }}
                style={{ marginLeft: 16, padding: '2px 12px', background: '#fff', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 12 }}
            >
                Exit
            </button>
        </div>
    ) : null;

    if (hasStores) {
        return <>{impersonationBanner}<div style={isImpersonated ? { marginTop: 40 } : {}}><DashboardReturnUser stores={stores} subscriptions={subscriptions} onStoreUpdate={handleStoreUpdate} /></div></>;
    }

    return <>{impersonationBanner}<div style={isImpersonated ? { marginTop: 40 } : {}}><DashboardFirstTime /></div></>;
};

export default DashboardPage;