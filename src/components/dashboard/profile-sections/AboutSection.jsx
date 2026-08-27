import React from 'react';
const S = ({ children }) => <p className="text-sm text-[#556067] mb-3">{children}</p>;
const H = ({ children }) => <h2 className="text-base font-bold text-[#191c1e] mt-6 mb-2">{children}</h2>;
const UL = ({ items }) => <ul className="list-disc pl-5 space-y-1 text-sm text-[#556067] mb-3">{items.map((item, i) => <li key={i}>{item}</li>)}</ul>;
const Table = ({ rows }) => (
  <div className="border border-[#e0e3e6] rounded-xl overflow-hidden mb-4">
    {rows.map(([label, value], i) => (
      <div key={i} className={`flex gap-4 px-4 py-3 text-sm ${i % 2 === 0 ? "bg-[#f8f9fb]" : "bg-white"}`}>
        <span className="text-[#556067] font-medium w-52 flex-shrink-0">{label}</span>
        <span className="text-[#191c1e]">{value}</span>
      </div>
    ))}
  </div>
);
const AboutSection = () => (
  <div className="p-6 max-w-3xl">
    <h1 className="text-2xl font-bold text-[#191c1e] mb-1">About AapnaEstore</h1>
    <p className="text-xs text-[#8e9eab] mb-6">About the Platform</p>
    <S>AapnaEstore is a white-label e-commerce software platform operated by <strong>NIKHIL MATHUR HUF</strong>. It enables individuals and businesses to create, customise, and operate branded online stores without developing an e-commerce website from scratch.</S>
    <S>AapnaEstore provides technology and infrastructure for online store creation and management. Each store owner independently operates its store and remains responsible for its products, services, customers, orders, fulfilment, taxes, licences, and legal compliance.</S>
    <H>What AapnaEstore Provides</H>
    <UL items={["Online store creation and management.", "Product, category, pricing, and inventory management.", "Store branding and configuration, including colour themes and fonts.", "Order-management functionality.", "Domain and hosting options, including subdomains on aapnaestore.com.", "Software integrations with supported third-party payment providers (Cashfree, Razorpay, Stripe).", "Technical infrastructure and platform support via AWS EC2 with Nginx and PostgreSQL."]} />
    <H>What AapnaEstore Does Not Do</H>
    <UL items={["It does not sell, supply, or fulfil tenant products or services.", "It does not own or hold tenant inventory.", "It is not a marketplace for tenant products.", "It is not a payment gateway, payment aggregator, merchant of record, escrow service, or custodian of customer funds.", "It does not receive, pool, or hold customer funds for tenant transactions. Payments are processed and settled directly by the applicable payment provider."]} />
    <H>Business Identity and Contact Details</H>
    <Table rows={[["Legal entity", "NIKHIL MATHUR HUF"], ["Authorised representative / Karta", "NIKHIL MATHUR"], ["Principal address", "C-143 Maharana Pratap Enclave, Pitampura, New Delhi – 110034"], ["GST status", "Not GST registered"], ["Support email", "aapnaestore@gmail.com"], ["Support phone", "+91 9818410640"], ["Support hours", "09:00 AM to 6:00 PM (Monday – Saturday)"]]} />
    <H>Grievance Contact</H>
    <Table rows={[["Name", "NIKHIL MATHUR"], ["Designation", "Karta"], ["Email", "aapnaestore@gmail.com"], ["Phone", "+91 9818410640"], ["Address", "C-143 Maharana Pratap Enclave, Pitampura, New Delhi – 110034"], ["Working hours", "09:00 AM to 6:00 PM (Monday – Saturday)"]]} />
    <H>Payment and Hosting Disclosure</H>
    <S>Tenants are responsible for opening and maintaining their own accounts with supported payment providers (Cashfree, Razorpay, Stripe), completing required onboarding and verification, and complying with provider terms. Payments for purchases made through a tenant store are processed and settled by the applicable payment provider according to its terms. AapnaEstore does not receive, pool, escrow, or settle tenant customer funds.</S>
    <S>AapnaEstore uses Amazon Web Services (AWS EC2) for hosting and infrastructure. The platform runs on Ubuntu 24.04 LTS with PostgreSQL 16 as the database, served via Nginx. Data locations may vary by service component, backup, subprocessor, or technical configuration. See the Privacy Policy for further information.</S>
  </div>
);
export default AboutSection;