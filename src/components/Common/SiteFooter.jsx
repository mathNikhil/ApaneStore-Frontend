import React from 'react';
import { useLocation } from 'react-router-dom';

// Pages where a footer would get in the way: popups, admin, store builder / publish flow, auth steps.
// To hide the footer on another page, add its path start to this list.
const HIDDEN_PREFIXES = [
  '/auth/',
  '/admin',
  '/store-builder',
  '/store/',
  '/qr-payment-return',
  '/verify-otp',
  '/onboarding',
];

const SiteFooter = () => {
  const { pathname } = useLocation();
  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  return (
    <footer className="pb-24 lg:pb-6">
    {/* ── Footer ── */}
    <div className="max-w-4xl mx-auto px-4 py-7 border-t border-[#c8e8d2]">
      <p className="text-xs text-[#556b5c]">© 2026 Nikhil Mathur HUF · AapnaEstore</p>
      <p className="text-xs mt-2 space-x-3"><a href="/profile/faq" className="text-[#006d2f] underline">FAQ</a><a href="/profile/pricing" className="text-[#006d2f] underline">Pricing</a><a href="/profile/refund" className="text-[#006d2f] underline">Refund Policy</a><a href="/profile/terms" className="text-[#006d2f] underline">Terms</a><a href="/profile/privacy" className="text-[#006d2f] underline">Privacy</a></p>
    </div>
    </footer>
  );
};

export default SiteFooter;
