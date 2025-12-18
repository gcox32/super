import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import {
  updateWorkoutBlockExerciseInstance,
  deleteWorkoutBlockExerciseInstance,
} from '@/lib/db/crud';
import type { WorkoutBlockExerciseInstance } from '@/types/train';
import { calculateProjected1RMFromMeasures } from '@/lib/log/train/projected-max';

// PATCH /api/train/workouts/[workoutId]/blocks/[blockId]/exercises/[exerciseId]/instances/[id] - Update an exercise instance
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string; blockId: string; exerciseId: string; id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const updates = await parseBody<
      Partial<
        Omit<
          WorkoutBlockExerciseInstance,
          'id' | 'userId' | 'workoutBlockInstanceId' | 'workoutBlockExerciseId' | 'date'
        >
      >
    >(request);

    // If measures are being updated, recalculate projected 1RM
    if (updates.measures) {
      const projected1RM = calculateProjected1RMFromMeasures(updates.measures);
      if (projected1RM) {
        updates.projected1RM = projected1RM;
      } else {
        // If we can't calculate (missing reps/weight), clear the projected1RM
        // Use null to explicitly clear the value in the database
        updates.projected1RM = null as any;
      }
    }

    const updated = await updateWorkoutBlockExerciseInstance(id, userId, updates);
    if (!updated) {
      return { error: 'Workout block exercise instance not found' };
    }
    return { instance: updated };
  });
}

// DELETE /api/train/workouts/[workoutId]/blocks/[blockId]/exercises/[exerciseId]/instances/[id] - Delete an exercise instance
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string; blockId: string; exerciseId: string; id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const deleted = await deleteWorkoutBlockExerciseInstance(id, userId);
    if (!deleted) {
      return { error: 'Workout block exercise instance not found' };
    }
    return { success: true };
  });
}


