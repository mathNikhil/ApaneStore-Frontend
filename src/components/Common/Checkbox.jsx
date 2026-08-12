import React from 'react';

const Checkbox = ({
  checked = false,
  onChange,
  label,
  className = '',
  disabled = false,
  id,
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <label
      htmlFor={checkboxId}
      className={`flex items-center gap-3 py-2.5 cursor-pointer group ${className}`}
    >
      <div className="relative flex-shrink-0">
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className={`
          w-5 h-5 rounded border-2 transition-all duration-200
          flex items-center justify-center
          ${checked 
            ? 'bg-[#006d2f] border-[#006d2f]' 
            : 'bg-white border-[#bbcbb9] group-hover:border-[#006d2f]'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          peer-focus:ring-2 peer-focus:ring-[#006d2f]/30
        `}>
          {checked && (
            <svg 
              className="w-3.5 h-3.5 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="3" 
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>
      {label && (
        <span className="font-body-md text-[#191c1e] group-hover:text-[#006d2f] transition-colors">
          {label}
        </span>
      )}
    </label>
  );
};

export default Checkbox;