import { showSuccess, showError } from '../../utils/toast';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../Common/TopAppBar';
import Button from '../Common/Button';
import Input from '../Common/Input';
import { useAuth } from '../../Context/AuthContext';
import logo from '../../assets/images/Apnaestore-Logo.png';

const getDeviceFingerprint = () => {
  const raw = [
    navigator.userAgent,
    screen.width + 'x' + screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
  ].join('|');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  return String(Math.abs(hash));
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { sendOTP, markSessionVerified } = useAuth();
  const TEST_MOBILES = (import.meta.env.VITE_TEST_MOBILES || '').split(',').map(m => m.trim());
  const TEST_PASSWORD = import.meta.env.VITE_TEST_PASSWORD || '';

  const [mobile, setMobile] = useState('');
  const [testPassword, setTestPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [showLinkPhone, setShowLinkPhone] = useState(false);
  const [linkPhone, setLinkPhone] = useState('');
  const [googleProfile, setGoogleProfile] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');

  const API = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';

  const handleGoogleLogin = async (credential) => {
    setGoogleLoading(true);
    try {
      const res = await fetch(API + '/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });
      const data = await res.json();
      if (data.success && !data.isNewTenant) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.tenant));
        localStorage.setItem('loginTime', Date.now().toString());
        navigate('/dashboard');
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

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    if (!companyName || !businessType) { showError('Please fill all required fields'); return; }
    setGoogleLoading(true);
    try {
      const res = await fetch(API + '/api/auth/google/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleId: googleProfile.googleId,
          email: googleProfile.email,
          name: googleProfile.name,
          company_name: companyName,
          business_type: businessType,
          phone: businessPhone
        })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.tenant));
        localStorage.setItem('loginTime', Date.now().toString());
        navigate('/dashboard');
      } else {
        showError(data.error || 'Registration failed');
      }
    } catch(e) { showError('Registration failed'); }
    setGoogleLoading(false);
  };

  const handleLinkPhone = async (e) => {
    e.preventDefault();
    if (linkPhone.length !== 10) { showError("Enter valid 10-digit mobile number"); return; }
    setGoogleLoading(true);
    try {
      const res = await fetch(API + "/api/auth/google/link-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googleId: googleProfile.googleId, email: googleProfile.email, name: googleProfile.name, phone: linkPhone })
      });
      const data = await res.json();
      if (data.success && data.linked) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.tenant));
        navigate("/dashboard");
      } else if (data.success && !data.linked) {
        setShowLinkPhone(false);
        setBusinessPhone(linkPhone);
        setShowCompleteForm(true);
      } else {
        showError(data.error || "Failed to link account");
      }
    } catch(e2) { showError("Failed to link account"); }
    setGoogleLoading(false);
  };

  React.useEffect(() => {
    const initGoogle = () => {
      if (window.google) {
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
      const script = document.querySelector('script[src*="accounts.google.com"]');
      if (script) script.addEventListener('load', initGoogle);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mobile.length !== 10) {
      showError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    try {
      // Test mobile — validate password then send OTP and auto-fill
      if (TEST_MOBILES.includes(mobile)) {
        if (!testPassword) { showError('Please enter your password'); setLoading(false); return; }
        if (testPassword !== TEST_PASSWORD) { showError('Invalid password'); setLoading(false); return; }
        // Send OTP then navigate with auto-fill
        await sendOTP(mobile, 'login');
        navigate('/verify-otp', { state: { mobile, devOtp: '201807' } });
        setLoading(false);
        return;
      }

      // Check if same device + same mobile + within 12 hours → skip OTP
      const savedToken = localStorage.getItem('token');
      // Save mobile immediately so it persists for future checks
      localStorage.setItem('savedMobile', mobile);
      const savedMobile = mobile; // use current mobile as reference
      const loginTime = localStorage.getItem('loginTime');
      const savedFingerprint = localStorage.getItem('deviceFingerprint');
      const currentFingerprint = getDeviceFingerprint();
      const twelveHours = 12 * 60 * 60 * 1000;

      if (
        savedToken &&
        savedFingerprint === currentFingerprint &&
        loginTime &&
        Date.now() - parseInt(loginTime) < twelveHours &&
        (savedMobile === mobile || savedMobile === null)
      ) {
        // Same device, within 12 hours, correct mobile — skip OTP
        // Save mobile for future checks
        localStorage.setItem('savedMobile', mobile);
        markSessionVerified();
        showSuccess('Welcome back! Logging you in...');
        navigate('/dashboard', { replace: true });
        setLoading(false);
        return;
      }

      // Different device/mobile or expired — send OTP
      const result = await sendOTP(mobile, 'login');
      if (!result.success) {
        setError(result.error || 'Failed to send OTP');
        setLoading(false);
        return;
      }
      navigate('/verify-otp', { state: { mobile, devOtp: result.data?.test_otp } });
    } catch (err) {
      showError('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  if (showLinkPhone) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc] px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-[#bbcbb9] p-6">
        <div className="text-center mb-6">
          <h1 className="font-semibold text-xl text-[#191c1e]">Enter Your Mobile Number</h1>
          <p className="text-sm text-[#3c4a3d] mt-2">Signed in as <strong>{googleProfile?.email}</strong></p>
          <p className="text-sm text-[#556067] mt-1">Enter your registered mobile to link your existing account.</p>
        </div>
        <form onSubmit={handleLinkPhone} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider mb-1">Mobile Number *</label>
            <div className="flex items-center border border-[#bbcbb9] rounded-xl overflow-hidden">
              <span className="px-3 py-3 bg-[#f2f4f7] text-sm text-[#556067]">+91</span>
              <input type="tel" value={linkPhone} onChange={e => setLinkPhone(e.target.value.replace(/\D/g, ""))}
                maxLength={10} placeholder="9876543210" required
                className="flex-1 px-3 py-3 text-sm outline-none" autoFocus />
            </div>
          </div>
          <button type="submit" disabled={googleLoading}
            className="w-full py-3 bg-[#25D366] text-[#005523] font-bold rounded-xl hover:brightness-105 disabled:opacity-50">
            {googleLoading ? "Checking..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );

  if (showCompleteForm) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc] px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-[#bbcbb9] p-6">
        <div className="text-center mb-6">
          <h1 className="font-semibold text-xl text-[#191c1e]">Complete Your Profile</h1>
          <p className="text-sm text-[#3c4a3d] mt-1">Signed in as {googleProfile?.email}</p>
        </div>
        <form onSubmit={handleCompleteRegistration} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider mb-1">Business Name *</label>
            <input value={companyName} onChange={e => setCompanyName(e.target.value)}
              placeholder="e.g. Fashion House" required
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

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#f7f9fc]">
      {/* Background Pattern - Matching your HTML */}
      <div className="absolute inset-0 bg-chat-pattern pointer-events-none" />
      
      {/* Animated Background Ornaments - Matching your HTML */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#25D366]/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#67c9af]/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <TopAppBar />

      <main className="flex-grow flex items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-[#bbcbb9] p-6">
          {/* Brand Logo — replaces the old stock hero photo */}
          <div className="w-full flex items-center justify-center py-6 mb-6">
            <img
              className="w-full max-w-[280px] h-auto object-contain"
              src={logo}
              alt="Aapna eStore"
            />
          </div>

          {/* Login Header - Matching your HTML */}
          <div className="text-center mb-8">
            <h1 className="font-semibold text-2xl text-[#191c1e] mb-1">
              Login to your store manager
            </h1>
            <p className="text-sm text-[#3c4a3d]">
              Sign in to manage your store.
            </p>
          </div>

          {/* Google first */}
          <div id="google-signin-btn" className="w-full flex justify-center mb-4"></div>

          {/* OTP secondary */}
          {showOtpForm ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Mobile Number"
              prefix="+91"
              placeholder="Enter mobile number"
              maxLength={10}
              type="tel" inputMode="numeric" pattern="[0-9]*"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
              error={error}
              required
            />

            {mobile.length === 10 && TEST_MOBILES.includes(mobile) && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={testPassword}
                  onChange={e => setTestPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full border border-[#bbcbb9] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#006d2f]"
                />
              </div>
            )}

            <button 
  type="submit" 
  disabled={loading}
  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-[#005523] font-bold text-base rounded-xl hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
>
  {loading ? (
    <span className="material-symbols-outlined animate-spin">progress_activity</span>
  ) : (
    <>
      Get OTP
      <span className="material-symbols-outlined text-xl">arrow_forward</span>
    </>
  )}
</button>
          </form>

          <div className="mt-4">
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-[#e0e3e6]" />
              <span className="text-xs text-[#8e9eab]">or continue with</span>
              <div className="flex-1 h-px bg-[#e0e3e6]" />
            </div>
            <div id="google-signin-btn" className="w-full flex justify-center"></div>
          </div>

          {/* Footer - Matching your HTML */}
          <div className="mt-6 pt-6 border-t border-[#bbcbb9] text-center">
            <p className="text-xs text-[#3c4a3d]">
              By continuing, you agree to our{' '}
              <a className="text-[#006d2f] font-semibold hover:underline" href="/profile/terms">
                Terms of Service
              </a>{' '}
              &amp;{' '}
              <a className="text-[#006d2f] font-semibold hover:underline" href="/profile/privacy">
                Privacy Policy
              </a>
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <button className="flex items-center gap-1 text-sm text-[#5b666d] hover:text-[#006d2f] transition-colors">
                <span className="material-symbols-outlined text-lg">help</span>
                Need Help?
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;