import { ReactNode } from 'react';
import { Loader2, LucideIcon } from 'lucide-react';

interface TodayCardProps {
  isLoading?: boolean;
  error?: string | null;
  children: ReactNode;
  className?: string;
}

interface TodayCardHeaderProps {
  badge?: {
    label: string;
    variant?: 'primary' | 'success' | 'indigo' | 'default';
  };
  title: string;
  subtitle?: string;
  icon?: LucideIcon | null;
  iconVariant?: 'primary' | 'success' | 'indigo' | 'muted';
}

interface TodayCardContentProps {
  children: ReactNode;
}

export function TodayCard({ isLoading, error, children, className }: TodayCardProps) {
  if (isLoading) {
    return (
      <div className={`bg-card p-6 aspect-square flex justify-center items-center ${className}`}>
        <div className="relative">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
          <div className="absolute inset-0 w-8 h-8 rounded-full bg-brand-primary/20 blur-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-card p-6 aspect-square flex items-center justify-center text-error ${className}`}>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className={`bg-card p-6 aspect-square flex flex-col group ${className}`}>
      {children}
    </div>
  );
}

export function TodayCardHeader({
  badge,
  title,
  subtitle,
  icon: Icon,
  iconVariant = 'primary',
}: TodayCardHeaderProps) {
  const iconClasses = {
    primary: 'bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/20',
    success: 'bg-success/10 text-success ring-1 ring-success/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20',
    muted: 'bg-white/5 text-muted-foreground ring-1 ring-white/10',
  };

  const badgeClasses = {
    primary: 'bg-brand-primary/10 text-brand-primary ring-1 ring-inset ring-brand-primary/20',
    success: 'bg-success/10 text-success ring-1 ring-inset ring-success/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 ring-1 ring-inset ring-indigo-500/20',
    default: 'bg-white/5 text-muted-foreground ring-1 ring-inset ring-white/10',
  };

  return (
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1 min-w-0">
        {badge && (
          <span
            className={`
              inline-block mb-2 px-2.5 py-1 rounded-full font-medium text-xs
              transition-all duration-200
              ${badgeClasses[badge.variant || 'default']}
            `}
          >
            {badge.label}
          </span>
        )}
        <h3 className="font-display font-bold text-xl tracking-tight">{title}</h3>
        {subtitle && (
          <p className="text-muted-foreground text-sm mt-0.5">{subtitle}</p>
        )}
      </div>
      {Icon && (
        <div
          className={`
            p-2 rounded-xl shrink-0
            transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]
            group-hover:scale-110
            ${iconClasses[iconVariant]}
          `}
        >
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}

export function TodayCardContent({ children }: TodayCardContentProps) {
  return <div className="flex flex-col flex-1 justify-between">{children}</div>;
}

