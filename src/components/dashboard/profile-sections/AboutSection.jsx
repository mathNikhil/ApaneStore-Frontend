import React from 'react';

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-base font-bold text-[#191c1e] mb-2 pb-1 border-b border-[#e0e3e6]">{title}</h2>
    <div className="text-sm text-[#556067] leading-relaxed space-y-2">{children}</div>
  </div>
);

const AboutSection = () => (
  <div className="p-6 max-w-3xl">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-full bg-[#006d2f]/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-[#006d2f]">info</span>
      </div>
      <div>
        <h1 className="text-xl font-bold text-[#191c1e]">About AapnaEstore</h1>
        <p className="text-xs text-[#556067]">Last updated: August 2026</p>
      </div>
    </div>

    <Section title="What is AapnaEstore?">
      <p>AapnaEstore is a white-label e-commerce SaaS platform that empowers anyone to create their own branded online store — without writing a single line of code. Whether you are a kirana store owner, home baker, fashion boutique, manufacturer, reseller, or service provider, AapnaEstore gives you the tools you need to establish your online presence and start selling online quickly.</p>
    </Section>

    <Section title="Our Mission">
      <p>Our mission is to make e-commerce accessible to every small business in India — regardless of technical knowledge, budget, or background. We believe every business owner should have the opportunity to build their own digital storefront and own their customer relationship without having to invest heavily in technology or development.</p>
    </Section>

    <Section title="Who Operates AapnaEstore">
      <p>AapnaEstore is owned and operated by <strong className="text-[#191c1e]">Nikhil Mathur HUF</strong>, an Indian business entity.</p>
      <div className="mt-3 p-3 bg-[#f2f4f7] rounded-lg space-y-1">
        <p><span className="font-medium text-[#191c1e]">Business Name:</span> Nikhil Mathur HUF</p>
        <p><span className="font-medium text-[#191c1e]">Udyam Registration:</span> UDYAM-DL-06-0221356</p>
        <p><span className="font-medium text-[#191c1e]">Support Email:</span> nikhil.mathur1215@gmail.com</p>
        <p><span className="font-medium text-[#191c1e]">Support Phone:</span> +91 9818410640</p>
        <p><span className="font-medium text-[#191c1e]">Working Hours:</span> 9:00 AM – 6:00 PM (Mon–Sat)</p>
      </div>
    </Section>

    <Section title="Our Commitment">
      <p>AapnaEstore is built with a simple goal: to help small businesses build their own online presence without the cost and complexity of traditional e-commerce development. We aim to be transparent about who operates the platform, how the service works, and what responsibilities belong to AapnaEstore and its store owners.</p>
    </Section>
  </div>
);

export default AboutSection;
