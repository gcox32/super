'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import BackToLink from '@/components/layout/navigation/BackToLink';
import { getBreadcrumbParams } from '@/lib/breadcrumbs';

interface PageLayoutClientProps {
  breadcrumbHref?: string;
  breadcrumbText?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Client component wrapper for PageLayout that reads searchParams from URL
 */
export default function PageLayoutClient({
  breadcrumbHref: propBreadcrumbHref,
  breadcrumbText: propBreadcrumbText,
  title,
  subtitle,
  action,
  children,
}: PageLayoutClientProps) {
  const searchParams = useSearchParams();
  const breadcrumbParams = getBreadcrumbParams(searchParams);

  // Use breadcrumb params from URL if available, otherwise fall back to props
  const breadcrumbHref = breadcrumbParams?.breadcrumbHref ?? propBreadcrumbHref;
  const breadcrumbText = breadcrumbParams?.breadcrumbText ?? propBreadcrumbText;

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

