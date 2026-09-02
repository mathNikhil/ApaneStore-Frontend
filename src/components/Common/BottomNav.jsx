import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const BottomNav = ({ items = [] }) => {
  const location = useLocation();
  
  const defaultItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/market', icon: 'campaign', label: 'Market' },
    { path: '/profile', icon: 'person', label: 'Profile' },
  ];

  const navItems = items.length > 0 ? items : defaultItems;

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center bg-white/90 backdrop-blur-md border-t border-[#bbcbb9] shadow-lg py-2 px-4 z-50">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={`
              flex flex-col items-center justify-center px-4 py-1 rounded-xl
              transition-all duration-300
              ${isActive 
                ? 'bg-[#25D366]/30 text-[#006d2f]' 
                : 'text-[#556067] hover:bg-[#eceef1]'
              }
            `}
          >
            <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}>
              {item.icon}
            </span>
            <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;