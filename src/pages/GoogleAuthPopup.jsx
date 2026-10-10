import React, { useEffect, useState } from 'react';

const GOOGLE_CLIENT_ID = '168190401805-8k10ipii41bokt3fg90nfudv67r72i02.apps.googleusercontent.com';
const API = 'https://api.aapnaestore.com';

const GoogleAuthPopup = () => {
  const [status, setStatus] = useState('Loading...');
  const [storeName, setStoreName] = useState('AapnaEstore');
  const [storeLogo, setStoreLogo] = useState('');
  const params = new URLSearchParams(window.location.search);
  const storeId = params.get('storeId');

  const sendToParent = (data) => {
    if (window.opener) {
      window.opener.postMessage({ type: 'GOOGLE_AUTH_RESULT', ...data }, '*');
      window.close();
    }
  };

  useEffect(() => {
    if (!storeId) { setStatus('Missing store ID'); return; }
    fetch('https://api.aapnaestore.com/api/public/store-by-id/' + storeId)
      .then(r => r.json()).then(d => {
        if (d.success && d.data) {
          setStoreName(d.data.config?.brand?.brandName || d.data.name || 'AapnaEstore');
          setStoreLogo(d.data.config?.brand?.logoUrl || '');
        }
      }).catch(() => {});

    const initGoogle = () => {
      if (!window.google) { setStatus('Google not loaded'); return; }
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          setStatus('Verifying...');
          try {
            const res = await fetch(`${API}/api/store/${storeId}/auth/social/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential: response.credential })
            });
            const data = await res.json();
            sendToParent(data);
          } catch(e) {
            sendToParent({ success: false, error: 'Verification failed' });
          }
        }
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-btn'),
        { theme: 'outline', size: 'large', width: 300, text: 'continue_with' }
      );
      window.google.accounts.id.prompt();
    };

    if (window.google) initGoogle();
    else {
      const interval = setInterval(() => {
        if (window.google) { initGoogle(); clearInterval(interval); }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [storeId]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', background: '#f8fafc' }}>
      {storeLogo ? <img src={storeLogo} alt={storeName} style={{ height: 52, marginBottom: 16, objectFit: 'contain' }} /> : null}
      <h2 style={{ fontSize: 18, color: '#191c1e', marginBottom: 8 }}>Sign in to {storeName}</h2>
      <p style={{ fontSize: 13, color: '#556067', marginBottom: 24 }}>{status}</p>
      <div id="google-btn"></div>
    </div>
  );
};

export default GoogleAuthPopup;
