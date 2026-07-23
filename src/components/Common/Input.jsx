import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  prefix,
  className = '',
  inputClassName = '',
  required = false,
  ...props
}, ref) => {
  const baseStyles = 'w-full bg-white border rounded-lg font-body-lg outline-none transition-all duration-200';
  
  const stateStyles = error
    ? 'border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]/20 focus:border-[#ba1a1a]'
    : 'border-[#6c7b6b] focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#006d2f]';

  const paddingStyles = prefix
    ? 'pl-[68px] pr-3 py-2'
    : 'px-3 py-2';

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-[#3c4a3d] mb-1">
          {label}
          {required && <span className="text-[#ba1a1a] ml-1">*</span>}
        </label>
      )}
      <div className="relative group">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none border-r border-[#6c7b6b] pr-2">
            <span className="text-[#191c1e] font-medium">{prefix}</span>
          </div>
        )}
        <input
          ref={ref}
          className={`
            ${baseStyles}
            ${stateStyles}
            ${paddingStyles}
            ${inputClassName}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[#ba1a1a] text-xs mt-1">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;