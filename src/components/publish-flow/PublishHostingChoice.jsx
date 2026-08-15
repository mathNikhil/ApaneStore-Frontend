import { showSuccess, showError } from '../../utils/toast';
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
        showError('');

        // ✅ Works for both domain types now — subdomain tenants can also
        // choose their own hosting, not just ApnaEstore's.
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

        if (hostingType === 'own') {
            // Own hosting needs the server details screen next, regardless
            // of domain type — it saves the full config once submitted.
            navigate(`/store-builder/publish/own-hosting?storeId=${storeId}`);
            return;
        }

        setSaving(true);
        try {
            const result = await storeAPI.saveDomainConfig(storeId, {
                domainType,
                ...(domainType === 'custom' ? { customDomain } : {}),
                hostingType: 'apnaestore',
            });
            if (!result.success) {
                setError(result.error || 'Failed to save. Please try again.');
                setSaving(false);
                return;
            }
            // Only a custom domain on our hosting needs DNS records added
            // by the tenant. A subdomain on our hosting is already fully
            // configured (it's under our own wildcard DNS) — nothing left
            // to set up, so go straight to payment.
            if (domainType === 'custom') {
                navigate(`/store-builder/publish/hosting-success?storeId=${storeId}`);
            } else {
                navigate(`/store-builder/publish/payment?storeId=${storeId}`);
            }
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
                <h1 className="text-3xl font-bold text-[#191c1e] mb-2">Choose your hosting</h1>
                <p className="text-[#556067] mb-6">Decide who manages the server your store runs on. You can always change this later.</p>

                

                {/* ApnaEstore Hosting — same card language as the domain
                    selection screen: white background always, radio circle
                    on the left, selected = colored border + tint. */}
                <button
                    onClick={() => setHostingType('apnaestore')}
                    className={`w-full text-left p-5 rounded-2xl border-2 mb-4 transition-all ${
                        hostingType === 'apnaestore' ? 'border-[#25D366] bg-[#25D366]/5' : 'border-[#e0e3e6] bg-white'
                    }`}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`material-symbols-outlined ${hostingType === 'apnaestore' ? 'text-[#006d2f]' : 'text-[#bbcbb9]'}`}>
                            {hostingType === 'apnaestore' ? 'radio_button_checked' : 'radio_button_unchecked'}
                        </span>
                        <h3 className="text-lg font-semibold text-[#191c1e]">Aapna e store Hosting</h3>
                        <span className="ml-auto text-xs font-bold text-[#005523] bg-[#25D366]/20 px-2 py-1 rounded-full">RECOMMENDED</span>
                    </div>
                    <p className="text-sm text-[#556067] mb-3">Managed &amp; optimized — included in your plan, no technical setup required.</p>
                    <ul className="space-y-1.5 text-sm text-[#556067]">
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-[#006d2f]">check_circle</span>No technical knowledge needed</li>
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-[#006d2f]">check_circle</span>99.9% uptime guaranteed</li>
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-[#006d2f]">check_circle</span>SSL certificate included</li>
                    </ul>
                </button>

                {/* My Own Hosting — same white-card treatment, never
                    greyed out; it's a fully active, selectable option. */}
                <button
                    onClick={() => setHostingType('own')}
                    className={`w-full text-left p-5 rounded-2xl border-2 mb-4 transition-all ${
                        hostingType === 'own' ? 'border-[#25D366] bg-[#25D366]/5' : 'border-[#e0e3e6] bg-white'
                    }`}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`material-symbols-outlined ${hostingType === 'own' ? 'text-[#006d2f]' : 'text-[#bbcbb9]'}`}>
                            {hostingType === 'own' ? 'radio_button_checked' : 'radio_button_unchecked'}
                        </span>
                        <h3 className="text-lg font-semibold text-[#191c1e]">My Own Hosting</h3>
                    </div>
                    <p className="text-sm text-[#556067] mb-3">Self-managed — use your own hosting provider and server.</p>
                    <ul className="space-y-1.5 text-sm text-[#556067]">
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-[#8e9eab]">info</span>Technical setup required</li>
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
