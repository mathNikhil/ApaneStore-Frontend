import { showSuccess, showError } from '../../utils/toast';
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
    const [submitted, setSubmitted] = useState(false);
    const [submittedAt, setSubmittedAt] = useState(null);
    const [dnsResult, setDnsResult] = useState(null); // null | { verified, message, resolvedIps, expectedIp }

    useEffect(() => {
        const load = async () => {
            try {
                const result = await storeAPI.getPublishFlowState(storeId);
                if (result.success && result.data.domainConfig) {
                    setCustomDomain(result.data.domainConfig.custom_domain || '');
                    // Already verified — skip ahead immediately
                    if (result.data.domainConfig.dns_status === 'verified') {
                        navigate(`/store-builder/publish/dns-success?storeId=${storeId}`, { replace: true });
                    }
                }
            } catch (err) {
                console.error('Failed to load domain config:', err);
            }
        };
        load();
        // Restore submitted state from localStorage
        const savedTime = localStorage.getItem(`dns_submitted_${storeId}`);
        if (savedTime) {
            setSubmitted(true);
            setSubmittedAt(new Date(savedTime));
        }
    }, [storeId]);

    // Called when tenant clicks "Verify DNS Configuration" for the first time
    const handleVerify = async () => {
        setVerifying(true);
        setError('');
        setDnsResult(null);
        try {
            const result = await storeAPI.verifyDns(storeId);
            if (result.success) {
                if (result.verified) {
                    // DNS already pointing correctly — go straight to success
                    navigate(`/store-builder/publish/dns-success?storeId=${storeId}`);
                } else {
                    // DNS not propagated yet — show waiting state
                    setDnsResult(result);
                    setSubmitted(true);
                    setSubmittedAt(new Date());
                    localStorage.setItem(`dns_submitted_${storeId}`, new Date().toISOString());
                }
            } else {
                setError(result.error || 'Failed to check DNS. Please try again.');
            }
        } catch (err) {
            setError(err.message || 'Failed. Please try again.');
        } finally {
            setVerifying(false);
        }
    };

    // Called when tenant clicks "Check Status Now" after waiting
    const handleCheckStatus = async () => {
        setVerifying(true);
        setError('');
        try {
            const result = await storeAPI.verifyDns(storeId);
            if (result.success && result.verified) {
                localStorage.removeItem(`dns_submitted_${storeId}`);
                navigate(`/store-builder/publish/dns-success?storeId=${storeId}`);
            } else {
                const flowResult = await storeAPI.getPublishFlowState(storeId);
                if (flowResult.data?.domainConfig?.dns_status === 'verified') {
                    localStorage.removeItem(`dns_submitted_${storeId}`);
                    navigate(`/store-builder/publish/dns-success?storeId=${storeId}`);
                } else {
                    setDnsResult(result);
                    setError('DNS not verified yet. Please wait a bit longer and try again.');
                }
            }
        } catch (err) {
            setError('Failed to check status.');
        } finally {
            setVerifying(false);
        }
    };

    const handleCopyRecords = () => {
        const text = `Type: A     Name: @      Value: 13.235.136.191\nType: CNAME Name: www    Value: ${customDomain}`;
        navigator.clipboard.writeText(text);
        showSuccess('Records copied!');
    };

    // ── Waiting / submitted state ──
    if (submitted) {
        const minutesWaited = submittedAt ? Math.floor((new Date() - submittedAt) / 60000) : 0;
        return (
            <div className="min-h-screen bg-[#f7f9fc] pb-24">
                <PublishFlowHeader title="DNS Setup" step={3} storeId={storeId} onBack={() => {}} />
                <div className="max-w-lg mx-auto px-4 py-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-[#25D366]/10 flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-[#006d2f]">schedule</span>
                    </div>
                    <h1 className="text-xl font-bold text-[#191c1e] mb-3">DNS Records Added?</h1>
                    <p className="text-[#556067] text-sm mb-6">
                        We checked your domain <strong>{customDomain}</strong> — it's not pointing to our servers yet.
                        This is normal. DNS changes take <strong>15 minutes to 48 hours</strong> to propagate worldwide.
                    </p>

                    {/* Show what we found */}
                    {dnsResult && !dnsResult.verified && dnsResult.resolvedIps?.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 text-left">
                            <p className="text-xs font-semibold text-amber-700 mb-1">Current DNS status</p>
                            <p className="text-xs text-amber-700">
                                Your domain resolves to <code className="bg-amber-100 px-1 rounded">{dnsResult.resolvedIps.join(', ')}</code>
                            </p>
                            <p className="text-xs text-amber-700 mt-1">
                                Needs to point to <code className="bg-amber-100 px-1 rounded">13.235.136.191</code>
                            </p>
                        </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 text-left">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-blue-600 text-base">info</span>
                            <span className="text-sm font-semibold text-blue-700">What to do next</span>
                        </div>
                        <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                            <li>Make sure you've added the A and CNAME records at your registrar</li>
                            <li>Wait at least 15–30 minutes</li>
                            <li>Come back and click "Check Status Now"</li>
                        </ol>
                    </div>

                    {minutesWaited >= 15 ? (
                        <button
                            onClick={handleCheckStatus}
                            disabled={verifying}
                            className="w-full py-3 bg-[#006d2f] text-white rounded-2xl font-semibold text-sm mb-3 disabled:opacity-60"
                        >
                            {verifying ? 'Checking...' : '✓ Check Status Now'}
                        </button>
                    ) : (
                        <div className="mb-3">
                            <p className="text-xs text-[#8e9eab] mb-2">
                                Check status available in {15 - minutesWaited} minute{15 - minutesWaited !== 1 ? 's' : ''}
                            </p>
                            <button
                                onClick={handleCheckStatus}
                                disabled={verifying}
                                className="w-full py-3 border border-[#006d2f] text-[#006d2f] rounded-2xl font-semibold text-sm disabled:opacity-60"
                            >
                                {verifying ? 'Checking...' : 'Check Anyway'}
                            </button>
                        </div>
                    )}

                    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                    <p className="text-xs text-[#8e9eab] mt-2">
                        Submitted at {submittedAt?.toLocaleTimeString()} · {minutesWaited}m ago
                    </p>
                </div>
            </div>
        );
    }

    // ── Main DNS instructions state ──
    return (
        <div className="min-h-screen bg-[#f7f9fc] pb-24">
            <PublishFlowHeader
                title="DNS Setup"
                step={3}
                storeId={storeId}
                onBack={() => navigate(`/store-builder/publish/hosting-success?storeId=${storeId}`)}
            />

            <div className="max-w-lg mx-auto px-4 py-8">
                <h1 className="text-xl font-bold text-[#191c1e] mb-1">DNS Configuration Required</h1>
                <p className="text-[#556067] mb-6 text-sm">
                    Add these records at your domain registrar to connect your domain.
                </p>

                {/* Domain + Hosting info */}
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
                            <div className="font-semibold text-[#191c1e]">Aapna eStore (13.235.136.191)</div>
                        </div>
                    </div>
                </div>

                {/* DNS records table */}
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
                                <td className="px-5 py-3 font-mono">13.235.136.191</td>
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

                {/* Verify button */}
                <div className="bg-white rounded-2xl border border-[#e0e3e6] p-5 mb-4">
                    <h4 className="font-semibold text-[#191c1e] mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#006d2f]">sync</span>
                        DNS Status
                    </h4>
                    <p className="text-sm text-[#8e9eab] mb-3">
                        Added the records above? Click verify — if DNS has propagated, your store will proceed automatically.
                    </p>
                    <button
                        onClick={handleVerify}
                        disabled={verifying}
                        className="w-full py-2.5 border-2 border-[#006d2f] text-[#006d2f] rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <span className={`material-symbols-outlined text-base ${verifying ? 'animate-spin' : ''}`}>
                            {verifying ? 'progress_activity' : 'refresh'}
                        </span>
                        {verifying ? 'Checking DNS...' : 'Verify DNS Configuration'}
                    </button>
                    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                    <p className="text-xs text-[#8e9eab] mt-3">
                        DNS changes can take up to 48 hours to propagate. We'll keep checking automatically in the background.
                    </p>
                </div>

                {/* SSL note */}
                <div className="bg-[#f2f4f7] rounded-xl p-4 text-xs text-[#556067] flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-[#8e9eab]">lock</span>
                    SSL certificate will be issued automatically once DNS is verified. Your domain will be fully secured with HTTPS.
                </div>
            </div>
        </div>
    );
};

export default PublishDnsRequired;
