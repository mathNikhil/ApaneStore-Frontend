import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PublishFlowHeader from './PublishFlowHeader';

const PublishHostingSuccess = () => {
    const [searchParams] = useSearchParams();
    const storeId = searchParams.get('storeId');
    const navigate = useNavigate();

    const features = [
        'Secure servers',
        'Unlimited bandwidth',
        '99.9% uptime guarantee',
        'Free SSL certificate',
        'Automatic backups',
        '24/7 monitoring',
    ];

    return (
        <div className="min-h-screen bg-[#f7f9fc] pb-24">
            <PublishFlowHeader title="Hosting" step={2} storeId={storeId} onBack={() => navigate(`/store-builder/publish/hosting?storeId=${storeId}`)} />

            <div className="max-w-lg mx-auto px-4 py-10 text-center">
                <div className="w-20 h-20 rounded-full bg-[#25D366]/20 flex items-center justify-center mx-auto mb-5">
                    <span className="material-symbols-outlined text-4xl text-[#006d2f]">check_circle</span>
                </div>
                <h1 className="text-2xl font-bold text-[#191c1e] mb-2">Hosting Configuration Complete</h1>
                <p className="text-[#556067] mb-6">Your store will be hosted on ApnaEstore's secure servers</p>

                <div className="bg-white rounded-2xl border border-[#e0e3e6] p-5 text-left mb-4">
                    <h4 className="font-semibold text-[#191c1e] mb-3">✨ Everything is configured automatically!</h4>
                    <ul className="space-y-2 text-sm text-[#556067]">
                        {features.map((f) => (
                            <li key={f} className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-[#006d2f]">check_circle</span>
                                {f}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-[#f2f4f7] border-l-4 border-[#006d2f] rounded-lg p-4 text-left text-sm text-[#556067]">
                    ⏳ No action needed from you. Just proceed to your domain setup.
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e0e3e6] px-4 py-4 flex justify-between">
                <button
                    onClick={() => navigate(`/store-builder/publish/hosting?storeId=${storeId}`)}
                    className="px-6 py-3 bg-[#eceef1] text-[#556067] font-semibold rounded-xl hover:bg-[#d9e4ec] transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Back
                </button>
                <button
                    onClick={() => navigate(`/store-builder/publish/dns?storeId=${storeId}`)}
                    className="px-8 py-3 bg-[#006d2f] text-white font-semibold rounded-xl hover:brightness-110 transition-all flex items-center gap-2"
                >
                    Continue
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
            </div>
        </div>
    );
};

export default PublishHostingSuccess;
