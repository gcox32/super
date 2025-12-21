import { useState, useEffect } from 'react';
import type {
  WorkoutInstance,
  WorkoutBlockInstance,
  WorkoutBlock,
  WorkoutBlockExercise,
  WorkoutBlockExerciseInstance,
  SessionStep,
} from '@/types/train';
import { fetchJson } from '@/lib/train/helpers';
import type {
  WorkoutInstanceResponse,
  BlockInstancesResponse,
  BlocksResponse,
  BlockExercisesResponse,
  BlockExerciseInstancesResponse,
} from '@/lib/train/session-types';

export function useSessionData(id: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workoutInstance, setWorkoutInstance] = useState<WorkoutInstance | null>(null);
  const [blocks, setBlocks] = useState<WorkoutBlock[]>([]);
  const [exercisesMap, setExercisesMap] = useState<Record<string, WorkoutBlockExercise[]>>({});
  const [exerciseInstances, setExerciseInstances] = useState<Record<string, WorkoutBlockExerciseInstance[]>>({});
  
  const [steps, setSteps] = useState<SessionStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        // 1. Get Instance using direct lookup route
        const wi = await fetchJson<WorkoutInstanceResponse>(`/api/train/workouts/instances/${id}`);
        if (cancelled) return;
        if (!wi.workoutInstance?.workoutId) {
          throw new Error('Workout instance missing workoutId');
        }
        setWorkoutInstance(wi.workoutInstance);

        // 2. Get Blocks & Block Instances
        const blocksRes = await fetchJson<BlocksResponse>(
          `/api/train/workouts/${wi.workoutInstance.workoutId}/blocks`
        );
        
        // Get block instances for each block
        const blockInstancesPromises = blocksRes.blocks.map(block =>
          fetchJson<BlockInstancesResponse>(
            `/api/train/workouts/${wi.workoutInstance.workoutId}/blocks/${block.id}/instances?workoutInstanceId=${id}`
          ).then(res => ({ blockId: block.id, instances: res.instances }))
        );
        const blockInstancesResults = await Promise.all(blockInstancesPromises);
        const biRes = { instances: blockInstancesResults.flatMap(r => r.instances) };

        if (cancelled) return;
        setBlocks(blocksRes.blocks || []);

        // 3. Get Exercises & Existing Logs
        const exercisesMapData: Record<string, WorkoutBlockExercise[]> = {};
        const instancesMap: Record<string, WorkoutBlockExerciseInstance[]> = {};

        for (const block of blocksRes.blocks || []) {
          const exRes = await fetchJson<BlockExercisesResponse>(
            `/api/train/workouts/${wi.workoutInstance.workoutId}/blocks/${block.id}/exercises`
          );
          exercisesMapData[block.id] = exRes.exercises || [];

          const blockInstance = biRes.instances.find(bi => bi.workoutBlockId === block.id);
          if (blockInstance) {
            // Get exercise instances for each exercise in the block
            const exerciseInstancesPromises = exRes.exercises.map(exercise =>
              fetchJson<BlockExerciseInstancesResponse>(
                `/api/train/workouts/${wi.workoutInstance.workoutId}/blocks/${block.id}/exercises/${exercise.id}/instances?workoutBlockInstanceId=${blockInstance.id}`
              ).then(res => res.instances || [])
            );
            const allExerciseInstances = (await Promise.all(exerciseInstancesPromises)).flat();
            instancesMap[block.id] = allExerciseInstances;
          } else {
            instancesMap[block.id] = [];
          }
        }

        if (cancelled) return;
        setExercisesMap(exercisesMapData);
        setExerciseInstances(instancesMap);
        
        // 4. Build Steps (Flattened Workout)
        const builtSteps: SessionStep[] = [];
        (blocksRes.blocks || []).forEach(block => {
          const exercises = exercisesMapData[block.id] || [];
          
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
                    totalSets
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

  return {
    loading,
    error,
    workoutInstance,
    setWorkoutInstance,
    blocks,
    exercisesMap,
    setExercisesMap,
    exerciseInstances,
    setExerciseInstances,
    steps,
    setSteps,
    currentStepIndex,
    setCurrentStepIndex,
  };
}

