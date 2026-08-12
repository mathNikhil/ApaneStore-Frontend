import React from 'react';

const PreviewNav = ({ activeTab, onChange, brandColors }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'cart', label: 'Cart', icon: 'shopping_cart' },
    { id: 'orders', label: 'Orders', icon: 'receipt_long' },
    { id: 'profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <nav className="border-b" style={{ borderColor: brandColors.secondary || '#e0e3e6' }}>
      <div className="flex px-4 max-w-7xl mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all font-medium text-sm ${
              activeTab === tab.id
                ? 'border-current'
                : 'border-transparent hover:text-[#191c1e]'
            }`}
            style={{
              color: activeTab === tab.id ? brandColors.primary : brandColors.secondary || '#556067',
              borderColor: activeTab === tab.id ? brandColors.primary : 'transparent',
            }}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default PreviewNav;