'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import type { UserStats } from '@/types/user';
import { logViews } from './config';
import Highlights from '@/components/log/Highlights';

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
        const res = await fetch('/api/user/stats?latest=true', { cache: 'no-store' });
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
    <div className="bg-background pb-20 min-h-screen">
      <div className="md:mx-auto md:max-w-4xl">
        {/* Header */}
        <section className="px-4 md:px-6 pt-6 pb-4 border-border border-b">
          <h1 className="mb-1 font-bold text-2xl">Log</h1>
          <p className="text-muted-foreground text-sm">
            Track body stats, images, sleep, and more.
          </p>
        </section>

        {/* Highlights */}
        <section className="px-4 md:px-6 py-6 border-border border-b">
          <h2 className="mb-3 font-semibold text-muted-foreground text-sm uppercase tracking-[0.16em]">
            Highlights
          </h2>

          {loading ? (
            <div className="flex justify-center items-center bg-card px-4 py-8 border border-border rounded-xl text-muted-foreground text-sm">
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              Loading latest stats...
            </div>
          ) : !latestStats ? (
            <div className="bg-card/40 px-4 py-4 border border-border border-dashed rounded-xl text-muted-foreground text-sm">
              No body stats logged yet. Start by logging your first entry.
            </div>
          ) : (
            <Highlights latestWeight={latestWeight} latestBodyFat={latestBodyFat} latestStatsDate={latestStats.date ? new Date(latestStats.date).toLocaleDateString() : ''} />
          )}
        </section>

        {/* Log sections */}
        <section className="px-4 md:px-6 py-6">
          <h2 className="mb-3 font-semibold text-muted-foreground text-sm uppercase tracking-[0.16em]">
            Logs
          </h2>
          <div className="gap-3 grid grid-cols-1 md:max-w-xl">
            {logViews.map((view) => (
              <Link
                key={view.name}
                href={view.href}
                className={view.active ? `flex justify-between items-center bg-card hover:bg-card/80 px-4 py-3 border border-border hover:border-brand-primary rounded-xl transition` 
                  : `flex justify-between items-center bg-card/40 opacity-70 px-4 py-3 border border-border-accent border-dashed rounded-xl`}
              >
                <div className="flex items-center gap-3">
                  <div className={view.active ? `flex justify-center items-center bg-brand-primary/10 rounded-full w-10 h-10` : 
                    `flex justify-center items-center bg-zinc-800/60 rounded-full w-10 h-10`}>
                    <view.icon className={view.active ? `w-5 h-5 text-brand-primary` : `w-5 h-5 text-muted-foreground`} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{view.name}</div>
                    <div className="text-muted-foreground text-xs">{view.description}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

