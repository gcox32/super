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
      'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
      primary:
        'bg-brand-primary text-white shadow-lg shadow-brand-primary/30 hover:bg-brand-primary-dark hover:shadow-brand-primary/40 active:scale-[0.97] active:shadow-brand-primary/20 focus:ring-brand-primary',
      secondary:
        'bg-white/5 text-foreground border border-white/10 shadow-lg shadow-black/20 hover:bg-white/10 hover:border-white/15 active:scale-[0.97] focus:ring-brand-primary',
      danger:
        'bg-red-600 text-white shadow-lg shadow-red-600/30 hover:bg-red-700 hover:shadow-red-600/40 active:scale-[0.97] active:shadow-red-600/20 focus:ring-red-500',
      ghost:
        'bg-transparent text-foreground hover:bg-white/5 active:bg-white/10 active:scale-[0.97] focus:ring-brand-primary',
      outline:
        'border border-white/10 text-foreground hover:bg-white/5 hover:border-white/20 active:scale-[0.97] focus:ring-brand-primary',
    };

    const sizeStyles = {
      sm: 'px-4 py-1.5 text-sm min-h-[36px]',
      md: 'px-5 py-2.5 text-base min-h-[44px]',
      lg: 'px-7 py-3 text-lg min-h-[52px]',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
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

