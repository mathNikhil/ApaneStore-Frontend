import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PublishFlowHeader from './PublishFlowHeader';

const PublishDnsSuccess = () => {
    const [searchParams] = useSearchParams();
    const storeId = searchParams.get('storeId');
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f7f9fc] pb-24">
            <PublishFlowHeader title="DNS Setup" step={3} storeId={storeId} onBack={() => navigate(`/store-builder/publish/dns?storeId=${storeId}`)} />

            <div className="max-w-lg mx-auto px-4 py-10 text-center">
                <div className="w-20 h-20 rounded-full bg-[#25D366]/20 flex items-center justify-center mx-auto mb-5">
                    <span className="material-symbols-outlined text-4xl text-[#006d2f]">check_circle</span>
                </div>
                <h1 className="text-2xl font-bold text-[#191c1e] mb-2">DNS Configuration Complete</h1>
                <p className="text-[#556067] mb-6">Your domain is verified and ready for business.</p>

                <div className="bg-white rounded-2xl border border-[#e0e3e6] p-5 text-left">
                    <ul className="space-y-3 text-sm text-[#556067]">
                        <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base text-[#006d2f]">check_circle</span>
                            DNS records verified successfully.
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base text-[#006d2f]">check_circle</span>
                            SSL certificate is active and securing your traffic.
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base text-[#006d2f]">check_circle</span>
                            Your store will be live immediately after payment.
                        </li>
                    </ul>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e0e3e6] px-4 py-4 flex justify-between">
                <button
                    onClick={() => navigate(`/store-builder/publish/dns?storeId=${storeId}`)}
                    className="px-6 py-3 bg-[#eceef1] text-[#556067] font-semibold rounded-xl hover:bg-[#d9e4ec] transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Back
                </button>
                <button
                    onClick={() => navigate(`/store-builder/publish/payment?storeId=${storeId}`)}
                    className="px-8 py-3 bg-[#006d2f] text-white font-semibold rounded-xl hover:brightness-110 transition-all flex items-center gap-2"
                >
                    Continue to Payment
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
            </div>
        </div>
    );
};

export default PublishDnsSuccess;
