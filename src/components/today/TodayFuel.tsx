'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { TodayCard, TodayCardHeader, TodayCardContent } from '@/components/ui/TodayCard';
import type { MealInstance } from '@/types/fuel';
import type { UserProfile } from '@/types/user';
import { Utensils, Target, Mic } from 'lucide-react';
import { fetchJson } from '@/lib/train/helpers';
import { calculateFuelRecommendations } from '@/lib/fuel/recommendations';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function TodayFuel() {
  const router = useRouter();
  const [instances, setInstances] = useState<MealInstance[]>([]);
  const [recommendations, setRecommendations] = useState<{
    calorieTarget?: number;
    macros?: { protein?: number };
  } | null>(null);
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

        const [instancesData, profileRes, goalsRes, statsRes] = await Promise.all([
          fetchJson<MealInstance[]>(
            `/api/fuel/meals/instances?dateFrom=${startOfDay.toISOString()}&dateTo=${endOfDay.toISOString()}`
          ),
          fetchJson<{ profile: UserProfile }>('/api/me/profile'),
          fetchJson<{ goals: any[] }>('/api/me/goals'),
          fetchJson<{ stats: any[] }>('/api/me/stats?latest=true'),
        ]);

        if (cancelled) return;

        // Convert date strings to Date objects
        const instancesWithDates = instancesData.map(instance => ({
          ...instance,
          date: new Date(instance.date),
          timestamp: instance.timestamp ? new Date(instance.timestamp) : null,
        }));

        setInstances(instancesWithDates);

        // Calculate recommendations
        const profile = profileRes.profile;
        if (profile) {
          const profileWithData = {
            ...profile,
            goals: goalsRes.goals,
            latestStats: statsRes.stats?.[0] || undefined,
          };
          const recs = calculateFuelRecommendations(profileWithData);
          setRecommendations(recs);
        }
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

  // Calculate current day totals
  const currentCalories = instances.reduce((sum, instance) => sum + (instance.calories || 0), 0);
  const currentProtein = instances.reduce((sum, instance) => sum + (instance.macros?.protein || 0), 0);

  const calorieTarget = recommendations?.calorieTarget || 0;
  const proteinTarget = recommendations?.macros?.protein || 0;

  // Calculate what's left (remaining)
  const caloriesLeft = Math.max(0, calorieTarget - currentCalories);
  const proteinLeft = Math.max(0, proteinTarget - currentProtein);

  // Calculate percentage consumed
  const caloriePercentage = calorieTarget > 0 ? Math.min(100, (currentCalories / calorieTarget) * 100) : 0;
  const proteinPercentage = proteinTarget > 0 ? Math.min(100, (currentProtein / proteinTarget) * 100) : 0;

  // Data for donut charts - show consumed vs remaining
  // Always show both segments, even if one is 0, to maintain the donut shape
  const calorieData = calorieTarget > 0
    ? [
        { name: 'consumed', value: currentCalories, fill: '#6b7280' },
        { name: 'remaining', value: caloriesLeft, fill: '#1f2937' },
      ]
    : [{ name: 'empty', value: 100, fill: '#1f2937' }];

  const proteinData = proteinTarget > 0
    ? [
        { name: 'consumed', value: currentProtein, fill: '#3b82f6' },
        { name: 'remaining', value: proteinLeft, fill: '#1f2937' },
      ]
    : [{ name: 'empty', value: 100, fill: '#1f2937' }];

  return (
    <TodayCard isLoading={isLoading} error={loadError || undefined}>
      <TodayCardHeader
        title="Today's Food"
        iconVariant="primary"
      />
      <TodayCardContent>
        <div className="flex items-center gap-4 h-full">
          {/* Left side: Stats */}
          <div className="flex-1 space-y-4">
            {/* Calories */}
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full w-1 h-12" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="opacity-30 w-2 h-2 text-muted-foreground" />
                  <span className="text-muted-foreground text-xs">{caloriePercentage.toFixed(0)}%</span>
                </div>
                <div className="font-bold text-white text-2xl">
                  {Math.round(caloriesLeft)}
                </div>
                <div className="text-muted-foreground text-xs">
                  Calories Left
                </div>
              </div>
            </div>

            {/* Protein */}
            <div className="flex items-center gap-3">
              <div className="bg-brand-primary rounded-full w-1 h-12" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="opacity-30 w-2 h-2 text-muted-foreground" />
                  <span className="text-muted-foreground text-xs">{proteinPercentage.toFixed(0)}%</span>
                </div>
                <div className="font-bold text-white text-2xl">
                  {Math.round(proteinLeft)}
                </div>
                <div className="text-muted-foreground text-xs">
                  Protein Left (g)
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Donut Chart */}
          <div className="relative w-32 h-32 shrink-0">
            <ResponsiveContainer width={128} height={128}>
              <PieChart>
                {/* Outer ring: Calories */}
                <Pie
                  data={calorieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={64}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                >
                  {calorieData.map((entry, index) => (
                    <Cell key={`calorie-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                {/* Inner ring: Protein */}
                <Pie
                  data={proteinData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={40}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                >
                  {proteinData.map((entry, index) => (
                    <Cell key={`protein-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex gap-8 mt-4 w-full">
          <Button
            variant="primary"
            fullWidth
            onClick={() => router.push('/fuel?tab=record')}
            className="flex-1"
          >
            Manual Log
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => router.push('/fuel/voice-journal')}
            className="w-auto aspect-square"
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>
      </TodayCardContent>
    </TodayCard>
  );
}

