'use client';

import { useEffect, useState, use, useRef } from 'react';
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
import type { TimeMeasurement } from '@/types/measures';

import { SessionHeader } from '@/components/train/session/SessionHeader';
import { SessionProgressBar } from '@/components/train/session/SessionProgressBar';
import { SessionExerciseDisplay } from '@/components/train/session/SessionExerciseDisplay';
import { SessionInputControls } from '@/components/train/session/SessionInputControls';
import { SessionFooter } from '@/components/train/session/SessionFooter';
import { SessionMenu } from '@/components/train/session/SessionMenu';

// --- Types ---
// (SessionStep is now in src/types/train.ts)

type WorkoutInstanceResponse = { workoutInstance: WorkoutInstance };
type BlockInstancesResponse = { instances: WorkoutBlockInstance[] };
type BlocksResponse = { blocks: WorkoutBlock[] };
type BlockExercisesResponse = { exercises: WorkoutBlockExercise[] };
type BlockExerciseInstancesResponse = {
  instances: WorkoutBlockExerciseInstance[];
};

// --- Helpers ---

function timeToSeconds(duration?: TimeMeasurement | null): number {
  if (!duration) return 0;
  const { value, unit } = duration;
  if (unit === 's') return value;
  if (unit === 'min') return value * 60;
  if (unit === 'hr') return value * 3600;
  return 0;
}

function formatClock(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

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

// --- Main Page ---

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
  // We keep these for lookup, though flattened steps are main driver
  const [blockExercises, setBlockExercises] = useState<Record<string, WorkoutBlockExercise[]>>({});
  const [exerciseInstances, setExerciseInstances] = useState<Record<string, WorkoutBlockExerciseInstance[]>>({});

  // Execution State
  const [steps, setSteps] = useState<SessionStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Input State for Current Step
  const [reps, setReps] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [inputDirty, setInputDirty] = useState(false);

  // Swipe State
  const touchStartY = useRef<number | null>(null);

  // Derived
  const currentStep = steps[currentStepIndex];
  const nextStep = steps[currentStepIndex + 1];

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
        setBlockExercises(exercisesMap);
        setExerciseInstances(instancesMap);
        
        // 4. Build Steps (Flattened Workout)
        const builtSteps: SessionStep[] = [];
        (blocksRes.blocks || []).forEach(block => {
          const exercises = exercisesMap[block.id] || [];
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

  // Sync Input with Current Step's Data (if exists)
  useEffect(() => {
    if (!currentStep) return;
    
    // Reset inputs
    setReps(currentStep.exercise.measures.reps?.toString() || '');
    setWeight(currentStep.exercise.measures.externalLoad?.value?.toString() || '');
    
    // Check for existing instance data to override
    const blockInsts = exerciseInstances[currentStep.block.id] || [];
    const match = blockInsts.find(inst => 
      inst.workoutBlockExerciseId === currentStep.exercise.id && 
      inst.notes?.startsWith(`set:${currentStep.setIndex}:`)
    );
    
    if (match) {
      if (match.measures.reps) setReps(match.measures.reps.toString());
      if (match.measures.externalLoad?.value) setWeight(match.measures.externalLoad.value.toString());
    }
    
    setInputDirty(false);
  }, [currentStepIndex, exerciseInstances, currentStep]);

  // Actions
  async function saveCurrentStep() {
    if (!currentStep || !workoutInstance) return;

    const blockInstanceId = await ensureBlockInstance(currentStep.block.id);
    if (!blockInstanceId) return;

    const payload = {
      workoutBlockInstanceId: blockInstanceId,
      workoutBlockExerciseId: currentStep.exercise.id,
      date: new Date().toISOString(),
      complete: true,
      measures: {
        ...currentStep.exercise.measures,
        reps: reps ? Number(reps) : undefined,
        externalLoad: weight ? { value: Number(weight), unit: 'kg' } : undefined, // Assuming kg default
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

  const handleNext = async () => {
    await saveCurrentStep();
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

  // Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartY.current - touchEndY;
    
    // Threshold for swipe (e.g., 50px)
    if (Math.abs(diffY) > 50) {
      if (diffY > 0) {
        // Swipe Up -> Next
        handleNext();
      } else {
        // Swipe Down -> Previous
        handlePrevious();
      }
    }
    
    touchStartY.current = null;
  };

  const finishWorkout = async () => {
    if (!workoutInstance) return;
    try {
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
      <div className="h-screen w-full bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (error || !currentStep) {
    return (
      <div className="h-screen w-full bg-black text-white p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error || "Workout completed or invalid."}</p>
        <Button onClick={() => router.push('/train')}>Back to Train</Button>
      </div>
    );
  }

  return (
    <div 
      className="relative h-screen w-full bg-black text-white overflow-hidden flex flex-col font-sans"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      
      {/* Background Video/Image */}
      <div className="absolute inset-0 z-0 opacity-40">
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
          <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
            {/* Fallback pattern or image */}
            <div className="bg-linear-to-br from-zinc-800 to-black w-full h-full" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-transparent to-black/90" />
      </div>

      {/* Main Content Layer */}
      <div className="relative z-10 flex flex-col h-full px-5 py-4 safe-area-inset-top">
        
        <SessionHeader 
          elapsedSeconds={elapsedSeconds}
          isPaused={isPaused}
          onPauseToggle={() => setIsPaused(!isPaused)}
          formatClock={formatClock}
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

        <SessionInputControls 
          step={currentStep}
          reps={reps}
          onRepsChange={(val) => { setReps(val); setInputDirty(true); }}
          weight={weight}
          onWeightChange={(val) => { setWeight(val); setInputDirty(true); }}
        />

        <SessionFooter 
          nextStepName={nextStep ? nextStep.exercise.exercise.name : null}
          onNext={handleNext}
        />

      </div>

      <SessionMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSkip={handleNext}
      />
    </div>
  );
}
