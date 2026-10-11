import React, { useEffect, useState } from 'react';

const FB_APP_ID = '1428867775876072';
const API = 'https://api.aapnaestore.com';

const FacebookAuthPopup = () => {
  const params = new URLSearchParams(window.location.search);
  const storeId = params.get('storeId');
  const initName = decodeURIComponent(params.get('storeName') || 'AapnaEstore');
  const initLogo = decodeURIComponent(params.get('storeLogo') || '');
  const [status, setStatus] = useState('Connecting...');
  const [storeName] = useState(initName);
  const [storeLogo] = useState(initLogo);

  const sendToParent = (data) => {
    if (window.opener) {
      window.opener.postMessage({ type: 'FACEBOOK_AUTH_RESULT', ...data }, '*');
      setTimeout(() => window.close(), 300);
    }
  };

  const doFBLogin = () => {
    setStatus('');
    window.FB.login((response) => {
      if (response.authResponse) {
        setStatus('Verifying...');
        try {
          const res = await fetch(API + '/api/store/' + storeId + '/auth/social/facebook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accessToken: response.authResponse.accessToken,
              userID: response.authResponse.userID
            })
          });
          sendToParent(await res.json());
        } catch(e) {
          sendToParent({ success: false, error: 'Verification failed' });
        }
      } else {
        sendToParent({ success: false, error: 'Facebook login cancelled' });
      }
    }, { scope: 'email,public_profile' });
  };

  useEffect(() => {
    if (!storeId) { setStatus('Missing store ID'); return; }

    const initFB = () => {
      window.FB.init({ appId: FB_APP_ID, cookie: true, xfbml: false, version: 'v21.0' });
      doFBLogin();
    };

    if (window.FB) {
      initFB();
    } else {
      window.fbAsyncInit = initFB;
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [storeId]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', background: '#f8fafc', padding: 24 }}>
      {storeLogo && <img src={storeLogo} alt={storeName} style={{ height: 56, marginBottom: 12, objectFit: 'contain' }} />}
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#191c1e', marginBottom: 4 }}>Sign in to {storeName}</h2>
      <p style={{ fontSize: 10, color: '#aaa', marginBottom: 20 }}>Powered by AapnaEstore</p>
      {status && <p style={{ fontSize: 13, color: '#556067' }}>{status}</p>}
    </div>
  );
};

export default FacebookAuthPopup;
