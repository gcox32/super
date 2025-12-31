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
          "block bg-input shadow-sm px-3 py-2 border border-input focus:border-brand-primary rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary w-full text-foreground placeholder:text-muted-foreground sm:text-sm transition-colors",
          error && "border-error focus:border-error focus:ring-error",
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
          "block bg-input shadow-sm px-3 py-2 border border-input focus:border-brand-primary rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary w-full min-h-[80px] text-foreground placeholder:text-muted-foreground sm:text-sm transition-colors",
          error && "border-error focus:border-error focus:ring-error",
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
      <select
        ref={ref}
        className={cn(
          "block bg-input shadow-sm px-3 py-2 border border-input focus:border-brand-primary rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary w-full text-foreground sm:text-sm transition-colors appearance-none",
          // Add a custom arrow if needed, but for now relying on browser default or appearance-none + bg-image usually
          error && "border-error focus:border-error focus:ring-error",
          className
        )}
        {...props}
      >
        {children}
      </select>
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

