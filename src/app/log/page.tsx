'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import type { UserStats } from '@/types/user';
import { logViews } from './config';
import Highlights from '@/components/log/Highlights';
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
      <section className="px-4 md:px-6 py-6">
        <div className="gap-3 grid grid-cols-1 md:max-w-xl">
          {logViews.map((view) => (
            <div key={`${view.name}-log-section`}>
              {view.active ?
                <Link
                  key={view.name}
                  href={view.href}
                  className='flex justify-between items-center bg-card hover:bg-card/80 px-4 py-3 border border-border hover:border-brand-primary rounded-xl transition'
                >
                  <div className="flex items-center gap-3">
                    <div className='flex justify-center items-center bg-brand-primary/10 rounded-full w-10 h-10'>
                      <view.icon className='w-5 h-5 text-brand-primary' />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{view.name}</div>
                      <div className="text-muted-foreground text-xs">{view.description}</div>
                    </div>
                  </div>
                </Link>
                :
                <div key={view.name} className="flex justify-between items-center bg-card/40 opacity-70 px-4 py-3 border border-border-accent border-dashed rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex justify-center items-center bg-zinc-800/60 rounded-full w-10 h-10">
                      <view.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{view.name}</div>
                      <div className="text-muted-foreground text-xs">{view.description}</div>
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

