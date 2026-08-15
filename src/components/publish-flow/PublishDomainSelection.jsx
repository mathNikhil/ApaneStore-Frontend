import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { storeAPI } from '../../services/api';
import PublishFlowHeader from './PublishFlowHeader';
// 🖼️ Save the two uploaded logo files into your assets folder with these
// exact names (or update the paths below to match whatever you name them):
//   src/assets/images/godaddy-logo.png
//   src/assets/images/hostinger-logo.png
import godaddyLogo from '../../assets/images/godaddy-logo.png';
import hostingerLogo from '../../assets/images/hostinger-logo.png';

const PublishDomainSelection = () => {
    const [searchParams] = useSearchParams();
    const storeId = searchParams.get('storeId');
    const navigate = useNavigate();

    const [domainType, setDomainType] = useState('subdomain');
    const [customDomain, setCustomDomain] = useState('');
    const [subdomainSlug, setSubdomainSlug] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const storeResult = await storeAPI.getById(storeId);
                if (storeResult.success) {
                    setSubdomainSlug(storeResult.data.subdomain || '');
                }
                const flowResult = await storeAPI.getPublishFlowState(storeId);
                if (flowResult.success && flowResult.data.domainConfig) {
                    const cfg = flowResult.data.domainConfig;
                    setDomainType(cfg.domain_type);
                    setCustomDomain(cfg.custom_domain || '');
                }
            } catch (err) {
                console.error('Failed to load domain config:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [storeId]);

    const handleNext = () => {
        setError('');
        if (domainType === 'custom' && !customDomain.trim()) {
            setError('Please enter your domain (e.g. example.com)');
            return;
        }

        // ✅ Both subdomain and custom domain now go through a hosting
        // choice next — tenants can bring their own server either way.
        // Nothing is saved to the backend yet; the hosting screens save
        // the full domain+hosting config together once hosting is picked.
        localStorage.setItem('publishFlow_domainType', domainType);
        if (domainType === 'custom') {
            localStorage.setItem('publishFlow_customDomain', customDomain.trim());
        } else {
            localStorage.removeItem('publishFlow_customDomain');
        }
        navigate(`/store-builder/publish/hosting?storeId=${storeId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc]">
                <span className="material-symbols-outlined animate-spin text-3xl text-[#556067]">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f7f9fc] pb-24">
            <PublishFlowHeader title="Choose your store address" step={1} storeId={storeId} />

            <div className="max-w-lg mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-[#191c1e] mb-2">Choose your store address</h1>
                <p className="text-[#556067] mb-6">Decide how customers will find your store on the web. You can always change this later.</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
                )}

                {/* Free Subdomain */}
                <button
                    onClick={() => setDomainType('subdomain')}
                    className={`w-full text-left p-5 rounded-2xl border-2 mb-4 transition-all ${
                        domainType === 'subdomain' ? 'border-[#25D366] bg-[#25D366]/5' : 'border-[#e0e3e6] bg-white'
                    }`}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`material-symbols-outlined ${domainType === 'subdomain' ? 'text-[#006d2f]' : 'text-[#bbcbb9]'}`}>
                            {domainType === 'subdomain' ? 'radio_button_checked' : 'radio_button_unchecked'}
                        </span>
                        <h3 className="text-lg font-semibold text-[#191c1e]">Free Subdomain</h3>
                        <span className="ml-auto text-xs font-bold text-[#005523] bg-[#25D366]/20 px-2 py-1 rounded-full">INCLUDED</span>
                    </div>
                    <p className="text-sm text-[#556067] mb-3">Use a professional aapnaestore.com address for zero cost.</p>
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#f2f4f7] rounded-lg text-sm">
                        <span className="material-symbols-outlined text-base text-[#8e9eab]">public</span>
                        <span className="font-medium text-[#191c1e]">{subdomainSlug || 'yourstore'}</span>
                        <span className="text-[#8e9eab]">.aapnaestore.com</span>
                    </div>
                </button>

                {/* Custom Domain */}
                <button
                    onClick={() => setDomainType('custom')}
                    className={`w-full text-left p-5 rounded-2xl border-2 mb-4 transition-all ${
                        domainType === 'custom' ? 'border-[#25D366] bg-[#25D366]/5' : 'border-[#e0e3e6] bg-white'
                    }`}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`material-symbols-outlined ${domainType === 'custom' ? 'text-[#006d2f]' : 'text-[#bbcbb9]'}`}>
                            {domainType === 'custom' ? 'radio_button_checked' : 'radio_button_unchecked'}
                        </span>
                        <h3 className="text-lg font-semibold text-[#191c1e]">Custom Domain</h3>
                    </div>
                    <p className="text-sm text-[#556067] mb-3">Connect a domain you already own (e.g.,example.com) to your store.</p>
                    {domainType === 'custom' && (
                        <>
                            <input
                                type="text"
                                value={customDomain}
                                onChange={(e) => setCustomDomain(e.target.value)}
                                placeholder="example.com"
                                onClick={(e) => e.stopPropagation()}
                                className="w-full px-3 py-2.5 border border-[#e0e3e6] rounded-lg text-sm mb-3"
                            />
                            {/* 🛒 Buy-a-domain shortcuts — opens the provider's own
                                domain search in a new tab. Not an affiliate/API
                                integration, just a convenience link for tenants
                                who don't own a domain yet. */}
                            <div className="mb-2">
                                <div className="text-center mb-2">
                                    <span className="text-[10px] text-[#8e9eab] font-semibold uppercase tracking-wide">YOU CAN BUY YOUR DOMAIN FROM</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href="https://www.godaddy.com/domains"
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex-1 flex items-center justify-center px-3 py-2.5 rounded-lg border border-[#e0e3e6] hover:border-[#006d2f] hover:bg-[#f2f4f7] transition-all"
                                    >
                                        <img src={godaddyLogo} alt="GoDaddy" className="h-4 object-contain" />
                                    </a>
                                    <a
                                        href="https://www.hostinger.com/domain-name-search"
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex-1 flex items-center justify-center px-3 py-2.5 rounded-lg border border-[#e0e3e6] hover:border-[#006d2f] hover:bg-[#f2f4f7] transition-all"
                                    >
                                        <img src={hostingerLogo} alt="Hostinger" className="h-4 object-contain" />
                                    </a>
                                </div>
                            </div>
                        </>
                    )}
                    <p className="text-xs text-[#8e9eab] mt-1">🔒 Free SSL certificate included</p>
                </button>

                <div className="bg-[#25D366]/10 rounded-2xl p-5 text-center mt-6">
                    <h4 className="font-semibold text-[#191c1e] mb-1">Build Trust with a Brand</h4>
                    <p className="text-sm text-[#556067]">Stores with custom domains see up to 35% higher conversion rates. Don't worry, you can always transition from a subdomain later.</p>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e0e3e6] px-4 py-4 flex justify-end">
                <button
                    onClick={handleNext}
                    className="px-8 py-3 bg-[#006d2f] text-white font-semibold rounded-xl hover:brightness-110 transition-all flex items-center gap-2"
                >
                    Next
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
            </div>
        </div>
    );
};

export default PublishDomainSelection;
