import React from 'react';
const S = ({ children }) => <p className="text-sm text-[#556067] mb-3">{children}</p>;
const H = ({ children }) => <h2 className="text-base font-bold text-[#191c1e] mt-6 mb-2">{children}</h2>;
const UL = ({ items }) => <ul className="list-disc pl-5 space-y-1 text-sm text-[#556067] mb-3">{items.map((item, i) => <li key={i}>{item}</li>)}</ul>;
const TermsSection = () => (
  <div className="p-6 max-w-3xl">
    <h1 className="text-2xl font-bold text-[#191c1e] mb-1">Terms & Conditions</h1>
    <p className="text-xs text-[#8e9eab] mb-6">Effective date: 1 September 2026 | Last updated: 1 September 2026</p>
    <H>1. Agreement</H>
    <S>These Terms & Conditions form a legally binding agreement between you and NIKHIL MATHUR HUF, operating AapnaEstore. By registering, accessing, or using AapnaEstore, you agree to these Terms, the Privacy Policy, Refund Policy, and Platform Policy.</S>
    <H>2. Definitions</H>
    <UL items={['"AapnaEstore" means the software platform operated by NIKHIL MATHUR HUF, accessible at aapnaestore.com.', '"Tenant" or "Store Owner" means a person or organisation using the platform to create and operate an online store.', '"Customer" means a person purchasing from or interacting with a tenant store.', '"Platform" means the website, software, infrastructure, APIs, store builder, storefront, admin panels, and related services.', '"Store" means a branded online storefront created by a Tenant using the Platform.']} />
    <H>3. Eligibility and Account</H>
    <UL items={["You must be at least 18 years old or have legal capacity to enter a binding agreement under applicable Indian law.", "You must provide accurate and complete information during registration.", "You must have authority to operate the business or store you create on the Platform.", "You must maintain account security and promptly report suspected unauthorised access to aapnaestore@gmail.com.", "You are responsible for all activity conducted under your account."]} />
    <H>4. Tenant Responsibilities</H>
    <S>The Tenant is solely responsible for its store, products, services, pricing, descriptions, images, availability, customers, communications, orders, fulfilment, delivery, returns, refunds, cancellations, taxes, invoices, licences, permits, advertising, intellectual property, privacy notices, and regulatory compliance.</S>
    <S>The Tenant must provide accurate seller identity and contact information and ensure that required disclosures are visible on the storefront before customers make purchases.</S>
    <H>5. Payment Providers</H>
    <S>Tenants must independently open and maintain accounts with supported payment providers (Cashfree, Razorpay, Stripe), complete required KYC and onboarding, and comply with provider terms. AapnaEstore does not receive, pool, hold, escrow, or settle tenant customer funds. Payment processing is governed solely by the applicable payment provider's terms.</S>
    <H>6. Subscriptions, Pricing, and Taxes</H>
    <S>Subscription plans, features, prices, trial terms, and available billing periods are shown at checkout or on the pricing page at the time of purchase. We may change prices for future periods after providing reasonable advance notice. NIKHIL MATHUR HUF is not currently GST registered; prices are as displayed.</S>
    <H>7. Intellectual Property and Content</H>
    <S>AapnaEstore software, code, interface, design, branding, and technology are owned by or licensed to NIKHIL MATHUR HUF. Tenants retain all rights in content they upload. AapnaEstore will not use tenant logos, store content, or testimonials for marketing without the tenant's express prior written consent.</S>
    <H>8. Availability and Third Parties</H>
    <S>The Platform depends on internet connectivity, AWS hosting, domain services, payment providers, SMS gateways, and other third-party services. We do not guarantee uninterrupted or error-free operation. No formal SLA is offered under these Terms unless separately agreed in writing.</S>
    <H>9. Suspension and Termination</H>
    <S>We may suspend or terminate a tenant's account or store for:</S>
    <UL items={["Violation of these Terms or the Platform Policy.", "Fraudulent, illegal, deceptive, or harmful activity.", "Listing of prohibited products or services.", "Malware, phishing, credential theft, or security threats.", "Disruption or abuse of the platform or other tenants.", "Non-payment or subscription expiry.", "Legal, regulatory, court, government, or payment-provider requirements."]} />
    <H>10. Indemnity</H>
    <S>To the maximum extent permitted by applicable law, the Tenant will indemnify and hold harmless NIKHIL MATHUR HUF from claims, losses, liabilities, and expenses arising from the Tenant's products, services, store content, advertising, IP infringement, privacy or legal violations, tax obligations, fraud, or breach of these Terms.</S>
    <H>11. Disclaimers and Liability</H>
    <S>AapnaEstore does not guarantee sales, revenue, customer acquisition, or business growth. To the maximum extent permitted by applicable law, NIKHIL MATHUR HUF will not be liable for indirect, incidental, special, consequential, or punitive losses.</S>
    <S>Aggregate liability cap: our total aggregate liability to any Tenant shall not exceed the total subscription fees paid by that Tenant in the 3 months immediately preceding the event giving rise to the claim.</S>
    <H>12. Confidentiality</H>
    <S>Each party will protect non-public information received from the other party using reasonable care and use it only for the agreed purpose. This obligation survives termination of the agreement for a period of 3 years.</S>
    <H>13. Governing Law and Disputes</H>
    <S>These Terms are governed by the laws of India. Before formal proceedings, the parties will attempt good-faith resolution by emailing aapnaestore@gmail.com. If unresolved within 30 days, disputes will be subject to the exclusive jurisdiction of the courts at New Delhi, India.</S>
    <H>14. Changes and Notices</H>
    <S>We may update these Terms at any time. Material changes will be communicated by email at least 15 days before taking effect. Legal notices must be sent to: NIKHIL MATHUR, Karta, NIKHIL MATHUR HUF, C-143 Maharana Pratap Enclave, Pitampura, New Delhi – 110034, and by email to aapnaestore@gmail.com.</S>
  </div>
);
export default TermsSection;