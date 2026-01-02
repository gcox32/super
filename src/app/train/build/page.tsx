'use client';

import BreadcrumbLink from '@/components/layout/BreadcrumbLink';
import { Dumbbell, ClipboardList, CalendarDays } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

export default function BuildPage() {
  return (
    <PageLayout
      breadcrumbHref="/train"
      breadcrumbText="Train"
      title="Build"
      subtitle="Manage your training components"
    >

        {/* Build Options */}
        <section className="space-y-4 px-2 md:px-6 pb-6">

          <BreadcrumbLink href="/train/build/exercises" breadcrumbHref="/train/build" breadcrumbText="Build" className="block">
            <div className="flex items-center gap-4 bg-card p-5 active:scale-[0.98] transition-transform">
              <div className="bg-brand-primary/15 shadow-brand-primary/10 shadow-lg p-3 rounded-xl">
                <Dumbbell className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Exercises</h2>
                <p className="mt-1 text-muted-foreground text-sm">
                  Create and manage your library of movements.
                </p>
              </div>
            </div>
          </BreadcrumbLink>

          <BreadcrumbLink href="/train/build/workouts" breadcrumbHref="/train/build" breadcrumbText="Build" className="block">
            <div className="flex items-center gap-4 bg-card p-5 active:scale-[0.98] transition-transform">
              <div className="bg-brand-primary/15 shadow-brand-primary/10 shadow-lg p-3 rounded-xl">
                <ClipboardList className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Workouts</h2>
                <p className="mt-1 text-muted-foreground text-sm">
                  Design individual training sessions by combining exercises into blocks.
                </p>
              </div>
            </div>
          </BreadcrumbLink>

          <BreadcrumbLink href="/train/build/protocols" breadcrumbHref="/train/build" breadcrumbText="Build" className="block">
            <div className="flex items-center gap-4 bg-card p-5 active:scale-[0.98] transition-transform">
              <div className="bg-brand-primary/15 shadow-brand-primary/10 shadow-lg p-3 rounded-xl">
                <CalendarDays className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Protocols</h2>
                <p className="mt-1 text-muted-foreground text-sm">
                  Construct objective-based multi-week programs from workouts.
                </p>
              </div>
            </div>
          </BreadcrumbLink>

        </section>
    </PageLayout>
  );
}

