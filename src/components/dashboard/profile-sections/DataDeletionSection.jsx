import React from 'react';

const S = ({ children }) => <p className="text-sm text-[#556067] mb-3">{children}</p>;
const H = ({ children }) => <h2 className="text-base font-bold text-[#191c1e] mt-6 mb-2">{children}</h2>;

const DataDeletionSection = () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-[#191c1e] mb-1">Data Deletion Request</h1>
      <p className="text-xs text-[#8e9eab] mb-6">AapnaEstore — Data Deletion Policy (Google, Facebook &amp; Mobile)</p>

      {code && (
        <div className="bg-[#e8f5e9] border border-[#a5d6a7] rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-[#2e7d32]">Data Deletion Request Received</p>
          <p className="text-sm text-[#2e7d32] mt-1">Confirmation Code: <strong>{code}</strong></p>
          <p className="text-sm text-[#556067] mt-2">Your data deletion request has been received and will be processed within 30 days.</p>
        </div>
      )}

      <H>How to Request Data Deletion</H>
      <S>If you have used Google or Facebook Login on AapnaEstore and wish to delete your data, you can do so using any of the following methods:</S>

      <p className="text-sm font-semibold text-[#191c1e] mt-4 mb-1">Via Google Account</p>
      <ol className="list-decimal pl-5 space-y-2 text-sm text-[#556067] mb-4">
        <li>Go to <a href="https://myaccount.google.com/permissions" target="_blank" className="text-[#006d2f] underline">myaccount.google.com/permissions</a> → Find AapnaEstore → Remove Access</li>
        <li>This revokes AapnaEstore's access to your Google account. To delete your stored data, also email us below.</li>
      </ol>

      <p className="text-sm font-semibold text-[#191c1e] mt-2 mb-1">Via Facebook Account</p>
      <ol className="list-decimal pl-5 space-y-2 text-sm text-[#556067] mb-4">
        <li>Go to your Facebook profile → Settings &amp; Privacy → Settings → Apps and Websites → Remove AapnaEstore → Send Request</li>
      </ol>

      <p className="text-sm font-semibold text-[#191c1e] mt-2 mb-1">Via Mobile Number (OTP Login)</p>
      <ol className="list-decimal pl-5 space-y-2 text-sm text-[#556067] mb-4">
        <li>Login to AapnaEstore → Go to your Profile → Click "Delete my account"</li>
      </ol>

      <p className="text-sm font-semibold text-[#191c1e] mt-2 mb-1">Direct Request</p>
      <ol className="list-decimal pl-5 space-y-2 text-sm text-[#556067] mb-4">
        <li>Email us at <a href="mailto:aapnaestore@gmail.com" className="text-[#006d2f] underline">aapnaestore@gmail.com</a> with subject "Data Deletion Request" and your registered email or mobile number</li>
      </ol>

      <H>What Data We Delete</H>
      <S>Upon receiving a valid deletion request, we will permanently delete or anonymize the following data within 30 days:</S>
      <ul className="list-disc pl-5 space-y-1 text-sm text-[#556067] mb-3">
        <li>Your name and email address linked via Google or Facebook</li>
        <li>Your Google ID or Facebook user ID stored in our system</li>
        <li>Your mobile number and profile information collected during registration</li>
        <li>Any store data associated with your account</li>
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
