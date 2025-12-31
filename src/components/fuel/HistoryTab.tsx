'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Utensils, Pencil } from 'lucide-react';
import type { MealInstance } from '@/types/fuel';
import type { Meal } from '@/types/fuel';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Failed to fetch');
  }
  return res.json();
}

export default function HistoryTab() {
  const [loading, setLoading] = useState(true);
  const [mealInstances, setMealInstances] = useState<MealInstance[]>([]);
  const [meals, setMeals] = useState<Map<string, Meal>>(new Map());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Fetch meal instances (last 30 days)
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - 30);
        const dateTo = new Date();

        const instances = await fetchJson<MealInstance[]>(
          `/api/fuel/meals/instances?dateFrom=${dateFrom.toISOString()}&dateTo=${dateTo.toISOString()}`
        );

        if (cancelled) return;

        // Convert date strings to Date objects
        const instancesWithDates = instances.map(instance => ({
          ...instance,
          date: new Date(instance.date),
          timestamp: instance.timestamp ? new Date(instance.timestamp) : null,
        }));

        setMealInstances(instancesWithDates);

        // Get unique meal IDs and fetch meal details
        const uniqueMealIds = [...new Set(instances.map(i => i.mealId))];

        // Fetch all meals to create a lookup map
        const mealsResponse = await fetchJson<{ meals: Meal[]; total: number; page: number; limit: number }>('/api/fuel/meals?limit=1000');
        const mealsMap = new Map<string, Meal>();
        mealsResponse.meals.forEach(meal => {
          mealsMap.set(meal.id, meal);
        });

        if (cancelled) return;
        setMeals(mealsMap);

      } catch (err: any) {
        if (!cancelled) {
          console.error('Failed to load meal history', err);
          setError(err.message || 'Failed to load meal history');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card shadow-black/20 shadow-lg p-6 border border-white/5 rounded-xl card-gradient">
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
    );
  }

  if (mealInstances.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center px-4 py-12 text-center">
        <Utensils className="mb-4 w-12 h-12 text-muted-foreground" />
        <h3 className="font-medium text-muted-foreground text-lg">No meal history</h3>
        <p className="mt-2 text-muted-foreground text-sm">
          Your meal history will appear here once you start logging meals.
        </p>
      </div>
    );
  }

  // Group meal instances by date (using local date components to avoid timezone issues)
  const groupedByDate: { [key: string]: MealInstance[] } = {};
  mealInstances.forEach(instance => {
    // Normalize to local date by extracting year, month, day in local timezone
    const localDate = new Date(instance.date);
    const year = localDate.getFullYear();
    const month = localDate.getMonth();
    const day = localDate.getDate();

    // Create a date key using local date components
    const dateKey = new Date(year, month, day).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }
    groupedByDate[dateKey].push(instance);
  });

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    // Find the first instance for each date to get the actual date
    const instanceA = groupedByDate[a][0];
    const instanceB = groupedByDate[b][0];
    return instanceB.date.getTime() - instanceA.date.getTime();
  });

  return (
    <div className="space-y-6 pb-6">
      {sortedDates.map((date) => (
        <div key={date} className="space-y-3">
          <h3 className="top-0 z-10 sticky py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
            {date}
          </h3>
          <div className="space-y-3">
            {groupedByDate[date]
              .sort((a, b) => {
                // Sort by timestamp if available, otherwise by date
                const timeA = a.timestamp?.getTime() || a.date.getTime();
                const timeB = b.timestamp?.getTime() || b.date.getTime();
                return timeB - timeA;
              })
              .map((instance) => {
                const meal = meals.get(instance.mealId);
                const mealName = meal?.name || 'Meal';

                return (
                  <MealInstanceCard
                    key={instance.id}
                    instance={instance}
                    mealName={mealName}
                  />
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}

function MealInstanceCard({ instance, mealName }: { instance: MealInstance; mealName: string }) {
  const getTime = () => {
    if (instance.timestamp) {
      return instance.timestamp.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit'
      });
    }
    return null;
  };

  const formatMacros = () => {
    if (!instance.macros) return null;
    const parts: string[] = [];
    if (instance.macros.protein) parts.push(`P: ${instance.macros.protein}g`);
    if (instance.macros.carbs) parts.push(`C: ${instance.macros.carbs}g`);
    if (instance.macros.fat) parts.push(`F: ${instance.macros.fat}g`);
    return parts.length > 0 ? parts.join(' • ') : null;
  };

  const macros = formatMacros();
  const time = getTime();

  return (
    <Link
      href={`/fuel/meals/instances/${instance.id}/edit`}
      className="block bg-card shadow-black/20 shadow-lg p-4 border border-white/5 rounded-xl active:scale-[0.98] transition-all card-gradient"
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-medium text-sm">{mealName}</h4>
            {time && (
              <span className="text-muted-foreground text-xs">{time}</span>
            )}

          </div>
          <div className="flex flex-wrap items-center gap-2">
            {instance.calories && (
              <span className="font-medium text-sm">
                {Math.round(instance.calories)} cal
              </span>
            )}
            {macros && (
              <p className="mt-1 text-muted-foreground text-xs">{macros}</p>
            )}
          </div>
          {instance.notes && (
            <p className="mt-1 text-muted-foreground text-xs italic">{instance.notes}</p>
          )}
        </div>
        <Pencil className="mt-0.5 w-4 h-4 text-muted-foreground shrink-0" />
      </div>
    </Link>
  );
}


