'use client';

import Link from 'next/link';
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
          
          <Link href="/train/build/exercises" className="block">
            <div className="flex items-center gap-4 bg-card shadow-lg active:shadow-none p-6 border border-border hover:border-brand-primary rounded-(--radius) transition-colors">
              <div className="bg-gray-100 p-3 rounded-full text-gray-600">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-300 text-lg">Exercises</h2>
                <p className="mt-1 text-gray-300 text-sm">
                  Create and manage your library of movements.
                </p>
              </div>
            </div>
          </Link>

          <Link href="/train/build/workouts" className="block">
            <div className="flex items-center gap-4 bg-card shadow-lg active:shadow-none p-6 border border-border hover:border-brand-primary rounded-(--radius) transition-colors">
              <div className="bg-gray-100 p-3 rounded-full text-gray-600">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-300 text-lg">Workouts</h2>
                <p className="mt-1 text-gray-300 text-sm">
                  Design individual training sessions by combining exercises into blocks.
                </p>
              </div>
            </div>
          </Link>

          <Link href="/train/build/protocols" className="block">
            <div className="flex items-center gap-4 bg-card shadow-lg active:shadow-none p-6 border border-border hover:border-brand-primary rounded-(--radius) transition-colors">
              <div className="bg-gray-100 p-3 rounded-full text-gray-600">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-300 text-lg">Protocols</h2>
                <p className="mt-1 text-gray-300 text-sm">
                  Construct objective-based multi-week programs from workouts.
                </p>
              </div>
            </div>
          </Link>

        </section>
    </PageLayout>
  );
}

