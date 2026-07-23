import React from 'react';
import { useNavigate } from 'react-router-dom';

const TopAppBar = ({ 
  title = 'Apna eStore', 
  showBack = false,
  showProfile = true,
  className = '',
}) => {
  const navigate = useNavigate();

  return (
    <header className={`
      w-full sticky top-0 bg-white z-50 border-b border-[#bbcbb9] shadow-sm
      flex items-center justify-between px-4 py-3
      ${className}
    `}>
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded-full hover:bg-[#eceef1] transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
        <span className="material-symbols-outlined text-[#006d2f] text-2xl">storefront</span>
        <h1 className="text-2xl font-bold text-[#006d2f]">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {showProfile && (
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#25D366]">
            <img 
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7MHuiEnvSV9ofdmHdGQiEfY00ADLvr6EPGGqy6rq1A4Db22wUClUQ6o6aee3gZ9btKCMCZn4mxmZzeTlSjUnNvKI0rELLkEUh9GhFU-iKl6HP_ViSMDRDn-MA6vC1v_vag0lssbc8daoNHeCKTIof7j-j0EoF5UrVMhKlls4iMwSIrS6_B995fbcZhxktcOhgZcLNratCt9boZGvbspUj7RqHXfRuvJjuFBEWCZcUfEwsRXQgw37XMUD6wjbf6paM1FZ7S01GtHU"
              alt="Profile"
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default TopAppBar;