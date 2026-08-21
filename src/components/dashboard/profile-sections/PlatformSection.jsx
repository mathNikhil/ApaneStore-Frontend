import React from 'react';

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-base font-bold text-[#191c1e] mb-2 pb-1 border-b border-[#e0e3e6]">{title}</h2>
    <div className="text-sm text-[#556067] leading-relaxed space-y-2">{children}</div>
  </div>
);

const PlatformSection = () => (
  <div className="p-6 max-w-3xl">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-full bg-[#006d2f]/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-[#006d2f]">policy</span>
      </div>
      <div>
        <h1 className="text-xl font-bold text-[#191c1e]">Platform Policy</h1>
        <p className="text-xs text-[#556067]">Last updated: August 2026 · Operated by Nikhil Mathur HUF</p>
      </div>
    </div>

    <Section title="1. Platform Role">
      <p>AapnaEstore provides the technology and infrastructure required to operate your online store. We are a software platform only. We do not:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Own or hold inventory on behalf of store owners</li>
        <li>Handle, process, or hold any customer payments</li>
        <li>Act as a marketplace or intermediary between buyers and sellers</li>
        <li>Take responsibility for the products or services sold through tenant stores</li>
      </ul>
    </Section>

    <Section title="2. Store Owner Obligations">
      <p>Each store owner is fully responsible for:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Their own products, customers, orders, and business operations</li>
        <li>Compliance with all applicable Indian laws including the Consumer Protection Act, GST regulations, and any sector-specific regulations</li>
        <li>Accurate product descriptions, pricing, and availability</li>
        <li>Timely fulfilment of orders and handling of returns</li>
        <li>Maintaining accurate business and tax registration details</li>
      </ul>
    </Section>

    <Section title="3. Content Standards">
      <p>All content published on stores hosted on AapnaEstore must:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Be accurate, non-misleading, and legally compliant</li>
        <li>Not infringe on the intellectual property rights of any third party</li>
        <li>Not contain offensive, hateful, or discriminatory material</li>
        <li>Not promote illegal products, services, or activities</li>
      </ul>
    </Section>

    <Section title="4. Store Suspension and Termination">
      <p>AapnaEstore reserves the right to suspend or terminate any store that:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Violates our Terms of Service or Platform Policy</li>
        <li>Sells prohibited or illegal products</li>
        <li>Receives verified complaints of fraud or consumer harm</li>
        <li>Engages in activities that damage AapnaEstore's reputation or infrastructure</li>
        <li>Has an expired subscription with no renewal after the grace period</li>
      </ul>
      <p className="mt-2">Store suspension takes effect immediately. We will attempt to notify the store owner via registered email or mobile number before suspension where possible, except in cases of severe violations.</p>
    </Section>

    <Section title="5. Subscription and Access">
      <ul className="list-disc pl-5 space-y-1">
        <li>Subscription fees, once paid, are non-refundable unless otherwise stated in our Refund Policy</li>
        <li>Stores with expired subscriptions will be unpublished after a grace period</li>
        <li>Store data is retained for 90 days after account closure before deletion</li>
        <li>AapnaEstore is not responsible for any loss of business or revenue during platform downtime or service interruptions</li>
      </ul>
    </Section>

    <Section title="6. Payment Gateway Usage">
      <p>AapnaEstore integrates with third-party payment gateways (Cashfree, Razorpay, Stripe) to enable tenants to collect payments from their customers. By using these integrations:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>You agree to the terms and conditions of the respective payment gateway provider</li>
        <li>You are responsible for your own KYC and compliance with the payment gateway's requirements</li>
        <li>All settlements are made directly by the payment gateway to your registered bank account</li>
        <li>AapnaEstore does not touch, hold, or process any funds from your customers</li>
      </ul>
    </Section>

    <Section title="7. Platform Availability">
      <p>AapnaEstore aims to maintain 99% uptime but does not guarantee uninterrupted service. Scheduled maintenance will be communicated in advance where possible. We are not liable for any business loss resulting from platform unavailability.</p>
    </Section>

    <Section title="8. Dispute Resolution">
      <p>Any disputes between AapnaEstore and store owners will be resolved through direct communication in the first instance. If unresolved, disputes will be subject to arbitration under the Arbitration and Conciliation Act, 1996, with New Delhi as the seat of arbitration.</p>
    </Section>

    <Section title="9. Policy Updates">
      <p>AapnaEstore may update this Platform Policy from time to time. Continued use of the platform constitutes acceptance of the updated policy. Material changes will be communicated via email or in-app notification.</p>
    </Section>

    <Section title="10. Contact">
      <div className="p-3 bg-[#f2f4f7] rounded-lg space-y-1">
        <p><strong className="text-[#191c1e]">Nikhil Mathur HUF</strong></p>
        <p>Udyam Registration: UDYAM-DL-06-0221356</p>
        <p>Email: nikhil.mathur1215@gmail.com</p>
        <p>Phone: +91 9818410640</p>
        <p>Hours: 9:00 AM – 6:00 PM (Mon–Sat)</p>
      </div>
    </Section>
  </div>
);

export default PlatformSection;
