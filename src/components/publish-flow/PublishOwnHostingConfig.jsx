import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { storeAPI } from '../../services/api';
import PublishFlowHeader from './PublishFlowHeader';

const PublishOwnHostingConfig = () => {
    const [searchParams] = useSearchParams();
    const storeId = searchParams.get('storeId');
    const navigate = useNavigate();

    const [serverIp, setServerIp] = useState('');
    const [provider, setProvider] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleContinue = async () => {
        setError('');
        if (!serverIp.trim()) {
            setError('Please enter your server IP address');
            return;
        }

        // ✅ Works for both domain types — a subdomain store can also be
        // hosted on the tenant's own server.
        const domainType = localStorage.getItem('publishFlow_domainType');
        if (!domainType) {
            navigate(`/store-builder/publish/domain?storeId=${storeId}`);
            return;
        }
        const customDomain = domainType === 'custom' ? localStorage.getItem('publishFlow_customDomain') : null;
        if (domainType === 'custom' && !customDomain) {
            navigate(`/store-builder/publish/domain?storeId=${storeId}`);
            return;
        }

        setSaving(true);
        try {
            const result = await storeAPI.saveDomainConfig(storeId, {
                domainType,
                ...(domainType === 'custom' ? { customDomain } : {}),
                hostingType: 'own',
                ownHostingServerIp: serverIp.trim(),
                ownHostingProvider: provider.trim() || null,
            });
            if (!result.success) {
                setError(result.error || 'Failed to save. Please try again.');
                setSaving(false);
                return;
            }
            // Own hosting means we're not involved in serving the site at
            // all — nothing of ours for DNS to point at, regardless of
            // domain type — so straight to payment either way.
            navigate(`/store-builder/publish/payment?storeId=${storeId}`);
        } catch (err) {
            setError(err.message || 'Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f7f9fc] pb-24">
            <PublishFlowHeader title="Configure Your Own Hosting" step={2} storeId={storeId} onBack={() => navigate(`/store-builder/publish/hosting?storeId=${storeId}`)} />

            <div className="max-w-lg mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-[#191c1e] mb-2">Configure Your Own Hosting</h1>
                <p className="text-[#556067] mb-6">Enter your server details where your store will be hosted</p>

                {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

                <div className="bg-white rounded-2xl border border-[#e0e3e6] p-5 mb-4">
                    <h3 className="font-semibold text-[#191c1e] mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#006d2f]">dns</span>
                        Server Details
                    </h3>
                    <label className="text-sm font-medium text-[#191c1e] block mb-1">Server IP Address</label>
                    <input
                        type="text"
                        value={serverIp}
                        onChange={(e) => setServerIp(e.target.value)}
                        placeholder="192.168.1.100"
                        className="w-full px-3 py-2.5 border border-[#e0e3e6] rounded-lg text-sm mb-1"
                    />
                    <p className="text-xs text-[#8e9eab] mb-4">This is the IP address provided by your hosting provider</p>

                    <label className="text-sm font-medium text-[#191c1e] block mb-1">Hosting Provider (Optional)</label>
                    <input
                        type="text"
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                        placeholder="e.g. Hostinger, DigitalOcean"
                        className="w-full px-3 py-2.5 border border-[#e0e3e6] rounded-lg text-sm"
                    />
                    <p className="text-xs text-[#8e9eab] mt-1">This helps us provide provider-specific instructions</p>
                </div>

                <div className="bg-[#f2f4f7] rounded-2xl p-5">
                    <h4 className="font-semibold text-[#191c1e] mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#006d2f]">checklist</span>
                        Requirements for Own Hosting
                    </h4>
                    <ul className="space-y-2 text-sm text-[#556067]">
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-[#006d2f]">check_circle</span>Node.js 20+ installed</li>
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-[#006d2f]">check_circle</span>PostgreSQL 16+ database</li>
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-[#006d2f]">check_circle</span>SSL certificate configured</li>
                    </ul>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e0e3e6] px-4 py-4 flex justify-between">
                <button
                    onClick={() => navigate(`/store-builder/publish/hosting?storeId=${storeId}`)}
                    className="px-6 py-3 bg-[#eceef1] text-[#556067] font-semibold rounded-xl hover:bg-[#d9e4ec] transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Previous
                </button>
                <button
                    onClick={handleContinue}
                    disabled={saving}
                    className="px-8 py-3 bg-[#006d2f] text-white font-semibold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {saving ? 'Saving...' : 'Continue'}
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
            </div>
        </div>
    );
};

export default PublishOwnHostingConfig;
