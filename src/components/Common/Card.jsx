import React from 'react';

const Card = ({
  children,
  className = '',
  hover = false,
  variant = 'default',
}) => {
  const variantStyles = {
    default: 'bg-surface-container-lowest border border-outline-variant',
    elevated: 'bg-surface-container-lowest border border-outline-variant shadow-sm',
    tonal: 'bg-surface-container-low border border-outline-variant',
  };

  const hoverStyles = hover ? 'hover:shadow-md transition-shadow' : '';

  return (
    <div className={`rounded-xl p-5 ${variantStyles[variant]} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};

export default Card;