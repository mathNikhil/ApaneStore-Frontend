import React from 'react';

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-base font-bold text-[#191c1e] mb-2 pb-1 border-b border-[#e0e3e6]">{title}</h2>
    <div className="text-sm text-[#556067] leading-relaxed space-y-2">{children}</div>
  </div>
);

const TermsSection = () => (
  <div className="p-6 max-w-3xl">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-full bg-[#006d2f]/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-[#006d2f]">description</span>
      </div>
      <div>
        <h1 className="text-xl font-bold text-[#191c1e]">Terms & Conditions</h1>
        <p className="text-xs text-[#556067]">Last updated: August 2026 · Operated by Nikhil Mathur HUF</p>
      </div>
    </div>

    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-6 text-sm text-blue-800">
      By registering and using AapnaEstore, you agree to these Terms & Conditions. Please read them carefully.
    </div>

    <Section title="1. Acceptance of Terms">
      <p>By accessing or using the AapnaEstore platform, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, you may not use the platform.</p>
    </Section>

    <Section title="2. Platform Description">
      <p>AapnaEstore is a software-as-a-service (SaaS) platform that provides tools for creating and managing online stores. We provide the technology infrastructure only. We are not a marketplace, payment processor, or seller of any goods or services offered through tenant stores.</p>
    </Section>

    <Section title="3. Eligibility">
      <ul className="list-disc pl-5 space-y-1">
        <li>You must be at least 18 years of age to register</li>
        <li>You must be a legal resident of India or have a registered Indian business entity</li>
        <li>You must provide accurate and complete registration information</li>
        <li>One mobile number may be associated with only one tenant account</li>
      </ul>
    </Section>

    <Section title="4. Account Responsibilities">
      <p>You are responsible for:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Maintaining the security and confidentiality of your account</li>
        <li>All activities that occur under your account</li>
        <li>Notifying us immediately of any unauthorized use of your account</li>
        <li>Keeping your contact information (email, mobile) up to date</li>
      </ul>
    </Section>

    <Section title="5. Store Owner Responsibilities">
      <p>As a store owner (tenant), you are solely responsible for:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>All products, descriptions, images, and pricing published on your store</li>
        <li>Ensuring your products and business comply with applicable Indian laws and regulations</li>
        <li>Handling all customer queries, disputes, returns, and order fulfilment</li>
        <li>Providing accurate business, contact, and payment information</li>
        <li>Obtaining all necessary licenses, permits, and registrations for your business</li>
        <li>Collecting and remitting applicable taxes (GST, etc.) on your sales</li>
      </ul>
    </Section>

    <Section title="6. Prohibited Activities">
      <p>You may not use AapnaEstore to sell or promote:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Counterfeit, pirated, or unlicensed products</li>
        <li>Illegal drugs, controlled substances, or drug paraphernalia</li>
        <li>Weapons, ammunition, or explosives</li>
        <li>Pornographic or sexually explicit content</li>
        <li>Content that promotes violence, hatred, or discrimination</li>
        <li>Products that infringe on intellectual property rights</li>
        <li>Financial fraud, pyramid schemes, or misleading investment products</li>
        <li>Any product or service prohibited under Indian law</li>
      </ul>
    </Section>

    <Section title="7. Subscription and Payment">
      <ul className="list-disc pl-5 space-y-1">
        <li>Platform access requires a paid subscription after the free trial period</li>
        <li>Subscription fees are charged in advance for the selected period (30, 90, or 365 days)</li>
        <li>All prices are inclusive of applicable GST</li>
        <li>Subscriptions do not auto-renew — you must manually renew before expiry</li>
        <li>Failure to renew will result in your store being unpublished after the grace period</li>
      </ul>
    </Section>

    <Section title="8. Intellectual Property">
      <ul className="list-disc pl-5 space-y-1">
        <li>The AapnaEstore platform, including its design, code, and features, is owned by Nikhil Mathur HUF</li>
        <li>You retain ownership of the content (products, images, text) you upload to your store</li>
        <li>By uploading content, you grant AapnaEstore a limited licence to display and serve that content as part of operating your store</li>
        <li>You may not copy, reverse engineer, or reproduce any part of the AapnaEstore platform</li>
      </ul>
    </Section>

    <Section title="9. Termination">
      <p>We reserve the right to suspend or terminate your account if you:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Violate any of these Terms & Conditions</li>
        <li>Engage in fraudulent or illegal activity</li>
        <li>Fail to pay subscription fees</li>
        <li>Abuse the platform or other users</li>
      </ul>
      <p className="mt-2">You may terminate your account at any time by contacting our support team.</p>
    </Section>

    <Section title="10. Limitation of Liability">
      <p>AapnaEstore (operated by Nikhil Mathur HUF) shall not be liable for:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Any loss of business, revenue, or profits arising from use of the platform</li>
        <li>Any disputes between you and your customers</li>
        <li>Platform downtime or service interruptions beyond our reasonable control</li>
        <li>Loss of data due to circumstances beyond our reasonable control</li>
        <li>Actions taken by payment gateways or third-party service providers</li>
      </ul>
    </Section>

    <Section title="11. Governing Law">
      <p>These Terms & Conditions are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.</p>
    </Section>

    <Section title="12. Changes to Terms">
      <p>We may update these Terms from time to time. Continued use of the platform after changes are posted constitutes acceptance of the updated terms. We will notify you of significant changes via email or in-app notification.</p>
    </Section>

    <Section title="13. Contact">
      <div className="p-3 bg-[#f2f4f7] rounded-lg space-y-1">
        <p><strong className="text-[#191c1e]">Nikhil Mathur HUF</strong></p>
        <p>Udyam Registration: UDYAM-DL-06-0221356</p>
        <p>Email: nikhil.mathur1215@gmail.com</p>
        <p>Phone: +91 9818410640</p>
      </div>
    </Section>
  </div>
);

export default TermsSection;
