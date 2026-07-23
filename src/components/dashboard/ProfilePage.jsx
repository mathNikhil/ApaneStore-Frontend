import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../Common/TopAppBar';
import BottomNav from '../Common/BottomNav';
import { useAuth } from '../../Context/AuthContext';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
    // Full reload on the way out so every context (auth + store builder)
    // resets cleanly — important if a different tenant logs in next.
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] pb-24">
      <TopAppBar title="Profile" />

      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        {/* Profile Header Card - Matching your HTML */}
        <section className="bg-white p-6 rounded-xl border border-[#E9EDEF] shadow-[0_4px_4px_rgba(0,0,0,0.02)] flex items-center justify-between hover-lift">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                className="w-20 h-20 rounded-full object-cover border-2 border-[#25D366]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9Cw26q0GqCGY20n-St7-09KIOZcpayczVg9QpjpvIXWSJVoIg-XDFZWszPWwo3QRzQFYsrNEIry6V2_DUQEZdGAp1XDiSlno_mbl4XXVsCEsM9eo9VO3kyw4-s2f0clXaxnzEsWDGKi5TVbWu0CbOMCUyP7bCkWdLAB1TqmOWgJRI9FVpFivi7lEwK8lFj7bzOJ-BKJVzqblC_q6OKvZSNeqzFa9KGQPTmJZbreIWZJMHGQX9msGrFgY0mg6oZFvr0X73cpBFvZo"
                alt="Amit Sharma"
              />
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#006d2f] rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#191c1e]">Amit Sharma</h2>
              <p className="text-[#556067] text-sm">amit@organicflour.com</p>
              <p className="text-[#556067] text-sm font-medium">+91 98765 43210</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#eceef1] text-[#006d2f] font-bold text-sm hover:bg-[#d9e4ec] active:scale-[0.98] transition-all">
  <span className="material-symbols-outlined text-lg">edit</span>
  Edit
</button>
        </section>

        {/* Information Sections Grid - Matching your HTML */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Support Details */}
          <section className="bg-white p-5 rounded-xl border border-[#E9EDEF] shadow-[0_4px_4px_rgba(0,0,0,0.02)] space-y-4 hover-lift">
            <div className="flex items-center gap-2 border-b border-[#eceef1] pb-2">
              <span className="material-symbols-outlined text-[#006d2f] filled">contact_support</span>
              <h3 className="font-bold text-[#191c1e]">Support Details</h3>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-[#6c7b6b] font-bold">Phone</span>
                <span className="text-[#191c1e] font-medium text-sm">+91 800 555 0199</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-[#6c7b6b] font-bold">Email</span>
                <span className="text-[#191c1e] font-medium text-sm">support@organicflour.com</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-[#6c7b6b] font-bold">Business Hours</span>
                <span className="text-[#191c1e] font-medium text-sm">09:00 AM - 08:00 PM</span>
              </div>
            </div>
          </section>

          {/* Social Links */}
          <section className="bg-white p-5 rounded-xl border border-[#E9EDEF] shadow-[0_4px_4px_rgba(0,0,0,0.02)] space-y-4 hover-lift">
            <div className="flex items-center gap-2 border-b border-[#eceef1] pb-2">
              <span className="material-symbols-outlined text-[#006d2f] filled">share</span>
              <h3 className="font-bold text-[#191c1e]">Social Presence</h3>
            </div>
            <div className="flex items-center justify-center gap-6 py-2">
              <a href="#" className="w-12 h-12 flex items-center justify-center rounded-full bg-[#f2f4f7] hover:bg-[#d9e4ec] transition-all active:scale-95 border border-[#bbcbb9]/30 shadow-sm" aria-label="Facebook">
                <svg className="w-6 h-6" fill="#1877F2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                </svg>
              </a>
              <a href="#" className="w-12 h-12 flex items-center justify-center rounded-full bg-[#f2f4f7] hover:bg-[#d9e4ec] transition-all active:scale-95 border border-[#bbcbb9]/30 shadow-sm" aria-label="Instagram">
                <svg className="w-6 h-6" fill="#E4405F" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                </svg>
              </a>
            </div>
          </section>

          {/* Public Feedback - Matching your HTML */}
          <section className="bg-white p-5 rounded-xl border border-[#E9EDEF] shadow-[0_4px_4px_rgba(0,0,0,0.02)] space-y-4 md:col-span-2 hover-lift">
            <div className="flex items-center gap-2 border-b border-[#eceef1] pb-2">
              <span className="material-symbols-outlined text-[#006d2f] filled">reviews</span>
              <h3 className="font-bold text-[#191c1e]">Public Feedback</h3>
            </div>
            <div className="flex flex-wrap gap-4">
              {/* Facebook Reviews */}
              <div className="flex-1 min-w-[140px] bg-[#25D366]/10 p-4 rounded-xl border border-[#25D366]/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-[#006d2f] uppercase">Facebook</span>
                  <span className="material-symbols-outlined text-[#006d2f] text-sm">thumb_up</span>
                </div>
                <div className="text-2xl font-bold text-[#005523]">4.8<span className="text-xs font-normal text-[#556067] ml-1">/ 5</span></div>
                <p className="text-[10px] text-[#556067]">Based on 128 reviews</p>
              </div>
              {/* Instagram Feedback */}
              <div className="flex-1 min-w-[140px] bg-[#d9e4ec] p-4 rounded-xl border border-[#bbcbb9]/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-[#556067] uppercase">Instagram</span>
                  <span className="material-symbols-outlined text-[#556067] text-sm">chat_bubble</span>
                </div>
                <div className="text-2xl font-bold text-[#5b666d]">92%</div>
                <p className="text-[10px] text-[#556067]">Positive sentiment rate</p>
              </div>
            </div>
          </section>
        </div>

        {/* Sign Out Button - Matching your HTML */}
        <div className="pt-8 pb-12">
          <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-[#ba1a1a]/20 text-[#ba1a1a] font-bold hover:bg-[#ffdad6]/50 active:scale-[0.98] transition-all">
  <span className="material-symbols-outlined">logout</span>
  Sign Out
</button>
          <p className="text-center text-[#6c7b6b] text-[11px] mt-6">App Version 2.4.0 • Apna eStore Merchant Pro</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;