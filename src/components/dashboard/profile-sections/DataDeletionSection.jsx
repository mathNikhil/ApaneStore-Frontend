import React from 'react';

const S = ({ children }) => <p className="text-sm text-[#556067] mb-3">{children}</p>;
const H = ({ children }) => <h2 className="text-base font-bold text-[#191c1e] mt-6 mb-2">{children}</h2>;

const DataDeletionSection = () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-[#191c1e] mb-1">Data Deletion Request</h1>
      <p className="text-xs text-[#8e9eab] mb-6">AapnaEstore — Facebook Data Deletion Policy</p>

      {code && (
        <div className="bg-[#e8f5e9] border border-[#a5d6a7] rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-[#2e7d32]">Data Deletion Request Received</p>
          <p className="text-sm text-[#2e7d32] mt-1">Confirmation Code: <strong>{code}</strong></p>
          <p className="text-sm text-[#556067] mt-2">Your data deletion request has been received and will be processed within 30 days.</p>
        </div>
      )}

      <H>How to Request Data Deletion</H>
      <S>If you have used Facebook Login on AapnaEstore and wish to delete your data, you can do so in two ways:</S>
      <ol className="list-decimal pl-5 space-y-2 text-sm text-[#556067] mb-4">
        <li>Go to your Facebook profile → Settings &amp; Privacy → Settings → Apps and Websites → Remove AapnaEstore → Send Request</li>
        <li>Email us directly at <a href="mailto:aapnaestore@gmail.com" className="text-[#006d2f] underline">aapnaestore@gmail.com</a> with subject "Data Deletion Request" and your registered email or mobile number</li>
      </ol>

      <H>What Data We Delete</H>
      <S>Upon receiving a valid deletion request, we will permanently delete or anonymize the following data within 30 days:</S>
      <ul className="list-disc pl-5 space-y-1 text-sm text-[#556067] mb-3">
        <li>Your name and email address linked via Facebook</li>
        <li>Your Facebook user ID stored in our system</li>
        <li>Any profile information collected during registration</li>
      </ul>

      <H>What We Retain</H>
      <S>As required by Indian law (GST, accounting regulations), we retain billing and transaction records for a minimum of 7 years. These records will be anonymized and not linked to your personal identity.</S>

      <H>Contact</H>
      <S>For any questions about data deletion, contact us at <a href="mailto:aapnaestore@gmail.com" className="text-[#006d2f] underline">aapnaestore@gmail.com</a> or call +91 9818410640.</S>
      <S>NIKHIL MATHUR, Karta — C-143 Maharana Pratap Enclave, Pitampura, New Delhi – 110034.</S>
    </div>
  );
};

export default DataDeletionSection;
