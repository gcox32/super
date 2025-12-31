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
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-card p-6 aspect-square flex items-center justify-center text-destructive ${className}`}>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className={`bg-card p-6 aspect-square flex flex-col ${className}`}>
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
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    indigo: 'bg-indigo-500/10 text-indigo-500',
    muted: 'bg-muted text-muted-foreground',
  };

  const badgeClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    indigo: 'bg-indigo-500/10 text-indigo-500',
    default: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1 min-w-0">
        {badge && (
          <span
            className={`inline-block mb-2 px-2 py-1 rounded font-medium text-xs ${
              badgeClasses[badge.variant || 'default']
            }`}
          >
            {badge.label}
          </span>
        )}
        <h3 className="font-bold text-xl">{title}</h3>
        {subtitle && (
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        )}
      </div>
      {Icon && (
        <Icon
          className={`p-2 rounded-full w-10 h-10 shrink-0 ${iconClasses[iconVariant]}`}
        />
      )}
    </div>
  );
}

export function TodayCardContent({ children }: TodayCardContentProps) {
  return <div className="flex flex-col flex-1 justify-between">{children}</div>;
}

