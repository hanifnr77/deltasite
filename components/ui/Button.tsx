import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  className = '',
  disabled,
  ...props 
}) => {
  
  const baseStyles = "relative overflow-hidden font-heading font-semibold transition-all duration-300 flex items-center justify-center gap-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-white active:scale-95";
  
  const variants = {
    primary: "bg-gradient-to-r from-madrasah-primary to-madrasah-secondary text-white hover:shadow-lg hover:shadow-emerald-500/30 border border-transparent",
    secondary: "bg-white text-madrasah-primary border border-gray-200 hover:border-madrasah-primary hover:bg-emerald-50",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
    ghost: "bg-transparent text-gray-500 hover:text-madrasah-primary hover:bg-emerald-50/50"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${loading || disabled ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      ) : children}
    </button>
  );
};