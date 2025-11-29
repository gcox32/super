'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
      primary:
        'bg-brand-primary text-white hover:bg-brand-primary-dark active:bg-brand-primary-dark active:scale-[0.98] focus:ring-brand-primary',
      secondary:
        'bg-card text-foreground border border-border hover:bg-hover active:bg-active active:scale-[0.98] focus:ring-brand-primary',
      danger:
        'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 active:scale-[0.98] focus:ring-red-500',
      ghost:
        'bg-transparent text-foreground hover:bg-hover active:bg-active active:scale-[0.98] focus:ring-brand-primary',
      outline:
        'border border-border text-foreground hover:bg-hover active:bg-active active:scale-[0.98] focus:ring-brand-primary',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm min-h-[36px]',
      md: 'px-4 py-2 text-base min-h-[44px]',
      lg: 'px-6 py-3 text-lg min-h-[48px]',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled}
        style={{ touchAction: 'manipulation' }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

