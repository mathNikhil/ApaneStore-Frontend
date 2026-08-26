import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';

const ReferSection = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    fetch(`${API_URL}/api/stores/referral/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { if (d.success) setSummary(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    if (!summary?.referralLink) return;
    navigator.clipboard.writeText(summary.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join AapnaEstore',
        text: `Start your online store with AapnaEstore and get 50% off your first publish!`,
        url: summary?.referralLink,
      });
    } else {
      handleCopy();
    }
  };

  if (loading) return (
    <div className="p-6 flex items-center gap-2 text-[#556067]">
      <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
      Loading...
    </div>
  );

  return (
    <div className="p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[#006d2f]/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-[#006d2f]">share</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#191c1e]">Refer & Earn</h1>
          <p className="text-xs text-[#556067]">Invite friends and earn discounts on your next publish</p>
        </div>
      </div>

      {/* How it works */}
      <div className="p-4 bg-[#006d2f]/5 border border-[#006d2f]/20 rounded-xl mb-6">
        <h3 className="font-bold text-sm text-[#191c1e] mb-3">How it works</h3>
        <div className="space-y-2">
          {[
            { step: '1', text: 'Share your unique referral link with friends' },
            { step: '2', text: 'Friend signs up and publishes their store' },
            { step: '3', text: 'You get 10% off your next publish (up to 5 referrals)' },
          ].map(item => (
            <div key={item.step} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#006d2f] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {item.step}
              </div>
              <p className="text-sm text-[#556067]">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Available bonus */}
      {summary?.availableBonusDisplay > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-6 text-center">
          <div className="text-2xl font-bold text-green-700">{summary.availableBonusDisplay}% off</div>
          <div className="text-sm text-green-600 mt-1">referral discount ready on your next publish!</div>
        </div>
      )}

      {/* Referral link */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider mb-2">
          Your Referral Link
        </label>
        <div className="flex gap-2">
          <div className="flex-1 px-4 py-2.5 border border-[#e0e3e6] rounded-lg text-sm bg-[#f2f4f7] text-[#556067] truncate">
            {summary?.referralLink || 'Loading...'}
          </div>
          <button
            onClick={handleCopy}
            className="px-3 py-2.5 border border-[#e0e3e6] rounded-lg hover:bg-[#f2f4f7] transition-all flex-shrink-0"
          >
            <span className="material-symbols-outlined text-base text-[#556067]">
              {copied ? 'check' : 'content_copy'}
            </span>
          </button>
          <button
            onClick={handleShare}
            className="px-3 py-2.5 bg-[#006d2f] text-white rounded-lg hover:brightness-110 transition-all flex-shrink-0"
          >
            <span className="material-symbols-outlined text-base">share</span>
          </button>
        </div>
        {copied && <p className="text-xs text-green-600 mt-1">✓ Link copied to clipboard!</p>}
      </div>

      {/* Referral stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Referrals', value: (summary?.creditedCount || 0) + (summary?.referrals?.filter(r => r.status === 'pending')?.length || 0) },
          { label: 'Successful', value: summary?.creditedCount || 0 },
          { label: 'Bonus Used', value: `${(summary?.referralPointsUsed || 0) * (summary?.settings?.referralBonusPercent || 10)}%` },
        ].map(item => (
          <div key={item.label} className="p-3 bg-[#f2f4f7] rounded-xl text-center">
            <div className="text-xl font-bold text-[#191c1e]">{item.value}</div>
            <div className="text-xs text-[#556067] mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-[#556067] mb-1">
          <span>Referrals used</span>
          <span>{summary?.referralPointsUsed || 0}/{summary?.maxReferrals || 5}</span>
        </div>
        <div className="w-full bg-[#e0e3e6] rounded-full h-2">
          <div
            className="bg-[#006d2f] h-2 rounded-full transition-all"
            style={{ width: `${((summary?.referralPointsUsed || 0) / (summary?.maxReferrals || 5)) * 100}%` }}
          />
        </div>
      </div>

      {/* Referral list */}
      {summary?.referrals?.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm text-[#191c1e] mb-3">Your Referrals</h3>
          <div className="space-y-2">
            {summary.referrals.map((ref, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-[#e0e3e6] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#f2f4f7] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#556067] text-sm">person</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#191c1e]">{ref.company_name || 'New Tenant'}</p>
                    <p className="text-xs text-[#556067]">
                      {ref.referred_publish_count > 0 ? 'Store published ✅' : 'Not published yet ⏳'}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  ref.status === 'credited'
                    ? 'bg-green-100 text-green-700'
                    : ref.referred_publish_count > 0
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-[#f2f4f7] text-[#556067]'
                }`}>
                  {ref.status === 'credited' ? '+10% credited' : ref.referred_publish_count > 0 ? 'Ready to credit' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary?.referrals?.length === 0 && (
        <div className="text-center py-8 text-[#556067]">
          <span className="material-symbols-outlined text-4xl block mb-2 text-[#bbcbb9]">group_add</span>
          <p className="font-medium text-[#191c1e]">No referrals yet</p>
          <p className="text-sm mt-1">Share your link to start earning discounts!</p>
        </div>
      )}
    </div>
  );
};

export default ReferSection;
