import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';

const WAInvoiceList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = user.id;
    if (!tenantId) { setLoading(false); return; }

    fetch(`${API_URL}/api/tenants/${tenantId}/market/invoices`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(d => {
      setOrders(Array.isArray(d) ? d : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const downloadInvoice = (order) => {
    // Generate invoice HTML and print
    const base = order.base_amount || 0;
    const gstRate = order.gst_rate || 18;
    const gst = order.gst_amount || parseFloat((base * gstRate / 100).toFixed(2));
    const total = order.total_amount || parseFloat((base + gst).toFixed(2));
    const date = new Date(order.created_at).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'});
    const invoiceNo = `WA-INV-${new Date(order.created_at).getFullYear()}-${String(order.id).padStart(4,'0')}`;

    const html = `<!DOCTYPE html><html><head><title>Invoice ${invoiceNo}</title>
    <style>body{font-family:Arial,sans-serif;max-width:600px;margin:40px auto;color:#1a2332}
    .header{display:flex;justify-content:space-between;margin-bottom:30px}
    .title{font-size:24px;font-weight:700;color:#006d2f}
    table{width:100%;border-collapse:collapse;margin:20px 0}
    th{background:#f8fafc;padding:10px;text-align:left;border-bottom:2px solid #e8ecf0}
    td{padding:10px;border-bottom:1px solid #f0f4f8}
    .total{font-weight:700;font-size:16px}
    .footer{margin-top:30px;font-size:12px;color:#8e9eab;border-top:1px solid #e8ecf0;padding-top:16px}
    </style></head><body>
    <div class="header">
      <div><div class="title">AapnaEstore</div><div style="font-size:12px;color:#8e9eab">WhatsApp Market Invoice</div></div>
      <div style="text-align:right"><div style="font-weight:700">${invoiceNo}</div><div style="font-size:12px;color:#8e9eab">${date}</div></div>
    </div>
    <table>
      <tr><th>Description</th><th>Amount</th></tr>
      <tr><td>WhatsApp Market — ${order.plan_name || 'Subscription'}</td><td>₹${base.toFixed(2)}</td></tr>
      <tr><td>GST @ ${gstRate}%</td><td>₹${gst.toFixed(2)}</td></tr>
      <tr class="total"><td>Total</td><td>₹${total.toFixed(2)}</td></tr>
    </table>
    <div class="footer">
      <p>Order ID: ${order.order_id}</p>
      <p>Payment via Cashfree · Status: ${order.status}</p>
      <p>AapnaEstore · support@aapnaestore.com · +91 8800244169</p>
    </div>
    </body></html>`;

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.print();
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
        <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-[#006d2f]">campaign</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#191c1e]">WhatsApp Market Invoices</h1>
          <p className="text-xs text-[#556067]">Download GST invoices for your WhatsApp Market subscriptions</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-[#556067]">
          <span className="material-symbols-outlined text-4xl mb-3 block text-[#bbcbb9]">campaign</span>
          <p className="font-medium text-[#191c1e]">No WhatsApp Market invoices yet</p>
          <p className="text-sm mt-1">Invoices will appear here after you subscribe to a WhatsApp Market plan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const base = order.base_amount || (order.amount);
            const gstRate = order.gst_rate || 18;
            const gst = order.gst_amount || parseFloat((base * gstRate / 100).toFixed(2));
            const total = order.total_amount || order.amount;
            const date = new Date(order.created_at).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'});
            const invoiceNo = `WA-INV-${new Date(order.created_at).getFullYear()}-${String(order.id).padStart(4,'0')}`;

            return (
              <div key={order.id} className="border border-[#e0e3e6] rounded-xl p-4 bg-white hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-sm text-[#191c1e]">WhatsApp Market — {order.plan_name || 'Subscription'}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.status==='paid'?'bg-green-100 text-green-700':'bg-amber-100 text-amber-700'}`}>
                        {order.status}
                      </span>
                      <span className="text-xs text-[#556067] font-mono">{invoiceNo}</span>
                    </div>
                    <p className="text-xs text-[#556067]">Paid: {date}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[#556067]">
                      <span>Base: ₹{base?.toFixed(2)}</span>
                      <span>GST ({gstRate}%): ₹{gst?.toFixed(2)}</span>
                      <span className="font-bold text-[#191c1e]">Total: ₹{total?.toFixed(2)}</span>
                    </div>
                  </div>
                  <button onClick={() => downloadInvoice({...order, base_amount:base, gst_rate:gstRate, gst_amount:gst, total_amount:total, invoiceNo})}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#006d2f] text-white rounded-xl text-xs font-semibold hover:brightness-110 transition-all flex-shrink-0">
                    <span className="material-symbols-outlined text-sm">download</span>
                    Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 p-4 bg-[#f2f4f7] rounded-xl text-xs text-[#556067]">
        <p className="font-medium text-[#191c1e] mb-1">📋 For Tax Filing</p>
        <p>These invoices include GST breakdown. Use them for claiming input tax credit in your GST returns.</p>
      </div>
    </div>
  );
};

export default WAInvoiceList;
