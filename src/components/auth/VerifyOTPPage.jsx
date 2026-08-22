import { showSuccess, showError } from '../../utils/toast';
import logo from '../../assets/images/Apnaestore-Logo.png';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TopAppBar from '../Common/TopAppBar';
import Button from '../Common/Button';
import { useAuth } from '../../Context/AuthContext';

const VerifyOTPPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithOTP, sendOTP } = useAuth();
  const mobile = location.state?.mobile || '9876543210';
  // Backend has no real SMS gateway wired up yet — it returns the OTP directly
  // in dev mode so testing isn't blocked. Shown as a visible hint only then.
  const [devOtp, setDevOtp] = useState(location.state?.devOtp || null);
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleInputChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const digits = paste.replace(/\D/g, '').slice(0, 6).split('');
    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });
    setOtp(newOtp);
    if (digits.length > 0) {
      const focusIndex = Math.min(digits.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      showError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithOTP(mobile, otpString, 'login');
      if (!result.success) {
        setError(result.error || 'Invalid OTP. Please try again.');
        setLoading(false);
        return;
      }
      // Check if new tenant (no business name yet)
      const tenantUser = result.data?.tenant;
      const name = tenantUser?.company_name || tenantUser?.business_name || '';
      const isFakeName = !name || /^User \d+$/.test(name);
      if (isFakeName) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      showError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setTimeLeft(30);
    setCanResend(false);
    setDevOtp(null);
    const result = await sendOTP(mobile, 'login');
    if (result.success) {
      setDevOtp(result.data?.test_otp || null);
    } else {
      setError(result.error || 'Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f2f5]">
      <TopAppBar showBack />

      <main className="flex-grow flex items-center justify-center p-4">
        {/* Verification Card - Matching your HTML */}
        <div className="bg-white rounded-xl w-full max-w-[440px] p-8 shadow-md border border-[#E9EDEF] animate-in slide-in-from-bottom-4">
          {/* Icon & Title - Matching your HTML */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="mb-2">
              <img src={logo} alt="Apna eStore" className="h-12" />
            </div>
            <h2 className="text-2xl font-semibold text-[#191c1e]">Enter OTP</h2>
            <p className="text-sm text-[#3c4a3d]">
              Please enter the 6-digit code sent to{' '}
              <span className="font-bold text-[#191c1e]">+91 {mobile}</span>
            </p>
            {devOtp && (
              <p className="text-xs text-[#006d2f] bg-[#25D366]/10 rounded-lg px-3 py-1.5 mt-1">
                Dev mode — no SMS gateway configured yet. Your OTP is <span className="font-bold">{devOtp}</span>
              </p>
            )}
          </div>

          {/* OTP Input Section - Matching your HTML */}
          <div className="flex flex-col gap-6 mt-8">
            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => inputRefs.current[index] = el}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="otp-input"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Timer & Resend - Matching your HTML */}
            <div className="flex justify-center items-center gap-2">
              <span className="text-sm text-[#3c4a3d]">
                Resend in <span className="font-bold" id="timer-count">{timeLeft}s</span>
              </span>
              <button
                onClick={handleResend}
                disabled={!canResend}
                className={`text-sm font-semibold ${
                  canResend 
                    ? 'text-[#006d2f] hover:underline cursor-pointer' 
                    : 'text-gray-400 cursor-not-allowed opacity-50'
                }`}
              >
                Resend OTP
              </button>
            </div>

            {error && <p className="text-[#ba1a1a] text-sm text-center">{error}</p>}

            {/* Action Button - Matching your HTML */}
            <button 
  type="button" 
  onClick={handleVerify} 
  disabled={loading}
  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-[#005523] font-bold text-base rounded-xl hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
>
  {loading ? (
    <span className="material-symbols-outlined animate-spin">progress_activity</span>
  ) : (
    <>
      Verify &amp; Login
      <span className="material-symbols-outlined text-xl">arrow_forward</span>
    </>
  )}
</button>

            {/* Change Login ID - Matching your HTML */}
            <button
              onClick={() => navigate('/')}
              className="text-sm text-[#3c4a3d] hover:text-[#006d2f] transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              Change Login ID/Phone
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyOTPPage;