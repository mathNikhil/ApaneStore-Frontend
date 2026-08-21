import React from 'react';

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-base font-bold text-[#191c1e] mb-2 pb-1 border-b border-[#e0e3e6]">{title}</h2>
    <div className="text-sm text-[#556067] leading-relaxed space-y-2">{children}</div>
  </div>
);

const RefundSection = () => (
  <div className="p-6 max-w-3xl">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-full bg-[#006d2f]/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-[#006d2f]">currency_rupee</span>
      </div>
      <div>
        <h1 className="text-xl font-bold text-[#191c1e]">Refund Policy</h1>
        <p className="text-xs text-[#556067]">Last updated: August 2026 · Operated by Nikhil Mathur HUF</p>
      </div>
    </div>

    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-6 text-sm text-yellow-800">
      <strong>Important:</strong> This Refund Policy applies to AapnaEstore platform subscription fees only. It does not apply to any transactions between you and your customers on your store.
    </div>

    <Section title="1. Free Trial">
      <p>All new tenants receive a free trial period with full access to the platform. No payment is required during the trial period. You can explore all features and build your store before committing to a paid subscription.</p>
    </Section>

    <Section title="2. Subscription Payments">
      <p>Once you choose to publish your store and select a subscription plan (30-day, 90-day, or 365-day), payment is processed immediately. By completing payment, you agree to our subscription terms.</p>
    </Section>

    <Section title="3. Non-Refundable Payments">
      <p>Paid subscription fees are <strong className="text-[#191c1e]">non-refundable</strong> once the payment has been successfully processed, except in the specific cases outlined in Section 4 below.</p>
      <p>This applies to all subscription plans including 30-day, 90-day, and 365-day plans, regardless of:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Whether you have used the platform after payment</li>
        <li>Whether you have published products on your store</li>
        <li>Whether you decide to close your store after payment</li>
      </ul>
    </Section>

    <Section title="4. Eligible Refund Cases">
      <p>Refunds may be considered in the following specific circumstances:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li><strong className="text-[#191c1e]">Duplicate payment:</strong> If you were charged twice for the same subscription due to a technical error</li>
        <li><strong className="text-[#191c1e]">Proven technical failure:</strong> If AapnaEstore experienced a technical failure directly attributable to our platform that prevented you from accessing the service for a significant portion of your subscription period</li>
        <li><strong className="text-[#191c1e]">Unauthorized transaction:</strong> If a payment was made without your authorization and you report it promptly</li>
      </ul>
    </Section>

    <Section title="5. How to Request a Refund">
      <p>To request a refund for an eligible case:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Raise a refund request within <strong className="text-[#191c1e]">7 days</strong> of the payment date</li>
        <li>Email us at <strong className="text-[#191c1e]">nikhil.mathur1215@gmail.com</strong> with subject line "Refund Request"</li>
        <li>Include your registered mobile number, payment date, and reason for refund</li>
        <li>Attach any supporting evidence (payment screenshot, error screenshots)</li>
      </ul>
    </Section>

    <Section title="6. Refund Processing">
      <p>Once a refund request is approved:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Refunds are processed within 7–10 business days</li>
        <li>The refund will be credited to the original payment method</li>
        <li>You will receive a confirmation email once the refund is processed</li>
        <li>Bank processing time may add an additional 3–5 business days</li>
      </ul>
    </Section>

    <Section title="7. Store Suspension">
      <p>If your store is suspended due to a violation of our Terms of Service, no refund will be issued for any remaining subscription period.</p>
    </Section>

    <Section title="8. Contact for Refund Queries">
      <div className="p-3 bg-[#f2f4f7] rounded-lg space-y-1">
        <p><strong className="text-[#191c1e]">Nikhil Mathur HUF</strong></p>
        <p>Email: nikhil.mathur1215@gmail.com</p>
        <p>Phone: +91 9818410640</p>
        <p>Hours: 9:00 AM – 6:00 PM (Mon–Sat)</p>
      </div>
    </Section>
  </div>
);

export default RefundSection;
