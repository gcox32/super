'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ComponentProps } from 'react';
import { buildBreadcrumbUrl } from '@/lib/breadcrumbs';

interface BreadcrumbLinkProps extends Omit<ComponentProps<typeof Link>, 'href'> {
  href: string;
  breadcrumbHref?: string;
  breadcrumbText?: string;
}

/**
 * Link component that automatically includes breadcrumb params in the URL
 * If breadcrumbHref and breadcrumbText are provided, they're added as query params
 * Also preserves the 'tab' param from current URL if present
 */
export default function BreadcrumbLink({
  href,
  breadcrumbHref,
  breadcrumbText,
  ...props
}: BreadcrumbLinkProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // If breadcrumb props are provided, build URL with breadcrumb params
  // Otherwise, use href as-is
  const finalHref = breadcrumbHref && breadcrumbText
    ? buildBreadcrumbUrl(href, breadcrumbHref, breadcrumbText, searchParams)
    : href;

  return <Link href={finalHref} {...props} />;
}

