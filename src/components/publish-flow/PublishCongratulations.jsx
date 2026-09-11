import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { storeAPI } from '../../services/api';


const EmbedCodeCard = ({ storeUrl }) => {
    const [open, setOpen] = React.useState(false);
    const [copied, setCopied] = React.useState(false);

    const embedCode = `<iframe
  src="https://${storeUrl}"
  style="width:100%;height:100vh;border:none;"
  title="My Store">
</iframe>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(embedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white rounded-2xl border border-[#e0e3e6] p-5 text-left mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#006d2f]">code</span>
                    <div>
                        <p className="font-semibold text-sm text-[#191c1e]">Embed on your website</p>
                        <p className="text-xs text-[#556067]">Add your store to any existing website</p>
                    </div>
                </div>
                <button
                    onClick={() => setOpen(!open)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#006d2f] text-[#006d2f] text-xs font-semibold hover:bg-[#006d2f]/10 transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">{open ? 'expand_less' : 'expand_more'}</span>
                    {open ? 'Hide' : 'Get Code'}
                </button>
            </div>

            {open && (
                <div className="mt-4">
                    <p className="text-xs text-[#556067] mb-3">
                        Paste this code into your website's catalog or shop page. Works on WordPress, Wix, Shopify, Webflow, and any custom HTML site.
                    </p>

                    {/* Step by step */}
                    <div className="space-y-2 mb-4">
                        {[
                            { n: '1', text: 'Copy the embed code below' },
                            { n: '2', text: 'Open your website editor (WordPress, Wix, etc.)' },
                            { n: '3', text: 'Create a new page called "Shop" or "Catalog"' },
                            { n: '4', text: 'Add a Custom HTML block and paste the code' },
                            { n: '5', text: 'Publish — your store is now live on your website!' },
                        ].map(s => (
                            <div key={s.n} className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-[#006d2f] text-white text-xs flex items-center justify-center flex-shrink-0 font-bold">{s.n}</span>
                                <p className="text-xs text-[#556067]">{s.text}</p>
                            </div>
                        ))}
                    </div>

                    {/* Code block */}
                    <div className="bg-[#191c1e] rounded-xl p-4 relative">
                        <pre className="text-xs text-[#25D366] overflow-x-auto whitespace-pre-wrap break-all">{embedCode}</pre>
                        <button
                            onClick={handleCopy}
                            className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20 transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">{copied ? 'check' : 'content_copy'}</span>
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>

                    <p className="text-[10px] text-[#8e9eab] mt-2">
                        ✅ Works on: WordPress · Wix · Shopify · Webflow · Custom HTML<br/>
                        ⚠️ Some free Squarespace plans may block iFrame embedding
                    </p>
                </div>
            )}
        </div>
    );
};

const PublishCongratulations = () => {
    const [searchParams] = useSearchParams();
    const storeId = searchParams.get('storeId');
    const navigate = useNavigate();

    const [storeUrl, setStoreUrl] = useState('');
    const [adminUrl, setAdminUrl] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [storeResult, flowResult] = await Promise.all([
                    storeAPI.getById(storeId),
                    storeAPI.getPublishFlowState(storeId),
                ]);

                const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:3002';
                const STORE_ADMIN_URL = import.meta.env.VITE_STORE_ADMIN_URL || 'http://localhost:3006';

                if (storeResult.success) {
                    const subdomain = storeResult.data.subdomain;
                    const cfg = flowResult.success ? flowResult.data.domainConfig : null;
                    const address = cfg && cfg.domain_type === 'custom' ? cfg.custom_domain : `${subdomain}.aapnaestore.com`;
                    setStoreUrl(address);
                    setAdminUrl(`${STORE_ADMIN_URL}/login?store=${subdomain}`);
                }
            } catch (err) {
                console.error('Failed to load store info:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [storeId]);

    const copy = (text) => navigator.clipboard.writeText(text);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc]">
                <span className="material-symbols-outlined animate-spin text-3xl text-[#556067]">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f7f9fc] pb-10">
            <div className="sticky top-0 bg-white border-b border-[#e0e3e6] px-4 py-4 flex items-center justify-between">
                <span className="font-semibold text-[#006d2f]">Publish eStore</span>
            </div>

            <div className="max-w-lg mx-auto px-4 py-10 text-center">
                <div className="w-20 h-20 rounded-full bg-[#25D366]/20 flex items-center justify-center mx-auto mb-5">
                    <span className="material-symbols-outlined text-4xl text-[#006d2f]">celebration</span>
                </div>
                <h1 className="text-2xl font-bold text-[#006d2f] mb-2">Congratulations! Your store is now LIVE!</h1>
                <p className="text-[#556067] mb-6">Your journey as an independent seller starts here. Your store is ready to receive orders.</p>

                <div className="bg-white rounded-2xl border border-[#e0e3e6] p-5 text-left mb-6">
                    <div className="mb-4">
                        <div className="text-xs text-[#8e9eab] mb-1">STORE URL</div>
                        <div className="flex items-center justify-between bg-[#f2f4f7] rounded-lg px-3 py-2">
                            <span className="text-sm font-medium text-[#006d2f] break-all">{storeUrl}</span>
                            <button onClick={() => copy(storeUrl)} className="text-[#556067]">
                                <span className="material-symbols-outlined text-base">content_copy</span>
                            </button>
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-[#8e9eab] mb-1">ADMIN DASHBOARD</div>
                        <div className="flex items-center justify-between bg-[#f2f4f7] rounded-lg px-3 py-2 border-l-4 border-[#006d2f]">
                            <span className="text-sm font-medium text-[#191c1e] break-all">{adminUrl}</span>
                            <button onClick={() => copy(adminUrl)} className="text-[#556067]">
                                <span className="material-symbols-outlined text-base">content_copy</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Embed Code Section */}
                <EmbedCodeCard storeUrl={storeUrl} />

                <div className="space-y-3 mb-6 text-left">
                    {[
                        { icon: 'share', title: '1. Share link', text: 'Broadcast your new store on WhatsApp, Instagram, and Facebook.' },
                        { icon: 'dashboard', title: '2. Check admin', text: 'Log in to your control center to manage inventory and staff.' },
                        { icon: 'palette', title: '3. Customize', text: 'Update themes, banners, and logos to match your unique brand.' },
                        { icon: 'trending_up', title: '4. Track sales', text: 'Monitor orders in real-time and view customer insights.' },
                    ].map((item) => (
                        <div key={item.title} className="bg-white rounded-xl border border-[#e0e3e6] p-4 flex items-start gap-3">
                            <span className="material-symbols-outlined text-[#006d2f]">{item.icon}</span>
                            <div>
                                <div className="font-semibold text-sm text-[#191c1e]">{item.title}</div>
                                <div className="text-xs text-[#556067]">{item.text}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-2">
                    <a
                        href={adminUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full py-3 bg-[#191c1e] text-white font-semibold rounded-xl text-center"
                    >
                        🔧 Go to Admin
                    </a>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-3 bg-[#006d2f] text-white font-semibold rounded-xl"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PublishCongratulations;
