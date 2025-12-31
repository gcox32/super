'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { calculateFuelRecommendations } from '@/lib/fuel/recommendations';
import type { UserProfile } from '@/types/user';
import type { FuelRecommendations } from '@/lib/fuel/recommendations';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Failed to fetch');
  }
  return res.json();
}

const COLORS = {
  protein: '#3b82f6', // blue
  carbs: '#10b981',   // green
  fat: '#f59e0b',      // amber
};

export default function TargetsTab() {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<FuelRecommendations | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Fetch profile, goals, and latest stats
        const [profileRes, goalsRes, statsRes] = await Promise.all([
          fetchJson<{ profile: UserProfile }>('/api/me/profile'),
          fetchJson<{ goals: any[] }>('/api/me/goals'),
          fetchJson<{ stats: any[] }>('/api/me/stats?latest=true'),
        ]);

        if (cancelled) return;

        const profile = profileRes.profile;
        if (!profile) {
          setError('Profile not found. Please complete your profile setup.');
          return;
        }

        // Add goals and latest stats to profile
        // statsRes.stats is now an array, so get the first item
        const profileWithData = {
          ...profile,
          goals: goalsRes.goals,
          latestStats: statsRes.stats?.[0] || undefined,
        };

        // Calculate recommendations
        const recs = calculateFuelRecommendations(profileWithData);
        setRecommendations(recs);

      } catch (err: any) {
        if (!cancelled) {
          console.error('Failed to load recommendations', err);
          setError(err.message || 'Failed to load recommendations');
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
      <div className="bg-card p-6">
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
    );
  }

  if (!recommendations || !recommendations.calorieTarget || !recommendations.macros) {
    return (
      <div className="bg-card p-6">
        <p className="text-muted-foreground text-sm">
          Unable to calculate recommendations. Please ensure you have completed your profile with height, weight, gender, and birth date.
        </p>
      </div>
    );
  }

  const { bmr, tdee, calorieTarget, macros } = recommendations;

  // Calculate macro calories for pie chart
  const proteinCalories = (macros.protein || 0) * 4;
  const carbsCalories = (macros.carbs || 0) * 4;
  const fatCalories = (macros.fat || 0) * 9;

  const pieData = [
    { name: 'Protein', value: proteinCalories, grams: macros.protein || 0 },
    { name: 'Carbs', value: carbsCalories, grams: macros.carbs || 0 },
    { name: 'Fat', value: fatCalories, grams: macros.fat || 0 },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background shadow-lg p-3 border border-border rounded-(--radius)">
          <p className="font-medium text-sm">{data.name}</p>
          <p className="mt-1 text-muted-foreground text-xs">
            {data.payload.grams}g ({data.value} cal)
          </p>
          <p className="text-muted-foreground text-xs">
            {((data.value / calorieTarget) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if slice is large enough (more than 5%)
    if ((percent || 0) < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-semibold text-xs"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
      >
        {`${name} ${((percent || 0) * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* Hero: Daily Calorie Target with Donut Chart */}
      <div className="bg-card p-6">
        {/* Donut chart with calorie target in center */}
        <div className="relative">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                innerRadius={80}
                outerRadius={110}
                fill="#8884d8"
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((entry, index) => {
                  const colorKey = entry.name.toLowerCase() as keyof typeof COLORS;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[colorKey] || '#8884d8'}
                    />
                  );
                })}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center content - Calorie Target */}
          <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
            <p className="font-medium text-muted-foreground text-sm">Daily Goal</p>
            <p className="font-bold text-5xl tracking-tight">{calorieTarget?.toLocaleString() || '—'}</p>
            <p className="text-muted-foreground text-sm">calories</p>
          </div>
        </div>

        {/* Supporting stats: BMR & TDEE */}
        <div className="flex justify-center gap-8 mt-4 pt-4 border-white/5 border-t">
          <div className="text-center">
            <p className="font-semibold text-2xl">{bmr?.toLocaleString() || '—'}</p>
            <p className="text-muted-foreground text-xs">BMR</p>
          </div>
          <div className="bg-white/10 w-px" />
          <div className="text-center">
            <p className="font-semibold text-2xl">{tdee?.toLocaleString() || '—'}</p>
            <p className="text-muted-foreground text-xs">TDEE</p>
          </div>
        </div>
      </div>

      {/* Macro Breakdown Cards */}
      <div className="gap-3 grid grid-cols-3">
        <div className="bg-card p-4 !border-blue-500/20 text-center">
          <div className="inline-flex justify-center items-center bg-blue-500/15 mb-2 rounded-full w-10 h-10">
            <div className="rounded-full w-4 h-4" style={{ backgroundColor: COLORS.protein }} />
          </div>
          <p className="font-bold text-2xl">{macros.protein || '—'}<span className="font-normal text-muted-foreground text-base">g</span></p>
          <p className="mt-1 text-muted-foreground text-xs">Protein</p>
          <p className="mt-0.5 text-blue-400 text-xs">{((proteinCalories / calorieTarget) * 100).toFixed(0)}%</p>
        </div>

        <div className="bg-card p-4 !border-emerald-500/20 text-center">
          <div className="inline-flex justify-center items-center bg-emerald-500/15 mb-2 rounded-full w-10 h-10">
            <div className="rounded-full w-4 h-4" style={{ backgroundColor: COLORS.carbs }} />
          </div>
          <p className="font-bold text-2xl">{macros.carbs || '—'}<span className="font-normal text-muted-foreground text-base">g</span></p>
          <p className="mt-1 text-muted-foreground text-xs">Carbs</p>
          <p className="mt-0.5 text-emerald-400 text-xs">{((carbsCalories / calorieTarget) * 100).toFixed(0)}%</p>
        </div>

        <div className="bg-card p-4 !border-amber-500/20 text-center">
          <div className="inline-flex justify-center items-center bg-amber-500/15 mb-2 rounded-full w-10 h-10">
            <div className="rounded-full w-4 h-4" style={{ backgroundColor: COLORS.fat }} />
          </div>
          <p className="font-bold text-2xl">{macros.fat || '—'}<span className="font-normal text-muted-foreground text-base">g</span></p>
          <p className="mt-1 text-muted-foreground text-xs">Fat</p>
          <p className="mt-0.5 text-amber-400 text-xs">{((fatCalories / calorieTarget) * 100).toFixed(0)}%</p>
        </div>
      </div>
    </div>
  );
}

