import React from 'react';

const variants = {
  default: 'bg-blue-600 hover:bg-blue-700 text-white',
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
  outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700',
  ghost: 'hover:bg-gray-100 text-gray-700',
  destructive: 'bg-red-600 hover:bg-red-700 text-white'
};

const sizes = {
  default: 'px-4 py-2 text-sm',
  sm: 'px-3 py-1.5 text-xs',
  lg: 'px-6 py-3 text-base',
  icon: 'p-2'
};

export const Button = ({ 
  children, 
  variant = 'default', 
  size = 'default', 
  className = '', 
  disabled = false,
  onClick,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const handleClick = (e) => {
    if (!disabled && onClick) {
      console.log('🖱️ Button clicked:', children);
      onClick(e);
    }
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 