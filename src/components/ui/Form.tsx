import React from 'react';
import { cn } from '@/lib/utils';

export function FormWrapper({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-6 mx-auto pb-12 max-w-2xl", className)} {...props}>
      {children}
    </div>
  );
}

export function FormCard({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-4 bg-card px-2 py-4 text-card-foreground", className)} {...props}>
      {children}
    </div>
  );
}

export function FormTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("font-bold text-foreground text-xl", className)} {...props}>
      {children}
    </h2>
  );
}

export function FormGroup({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-1.5", className)} {...props}>
      {children}
    </div>
  );
}

export function FormLabel({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("block font-medium text-muted-foreground text-sm", className)} {...props}>
      {children}
    </label>
  );
}

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          // Base layout
          "block w-full px-4 py-3 sm:text-sm",
          // Background with glass effect
          "bg-white/5 backdrop-blur-sm",
          // Border
          "border border-white/10 rounded-xl",
          // Text
          "text-foreground placeholder:text-muted-foreground/60",
          // Shadow and inner glow
          "shadow-sm ring-1 ring-inset ring-white/5",
          // Transitions
          "transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
          // Focus states
          "focus:outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/20",
          "focus:bg-white/8 focus:shadow-md focus:shadow-brand-primary/5",
          // Hover
          "hover:border-white/20 hover:bg-white/8",
          // Error state
          error && "border-error/50 focus:border-error focus:ring-error/20",
          className
        )}
        {...props}
      />
    );
  }
);
FormInput.displayName = "FormInput";

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          // Base layout
          "block w-full px-4 py-3 min-h-[100px] sm:text-sm",
          // Background with glass effect
          "bg-white/5 backdrop-blur-sm",
          // Border
          "border border-white/10 rounded-xl",
          // Text
          "text-foreground placeholder:text-muted-foreground/60",
          // Shadow and inner glow
          "shadow-sm ring-1 ring-inset ring-white/5",
          // Resize
          "resize-none",
          // Transitions
          "transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
          // Focus states
          "focus:outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/20",
          "focus:bg-white/8 focus:shadow-md focus:shadow-brand-primary/5",
          // Hover
          "hover:border-white/20 hover:bg-white/8",
          // Error state
          error && "border-error/50 focus:border-error focus:ring-error/20",
          className
        )}
        {...props}
      />
    );
  }
);
FormTextarea.displayName = "FormTextarea";

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            // Base layout
            "block w-full px-4 py-3 pr-10 sm:text-sm appearance-none",
            // Background with glass effect
            "bg-white/5 backdrop-blur-sm",
            // Border
            "border border-white/10 rounded-xl",
            // Text
            "text-foreground",
            // Shadow and inner glow
            "shadow-sm ring-1 ring-inset ring-white/5",
            // Transitions
            "transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
            // Focus states
            "focus:outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/20",
            "focus:bg-white/8 focus:shadow-md focus:shadow-brand-primary/5",
            // Hover
            "hover:border-white/20 hover:bg-white/8",
            // Cursor
            "cursor-pointer",
            // Error state
            error && "border-error/50 focus:border-error focus:ring-error/20",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {/* Custom dropdown arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  }
);
FormSelect.displayName = "FormSelect";

export function FormError({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  if (!children) return null;
  return (
    <p className={cn("mt-1 text-error text-sm", className)} {...props}>
      {children}
    </p>
  );
}

export function FormActions({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex justify-center gap-4 pt-4", className)} {...props}>
      {children}
    </div>
  );
}

