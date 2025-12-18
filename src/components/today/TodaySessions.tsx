'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import type { Workout, WorkoutInstance } from '@/types/train';
import { CheckCircle2, Loader2, Play } from 'lucide-react';

type ApiListResponse<T> = { [key: string]: T[] };

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json();
}

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

  function handleSelect(workoutId: string) {
    setSelectedWorkoutId(workoutId || null);
  }

  async function handleStart() {
    if (!selectedWorkoutId || startingWorkoutId) return;

    setStartingWorkoutId(selectedWorkoutId);
    try {
      const res = await fetchJson<{ workoutInstance: WorkoutInstance }>(
        '/api/train/workout/instances',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workoutId: selectedWorkoutId,
            date: new Date().toISOString().split('T')[0],
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
  const todayString = new Date().toISOString().split('T')[0];
  const completedTodayInstance = instances.find(i => {
    const iDate = new Date(i.date).toISOString().split('T')[0];
    return i.complete && iDate === todayString;
  });

  if (isLoading) {
    return <div className="flex justify-center items-center p-8 w-full h-full text-muted-foreground text-center"><Loader2 className="w-8 h-8 text-brand-primary animate-spin" /></div>;
  }

  if (loadError) {
    return <div className="p-8 text-destructive text-center">Error: {loadError}</div>;
  }

  // CASE 1: In Progress
  if (inProgressInstance) {
    const workoutName = inProgressInstance.workout?.name || 'Workout';
    return (
      <div className="bg-card shadow-sm p-6 border border-border rounded-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="inline-block bg-primary/10 mb-2 px-2 py-1 rounded font-medium text-primary text-xs">
              In Progress
            </span>
            <h3 className="font-bold text-xl">{workoutName}</h3>
            <p className="text-muted-foreground text-sm">
              Started {new Date(inProgressInstance.date).toLocaleDateString()}
            </p>
          </div>
          <Play className="bg-primary/10 p-2 rounded-full w-10 h-10 text-primary" />
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="primary" 
            fullWidth
            onClick={() => router.push(`/train/session/${inProgressInstance.id}`)}
          >
            Resume Workout
          </Button>
        </div>
      </div>
    );
  }

  // CASE 2: Completed Today
  if (completedTodayInstance && !showPrompt) {
    const workoutName = completedTodayInstance.workout?.name || 'Workout';
    return (
      <div className="bg-card shadow-sm p-6 border border-border rounded-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="inline-block bg-success/10 mb-2 px-2 py-1 rounded font-medium text-success text-xs">
              Completed
            </span>
            <h3 className="font-bold text-xl">{workoutName}</h3>
            <p className="text-muted-foreground text-sm">
              Great job! You finished this workout today.
            </p>
          </div>
          <CheckCircle2 className="bg-success/10 p-2 rounded-full w-10 h-10 text-success" />
        </div>
        
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
            Run it Back
          </Button>
        </div>
      </div>
    );
  }

  // CASE 3: Prompt to start (Default)
  // Simplified single card
  const selected = selectedWorkoutId ? workoutsById.get(selectedWorkoutId) : null;
  const isStarting = selectedWorkoutId && startingWorkoutId === selectedWorkoutId;

  return (
    <div className="bg-card p-4 border border-border rounded-lg">
      <div className="mb-3">
        <h3 className="mb-1 font-semibold">
          {selected
            ? selected.name || `${selected.workoutType} Workout`
            : "Start"}
        </h3>
        <p className="text-muted-foreground text-sm">
          {selected?.estimatedDuration
            ? `~${selected.estimatedDuration} min`
            : 'Select a workout'}
        </p>
      </div>

      <div className="space-y-3">
        <select
          className="bg-background px-3 py-2 border border-border rounded w-full text-sm"
          disabled={isLoading || !!startingWorkoutId}
          value={selectedWorkoutId || ''}
          onChange={(e) => handleSelect(e.target.value)}
        >
          <option value="">Choose a workout...</option>
          {workouts.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name || `${w.workoutType} Workout`}
              {w.estimatedDuration ? ` (${w.estimatedDuration} min)` : ''}
            </option>
          ))}
        </select>

        <Button
          variant="primary"
          fullWidth
          disabled={!selectedWorkoutId || !!startingWorkoutId}
          onClick={handleStart}
        >
          {isStarting ? 'Starting...' : 'Start Session'}
        </Button>
      </div>
    </div>
  );
}
