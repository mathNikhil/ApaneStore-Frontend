import React from 'react';

const Toggle = ({
  checked = false,
  onChange,
  label,
  description,
  className = '',
  disabled = false,
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex-1">
        {label && (
          <span className="font-body-md text-on-surface font-medium block">
            {label}
          </span>
        )}
        {description && (
          <span className="font-caption text-secondary text-xs block mt-0.5">
            {description}
          </span>
        )}
      </div>
      <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className={`
          w-11 h-6 rounded-full transition-all duration-200 ease-in-out
          ${checked 
            ? 'bg-[#006d2f]' 
            : 'bg-[#e0e3e6]'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          peer-focus:ring-2 peer-focus:ring-[#25D366]/50
          relative
        `}>
          <div className={`
            absolute top-[2px] left-[2px] 
            bg-white 
            w-5 h-5 
            rounded-full 
            transition-all duration-200 ease-in-out
            border border-gray-300
            ${checked ? 'translate-x-5' : 'translate-x-0'}
            shadow-sm
          `} />
        </div>
      </label>
    </div>
  );
};

export default Toggle;