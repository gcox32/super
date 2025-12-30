'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import type { Meal, MealInstance } from '@/types/fuel';
import { Utensils, Loader2, Plus } from 'lucide-react';
import { fetchJson } from '@/lib/train/helpers';

export default function TodayFuel() {
  const router = useRouter();
  const [meals, setMeals] = useState<Map<string, Meal>>(new Map());
  const [instances, setInstances] = useState<MealInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        const [instancesData, mealsData] = await Promise.all([
          fetchJson<MealInstance[]>(
            `/api/fuel/meals/instances?dateFrom=${startOfDay.toISOString()}&dateTo=${endOfDay.toISOString()}`
          ),
          fetchJson<{ meals: Meal[]; total: number; page: number; limit: number }>(
            '/api/fuel/meals?limit=1000'
          )
        ]);

        if (cancelled) return;

        // Convert date strings to Date objects
        const instancesWithDates = instancesData.map(instance => ({
          ...instance,
          date: new Date(instance.date),
          timestamp: instance.timestamp ? new Date(instance.timestamp) : null,
        }));

        setInstances(instancesWithDates);

        // Create meals map
        const mealsMap = new Map<string, Meal>();
        mealsData.meals.forEach(meal => {
          mealsMap.set(meal.id, meal);
        });
        setMeals(mealsMap);
      } catch (err: any) {
        console.error('Failed to load meal data for Today page', err);
        if (!cancelled) {
          setLoadError(err?.message || 'Failed to load data');
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

  if (loadError) {
    return (
      <div className="bg-card shadow-sm p-6 border border-border rounded-lg h-[160px] flex items-center justify-center text-destructive">
        Error loading meal data
      </div>
    );
  }

  // Sort instances by timestamp (most recent first) or by date
  const sortedInstances = [...instances].sort((a, b) => {
    const timeA = a.timestamp?.getTime() || a.date.getTime();
    const timeB = b.timestamp?.getTime() || b.date.getTime();
    return timeB - timeA;
  });

  // CASE 1: Meals logged today
  if (sortedInstances.length > 0) {
    return (
      <div className="bg-card shadow-sm p-6 border border-border rounded-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="inline-block bg-primary/10 mb-2 px-2 py-1 rounded font-medium text-primary text-xs">
              {sortedInstances.length} {sortedInstances.length === 1 ? 'Meal' : 'Meals'} Logged
            </span>
            <h3 className="font-bold text-xl">Today's Meals</h3>
            <p className="text-muted-foreground text-sm">
              Keep up the great work!
            </p>
          </div>
          <Utensils className="bg-primary/10 p-2 rounded-full w-10 h-10 text-primary" />
        </div>

        <div className="space-y-2 mb-4">
          {sortedInstances.slice(0, 3).map((instance) => {
            const meal = meals.get(instance.mealId);
            const mealName = meal?.name || 'Meal';
            const time = instance.timestamp
              ? instance.timestamp.toLocaleTimeString(undefined, {
                  hour: 'numeric',
                  minute: '2-digit'
                })
              : null;

            return (
              <div
                key={instance.id}
                className="bg-muted/30 p-3 rounded border border-border"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{mealName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {instance.calories && (
                        <span className="text-muted-foreground text-xs">
                          {Math.round(instance.calories)} cal
                        </span>
                      )}
                      {time && (
                        <span className="text-muted-foreground text-xs">• {time}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {sortedInstances.length > 3 && (
            <p className="text-muted-foreground text-xs text-center pt-1">
              +{sortedInstances.length - 3} more
            </p>
          )}
        </div>

        <Button
          variant="primary"
          fullWidth
          onClick={() => router.push('/fuel')}
        >
          Log More Meals
        </Button>
      </div>
    );
  }

  // CASE 2: No meals logged today (Default)
  return (
    <div className="bg-card p-4 border border-border rounded-lg">
      <div className="mb-3">
        <h3 className="mb-1 font-semibold">
          Track Your Meals
        </h3>
        <p className="text-muted-foreground text-sm">
          Log what you've eaten today
        </p>
      </div>

      <Button
        variant="primary"
        fullWidth
        onClick={() => router.push('/fuel')}
      >
        <Plus className="w-4 h-4 mr-2" />
        Log Meals
      </Button>
    </div>
  );
}

