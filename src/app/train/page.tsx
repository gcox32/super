'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Play, Calendar, Loader2, Trash, Eye } from 'lucide-react';
import type {
  ProtocolInstance,
  Workout,
  WorkoutInstance,
  Protocol,
  Phase,
  PhaseInstance,
} from '@/types/train';
import { fetchJson, formatDate, timeToMinutes, formatMinutesAsHours } from '@/lib/train/helpers';

type ApiListResponse<T> = { [key: string]: T[] };

export default function TrainPage() {
  const router = useRouter();
  const [activeProtocolInstance, setActiveProtocolInstance] =
    useState<ProtocolInstance | null>(null);
  const [activeProtocol, setActiveProtocol] = useState<Protocol | null>(null);
  const [activePhaseInstance, setActivePhaseInstance] = useState<PhaseInstance | null>(null);
  const [activePhase, setActivePhase] = useState<Phase | null>(null);
  const [phaseWorkouts, setPhaseWorkouts] = useState<Workout[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [recentWorkoutInstances, setRecentWorkoutInstances] = useState<
    WorkoutInstance[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startingWorkoutId, setStartingWorkoutId] = useState<string | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday start

        const [protocolInstancesRes, workoutsRes, workoutInstancesRes] =
          await Promise.all([
            fetchJson<ApiListResponse<ProtocolInstance>>(
              '/api/train/protocols/instances?activeOnly=true'
            ),
            fetchJson<ApiListResponse<Workout>>('/api/train/workouts'),
            fetchJson<ApiListResponse<WorkoutInstance>>(
              `/api/train/workouts/instances?dateFrom=${startOfWeek.toISOString()}`
            ),
          ]);

        if (cancelled) return;

        const protocolInstances =
          (protocolInstancesRes.instances as ProtocolInstance[]) ?? [];

        const activeInstance = protocolInstances[0] ?? null;
        setActiveProtocolInstance(activeInstance);
        setWorkouts((workoutsRes.workouts as Workout[]) ?? []);
        setRecentWorkoutInstances(
          (workoutInstancesRes.workoutInstances as WorkoutInstance[]) ?? []
        );

        if (activeInstance) {
          // Get protocol with phases
          const protocolRes = await fetchJson<{ protocol: Protocol }>(
            `/api/train/protocols/${activeInstance.protocolId}`
          );

          if (cancelled) return;
          setActiveProtocol(protocolRes.protocol);

          // Get phases for the protocol
          const phasesRes = await fetchJson<{ phases: Phase[] }>(
            `/api/train/protocols/${activeInstance.protocolId}/phases`
          );

          if (cancelled) return;
          const phases = phasesRes.phases || [];

          // Get active phase instance
          const phaseInstancesRes = await fetchJson<{ phaseInstances: PhaseInstance[] }>(
            `/api/train/protocols/${activeInstance.protocolId}/instances/${activeInstance.id}/phase-instances`
          );

          if (cancelled) return;
          const activePhaseInst = phaseInstancesRes.phaseInstances.find(
            (pi: PhaseInstance) => pi.active && !pi.complete
          ) || phaseInstancesRes.phaseInstances[0] || null;

          setActivePhaseInstance(activePhaseInst);

          // Determine which phase to show (active phase instance or first phase)
          const phaseToShow = activePhaseInst
            ? phases.find(p => p.id === activePhaseInst.phaseId) || null
            : phases[0] || null;

          setActivePhase(phaseToShow);

          // Get workouts for the active phase
          if (phaseToShow?.workoutIds && phaseToShow.workoutIds.length > 0) {
            const workoutPromises = phaseToShow.workoutIds.map(workoutId =>
              fetchJson<{ workout: Workout }>(`/api/train/workouts/${workoutId}`)
                .then(res => res.workout)
                .catch(() => null)
            );
            const fetchedWorkouts = (await Promise.all(workoutPromises)).filter(
              (w): w is Workout => w !== null
            );
            if (!cancelled) {
              setPhaseWorkouts(fetchedWorkouts);
            }
          } else {
            if (!cancelled) {
              setPhaseWorkouts([]);
            }
          }
        } else {
          setActiveProtocol(null);
          setActivePhase(null);
          setActivePhaseInstance(null);
          setPhaseWorkouts([]);
        }
      } catch (error) {
        console.error('Failed to load training data', error);
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

  async function handleStartWorkout(workoutId: string) {
    if (startingWorkoutId || !workoutId) return;
    setStartingWorkoutId(workoutId);
    try {
      // Need to get workoutId from the workout object to use nested route
      const workout = workouts.find(w => w.id === workoutId);
      if (!workout) {
        throw new Error('Workout not found');
      }

      const res = await fetchJson<{ workoutInstance: WorkoutInstance }>(
        `/api/train/workouts/${workoutId}/instances`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: new Date().toISOString().split('T')[0], // Today's date as YYYY-MM-DD
            complete: false,
          }),
        }
      );

      // Verify we got a valid workout instance ID
      if (!res.workoutInstance?.id) {
        console.error('Invalid response from API:', res);
        throw new Error('Failed to create workout instance - no ID returned');
      }

      // Navigate to the session page
      router.push(`/train/session/${res.workoutInstance.id}`);
    } catch (err: any) {
      console.error('Failed to start workout', err);
      alert('Failed to start workout. Please try again.');
      setStartingWorkoutId(null);
    }
  }

  return (
    <div className="bg-background pb-20 min-h-screen">
      <div className="md:mx-auto md:max-w-4xl">
        {/* Header */}
        <section className="flex justify-between items-center px-4 md:px-6 pt-6 pb-4 border-border border-b">
          <div>
            <h1 className="mb-1 font-bold text-2xl">Train</h1>
            <p className="text-muted-foreground text-sm">
              Your training program, sessions, and performance
            </p>
          </div>
        </section>

        {/* Active Program */}
        <section className="px-4 md:px-6 py-6">
          <h2 className="mb-3 font-semibold text-lg">Active Program</h2>
          <div className="bg-card p-4 border border-border rounded-lg">
            {isLoading ? (
              <p className="text-muted-foreground text-xs">Loading...</p>
            ) : activeProtocolInstance && activeProtocol ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-brand-primary" />
                  <div>
                    <h3 className="font-semibold">
                      {activeProtocol.name ?? 'Training Protocol'}
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      Started {formatDate(activeProtocolInstance.startDate)} •{' '}
                      {activeProtocol.phases?.length || 0} phases
                      {activePhase && ` • Phase: ${activePhase.name}`}
                    </p>
                  </div>
                </div>
                {activeProtocol.description && (
                  <p className="mb-3 text-muted-foreground text-sm">
                    {activeProtocol.description}
                  </p>
                )}
                {activeProtocol.objectives?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {activeProtocol.objectives.map((obj) => (
                      <span
                        key={obj}
                        className="bg-muted px-2 py-1 rounded-full text-[11px] text-muted-foreground"
                      >
                        {obj}
                      </span>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="flex justify-between items-center gap-3">
                <div>
                  <p className="font-medium text-sm">No active program</p>
                  <p className="mt-1 text-muted-foreground text-xs">
                    When you start a protocol, it will appear here with your
                    weekly structure.
                  </p>
                </div>
                <Link href="/train/protocols">
                  <Button size="sm" variant="outline">
                    Browse
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Current Phase Workouts */}
        {activeProtocolInstance && activeProtocol && activePhase && phaseWorkouts.length > 0 && (
          <section className="px-4 md:px-6 py-6 border-border border-t">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-semibold text-lg">Current Phase: {activePhase.name}</h2>
                {activePhase.purpose && (
                  <p className="mt-1 text-muted-foreground text-sm">{activePhase.purpose}</p>
                )}
              </div>
            </div>
            <div className="space-y-3">
              {phaseWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="bg-card p-4 border border-border rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="mb-1 font-semibold">
                        {workout.name || `${workout.workoutType} Workout`}
                      </h3>
                      {workout.description && (
                        <p className="mb-1 text-muted-foreground text-xs">
                          {workout.description}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <span className="bg-muted px-2 py-1 rounded text-[11px] text-muted-foreground">
                          {workout.workoutType}
                        </span>
                        {workout.estimatedDuration && (
                          <span className="bg-muted px-2 py-1 rounded text-[11px] text-muted-foreground">
                            ~{workout.estimatedDuration} min
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-evenly gap-4">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => router.push(`/train/workout/${workout.id}`)}
                      className="w-full"
                    >
                      View
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => handleStartWorkout(workout.id)}
                      disabled={startingWorkoutId === workout.id}
                      className="w-full"
                    >
                      {startingWorkoutId === workout.id ? (
                        <>
                          <Loader2 className="mr-1 w-4 h-4 animate-spin" />
                        </>
                      ) : (
                        <>
                          Start
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="px-4 md:px-6 py-6 border-border border-t">
          <Link href="/train/build">
            <Button variant="primary" size="lg" className="w-full">
              Build
            </Button>
          </Link>
        </section>
        
        {/* Upcoming / Recent Sessions */}
        <section className="px-4 md:px-6 py-6 border-border border-t">
          <h2 className="mb-4 font-semibold text-lg">Recent Sessions</h2>
          {recentWorkoutInstances.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              You don&apos;t have any logged sessions yet. Once you complete a
              workout, it will show up here with summary stats.
            </p>
          ) : (
            <div className="space-y-3">
              {recentWorkoutInstances.slice(0, 5).map((instance) => {
                const workout = workoutsById.get(instance.workoutId);
                const name =
                  workout?.name ?? `${workout?.workoutType ?? 'Workout'}`;
                const durationMinutes = timeToMinutes(instance.duration ?? null);

                return (
                  <div
                    key={instance.id}
                    className="flex flex-col gap-4 bg-card p-4 border border-border rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="mb-1 font-semibold">{name}</h3>
                        <p className="text-muted-foreground text-xs">
                          {formatDate(instance.date)} •{' '}
                          {durationMinutes > 0
                            ? formatMinutesAsHours(durationMinutes)
                            : 'No duration logged'}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-[11px] rounded ${instance.complete
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : 'bg-warning/20 text-warning'
                          }`}
                      >
                        {instance.complete ? 'Completed' : 'In progress'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <Link href={`/log/workouts/${instance.id}`} className="w-full">
                        <Button variant="outline" size="md" className="w-full">
                          <Eye className="mr-1 w-4 h-4" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/train/session/${instance.id}`} className="w-full">
                        <Button variant="outline" size="md" className="w-full">
                          <Play className="mr-1 w-4 h-4" />
                          Resume
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}