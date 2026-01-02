import React from 'react';
import PageLayoutClient from './PageLayoutClient';

interface PageLayoutProps {
  breadcrumbHref?: string;
  breadcrumbText?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * PageLayout component that automatically reads breadcrumb params from URL
 * Uses client component wrapper to read searchParams automatically
 * Works in both server and client components
 */
export default function PageLayout(props: PageLayoutProps) {
  // Always use client wrapper which reads searchParams from URL automatically
  return <PageLayoutClient {...props} />;
}
