import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../Common/TopAppBar';
import Button from '../Common/Button';
import Input from '../Common/Input';
import { useAuth } from '../../Context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { sendOTP } = useAuth();
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await sendOTP(mobile, 'login');
      if (!result.success) {
        setError(result.error || 'Failed to send OTP');
        setLoading(false);
        return;
      }
      navigate('/verify-otp', { state: { mobile, devOtp: result.data?.test_otp } });
    } catch (err) {
      setError('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

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
          {/* Hero Image - Matching your HTML */}
          <div className="w-full aspect-video rounded-lg overflow-hidden mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <img 
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC06pgTIGDLcuB9wSzu15Wc4giZmFyM6ZQbB1vhhYki-lI37q3l3s0N69hlWw8l0QJKVCQSSOQRRotcG9YQOXpnG9aCdekWfLIxKgmd3nTkz6xQ2Fjb822XpDyd5cnhdXA48EeGonRR_KrmfHWN-WoVIeELG4RQsrlHg000gt3ArQiTwMmD5oz40Fpj4HDS3YwJp6VHwouSGaCebRYVIPwfq6SqIxQCDu98GUonZynFzhu3s44zLcSfmucAwXKAR7HVXa5JYucLDWE"
              alt="Store manager workspace"
            />
            <div className="absolute bottom-4 left-4">
              <span className="text-white font-semibold text-2xl drop-shadow-md">
                Welcome back
              </span>
            </div>
          </div>

          {/* Login Header - Matching your HTML */}
          <div className="text-center mb-8">
            <h1 className="font-semibold text-2xl text-[#191c1e] mb-1">
              Login to your store manager
            </h1>
            <p className="text-sm text-[#3c4a3d]">
              Enter your mobile number to receive a 6-digit verification code.
            </p>
          </div>

          {/* Form - Matching your HTML */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Mobile Number"
              prefix="+91"
              placeholder="Enter mobile number"
              maxLength={10}
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
              error={error}
              required
            />

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

          {/* Footer - Matching your HTML */}
          <div className="mt-6 pt-6 border-t border-[#bbcbb9] text-center">
            <p className="text-xs text-[#3c4a3d]">
              By continuing, you agree to our{' '}
              <a className="text-[#006d2f] font-semibold hover:underline" href="#">
                Terms of Service
              </a>{' '}
              &amp;{' '}
              <a className="text-[#006d2f] font-semibold hover:underline" href="#">
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