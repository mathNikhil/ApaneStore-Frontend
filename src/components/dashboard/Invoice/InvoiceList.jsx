import React, { useState, useEffect } from 'react';
import InvoiceModal from './InvoiceModal';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';

const PLAN_LABELS = {
  subdomain_apnaestore: 'Free Subdomain + AapnaEstore Hosting',
  custom_domain_apnaestore: 'Custom Domain + AapnaEstore Hosting',
  custom_domain_own_hosting: 'Custom Domain + Own Hosting',
};

const CYCLE_LABELS = {
  '30days': '30 Days',
  '90days': '90 Days',
  '365days': '365 Days',
};

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [downloading, setDownloading] = useState(null);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setInvoices(data.data);
    } catch (e) {
      console.error('Failed to fetch invoices:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const handleDownloadExisting = async (invoice) => {
    if (!invoice.invoice_number) {
      setSelectedInvoice(invoice);
      return;
    }
    setDownloading(invoice.id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/invoices/${invoice.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setSelectedInvoice(invoice); return; }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setSelectedInvoice(invoice);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) return (
    <div className="p-6 flex items-center gap-2 text-[#556067]">
      <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
      Loading invoices...
    </div>
  );

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[#006d2f]/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-[#006d2f]">receipt_long</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#191c1e]">Subscription Invoices</h1>
          <p className="text-xs text-[#556067]">Download GST invoices for your tax filing</p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-16 text-[#556067]">
          <span className="material-symbols-outlined text-4xl mb-3 block text-[#bbcbb9]">receipt_long</span>
          <p className="font-medium text-[#191c1e]">No invoices yet</p>
          <p className="text-sm mt-1">Invoices will appear here after you subscribe to a plan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map(invoice => {
            const storeUrl = invoice.subdomain
              ? `${invoice.subdomain}.aapnaestore.com`
              : (invoice.custom_domain || invoice.store_name);
            const planLabel = PLAN_LABELS[invoice.plan_key] || invoice.plan_name || invoice.plan_key;
            const cycleLabel = CYCLE_LABELS[invoice.billing_cycle] || invoice.billing_cycle;
            const paidDate = invoice.paid_at
              ? new Date(invoice.paid_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              : 'N/A';

            return (
              <div key={invoice.id} className="border border-[#e0e3e6] rounded-xl p-4 bg-white hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-sm text-[#191c1e]">{invoice.store_name}</span>
                      <span className="text-xs bg-[#006d2f]/10 text-[#006d2f] px-2 py-0.5 rounded-full font-medium">
                        {cycleLabel}
                      </span>
                      {invoice.invoice_number && (
                        <span className="text-xs text-[#556067] font-mono">{invoice.invoice_number}</span>
                      )}
                    </div>
                    <p className="text-xs text-[#556067] truncate">{storeUrl}</p>
                    <p className="text-xs text-[#556067] mt-0.5">{planLabel}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm font-bold text-[#191c1e]">
                        ₹{parseFloat(invoice.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-[#556067]">Paid: {paidDate}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadExisting(invoice)}
                    disabled={downloading === invoice.id}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#006d2f] text-white rounded-xl text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex-shrink-0"
                  >
                    {downloading === invoice.id ? (
                      <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-sm">download</span>
                    )}
                    {invoice.invoice_number ? 'Download' : 'Generate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 p-4 bg-[#f2f4f7] rounded-xl text-xs text-[#556067]">
        <p className="font-medium text-[#191c1e] mb-1">📋 For Tax Filing</p>
        <p>These invoices are valid GST tax documents. Use them for claiming input tax credit (if applicable) in your GST returns.</p>
      </div>

      {selectedInvoice && (
        <InvoiceModal
          subscription={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onSuccess={() => { fetchInvoices(); }}
        />
      )}
    </div>
  );
};

export default InvoiceList;
