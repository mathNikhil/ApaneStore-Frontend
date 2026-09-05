import React, { useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import TopAppBar from '../Common/TopAppBar';
import BottomNav from '../Common/BottomNav';
import ProfileSection from './profile-sections/ProfileSection';
import AboutSection from './profile-sections/AboutSection';
import PrivacySection from './profile-sections/PrivacySection';
import RefundSection from './profile-sections/RefundSection';
import TermsSection from './profile-sections/TermsSection';
import PlatformSection from './profile-sections/PlatformSection';
import PricingSection from './profile-sections/PricingSection';
import InvoiceList from './Invoice/InvoiceList';
import WAInvoiceList from './Invoice/WAInvoiceList';
import ReferSection from './profile-sections/ReferSection';

const NAV_ITEMS = [
  { key: 'about',     label: 'About AapnaEstore', icon: 'info'           },
  { key: 'privacy',   label: 'Privacy Policy',    icon: 'lock'           },
  { key: 'refund',    label: 'Refund Policy',     icon: 'currency_rupee' },
  { key: 'terms',     label: 'Terms & Conditions',icon: 'description'    },
  { key: 'platform',  label: 'Platform Policy',   icon: 'policy'         },
  { key: 'pricing',   label: 'Pricing Plans',     icon: 'payments'       },
];

const getSectionComponent = (key) => {
  switch(key) {
    case 'profile':  return <ProfileSection />;
    case 'about':    return <AboutSection />;
    case 'privacy':  return <PrivacySection />;
    case 'refund':   return <RefundSection />;
    case 'terms':    return <TermsSection />;
    case 'platform': return <PlatformSection />;
    case 'pricing':  return <PricingSection />;
    case 'invoices': return <InvoiceList />;
    case 'wa-invoices': return <WAInvoiceList />;
    case 'refer':    return <ReferSection />;
    default:         return <AboutSection />;
  }
};

const ContactSupportLink = () => {
  const [href, setHref] = React.useState('mailto:aapnaestore@gmail.com?subject=Support Request - AapnaEstore');

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const API = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';
    fetch(`${API}/api/tenants/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const p = d.data;
          const bodyText = [
            'Hi AapnaEstore Team,',
            '',
            'Tenant Details:',
            'Name: ' + (p.company_name || 'N/A'),
            'Phone: +91 ' + (p.phone || 'N/A'),
            'Email: ' + (p.email || 'N/A'),
            'Tenant ID: ' + (p.id || 'N/A'),
            '',
            'Issue Description:',
            '[Please describe your issue here]',
            '',
            'Thank you'
          ].join('\n');
          const encodedBody = encodeURIComponent(bodyText);
          const encodedSubject = encodeURIComponent('Support Request - AapnaEstore');
          const gmailUrl = 'https://mail.google.com/mail/?view=cm&to=aapnaestore@gmail.com&su=' + encodedSubject + '&body=' + encodedBody;
          setHref(gmailUrl);
        }
      }).catch(() => {});
  }, []);

  const handleClick = () => {
    window.open(href, '_blank');
  };

  return (
    <button onClick={handleClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-left transition-all text-[#556067] hover:bg-[#f2f4f7]"
    >
      <span className="material-symbols-outlined text-base flex-shrink-0 text-[#556067]">support_agent</span>
      <span className="text-sm font-medium">Contact Support</span>
    </button>
  );
};

const ProfilePage = () => {
  const { section } = useParams();
  const { token } = useAuth();
  const isLoggedIn = !!token;
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Derive activeKey from URL — works for both /profile and /profile/:section
  const pathSection = location.pathname.split('/profile/')[1] || null;
  const activeKey = pathSection || section || (isLoggedIn ? 'profile' : 'about');

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
            <nav className="p-2">
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

            {/* Bottom — Invoices + Profile or Login */}
            <div className="p-3">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => handleNav('invoices')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-left transition-all ${activeKey === 'invoices' ? 'bg-[#006d2f]/10 text-[#006d2f]' : 'text-[#556067] hover:bg-[#f2f4f7]'}`}
                  >
                    <span className={`material-symbols-outlined text-base flex-shrink-0 ${activeKey === 'invoices' ? 'text-[#006d2f]' : 'text-[#556067]'}`}>receipt_long</span>
                    <span className={`text-sm ${activeKey === 'invoices' ? 'font-bold' : 'font-medium'}`}>My Invoices</span>
                    {activeKey === 'invoices' && <span className="ml-auto material-symbols-outlined text-sm text-[#006d2f]">chevron_right</span>}
                  </button>
                  <button
                    onClick={() => handleNav('wa-invoices')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-left transition-all ${activeKey === 'wa-invoices' ? 'bg-[#006d2f]/10 text-[#006d2f]' : 'text-[#556067] hover:bg-[#f2f4f7]'}`}
                  >
                    <span className={`material-symbols-outlined text-base flex-shrink-0 ${activeKey === 'wa-invoices' ? 'text-[#006d2f]' : 'text-[#556067]'}`}>campaign</span>
                    <span className={`text-sm ${activeKey === 'wa-invoices' ? 'font-bold' : 'font-medium'}`}>WhatsApp Market</span>
                    {activeKey === 'wa-invoices' && <span className="ml-auto material-symbols-outlined text-sm text-[#006d2f]">chevron_right</span>}
                  </button>
                  <button
                    onClick={() => handleNav('refer')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-left transition-all ${activeKey === 'refer' ? 'bg-[#006d2f]/10 text-[#006d2f]' : 'text-[#556067] hover:bg-[#f2f4f7]'}`}
                  >
                    <span className={`material-symbols-outlined text-base flex-shrink-0 ${activeKey === 'refer' ? 'text-[#006d2f]' : 'text-[#556067]'}`}>share</span>
                    <span className={`text-sm ${activeKey === 'refer' ? 'font-bold' : 'font-medium'}`}>Refer & Earn</span>
                    {activeKey === 'refer' && <span className="ml-auto material-symbols-outlined text-sm text-[#006d2f]">chevron_right</span>}
                  </button>
                  <button
                    onClick={() => handleNav('profile')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${activeKey === 'profile' ? 'bg-[#006d2f]/10 text-[#006d2f]' : 'text-[#556067] hover:bg-[#f2f4f7]'}`}
                  >
                    <span className={`material-symbols-outlined text-base flex-shrink-0 ${activeKey === 'profile' ? 'text-[#006d2f]' : 'text-[#556067]'}`}>person</span>
                    <span className={`text-sm ${activeKey === 'profile' ? 'font-bold' : 'font-medium'}`}>Profile</span>
                    {activeKey === 'profile' && <span className="ml-auto material-symbols-outlined text-sm text-[#006d2f]">chevron_right</span>}
                  </button>
                  <ContactSupportLink />
                </>
              ) : (
                <a href="/"
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#006d2f] text-white font-semibold text-sm hover:brightness-110 transition-all"
                >
                  <span className="material-symbols-outlined text-base">login</span>
                  Login / Sign Up
                </a>
              )}
              <p className="text-xs text-[#556067] text-center mt-2">AapnaEstore v1.0.0</p>
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
              {getSectionComponent(activeKey)}
            </div>
          </main>

        </div>
      </div>

      {isLoggedIn && <BottomNav />}
    </div>
  );
};

export default ProfilePage;
