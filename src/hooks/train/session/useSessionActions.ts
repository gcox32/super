import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { 
  WorkoutInstance, 
  WorkoutBlockInstance, 
  WorkoutBlockExerciseInstance,
  SessionStep,
  Exercise 
} from '@/types/train';
import type { 
  BlockInstancesResponse, 
  BlockExercisesResponse 
} from '@/lib/train/session-types';
import { fetchJson } from '@/lib/train/helpers';
import type { useSessionData } from './useSessionData';
import type { useSessionTimers } from './useSessionTimers';
import type { useSessionInput } from './useSessionInput';

interface UseSessionActionsProps {
  data: ReturnType<typeof useSessionData>;
  timers: ReturnType<typeof useSessionTimers>;
  input: ReturnType<typeof useSessionInput>;
  sessionId: string;
}

export function useSessionActions({ data, timers, input, sessionId }: UseSessionActionsProps) {
  const router = useRouter();
  const [isComplete, setIsComplete] = useState(false);

  // Destructure for easier access
  const {
    workoutInstance,
    blocks,
    exerciseInstances,
    setExerciseInstances,
    steps,
    setSteps,
    currentStepIndex,
    setCurrentStepIndex,
    exercisesMap,
    setExercisesMap,
  } = data;

  const {
    elapsedSeconds,
    timerSoundsEnabled,
    completeAudioRef,
    setIsResting,
    setRestSecondsRemaining,
  } = timers;

  const currentStep = steps[currentStepIndex];

  // --- Helpers ---

  const ensureBlockInstance = async (blockId: string): Promise<string | null> => {
    if (!workoutInstance?.workoutId) return null;
    
    try {
      const block = blocks.find(b => b.id === blockId);
      if (!block) return null;

      const res = await fetchJson<BlockInstancesResponse>(
        `/api/train/workouts/${workoutInstance.workoutId}/blocks/${blockId}/instances?workoutInstanceId=${sessionId}`
      );
      const existing = res.instances.find(bi => bi.workoutBlockId === blockId);
      if (existing) return existing.id;

      const createRes = await fetchJson<{ instance: WorkoutBlockInstance }>(
        `/api/train/workouts/${workoutInstance.workoutId}/blocks/${blockId}/instances`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workoutInstanceId: sessionId,
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
  };

  // --- Actions ---

  const handleEndSession = () => {
    router.push('/train');
  };

  const finishWorkout = async (additionalNotes?: string) => {
    if (!workoutInstance) return;
    try {
      // Play completion sound
      if (timerSoundsEnabled && completeAudioRef.current) {
        try {
          completeAudioRef.current.currentTime = 0;
          void completeAudioRef.current.play();
        } catch {
          // ignore
        }
      }

      const payload: any = {
        complete: true,
        duration: { value: Math.ceil(elapsedSeconds / 60), unit: 'min' },
      };

      if (additionalNotes) {
        const currentNotes = workoutInstance.notes || '';
        payload.notes = currentNotes ? `${currentNotes}\n${additionalNotes}` : additionalNotes;
      }

       await fetchJson(
        `/api/train/workouts/${workoutInstance.workoutId}/instances/${workoutInstance.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      setIsComplete(true);
    } catch (e) {
      console.error('Failed to finish', e);
    }
  };

  const handleRestComplete = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((i) => i + 1);
    } else {
      finishWorkout();
    }
  };

  const saveCurrentStep = async () => {
    if (!currentStep || !workoutInstance) return;

    const blockInstanceId = await ensureBlockInstance(currentStep.block.id);
    if (!blockInstanceId) return;

    const measures: any = {
      ...currentStep.exercise.measures,
    };

    const hasCalories = currentStep.exercise.measures.calories !== undefined;
    const scoringType = currentStep.exercise.scoringType;

    if (input.calories) {
      measures.calories = { value: Number(input.calories), unit: 'cal' };
    }
    
    if (input.time) {
      measures.time = { value: Number(input.time), unit: input.timeUnit };
    }
    
    if (input.distance) {
      measures.distance = { value: Number(input.distance), unit: input.distanceUnit };
    }
    if (input.height) {
      measures.height = { value: Number(input.height), unit: input.heightUnit };
    }
    if (input.pace) {
      measures.pace = { value: Number(input.pace), unit: input.paceUnit };
    }

    const isCardio = scoringType === 'cals' || scoringType === 'dist' || scoringType === 'time' || hasCalories;

    if (!isCardio || scoringType === 'reps' || scoringType === 'load') {
       if (input.reps) measures.reps = Number(input.reps);
    }
    
    if (input.weight) {
       measures.externalLoad = { value: Number(input.weight), unit: input.weightUnit };
    }

    const payload = {
      workoutBlockInstanceId: blockInstanceId,
      workoutBlockExerciseId: currentStep.exercise.id,
      complete: true,
      measures,
      notes: `set:${currentStep.setIndex}:`,
    };

    const blockInsts = exerciseInstances[currentStep.block.id] || [];
    const existing = blockInsts.find(inst => 
      inst.workoutBlockExerciseId === currentStep.exercise.id && 
      inst.notes?.startsWith(`set:${currentStep.setIndex}:`)
    );

    if (!workoutInstance?.workoutId) return;

    try {
      let saved: WorkoutBlockExerciseInstance;
      if (existing) {
        const res = await fetchJson<{ instance: WorkoutBlockExerciseInstance }>(
          `/api/train/workouts/${workoutInstance.workoutId}/blocks/${currentStep.block.id}/exercises/${currentStep.exercise.id}/instances/${existing.id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );
        saved = res.instance;
      } else {
        const res = await fetchJson<{ instance: WorkoutBlockExerciseInstance }>(
          `/api/train/workouts/${workoutInstance.workoutId}/blocks/${currentStep.block.id}/exercises/${currentStep.exercise.id}/instances`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );
        saved = res.instance;
      }

      setExerciseInstances(prev => {
        const list = prev[currentStep.block.id] || [];
        const idx = list.findIndex(i => i.id === saved.id);
        const nextList = idx === -1 ? [...list, saved] : list.map((item, i) => i === idx ? saved : item);
        return { ...prev, [currentStep.block.id]: nextList };
      });
      
    } catch (e) {
      console.error('Failed to save set', e);
    }
  };

  const maybeStartRest = () => {
    if (!currentStep) return false;
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
    handleRestComplete();
  };

  const handleNext = async () => {
    await saveCurrentStep();
    if (maybeStartRest()) return;

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(i => i + 1);
    } else {
      await finishWorkout();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(i => i - 1);
    }
  };

  const handleSaveNote = async (noteText: string) => {
    if (!currentStep || !workoutInstance) return;

    const blockInstanceId = await ensureBlockInstance(currentStep.block.id);
    if (!blockInstanceId) return;

    const blockInsts = exerciseInstances[currentStep.block.id] || [];
    const existing = blockInsts.find(inst => 
      inst.workoutBlockExerciseId === currentStep.exercise.id && 
      inst.notes?.startsWith(`set:${currentStep.setIndex}:`)
    );

    const notesPrefix = `set:${currentStep.setIndex}:`;
    const fullNotes = noteText.trim() 
      ? `${notesPrefix}${noteText.trim()}`
      : notesPrefix;

    if (!workoutInstance?.workoutId) return;

    try {
      let saved: WorkoutBlockExerciseInstance;
      if (existing) {
        const res = await fetchJson<{ instance: WorkoutBlockExerciseInstance }>(
          `/api/train/workouts/${workoutInstance.workoutId}/blocks/${currentStep.block.id}/exercises/${currentStep.exercise.id}/instances/${existing.id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              notes: fullNotes,
            }),
          }
        );
        saved = res.instance;
      } else {
        const res = await fetchJson<{ instance: WorkoutBlockExerciseInstance }>(
          `/api/train/workouts/${workoutInstance.workoutId}/blocks/${currentStep.block.id}/exercises/${currentStep.exercise.id}/instances`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workoutBlockInstanceId: blockInstanceId,
              workoutBlockExerciseId: currentStep.exercise.id,
              complete: false,
              notes: fullNotes,
            }),
          }
        );
        saved = res.instance;
      }

      setExerciseInstances(prev => {
        const list = prev[currentStep.block.id] || [];
        const idx = list.findIndex(i => i.id === saved.id);
        const nextList = idx === -1 ? [...list, saved] : list.map((item, i) => i === idx ? saved : item);
        return { ...prev, [currentStep.block.id]: nextList };
      });
    } catch (e) {
      console.error('Failed to save note', e);
      throw e;
    }
  };

  const getCurrentNote = (): string => {
    if (!currentStep) return '';
    const blockInsts = exerciseInstances[currentStep.block.id] || [];
    const existing = blockInsts.find(inst => 
      inst.workoutBlockExerciseId === currentStep.exercise.id && 
      inst.notes?.startsWith(`set:${currentStep.setIndex}:`)
    );
    if (!existing?.notes) return '';
    const prefix = `set:${currentStep.setIndex}:`;
    return existing.notes.startsWith(prefix) 
      ? existing.notes.slice(prefix.length).trim()
      : existing.notes.trim();
  };

  const handleSwapExercise = async (newExercise: Exercise) => {
    if (!currentStep || !workoutInstance?.workoutId) return;

    try {
      await fetchJson(
        `/api/train/workouts/${workoutInstance.workoutId}/blocks/${currentStep.block.id}/exercises/${currentStep.exercise.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exerciseId: newExercise.id,
          }),
        }
      );

      const exRes = await fetchJson<BlockExercisesResponse>(
        `/api/train/workouts/${workoutInstance.workoutId}/blocks/${currentStep.block.id}/exercises`
      );
      
      setExercisesMap(prev => ({
        ...prev,
        [currentStep.block.id]: exRes.exercises || [],
      }));

      const updatedExercises = exRes.exercises || [];
      const currentBlock = blocks.find(b => b.id === currentStep.block.id);
      if (!currentBlock) return;

      const otherBlockSteps = steps.filter(s => s.block.id !== currentStep.block.id);
      const newBlockSteps: SessionStep[] = [];

      if (currentBlock.circuit) {
        const maxSets = Math.max(...updatedExercises.map(ex => ex.sets || 1), 1);
        for (let setIndex = 0; setIndex < maxSets; setIndex++) {
          updatedExercises.forEach(ex => {
            const totalSets = ex.sets || 1;
            if (setIndex < totalSets) {
              newBlockSteps.push({
                uniqueId: `${currentBlock.id}-${ex.id}-${setIndex}`,
                block: currentBlock,
                exercise: ex,
                setIndex,
                totalSets,
              });
            }
          });
        }
      } else {
        updatedExercises.forEach(ex => {
          const setCheck = ex.sets || 1;
          for (let i = 0; i < setCheck; i++) {
            newBlockSteps.push({
              uniqueId: `${currentBlock.id}-${ex.id}-${i}`,
              block: currentBlock,
              exercise: ex,
              setIndex: i,
              totalSets: setCheck,
            });
          }
        });
      }

      const allSteps = [...otherBlockSteps, ...newBlockSteps].sort((a, b) => {
        const blockOrderA = blocks.findIndex(bl => bl.id === a.block.id);
        const blockOrderB = blocks.findIndex(bl => bl.id === b.block.id);
        if (blockOrderA !== blockOrderB) return blockOrderA - blockOrderB;
        
        const exOrderA = updatedExercises.findIndex(ex => ex.id === a.exercise.id);
        const exOrderB = updatedExercises.findIndex(ex => ex.id === b.exercise.id);
        if (exOrderA !== exOrderB) return exOrderA - exOrderB;
        
        return a.setIndex - b.setIndex;
      });

      setSteps(allSteps);

      const oldExerciseOrder = exercisesMap[currentStep.block.id]?.findIndex(ex => ex.id === currentStep.exercise.id) ?? -1;
      const newExerciseAtSameOrder = updatedExercises[oldExerciseOrder];
      
      let newStepIndex = 0;
      if (newExerciseAtSameOrder) {
        const matchingStep = allSteps.findIndex(s => 
          s.block.id === currentStep.block.id &&
          s.exercise.id === newExerciseAtSameOrder.id &&
          s.setIndex === currentStep.setIndex
        );
        if (matchingStep !== -1) {
          newStepIndex = matchingStep;
        } else {
          const firstStepOfNewExercise = allSteps.findIndex(s => 
            s.block.id === currentStep.block.id &&
            s.exercise.id === newExerciseAtSameOrder.id
          );
          if (firstStepOfNewExercise !== -1) {
            newStepIndex = firstStepOfNewExercise;
          }
        }
      } else {
        for (let i = 0; i < allSteps.length; i++) {
          const s = allSteps[i];
          const blockInsts = exerciseInstances[s.block.id] || [];
          const match = blockInsts.find(inst => 
            inst.workoutBlockExerciseId === s.exercise.id && 
            inst.notes?.startsWith(`set:${s.setIndex}:`)
          );
          if (!match || !match.complete) {
            newStepIndex = i;
            break;
          }
        }
      }

      setCurrentStepIndex(newStepIndex);
    } catch (e) {
      console.error('Failed to swap exercise', e);
      throw e;
    }
  };

  return {
    isComplete,
    handleEndSession,
    finishWorkout,
    handleRestComplete,
    saveCurrentStep,
    endRestAndAdvance,
    handleNext,
    handlePrevious,
    handleSaveNote,
    getCurrentNote,
    handleSwapExercise,
  };
}

