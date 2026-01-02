'use client';

import BreadcrumbLink from '@/components/layout/BreadcrumbLink';
import { Carrot, UtensilsCrossed, ClipboardList } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

export default function BuildPage() {
  return (
    <PageLayout
      breadcrumbHref="/fuel"
      breadcrumbText="Fuel"
      title="Build"
      subtitle="Manage your fuel components"
    >
        {/* Build Options */}
        <section className="space-y-4 px-2 md:px-6 pb-6">

          <BreadcrumbLink href="/fuel/build/foods" breadcrumbHref="/fuel/build" breadcrumbText="Build" className="block">
            <div className="flex items-center gap-4 bg-card p-5 active:scale-[0.98] transition-transform">
              <div className="bg-brand-accent/15 shadow-brand-accent/10 shadow-lg p-3 rounded-xl">
                <Carrot className="w-6 h-6 text-brand-accent" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Foods</h2>
                <p className="mt-1 text-muted-foreground text-sm">
                  Create and manage your library of foods, including calories, macros, and micros.
                </p>
              </div>
            </div>
          </BreadcrumbLink>

          <BreadcrumbLink href="/fuel/build/meals" breadcrumbHref="/fuel/build" breadcrumbText="Build" className="block">
            <div className="flex items-center gap-4 bg-card p-5 active:scale-[0.98] transition-transform">
              <div className="bg-brand-accent/15 shadow-brand-accent/10 shadow-lg p-3 rounded-xl">
                <UtensilsCrossed className="w-6 h-6 text-brand-accent" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Meals</h2>
                <p className="mt-1 text-muted-foreground text-sm">
                  Create and manage your meal plans, including breakfast, lunch, dinner, and snacks.
                </p>
              </div>
            </div>
          </BreadcrumbLink>

          <BreadcrumbLink href="/fuel/build/plans" breadcrumbHref="/fuel/build" breadcrumbText="Build" className="block">
            <div className="flex items-center gap-4 bg-card p-5 active:scale-[0.98] transition-transform">
              <div className="bg-brand-accent/15 shadow-brand-accent/10 shadow-lg p-3 rounded-xl">
                <ClipboardList className="w-6 h-6 text-brand-accent" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Meal Plans</h2>
                <p className="mt-1 text-muted-foreground text-sm">
                  Create and manage your meal plans.
                </p>
              </div>
            </div>
          </BreadcrumbLink>

        </section>
    </PageLayout>
  );
}