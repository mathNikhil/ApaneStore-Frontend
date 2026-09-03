import { useState, useEffect } from 'react';

const TEST_PHONES = ['5555555555', '6666666666', '7777777777'];

export default function MarketPaywall({ tenantId, onSubscribed }) {
  const [plans, setPlans]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying]   = useState(null);
  const [error, setError]     = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';
    fetch(`${base}/api/tenants/${tenantId}/market/plans`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setPlans(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handlePay = async (plan) => {
    setPaying(plan.id);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const base = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';
      const res = await fetch(`${base}/api/tenants/${tenantId}/market/subscribe`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: plan.id }),
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

      {/* Plans */}
      <div className="space-y-4">
        {plans.map(plan => (
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
                <div className="text-2xl font-bold text-gray-800">
                  ₹{Math.round(plan.price_monthly / 100)}
                  <span className="text-sm font-normal text-gray-400">/mo</span>
                </div>
                {plan.price_yearly && (
                  <div className="text-xs text-green-600">₹{Math.round(plan.price_yearly / 100)}/yr — save 16%</div>
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
              {paying === plan.id ? 'Opening payment...' : `Subscribe — ₹${Math.round(plan.price_monthly / 100)}/mo`}
            </button>
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-red-500 text-center mt-4">{error}</p>}

      <p className="text-xs text-gray-400 text-center mt-6">
        Secure payment via Cashfree · Cancel anytime · Renews monthly
      </p>
    </div>
  );
}
