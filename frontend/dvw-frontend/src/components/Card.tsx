import { clsx } from 'clsx';
import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  rounded = 'lg',
  className,
  ...props
}: CardProps) => {
  const baseStyles = 'relative bg-white';
  
  const variants = {
    default: 'shadow-sm border border-surface-200',
    elevated: 'shadow-md border border-surface-200',
    outlined: 'border-2 border-surface-300 shadow-none',
    glass: 'bg-white/80 backdrop-blur-sm border border-surface-200/50 shadow-sm'
  };
  
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };
  
  const roundedStyles = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl'
  };
  
  return (
    <div
      className={clsx(
        baseStyles,
        variants[variant],
        paddings[padding],
        roundedStyles[rounded],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card; 