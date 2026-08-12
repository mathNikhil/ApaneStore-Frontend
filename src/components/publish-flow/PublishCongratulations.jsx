import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { storeAPI } from '../../services/api';

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
                    const address = cfg && cfg.domain_type === 'custom' ? cfg.custom_domain : `${subdomain}.aapnaestore.com (local: ${STOREFRONT_URL}/?store=${subdomain})`;
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
