import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API_BASE_URL from '../config/api';

// Cashfree redirects here after payment.
// We just show a status screen and redirect back to dashboard.
const QRPaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking'); // checking | success | failed

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    if (!orderId) {
      setStatus('failed');
      return;
    }

    // Poll backend to confirm payment status
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/qr/payment-status?order_id=${orderId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.active) {
          setStatus('success');
        } else {
          setStatus('failed');
        }
      } catch {
        setStatus('failed');
      }
    };

    checkStatus();
  }, []);

  useEffect(() => {
    if (status === 'success' || status === 'failed') {
      const timer = setTimeout(() => navigate('/dashboard'), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div style={container}>
      <div style={card}>
        {status === 'checking' && (
          <>
            <div style={spinner} />
            <h2 style={title}>Verifying payment...</h2>
            <p style={sub}>Please wait, do not close this page.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={icon}>✅</div>
            <h2 style={{ ...title, color: '#15803d' }}>QR Scanner Activated!</h2>
            <p style={sub}>Your staff can now generate and print QR codes from the inventory page.</p>
            <p style={redirect}>Redirecting to dashboard...</p>
          </>
        )}
        {status === 'failed' && (
          <>
            <div style={icon}>❌</div>
            <h2 style={{ ...title, color: '#dc2626' }}>Payment not confirmed</h2>
            <p style={sub}>If your payment went through, QR will activate within a few minutes via webhook. Check your dashboard.</p>
            <p style={redirect}>Redirecting to dashboard...</p>
          </>
        )}
      </div>
    </div>
  );
};

const container = {
  minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: '#f0f2f5'
};
const card = {
  background: '#fff', borderRadius: 20, padding: '48px 40px', textAlign: 'center',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)', maxWidth: 420, width: '100%'
};
const icon = { fontSize: 56, marginBottom: 16 };
const title = { fontSize: 22, fontWeight: 700, color: '#1a1a2e', margin: '0 0 12px' };
const sub = { fontSize: 14, color: '#666', lineHeight: 1.6, margin: '0 0 16px' };
const redirect = { fontSize: 13, color: '#999' };
const spinner = {
  width: 48, height: 48, border: '4px solid #e5e7eb',
  borderTop: '4px solid #1a56db', borderRadius: '50%',
  animation: 'spin 0.8s linear infinite', margin: '0 auto 20px'
};

export default QRPaymentReturn;
