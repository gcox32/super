'use server';

import { getCurrentUser } from '@/lib/db/auth';
import { 
  getUserWorkoutInstances, 
  getWorkoutBlockExerciseInstancesByExerciseIds,
  getExerciseById
} from '@/lib/db/crud/train';
import { getUserProfile } from '@/lib/db/crud/user';
import { WorkoutInstance, WorkoutBlockExerciseInstance, Exercise } from '@/types/train';

export interface PerformanceData {
  workoutStats: WorkoutInstance[];
  keyExerciseStats: {
    exercise: Exercise;
    instances: WorkoutBlockExerciseInstance[];
  }[];
}

export async function getPerformanceData(): Promise<PerformanceData | { error: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  try {
    const [workoutInstances, userProfile] = await Promise.all([
      getUserWorkoutInstances(user.id),
      getUserProfile(user.id),
    ]);

    // Sort ascending for charts
    const workoutStats = workoutInstances.sort((a, b) => a.date.getTime() - b.date.getTime());

    let keyExerciseStats: PerformanceData['keyExerciseStats'] = [];

    if (userProfile?.keyExercises && userProfile.keyExercises.length > 0) {
      const instances = await getWorkoutBlockExerciseInstancesByExerciseIds(user.id, userProfile.keyExercises);
      
      // Group by exercise ID
      const grouped = new Map<string, WorkoutBlockExerciseInstance[]>();
      instances.forEach(inst => {
        const exId = inst.workoutBlockExercise?.exercise?.id;
        if (exId) {
            if (!grouped.has(exId)) grouped.set(exId, []);
            grouped.get(exId)?.push(inst);
        }
      });

      // Fetch exercise details and format
      keyExerciseStats = await Promise.all(
        Array.from(grouped.entries()).map(async ([exerciseId, insts]) => {
          // We can get the exercise from the first instance's relation, assuming it's populated
          let exercise = insts[0].workoutBlockExercise?.exercise;
          
          if (!exercise) {
              // Fallback fetch if somehow missing
              const fetched = await getExerciseById(exerciseId);
              if (fetched) exercise = fetched;
          }

          if (!exercise) return null;

          return {
            exercise,
            instances: insts.sort((a, b) => a.created_at.getTime() - b.created_at.getTime()) // Ascending
          };
        })
      ).then(results => results.filter((r): r is NonNullable<typeof r> => r !== null));
    }

    return {
      workoutStats,
      keyExerciseStats
    };

  } catch (error) {
    console.error('Error fetching performance data:', error);
    return { error: 'Failed to fetch performance data' };
  }
}

