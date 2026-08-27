import React from 'react';
const S = ({ children }) => <p className="text-sm text-[#556067] mb-3">{children}</p>;
const H = ({ children }) => <h2 className="text-base font-bold text-[#191c1e] mt-6 mb-2">{children}</h2>;
const UL = ({ items }) => <ul className="list-disc pl-5 space-y-1 text-sm text-[#556067] mb-3">{items.map((item, i) => <li key={i}>{item}</li>)}</ul>;
const PrivacySection = () => (
  <div className="p-6 max-w-3xl">
    <h1 className="text-2xl font-bold text-[#191c1e] mb-1">Privacy Policy</h1>
    <p className="text-xs text-[#8e9eab] mb-6">Effective date: 1 September 2026 | Last updated: 1 September 2026</p>
    <H>1. Scope and Privacy Roles</H>
    <S>This Privacy Policy explains how NIKHIL MATHUR HUF, operating AapnaEstore (accessible at aapnaestore.com and associated subdomains), collects, uses, stores, discloses, and protects digital personal data.</S>
    <S>For personal data relating directly to AapnaEstore users, account holders, tenant administrators, billing contacts, support contacts, and website visitors, AapnaEstore determines the purposes and means of processing to the extent applicable under law.</S>
    <S>For personal data submitted by a tenant about the tenant's customers and processed to provide the tenant's store services, the tenant determines the purposes of processing and AapnaEstore processes that data on the tenant's documented instructions, subject to the actual technical arrangement and applicable law.</S>
    <H>2. Information We Collect</H>
    <UL items={["Account information: name, mobile number, email address, login and authentication information (OTP-based).", "Business and store information: business/store name, subdomain URL, products, descriptions, images, prices, branding configuration (colours, fonts, logos), and order-management information.", "Billing information: subscription plan, transaction or reference information, billing status, dates, and invoices.", "Technical information: IP address, browser and device information, login and security events, diagnostics, server logs, and usage information.", "Support and communications: messages, complaints, requests, attachments, and records of our responses.", "Tenant-customer data: information that a tenant collects through its store (name, mobile number, delivery address, order details), as described by that tenant's privacy notice."]} />
    <H>3. How Information is Used</H>
    <UL items={["Provide, operate, secure, maintain, and improve AapnaEstore.", "Create and manage tenant accounts and stores.", "Process subscriptions, billing, invoices, refunds, and support requests.", "Prevent fraud, abuse, unauthorised access, and security incidents.", "Communicate service updates, operational notices, and support responses via SMS/email.", "Comply with legal obligations and respond to lawful requests."]} />
    <H>4. Tenant-Customer Data</H>
    <S>Tenants are responsible for determining what customer information they collect, why they collect it, providing an appropriate customer-facing privacy notice, and complying with applicable law including the Digital Personal Data Protection Act, 2023. AapnaEstore processes tenant-customer data solely to host and operate the store, provide order functionality, maintain security, troubleshoot issues, provide support, maintain backups, prevent abuse, and comply with law.</S>
    <H>5. Sharing and Subprocessors</H>
    <S>We may share information with service providers that support the following functions:</S>
    <UL items={["Hosting and infrastructure: Amazon Web Services (AWS), India region.", "Payment processing: Cashfree Payments, Razorpay, and/or Stripe (as configured by the platform operator).", "SMS / OTP authentication: [OWNER TO CONFIRM — insert SMS gateway provider name once configured].", "Security, monitoring, and analytics: server-level logging and PM2 process monitoring."]} />
    <S>Data is primarily stored and processed in India (AWS EC2, Mumbai region). International transfers, if any, will comply with applicable law.</S>
    <H>6. Cookies and Similar Technologies</H>
    <S>AapnaEstore may use cookies, browser local storage, and similar technologies for authentication session management, security, user preferences, and basic functionality. No third-party advertising cookies are used on the platform. Tenant storefronts operate independently and may use their own technologies.</S>
    <H>7. Retention, Deletion, and Export</H>
    <S>We retain information for as long as reasonably necessary for the purposes described in this Policy.</S>
    <UL items={["Tenant account and store data: retained for the duration of the subscription and for 90 days following account termination, after which it is deleted or anonymised, subject to legal holds.", "Server logs and technical data: retained for up to 30 days on a rolling basis.", "Billing and transaction records: retained for a minimum of 7 years as required under Indian accounting and tax law."]} />
    <S>To request data export or deletion, email aapnaestore@gmail.com with your registered name, mobile number, and the specific request.</S>
    <H>8. Security and Incidents</H>
    <S>We use reasonable technical and organisational safeguards, including JWT-based authentication, HTTPS/SSL via Nginx, PostgreSQL access controls, PM2 process isolation, and AWS infrastructure security. No online service can guarantee absolute security. Incident handling and notifications will be performed as required by applicable law.</S>
    <H>9. Rights and Privacy Contact</H>
    <S>Requests relating to AapnaEstore account data may be sent to aapnaestore@gmail.com. Requests relating to a tenant's customers should be directed to the relevant tenant, whose contact details appear on the storefront.</S>
    <S>Privacy contact: NIKHIL MATHUR, Karta, aapnaestore@gmail.com, +91 9818410640, C-143 Maharana Pratap Enclave, Pitampura, New Delhi – 110034.</S>
    <H>10. Children and Changes</H>
    <S>AapnaEstore is intended for persons aged 18 years or older with legal capacity to use the service. We do not knowingly collect personal data from minors. We may update this Policy and will communicate material changes via email to registered tenant accounts and/or by prominently displaying a notice on the platform.</S>
  </div>
);
export default PrivacySection;