/**
 * Utility functions for handling breadcrumb navigation
 */

/**
 * Builds a URL with breadcrumb query parameters
 * Preserves existing query params like 'tab'
 * @param href - The base URL path
 * @param breadcrumbHref - The href for the breadcrumb link
 * @param breadcrumbText - The text for the breadcrumb link
 * @param currentSearchParams - Optional current search params to preserve (e.g., tab param)
 * @returns URL string with breadcrumb params appended
 */
export function buildBreadcrumbUrl(
  href: string,
  breadcrumbHref?: string,
  breadcrumbText?: string,
  currentSearchParams?: URLSearchParams | { get: (key: string) => string | null } | null
): string {
  if (!breadcrumbHref || !breadcrumbText) {
    return href;
  }

  // Parse the href to separate path and existing query params
  const [path, existingQuery] = href.split('?');
  const params = new URLSearchParams(existingQuery || '');

  // Preserve tab param from current search params if provided
  if (currentSearchParams) {
    let tabValue: string | null = null;
    
    if (currentSearchParams instanceof URLSearchParams) {
      tabValue = currentSearchParams.get('tab');
    } else if (typeof currentSearchParams === 'object' && 'get' in currentSearchParams) {
      tabValue = currentSearchParams.get('tab');
    }
    
    if (tabValue) {
      params.set('tab', tabValue);
    }
  }

  // Add breadcrumb params
  params.set('breadcrumbHref', breadcrumbHref);
  params.set('breadcrumbText', breadcrumbText);

  return `${path}?${params.toString()}`;
}

/**
 * Extracts breadcrumb parameters and tab from Next.js searchParams
 * Works with both server component searchParams and client component URLSearchParams
 * @param searchParams - Next.js searchParams object, URLSearchParams, or string to parse
 * @returns Object with breadcrumbHref, breadcrumbText, and tab (if present), or null if breadcrumb params not present
 */
export function getBreadcrumbParams(
  searchParams: 
    | { get: (key: string) => string | null } 
    | URLSearchParams 
    | string 
    | null 
    | undefined
): { breadcrumbHref: string; breadcrumbText: string; tab?: string } | null {
  if (!searchParams) {
    return null;
  }

  let href: string | null = null;
  let text: string | null = null;
  let tab: string | null = null;

  // Handle Next.js searchParams object (server components)
  if (typeof searchParams === 'object' && 'get' in searchParams && typeof searchParams.get === 'function') {
    href = searchParams.get('breadcrumbHref');
    text = searchParams.get('breadcrumbText');
    tab = searchParams.get('tab');
  }
  // Handle URLSearchParams (client components)
  else if (searchParams instanceof URLSearchParams) {
    href = searchParams.get('breadcrumbHref');
    text = searchParams.get('breadcrumbText');
    tab = searchParams.get('tab');
  }
  // Handle string
  else if (typeof searchParams === 'string') {
    const params = new URLSearchParams(searchParams);
    href = params.get('breadcrumbHref');
    text = params.get('breadcrumbText');
    tab = params.get('tab');
  }

  if (href && text) {
    const result: { breadcrumbHref: string; breadcrumbText: string; tab?: string } = { 
      breadcrumbHref: decodeURIComponent(href), 
      breadcrumbText: decodeURIComponent(text) 
    };
    
    if (tab) {
      result.tab = decodeURIComponent(tab);
    }
    
    return result;
  }

  return null;
}

