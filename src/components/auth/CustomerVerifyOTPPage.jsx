import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TopAppBar from '../Common/TopAppBar';
import Button from '../Common/Button';

const CustomerVerifyOTPPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mobile = location.state?.mobile || '9876543210';
  
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
    setError('');

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
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate('/customer/dashboard');
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setTimeLeft(30);
    setCanResend(false);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f2f5]">
      <TopAppBar title="Verify OTP" showBack={true} />

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white rounded-xl w-full max-w-[440px] p-8 shadow-md border border-[#E9EDEF]">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 bg-[#25D366]/10 rounded-full flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[#006d2f] text-3xl filled">verified_user</span>
            </div>
            <h2 className="text-2xl font-semibold text-[#191c1e]">Enter OTP</h2>
            <p className="text-sm text-[#3c4a3d]">
              Please enter the 6-digit code sent to{' '}
              <span className="font-bold text-[#191c1e]">+91 {mobile}</span>
            </p>
          </div>

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
                  className="w-12 h-14 text-center text-2xl font-semibold border border-[#bbcbb9] rounded-lg focus:outline-none focus:border-[#006d2f] focus:ring-2 focus:ring-[#25D366]/20 transition-all"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <div className="flex justify-center items-center gap-2">
              <span className="text-sm text-[#3c4a3d]">
                Resend in <span className="font-bold">{timeLeft}s</span>
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

            <button
              onClick={() => navigate('/customer/login')}
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

export default CustomerVerifyOTPPage;