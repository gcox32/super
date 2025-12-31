'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import type { UserStats } from '@/types/user';
import { logViews } from './config';
import PageLayout from '@/components/layout/PageLayout';

type LatestStatsResponse = {
  stats: (UserStats & {
    tapeMeasurements?: UserStats['tapeMeasurements'];
  }) | null;
};

export default function LogPage() {
  const [latestStats, setLatestStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;

    async function loadLatest() {
      try {
        setLoading(true);
        const res = await fetch('/api/me/stats?latest=true', { cache: 'no-store' });
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(body?.error || 'Failed to load stats');
        }
        const data = (await res.json()) as LatestStatsResponse;
        if (cancelled) return;
        setLatestStats((data.stats as UserStats) ?? null);
      } catch (e: any) {
        if (!cancelled) {
          showToast({
            variant: 'error',
            title: 'Unable to load stats',
            description: e.message || 'There was a problem loading your latest stats.',
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadLatest();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const latestWeight = latestStats?.weight;
  const latestBodyFat = latestStats?.bodyFatPercentage;

  return (
    <PageLayout
      title="Log"
      subtitle="Track your body stats, workouts, and more"
    >
      {/* Log sections */}
      <section className="px-2 md:px-6 py-6">
        <div className="gap-3 grid grid-cols-1 md:max-w-xl">
          {logViews.map((view) => (
            <div key={`${view.name}-log-section`}>
              {view.active ?
                <Link
                  key={view.name}
                  href={view.href}
                  className='flex justify-between items-center bg-card px-4 py-4 active:scale-[0.98] transition-transform'
                >
                  <div className="flex items-center gap-4">
                    <div className='flex justify-center items-center bg-brand-primary/15 shadow-brand-primary/10 shadow-lg rounded-xl w-12 h-12'>
                      <view.icon className='w-6 h-6 text-brand-primary' />
                    </div>
                    <div>
                      <div className="font-semibold">{view.name}</div>
                      <div className="text-muted-foreground text-sm">{view.description}</div>
                    </div>
                  </div>
                </Link>
                :
                <div key={view.name} className="flex justify-between items-center bg-card/30 opacity-60 px-4 py-4 border border-white/5 border-dashed rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="flex justify-center items-center bg-white/5 rounded-xl w-12 h-12">
                      <view.icon className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-semibold">{view.name}</div>
                      <div className="text-muted-foreground text-sm">{view.description}</div>
                    </div>
                  </div>
                </div>
              }
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}

