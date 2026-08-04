import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { storeAPI } from '../../services/api';
import PublishFlowHeader from './PublishFlowHeader';

const PublishDnsRequired = () => {
    const [searchParams] = useSearchParams();
    const storeId = searchParams.get('storeId');
    const navigate = useNavigate();

    const [customDomain, setCustomDomain] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const result = await storeAPI.getPublishFlowState(storeId);
                if (result.success && result.data.domainConfig) {
                    setCustomDomain(result.data.domainConfig.custom_domain || '');
                    // Already verified (e.g. tenant navigated back here) — skip ahead
                    if (result.data.domainConfig.dns_status === 'verified') {
                        navigate(`/store-builder/publish/dns-success?storeId=${storeId}`, { replace: true });
                    }
                }
            } catch (err) {
                console.error('Failed to load domain config:', err);
            }
        };
        load();
    }, [storeId]);

    const handleVerify = async () => {
        setVerifying(true);
        setError('');
        try {
            // Simulated — no real DNS lookup yet, per the design discussion.
            await new Promise((resolve) => setTimeout(resolve, 1200));
            const result = await storeAPI.verifyDns(storeId);
            if (result.success) {
                navigate(`/store-builder/publish/dns-success?storeId=${storeId}`);
            } else {
                setError(result.error || 'Verification failed. Please try again.');
            }
        } catch (err) {
            setError(err.message || 'Verification failed. Please try again.');
        } finally {
            setVerifying(false);
        }
    };

    const handleCopyRecords = () => {
        const text = `Type: A     Name: @      Value: 192.168.1.100\nType: CNAME Name: www    Value: ${customDomain}`;
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="min-h-screen bg-[#f7f9fc] pb-24">
            <PublishFlowHeader title="DNS Setup" step={3} storeId={storeId} onBack={() => navigate(`/store-builder/publish/hosting-success?storeId=${storeId}`)} />

            <div className="max-w-lg mx-auto px-4 py-8">
                <h1 className="text-xl font-bold text-[#191c1e] mb-1">DNS Configuration Required</h1>
                <p className="text-[#556067] mb-6 text-sm">Add these records at your domain registrar to connect your domain.</p>

                {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

                <div className="bg-white rounded-2xl border border-[#e0e3e6] p-5 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="material-symbols-outlined text-[#006d2f]">public</span>
                        <div>
                            <div className="text-xs text-[#8e9eab]">YOUR DOMAIN</div>
                            <div className="font-semibold text-[#191c1e]">{customDomain}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#8e9eab]">dns</span>
                        <div>
                            <div className="text-xs text-[#8e9eab]">HOSTING</div>
                            <div className="font-semibold text-[#191c1e]">ApnaEstore (192.168.1.100)</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#e0e3e6] overflow-hidden mb-4">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-[#e0e3e6]">
                        <h3 className="font-semibold text-[#191c1e]">Add these DNS records</h3>
                        <span className="text-[10px] font-bold text-white bg-[#006d2f] px-2 py-0.5 rounded-full">REQUIRED</span>
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-[#8e9eab] text-xs">
                                <th className="px-5 py-2">TYPE</th>
                                <th className="px-5 py-2">NAME</th>
                                <th className="px-5 py-2">VALUE</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t border-[#f2f4f7]">
                                <td className="px-5 py-3 font-mono">A</td>
                                <td className="px-5 py-3 font-mono">@</td>
                                <td className="px-5 py-3 font-mono">192.168.1.100</td>
                            </tr>
                            <tr className="border-t border-[#f2f4f7]">
                                <td className="px-5 py-3 font-mono">CNAME</td>
                                <td className="px-5 py-3 font-mono">www</td>
                                <td className="px-5 py-3 font-mono truncate max-w-[140px]">{customDomain}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="p-4">
                        <button
                            onClick={handleCopyRecords}
                            className="w-full py-2.5 bg-[#191c1e] text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-base">content_copy</span>
                            Copy All Records
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#e0e3e6] p-5 mb-4">
                    <h4 className="font-semibold text-[#191c1e] mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#006d2f]">sync</span>
                        DNS Status
                    </h4>
                    <p className="text-sm text-[#8e9eab] mb-3">Click below once you've added the records above.</p>
                    <button
                        onClick={handleVerify}
                        disabled={verifying}
                        className="w-full py-2.5 border-2 border-[#006d2f] text-[#006d2f] rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <span className={`material-symbols-outlined text-base ${verifying ? 'animate-spin' : ''}`}>
                            {verifying ? 'progress_activity' : 'refresh'}
                        </span>
                        {verifying ? 'Verifying...' : 'Verify DNS Configuration'}
                    </button>
                    <p className="text-xs text-[#8e9eab] mt-3">Note: real DNS changes can take up to a few hours to take effect once this goes live — for now, verification is simulated.</p>
                </div>

                <div className="bg-[#f2f4f7] rounded-xl p-4 text-xs text-[#556067] flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-[#8e9eab]">lock</span>
                    SSL certificates activate automatically after DNS propagation. Your site may show a security warning until then.
                </div>
            </div>
        </div>
    );
};

export default PublishDnsRequired;
