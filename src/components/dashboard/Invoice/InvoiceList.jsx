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
  const [waInvoices, setWaInvoices] = useState([]);

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

  useEffect(() => {
    fetchInvoices();
    // Fetch WA market invoices
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = user.id;
    if (tenantId) {
      fetch(`${API_URL}/api/tenants/${tenantId}/market/invoices`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json()).then(d => {
        setWaInvoices(Array.isArray(d) ? d : []);
      }).catch(() => {});
    }
  }, []);

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

      {/* WhatsApp Market Invoices */}
      {waInvoices.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#006d2f]">campaign</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#191c1e]">WhatsApp Market Invoices</h2>
              <p className="text-xs text-[#556067]">Subscription invoices for WhatsApp Market plans</p>
            </div>
          </div>
          <div className="space-y-3">
            {waInvoices.map(order => {
              const base = parseFloat(order.base_amount || order.amount || 0);
              const gstRate = parseFloat(order.gst_rate || 18);
              const gst = parseFloat(order.gst_amount || (base * gstRate / 100).toFixed(2));
              const total = parseFloat(order.total_amount || order.amount || 0);
              const date = new Date(order.created_at).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'});
              const invoiceNo = `WA-INV-${new Date(order.created_at).getFullYear()}-${String(order.id).padStart(4,'0')}`;

              const downloadWA = () => {
                const html = `<!DOCTYPE html><html><head><title>${invoiceNo}</title>
                <style>body{font-family:Arial,sans-serif;max-width:600px;margin:40px auto;color:#1a2332}
                .title{font-size:24px;font-weight:700;color:#006d2f}
                table{width:100%;border-collapse:collapse;margin:20px 0}
                th{background:#f8fafc;padding:10px;text-align:left;border-bottom:2px solid #e8ecf0}
                td{padding:10px;border-bottom:1px solid #f0f4f8}
                .total{font-weight:700}</style></head><body>
                <div style="display:flex;justify-content:space-between;margin-bottom:30px">
                  <div><div class="title">AapnaEstore</div><div style="font-size:12px;color:#8e9eab">WhatsApp Market Invoice</div></div>
                  <div style="text-align:right"><div style="font-weight:700">${invoiceNo}</div><div style="font-size:12px;color:#8e9eab">${date}</div></div>
                </div>
                <table>
                  <tr><th>Description</th><th>Amount</th></tr>
                  <tr><td>WhatsApp Market — ${order.plan_name || 'Subscription'}</td><td>₹${base.toFixed(2)}</td></tr>
                  <tr><td>GST @ ${gstRate}%</td><td>₹${gst.toFixed(2)}</td></tr>
                  <tr class="total"><td>Total</td><td>₹${total.toFixed(2)}</td></tr>
                </table>
                <div style="margin-top:30px;font-size:12px;color:#8e9eab;border-top:1px solid #e8ecf0;padding-top:16px">
                  <p>Order ID: ${order.order_id}</p>
                  <p>AapnaEstore · support@aapnaestore.com · +91 8800244169</p>
                </div></body></html>`;
                const w = window.open('', '_blank');
                w.document.write(html);
                w.document.close();
                w.print();
              };

              return (
                <div key={order.id} className="border border-[#e0e3e6] rounded-xl p-4 bg-white hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-sm text-[#191c1e]">WhatsApp Market — {order.plan_name || 'Subscription'}</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{order.status}</span>
                        <span className="text-xs text-[#556067] font-mono">{invoiceNo}</span>
                      </div>
                      <p className="text-xs text-[#556067]">Paid: {date}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-[#556067]">
                        <span>Base: ₹{base.toFixed(2)}</span>
                        <span>GST ({gstRate}%): ₹{gst.toFixed(2)}</span>
                        <span className="font-bold text-[#191c1e]">Total: ₹{total.toFixed(2)}</span>
                      </div>
                    </div>
                    <button onClick={downloadWA}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#006d2f] text-white rounded-xl text-xs font-semibold hover:brightness-110 transition-all flex-shrink-0">
                      <span className="material-symbols-outlined text-sm">download</span>
                      Download
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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
