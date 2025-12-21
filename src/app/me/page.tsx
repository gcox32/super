'use client';

import { useEffect, useState } from 'react';
import { Loader2, Settings } from 'lucide-react';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';
import { UserProfile } from '@/types/user';
import { WorkoutInstance } from '@/types/train';
import OverviewTab from '@/components/me/OverviewTab';
import HistoryTab from '@/components/me/HistoryTab';
import PerformanceTab from '@/components/me/PerformanceTab';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Failed to fetch');
  }
  return res.json();
}

type Tab = 'overview' | 'history' | 'performance';

export default function MePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [workoutDates, setWorkoutDates] = useState<Date[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Load data
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // Fetch user profile and workout instances
        const [profileRes, instancesRes] = await Promise.all([
          fetchJson<{ profile: UserProfile }>('/api/me/profile'),
          fetchJson<{ workoutInstances: WorkoutInstance[] }>(
            `/api/train/workouts/instances?dateFrom=${firstDayOfMonth.toISOString()}&dateTo=${lastDayOfMonth.toISOString()}`
          )
        ]);
        
        if (cancelled) return;
        setProfile(profileRes.profile);
        setWorkoutDates(instancesRes.workoutInstances.map(i => new Date(i.date)));

      } catch (err: any) {
        if (!cancelled) {
          console.error('Failed to load data', err);
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
      <PageLayout
        title="Profile"
      >
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Profile"
      action={
        <Link href="/me/preferences" className="text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="w-6 h-6" />
        </Link>
      }
    >
      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'overview'
              ? 'border-brand-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'history'
              ? 'border-brand-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'performance'
              ? 'border-brand-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Performance
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && <OverviewTab profile={profile} workoutDates={workoutDates} />}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'performance' && <PerformanceTab />}
      </div>

    </PageLayout>
  );
}
