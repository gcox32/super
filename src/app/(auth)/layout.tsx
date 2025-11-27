'use client';

import PublicFooter from '@/components/layout/PublicFooter';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <PublicFooter />
    </>
  );
}
