import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopAppBar from '../Common/TopAppBar';
import BottomNav from '../Common/BottomNav';
import ProfileSection from './profile-sections/ProfileSection';
import AboutSection from './profile-sections/AboutSection';
import PrivacySection from './profile-sections/PrivacySection';
import RefundSection from './profile-sections/RefundSection';
import TermsSection from './profile-sections/TermsSection';
import PlatformSection from './profile-sections/PlatformSection';
import PricingSection from './profile-sections/PricingSection';

const NAV_ITEMS = [
  { key: 'profile',   label: 'Profile',          icon: 'person',          protected: true  },
  { key: 'about',     label: 'About AapnaEstore', icon: 'info',            protected: false },
  { key: 'privacy',   label: 'Privacy Policy',    icon: 'lock',            protected: false },
  { key: 'refund',    label: 'Refund Policy',     icon: 'currency_rupee',  protected: false },
  { key: 'terms',     label: 'Terms & Conditions',icon: 'description',     protected: false },
  { key: 'platform',  label: 'Platform Policy',   icon: 'policy',          protected: false },
  { key: 'pricing',   label: 'Pricing Plans',     icon: 'payments',        protected: false },
];

const SECTION_MAP = {
  profile:  <ProfileSection />,
  about:    <AboutSection />,
  privacy:  <PrivacySection />,
  refund:   <RefundSection />,
  terms:    <TermsSection />,
  platform: <PlatformSection />,
  pricing:  <PricingSection />,
};

const ProfilePage = () => {
  const { section } = useParams();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeKey = section || 'profile';

  const handleNav = (key) => {
    navigate(key === 'profile' ? '/profile' : `/profile/${key}`);
    setMobileMenuOpen(false);
  };

  const activeItem = NAV_ITEMS.find(i => i.key === activeKey) || NAV_ITEMS[0];

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <TopAppBar title="Profile" />

      <div className="max-w-6xl mx-auto pt-4 pb-24 lg:pb-4 px-0 lg:px-4">
        <div className="flex min-h-[calc(100vh-120px)]">

          {/* ── LEFT NAV — desktop always visible, mobile hidden unless open ── */}
          <aside className={`
            fixed lg:static inset-0 z-40 lg:z-auto
            flex flex-col
            w-64 lg:w-[22%] min-w-[200px] max-w-[260px]
            bg-white lg:bg-white
            border-r border-[#e0e3e6]
            transition-transform duration-300
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            lg:rounded-xl lg:shadow-sm
            overflow-y-auto
          `}>
            {/* Mobile close button */}
            <div className="flex items-center justify-between p-4 border-b border-[#e0e3e6] lg:hidden">
              <span className="font-bold text-[#191c1e]">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-[#f2f4f7]">
                <span className="material-symbols-outlined text-[#556067]">close</span>
              </button>
            </div>

            {/* Nav Items */}
            <nav className="p-2 flex-1">
              {NAV_ITEMS.map(item => {
                const isActive = activeKey === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleNav(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-left transition-all ${
                      isActive
                        ? 'bg-[#006d2f]/10 text-[#006d2f]'
                        : 'text-[#556067] hover:bg-[#f2f4f7] hover:text-[#191c1e]'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-base flex-shrink-0 ${isActive ? 'text-[#006d2f]' : 'text-[#556067]'}`}>
                      {item.icon}
                    </span>
                    <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <span className="ml-auto material-symbols-outlined text-sm text-[#006d2f]">chevron_right</span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Bottom branding */}
            <div className="p-4 border-t border-[#e0e3e6]">
              <p className="text-xs text-[#556067] text-center">AapnaEstore v1.0.0</p>
              <p className="text-xs text-[#556067] text-center">Nikhil Mathur HUF</p>
            </div>
          </aside>

          {/* Mobile overlay backdrop */}
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* ── RIGHT CONTENT ── */}
          <main className="flex-1 lg:ml-4 min-w-0">
            {/* Mobile header bar with hamburger */}
            <div className="flex items-center gap-3 p-4 bg-white border-b border-[#e0e3e6] lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] transition-colors"
              >
                <span className="material-symbols-outlined text-[#556067] text-base">menu</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006d2f] text-base">{activeItem.icon}</span>
                <span className="font-semibold text-[#191c1e] text-sm">{activeItem.label}</span>
              </div>
            </div>

            {/* Content area */}
            <div className="bg-white lg:rounded-xl lg:shadow-sm min-h-full overflow-y-auto">
              {SECTION_MAP[activeKey] || SECTION_MAP.profile}
            </div>
          </main>

        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
