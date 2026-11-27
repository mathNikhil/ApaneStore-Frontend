import React from 'react';

const FAQS = [
  { group: "Getting started", items: [
    { q: "What is AapnaEstore?", a: "AapnaEstore lets Indian businesses launch their own branded online store with WhatsApp ordering, inventory management, payments and order tracking, without any coding. It supports product stores and service stores that take appointments." },
    { q: "Who is AapnaEstore for?", a: "Sellers of physical products such as fashion, food, electronics, grocery, handicrafts and gifts, and service businesses such as salons, clinics, yoga studios, spas, dental practices, photography studios and coaching." },
    { q: "How long does it take to set up a store?", a: "About 20 minutes. Create your account, run the guided 8-step store builder, add your products, then share your store link or QR code." },
    { q: "Do I need coding or design skills?", a: "No. You pick your colours, upload your logo and arrange your categories from the dashboard." },
    { q: "Do I need a credit card to sign up?", a: "No. You only need a Gmail ID to sign up and create your ApnaEstore account. You can explore the platform, set up your store, preview it, and test its features without making any payment. Once you're satisfied with your store and ready to go live, you can publish it by choosing a suitable plan and completing the payment.We support multiple payment options, including: Credit or Debit Cards, UPI, Bank Transfers. You can build and explore your store first and pay only when you're ready to publish it." },
  ] },
  { group: "Pricing and payments", items: [
    { q: "How much does AapnaEstore cost?", a: "ApnaEstore offers store hosting through an ApnaEstore subdomain, such as yourstore.aapnaestore.com, and the option to connect your own domain. Subscription plans are available with 30-day, 90-day and 365-day billing cycles, with discounts on longer subscription periods. Hosting is included in the applicable plans.For more details {MORE_LINKS.map(( ['Pricing Plans', '/profile/pricing'],)" },
    { q: "Do you take a commission on my sales?", a: "No. AapnaEstore charges 0% commission and your payments go to your own payment account. Payment gateways such as Razorpay, Cashfree and Stripe charge their own processing fees." },
    { q: "Which payment methods can my customers use?", a: "UPI, cards and net banking, through Razorpay, Cashfree or Stripe depending on the gateway you connect." },
  ] },
  { group: "Selling with AapnaEstore", items: [
    { q: "How do WhatsApp ordering and marketing work?", a: "When a customer orders, their number is saved to your WhatsApp contacts automatically. Shoppers who leave items in their cart get an automatic WhatsApp reminder, you can broadcast offers to all your buyers, and customers get order and booking confirmations on WhatsApp." },
    { q: "Can I take appointments for a service business?", a: "Yes. ApnaEstore offers a Service Store designed for appointment-based businesses such as salons, clinics, spas, yoga studios and coaching centres. You can manage staff-wise calendars, service durations, working hours, breaks and real-time appointment availability. A 10-minute temporary slot hold helps prevent two customers from booking the same available slot simultaneously. You also get an appointment management dashboard and a printable daily schedule." },
    { q: "Can I take in-person and table orders?", a: "Yes. ApnaEstore supports QR-code ordering for physical stores, tables and individual products. Customers can scan a QR code using their smartphones, browse available products and place orders. These orders are managed through the same dashboard and inventory system as your online orders." },
    { q: "Can I manage stock and import products in bulk?", a: "Stock updates with every sale and you get low-stock alerts. You can import a whole catalogue from a CSV file." },
    { q: "Do you generate GST invoices?", a: "Yes. A GST invoice is generated automatically for every order." },
    { q: "Can I run more than one store?", a: "Yes. You can manage multiple stores under one account, each with its own inventory and order flow." },
  ] },
  { group: "Your brand and domain", items: [
    { q: "Is AapnaEstore white-label?", a: "Yes. Your store runs under your own name, logo and colours, on your own domain if you choose, so customers see your brand." },
    { q: "Can I use my own domain?", a: "Yes. Every store gets a free subdomain like yourstore.aapnaestore.com, and you can connect your own domain on the custom domain plan." },
    { q: "How do my customers log in?", a: "There is no need to create or remember a separate password. Simply select Continue with Google, choose your Gmail account, and you're logged in.It's quick, secure, and hassle-free." },
  ] },
  { group: "Support and policies", items: [
    { q: "How do I contact support?", a: "Message us on WhatsApp at +91 98184 10640, Monday to Saturday, 9 AM to 6 PM, or email aapnaestore@gmail.com." },
    { q: "What is your refund policy?", a: "Refunds are governed by the terms and conditions described in our Refund Policy. Please review the Refund Policy page for information about eligibility, applicable conditions and the refund request process." },
    { q: "How do I ask for my data to be deleted?", a: " You can submit a request to delete your account and associated personal data through the Data Deletion Request page, accessible from the profile menu. Requests are handled in accordance with our applicable data retention and privacy policies.Use the Data Deletion Request page, linked at the bottom of the profile menu." },
  ] },
];

const MORE_LINKS = [
  ['Pricing Plans', '/profile/pricing'],
  ['Refund Policy', '/profile/refund'],
  ['Terms & Conditions', '/profile/terms'],
  ['Privacy Policy', '/profile/privacy'],
  ['Data Deletion Request', '/profile/data-deletion'],
];

const FaqSection = () => (
  <div className="bg-[#f3faf5] min-h-screen font-sans">
    <div className="max-w-3xl mx-auto px-4 pt-12 pb-10">
      <p className="text-xs font-bold tracking-widest uppercase text-[#006d2f] mb-2">Help</p>
      <h1 className="text-3xl font-bold text-[#111a14] leading-tight mb-3">Frequently asked questions about AapnaEstore</h1>
      <p className="text-sm text-[#556b5c] mb-8 max-w-xl">Quick answers about pricing, payments, WhatsApp ordering, appointments and your store.</p>

      {FAQS.map(({ group, items }) => (
        <section key={group} className="mb-8">
          <h2 className="text-lg font-bold text-[#111a14] mb-3">{group}</h2>
          <div className="space-y-2">
            {items.map(({ q, a }) => (
              <details key={q} className="bg-white border border-[#c8e8d2] rounded-xl p-4">
                <summary className="cursor-pointer text-sm font-semibold text-[#111a14]">{q}</summary>
                <p className="text-sm text-[#556b5c] leading-relaxed mt-2">{a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}

      <div className="bg-white border border-[#c8e8d2] rounded-xl p-5">
        <h2 className="text-base font-bold text-[#111a14] mb-2">Still have a question?</h2>
        <p className="text-sm text-[#556b5c] mb-3">
          Message us on <a href="https://wa.me/919818410640" target="_blank" rel="noreferrer" className="text-[#006d2f] underline">WhatsApp</a>
          {' '}or email <a href="mailto:aapnaestore@gmail.com" className="text-[#006d2f] underline">aapnaestore@gmail.com</a>.
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {MORE_LINKS.map(([label, href]) => (
            <a key={href} href={href} className="text-xs text-[#006d2f] underline">{label}</a>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default FaqSection;
