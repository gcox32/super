'use client';

import Link from 'next/link';
import { Carrot, UtensilsCrossed, ClipboardList, CalendarDays } from 'lucide-react';
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
          
          <Link href="/fuel/build/foods" className="block">
            <div className="flex items-center gap-4 bg-card shadow-lg active:shadow-none p-6 border border-border hover:border-brand-primary rounded-lg transition-colors">
              <div className="bg-gray-100 p-3 rounded-full text-gray-600">
                <Carrot className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-300 text-lg">Foods</h2>
                <p className="mt-1 text-gray-300 text-sm">
                  Create and manage your library of foods, including calories, macros, and micros.
                </p>
              </div>
            </div>
          </Link>

          <Link href="/fuel/build/meals" className="block">
            <div className="flex items-center gap-4 bg-card shadow-lg active:shadow-none p-6 border border-border hover:border-brand-primary rounded-lg transition-colors">
              <div className="bg-gray-100 p-3 rounded-full text-gray-600">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-300 text-lg">Meals</h2>
                <p className="mt-1 text-gray-300 text-sm">
                  Create and manage your meal plans, including breakfast, lunch, dinner, and snacks.
                </p>
              </div>
            </div>
          </Link>

          <Link href="/fuel/build/plans" className="block">
            <div className="flex items-center gap-4 bg-card shadow-lg active:shadow-none p-6 border border-border hover:border-brand-primary rounded-lg transition-colors">
              <div className="bg-gray-100 p-3 rounded-full text-gray-600">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-300 text-lg">Meal Plans</h2>
                <p className="mt-1 text-gray-300 text-sm">
                  Create and manage your meal plans.
                </p>
              </div>
            </div>
          </Link>

        </section>
    </PageLayout>
  );
}