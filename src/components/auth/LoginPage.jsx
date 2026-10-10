import { showSuccess, showError } from '../../utils/toast';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../Common/TopAppBar';
import Input from '../Common/Input';
import { useAuth } from '../../Context/AuthContext';
import logo from '../../assets/images/Apnaestore-Logo.png';

const getDeviceFingerprint = () => {
  const raw = [navigator.userAgent, screen.width + 'x' + screen.height, Intl.DateTimeFormat().resolvedOptions().timeZone, navigator.language].join('|');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) { hash = ((hash << 5) - hash) + raw.charCodeAt(i); hash |= 0; }
  return String(Math.abs(hash));
};

const API = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';

const LoginPage = () => {
  const navigate = useNavigate();
  const { sendOTP } = useAuth();
  const TEST_MOBILES = (import.meta.env.VITE_TEST_MOBILES || '').split(',').map(m => m.trim());
  const TEST_PASSWORD = import.meta.env.VITE_TEST_PASSWORD || '';

  const [mobile, setMobile] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);

  // Google states
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showLinkPhone, setShowLinkPhone] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [googleProfile, setGoogleProfile] = useState(null);
  const [linkPhone, setLinkPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');

  const saveAndRedirect = (token, tenant) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(tenant));
    localStorage.setItem('loginTime', Date.now().toString());
    window.location.href = '/dashboard';
  };

  const handleGoogleLogin = async (credential) => {
    setGoogleLoading(true);
    try {
      const res = await fetch(API + '/api/auth/google', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });
      const data = await res.json();
      if (data.success && !data.isNewTenant) {
        saveAndRedirect(data.token, data.tenant);
      } else if (data.success && data.isNewTenant) {
        setGoogleProfile(data);
        setCompanyName(data.name || '');
        setShowLinkPhone(true);
      } else {
        showError(data.error || 'Google login failed');
      }
    } catch(e) { showError('Google login failed'); }
    setGoogleLoading(false);
  };

  const handleFacebookLogin = () => {
    if (!window.FB) { showError('Facebook SDK not loaded'); return; }
    window.FB.login((response) => {
      if (response.authResponse) {
        const { accessToken, userID } = response.authResponse;
        setGoogleLoading(true);
        fetch(API + '/api/auth/facebook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken, userID })
        })
        .then(r => r.json())
        .then(data => {
          if (data.success && !data.isNewTenant) {
            saveAndRedirect(data.token, data.tenant);
          } else if (data.success && data.isNewTenant) {
            setGoogleProfile({ ...data, isFacebook: true });
            setCompanyName(data.name || '');
            setShowLinkPhone(true);
          } else { showError(data.error || 'Facebook login failed'); }
        })
        .catch(() => showError('Facebook login failed'))
        .finally(() => setGoogleLoading(false));
      }
    }, { scope: 'email,public_profile' });
  };

  const handleLinkPhone = async (e) => {
    e.preventDefault();
    if (linkPhone.length !== 10) { showError('Enter valid 10-digit mobile number'); return; }
    setGoogleLoading(true);
    try {
      const res = await fetch(API + '/api/auth/google/link-phone', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleId: googleProfile.isFacebook ? null : googleProfile.googleId, facebookId: googleProfile.isFacebook ? googleProfile.facebookId : null, email: googleProfile.email, name: googleProfile.name, phone: linkPhone })
      });
      const data = await res.json();
      if (data.success && data.linked) {
        saveAndRedirect(data.token, data.tenant);
      } else if (data.success && !data.linked) {
        setShowLinkPhone(false);
        setBusinessPhone(linkPhone);
        setShowCompleteForm(true);
      } else { showError(data.error || 'Failed'); }
    } catch(e) { showError('Failed to link account'); }
    setGoogleLoading(false);
  };

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    if (!companyName || !businessType) { showError('Please fill all required fields'); return; }
    setGoogleLoading(true);
    try {
      const res = await fetch(API + '/api/auth/google/complete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleId: googleProfile.googleId, email: googleProfile.email, name: googleProfile.name, company_name: companyName, business_type: businessType, phone: businessPhone })
      });
      const data = await res.json();
      if (data.success) { saveAndRedirect(data.token, data.tenant); }
      else { showError(data.error || 'Registration failed'); }
    } catch(e) { showError('Registration failed'); }
    setGoogleLoading(false);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (mobile.length !== 10) { showError('Please enter a valid 10-digit mobile number'); return; }
    setLoading(true);
    try {
      if (TEST_MOBILES.includes(mobile)) {
        if (!testPassword) { showError('Please enter your password'); setLoading(false); return; }
        if (testPassword !== TEST_PASSWORD) { showError('Invalid password'); setLoading(false); return; }
        await sendOTP(mobile, 'login');
        navigate('/verify-otp', { state: { mobile, devOtp: '201807' } });
        setLoading(false); return;
      }
      const savedToken = localStorage.getItem('token');
      const savedMobile = localStorage.getItem('lastMobile');
      const savedFingerprint = localStorage.getItem('deviceFingerprint');
      const loginTime = parseInt(localStorage.getItem('loginTime') || '0');
      const twelveHours = 12 * 60 * 60 * 1000;
      if (savedToken && savedMobile === mobile && savedFingerprint === getDeviceFingerprint() && Date.now() - loginTime < twelveHours) {
        navigate('/dashboard'); setLoading(false); return;
      }
      await sendOTP(mobile, 'login');
      navigate('/verify-otp', { state: { mobile } });
    } catch(e) { showError(e.message || 'Failed to send OTP'); }
    setLoading(false);
  };

  React.useEffect(() => {
    // Init Facebook SDK
    window.fbAsyncInit = function() {
      window.FB.init({ appId: '1428867775876072', cookie: true, xfbml: true, version: 'v21.0' });
    };

    const initGoogle = () => {
      if (window.google && !window.__googleInitialized) {
        window.__googleInitialized = true;
        window.google.accounts.id.initialize({
          client_id: '168190401805-8k10ipii41bokt3fg90nfudv67r72i02.apps.googleusercontent.com',
          callback: (response) => handleGoogleLogin(response.credential),
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          { theme: 'outline', size: 'large', width: 400, text: 'continue_with' }
        );
      }
    };
    if (window.google) initGoogle();
    else {
      const interval = setInterval(() => { if (window.google) { initGoogle(); clearInterval(interval); } }, 200);
      return () => clearInterval(interval);
    }
  }, []);

  // Link Phone Screen
  if (showLinkPhone) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc] px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-[#bbcbb9] p-6">
        <div className="text-center mb-6">
          <img src={logo} alt="AapnaEstore" className="h-12 mx-auto mb-4" />
          <h1 className="font-semibold text-xl text-[#191c1e]">Enter Your Mobile Number</h1>
          <p className="text-sm text-[#3c4a3d] mt-2">Signed in as <strong>{googleProfile?.email}</strong></p>
          <p className="text-sm text-[#556067] mt-1">Enter your registered mobile to link your existing account, or we will create a new one.</p>
        </div>
        <form onSubmit={handleLinkPhone} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider mb-1">Mobile Number *</label>
            <div className="flex items-center border border-[#bbcbb9] rounded-xl overflow-hidden">
              <span className="px-3 py-3 bg-[#f2f4f7] text-sm text-[#556067]">+91</span>
              <input type="tel" value={linkPhone} onChange={e => setLinkPhone(e.target.value.replace(/\D/g, ''))}
                maxLength={10} placeholder="9876543210" required autoFocus
                className="flex-1 px-3 py-3 text-sm outline-none" />
            </div>
          </div>
          <button type="submit" disabled={googleLoading}
            className="w-full py-3 bg-[#25D366] text-[#005523] font-bold rounded-xl hover:brightness-105 disabled:opacity-50">
            {googleLoading ? 'Checking...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );

  // Complete Profile Screen
  if (showCompleteForm) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc] px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-[#bbcbb9] p-6">
        <div className="text-center mb-6">
          <img src={logo} alt="AapnaEstore" className="h-12 mx-auto mb-4" />
          <h1 className="font-semibold text-xl text-[#191c1e]">Complete Your Profile</h1>
          <p className="text-sm text-[#3c4a3d] mt-1">Signed in as {googleProfile?.email}</p>
        </div>
        <form onSubmit={handleCompleteRegistration} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider mb-1">Business Name *</label>
            <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Fashion House" required
              className="w-full border border-[#bbcbb9] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#006d2f]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider mb-1">Business Type *</label>
            <select value={businessType} onChange={e => setBusinessType(e.target.value)} required
              className="w-full border border-[#bbcbb9] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#006d2f]">
              <option value="">Select type</option>
              <option value="retail">Retail Store</option>
              <option value="restaurant">Restaurant / Food</option>
              <option value="fashion">Fashion / Clothing</option>
              <option value="grocery">Grocery</option>
              <option value="electronics">Electronics</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider mb-1">Mobile Number *</label>
            <div className="flex items-center border border-[#bbcbb9] rounded-xl overflow-hidden">
              <span className="px-3 py-3 bg-[#f2f4f7] text-sm text-[#556067]">+91</span>
              <input type="tel" value={businessPhone} onChange={e => setBusinessPhone(e.target.value.replace(/\D/g, ''))}
                maxLength={10} placeholder="9876543210" required
                className="flex-1 px-3 py-3 text-sm outline-none" />
            </div>
          </div>
          <button type="submit" disabled={googleLoading}
            className="w-full py-3 bg-[#25D366] text-[#005523] font-bold rounded-xl hover:brightness-105 disabled:opacity-50">
            {googleLoading ? 'Creating...' : 'Create My Store'}
          </button>
        </form>
      </div>
    </div>
  );

  // Main Login Screen
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#f7f9fc]">
      <div className="absolute inset-0 bg-chat-pattern pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#25D366]/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#67c9af]/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <TopAppBar />
      <main className="flex-grow flex items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-[#bbcbb9] p-6">
          <div className="w-full flex items-center justify-center py-4 mb-4">
            <img className="w-full max-w-[240px] h-auto object-contain" src={logo} alt="Aapna eStore" />
          </div>
          <div className="text-center mb-6">
            <h1 className="font-semibold text-2xl text-[#191c1e] mb-1">Login to your store manager</h1>
            <p className="text-sm text-[#3c4a3d]">Sign in to manage your store.</p>
          </div>

          {/* Google Sign-In — Primary */}
          <div id="google-signin-btn" className="w-full flex justify-center mb-4"></div>

          {/* Facebook Sign-In */}
          <button onClick={handleFacebookLogin} style={{ display: "none" }} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border border-[#1877f2] rounded-lg py-2 px-4 text-[#1877f2] font-semibold text-sm hover:bg-[#e7f0fd] transition-colors mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877f2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Continue with Facebook
          </button>

          {/* OTP — Secondary */}
          {showOtpForm && (
            <div className="mt-4 pt-4 border-t border-[#e0e3e6]">
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <Input label="Mobile Number" prefix="+91" placeholder="Enter mobile number"
                  maxLength={10} type="tel" inputMode="numeric" pattern="[0-9]*"
                  value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} required />
                {mobile.length === 10 && TEST_MOBILES.includes(mobile) && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider">Password</label>
                    <input type="password" value={testPassword} onChange={e => setTestPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full border border-[#bbcbb9] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#006d2f]" />
                  </div>
                )}
                <button type="submit" disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-[#005523] font-bold text-base rounded-xl hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50">
                  {loading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <>Get OTP <span className="material-symbols-outlined text-xl">arrow_forward</span></>}
                </button>
              </form>
            </div>
          )}

          <div className="text-center mt-4">
            <button type="button" onClick={() => setShowOtpForm(f => !f)}
              className="text-sm text-[#8e9eab] underline hover:text-[#556067]">
              {showOtpForm ? 'Hide mobile login' : 'Login with mobile number instead'}
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-[#bbcbb9] text-center">
            <p className="text-xs text-[#3c4a3d]">
              By continuing, you agree to our{' '}
              <a className="text-[#006d2f] font-semibold hover:underline" href="/profile/terms">Terms of Service</a>{' '}&amp;{' '}
              <a className="text-[#006d2f] font-semibold hover:underline" href="/profile/privacy">Privacy Policy</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
