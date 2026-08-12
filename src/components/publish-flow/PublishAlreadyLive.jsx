import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeAPI } from '../../services/api';

// 🔒 Shown instead of any publish-flow screen once a store is live.
// Domain, hosting, and plan are locked until the tenant unpublishes —
// this screen exists so a direct URL (e.g. .../publish/domain?storeId=..)
// can't be used to bypass that lock. Unpublish action itself isn't wired
// up yet; this just explains the lock and sends them back to the dashboard.
const PublishAlreadyLive = ({ storeId }) => {
    const navigate = useNavigate();
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const result = await storeAPI.getById(storeId);
                if (result.success) setStore(result.data);
            } catch (err) {
                console.error('Failed to load store info:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [storeId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc]">
                <span className="material-symbols-outlined animate-spin text-3xl text-[#556067]">progress_activity</span>
            </div>
        );
    }

    const storeUrl = `${store?.subdomain || ''}.aapnaestore.com`;

    return (
        <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl border border-[#e0e3e6] p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#25D366]/20 flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-3xl text-[#006d2f]">lock</span>
                    </div>
                    <h1 className="text-xl font-bold text-[#191c1e] mb-2">Your store is already live</h1>
                    <p className="text-sm text-[#556067] mb-5">
                        Domain, hosting, and plan are locked while your store is published.
                        To change any of these, unpublish your store first — you'll then go
                        through the setup and payment again to relaunch.
                    </p>

                    <div className="bg-[#f2f4f7] rounded-lg px-4 py-3 mb-6">
                        <div className="text-xs text-[#8e9eab] mb-1">LIVE AT</div>
                        <span className="font-mono text-sm text-[#006d2f] break-all">{storeUrl}</span>
                    </div>

                    <div className="bg-[#f2f4f7] border-l-4 border-[#006d2f] rounded-lg p-3 text-left text-xs text-[#556067] mb-6">
                        Product details, pricing, policies, and store profile can still be
                        edited any time from <strong>Edit Store</strong> — those changes go
                        live instantly and don't need republishing.
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex-1 py-3 bg-[#006d2f] text-white font-semibold rounded-xl"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublishAlreadyLive;
