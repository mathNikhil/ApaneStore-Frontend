import React from 'react';

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-base font-bold text-[#191c1e] mb-2 pb-1 border-b border-[#e0e3e6]">{title}</h2>
    <div className="text-sm text-[#556067] leading-relaxed space-y-2">{children}</div>
  </div>
);

const PrivacySection = () => (
  <div className="p-6 max-w-3xl">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-full bg-[#006d2f]/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-[#006d2f]">lock</span>
      </div>
      <div>
        <h1 className="text-xl font-bold text-[#191c1e]">Privacy Policy</h1>
        <p className="text-xs text-[#556067]">Last updated: August 2026 · Operated by Nikhil Mathur HUF</p>
      </div>
    </div>

    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-6 text-sm text-blue-800">
      This Privacy Policy explains how AapnaEstore collects, uses, and protects your information when you use our platform.
    </div>

    <Section title="1. Information We Collect">
      <p>When you register and use AapnaEstore, we collect:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Mobile number (used for OTP-based login)</li>
        <li>Email address (for communication and support)</li>
        <li>Business name and type (for your store profile)</li>
        <li>Store configuration data (branding, products, pricing you set up)</li>
        <li>Payment transaction records (for subscription billing)</li>
        <li>Usage data (pages visited, features used, for improving the platform)</li>
      </ul>
    </Section>

    <Section title="2. How We Use Your Information">
      <ul className="list-disc pl-5 space-y-1">
        <li>To provide, operate, and maintain the AapnaEstore platform</li>
        <li>To authenticate your identity via OTP login</li>
        <li>To process your subscription payments</li>
        <li>To send important service notifications and updates</li>
        <li>To provide customer support</li>
        <li>To improve the platform based on usage patterns</li>
        <li>To comply with applicable Indian laws and regulations</li>
      </ul>
    </Section>

    <Section title="3. Data We Do Not Collect or Store">
      <ul className="list-disc pl-5 space-y-1">
        <li>We do not store any payment card or UPI credentials</li>
        <li>We do not access or store your customers' payment information</li>
        <li>We do not collect data from your store's end customers beyond what you configure</li>
      </ul>
    </Section>

    <Section title="4. Data Sharing">
      <p>We do not sell, rent, or trade your personal or business data to third parties. We may share data only in the following limited circumstances:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li><strong className="text-[#191c1e]">Payment processors:</strong> We share necessary transaction details with Cashfree, Razorpay, or Stripe to process your subscription payments</li>
        <li><strong className="text-[#191c1e]">Legal requirements:</strong> We may disclose information if required by Indian law, court order, or government authority</li>
        <li><strong className="text-[#191c1e]">Service providers:</strong> We may use trusted third-party services (hosting, analytics) that process data on our behalf under strict confidentiality</li>
      </ul>
    </Section>

    <Section title="5. Data Security">
      <ul className="list-disc pl-5 space-y-1">
        <li>All data is transmitted over HTTPS (SSL/TLS encrypted connections)</li>
        <li>Payment gateway API keys are encrypted before storage using AES-256 encryption</li>
        <li>Passwords and sensitive credentials are never stored in plain text</li>
        <li>Our servers are hosted on AWS with security group restrictions</li>
        <li>Regular security audits are conducted on our infrastructure</li>
      </ul>
    </Section>

    <Section title="6. Data Retention">
      <p>We retain your account and store data for as long as your account is active or as needed to provide services. If you close your account, we will retain data for 90 days before permanent deletion, unless required by law to retain it longer.</p>
    </Section>

    <Section title="7. Your Rights">
      <p>As a user of AapnaEstore, you have the right to:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Access the personal data we hold about you</li>
        <li>Request correction of inaccurate data</li>
        <li>Request deletion of your account and associated data</li>
        <li>Opt out of non-essential communications</li>
      </ul>
      <p className="mt-2">To exercise any of these rights, contact us at <strong className="text-[#191c1e]">nikhil.mathur1215@gmail.com</strong></p>
    </Section>

    <Section title="8. Cookies">
      <p>AapnaEstore uses minimal cookies and local storage to maintain your login session and store preferences. We do not use third-party advertising cookies.</p>
    </Section>

    <Section title="9. Changes to This Policy">
      <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or an in-app notification. Continued use of the platform after changes constitutes acceptance of the updated policy.</p>
    </Section>

    <Section title="10. Contact">
      <p>For any privacy-related queries or concerns, contact:</p>
      <div className="mt-2 p-3 bg-[#f2f4f7] rounded-lg space-y-1">
        <p><strong className="text-[#191c1e]">Nikhil Mathur HUF</strong></p>
        <p>Email: nikhil.mathur1215@gmail.com</p>
        <p>Phone: +91 9818410640</p>
        <p>Hours: 9:00 AM – 6:00 PM (Mon–Sat)</p>
      </div>
    </Section>
  </div>
);

export default PrivacySection;
