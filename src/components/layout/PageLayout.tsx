import React from 'react';
import BackToLink from '@/components/layout/navigation/BackToLink';

interface PageLayoutProps {
  breadcrumbHref?: string;
  breadcrumbText?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export default function PageLayout({
  breadcrumbHref,
  breadcrumbText,
  title,
  subtitle,
  action,
  children,
}: PageLayoutProps) {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl pb-16 overscroll-none">
      {breadcrumbHref && breadcrumbText && (
        <div className="animate-fade-in">
          <BackToLink href={breadcrumbHref} pageName={breadcrumbText} />
        </div>
      )}

      <div className="flex justify-between items-start my-2 animate-fade-in-up">
        <div className="flex-1">
          {title && (
            <h1 className="font-display font-bold text-3xl tracking-tight text-gradient">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-muted-foreground mt-1 mb-4">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="ml-4">
            {action}
          </div>
        )}
      </div>

      <div className="stagger-children">
        {children}
      </div>
    </div>
  );
}
