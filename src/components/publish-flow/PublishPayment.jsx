import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { storeAPI, pricingAPI, termsAPI } from '../../services/api';
import PublishFlowHeader from './PublishFlowHeader';

const resolvePlanKey = (domainType, hostingType) => {
    if (domainType === 'subdomain') return 'subdomain_apnaestore';
    if (domainType === 'custom' && hostingType === 'apnaestore') return 'custom_domain_apnaestore';
    if (domainType === 'custom' && hostingType === 'own') return 'custom_domain_own_hosting';
    return null;
};

const CYCLE_LABELS = { monthly: '30 days', quarterly: '90 days', annual: '365 days' };
const CYCLE_ORDER = ['monthly', 'quarterly', 'annual'];

const PublishPayment = () => {
    const [searchParams] = useSearchParams();
    const storeId = searchParams.get('storeId');
    const navigate = useNavigate();

    const [store, setStore] = useState(null);
    const [domainConfig, setDomainConfig] = useState(null);
    // ✅ All 3 billing-cycle options for this domain/hosting combo — the
    // tenant picks which one to pay for, matching how monthly/quarterly/
    // annual pricing was set up in Super Admin.
    const [availablePlans, setAvailablePlans] = useState([]);
    const [selectedCycle, setSelectedCycle] = useState('annual');
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [terms, setTerms] = useState(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [termsExpanded, setTermsExpanded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const [flowResult, storeResult, pricingResult, termsResult] = await Promise.all([
                    storeAPI.getPublishFlowState(storeId),
                    storeAPI.getById(storeId),
                    pricingAPI.getAll(),
                    termsAPI.getCurrent(),
                ]);

                if (termsResult.success) setTerms(termsResult.data);

                if (!flowResult.success || !flowResult.data.domainConfig) {
                    navigate(`/store-builder/publish/domain?storeId=${storeId}`);
                    return;
                }
                const cfg = flowResult.data.domainConfig;
                setDomainConfig(cfg);

                if (storeResult.success) setStore(storeResult.data);

                if (pricingResult.success) {
                    const planKey = resolvePlanKey(cfg.domain_type, cfg.hosting_type);
                    const matches = pricingResult.data
                        .filter((p) => p.plan_key === planKey && p.is_active)
                        .sort((a, b) => CYCLE_ORDER.indexOf(a.billing_cycle) - CYCLE_ORDER.indexOf(b.billing_cycle));
                    setAvailablePlans(matches);
                    // Default to annual if available, otherwise whatever exists first
                    const hasAnnual = matches.some((p) => p.billing_cycle === 'annual');
                    setSelectedCycle(hasAnnual ? 'annual' : matches[0]?.billing_cycle || 'annual');
                }
            } catch (err) {
                console.error('Failed to load payment info:', err);
                setError('Failed to load payment details. Please go back and try again.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [storeId]);

    const plan = availablePlans.find((p) => p.billing_cycle === selectedCycle) || null;

    const handlePay = async () => {
        if (!termsAccepted) {
            setError('Please read and accept the Terms & Conditions to continue.');
            return;
        }
        setPaying(true);
        setError('');
        try {
            // Simulated — no real payment gateway yet.
            await new Promise((resolve) => setTimeout(resolve, 1500));
            const result = await storeAPI.completePayment(storeId, paymentMethod, selectedCycle, termsAccepted);
            if (result.success) {
                navigate(`/store-builder/publish/success?storeId=${storeId}`);
            } else {
                setError(result.error || 'Payment failed. Please try again.');
            }
        } catch (err) {
            setError(err.message || 'Payment failed. Please try again.');
        } finally {
            setPaying(false);
        }
    };

    const storeAddress = domainConfig?.domain_type === 'custom'
        ? domainConfig.custom_domain
        : `${store?.subdomain || ''}.aapnaestore.com`;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc]">
                <span className="material-symbols-outlined animate-spin text-3xl text-[#556067]">progress_activity</span>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="min-h-screen bg-[#f7f9fc] pb-24">
                <PublishFlowHeader title="Payment" storeId={storeId} />
                <div className="max-w-lg mx-auto px-4 py-10 text-center text-[#556067]">
                    No pricing plan is currently available for this configuration. Please contact support.
                </div>
            </div>
        );
    }

    const baseAmount = parseFloat(plan.base_amount);
    const taxAmount = baseAmount * (parseFloat(plan.tax_percentage) / 100);
    const totalAmount = baseAmount + taxAmount;
    const perDay = (totalAmount / (plan.validity_days || 365)).toFixed(2);

    const backPath = domainConfig?.dns_status === 'verified'
        ? `/store-builder/publish/dns-success?storeId=${storeId}`
        : domainConfig?.domain_type === 'subdomain'
            ? `/store-builder/publish/domain?storeId=${storeId}`
            : `/store-builder/publish/own-hosting?storeId=${storeId}`;

    return (
        <div className="min-h-screen bg-[#f7f9fc] pb-24">
            <PublishFlowHeader title="Complete Your Payment" step={4} storeId={storeId} onBack={() => navigate(backPath)} />

            <div className="max-w-lg mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-[#191c1e] mb-1">Complete Your Payment</h1>
                <p className="text-[#556067] mb-6">Choose how long you'd like to launch your store for</p>

                {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

                {availablePlans.length > 1 && (
                    <div className="mb-4">
                        <h4 className="text-xs font-semibold text-[#8e9eab] uppercase tracking-wide mb-2">Billing Cycle</h4>
                        <div className="grid grid-cols-3 gap-2">
                            {availablePlans.map((p) => (
                                <button
                                    key={p.billing_cycle}
                                    onClick={() => setSelectedCycle(p.billing_cycle)}
                                    className={`py-3 rounded-xl border-2 text-center transition-all ${
                                        selectedCycle === p.billing_cycle ? 'border-[#006d2f] bg-[#25D366]/5' : 'border-[#e0e3e6] bg-white'
                                    }`}
                                >
                                    <div className="text-sm font-semibold text-[#191c1e]">{CYCLE_LABELS[p.billing_cycle] || p.billing_cycle}</div>
                                    <div className="text-xs text-[#8e9eab] mt-0.5">₹{parseFloat(p.base_amount).toLocaleString('en-IN')}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-[#e0e3e6] p-5 mb-4">
                    <h3 className="font-semibold text-[#191c1e] mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#006d2f]">shopping_bag</span>
                        Order Summary
                    </h3>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-[#8e9eab]">Store Address</span>
                        <span className="font-medium text-[#191c1e]">{storeAddress}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-[#8e9eab]">Plan</span>
                        <span className="font-medium text-[#191c1e]">{plan.display_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-[#8e9eab]">Valid For</span>
                        <span className="font-medium text-[#191c1e]">{plan.validity_days} days ({CYCLE_LABELS[plan.billing_cycle] || plan.billing_cycle})</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#e0e3e6] p-5 mb-4">
                    <h3 className="font-semibold text-[#191c1e] mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#006d2f]">receipt_long</span>
                        Payment Details
                    </h3>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-[#556067]">{CYCLE_LABELS[plan.billing_cycle] || 'Plan'} Fee</span>
                        <span className="text-[#191c1e]">₹{baseAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-3 pb-3 border-b border-[#f2f4f7]">
                        <span className="text-[#556067]">GST ({plan.tax_percentage}%)</span>
                        <span className="text-[#191c1e]">₹{taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-[#191c1e]">Total Amount</span>
                        <span className="text-xl font-bold text-[#006d2f]">₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="mt-3 text-xs text-[#8e9eab] bg-[#f2f4f7] rounded-lg p-2 text-center">
                        That's just ₹{perDay}/day
                    </div>
                </div>

                <h4 className="text-xs font-semibold text-[#8e9eab] uppercase tracking-wide mb-2">Select Payment Method</h4>
                {/* Only UPI for now — card/netbanking come back once a real
                    payment gateway is integrated. paymentMethod defaults to
                    'upi' and isn't changed elsewhere, so this is the only
                    option sent to completePayment below. */}
                {['upi'].map((method) => (
                    <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 mb-2 transition-all ${
                            paymentMethod === method ? 'border-[#006d2f] bg-[#25D366]/5' : 'border-[#e0e3e6] bg-white'
                        }`}
                    >
                        <span className="flex items-center gap-2 text-sm font-medium text-[#191c1e]">
                            <span className="material-symbols-outlined text-base text-[#556067]">account_balance_wallet</span>
                            UPI
                        </span>
                        {paymentMethod === method && <span className="material-symbols-outlined text-[#006d2f]">check_circle</span>}
                    </button>
                ))}
                <p className="text-xs text-[#8e9eab] mb-1">Card and Net Banking will be added when the payment gateway goes live.</p>

                <p className="text-xs text-[#8e9eab] text-center mt-4">
                    🔒 This is a simulated payment for testing — no real charge will be made.
                </p>

                {terms && (
                    <div className="mt-5 border border-[#e0e3e6] rounded-xl overflow-hidden">
                        <button
                            onClick={() => setTermsExpanded(!termsExpanded)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-[#f7f9fc] text-sm font-semibold text-[#191c1e]"
                        >
                            Terms &amp; Conditions
                            <span className="material-symbols-outlined text-base">
                                {termsExpanded ? 'expand_less' : 'expand_more'}
                            </span>
                        </button>
                        {termsExpanded && (
                            <div className="max-h-64 overflow-y-auto px-4 py-3 text-xs text-[#556067] whitespace-pre-wrap border-t border-[#e0e3e6]">
                                {terms.text}
                            </div>
                        )}
                        <label className="flex items-start gap-2 px-4 py-3 border-t border-[#e0e3e6] cursor-pointer">
                            <input
                                type="checkbox"
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                className="mt-0.5"
                            />
                            <span className="text-xs text-[#191c1e]">
                                I have read and agree to the Terms &amp; Conditions, including that I am solely responsible for my store's products, content, and legal compliance.
                            </span>
                        </label>
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e0e3e6] px-4 py-4 flex justify-between">
                <button
                    onClick={() => navigate(`/store-builder/preview?storeId=${storeId}`)}
                    className="px-6 py-3 bg-[#eceef1] text-[#556067] font-semibold rounded-xl hover:bg-[#d9e4ec] transition-all"
                >
                    Cancel
                </button>
                <button
                    onClick={handlePay}
                    disabled={paying || !termsAccepted}
                    className="px-8 py-3 bg-[#006d2f] text-white font-semibold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {paying ? 'Processing...' : "I've Paid"}
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
            </div>
        </div>
    );
};

export default PublishPayment;
