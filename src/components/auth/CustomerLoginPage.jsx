import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../Common/TopAppBar';
import Button from '../Common/Button';
import Input from '../Common/Input';

const CustomerLoginPage = () => {
  const navigate = useNavigate();
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate('/customer/verify-otp', { state: { mobile } });
    } catch (err) {
      setError('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#f7f9fc]">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-chat-pattern pointer-events-none" />
      
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#25D366]/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#67c9af]/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <TopAppBar title="Customer Login" showBack={true} />

      <main className="flex-grow flex items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-[#bbcbb9] p-6">
          {/* Welcome Image */}
          <div className="w-full aspect-video rounded-lg overflow-hidden mb-6 relative bg-gradient-to-r from-green-100 to-teal-100 flex items-center justify-center">
            <div className="text-center">
              <span className="text-4xl">🛒</span>
              <p className="text-sm text-gray-600 mt-1">Welcome to the Store</p>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Customer Login</h1>
            <p className="text-gray-500 text-sm">Enter your mobile number to receive OTP</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Mobile Number"
              prefix="+91"
              placeholder="9876543210"
              maxLength={10}
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
              error={error}
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

          <div className="mt-6 pt-6 border-t border-[#bbcbb9] text-center">
            <p className="text-xs text-[#3c4a3d]">
              By continuing, you agree to our{' '}
              <a className="text-[#006d2f] font-semibold hover:underline" href="#">
                Terms of Service
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerLoginPage;