import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';

const PLAN_LABELS = {
  subdomain_apnaestore: { name: 'Free Subdomain + AapnaEstore Hosting', icon: 'language', desc: 'Get a free subdomain (yourstore.aapnaestore.com). Hosting managed by us.' },
  custom_domain_apnaestore: { name: 'Custom Domain + AapnaEstore Hosting', icon: 'domain', desc: 'Bring your own domain. Hosting managed by us.' },
  custom_domain_own_hosting: { name: 'Custom Domain + Own Hosting', icon: 'dns', desc: 'Bring your own domain and host on your own server.' },
};

const CYCLE_ORDER = ['30days', '90days', '365days'];
const CYCLE_LABELS = { '30days': '30 Days', '90days': '90 Days', '365days': '365 Days' };

const PricingSection = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/public/pricing-plans`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setPlans(data.data);
        else setError('Failed to load pricing');
      })
      .catch(() => setError('Failed to load pricing'))
      .finally(() => setLoading(false));
  }, []);

  // Group by plan_key
  const grouped = plans.reduce((acc, plan) => {
    if (!acc[plan.plan_key]) acc[plan.plan_key] = [];
    acc[plan.plan_key].push(plan);
    return acc;
  }, {});

  Object.values(grouped).forEach(group => {
    group.sort((a, b) => CYCLE_ORDER.indexOf(a.billing_cycle) - CYCLE_ORDER.indexOf(b.billing_cycle));
  });
  // Remove any cycles not in CYCLE_ORDER (old monthly/quarterly/annual)
  Object.keys(grouped).forEach(key => {
    grouped[key] = grouped[key].filter(p => CYCLE_ORDER.includes(p.billing_cycle));
  });

  const totalFor = (plan) => {
    const base = parseFloat(plan.base_amount || 0);
    const tax = base * (parseFloat(plan.tax_percentage || 0) / 100);
    return Math.round(base + tax);
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[#006d2f]/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-[#006d2f]">payments</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#191c1e]">Pricing Plans</h1>
          <p className="text-xs text-[#556067]">All prices include 18% GST · No hidden charges</p>
        </div>
      </div>

      <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-6 text-sm text-green-800">
        🎉 <strong>Free Trial Available</strong> — Start building your store for free. No payment required during trial.
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <span className="material-symbols-outlined animate-spin text-[#006d2f]">progress_activity</span>
          <span className="ml-2 text-[#556067]">Loading pricing...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          {Object.entries(grouped).map(([planKey, cycles]) => {
            const meta = PLAN_LABELS[planKey] || { name: planKey, icon: 'storefront', desc: '' };
            return (
              <div key={planKey} className="border border-[#e0e3e6] rounded-xl overflow-hidden">
                {/* Plan Header */}
                <div className="p-4 bg-[#f2f4f7] border-b border-[#e0e3e6]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#006d2f]/10 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[#006d2f] text-base">{meta.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#191c1e] text-sm">{meta.name}</h3>
                      <p className="text-xs text-[#556067]">{meta.desc}</p>
                    </div>
                  </div>
                </div>

                {/* Pricing Table */}
                <div className="divide-y divide-[#f2f4f7]">
                  {/* Header row */}
                  <div className="grid grid-cols-4 px-4 py-2 bg-white">
                    <div className="text-xs font-semibold text-[#556067] uppercase tracking-wider">Duration</div>
                    <div className="text-xs font-semibold text-[#556067] uppercase tracking-wider text-center">Base</div>
                    <div className="text-xs font-semibold text-[#556067] uppercase tracking-wider text-center">GST (18%)</div>
                    <div className="text-xs font-semibold text-[#556067] uppercase tracking-wider text-right">Total</div>
                  </div>

                  {cycles.map((plan, idx) => {
                    const base = parseFloat(plan.base_amount);
                    const gst = base * (parseFloat(plan.tax_percentage) / 100);
                    const total = totalFor(plan);
                    const isAnnual = plan.billing_cycle === '365days';
                    return (
                      <div
                        key={plan.billing_cycle}
                        className={`grid grid-cols-4 px-4 py-3 items-center ${isAnnual ? 'bg-[#006d2f]/5' : 'bg-white'}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#191c1e]">
                            {CYCLE_LABELS[plan.billing_cycle] || plan.billing_cycle}
                          </span>
                          {isAnnual && (
                            <span className="text-xs bg-[#006d2f] text-white px-1.5 py-0.5 rounded-full font-medium">
                              Best Value
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-[#556067] text-center">
                          ₹{base.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-sm text-[#556067] text-center">
                          ₹{gst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold text-[#191c1e]">
                            ₹{total.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 p-4 bg-[#f2f4f7] rounded-xl text-xs text-[#556067] space-y-1">
        <p>• All prices are inclusive of 18% GST</p>
        <p>• Subscriptions are non-refundable as per our Refund Policy</p>
        <p>• Prices are subject to change. Existing subscriptions are not affected by price changes</p>
        <p>• For billing queries contact: nikhil.mathur1215@gmail.com</p>
      </div>
    </div>
  );
};

export default PricingSection;
