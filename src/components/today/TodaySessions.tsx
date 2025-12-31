'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { TodayCard, TodayCardHeader, TodayCardContent } from '@/components/ui/TodayCard';
import { WorkoutAutocomplete } from '@/components/train/build/workouts/WorkoutAutocomplete';
import type { Workout, WorkoutInstance } from '@/types/train';
import { getLocalDateString } from '@/lib/utils';
import { CheckCircle2, Play } from 'lucide-react';
import { fetchJson } from '@/lib/train/helpers';

type ApiListResponse<T> = { [key: string]: T[] };

export default function TodaySessions() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [instances, setInstances] = useState<WorkoutInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [startingWorkoutId, setStartingWorkoutId] = useState<string | null>(
    null
  );
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const [workoutsData, instancesData] = await Promise.all([
          fetchJson<ApiListResponse<Workout>>('/api/train/workouts'),
          fetchJson<{ workoutInstances: WorkoutInstance[] }>(`/api/train/workouts/instances?dateFrom=${yesterday.toISOString()}`)
        ]);

        if (cancelled) return;
        setWorkouts(workoutsData.workouts || []);
        setInstances(instancesData.workoutInstances || []);
      } catch (err: any) {
        console.error('Failed to load data for Today page', err);
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

  const workoutsById = new Map(workouts.map((w) => [w.id, w]));

  function handleSelect(workout: Workout | null) {
    setSelectedWorkoutId(workout?.id || null);
  }

  async function handleStart() {
    if (!selectedWorkoutId || startingWorkoutId) return;

    setStartingWorkoutId(selectedWorkoutId);
    try {
      const res = await fetchJson<{ workoutInstance: WorkoutInstance }>(
        '/api/train/workouts/instances',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workoutId: selectedWorkoutId,
            date: getLocalDateString(),
            complete: false,
          }),
        }
      );
      if (!res.workoutInstance?.id) {
        throw new Error('Failed to create workout instance - no ID returned');
      }

      router.push(`/train/session/${res.workoutInstance.id}`);
    } catch (err: any) {
      console.error('Failed to start workout', err);
      alert('Failed to start workout. Please try again.');
      setStartingWorkoutId(null);
    }
  }

  // Identify status
  // 1. In Progress: Find most recent incomplete instance
  const inProgressInstance = instances.find(i => !i.complete);

  // 2. Completed Today: Find instance completed today
  const todayString = getLocalDateString().split('T')[0];
  const completedTodayInstance = instances.find(i => {
    // Convert the stored UTC instance date to a Local String before comparing
    const iDate = getLocalDateString(new Date(i.date)).split('T')[0];
    return i.complete && iDate === todayString;
  });

  // CASE 1: In Progress
  if (inProgressInstance) {
    const workoutName = inProgressInstance.workout?.name || 'Workout';
    return (
      <TodayCard isLoading={isLoading} error={loadError || undefined}>
        <TodayCardHeader
          badge={{ label: 'In Progress', variant: 'primary' }}
          title={workoutName}
          subtitle={`Started ${new Date(inProgressInstance.date).toLocaleDateString()}`}
          icon={Play}
          iconVariant="primary"
        />
        <TodayCardContent>
          <div className="flex gap-3">
            <Button
              variant="primary"
              fullWidth
              onClick={() => router.push(`/train/session/${inProgressInstance.id}`)}
            >
              Resume Workout
            </Button>
          </div>
        </TodayCardContent>
      </TodayCard>
    );
  }

  // CASE 2: Completed Today
  if (completedTodayInstance && !showPrompt) {
    const workoutName = completedTodayInstance.workout?.name || 'Workout';
    return (
      <TodayCard isLoading={isLoading} error={loadError || undefined}>
        <TodayCardHeader
          badge={{ label: 'Completed', variant: 'success' }}
          title={workoutName}
          subtitle="You hit this workout today."
          icon={CheckCircle2}
          iconVariant="success"
        />
        <TodayCardContent>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => router.push(`/log/workouts/${completedTodayInstance.id}`)}
            >
              View Summary
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowPrompt(true)}
            >
              Start New
            </Button>
          </div>
        </TodayCardContent>
      </TodayCard>
    );
  }

  // CASE 3: Prompt to start (Default)
  const selected = selectedWorkoutId ? workoutsById.get(selectedWorkoutId) : null;
  const isStarting = selectedWorkoutId && startingWorkoutId === selectedWorkoutId;

  return (
    <TodayCard isLoading={isLoading} error={loadError || undefined}>
      <TodayCardHeader
        title="Get to Work"
        subtitle="Pick something"
      />
      <TodayCardContent>
        <div className="space-y-3">
          <div className={isLoading || !!startingWorkoutId ? 'opacity-50 pointer-events-none' : ''}>
            <WorkoutAutocomplete
              initialWorkoutId={selectedWorkoutId || undefined}
              onChange={handleSelect}
            />
          </div>

          <Button
            variant="primary"
            fullWidth
            disabled={!selectedWorkoutId || !!startingWorkoutId}
            onClick={handleStart}
          >
            {isStarting ? 'Starting...' : 'Start Workout'}
          </Button>
        </div>
      </TodayCardContent>
    </TodayCard>
  );
}
