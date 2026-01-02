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
    const baseStyles = cn(
      // Layout & typography
      'inline-flex items-center justify-center gap-2',
      'font-semibold tracking-tight',
      'rounded-full',
      // Transitions with custom easing
      'transition-all duration-200',
      '[transition-timing-function:cubic-bezier(0.16,1,0.3,1)]',
      // Cursor & focus
      'cursor-pointer',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      // Disabled state
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      // Transform origin for scale effects
      'origin-center'
    );

    const variantStyles = {
      primary: cn(
        // Base appearance
        'bg-brand-primary text-white',
        // Gradient overlay for depth
        'bg-gradient-to-b from-brand-primary-light/20 to-transparent',
        // Shadow with glow
        'shadow-lg shadow-brand-primary/25',
        // Inner highlight
        'ring-1 ring-inset ring-white/10',
        // Hover state
        'hover:bg-brand-primary-dark hover:shadow-xl hover:shadow-brand-primary/35',
        'hover:-translate-y-0.5',
        // Active/press state
        'active:scale-[0.97] active:translate-y-0 active:shadow-md active:shadow-brand-primary/20',
        // Focus ring
        'focus-visible:ring-brand-primary-light'
      ),
      secondary: cn(
        // Base appearance with glass effect
        'bg-white/5 text-foreground',
        'backdrop-blur-sm',
        // Border with subtle gradient
        'border border-white/10',
        // Shadow
        'shadow-lg shadow-black/20',
        // Inner highlight
        'ring-1 ring-inset ring-white/5',
        // Hover state
        'hover:bg-white/10 hover:border-white/20',
        'hover:-translate-y-0.5 hover:shadow-xl',
        // Active state
        'active:scale-[0.97] active:translate-y-0',
        // Focus ring
        'focus-visible:ring-brand-primary'
      ),
      danger: cn(
        // Base appearance
        'bg-red-600 text-white',
        // Gradient overlay
        'bg-gradient-to-b from-red-500/20 to-transparent',
        // Shadow with glow
        'shadow-lg shadow-red-600/25',
        // Inner highlight
        'ring-1 ring-inset ring-white/10',
        // Hover state
        'hover:bg-red-700 hover:shadow-xl hover:shadow-red-600/35',
        'hover:-translate-y-0.5',
        // Active state
        'active:scale-[0.97] active:translate-y-0 active:shadow-md',
        // Focus ring
        'focus-visible:ring-red-400'
      ),
      ghost: cn(
        // Base appearance
        'bg-transparent text-foreground',
        // Hover state
        'hover:bg-white/5',
        // Active state
        'active:bg-white/10 active:scale-[0.97]',
        // Focus ring
        'focus-visible:ring-brand-primary'
      ),
      outline: cn(
        // Base appearance
        'bg-transparent text-foreground',
        'border border-white/15',
        // Subtle inner glow
        'ring-1 ring-inset ring-white/5',
        // Hover state
        'hover:bg-white/5 hover:border-white/25',
        'hover:-translate-y-0.5',
        // Active state
        'active:scale-[0.97] active:translate-y-0',
        // Focus ring
        'focus-visible:ring-brand-primary'
      ),
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

