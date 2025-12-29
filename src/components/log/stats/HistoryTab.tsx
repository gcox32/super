'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import type { UserStats } from '@/types/user';
import { useToast } from '@/components/ui/Toast';

type StatsListResponse = {
  stats: UserStats[];
};

export default function HistoryTab() {
  const [stats, setStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/me/stats', { cache: 'no-store' });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || 'Failed to load stats');
      }
      const data = (await res.json()) as StatsListResponse;
      
      // Convert date strings to Date objects
      const statsWithDates = (data.stats || []).map(stat => ({
        ...stat,
        date: new Date(stat.date),
      }));
      
      setStats(statsWithDates);
    } catch (e: any) {
      showToast({
        variant: 'error',
        title: 'Unable to load stats',
        description: e.message || 'There was a problem loading your stats log.',
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/me/stats/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || 'Failed to delete entry');
      }
      setStats((prev) => prev.filter((s) => s.id !== id));
      showToast({
        variant: 'success',
        title: 'Entry deleted',
        description: 'The stats entry has been removed.',
      });
    } catch (e: any) {
      showToast({
        variant: 'error',
        title: 'Could not delete entry',
        description: e.message || 'There was a problem deleting that entry.',
      });
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center bg-card px-4 py-8 border border-border rounded-xl text-muted-foreground text-sm">
        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
        Loading history...
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="bg-card/40 px-4 py-4 border border-border border-dashed rounded-xl text-muted-foreground text-sm">
        No stats logged yet. Create your first entry in the Log tab.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {stats.map((entry) => (
        <div
          key={entry.id}
          className="flex justify-between items-start bg-card px-4 py-3 border border-border rounded-xl text-sm"
        >
          <div className="flex-1 space-y-1">
            <div className="text-muted-foreground text-xs">
              {new Date(entry.date).toLocaleDateString()}
            </div>
            <div className="space-y-0.5">
              {entry.weight && (
                <div className="font-medium">
                  Weight: {entry.weight.value} {entry.weight.unit}
                </div>
              )}
              {entry.height && (
                <div className="text-muted-foreground text-xs">
                  Height: {entry.height.value} {entry.height.unit}
                </div>
              )}
              {entry.bodyFatPercentage && (
                <div className="text-muted-foreground text-xs">
                  Body fat: {entry.bodyFatPercentage.value}%
                </div>
              )}
              {entry.muscleMass && (
                <div className="text-muted-foreground text-xs">
                  Muscle mass: {entry.muscleMass.value} {entry.muscleMass.unit}
                </div>
              )}
              {entry.tapeMeasurements && (
                <div className="mt-1 text-muted-foreground text-xs">
                  {Object.entries(entry.tapeMeasurements)
                    .filter(([_, val]) => val && typeof val === 'object' && 'value' in val)
                    .map(([key, val]: [string, any]) => (
                      <span key={key} className="mr-3">
                        {key.replace(/([A-Z])/g, ' $1').trim()}: {val.value} {val.unit}
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleDelete(entry.id)}
            className="hover:bg-zinc-800 ml-3 p-1.5 rounded-full text-muted-foreground hover:text-red-400 text-xs"
            aria-label="Delete entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

