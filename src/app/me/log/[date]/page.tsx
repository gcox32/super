'use client';

import { useEffect, useState, use } from 'react';
import { Loader2, Dumbbell, Activity, Utensils, Moon, Droplets } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { WorkoutInstance } from '@/types/train';
import { UserStats } from '@/types/user';
import { MealInstance, SleepInstance, WaterIntake } from '@/types/fuel';
import Link from 'next/link';
import { format } from 'date-fns';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Failed to fetch');
  }
  return res.json();
}

interface DayLogData {
  workoutInstances: WorkoutInstance[];
  stats: UserStats[];
  mealInstances: MealInstance[];
  waterIntakes: WaterIntake[];
  sleepInstances: SleepInstance[];
}

export default function DayLogPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = use(params);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DayLogData>({
    workoutInstances: [],
    stats: [],
    mealInstances: [],
    waterIntakes: [],
    sleepInstances: []
  });

  const parsedDate = new Date(decodeURIComponent(date));
  // Parse YYYY-MM-DD manually to create local date object
  const [year, month, day] = decodeURIComponent(date).split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  
  const dateStr = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        const startOfDay = new Date(dateObj);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(dateObj);
        endOfDay.setHours(23, 59, 59, 999);

        const queryStr = `?dateFrom=${startOfDay.toISOString()}&dateTo=${endOfDay.toISOString()}`;

        // - workouts: /api/train/workouts/instances
        // - stats: /api/me/stats (usually returns all, might need filtering client side if no date param support)
        // - meals: /api/fuel/meal-instances
        // - water: /api/fuel/water-intake
        // - sleep: /api/fuel/sleep
        
        const [workoutsRes, statsRes, mealsRes, waterRes, sleepRes] = await Promise.allSettled([
          fetchJson<{ workoutInstances: WorkoutInstance[] }>(`/api/train/workouts/instances${queryStr}`),
          fetchJson<{ stats: UserStats[] }>('/api/me/stats'), // Fetches all, will filter
          fetchJson<{ mealInstances: MealInstance[] }>(`/api/fuel/meal-instances${queryStr}`),
          fetchJson<{ waterIntakes: WaterIntake[] }>(`/api/fuel/water-intake${queryStr}`),
          fetchJson<{ sleepInstances: SleepInstance[] }>(`/api/fuel/sleep${queryStr}`)
        ]);

        if (cancelled) return;

        const workouts = workoutsRes.status === 'fulfilled' ? workoutsRes.value.workoutInstances : [];
        
        // Filter stats for this day
        const allStats = statsRes.status === 'fulfilled' ? statsRes.value.stats : [];
        const dayStats = allStats.filter(s => {
          const sDate = new Date(s.date);
          // Compare dates ensuring we match the visual date
          // For stats, the date stored is likely just YYYY-MM-DD or midnight UTC
          // We should compare the date parts
          return sDate.getDate() === dateObj.getDate() && 
                 sDate.getMonth() === dateObj.getMonth() && 
                 sDate.getFullYear() === dateObj.getFullYear();
        });

        const meals = mealsRes.status === 'fulfilled' ? mealsRes.value.mealInstances : [];
        const water = waterRes.status === 'fulfilled' ? waterRes.value.waterIntakes : [];
        const sleep = sleepRes.status === 'fulfilled' ? sleepRes.value.sleepInstances : [];

        setData({
          workoutInstances: workouts,
          stats: dayStats,
          mealInstances: meals,
          waterIntakes: water,
          sleepInstances: sleep
        });

      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load day logs', err);
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
  }, [date]);

  if (loading) {
    return (
      <PageLayout title="Daily Log" breadcrumbHref="/me" breadcrumbText="Profile">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Daily Log" 
      subtitle={dateStr}
      breadcrumbHref="/me" 
      breadcrumbText="Profile"
    >
      <div className="flex flex-col gap-6">
        
        {/* Workouts Section */}
        <section className="bg-card p-4 border border-border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="w-5 h-5 text-brand-primary" />
            <h3 className="font-semibold text-lg">Workouts</h3>
          </div>
          
          {data.workoutInstances.length > 0 ? (
            <div className="flex flex-col gap-3">
              {data.workoutInstances.map(instance => (
                <Link 
                  key={instance.id} 
                  href={`/log/workouts/${instance.id}`}
                  className="block bg-muted/30 hover:bg-muted/50 p-3 border border-border rounded transition-colors"
                >
                  <p className="font-medium">{instance.workout?.name || 'Untitled Workout'}</p>
                  <p className="mt-1 text-muted-foreground text-xs">
                    {format(new Date(instance.date), 'h:mm a')}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No workouts recorded for this day.</p>
          )}
        </section>

        {/* Body Stats Section */}
        <section className="bg-card p-4 border border-border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-lg">Body Stats</h3>
          </div>
          
          {data.stats.length > 0 ? (
            <div className="flex flex-col gap-3">
              {data.stats.map(stat => (
                <div key={stat.id} className="bg-muted/30 p-3 border border-border rounded">
                  <div className="gap-2 grid grid-cols-2 text-sm">
                    {stat.weight && (
                      <div>
                        <span className="text-muted-foreground">Weight:</span>{' '}
                        <span className="font-medium">{stat.weight.value} {stat.weight.unit}</span>
                      </div>
                    )}
                    {stat.bodyFatPercentage && (
                      <div>
                        <span className="text-muted-foreground">Body Fat:</span>{' '}
                        <span className="font-medium">{stat.bodyFatPercentage.value}%</span>
                      </div>
                    )}
                    {/* Add other stats as needed */}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No measurements recorded.</p>
          )}
        </section>

        {/* Nutrition Placeholder (Meals) */}
        <section className="bg-card p-4 border border-border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Utensils className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-lg">Nutrition</h3>
          </div>
          {data.mealInstances.length > 0 ? (
             <div className="flex flex-col gap-3">
                {/* Future implementation: List meals */}
                <p className="text-sm">{data.mealInstances.length} meals recorded</p>
             </div>
          ) : (
            <p className="text-muted-foreground text-sm">No meals recorded (Coming soon).</p>
          )}
        </section>

         {/* Hydration Placeholder (Water) */}
         <section className="bg-card p-4 border border-border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Droplets className="w-5 h-5 text-cyan-500" />
            <h3 className="font-semibold text-lg">Hydration</h3>
          </div>
          {data.waterIntakes.length > 0 ? (
             <div className="flex flex-col gap-3">
                 <p className="text-sm">{data.waterIntakes.length} records</p>
             </div>
          ) : (
            <p className="text-muted-foreground text-sm">No water intake recorded (Coming soon).</p>
          )}
        </section>

         {/* Sleep Placeholder */}
         <section className="bg-card p-4 border border-border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Moon className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-lg">Sleep</h3>
          </div>
          {data.sleepInstances.length > 0 ? (
             <div className="flex flex-col gap-3">
                 <p className="text-sm">{data.sleepInstances.length} sleep records</p>
             </div>
          ) : (
            <p className="text-muted-foreground text-sm">No sleep recorded (Coming soon).</p>
          )}
        </section>

      </div>
    </PageLayout>
  );
}

