import React from 'react';
const S = ({ children }) => <p className="text-sm text-[#556067] mb-3">{children}</p>;
const H = ({ children }) => <h2 className="text-base font-bold text-[#191c1e] mt-6 mb-2">{children}</h2>;
const UL = ({ items }) => <ul className="list-disc pl-5 space-y-1 text-sm text-[#556067] mb-3">{items.map((item, i) => <li key={i}>{item}</li>)}</ul>;
const PlatformSection = () => (
  <div className="p-6 max-w-3xl">
    <h1 className="text-2xl font-bold text-[#191c1e] mb-1">Platform Policy</h1>
    <p className="text-xs text-[#8e9eab] mb-6">Effective date: 1 September 2026 | Last updated: 1 September 2026</p>
    <H>1. Purpose and Scope</H>
    <S>This Platform Policy describes activities and content that are prohibited or restricted on AapnaEstore and explains how reports and enforcement are handled. It applies to all tenants, store owners, users, content, stores, and activity conducted through the Platform.</S>
    <H>2. Prohibited Activities and Products</H>
    <UL items={["Counterfeit, stolen, unlawfully sourced, or illegally imported goods.", "Copyright, trademark, privacy, publicity, or other intellectual-property infringement.", "Illegal drugs, controlled substances, weapons, ammunition, or explosives where prohibited by applicable law.", "Fraud, scams, impersonation, deceptive schemes, or misleading commercial practices.", "Malware, phishing, credential theft, malicious code, or unauthorised access.", "Unlicensed financial, medical, legal, regulated, or other restricted services.", "Content or products prohibited by applicable law or by payment-provider rules (Cashfree, Razorpay, Stripe, or as applicable).", "Activities that create material security, safety, financial, or consumer-harm risks to customers or to the Platform.", "Adult content, gambling services, alcohol, or tobacco products without applicable licences and in compliance with applicable law."]} />
    <H>3. Seller Information and Verification</H>
    <S>Tenants must provide and maintain accurate information to identify and contact the seller, including: legal or business name, business address, support email, mobile number, and payment-provider verification. A store may be unpublished or restricted if required seller information is missing, inaccurate, unverifiable, or misleading.</S>
    <H>4. Store Review and Monitoring</H>
    <S>We may review store content and account activity when reasonably necessary for security, technical support, abuse prevention, complaint investigation, policy enforcement, or legal compliance. Review may be manual, automated, or triggered by a report.</S>
    <H>5. Reports and Notices</H>
    <S>Reports may be submitted by email to aapnaestore@gmail.com. Please include:</S>
    <UL items={["Your name and contact details.", "The store URL or specific content location.", "A description of the issue and the legal or policy basis for the report.", "Supporting evidence (screenshots, URLs, order references).", "For intellectual property matters: evidence of rights and a good-faith declaration."]} />
    <H>6. Review and Action</H>
    <S>Depending on the circumstances and applicable law, we may: request further information; restrict content visibility; remove or disable access to content; unpublish a store; suspend or terminate an account; preserve records; notify affected parties; or refer matters to payment providers or authorities.</S>
    <S>Urgent action may be taken without prior notice for suspected fraud, illegal activity, malware, phishing, serious consumer harm, security threats, or legal requirements. For non-urgent complaints, we aim to acknowledge within 3 business days and communicate a decision within 15 business days.</S>
    <H>7. Repeat Violations</H>
    <S>We maintain records of repeated or serious policy violations. Tenants with a pattern of violations may face permanent account termination. Tenants may appeal a decision by emailing aapnaestore@gmail.com with subject line "Policy Appeal" within 15 days of notification. Appeals will be reviewed within 15 business days.</S>
    <H>8. Preservation and Lawful Requests</H>
    <S>We may preserve relevant information and records where required by law, legal process, security needs, dispute resolution, fraud prevention, or a valid legal hold. We cooperate with courts and government authorities as required or permitted by applicable Indian law, including the Information Technology Act 2000.</S>
    <H>9. Customer Complaints About Tenant Stores</H>
    <S>Customers should first contact the seller identified on the relevant storefront for product, delivery, quality, return, or refund matters. AapnaEstore may investigate matters indicating fraud, illegal activity, serious consumer harm, security concerns, or a breach of this Policy. Contact: aapnaestore@gmail.com.</S>
    <H>10. Policy Changes</H>
    <S>We may update this Policy as the Platform, applicable law, payment-provider requirements, and risk environment change. Material updates will be communicated by email to registered tenant accounts and/or by in-app notice. Continued use of the Platform after the effective date of a revised Policy constitutes acceptance of the revised Policy.</S>
  </div>
);
export default PlatformSection;