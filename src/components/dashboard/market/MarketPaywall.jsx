import { useState, useEffect } from 'react';

const TEST_PHONES = ['5555555555', '6666666666', '7777777777'];

export default function MarketPaywall({ tenantId, onSubscribed }) {
  const [plans, setPlans]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [paying, setPaying]       = useState(null);
  const [error, setError]         = useState('');

  // ── coupon state ──
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError]   = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { coupon_id, name, code, unit, value }

  const base = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${base}/api/tenants/${tenantId}/market/plans`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setPlans(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // ── coupon helpers ──
  const getDiscountedTotal = (plan) => {
    const baseRupees = plan.price_monthly / 100;
    const gstRate = parseFloat(plan.gst_rate != null ? plan.gst_rate : 18);

    let discount = 0;
    if (appliedCoupon) {
      if (!appliedCoupon.min_order_value || baseRupees >= appliedCoupon.min_order_value) {
        discount = appliedCoupon.unit === 'percent'
          ? parseFloat((baseRupees * appliedCoupon.value / 100).toFixed(2))
          : Math.min(parseFloat(appliedCoupon.value), baseRupees);
      }
    }

    const discountedBase = parseFloat((baseRupees - discount).toFixed(2));
    const gst = parseFloat((discountedBase * gstRate / 100).toFixed(2));
    const total = parseFloat((discountedBase + gst).toFixed(2));
    return { base: baseRupees, discount, discountedBase, gst, gstRate, total };
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponError('');
    setAppliedCoupon(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${base}/api/tenants/${tenantId}/market/validate-coupon`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      }).then(r => r.json());

      if (!res.success) throw new Error(res.error || 'Invalid coupon');
      setAppliedCoupon(res.data);
    } catch (err) {
      setCouponError(err.message);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const handlePay = async (plan) => {
    setPaying(plan.id);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${base}/api/tenants/${tenantId}/market/subscribe`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: plan.id,
          coupon_id: appliedCoupon?.coupon_id || null,
        }),
      }).then(r => r.json());

      if (!res.success) throw new Error(res.error || 'Payment initiation failed');
      const { paymentSessionId, orderId } = res.data;

      // Load Cashfree SDK
      if (!window.Cashfree) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
          s.onload = resolve; s.onerror = reject;
          document.head.appendChild(s);
        });
      }

      const cashfree = await window.Cashfree({ mode: 'production' });
      cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_self',
        returnUrl: `https://aapnaestore.com/market?order_id=${orderId}`,
      });

    } catch (err) {
      setError(err.message);
      setPaying(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-gray-400 text-sm">Loading plans...</div>
    </div>
  );

  return (
    <div className="px-4 py-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[#25D366]/10 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[#25D366] text-3xl">campaign</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Activate WhatsApp Market</h2>
        <p className="text-sm text-gray-500 leading-relaxed">Connect your WhatsApp and schedule photo messages to customers. Choose a plan to get started.</p>
      </div>

      {/* ── Coupon Code ── */}
      <div className="mb-6">
        {!appliedCoupon ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
              placeholder="Have a coupon code?"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366]/30"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={couponLoading || !couponInput.trim()}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#006d2f] text-white hover:bg-[#004d20] disabled:opacity-50 transition-all whitespace-nowrap">
              {couponLoading ? '...' : 'Apply'}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-base">✓</span>
              <div>
                <span className="text-sm font-semibold text-green-800">{appliedCoupon.code}</span>
                <span className="text-xs text-green-600 ml-2">
                  {appliedCoupon.unit === 'percent'
                    ? `${appliedCoupon.value}% off`
                    : `₹${appliedCoupon.value} off`}
                  {' '}applied
                </span>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium">
              Remove
            </button>
          </div>
        )}
        {couponError && (
          <p className="text-xs text-red-500 mt-1.5 pl-1">{couponError}</p>
        )}
      </div>

      {/* Plans */}
      <div className="space-y-4">
        {plans.map(plan => {
          const pricing = getDiscountedTotal(plan);
          const hasDiscount = appliedCoupon && pricing.discount > 0;

          return (
            <div key={plan.id}
              className={`bg-white rounded-2xl border-2 p-5 transition-all
                ${plan.is_recommended ? 'border-[#25D366] shadow-md' : 'border-gray-200'}`}>

              {plan.is_recommended && (
                <div className="text-xs font-semibold text-[#25D366] uppercase tracking-wider mb-2">⭐ Most Popular</div>
              )}

              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-lg font-bold text-gray-800">{plan.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{plan.description}</div>
                </div>
                <div className="text-right">
                  {hasDiscount ? (
                    <>
                      <div className="text-sm line-through text-gray-400">
                        ₹{Math.round(plan.price_monthly / 100)}/mo
                      </div>
                      <div className="text-2xl font-bold text-[#006d2f]">
                        ₹{pricing.discountedBase.toFixed(0)}
                        <span className="text-sm font-normal text-gray-400">/mo</span>
                      </div>
                      <div className="text-xs text-green-600 font-semibold">
                        You save ₹{pricing.discount.toFixed(0)}
                      </div>
                    </>
                  ) : (
                    <div className="text-2xl font-bold text-gray-800">
                      ₹{Math.round(plan.price_monthly / 100)}
                      <span className="text-sm font-normal text-gray-400">/mo</span>
                    </div>
                  )}
                  {plan.gst_rate != null && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      + GST ({pricing.gstRate}%): ₹{pricing.gst.toFixed(2)}
                    </div>
                  )}
                  <div className="text-xs font-semibold text-gray-600 mt-0.5">
                    Total: ₹{pricing.total.toFixed(2)}
                  </div>
                  {plan.price_yearly && (
                    <div className="text-xs text-green-600 mt-0.5">₹{Math.round(plan.price_yearly / 100)}/yr — save 16%</div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-full">
                  {plan.daily_msg_limit} msg/day
                </span>
                <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-full">
                  {plan.max_scheduled} scheduled
                </span>
                <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-full">
                  {plan.image_retain_days}d storage
                </span>
                <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-full">
                  {plan.gap_seconds_min}s gap
                </span>
              </div>

              <button
                onClick={() => handlePay(plan)}
                disabled={!!paying}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-60
                  ${plan.is_recommended
                    ? 'bg-[#25D366] text-white hover:bg-[#1db954]'
                    : 'border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/5'}`}>
                {paying === plan.id
                  ? 'Opening payment...'
                  : `Subscribe — ₹${pricing.total.toFixed(2)} (incl. GST)`}
              </button>
            </div>
          );
        })}
      </div>

      {error && <p className="text-xs text-red-500 text-center mt-4">{error}</p>}

      <p className="text-xs text-gray-400 text-center mt-6">
        Secure payment via Cashfree · Cancel anytime · Renews monthly
      </p>
    </div>
  );
}
