import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'hub' | 'link' | 'satellite' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  leftIcon,
  rightIcon,
  isLoading = false,
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-900 hover:bg-primary-800 active:bg-primary-950 text-white shadow-sm hover:shadow-md focus:ring-primary-500',
    secondary: 'bg-secondary-500 hover:bg-secondary-600 active:bg-secondary-700 text-white shadow-sm hover:shadow-md focus:ring-secondary-400',
    accent: 'bg-surface-100 hover:bg-surface-200 active:bg-surface-300 text-surface-900 border border-surface-300 shadow-sm hover:shadow-md focus:ring-primary-500',
    hub: 'bg-accent-hub hover:bg-blue-600 active:bg-blue-700 text-white shadow-sm hover:shadow-md focus:ring-blue-400',
    link: 'bg-accent-link hover:bg-emerald-600 active:bg-emerald-700 text-white shadow-sm hover:shadow-md focus:ring-emerald-400',
    satellite: 'bg-accent-satellite hover:bg-amber-600 active:bg-amber-700 text-white shadow-sm hover:shadow-md focus:ring-amber-400',
    ghost: 'bg-transparent hover:bg-surface-100 active:bg-surface-200 text-surface-700 focus:ring-primary-500',
    outline: 'bg-transparent hover:bg-primary-50 active:bg-primary-100 text-primary-900 border border-primary-300 focus:ring-primary-500'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
    md: 'px-4 py-2.5 text-sm rounded-lg gap-2',
    lg: 'px-6 py-3 text-base rounded-lg gap-2.5'
  };
  
  const widthStyles = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        widthStyles,
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : leftIcon ? (
        <span className="flex-shrink-0">{leftIcon}</span>
      ) : null}
      
      <span className="flex-1">{children}</span>
      
      {rightIcon && !isLoading && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button; 