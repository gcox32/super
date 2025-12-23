'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { fetchJson } from '@/lib/train/helpers';
import { Moon, Pencil, Plus, Loader2 } from 'lucide-react';
import { SleepInstance } from '@/types/fuel';

export default function LatestSleep() {
  const router = useRouter();
  const [sleep, setSleep] = useState<SleepInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;
        const todayDateUTC = new Date(todayString);
        
        // Fetch sleep logs for today (which represents last night's sleep)
        const res = await fetchJson<{ sleepInstances: SleepInstance[] }>(
          `/api/fuel/sleep?dateFrom=${todayDateUTC.toISOString()}`
        );

        if (cancelled) return;
        
        // Find the one for today
        const todaysSleep = res.sleepInstances.find(s => {
          const sDate = new Date(s.date);
          return sDate.getTime() === todayDateUTC.getTime();
        });

        setSleep(todaysSleep || null);
      } catch (err: any) {
        console.error('Failed to load sleep data', err);
        if (!cancelled) {
          setError(err?.message || 'Failed to load data');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
        <div className="bg-card shadow-sm p-6 border border-border rounded-lg flex justify-center items-center h-[160px]">
            <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
        </div>
    );
  }

  if (error) {
    // Fail silently or show minimal error? showing error for now
    return (
        <div className="bg-card shadow-sm p-6 border border-border rounded-lg h-[160px] flex items-center justify-center text-destructive">
            Error loading sleep data
        </div>
    );
  }

  // CASE 1: Sleep Logged
  if (sleep) {
    const durationHours = sleep.timeAsleep?.value || 0;
    const hours = Math.floor(durationHours);
    const minutes = Math.round((durationHours - hours) * 60);
    const durationString = `${hours}h ${minutes}m`;

    return (
      <div className="bg-card shadow-sm p-6 border border-border rounded-lg h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <span className="inline-block bg-indigo-500/10 mb-2 px-2 py-1 rounded font-medium text-indigo-500 text-xs">
              Last Night
            </span>
            <h3 className="font-bold text-xl">{durationString}</h3>
            {sleep.sleepScore !== undefined && (
                <p className="text-muted-foreground text-sm">
                    Score: {sleep.sleepScore}
                </p>
            )}
            {!sleep.sleepScore && (
                <p className="text-muted-foreground text-sm">
                    Logged
                </p>
            )}
          </div>
          <Moon className="bg-indigo-500/10 p-2 rounded-full w-10 h-10 text-indigo-500" />
        </div>
        
        <div className="mt-4">
          <Button 
            variant="outline" 
            fullWidth
            onClick={() => router.push(`/log/sleep/${sleep.id}`)}
            className="flex items-center justify-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
        </div>
      </div>
    );
  }

  // CASE 2: No Sleep Logged
  return (
    <div className="bg-card shadow-sm p-6 border border-border rounded-lg h-full flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="mb-1 font-semibold text-lg">
            How did you sleep?
          </h3>
          <p className="text-muted-foreground text-sm">
            Log your rest
          </p>
        </div>
        <Moon className="bg-muted p-2 rounded-full w-10 h-10 text-muted-foreground" />
      </div>

      <div className="mt-4">
        <Button
          variant="secondary"
          fullWidth
          onClick={() => router.push('/log/sleep/new')}
          className="flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Log Sleep
        </Button>
      </div>
    </div>
  );
}
