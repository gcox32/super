'use client';

import { useEffect, useState, use, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';

import type {
  WorkoutInstance,
  WorkoutBlockInstance,
  WorkoutBlock,
  WorkoutBlockExercise,
  WorkoutBlockExerciseInstance,
  SessionStep,
} from '@/types/train';
import { formatClock } from '@/lib/train/helpers';

import { RestTimerDisplay } from '@/components/train/session/RestTimerDisplay';
import { SessionHeader } from '@/components/train/session/SessionHeader';
import { SessionProgressBar } from '@/components/train/session/SessionProgressBar';
import { SessionExerciseDisplay } from '@/components/train/session/SessionExerciseDisplay';
import { SessionInputControls } from '@/components/train/session/SessionInputControls';
import { SessionFooter } from '@/components/train/session/SessionFooter';
import { SessionMenu } from '@/components/train/session/overlays/SessionMenu';
import { PauseOverlay } from '@/components/train/session/overlays/PauseOverlay';
import { SettingsOverlay } from '@/components/train/session/overlays/SettingsOverlay';
import { WorkoutSummaryOverlay } from '@/components/train/session/overlays/WorkoutSummaryOverlay';


type WorkoutInstanceResponse = { workoutInstance: WorkoutInstance };
type BlockInstancesResponse = { instances: WorkoutBlockInstance[] };
type BlocksResponse = { blocks: WorkoutBlock[] };
type BlockExercisesResponse = { exercises: WorkoutBlockExercise[] };
type BlockExerciseInstancesResponse = {
  instances: WorkoutBlockExerciseInstance[];
};

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

export default function ActiveSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  
  // Data State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workoutInstance, setWorkoutInstance] = useState<WorkoutInstance | null>(null);
  const [blocks, setBlocks] = useState<WorkoutBlock[]>([]);
  const [exerciseInstances, setExerciseInstances] = useState<Record<string, WorkoutBlockExerciseInstance[]>>({});

  // Execution State
  const [steps, setSteps] = useState<SessionStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [restSecondsRemaining, setRestSecondsRemaining] = useState(0);
  const [timerSoundsEnabled, setTimerSoundsEnabled] = useState(true);
  
  // Input State for Current Step
  const [reps, setReps] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('lbs');

  // Swipe State
  const touchStartY = useRef<number | null>(null);

  // Audio refs
  const countdownAudioRef = useRef<HTMLAudioElement | null>(null);
  const completeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Derived
  const currentStep = steps[currentStepIndex];
  const nextStep = steps[currentStepIndex + 1];

  const totalVolume = useMemo(() => {
    let total = 0;
    Object.values(exerciseInstances).forEach((instances) => {
      instances.forEach((inst) => {
        const r = inst.measures.reps ?? 0;
        const l = inst.measures.externalLoad?.value ?? 0;
        total += r * l;
      });
    });
    return total;
  }, [exerciseInstances]);

  // Load timer-sound preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem('super.timerSoundsEnabled');
      if (stored !== null) {
        setTimerSoundsEnabled(stored === 'true');
      }
    } catch {
      // ignore
    }
  }, []);

  // Load Data
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        // 1. Get Instance
        const wi = await fetchJson<WorkoutInstanceResponse>(`/api/train/workout-instances/${id}`);
        if (cancelled) return;
        setWorkoutInstance(wi.workoutInstance);

        // 2. Get Blocks & Block Instances
        const [biRes, blocksRes] = await Promise.all([
          fetchJson<BlockInstancesResponse>(
            `/api/train/workout-block-instances?workoutInstanceId=${id}`
          ),
          wi.workoutInstance?.workoutId
            ? fetchJson<BlocksResponse>(
                `/api/train/workouts/${wi.workoutInstance.workoutId}/blocks`
              )
            : Promise.resolve({ blocks: [] }),
        ]);

        if (cancelled) return;
        setBlocks(blocksRes.blocks || []);

        // 3. Get Exercises & Existing Logs
        const exercisesMap: Record<string, WorkoutBlockExercise[]> = {};
        const instancesMap: Record<string, WorkoutBlockExerciseInstance[]> = {};

        for (const block of blocksRes.blocks || []) {
          const exRes = await fetchJson<BlockExercisesResponse>(
            `/api/train/workouts/${wi.workoutInstance.workoutId}/blocks/${block.id}/exercises`
          );
          exercisesMap[block.id] = exRes.exercises || [];

          const blockInstance = biRes.instances.find(bi => bi.workoutBlockId === block.id);
          if (blockInstance) {
            const instRes = await fetchJson<BlockExerciseInstancesResponse>(
                `/api/train/workout-block-exercise-instances?workoutBlockInstanceId=${blockInstance.id}`
              );
            instancesMap[block.id] = instRes.instances || [];
          } else {
            instancesMap[block.id] = [];
          }
        }

        if (cancelled) return;
        setExerciseInstances(instancesMap);
        
        // 4. Build Steps (Flattened Workout)
        const builtSteps: SessionStep[] = [];
        (blocksRes.blocks || []).forEach(block => {
          const exercises = exercisesMap[block.id] || [];
          
          if (block.circuit) {
            // Circuit mode: cycle through exercises (set 1 of all exercises, then set 2 of all exercises, etc.)
            const maxSets = Math.max(...exercises.map(ex => ex.sets || 1), 1);
            for (let setIndex = 0; setIndex < maxSets; setIndex++) {
              exercises.forEach(ex => {
                const totalSets = ex.sets || 1;
                // Only add step if this exercise has a set at this index
                if (setIndex < totalSets) {
                  builtSteps.push({
                    uniqueId: `${block.id}-${ex.id}-${setIndex}`,
                    block,
                    exercise: ex,
                    setIndex,
                    totalSets,
                  });
                }
              });
            }
          } else {
            // Straight sets mode: all sets of exercise 1, then all sets of exercise 2, etc.
            exercises.forEach(ex => {
              const setCheck = ex.sets || 1;
              for (let i = 0; i < setCheck; i++) {
                builtSteps.push({
                  uniqueId: `${block.id}-${ex.id}-${i}`,
                  block,
                  exercise: ex,
                  setIndex: i,
                  totalSets: setCheck,
                });
              }
            });
          }
        });
        setSteps(builtSteps);

        // 5. Determine Current Step (Resume)
        let firstIncomplete = 0;
        for (let i = 0; i < builtSteps.length; i++) {
          const s = builtSteps[i];
          const blockInsts = instancesMap[s.block.id] || [];
          const match = blockInsts.find(inst => 
            inst.workoutBlockExerciseId === s.exercise.id && 
            inst.notes?.startsWith(`set:${s.setIndex}:`)
          );
          if (!match || !match.complete) {
            firstIncomplete = i;
            break;
          }
        }
        setCurrentStepIndex(firstIncomplete);
        
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  // Timer
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Rest Timer
  useEffect(() => {
    if (!isResting || isPaused) return;
    if (restSecondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setRestSecondsRemaining((s) => {
        if (s <= 1) {
          clearInterval(interval);
          // Automatically advance when rest completes
          if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex((i) => i + 1);
          } else {
            finishWorkout();
          }
          setIsResting(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isResting, isPaused, restSecondsRemaining, currentStepIndex, steps.length, workoutInstance]);

  // Rest countdown audio (final 3 seconds)
  useEffect(() => {
    if (!isResting || isPaused) return;
    if (!timerSoundsEnabled) return;
    if (!countdownAudioRef.current) return;
    if (restSecondsRemaining !== 3) return;

    try {
      const audio = countdownAudioRef.current;
      audio.currentTime = 0;
      void audio.play();
    } catch {
      // ignore playback errors
    }
  }, [isResting, isPaused, restSecondsRemaining, timerSoundsEnabled]);

  // Sync Input with Current Step's Data (if exists)
  useEffect(() => {
    if (!currentStep) return;
    
    // Reset inputs
    setReps(currentStep.exercise.measures.reps?.toString() || '');
    setWeight(currentStep.exercise.measures.externalLoad?.value?.toString() || '');
    setWeightUnit(currentStep.exercise.measures.externalLoad?.unit || 'kg');
    
    // Check for existing instance data to override
    const blockInsts = exerciseInstances[currentStep.block.id] || [];
    const match = blockInsts.find(inst => 
      inst.workoutBlockExerciseId === currentStep.exercise.id && 
      inst.notes?.startsWith(`set:${currentStep.setIndex}:`)
    );
    
    if (match) {
      if (match.measures.reps) setReps(match.measures.reps.toString());
      if (match.measures.externalLoad?.value) {
        setWeight(match.measures.externalLoad.value.toString());
      }
      if (match.measures.externalLoad?.unit) {
        setWeightUnit(match.measures.externalLoad.unit);
      }
    }
    
  }, [currentStepIndex, exerciseInstances, currentStep]);

  // Actions
  async function saveCurrentStep() {
    if (!currentStep || !workoutInstance) return;

    const blockInstanceId = await ensureBlockInstance(currentStep.block.id);
    if (!blockInstanceId) return;

    const payload = {
      workoutBlockInstanceId: blockInstanceId,
      workoutBlockExerciseId: currentStep.exercise.id,
      complete: true,
      measures: {
        ...currentStep.exercise.measures,
        reps: reps ? Number(reps) : undefined,
        externalLoad: weight
          ? { value: Number(weight), unit: weightUnit }
          : undefined,
      },
      notes: `set:${currentStep.setIndex}:`,
    };

    // Check if update or create
    const blockInsts = exerciseInstances[currentStep.block.id] || [];
    const existing = blockInsts.find(inst => 
      inst.workoutBlockExerciseId === currentStep.exercise.id && 
      inst.notes?.startsWith(`set:${currentStep.setIndex}:`)
    );

    try {
      let saved: WorkoutBlockExerciseInstance;
      if (existing) {
        const res = await fetchJson<{ instance: WorkoutBlockExerciseInstance }>(
          `/api/train/workout-block-exercise-instances/${existing.id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );
        saved = res.instance;
      } else {
        const res = await fetchJson<{ instance: WorkoutBlockExerciseInstance }>(
          `/api/train/workout-block-exercise-instances`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );
        saved = res.instance;
      }

      // Update local state
      setExerciseInstances(prev => {
        const list = prev[currentStep.block.id] || [];
        const idx = list.findIndex(i => i.id === saved.id);
        const nextList = idx === -1 ? [...list, saved] : list.map((item, i) => i === idx ? saved : item);
        return { ...prev, [currentStep.block.id]: nextList };
      });
      
    } catch (e) {
      console.error('Failed to save set', e);
    }
  }

  async function ensureBlockInstance(blockId: string): Promise<string | null> {
    try {
      const res = await fetchJson<BlockInstancesResponse>(
        `/api/train/workout-block-instances?workoutInstanceId=${id}`
      );
      const existing = res.instances.find(bi => bi.workoutBlockId === blockId);
      if (existing) return existing.id;

      // Create
      const createRes = await fetchJson<{ instance: WorkoutBlockInstance }>(
        '/api/train/workout-block-instances',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workoutInstanceId: id,
            workoutBlockId: blockId,
            date: new Date().toISOString(),
          })
        }
      );
      return createRes.instance.id;
    } catch (e) {
      console.error('Failed to ensure block instance', e);
      return null;
    }
  }

  const maybeStartRest = () => {
    if (!currentStep) return false;
    // If this is the final set of the final exercise, do not start a rest timer
    if (currentStepIndex >= steps.length - 1) return false;

    const rest = currentStep.exercise.restTime;
    if (!rest || rest <= 0) return false;
    setIsResting(true);
    setRestSecondsRemaining(rest);
    return true;
  };

  const endRestAndAdvance = () => {
    setIsResting(false);
    setRestSecondsRemaining(0);
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((i) => i + 1);
    } else {
      finishWorkout();
    }
  };

  const handleNext = async () => {
    await saveCurrentStep();
    // If this step has a rest interval, start rest instead of immediately advancing
    if (maybeStartRest()) return;

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(i => i + 1);
    } else {
      // Finish Workout
      await finishWorkout();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(i => i - 1);
    }
  };

  const handleEndSession = () => {
    router.push('/train');
  };

  // Swipe Handlers
  // Removed touch swipe handlers in favor of explicit back button

  const finishWorkout = async () => {
    if (!workoutInstance) return;
    try {
      // Play completion sound before marking complete / navigating
      if (timerSoundsEnabled && completeAudioRef.current) {
        try {
          completeAudioRef.current.currentTime = 0;
          void completeAudioRef.current.play();
        } catch {
          // ignore
        }
      }
       await fetchJson(
        `/api/train/workout-instances/${workoutInstance.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            complete: true,
            duration: { value: Math.ceil(elapsedSeconds / 60), unit: 'min' },
          }),
        }
      );
      router.push('/train');
    } catch (e) {
      console.error('Failed to finish', e);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center bg-black w-full h-screen text-white">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
      </div>
    );
  }

  if (error || !currentStep) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 bg-black p-6 w-full h-screen text-white">
        <p className="text-red-500">{error || "Workout completed or invalid."}</p>
        <Button onClick={() => router.push('/train')}>Back to Train</Button>
      </div>
    );
  }

  return (
    <div 
      className="relative flex flex-col bg-black w-full h-dvh overflow-hidden overscroll-none font-sans text-white touch-none"
    >
      
      {/* Background Video/Image */}
      <div className="z-0 absolute inset-0 opacity-40">
        {currentStep.exercise.exercise.videoUrl ? (
          <video 
            src={currentStep.exercise.exercise.videoUrl} 
            className="w-full h-full object-cover"
            autoPlay 
            loop 
            muted 
            playsInline
          />
        ) : (
          <div className="flex justify-center items-center bg-zinc-900 w-full h-full">
            {/* Fallback pattern or image */}
            <div className="bg-linear-to-br from-zinc-800 to-black w-full h-full" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-transparent to-black/90" />
                </div>

      {/* Main Content Layer */}
      <div className="z-10 relative safe-area-inset-top flex flex-col px-5 py-4 h-full">
        
        <SessionHeader 
          elapsedSeconds={elapsedSeconds}
          onPauseToggle={() => setIsPaused(!isPaused)}
          formatClock={formatClock}
          onSettingsClick={() => setIsSettingsOpen(true)}
          onOverviewClick={() => setIsSummaryOpen(true)}
        />

        <SessionProgressBar 
          blocks={blocks} 
          steps={steps}
          currentStepIndex={currentStepIndex}
          currentBlockId={currentStep.block.id}
        />

        <SessionExerciseDisplay 
          step={currentStep}
          onMenuOpen={() => setIsMenuOpen(true)}
        />

        {/* Spacer to push content down */}
        <div className="flex-1" />

        {!isResting && (
          <>
            <SessionInputControls 
              step={currentStep}
              reps={reps}
              onRepsChange={(val) => { setReps(val); }}
              weight={weight}
              onWeightChange={(val) => { setWeight(val); }}
              weightUnit={weightUnit}
              onWeightUnitChange={(unit) => { setWeightUnit(unit); }}
            />

            <SessionFooter 
              nextStepName={nextStep ? nextStep.exercise.exercise.name : null}
              onNext={handleNext}
              onPrevious={handlePrevious}
              canGoBack={currentStepIndex > 0}
            />
          </>
        )}

        {isResting && (
          <RestTimerDisplay 
            restSecondsRemaining={restSecondsRemaining} 
            currentStep={currentStep} 
            endRestAndAdvance={endRestAndAdvance} 
          />
        )}

      </div>

      <SessionMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSkip={handleNext}
      />

      <PauseOverlay 
        isOpen={isPaused} 
        onResume={() => setIsPaused(false)} 
        onEndSession={handleEndSession} 
      />

      <SettingsOverlay 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        timerSoundsEnabled={timerSoundsEnabled}
        onTimerSoundsChange={(value) => {
          setTimerSoundsEnabled(value);
          if (typeof window !== 'undefined') {
            try {
              window.localStorage.setItem('super.timerSoundsEnabled', value ? 'true' : 'false');
            } catch {
              // ignore
            }
          }
        }}
      />

      <WorkoutSummaryOverlay 
        isOpen={isSummaryOpen} 
        onClose={() => setIsSummaryOpen(false)} 
        workoutInstance={workoutInstance}
        totalVolume={totalVolume}
        durationSeconds={elapsedSeconds}
      />

      {/* Timer sounds */}
      <audio
        ref={countdownAudioRef}
        src="/sounds/timer-countdown.mp3"
        preload="auto"
      />
      <audio
        ref={completeAudioRef}
        src="/sounds/timer-complete.mp3"
        preload="auto"
      />
    </div>
  );
}
