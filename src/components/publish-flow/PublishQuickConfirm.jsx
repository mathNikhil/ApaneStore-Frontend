import { showSuccess, showError } from '../../utils/toast';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { storeAPI } from '../../services/api';

// ✅ Simplified publish entry point. The full domain/hosting/payment flow
// (components/publish-flow/) is untouched and still fully built — it's
// just unused for now, since there's no real hosting/domain infrastructure
// to actually go live on yet. When that's ready, swapping this screen back
// out for PublishFlowRouter is a small change, not a rebuild.
const PublishQuickConfirm = () => {
    const [searchParams] = useSearchParams();
    const storeId = searchParams.get('storeId');
    const navigate = useNavigate();

    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const [published, setPublished] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const result = await storeAPI.getById(storeId);
                if (result.success) {
                    setStore(result.data);
                    if (result.data.status === 'published') {
                        setPublished(true);
                    }
                }
            } catch (err) {
                console.error('Failed to load store:', err);
                showError('Failed to load store details.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [storeId]);

    const handleConfirmPublish = async () => {
        setPublishing(true);
        showError('');
        try {
            const result = await storeAPI.update(storeId, {
                status: 'published',
                published_at: new Date().toISOString(),
            });
            if (result.success) {
                setPublished(true);
            } else {
                setError(result.error || 'Failed to publish. Please try again.');
            }
        } catch (err) {
            setError(err.message || 'Failed to publish. Please try again.');
        } finally {
            setPublishing(false);
        }
    };

    const copy = (text) => navigator.clipboard.writeText(text);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc]">
                <span className="material-symbols-outlined animate-spin text-3xl text-[#556067]">progress_activity</span>
            </div>
        );
    }

    const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:3002';
    const STORE_ADMIN_URL = import.meta.env.VITE_STORE_ADMIN_URL || 'http://localhost:3006';
    const storeUrl = `${STOREFRONT_URL}/?store=${store?.subdomain}`;
    const adminUrl = `${STORE_ADMIN_URL}/login?store=${store?.subdomain}`;

    if (published) {
        return (
            <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-20 h-20 rounded-full bg-[#25D366]/20 flex items-center justify-center mx-auto mb-5">
                        <span className="material-symbols-outlined text-4xl text-[#006d2f]">celebration</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[#006d2f] mb-2">Your store is live!</h1>
                    <p className="text-[#556067] mb-6">Customers can now visit and order from your store.</p>

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

                    <div className="space-y-2">
                        <a href={storeUrl} target="_blank" rel="noreferrer" className="block w-full py-3 bg-[#006d2f] text-white font-semibold rounded-xl text-center">
                            Visit Store
                        </a>
                        <button onClick={() => navigate('/dashboard')} className="w-full py-3 bg-[#191c1e] text-white font-semibold rounded-xl">
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl border border-[#e0e3e6] p-6 text-center">
                    <span className="material-symbols-outlined text-4xl text-[#006d2f] mb-3 block">storefront</span>
                    <h1 className="text-2xl font-bold text-[#191c1e] mb-2">Ready to publish?</h1>
                    <p className="text-[#556067] mb-5">Your store will go live at:</p>

                    <div className="bg-[#f2f4f7] rounded-lg px-4 py-3 mb-6">
                        <span className="font-mono text-sm text-[#006d2f]">{store?.subdomain}.aapnaestore.com</span>
                    </div>

                    

                    <p className="text-xs text-[#8e9eab] mb-6">
                        Note: custom domain and hosting options aren't live yet — every store publishes on a free subdomain for now.
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(`/store-builder/preview?storeId=${storeId}`)}
                            className="flex-1 py-3 bg-[#eceef1] text-[#556067] font-semibold rounded-xl"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleConfirmPublish}
                            disabled={publishing}
                            className="flex-1 py-3 bg-[#006d2f] text-white font-semibold rounded-xl disabled:opacity-50"
                        >
                            {publishing ? 'Publishing...' : 'Publish Now'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublishQuickConfirm;
