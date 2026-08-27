import React from 'react';
const S = ({ children }) => <p className="text-sm text-[#556067] mb-3">{children}</p>;
const H = ({ children }) => <h2 className="text-base font-bold text-[#191c1e] mt-6 mb-2">{children}</h2>;
const UL = ({ items }) => <ul className="list-disc pl-5 space-y-1 text-sm text-[#556067] mb-3">{items.map((item, i) => <li key={i}>{item}</li>)}</ul>;
const RefundSection = () => (
  <div className="p-6 max-w-3xl">
    <h1 className="text-2xl font-bold text-[#191c1e] mb-1">Refund Policy</h1>
    <p className="text-xs text-[#8e9eab] mb-6">Effective date: 1 September 2026 | Last updated: 1 September 2026</p>
    <H>1. Scope</H>
    <S>This Refund Policy applies to subscription fees paid for AapnaEstore platform access. Purchases of products or services from a tenant store are separate transactions between the customer and the relevant tenant, subject to the tenant's terms and applicable law.</S>
    <H>2. Free Trial</H>
    <S>AapnaEstore offers a free trial period as stated on the applicable pricing page at the time of sign-up. No payment is required during the trial. Tenants wishing to continue after the trial must select a paid subscription plan. The trial does not automatically convert to a paid subscription without explicit tenant action.</S>
    <H>3. Subscription Payments</H>
    <S>Subscriptions are paid in advance for the period selected at checkout. Subscriptions do not automatically renew without the tenant's explicit action. Expiry of a subscription may result in the store being unpublished or restriction of paid features, subject to applicable law and the Terms & Conditions.</S>
    <H>4. Taxes and Invoices</H>
    <S>NIKHIL MATHUR HUF is not currently GST registered. Prices displayed are inclusive of all applicable charges. Invoices or payment receipts will be provided as required by applicable law.</S>
    <H>5. Refund Eligibility</H>
    <S>A refund may be approved in the following circumstances:</S>
    <UL items={["Duplicate payment caused by a technical or payment-processing error.", "Verified unauthorised subscription payment, subject to investigation and payment-provider rules.", "Verified material technical failure directly attributable to AapnaEstore that materially prevented access to the paid service for a continuous period exceeding 48 hours, and where AapnaEstore was unable to restore access.", "Failure to activate a paid plan where the failure is attributable to AapnaEstore.", "Any refund required by applicable law."]} />
    <H>6. Non-Refundable Cases</H>
    <S>Except where a refund is required by law or expressly approved under this Policy, subscription fees are ordinarily non-refundable for voluntary cancellation, early store closure, unused subscription time, dissatisfaction with business outcomes, or suspension or termination resulting from a violation of the Terms & Conditions or Platform Policy. This does not remove any mandatory statutory right.</S>
    <H>7. How to Request a Refund</H>
    <S>Send a written request to aapnaestore@gmail.com with the following information:</S>
    <UL items={["Registered name and registered mobile number / email.", "Payment date and transaction or reference number (from your payment receipt).", "Reason for the refund request.", "Supporting evidence (e.g., screenshot of error, duplicate payment confirmation)."]} />
    <S>Requests should be made within 7 days of the payment date. This internal period does not restrict any statutory right that cannot legally be excluded.</S>
    <H>8. Processing</H>
    <S>We will acknowledge refund requests within 3 business days and communicate our decision within 7 business days of receiving all required information. Approved refunds will normally be initiated within 5 business days and returned to the original payment method, subject to payment-provider and banking timelines (typically 5–10 working days). For escalation, email aapnaestore@gmail.com with subject line "Refund Escalation".</S>
    <H>9. Tenant-Store Purchases</H>
    <S>For product quality, delivery, cancellation, return, or refund complaints relating to a purchase from a tenant store, contact the seller identified on the storefront and order confirmation. AapnaEstore may review reports involving fraud, illegal activity, serious consumer harm, platform abuse, security concerns, or violations of the Platform Policy.</S>
  </div>
);
export default RefundSection;