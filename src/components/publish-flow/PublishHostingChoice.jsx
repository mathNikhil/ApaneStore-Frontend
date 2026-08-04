import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { storeAPI } from '../../services/api';
import PublishFlowHeader from './PublishFlowHeader';

const PublishHostingChoice = () => {
    const [searchParams] = useSearchParams();
    const storeId = searchParams.get('storeId');
    const navigate = useNavigate();

    const [hostingType, setHostingType] = useState('apnaestore');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleContinue = async () => {
        setError('');
        const customDomain = sessionStorage.getItem('publishFlow_customDomain');
        if (!customDomain) {
            navigate(`/store-builder/publish/domain?storeId=${storeId}`);
            return;
        }

        if (hostingType === 'own') {
            // Own hosting needs the server details screen next before saving
            navigate(`/store-builder/publish/own-hosting?storeId=${storeId}`);
            return;
        }

        setSaving(true);
        try {
            const result = await storeAPI.saveDomainConfig(storeId, {
                domainType: 'custom',
                customDomain,
                hostingType: 'apnaestore',
            });
            if (!result.success) {
                setError(result.error || 'Failed to save. Please try again.');
                setSaving(false);
                return;
            }
            navigate(`/store-builder/publish/hosting-success?storeId=${storeId}`);
        } catch (err) {
            setError(err.message || 'Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f7f9fc] pb-24">
            <PublishFlowHeader title="Hosting" step={2} storeId={storeId} onBack={() => navigate(`/store-builder/publish/domain?storeId=${storeId}`)} />

            <div className="max-w-lg mx-auto px-4 py-8">
                {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

                {/* ApnaEstore Hosting */}
                <button
                    onClick={() => setHostingType('apnaestore')}
                    className={`w-full text-left p-5 rounded-2xl border-2 mb-4 transition-all relative ${
                        hostingType === 'apnaestore' ? 'border-[#006d2f] bg-white' : 'border-[#e0e3e6] bg-[#f2f4f7]'
                    }`}
                >
                    <span className="absolute -top-2.5 left-5 text-[10px] font-bold text-white bg-[#006d2f] px-2 py-0.5 rounded-full">RECOMMENDED</span>
                    <div className="flex items-center justify-between mb-3 mt-1">
                        <div>
                            <h3 className="font-bold text-[#191c1e]">ApnaEstore Hosting</h3>
                            <span className="text-xs font-semibold text-[#006d2f]">Managed &amp; Optimized</span>
                        </div>
                        {hostingType === 'apnaestore' && <span className="material-symbols-outlined text-[#006d2f]">check_circle</span>}
                    </div>
                    <ul className="space-y-1.5 text-sm text-[#556067]">
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-[#006d2f]">check_circle</span>Included in your plan</li>
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-[#006d2f]">check_circle</span>No technical knowledge needed</li>
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-[#006d2f]">check_circle</span>99.9% uptime guaranteed</li>
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-[#006d2f]">check_circle</span>SSL certificate included</li>
                    </ul>
                </button>

                {/* My Own Hosting */}
                <button
                    onClick={() => setHostingType('own')}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                        hostingType === 'own' ? 'border-[#006d2f] bg-white' : 'border-[#e0e3e6] bg-[#f2f4f7]'
                    }`}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="font-bold text-[#191c1e]">My Own Hosting</h3>
                            <span className="text-xs font-semibold text-[#8e9eab]">Self-Managed</span>
                        </div>
                        {hostingType === 'own' && <span className="material-symbols-outlined text-[#006d2f]">check_circle</span>}
                    </div>
                    <ul className="space-y-1.5 text-sm text-[#556067]">
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-[#8e9eab]">info</span>Technical setup required</li>
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-[#8e9eab]">cloud</span>Use your own hosting provider</li>
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-[#8e9eab]">settings</span>You manage updates, security, and uptime</li>
                    </ul>
                    <p className="text-xs text-[#8e9eab] mt-3">Select this if you already have a server and technical expertise.</p>
                </button>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e0e3e6] px-4 py-4 flex justify-between">
                <button
                    onClick={() => navigate(`/store-builder/publish/domain?storeId=${storeId}`)}
                    className="px-6 py-3 bg-[#eceef1] text-[#556067] font-semibold rounded-xl hover:bg-[#d9e4ec] transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Back
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

export default PublishHostingChoice;
