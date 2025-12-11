'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { ChevronLeft, Play, Loader2, Calendar, Clock, Dumbbell } from 'lucide-react';
import type {
  Workout,
  WorkoutInstance
} from '@/types/train';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

export default function ViewWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchJson<{ workout: Workout }>(
          `/api/train/workouts/${id}?details=true`
        );
        if (!cancelled) {
          setWorkout(res.workout);
        }
      } catch (err: any) {
        console.error('Failed to load workout', err);
        if (!cancelled) {
          setError(err?.message || 'Failed to load workout');
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
  }, [id]);

  async function handleStartWorkout() {
    if (!workout || starting) return;
    setStarting(true);
    try {
      const res = await fetchJson<{ workoutInstance: WorkoutInstance }>(
        '/api/train/workout-instances',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workoutId: workout.id,
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
      setStarting(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-background pb-20 min-h-screen">
        <div className="md:mx-auto px-4 md:px-6 pt-6 md:max-w-3xl">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="bg-background pb-20 min-h-screen">
        <div className="space-y-4 md:mx-auto px-4 md:px-6 pt-6 md:max-w-3xl">
          <button
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs"
            onClick={() => router.back()}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Train
          </button>
          <div className="bg-card p-4 border border-border rounded-lg">
            <p className="text-destructive text-sm">
              {error ?? 'Workout not found.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background pb-20 min-h-screen">
      <div className="md:mx-auto md:max-w-3xl">
        {/* Header */}
        <section className="px-4 md:px-6 pt-6 pb-4 border-border border-b">
          <button
            className="inline-flex items-center gap-1 mb-3 text-muted-foreground hover:text-foreground text-xs"
            onClick={() => router.back()}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Train
          </button>
          
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-brand-primary/10 px-2 py-0.5 rounded text-[10px] text-brand-primary uppercase tracking-wide font-medium">
                  {workout.workoutType}
                </span>
                {workout.estimatedDuration && (
                  <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                    <Clock className="w-3 h-3" />
                    {workout.estimatedDuration} min
                  </span>
                )}
              </div>
              <h1 className="mb-2 font-bold text-2xl">
                {workout.name || `${workout.workoutType} Workout`}
              </h1>
              {workout.description && (
                <p className="text-muted-foreground text-sm">
                  {workout.description}
                </p>
              )}
            </div>
            
            <Button 
              onClick={handleStartWorkout} 
              disabled={starting}
              className="shrink-0"
              size="lg"
            >
              {starting ? (
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              ) : (
                <Play className="mr-2 w-4 h-4" />
              )}
              Start Workout
            </Button>
          </div>

          {workout.objectives && workout.objectives.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {workout.objectives.map((obj) => (
                <span
                  key={obj}
                  className="bg-muted px-2 py-1 rounded-full text-[11px] text-muted-foreground"
                >
                  {obj}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Workout Structure */}
        <section className="space-y-4 px-4 md:px-6 py-6">
          <h2 className="font-semibold text-lg">Workout Structure</h2>
          
          {!workout.blocks?.length ? (
            <div className="bg-card p-8 border border-border border-dashed rounded-lg text-center">
              <p className="text-muted-foreground text-sm">
                No blocks configured for this workout.
              </p>
            </div>
          ) : (
            workout.blocks.map((block) => (
              <div
                key={block.id}
                className="bg-card border border-border rounded-lg overflow-hidden"
              >
                <div className="bg-muted/30 px-4 py-3 border-border border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                        {block.workoutBlockType}
                      </p>
                      <h3 className="font-medium text-sm">
                        {block.name || 'Block'}
                      </h3>
                    </div>
                    {block.estimatedDuration && (
                      <span className="text-[11px] text-muted-foreground">
                        ~{block.estimatedDuration} min
                      </span>
                    )}
                  </div>
                  {block.description && (
                    <p className="mt-1 text-muted-foreground text-xs">
                      {block.description}
                    </p>
                  )}
                </div>

                <div className="divide-y divide-border/50">
                  {block.exercises?.length ? (
                    block.exercises.map((ex, index) => (
                      <div key={ex.id} className="p-4 hover:bg-muted/5 transition-colors">
                        <div className="flex gap-4">
                          <div className="flex justify-center items-center bg-muted rounded w-12 h-12 shrink-0 text-muted-foreground font-medium text-sm">
                             {/* Placeholder for exercise image or rank */}
                             {index + 1}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {ex.exercise.name}
                            </h4>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-muted-foreground text-xs">
                              <span className="font-medium text-foreground">
                                {ex.sets} sets
                              </span>
                              
                              {ex.measures.reps && (
                                <span>{ex.measures.reps} reps</span>
                              )}
                              
                              {ex.measures.time && (
                                <span>
                                  {ex.measures.time.value}{ex.measures.time.unit}
                                </span>
                              )}
                              
                              {ex.measures.distance && (
                                <span>
                                  {ex.measures.distance.value}{ex.measures.distance.unit}
                                </span>
                              )}

                              {ex.restTime && (
                                <span className="text-muted-foreground/70">
                                  Rest: {ex.restTime}s
                                </span>
                              )}
                            </div>
                            
                            {ex.notes && (
                              <p className="mt-1.5 text-muted-foreground text-xs italic">
                                {ex.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground text-xs italic">
                      No exercises in this block
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
