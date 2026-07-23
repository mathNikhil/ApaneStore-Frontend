import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  icon,
  iconPosition = 'right',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all btn-press';
  
  const variantStyles = {
    primary: 'bg-[#25D366] text-[#005523] hover:brightness-105 active:scale-[0.98]',
    secondary: 'bg-[#eceef1] text-[#006d2f] hover:bg-[#d9e4ec] active:scale-[0.98]',
    outline: 'border-2 border-[#bbcbb9] bg-transparent text-[#3c4a3d] hover:bg-[#eceef1] active:scale-[0.98]',
    error: 'border-2 border-[#ba1a1a]/20 text-[#ba1a1a] hover:bg-[#ffdad6]/50 active:scale-[0.98]',
    ghost: 'bg-transparent text-[#3c4a3d] hover:bg-[#eceef1] active:scale-[0.98]',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-8 py-3.5 text-lg',
  };

  const widthStyles = fullWidth ? 'w-full' : '';
  const disabledStyles = disabled || loading ? 'opacity-50 pointer-events-none' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${widthStyles}
        ${disabledStyles}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <span className="material-symbols-outlined animate-spin">progress_activity</span>
      )}
      {icon && iconPosition === 'left' && !loading && (
        <span className="material-symbols-outlined text-xl">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && !loading && (
        <span className="material-symbols-outlined text-xl">{icon}</span>
      )}
    </button>
  );
};

export default Button;